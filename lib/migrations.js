const jd = require("json-diff");
const _ = require("lodash");
const builder = require("./builder");
const validate = require("./validation");
const createTable = builder.createTable;
const { str } = require("../test/utils");

/**
 * Drops the column that's passed in
 * @param {*} knex
 * @param {String} tableName
 * @param {{name:String}} column A column object that has a name or a `foreign` value
 */
function dropColumn(knex, tableName, column) {
  console.log(`Dropping column ${column.name} from ${tableName}`);
  return knex.schema.table(tableName, function(t) {
    if (column.foreign) {
      console.log(`Attempting to drop FK on ${column.foreign}`);
      t.dropForeign(column.foreign);
    } else {
      t.dropColumn(column.name);
    }
  });
}

/**
 *
 * @param {*} knex
 * @param {String} tableName
 * @param {JSON} column
 */
function addColumn(knex, tableName, column) {
  return knex.schema.table(tableName, function(t) {
    builder.createColumn(t, column);
  });
}

/**
 *
 * @param {JSON} oldSchema
 * @param {JSON} newSchema
 */
function getColumnsToRemove(oldSchema, newSchema) {
  return _.differenceBy(oldSchema.columns, newSchema.columns, "name");
}

/**
 *
 * @param {JSON} oldSchema
 * @param {JSON} newSchema
 */
function getColumnsToAdd(oldSchema, newSchema) {
  return _.differenceBy(newSchema.columns, oldSchema.columns, "name");
}

/**
 *
 * @param {JSON} oldSchema
 * @param {JSON} newSchema
 */
function getTablesToDrop(oldSchema, newSchema) {
  return _.differenceBy(oldSchema.tables, newSchema.tables, "name").map(
    x => x.name
  );
}

/**
 *
 * @param {JSON} oldSchema
 * @param {JSON} newSchema
 */
function getTablesToAdd(oldSchema, newSchema) {
  return _.differenceBy(newSchema.tables, oldSchema.tables, "name");
}

/**
 * Gets the diffs of a table then updates each column accordingly
 * @param {Object} knex
 * @param {String} tableName
 * @param {JSON} oldSchema
 * @param {JSON} newSchema
 */
async function updateTable(knex, tableName, oldSchema, newSchema) {
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
 * @param {Object} knex A Knex instance
 * @param {JSON} oldSchema Previous schema of entire db, includes tables[] key
 * @param {JSON} newSchema New schema of entire db, includes tables[] key
 */
async function updateSchema(knex, oldSchema, newSchema) {
  // Validate the schema we're migrating from (just in case)
  let oldResults = await validate(oldSchema);
  if (!oldResults.isValid) {
    console.log(str(oldResults.errors));
    throw Error("Schema you are trying to migrate from is not valid");
  }

  // Validate the schema we're migrating to
  let newResults = await validate(newSchema);
  if (!newResults.isValid) {
    console.log(str(newResults.errors));
    throw Error("The schema you are trying to migrate to is not valid");
  }

  //
  let tablesToDrop = getTablesToDrop(oldSchema, newSchema);
  let tablesToAdd = getTablesToAdd(oldSchema, newSchema);

  // remove all old tables that are in the previous schema but not the new one
  for (let i in tablesToDrop) {
    await knex.schema.dropTable(tablesToDrop[i]);
  }

  // make all tables that don't exist in previous schema (no complicated migration stuff necessary)
  await builder.createTables(knex, { tables: tablesToAdd });

  // get list of tables that exist in both schemas
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
