const Knex = require("knex");
const migrator = require("./migrations");

const knexConfig = {
  // just the usual knex configuration
  client: "postgres",
  connection: {
    host: "localhost",
    database: "jtk-test",
    user: "pgtestuser"
    // password: "pgtestpassword"
  },
  pool: {
    min: 0,
    max: 10
  }
  // migrations: {
  //   directory: __dirname + "/migrations"
  // }
};
knex = Knex(knexConfig);

/**
 *
 * @param {*} knex Takes in a Knex instance
 */
const manager = knex => ({
  async makeMigrationsTable() {
    // make the dang table
    // json schema column, datetime column,
    await knex.schema.dropTableIfExists("_migrations");
    await knex.schema.createTable("_migrations", function(table) {
      table.increments("id");
      table.json("schema");
      table.datetime("created");
      table.boolean("applied");
      table.boolean("current");
    });
  },
  async addMigration(schema) {
    // insert a migration into the table
    let firstResults = await knex.select("*").where({ current: true });
    let oldSchema = firstResults.row[0].schema;
    await knex("_migrations")
      .where({ current: true })
      .update({
        current: false
      });
    await knex("_migrations").insert({
      schema,
      created: new Date().toISOString(),
      applied: true,
      current: true
    });

    let secondResults = await knex.select("*").where({ current: true });
    let newSchema = secondResults.row[0].schema;
    migrator.updateSchema(knex, oldSchema, newSchema);
    // migrate from PREVIOUS to JUST INSERTED
  },
  async rollbackCurrentMigration() {
    // set current migration to unapplied
    let firstResults = await knex.select("*").where({ current: true });
    let oldSchema = firstResults.row[0].schema;
    await knex("_migrations")
      .where({ current: true })
      .update({
        applied: false,
        current: false
      });
    console.log("set current migration to Not Applied, Not Current");
    // set preceding migration to current
    let results = await knex.raw(
      "SELECT id FROM _migrations WHERE applied = true ORDER BY created DESC LIMIT 1"
    );
    let id = results.rows[0].id;
    let newSchema = results.rows[0].schema;
    await knex.raw(`UPDATE _migrations SET current = true WHERE id = ${id}`);
    console.log(results);
    migrator.updateSchema(knex, oldSchema, newSchema);
    console.log("Current migration rolled back");
    // MIGRATE FROM CURRENT TO PREVIOUS
  },
  async applyNextMigration() {
    // unmark the current migration as current
    let firstResults = await knex.select("*").where({ current: true });
    let oldSchema = firstResults.row[0].schema;

    await knex.raw(
      "UPDATE _migrations SET current = false WHERE current = true"
    );

    // get the next migration by date in the chain
    let results = await knex.raw(
      "SELECT id FROM _migrations WHERE applied = false ORDER BY created ASC LIMIT 1"
    );
    let id = results.rows[0].id;
    let newSchema = results.rows[0].schema;
    // update that migration to being the "current" one
    await knex.raw(
      `UPDATE _migrations SET applied = true, current = true WHERE id = ${id}`
    );

    // MIGRATE FROM CURRENT TO NEXT
    await migrator.updateSchema(knex, oldSchema, newSchema);
  }
});

const testSchema = {
  tables: [
    {
      name: "books",
      columns: [
        {
          name: "id",
          type: "increments"
        }
      ]
    }
  ]
};

async function getRows() {
  return await knex("_migrations").select("*");
}

const go = async () => {
  const m = manager(knex);
  await m.makeMigrationsTable();
  try {
    await m.addMigration(testSchema);
    await m.addMigration(testSchema);
    await m.addMigration(testSchema);
    await m.addMigration(testSchema);
    await m.addMigration(testSchema);

    await m.rollbackCurrentMigration();
    await m.rollbackCurrentMigration();
    await m.rollbackCurrentMigration();
    await m.rollbackCurrentMigration();

    await m.applyNextMigration();
    await m.applyNextMigration();
    await m.applyNextMigration();

    console.log(await getRows());
  } catch (e) {
    console.log(e);
  }
};

(async () => {
  await go();
  module.exports = manager;
})();
