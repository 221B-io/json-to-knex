const Ajv = require("ajv");
const fse = require("fse");
const path = require("path");

const getSchema = uri => {
  return request.json(uri).then(function(res) {
    if (res.statusCode >= 400)
      throw new Error("Loading error: " + res.statusCode);
    return res.body;
  });
};

// const loadSchema = getSchema;

async function go() {
  const base = "../sql-json-schema/";

  const loadSchema = uri => {
    return fse.readJson(path.join(base, uri));
  };

  const schemaSchema = await fse.readJson(
    path.join(base, "schema.schema.json")
  );
  const ajv = new Ajv({ loadSchema });
  require("ajv-merge-patch")(ajv); // add merge and patch compatibility

  ajv.compileAsync(schemaSchema).then(validate => {
    const valid = validate({
      tables: [
        {
          name: "users",
          columns: [
            {
              name: "age",
              type: "integer",
              unsigned: false
            },
            {
              name: "firstName",
              type: "string"
            },
            {
              name: "bio",
              type: "text",
              default: "This bio is currently empty."
            },
            {
              name: "age",
              type: "integer"
            },
            {
              name: "mightBeValid",
              type: "integer"
              // , unrecognizedField: 5 // will invalidate
            },
            {
              name: "friendId",
              type: "integer",
              unsigned: true
            }
          ]
        }
      ]
    });
    if (!valid) {
      console.log("Error!");
      console.log(validate.errors);
    } else {
      console.log("Valid!");
    }
  });
}

go();
