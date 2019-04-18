const Manager = require("../lib/db-manager");
const Knex = require("knex");
const { str } = require("./utils");
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

let knex;
let m;
beforeAll(async () => {
  knex = await Knex(knexPostgresConfig);
  m = Manager(knex);
});

beforeEach(async () => {
  // drop all tables

  try {
    await knex.schema.dropTableIfExists("books");
    await knex.schema.dropTableIfExists("persons");
  } catch (e) {
    console.log(e);
  }
  console.log("Dropped all tables");
});

afterEach(async () => {
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
          type: "dateTime"
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
          type: "dateTime"
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
        },
        {
          // TODO: add back in FK's
          // name: "authorKey",
          type: "foreign",
          foreign: "authorId",
          references: "id",
          inTable: "persons",
          onDelete: "CASCADE"
        }
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
          type: "dateTime"
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
        }
      ]
    }
  ]
};

async function getMigrationRows() {
  return await knex("_migrations").select("*");
}

test("should be able to add and rollback migrations", async () => {
  try {
    await m.makeMigrationsTable();
    await m.addMigration(schema1);
    console.log("first migration finished");
    await m.addMigration(schema2);
    console.log("second migration finished");

    await m.addMigration(schema3);
    console.log("third migration finished");

    console.log(str(await knex("books").columnInfo()));
    await m.rollbackCurrentMigration();
    await m.rollbackCurrentMigration();
    await m.applyNextMigration();

    console.log(await getMigrationRows());
    expect(true);
  } catch (e) {
    console.log(e);
    expect(false);
  }
});

test("should remove un-applied migrations when a new migration is added", async () => {
  try {
    await m.makeMigrationsTable();
    console.log("table made");

    await m.addMigration(schema1);
    console.log("first migration finished");

    await m.addMigration(schema2);
    console.log("second migration finished");

    await m.rollbackCurrentMigration();
    console.log("second migration rolled back");

    await m.addMigration(schema3);
    console.log(await getMigrationRows());
    expect(true);
  } catch (e) {
    console.log(e);
    expect(false);
  }
});
