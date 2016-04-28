// If you use this as a template, update the copyright with your own name.

// Sample Node-RED node file


module.exports = function(RED) {
        "use strict";
        // require any external libraries we may need....
        //var foo = require("foo-library");
        // Statics go here.
        // var session = require('client-sessions');
        var jwt = require('jsonwebtoken');

        // The main node definition - most things happen in here
        function JsonWebToken(config) {
            // Create a RED node
            RED.nodes.createNode(this, config);

            // copy "this" object in case we need it in context of callbacks of other functions.
            var node = this;

            // this.status({fill:"red",shape:"ring",text:"disconnected"});

            // Store local copies of the node configuration (as defined in the .html)
            // this.topic = config.topic;
            // Retrieve the config node
                node.on('input', function(msg) {
                        // var sesh = 
                        try {
                            // If there's no token present, encode the payload and add a token.
                            if (!msg.token) {
                                var token = jwt.sign(msg.payload, node.secret);
                                msg.token = token;
                                node.send(msg);
                            } else {
                                // otherwise, decode the token in msg.token and place it in the payload.
                                jwt.verify(msg.token, node.secret, function(err, decoded) {
                                  if (!err) {
                                      msg.payload = decoded;
                                      node.send(msg);
                                  } else {
                                      node.error(err);
                                      msg.error = err;
                                      node.send(msg);
                                  }
                                });
                                
                            }
                        } catch (e) {
                            node.error("error" + e);
                            console.log("Error", e.stack);
                        }
                        // passport.authenticate(this.strategyName, { failWithError: true })(msg.req, msg.res, function(req, res) {
                        //     console.log("Hello from the out-siiiiiiiide!!!!! ");
                        //     console.log("Request is ", req);
                        //     node.send(msg);
                        // });
                        // msg.payload contains the command object.
                        // in this example just send it straight on... should process it here really

                        // this.client.act(msg.payload, function(err, result) {
                        //     if (err) {
                        //         node.error(err);
                        //         node.status({fill:"green",shape:"dot",text:"connected"});
                        //         node.send(err);
                        //     } else {
                        //         msg.payload.result = result;
                        //         node.send(msg);
                        //         node.status({fill:"green",shape:"dot",text:"connected"});
                        //     }
                        // });
                    });
                    // node.on("close", function() {
                    // Called when the node is shutdown - eg on redeploy.
                    // Allows ports to be closed, connections dropped etc.
                    // eg: node.client.disconnect();
                    // });
            }

            // Register the node by name. This must be called before overriding any of the
            // Node functions.
            RED.nodes.registerType("JsonWebToken", JsonWebToken);


            // Register the configuration node
            function JsonWebTokenConfig(n) {
                RED.nodes.createNode(this, n);
                this.name = n.name;
                this.secret = n.secret;
                // console.error("Config in confignode is ", n);
            }
            RED.nodes.registerType("token_config", JsonWebTokenConfig);


        };
