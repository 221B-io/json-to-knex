// TODO: switch to postgres
const builder = require("../index");
const _ = require("lodash");
const Knex = require("knex");
const fs = require("fs");

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
