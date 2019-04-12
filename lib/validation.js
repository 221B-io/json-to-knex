const Ajv = require("ajv");
const fse = require("fse");
const path = require("path");

/**
 *
 * @param {*} uri
 */
const getSchema = uri => {
  return request.json(uri).then(function(res) {
    if (res.statusCode >= 400)
      throw new Error("Loading error: " + res.statusCode);
    return res.body;
  });
};

/**
 *
 * @param {*} inputSchema
 */
const validateTables = async inputSchema => {
  const base = "../sql-json-schema/";
  const loadSchema = uri => {
    return fse.readJson(path.join(base, uri));
  };
  const schemaSchema = await fse.readJson(
    path.join(base, "schema.schema.json")
  );
  const ajv = new Ajv({ loadSchema });
  require("ajv-merge-patch")(ajv); // add merge and patch compatibility

  validate = await ajv.compileAsync(schemaSchema);
  const valid = validate(inputSchema);
  return {
    isValid: valid,
    errors: validate.errors
  };
};

module.exports = validateTables;
