// If you use this as a template, update the copyright with your own name.

// Sample Node-RED node file


module.exports = function(RED) {
        "use strict";
        // require any external libraries we may need....
        //var foo = require("foo-library");
        // Statics go here.
        var passport = require('passport');
        // var session = require('client-sessions');

        // The main node definition - most things happen in here
        function HttpAuthNode(config) {
            // Create a RED node
            RED.nodes.createNode(this, config);

            // copy "this" object in case we need it in context of callbacks of other functions.
            var node = this;

            // this.status({fill:"red",shape:"ring",text:"disconnected"});

            // Store local copies of the node configuration (as defined in the .html)
            // this.topic = config.topic;
            // Retrieve the config node
            if (RED.settings.httpNodeRoot !== false) {
                node.strategy = RED.nodes.getNode(config.strategy);
                if (node.strategy) {
                    try {
                        // Create the seneca instance here and then attach a client.
                        node.middlewareConfig = node.strategy.middlewareconfig;
                        node.sessionConfig = node.strategy.sessionConfig || {
                            cookieName: 'session',
                            secret: 'random_string_goes_here',
                            duration: 30 * 60 * 1000,
                            activeDuration: 5 * 60 * 1000,
                        };

                        var passportString = "passport.use(new Strategy(" + node.strategyConfig + "));";
                        console.log(passportString);
                        eval(passportString);
                        
                        // Yes, I'm aware eval is evil.  In this case, we're trusting the user as
                        // they are most likely the programmer and already have teh powerz.
                        var middlewareConfigFn;
                        if (node.middlewareConfig) {
                            eval("middlewareConfigFn = " + node.middlewareConfig);
                        }

                        // RED.httpNode.use(cookieParser());
                        // RED.httpNode.use(passport.initialize());
                        // RED.httpNode.use(passport.session());

                        node.on('input', function(msg) {
                                // var sesh = 
                                try {
                                    console.log("******* user in beginning is = ", msg.req.user);
                                    console.log("****** session = ", msg.req.session);
                                    passport.authenticate(node.strategyName, {
                                        passReqToCallback: true,
                                        failWithError: true
                                    }, function(err, user, info) {
                                        console.log("Made it into authenticate");
                                        // // console.log("error is ", err);
                                        // console.log("user is ", user);
                                        // console.log("Url = ", msg.req.originalUrl);
                                        // console.log(req.user);
                                        // msg.req.session.user = user;
                                        console.log("user = ", user);
                                        console.log("info = ", info);
                                        if (err) {
                                            console.log("Error = ", err);
                                            console.log("Stack = ", err.stack);
                                            node.error(err);
                                            msg.error = {
                                                message: err,
                                                code: "general"
                                            }
                                            node.send(msg);
                                        }
                                        else if (!user) {
                                            console.log("user not found");
                                            node.error("User not found");
                                            msg.error = {
                                                message: "User Not Found",
                                                code: "user-not-found"
                                            }
                                            node.send(msg);
                                        }
                                        else {
                                            console.log("Reached the login point");
                                            // console.log("req is ", require('util').inspect(1));
                                            msg.req.logIn(user, function(err) {
                                                // console.log("Inside of session, user is ", msg.req.user);
                                                // console.log("Called msg.req.login");
                                                if (err) {
                                                    console.log("error is ", err);
                                                    msg.error = {
                                                        message: err,
                                                        code: "login-error"
                                                    }
                                                    node.send(msg);
                                                }
                                                else {
                                                    // console.log("User logged in", msg.req.user);
                                                    node.send(msg);
                                                }
                                            });
                                        }
                                    })(msg.req, msg.res);
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

                            // node.on("node-status", function() {
                            // })

                            // node.status({fill:"green",shape:"dot",text:"connected"});
                        }
                        catch (e) {
                            node.error(["Exception in authorization node", e, e.stack].join(' '));
                            console.error(e);
                            // this.status({file: "red", shape: "dot", text: "ERR: see debug panel"});
                        }
                    }
                    else {
                        // this.status({fill:"red",shape:"dot",text:"ERR: No Config Found"});
                        node.warn("An HTTP Root node is required.");
                    }
                }
            }

            // Register the node by name. This must be called before overriding any of the
            // Node functions.
            RED.nodes.registerType("httpAuth", HttpAuthNode);


            // Register the configuration node
            function httpAuthConfig(n) {
                RED.nodes.createNode(this, n);
                this.strategy = n.strategy;
                this.strategyConfig = n.strategyConfig;
                this.middlwareConfig = n.middlewareConfig;
                this.name = n.name;
                // console.error("Config in confignode is ", n);
            }
            RED.nodes.registerType("auth_config", httpAuthConfig);


        };
