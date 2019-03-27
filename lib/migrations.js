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

const p = obj => {
  return JSON.stringify(obj, null, 2);
};

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
  for (let i in newCols) {
    await addColumn(knex, tableName, newCols[i]);
  }
  // get remaining columns
  let sameCols = _.differenceBy(newSchema.columns, newCols, "name");
  for (let i in sameCols) {
    // look at each column in both tables
    const newCol = sameCols[i];
    const oldCol = oldSchema.columns.filter(x => x.name === newCol.name)[0];
    const diff = jd.diff(oldCol, newCol);
    if (diff && Object.keys(diff)) {
      // things have CHANGED
      console.log(p(knex.client));
      const clientType = knex.client.config.client;
      console.log(`CLIENT: ${clientType}`);
      if (clientType === "sqlite3" || clientType === "redshift") {
        // remake column if there are changes to it and alterations are not supported
        await dropColumn(knex, tableName, newCol.name);
        await addColumn(knex, tableName, newCol);
      } else {
        // if alterations are supported, then alter columns
        await knex.schema.alterTable(tableName, async t => {
          console.log(`CHANGING COLUMN FROM ${p(oldCol)} to ${p(newCol)}`);
          await builder.createColumn(t, newCol, true);
        });
      }
    }
  }
}

module.exports = {
  dropColumn,
  addColumn,
  createTable,
  updateColumns
};
