const _ = require("lodash");
const validateColumn = require("./validation");

const types = {
  binary: (table, name, options) => {
    return table.binary(name, options.length);
  },
  string: (table, name, options) => {
    return table.string(name, options.length);
  },
  text: (table, name, options) => {
    return table.text(name, options.textType);
  },
  dateTime: (table, name, options) => {
    return table.dateTime(name, options.precision);
  },
  time: (table, name, options) => {
    return table.time(name, options.precision);
  },
  date: (table, name) => {
    return table.date(name);
  },
  increments: (table, name) => {
    return table.increments(name);
  },
  integer: (table, name) => {
    return table.integer(name);
  },
  json: (table, name) => {
    return table.json(name);
  },
  index: (table, name, options) => {
    return table.index(options.columns, name, options.indexType);
  },
  bigInteger: (table, name) => {
    return table.bigInteger(name);
  },
  float: (table, name) => {
    return table.float(name);
  },
  decimal: (table, name) => {
    return table.decimal(name);
  },
  timestamps: (table, name) => {
    return table.timestamps(name);
  },
  enu: (table, name, options) => {
    return table.enu(name, options.values);
  },
  enum: (table, name, options) => {
    return table.enum(name, options.values);
  },
  jsonb: (table, name) => {
    return table.jsonb(name);
  },
  uuid: (table, name) => {
    return table.uuid(name);
  }
};

const typeProperties = {
  primary: (chain, value) => {
    if (value === true) {
      return chain.primary();
    }
    return chain;
  },
  unique: (chain, value) => {
    if (value === true) {
      return chain.unique();
    }
    return chain;
  },
  unsigned: (chain, value) => {
    if (value === true) {
      return chain.unsigned();
    }
    return chain;
  },
  foreign: (table, name) => {
    return table.foreign(name);
  },
  references: (chain, value) => {
    return chain.references(value);
  },
  inTable: (chain, value) => {
    return chain.inTable(value);
  },
  onDelete: (chain, value) => {
    return chain.onDelete(value);
  },
  default: (chain, value) => {
    return chain.defaultTo(value);
  },
  defaultTo: (chain, value) => {
    return chain.defaultTo(value);
  },
  nullable: (chain, value) => {
    return value ? chain.nullable() : chain.notNullable();
  },
  index: (chain, value) => {
    return value ? chain.index() : chain;
  }
};

function createTable(chain, name, schema) {
  // Usually start with knex.createTable....
  return chain.createTable(name, table => {
    const sawPrimary = false;

    _.forEach(schema.columns, column => {
      const columnName = column.name;
      // e.g., id: { type: "increments" }
      if (_.isPlainObject(column)) {
        validateColumn(column);
        if (_.has(types, column.type)) {
          let columnChain = types[column.type](table, columnName, column);
          const order = _.uniq(
            _.concat(
              ["primary", "type", "unsigned", "references", "inTable"],
              _.keys(column)
            )
          );
          _.forEach(order, columnPropertyName => {
            if (_.has(column, columnPropertyName)) {
              const columnProperty = column[columnPropertyName];
              if (_.has(typeProperties, columnPropertyName)) {
                columnChain = typeProperties[columnPropertyName](
                  columnChain,
                  columnProperty
                );
              }
            }
          });
        }
      } else {
        throw Error(
          `Column '${
            column.type
          }' of '${name}:${columnName}' is not of recognized type`
        );
      }
    });
  });
}

function createTables(knex, schema) {
  let chain = knex.schema;
  _.forEach(schema.tables, tableConfig => {
    const tableName = tableConfig.name;
    chain = createTable(chain, tableName, tableConfig);
  });
  return chain;
}

function dropTablesIfExists(knex, schema) {
  let chain = knex.schema;
  _.forEach(schema.tables, tableConfig => {
    const tableName = tableConfig.name;
    chain.dropTableIfExists(tableName);
  });
  return chain;
}

module.exports = {
  createTable,
  createTables,
  dropTablesIfExists
};
