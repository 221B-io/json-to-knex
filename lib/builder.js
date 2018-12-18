const _ = require('lodash');

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
    if(value === true) {
      return chain.primary();
    }
    return chain;
  },
  unique: (chain, value) => {
    if(value === true) {
      return chain.unique();
    }
    return chain;
  },
  unsigned: (chain, value) => {
    if(value === true) {
      return chain.unsigned();
    }
    return chain;
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
};

function createTable(chain, name, schema) {
  // Usually start with knex.createTable....
  return chain.createTable(name, (table) => {
    const sawPrimary = false;
    
    _.forEach(schema, (column, columnName) => {
      // e.g., id: { type: "increments" }
      if(_.isString(column)) {
        // e.g., id: 'string' => table.string('id')
        if(!column in ['string', 'integer', 'increments']) {
          throw Error(`Column '${column}' for '${name}:${columnName}' is not of recognized type`)
        }
        table[column](columnName);
      } else if (_.isPlainObject(column)) {
        if(!_.has(types, column.type)) {
          throw Error(`Column '${column.type}' of '${name}:${columnName}' is not of recognized type`)
        }
        let columnChain = types[column.type](table, columnName, column);
        _.forEach(column, (columnProperty, columnPropertyName) => {
          if(_.has(typeProperties, columnPropertyName)) {
            columnChain = typeProperties[columnPropertyName](columnChain, columnProperty);
          }
        });
        // const orderedProperties = ['primary', 'unique', 'unsigned', 'references', 'inTable', 'onDelete', 'default', 'defaultsTo'];
        // _.forEach(orderedProperties, (propertyName) => {
        //   if(_.includes(column, propertyName)) {
        //     columnChain = typeProperties[propertyName](columnChain, column);
        //   }
        // });
      }
    });
  });
}

function createTables(knex, schema) {
  let chain = knex.schema;
  _.forEach(schema, (tableConfig, tableName) => {
    chain = createTable(chain, tableName, tableConfig);
  });
  return chain;
}

function dropTablesIfExists(knex, schema) {
  let chain = knex.schema;
  _.forEach(schema, (tableConfig, tableName) => {
    chain.dropTableIfExists(tableName)
  });
  return chain;
}

module.exports = {
  createTable,
  createTables,
  dropTablesIfExists,
};