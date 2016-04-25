# Node-Red Auth Node

This library uses the passport.js library to secure http nodes using configurable strategies.

### Version
0.1.0

### Installation

```sh
$ npm install node-red-contrib-auth
```
node-red should automatically detect the new node upon restarting of the server.

To add a new strategy, install that strategy through npm.  The name of the strategy in node-red will be
the name of the strategy without the "passport-" prefix:

ex: `npm install passport-facebook`

The users' information will be available through the "msg.req.user" object.

License
----

MIT

Copyright
----

&copy; 2016 John O'Connor