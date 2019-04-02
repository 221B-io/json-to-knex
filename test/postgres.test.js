// TODO: switch to postgres
const builder = require("../index");
const _ = require("lodash");
const Knex = require("knex");
const fs = require("fs");

let config = {
  knex: {
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
  },
  dbManager: {
    // db manager related configuration
    collate: ["fi_FI.UTF-8", "Finnish_Finland.1252"],
    superUser: "pgtestuser",
    superPassword: "pgtestpassword"
  }
};

let knex;

beforeAll(async () => {
  knex = Knex(config.knex);
});

afterAll(async () => {
  knex.destroy();
  // fs.unlink("./test.sqlite3", err => {
  //   if (err) throw err;
  //   console.log("test database successfully deleted");
  // });
});

beforeEach(async () => {
  // await builder.dropTablesIfExists(knex, schema);
});

afterEach(async () => {
  // await builder.dropTablesIfExists(knex, schema);
  await knex.schema.dropTableIfExists("books");
});

const bookSchema = {
  columns: [
    {
      name: "id",
      type: "increments"
    },
    {
      name: "title",
      type: "string"
    },
    {
      name: "author",
      type: "string"
    }
  ]
};
let bookColsExpected = {
  id: {
    type: "integer",
    maxLength: null,
    nullable: false,
    defaultValue: "nextval('books_id_seq'::regclass)"
  },
  title: {
    type: "character varying",
    maxLength: 255,
    nullable: true,
    defaultValue: null
  },
  author: {
    type: "character varying",
    maxLength: 255,
    nullable: true,
    defaultValue: null
  }
};
test("create a single table", async () => {
  await builder.createTable(knex.schema, "books", bookSchema);
  let bookCols = await knex("books").columnInfo();
  console.log(JSON.stringify(bookCols, null, 2));
  expect(JSON.stringify(bookCols, null, 2)).toEqual(
    JSON.stringify(bookColsExpected, null, 2)
  );
});
