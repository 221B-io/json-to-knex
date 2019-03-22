const builder = require("../index");
const _ = require("lodash");
const Knex = require("knex");
const fs = require("fs");
const schema = {
  tables: [
    {
      name: "persons",
      columns: [
        {
          name: "id",
          type: "increments",
          primary: true
        },
        {
          name: "parentId",
          type: "integer",
          unsigned: true,
          references: "id",
          inTable: "persons",
          onDelete: "SET NULL"
        },
        {
          name: "firstName",
          type: "string"
        },
        {
          name: "lastName",
          type: "string"
        },
        {
          name: "age",
          type: "integer"
        },
        {
          name: "address",
          type: "json"
        }
      ]
    },
    {
      name: "movies",
      columns: [
        {
          name: "id",
          type: "increments",
          primary: true
        },
        {
          name: "name",
          type: "string"
        }
      ]
    },
    {
      name: "animals",
      columns: [
        {
          name: "id",
          type: "increments",
          primary: true
        },
        {
          name: "ownerId",
          type: "integer",
          unsigned: true,
          references: "id",
          inTable: "persons",
          onDelete: "SET NULL"
        },
        {
          name: "name",
          type: "string"
        },
        {
          name: "species",
          type: "string"
        }
      ]
    },
    {
      name: "persons_movies",
      columns: [
        {
          name: "id",
          primary: true
        },
        {
          name: "personId",
          type: "integer",
          unsigned: true,
          references: "id",
          inTable: "persons",
          onDelete: "CASCADE"
        },
        {
          name: "movieId",
          type: "integer",
          unsigned: true,
          references: "id",
          inTable: "movies",
          onDelete: "CASCADE"
        }
      ]
    }
  ]
};

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
  await builder.dropTablesIfExists(knex, schema);
});

afterEach(async () => {
  await builder.dropTablesIfExists(knex, schema);
  await knex.schema.dropTableIfExists("users");
});

const userSchema = {
  columns: [
    {
      name: "test",
      type: "string"
    }
  ]
};

const userColsExpected = {
  test: {
    type: "varchar",
    maxLength: "255",
    nullable: true,
    defaultValue: null
  }
};

test("create a single table", async () => {
  await builder.createTable(knex.schema, "users", userSchema);
  let userCols = await knex("users").columnInfo();
  expect(userCols).toEqual(userColsExpected);
});

test("create a single table with defaults", async () => {
  const defaultUserSchema = { ...userSchema };
  defaultUserSchema.columns[0].default = "default test";
  const defaultUserColsExpected = { ...userColsExpected };
  defaultUserColsExpected.test.defaultValue = "'default test'";
  await builder.createTable(knex.schema, "users", defaultUserSchema);
  let defaultUserCols = await knex("users").columnInfo();
  console.log(defaultUserCols);
  expect(defaultUserCols).toEqual(defaultUserColsExpected);
});

test("create a single table with non-nullable fields", async () => {
  const nullableUserSchema = { ...userSchema };
  nullableUserSchema.columns[0].nullable = false;
  const nullableUserColsExpected = { ...userColsExpected };
  nullableUserColsExpected.test.nullable = false;
  await builder.createTable(knex.schema, "users", nullableUserSchema);
  let nullableUserCols = await knex("users").columnInfo();
  expect(nullableUserCols).toEqual(nullableUserColsExpected);
});

test("drop all tables", async () => {
  const empty = JSON.stringify({});
  await builder.createTables(knex, schema);
  expect(JSON.stringify(await knex("persons").columnInfo())).not.toEqual(empty);
  await builder.dropTablesIfExists(knex, schema);

  expect(JSON.stringify(await knex("persons").columnInfo())).toEqual(empty);
  expect(JSON.stringify(await knex("movies").columnInfo())).toEqual(empty);
  expect(JSON.stringify(await knex("animals").columnInfo())).toEqual(empty);
  expect(JSON.stringify(await knex("persons_movies").columnInfo())).toEqual(
    empty
  );
});

test("adds columns to multiple tables", async () => {
  await builder.createTables(knex, schema);
  let personCols = await knex("persons").columnInfo();
  let movieCols = await knex("movies").columnInfo();
  let animalCols = await knex("animals").columnInfo();
  let personMovieCols = await knex("persons_movies").columnInfo();
  let persons = {
    id: {
      type: "integer",
      maxLength: null,
      nullable: false,
      defaultValue: null
    },
    parentId: {
      type: "integer",
      maxLength: null,
      nullable: true,
      defaultValue: null
    },
    firstName: {
      type: "varchar",
      maxLength: "255",
      nullable: true,
      defaultValue: null
    },
    lastName: {
      type: "varchar",
      maxLength: "255",
      nullable: true,
      defaultValue: null
    },
    age: {
      type: "integer",
      maxLength: null,
      nullable: true,
      defaultValue: null
    },
    address: {
      type: "text",
      maxLength: null,
      nullable: true,
      defaultValue: null
    }
  };
  let movies = {
    id: {
      type: "integer",
      maxLength: null,
      nullable: false,
      defaultValue: null
    },
    name: {
      type: "varchar",
      maxLength: "255",
      nullable: true,
      defaultValue: null
    }
  };
  let animals = {
    id: {
      type: "integer",
      maxLength: null,
      nullable: false,
      defaultValue: null
    },
    ownerId: {
      type: "integer",
      maxLength: null,
      nullable: true,
      defaultValue: null
    },
    name: {
      type: "varchar",
      maxLength: "255",
      nullable: true,
      defaultValue: null
    },
    species: {
      type: "varchar",
      maxLength: "255",
      nullable: true,
      defaultValue: null
    }
  };
  let personsMovies = {
    personId: {
      type: "integer",
      maxLength: null,
      nullable: true,
      defaultValue: null
    },
    movieId: {
      type: "integer",
      maxLength: null,
      nullable: true,
      defaultValue: null
    }
  };
  expect(JSON.stringify(personCols)).toEqual(JSON.stringify(persons));
  expect(JSON.stringify(movieCols)).toEqual(JSON.stringify(movies));
  expect(JSON.stringify(animalCols)).toEqual(JSON.stringify(animals));
  expect(JSON.stringify(personMovieCols)).toEqual(
    JSON.stringify(personsMovies)
  );
});
