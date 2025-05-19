// config.js:

"use strict";

const path = require("path");
const fs = require("fs");
const { fileURLToPath } = require("url");
const SecretEnv = require("topsecret-env");

// define the server configuration schema
const _schema = [
  { name: "port", type: "integer", min: 1000, max: 65000, required: true },
  { name: "db_url", type: "string", min: 1, max: 255, required: true },
  {
    name: "log_collection_name",
    type: "string",
    min: 1,
    max: 255,
    required: true,
  },
  { name: "log_expiration_days", type: "integer", min: 1, required: false },
  { name: "log_capped", type: "boolean", required: false },
  { name: "log_max_size", type: "integer", min: 1, required: false },
  { name: "log_max_docs", type: "integer", min: 1, required: false },
  { name: "rate_limit_minutes", type: "integer", min: 1, required: false },
  { name: "rate_limit_requests", type: "integer", min: 1, required: false },
];

// initialize the configuration object
let _config = undefined;
let _keyFilename = path.join(process.cwd(), "_secret.key");

// if env defined in process then use lower case or default to development
const _envMode = process.env.NODE_ENV?.toLowerCase() || "dev";

function initializeConfig(schema = _schema) {
  try {
    let encryptKey;

    // if production mode then usee environment variable
    if (envMode === "prod") {
      encryptKey = process.env.ENCRYPT_KEY;
    } else {
      // throw error if the key file does not exist
      if (!fs.existsSync(_keyFilename)) {
        throw new Error(
          `Configuration encryption key file not found! (${_keyFilename})`
        );
      }

      // read the encryption key from the file
      encryptKey = fs.readFileSync(_keyFilename, "utf-8");
    }

    // throw error if encryption key not defined or if it is not 64 characters long
    if (!encryptKey || encryptKey.length !== 64) {
      throw new Error(
        `"Multitenant-Config: ENCRYPT_KEY" must be exactly 64 characters`
      );
    }

    // create the server configuration filename
    const filename = path.join(process.cwd(), "_encrypted/server.secret");

    // ensure the encrypted server configuration file exists
    if (!fs.existsSync(filename)) {
      throw new Error(
        `Multitenant-Config: Encrypted configuration file not found. (${filename})`
      );
    }

    // decrypt the JSON configuration object from the encrypted file
    _config = SecretEnv.loadFromFile(filename, encryptKey, schema);

    // Add environment mode flags
    _config.isDevelopment = envMode === "dev";
    _config.isProduction = envMode === "prod";
    _config.isTesting = envMode === "test";
    _config.envMode = envMode;
  } catch (err) {
    // if any error then display message and halt program execution
    console.error(err.message);
    process.exit(1);
  }
}

function addSchemaRule(rule) {
  // ensure schema rule is passed an it is a valid definition
  if (!rule || typeof rule !== "object") {
    throw new Error(`MultiTenant-Config: Adding invalid schema rule.`);
  }

  // addthe schema rule to the end of the global array
  _schema.push(rule);
}

// export the global configuration object
module.exports = {
  // getter for global configuration object
  get config() {
    if (!_configg) {
      throw new Error(
        `Multitenant-config: InitializeConfig() function must be called before accessing "config"`
      );
    }
    return _config;
  },

  // export the configuration initialization function
  initializeConfig,

  // return the default/global configuration schema
  get schema() {
    return _schema;
  },

  // add a rule to the default/global schema
  addSchemaRule,
};
