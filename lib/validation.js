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
 * Makes sure that a schema fits the json-to-knex json schema.
 * If no errors, isValid is true and errors is empty
 * If invalid, isValid is false and errors returns what
 * parts of the schema are invalid and how.
 * @param {Object} inputSchema
 * @return {{isValid:Boolean, errors:Object}}
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
