const builder = require("../index");
const _ = require("lodash");
const Knex = require("knex");

const schema = {
  persons: {
    id: {
      type: "increments",
      primary: true
    },
    parentId: {
      type: "integer",
      unsigned: true,
      references: "id",
      inTable: "persons",
      onDelete: "SET NULL"
    },
    firstName: "string",
    lastName: "string",
    age: "integer",
    address: "json"
  },
  movies: {
    id: {
      type: "increments",
      primary: true
    },
    name: "string"
  },
  animals: {
    id: {
      type: "increments",
      primary: true
    },
    ownerId: {
      type: "integer",
      unsigned: true,
      references: "id",
      inTable: "persons",
      onDelete: "SET NULL"
    },
    name: "string",
    species: "string"
  },
  persons_movies: {
    id: {
      type: "increments",
      primary: true
    },
    personId: {
      type: "integer",
      unsigned: true,
      references: "id",
      inTable: "persons",
      onDelete: "CASCADE"
    },
    movieId: {
      type: "integer",
      unsigned: true,
      references: "id",
      inTable: "movies",
      onDelete: "CASCADE"
    }
  }
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
beforeAll(() => {
  knex = Knex(knexConfig);
});
afterAll(() => {
  knex.destroy();
});
beforeEach(async () => {
  await builder.dropTablesIfExists(knex, schema);
});
afterEach(async () => {
  await builder.dropTablesIfExists(knex, schema);
});

test("successfully drops all tables", async () => {
  await builder.createTables(knex, schema);
  await builder.dropTablesIfExists(knex, schema);
  const empty = JSON.stringify({});

  expect(JSON.stringify(await knex("persons").columnInfo())).toEqual(empty);
  expect(JSON.stringify(await knex("movies").columnInfo())).toEqual(empty);
  expect(JSON.stringify(await knex("animals").columnInfo())).toEqual(empty);
  expect(JSON.stringify(await knex("persons_movies").columnInfo())).toEqual(
    empty
  );
});

test("successfully adds columns", async () => {
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
  await builder.createTables(knex, schema);
  let personCols = await knex("persons").columnInfo();
  let movieCols = await knex("movies").columnInfo();
  let animalCols = await knex("animals").columnInfo();
  let personMovieCols = await knex("persons_movies").columnInfo();
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
    id: {
      type: "integer",
      maxLength: null,
      nullable: false,
      defaultValue: null
    },
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
