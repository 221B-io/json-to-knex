const Knex = require("knex");

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

const manager = {
  async makeMigrationsTable() {
    // make the dang table
    // json schema column, datetime column,
    await knex.schema.dropTableIfExists("_migrations");
    await knex.schema
      // .withSchema("public")
      .createTable("_migrations", function(table) {
        table.increments("id");
        table.json("schema");
        table.datetime("created");
        table.boolean("applied");
        table.boolean("current");
      });
  },
  async addMigration(schema) {
    // insert a migration into the table
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
  },
  async rollbackCurrentMigration() {
    // set current migration to unapplied
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
    await knex.raw(`UPDATE _migrations SET current = true WHERE id = ${id}`);
    console.log(results);
    console.log("Current migration rolled back");
  },
  async applyNextMigration() {
    // unmark the current migration as current
    await knex.raw(
      "UPDATE _migrations SET current = false WHERE current = true"
    );

    // mark the next migration as current
    // await knex.raw(
    //   "UPDATE _migrations SET current = 1, applied = 1 WHERE applied = 0 ORDER BY created ASC LIMIT 1"
    // );
    let results = await knex.raw(
      "SELECT id FROM _migrations WHERE applied = false ORDER BY created ASC LIMIT 1"
    );
    let id = results.rows[0].id;
    await knex.raw(
      `UPDATE _migrations SET applied = true, current = true WHERE id = ${id}`
    );
  }
};

const testSchema = {
  tables: [
    {
      name: "books",
      columns: [
        {
          name: "id",
          type: "increments"
        },
        {
          name: "title",
          type: "string"
        }
      ]
    }
  ]
};

async function getRows() {
  return await knex("_migrations").select("*");
}
const go = async () => {
  await manager.makeMigrationsTable();
  try {
    console.log(await getRows());
    await manager.addMigration(testSchema);
    await manager.addMigration(testSchema);
    console.log(await getRows());
    console.log("migration added");

    await manager.rollbackCurrentMigration();
    console.log(await getRows());
    console.log("rolled back");

    await manager.applyNextMigration();
    console.log(await getRows());
    console.log("applied next migration");
  } catch (e) {
    console.log(e);
  }
};

(async () => {
  await go();
  module.exports = manager;
})();
