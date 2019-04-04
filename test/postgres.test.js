const builder = require("../index");
const migrator = require("../lib/migrations");
const _ = require("lodash");
const Knex = require("knex");
const { str } = require("./utils");
const { booksExample, booksExpected } = require("./schemas");
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
  await builder.dropTablesIfExists(knex, booksExample);
});

afterAll(async () => {
  await builder.dropTablesIfExists(knex, booksExample);
  knex.destroy();
});

beforeEach(async () => {
  await builder.dropTablesIfExists(knex, booksExample);
});

afterEach(async () => {
  await builder.dropTablesIfExists(knex, booksExample);
});

const oldBookSchema = {
  name: "books",
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
      name: "rating",
      type: "integer"
    }
  ]
};

const bookSchema = {
  name: "books",
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
test("should properly create multiple tables", async () => {
  await builder.createTables(knex, booksExample);
  let booksCols = str(await knex("books").columnInfo());
  let personsCols = str(await knex("persons").columnInfo());
  let librariesCols = str(await knex("libraries").columnInfo());
  let booksLibrariesCols = str(await knex("booksLibraries").columnInfo());
  console.log(booksLibrariesCols);
  expect(booksCols).toEqual(str(booksExpected.postgres.columns.books));
  expect(personsCols).toEqual(str(booksExpected.postgres.columns.persons));
  expect(librariesCols).toEqual(str(booksExpected.postgres.columns.libraries));
  expect(booksLibrariesCols).toEqual(
    str(booksExpected.postgres.columns.booksLibraries)
  );
  await builder.dropTablesIfExists(knex, booksExample);
});

test("should migrate between two kinds of tables", async () => {
  await builder.createTable(knex.schema, "books", oldBookSchema);
  await migrator.updateTable(knex, "books", oldBookSchema, bookSchema);
  let bookCols = await knex("books").columnInfo();
  expect(JSON.stringify(bookCols, null, 2)).toEqual(
    JSON.stringify(bookColsExpected, null, 2)
  );
});

test("should create two indices, one single-col and one multi-col.", async () => {
  // await builder.createTable(knex.schema, "books", personIndexSchema);
  await builder.createTables(knex, booksExample);
  let results = str(
    await knex("pg_indexes").whereRaw("tablename not like 'pg%'")
  );
  expect(results).toEqual(str(booksExpected.postgres.indices));
});

// test unique flag
// test non-nullable fields
// test drop all tables
// test standard createTables method
