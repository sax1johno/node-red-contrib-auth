
// If you use this as a template, update the copyright with your own name.

// Sample Node-RED node file


module.exports = function(RED) {
    "use strict";
    // require any external libraries we may need....
    //var foo = require("foo-library");
    // Statics go here.
    var passport = require('passport');
    var cookieParser = require('cookie-parser');
    var expressSession = require('express-session');
    
    passport.serializeUser(function(user, done) {
        // done has an error as the first param, and the user string as the second.
        done(null, JSON.stringify(user));
    });
    
    passport.deserializeUser(function(user, done) {
        var u = JSON.parse(user);
        done(null, u);
    });
    
    // The main node definition - most things happen in here
    function HttpAuthNode(config) {
        // Create a RED node
        RED.nodes.createNode(this,config);

        // copy "this" object in case we need it in context of callbacks of other functions.
        var node = this;

        // this.status({fill:"red",shape:"ring",text:"disconnected"});

        // Store local copies of the node configuration (as defined in the .html)
        // this.topic = config.topic;
        // Retrieve the config node
        if (RED.settings.httpNodeRoot !== false) {
            this.strategy = RED.nodes.getNode(config.strategy);
            if (this.strategy) {
                try {
                    // Create the seneca instance here and then attach a client.
                    this.strategyName = this.strategy.strategy;
                    this.strategyConfig = this.strategy.strategyConfig;
                    this.middlewareConfig = this.strategy.middlewareconfig;
                    
                    // Take the strategyconfig and configure the passport method
                    var strategyLibrary = "passport-" + this.strategyName;
                    var Strategy = require(strategyLibrary).Strategy;
    
                    // Yes, I'm aware eval is evil.  In this case, we're trusting the user as
                    // they are most likely the programmer and already have teh powerz.
                    var middlewareConfigFn;
                    if (this.middlewareConfig) {
                        eval("middlewareConfigFn = " + this.middlewareConfig);
                    }
                    
                    var passportString ="passport.use(new Strategy(" + this.strategyConfig + "));";
                    // console.log(passportString);
                    eval(passportString);
                    
                    var app = RED.httpNode;
                    app.use(cookieParser());
                    app.use(expressSession({ "secret": "keyboard cat"}));
                    app.use(passport.initialize());
                    app.use(passport.session());
                    
                    node.on('input', function (msg) {
                        passport.authenticate(this.strategyName, middlewareConfigFn, function(err, user, info) {
                            if (err) {
                                console.log("in error of authenticate");
                                node.error(err);
                                msg.authErr = err;
                                node.send(msg);
                            }
                            else if (!user) {
                                node.warn("User not found");
                                msg.authErr = "not-found";
                                node.send(msg);
                            } else {
                                msg.req.login(user, function(err) {
                                    if (err) {
                                        node.error(err);
                                        msg.authErr = err;
                                        node.send(msg);
                                    } else {
                                        // Just send the message over since the user is contained in the request
                                        // on the message.
                                        node.send(msg);
                                    }
                                });
                            }
                        })(msg.req, msg.res);
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
                        
                        // node.on("node-status", function() {
                        // })
        
                        // node.status({fill:"green",shape:"dot",text:"connected"});
                } catch (e) {
                    node.error(["Exception in authorization node", e, e.stack].join(' '));
                    console.error(e);
                    // this.status({file: "red", shape: "dot", text: "ERR: see debug panel"});
                }
            } else {
                // this.status({fill:"red",shape:"dot",text:"ERR: No Config Found"});
                node.warn("An HTTP Root node is required.");
            }
        }
    }

    // Register the node by name. This must be called before overriding any of the
    // Node functions.
    RED.nodes.registerType("httpAuth",HttpAuthNode);
    
    
    // Register the configuration node
    function httpAuthConfig(n) {
        RED.nodes.createNode(this,n);
        this.strategy = n.strategy;
        this.strategyConfig = n.strategyConfig;
        this.middlwareConfig = n.middlewareConfig;
        this.name = n.name;
        // console.error("Config in confignode is ", n);
    }
    RED.nodes.registerType("auth_config",httpAuthConfig);


};
