
// If you use this as a template, update the copyright with your own name.

// Sample Node-RED node file


module.exports = function(RED) {
    "use strict";
    // require any external libraries we may need....
    //var foo = require("foo-library");
    // Statics go here.
    var seneca = require('seneca');
    
    // The main node definition - most things happen in here
    function SenecaNode(config) {
        // Create a RED node
        RED.nodes.createNode(this,config);

        // copy "this" object in case we need it in context of callbacks of other functions.
        var node = this;

        this.status({fill:"red",shape:"ring",text:"disconnected"});

        // Store local copies of the node configuration (as defined in the .html)
        // this.topic = config.topic;
        // Retrieve the config node
        this.connection = RED.nodes.getNode(config.connection);
        if (this.connection) {
            try {
                // Create the seneca instance here and then attach a client.
                this.connectionObject = this.connection.connection;
                this.connectionObject = JSON.parse(this.connectionObject);
                console.error("connection is ", this.connectionObject);
                console.error("type of connectionObject is ", typeof(this.connectionObject));
                this.senecaInstance = seneca();
                this.client = this.senecaInstance.client(this.connectionObject);
                this.senecaInstance.ready(function() {
                    node.on('input', function (msg) {
                        // msg.payload contains the command object.
                        // in this example just send it straight on... should process it here really
                        this.status({fill:"blue",shape:"dot",text:"processing"});
                        console.error("connection type = ", this.connectionObject);
                        this.client.act(msg.payload, function(err, result) {
                            if (err) {
                                node.error(err);
                                node.status({fill:"green",shape:"dot",text:"connected"});
                                node.send(err);
                            } else {
                                msg.payload.result = result;
                                node.send(msg);
                                node.status({fill:"green",shape:"dot",text:"connected"});
                            }
                        });
                    });
            
                    node.on("close", function() {
                        // Called when the node is shutdown - eg on redeploy.
                        // Allows ports to be closed, connections dropped etc.
                        // eg: node.client.disconnect();
                        this.senecaInstance.close(function(err) {
                            node.error(err); 
                        });                    
                    });
                    
                    // node.on("node-status", function() {
                    // })
    
                    node.status({fill:"green",shape:"dot",text:"connected"});
                });
            } catch (e) {
                node.error(["Exception in seneca node", e].join(' '));
                console.error(e);
                this.status({file: "red", shape: "dot", text: "ERR: see debug panel"});
            }
        } else {
            this.status({fill:"red",shape:"dot",text:"ERR: No Config Found"});
        }

    }

    // Register the node by name. This must be called before overriding any of the
    // Node functions.
    RED.nodes.registerType("seneca",SenecaNode);
    
    
    // Register the configuration node
    function SenecaConfigNode(n) {
        RED.nodes.createNode(this,n);
        this.connection = n.connection;
        this.name = n.name;
        // console.error("Config in confignode is ", n);
    }
    RED.nodes.registerType("seneca_config",SenecaConfigNode);


};
