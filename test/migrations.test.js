const builder = require("../index");
const _ = require("lodash");
const Knex = require("knex");
const fs = require("fs");
const migrator = require("../lib/migrations");

const knexConfig = {
  client: "sqlite3",
  connection: {
    filename: "./test.sqlite3"
  },
  useNullAsDefault: true,
  debug: true
};

let knex;

beforeAll(async () => {
  knex = Knex(knexConfig);
});

afterAll(async () => {
  knex.destroy();
  fs.unlink("./test.sqlite3", err => {
    if (err) throw err;
    console.log("test database successfully deleted");
  });
});

beforeEach(async () => {
  await knex.schema.dropTableIfExists("books");
  await knex.schema.dropTableIfExists("libraries");
  await knex.schema.dropTableIfExists("persons");
});

afterEach(async () => {
  await knex.schema.dropTableIfExists("books");
  await knex.schema.dropTableIfExists("libraries");
  await knex.schema.dropTableIfExists("persons");
});

const booksSchema = {
  name: "books",
  columns: [
    {
      name: "id",
      type: "increments",
      primary: true,
      nullable: false
    },
    {
      name: "title",
      type: "string"
    },
    {
      name: "year",
      type: "integer"
    },
    {
      name: "description",
      type: "text"
    }
  ]
};

const newBooksSchema = {
  name: "books",
  columns: [
    {
      name: "id",
      type: "increments",
      primary: true,
      nullable: false
    },
    {
      name: "title",
      type: "string"
    },
    {
      name: "year",
      type: "date"
    },
    {
      name: "author",
      type: "string"
    }
  ]
};

const oldDbSchema = {
  tables: [
    {
      name: "books",
      columns: [
        {
          name: "id",
          type: "increments",
          primary: true,
          nullable: false
        },
        {
          name: "title",
          type: "string"
        },
        {
          name: "year",
          type: "integer"
        },
        {
          name: "description",
          type: "text"
        }
      ]
    },
    {
      name: "libraries",
      columns: [
        {
          name: "id",
          type: "increments",
          primary: true,
          nullable: false
        },
        {
          name: "name",
          type: "string"
        },
        {
          name: "city",
          type: "string"
        },
        {
          name: "state",
          type: "string"
        },
        {
          name: "zip",
          type: "integer"
        }
      ]
    }
  ]
};

const newDbSchema = {
  tables: [
    newBooksSchema,
    {
      name: "persons",
      columns: [
        {
          name: "id",
          type: "increments",
          primary: true,
          nullable: false
        },
        {
          name: "firstName",
          type: "string"
        },
        {
          name: "lastName",
          type: "string"
        }
      ]
    }
  ]
};

test("should successfully create table, then add column to table", async () => {
  await builder.createTable(knex.schema, "books", booksSchema);
  console.log(JSON.stringify(await knex("books").columnInfo(), null, 2));
  await migrator.updateTable(knex, "books", booksSchema, newBooksSchema);
  console.log(JSON.stringify(await knex("books").columnInfo(), null, 2));
});

test("should successfully create schema, then update schema", async () => {
  await builder.createTables(knex, oldDbSchema);
  console.log("PRE-MIGRATION");
  console.log(JSON.stringify(await knex("books").columnInfo(), null, 2));
  console.log(JSON.stringify(await knex("libraries").columnInfo(), null, 2));
  console.log(JSON.stringify(await knex("persons").columnInfo(), null, 2));

  await migrator.updateSchema(knex, oldDbSchema, newDbSchema);
  console.log("POST-MIGRATION");
  console.log(JSON.stringify(await knex("books").columnInfo(), null, 2));
  console.log(JSON.stringify(await knex("libraries").columnInfo(), null, 2));
  console.log(JSON.stringify(await knex("persons").columnInfo(), null, 2));
});
