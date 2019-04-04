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
});

afterEach(async () => {
  await knex.schema.dropTableIfExists("books");
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

test("should successfully create table, then add column to table", async () => {
  await builder.createTable(knex.schema, "books", booksSchema);
  console.log(JSON.stringify(await knex("books").columnInfo(), null, 2));
  await migrator.updateColumns(knex, "books", booksSchema, newBooksSchema);
  console.log(JSON.stringify(await knex("books").columnInfo(), null, 2));
});
