const migrator = require("./migrations");

/**
 * Manages the migrations table
 * @param {*} knex Takes in a Knex instance
 */
const manager = knex => ({
  /**
   * Builds a migrations table to store migration information.
   * If one already exists, it drops it.
   */
  async makeMigrationsTable() {
    await knex.schema.dropTableIfExists("_migrations");
    await knex.schema.createTable("_migrations", function(table) {
      table.increments("id");
      table.json("schema");
      table.datetime("created");
      table.boolean("applied");
      table.boolean("current");
    });
  },

  /**
   * Adds the new schema to the migrations table and applies the relevant database changes to the rest of the db
   * @param {*} schema
   */
  async addMigration(schema) {
    // insert a migration into the table
    // removes any un-applied migrations (analogous to how browser history is handled)
    await knex("_migrations")
      .where({ applied: false })
      .delete();

    // initialize an empty schema object in case one isn't found
    let oldSchema = { tables: [] };

    // grab the current schema that we want to update from
    let firstResults = await knex("_migrations")
      .select("*")
      .where({ current: true });
    if (firstResults.length > 0) {
      oldSchema = firstResults[0].schema;
    }

    // remove the `current` flag from that schema
    await knex("_migrations")
      .where({ current: true })
      .update({
        current: false
      });

    // insert a new schema with a `current` flag
    await knex("_migrations").insert({
      schema,
      created: new Date().toISOString(),
      applied: true,
      current: true
    });

    // get the resulting schema
    // TODO: this might not be necessary, could just use the schema obj passed into the method instead of newSchema
    let secondResults = await knex("_migrations")
      .select("*")
      .where({ current: true });
    let newSchema = secondResults[0].schema;

    // update the database from the most recent applied migration to the new one that's been passed in
    await migrator.updateSchema(knex, oldSchema, newSchema);
  },

  /**
   * Reverts the changes from the current migration, back to the previous migration
   */
  async rollbackCurrentMigration() {
    // get schema we're migrating from
    let firstResults = await knex("_migrations")
      .select("*")
      .where({ current: true });
    let oldSchema = firstResults[0].schema;

    // set current migration to unapplied
    await knex("_migrations")
      .where({ current: true })
      .update({
        applied: false,
        current: false
      });
    // set preceding migration to current
    let results = await knex("_migrations")
      .where({ applied: true })
      .orderBy("created", "desc")
      .limit(1);
    let id = results[0].id;
    let newSchema = results[0].schema;
    await knex("_migrations")
      .where({ id })
      .update({ current: true });
    await migrator.updateSchema(knex, oldSchema, newSchema);
  },

  /**
   * Applies the next migration after the currently applied migration, if it exists
   */
  async applyNextMigration() {
    // unmark the current migration as current
    let firstResults = await knex("_migrations")
      .select("*")
      .where({ current: true });
    let oldSchema = firstResults[0].schema;

    await knex("_migrations")
      .where({ current: true })
      .update({ current: false });

    // get the next migration by date in the chain
    let results = await knex("_migrations")
      .where({ applied: false })
      .orderBy("created", "asc")
      .limit(1);
    let id = results[0].id;
    let newSchema = results[0].schema;
    // update that migration to being the "current" one
    await knex("_migrations")
      .where({ id })
      .update({ applied: true, current: true });

    await migrator.updateSchema(knex, oldSchema, newSchema);
  }
});

(async () => {
  module.exports = manager;
})();
