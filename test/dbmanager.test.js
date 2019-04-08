const Manager = require("../lib/db-manager");
const Knex = require("knex");

const knexConfig = {
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

const knex = Knex(knexConfig);
const manager = Manager(knex);
