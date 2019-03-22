const _ = require("lodash");

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
    // TODO: document this
    // https://knexjs.org/#Schema-index
    if (typeof value === "string") {
      return chain.index(value);
    } else if (typeof value === object && value && value.columns) {
      return chain.index(value.columns, value.indexName, value.indexType);
    } else {
      return chain;
    }
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
        if (_.has(types, column.type)) {
          // throw Error(`Column '${column.type}' of '${name}:${columnName}' is not of recognized type`)
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
