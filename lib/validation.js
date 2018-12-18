const Ajv = require('ajv');

const tableSchema = {
  "definitions": {
    "column": {
      "definitions": {
        "base": {
          "properties": {
            "type": { "type": "string" },
            "primary": { "type": "boolean" },
            "unique": { "type": "boolean" },
            "type": {},
            "primary": {},
            "unique": {},
          },
          "required": ["type"],
        },
        "text": {
          "allOf": [{ "$ref": "#/definitions/column/definitions/base" }],
          "properties": {
            "type": {
              "type": "string",
              "enum": [
                "text",
              ]
            },
            "textType": {
              "type": "string",
              "enum": [
                "text",
                "mediumtext",
                "longtext",
              ],
            },
            "primary": {},
            "unique": {},
          },
          "additionalProperties": false,
        },
        "string": {
          "allOf": [{ "$ref": "#/definitions/column/definitions/base" }],
          "properties": {
            "type": {
              "type": "string",
              "enum": [
                "binary",
                "string"
              ]
            },
            "length": { "type": "integer" },
            "primary": {},
            "unique": {},
          },
          "additionalProperties": false, 
        },
        "float": {
          "allOf": [{ "$ref": "#/definitions/column/definitions/base" }],
          "properties": {
            "type": {
              "type": "string",
              "enum": [
                "decimal",
                "float",
              ]
            },
            "precision": { "type": "integer" },
            "scale": { "type": "integer" },
            "type": {},
            "primary": {},
            "unique": {},
          },
          "additionalProperties": false, 
        },
        "dateTime": {
          "allOf": [{ "$ref": "#/definitions/column/definitions/base" }],
          "properties": {
            "type": {
              "type": "string",
              "enum": [
                "dateTime",
                "time",
              ]
            },
            "precision": { "type": "integer" },
            "type": {},
            "primary": {},
            "unique": {},
          },
          "additionalProperties": false,
        },
        "simple": {
          "allOf": [{ "$ref": "#/definitions/column/definitions/base" }],
          "properties": {
            "type": {
              "type": "string",
              "enum": [
                "boolean",
                "date",
                "increments",
                "integer",
                "json",
                "jsonb",
                "uuid",
                "bigInteger"
              ]
            },
            "type": {},
            "primary": {},
            "unique": {}
          },
          "additionalProperties": false
        }
      },
      "anyOf": [
        { "$ref": "#/definitions/column/definitions/text" },
        { "$ref": "#/definitions/column/definitions/string" },
        { "$ref": "#/definitions/column/definitions/simple" },
        { "$ref": "#/definitions/column/definitions/float" },
        { "$ref": "#/definitions/column/definitions/dateTime" }
      ],
    },
  },
  "minProperties": 1,
  "patternProperties": {
    "^.*$": { 
      "anyOf": [
        { "$ref": "#/definitions/column"},
      ],
    },
  },
  "additionalProperties": false, // "Unfortunately, now the schema will reject everything. This is because the Properties refers to the entire schema. And that entire schema includes no properties, and knows nothing about the properties in the subschemas inside of the allOf array." -- https://json-schema.org/understanding-json-schema/reference/combining.html
};

function validateSchema(schema) {
  const ajv = new Ajv();
  const validate = ajv.compile(tableSchema);
  const result = validate(schema);
  console.log(validate.errors);
  return result;
}

module.exports = {
  validateSchema,
};