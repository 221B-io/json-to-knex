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
  },
  index: (table, name, options) => {
    // this method is under construction currently
    console.log(`table: ${table}`);
    console.log(`name: ${name}`);
    console.log(`options: ${JSON.stringify(options, null, 2)}`);
    return table.index(options.columns, name, options.indexType);
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

function validateColumn(col) {
  if (!col.type) {
    throw "Column 'type' field is required but not defined";
  } else if (typeof col.type !== "string") {
    throw "Column 'type' field is not of type String";
  }
  if (!col.name) {
    throw "Column 'name' field is required but not defined";
  } else if (typeof col.name !== "string") {
    throw "Column 'name' field is required to be of type String but is not";
  }
  if (col.type === "index") {
    if (!col.columns) {
      throw "Column 'columns' field is required when column type is 'index'";
    } else if (typeof col.columns !== "object" || !col.columns.length) {
      throw "Column 'columns' field must be an array.";
    }
  }
  if (
    (col.inTable || col.onDelete || (col.references || col.foreign)) &&
    !(col.inTable && col.onDelete && (col.references || col.foreign))
  ) {
    throw "When a 'inTable', 'onDelete', or 'references/foreign' field is specified on a column, the other fields must be specified as well.";
  }
  if (col.type === "string" || col.type === "text") {
    if (
      (col.default && typeof col.default !== "string") ||
      (col.defaultTo && typeof col.defaultTo !== "string")
    ) {
      throw "Default value of string-based column must be a string";
    }
  }
  if (col.type === "integer") {
    if (
      (col.default && typeof col.default !== "number") ||
      (col.defaultTo && typeof col.defaultTo !== "number")
    ) {
      throw "Default value of numerical column must be a number";
    }
  }
  // TODO: warning if field named `id` is not the primary key?
}

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
