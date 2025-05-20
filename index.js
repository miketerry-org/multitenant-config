// index.js: multitenant-config.

"use strict";

// load all necessary modules
const config = require("./lib/config.js");
const cmdLine = require("./lib/cmdLine.js");

// process an command line parameters
cmdLine.run();

// export all public types
module.exports = config;
