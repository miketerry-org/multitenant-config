// cmdLine.js:

"use strict";

// load all necessary modules
const fs = require("fs");
const path = require("path");
const SecretEnv = require("topsecret-env");

class CmdLine {
  static hasArgV(name) {
    const lowerName = `--${name.toLowerCase()}`;
    return process.argv.some(arg => arg.toLowerCase() === lowerName);
  }

  static generate() {
    const filename = path.join(process.cwd(), "_secret.key");
    const key = SecretEnv.generateKey();
    fs.writeFileSync(filename, key, "utf-8");
    console.log(`Saved generated encryption key in file. (${filename})`);
    process.exit(0);
  }

  static encryptFiles() {
    console.log("Encrypt *.env files...");
  }

  static decryptFiles() {
    console.log(`Decrypt *.secret files...`);
  }

  static run() {
    // perform specified processing for given command line parameter
    if (this.hasArgV("generate")) {
      this.generate();
    } else if (this.hasArgV("encrypt")) {
      this.encryptFiles();
    } else if (this.hasArgV("decrypt")) {
      this.decryptFiles();
    } else {
      // no matching argument so return from function and continue program execution
      return null;
    }

    // since a valid command line argument specified, halt program with no error
    process.exit(0);
  }
}

module.exports = CmdLine;
