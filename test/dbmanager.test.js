const Manager = require("../lib/db-manager");
const Knex = require("knex");

const knexPostgresConfig = {
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

const knexSqliteConfig = {
  client: "sqlite3",
  connection: {
    filename: "./test.sqlite3"
  },
  useNullAsDefault: true,
  debug: true
};

const knex = Knex(knexPostgresConfig);
const m = Manager(knex);

beforeEach(async () => {
  // drop all tables
  await knex.schema.dropTableIfExists("books");
  await knex.schema.dropTableIfExists("persons");
});

afterAll(async () => {
  knex.destroy();
});

const schema1 = {
  tables: [
    {
      name: "persons",
      columns: [
        { name: "firstName", type: "string" },
        {
          name: "age",
          type: "integer"
        },
        {
          name: "joined",
          type: "datetime"
        }
      ]
    }
  ]
};

const schema2 = {
  tables: [
    {
      name: "persons",
      columns: [
        { name: "id", type: "increments", primary: true },
        { name: "firstName", type: "string" },
        {
          name: "age",
          type: "integer"
        },
        {
          name: "joined",
          type: "datetime"
        }
      ]
    },
    {
      name: "books",
      columns: [
        {
          name: "title",
          type: "string"
        },
        {
          name: "authorId",
          type: "integer",
          unsigned: true
          // unAllowedKey: true
        }
        // { // TODO: add back in FK's
        //   foreign: "authorId",
        //   references: "id",
        //   inTable: "persons",
        //   onDelete: "CASCADE"
        // }
      ]
    }
  ]
};

const schema3 = {
  tables: [
    {
      name: "persons",
      columns: [
        { name: "id", type: "increments", primary: true },
        { name: "firstName", type: "string" },
        {
          name: "age",
          type: "integer"
        },
        {
          name: "joined",
          type: "datetime"
        }
      ]
    },
    {
      name: "books",
      columns: [
        {
          name: "title",
          type: "string"
        },
        {
          name: "author",
          type: "string"
        }
      ]
    }
  ]
};

async function getMigrationRows() {
  return await knex("_migrations").select("*");
}

test("should do thing", async () => {
  await m.makeMigrationsTable();
  await m.addMigration(schema1);
  await m.addMigration(schema2);
  await m.addMigration(schema3);
  await m.rollbackCurrentMigration();
  await m.rollbackCurrentMigration();
  await m.applyNextMigration();

  console.log(await getMigrationRows());
  expect(true);
});

const go = async () => {
  try {
  } catch (e) {
    console.log(e);
  }
};

(async () => {
  await go();
})();
