const jd = require("json-diff");
const _ = require("lodash");
const builder = require("./builder");
// things that automatic migrations needs to handle
// handle changes between types as much as possible

// add column
//
// remove column
// add index

const createTable = builder.createTable;

function dropColumn(knex, tableName, columnName) {
  console.log(`Dropping column ${columnName} from ${tableName}`);
  return knex.schema.table(tableName, function(t) {
    console.log("table grabbed");
    t.dropColumn(columnName);
  });
}
function addColumn(knex, tableName, column) {
  return knex.schema.table(tableName, function(t) {
    builder.createColumn(t, column);
  });
}

function getColumnsToRemove(oldSchema, newSchema) {
  return _.differenceBy(oldSchema.columns, newSchema.columns, "name").map(
    x => x.name
  );
}

function getColumnsToAdd(oldSchema, newSchema) {
  return _.differenceBy(newSchema.columns, oldSchema.columns, "name");
}

const oldSchema = {
  columns: [
    { name: "test", type: "string" },
    { name: "removeMe", type: "string" }
  ]
};

const newSchema = {
  columns: [
    { name: "test", type: "string" },
    { name: "addMeBabiee", type: "string" }
  ]
};

async function updateColumns(knex, tableName, oldSchema, newSchema) {
  let rmCols = getColumnsToRemove(oldSchema, newSchema);
  let newCols = getColumnsToAdd(oldSchema, newSchema);
  for (let i in rmCols) {
    await dropColumn(knex, tableName, rmCols[i]);
  }
  for (let j in newCols) {
    await addColumn(knex, tableName, newCols[j]);
  }
}

module.exports = {
  dropColumn,
  addColumn,
  createTable,
  updateColumns
};
