const Ajv = require('ajv');
const fse = require('fse');
const path = require('path');

const getSchema = (uri ) => {
  return request.json(uri).then(function (res) {
    if (res.statusCode >= 400)
      throw new Error('Loading error: ' + res.statusCode);
    return res.body;
  });
}


// const loadSchema = getSchema;

async function go() {
  const base = '../sql-json-schema/'

  const loadSchema = (uri) => {
    return fse.readJson(path.join(base, uri));
  }

  const schemaSchema = await fse.readJson(path.join(base, 'schema.schema.json'))
  const ajv = new Ajv({ loadSchema, });

  ajv.compileAsync(
    schemaSchema
  ).then((validate) => {
    const valid = validate(
      {
        "tables": [
          {
            "name": "users",
            "columns": [
              {
                "name": "firstName",
                "type": "float",
                scale: 'something'
              }
            ]
          }
        ]
      }
    )
    if(!valid) {
      console.log('Error!');
    } else {
      console.log('Valid!');
    }
  })
}

go()