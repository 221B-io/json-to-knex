const jd = require("json-diff");
const _ = require("lodash");
const builder = require("./builder");
const validate = require("./validation");
const createTable = builder.createTable;
const { str } = require("../test/utils");
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

function getTablesToDrop(oldSchema, newSchema) {
  return _.differenceBy(oldSchema.tables, newSchema.tables, "name").map(
    x => x.name
  );
}

function getTablesToAdd(oldSchema, newSchema) {
  return _.differenceBy(newSchema.tables, oldSchema.tables, "name");
}

async function updateTable(knex, tableName, oldSchema, newSchema) {
  // validate old schema
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
      const clientType = knex.client.config.client;
      if (clientType === "sqlite3" || clientType === "redshift") {
        // remake column if there are changes to it and alterations are not supported
        await dropColumn(knex, tableName, newCol.name);
        await addColumn(knex, tableName, newCol);
      } else {
        // if alterations are supported, then alter columns
        await knex.schema.alterTable(tableName, async t => {
          await builder.createColumn(t, newCol, true);
        });
      }
    }
  }
}

/**
 *
 * @param {*} knex A Knex instance
 * @param {*} oldSchema Previous schema of entire db, includes tables[] key
 * @param {*} newSchema New schema of entire db, includes tables[] key
 */
async function updateSchema(knex, oldSchema, newSchema) {
  let isValidOld = validate(oldSchema);
  let errorsOld = validate.errors;
  if (!isValidOld) {
    console.log(errorsOld);
    throw Error("Schema you are trying to migrate from is not valid");
  }

  let isValidNew = validate(newSchema);
  let errorsNew = validate.errors;
  if (!isValidNew) {
    console.log(errorsNew);
    throw Error("Schema you are trying to migrate to is not valid");
  }

  let tablesToDrop = getTablesToDrop(oldSchema, newSchema);
  let tablesToAdd = getTablesToAdd(oldSchema, newSchema);

  // remove all old tables
  for (let i in tablesToDrop) {
    await knex.schema.dropTable(tablesToDrop[i]);
  }

  // make new tables
  await builder.createTables(knex, { tables: tablesToAdd });

  // get list of tables that are the same
  let sameTables = _.differenceBy(newSchema.tables, tablesToAdd, "name");

  // for each table in the new schema, finds the same table in the old schema and updates from the old to the new.
  for (let i in sameTables) {
    let t = sameTables[i];
    await updateTable(
      knex,
      t.name,
      oldSchema.tables.filter(x => x.name === t.name)[0],
      t
    );
  }
}

module.exports = {
  dropColumn,
  addColumn,
  createTable,
  updateTable,
  updateSchema
};
