const builder = require('../index');

const Knex = require('knex');

const schema = {
  tables: [
    {
      name: 'persons',
      columns: [
        {
          name: 'id',
          type: 'increments',
          primary: true,
        },
        {
          name: 'parentId',
          type: 'integer',
          unsigned: true,
          references: 'id',
          inTable: 'persons',
          onDelete: 'SET NULL',
        },
        {
          name: 'firstName',
          type: 'string',
        },
        {
          name: 'lastName',
          type: 'string',
        },
        {
          name: 'age',
          type: 'integer',
        },
        {
          name: 'address',
          type: 'json',
        }
      ],
    },
    {
      name: 'movies',
      columns: [
        {
          name: 'id',
          type: 'increments',
          primary: true,
        },
        {
          name: 'name',
          type: 'string',
        }
      ],
    },
    {
      name: 'animals',
      columns: [
        {
          name: 'id',
          type: 'increments',
          primary: true,
        },
        {
          name: 'ownerId',
          type: 'integer',
          unsigned: true,
          references: 'id',
          inTable: 'persons',
          onDelete: 'SET NULL',
        },
        {
          name: 'name',
          type: 'string',
        },
        {
          name: 'species',
          type: 'string',
        }
      ]
    },
    {
      name: 'persons_movies',
      columns: [
        {
          name: 'id',
          primary: true,
        },
        {
          name: 'personId',
          type: 'integer',
          unsigned: true,
          references: 'id',
          inTable: 'persons',
          onDelete: 'CASCADE',
        },
        {
          name: 'movieId',
          type: 'integer',
          unsigned: true,
          references: 'id',
          inTable: 'movies',
          onDelete: 'CASCADE',
        },
      ],
    },
  ],
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