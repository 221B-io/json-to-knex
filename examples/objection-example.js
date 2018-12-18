const builder = require('../lib/builder');

const Knex = require('knex');

const schema = {
  persons: {
    id: {
      type: 'increments',
      primary: true,
    },
    parentId: {
      type: 'integer',
      unsigned: true,
      references: 'id',
      inTable: 'persons',
      onDelete: 'SET NULL',
    },
    firstName: 'string',
    lastName: 'string',
    age: 'integer',
    address: 'json',
  },
  movies: {
    id: {
      type: 'increments',
      primary: true,
    },
    name: 'string',
  },
  animals: {
    id: {
      type: 'increments',
      primary: true,
    },
    ownerId: {
      type: 'integer',
      unsigned: true,
      references: 'id',
      inTable: 'persons',
      onDelete: 'SET NULL',
    },
    name: 'string',
    species: 'string',
  },
  persons_movies: {
    id: {
      type: 'increments',
      primary: true,
    },
    personId: {
      type: 'integer',
      unsigned: true,
      references: 'id',
      inTable: 'persons',
      onDelete: 'CASCADE',
    },
    movieId: {
      type: 'integer',
      unsigned: true,
      references: 'id',
      inTable: 'movies',
      onDelete: 'CASCADE',
    },
  },
};

const knexConfig = {
  client: 'sqlite3',
  connection: { 
    filename: './dev.sqlite3',
  },
  useNullAsDefault: true,
  debug: true,
};

async function go() {
  let knex = Knex(knexConfig);
  await builder.dropTablesIfExists(knex, schema);
  await builder.createTables(knex, schema);
  knex.destroy();
}

go();