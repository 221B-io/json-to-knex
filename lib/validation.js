module.exports = function validateColumn(col) {
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
  if (col.type === "enum" || col.type === "enu") {
    if (!col.values || !col.values.length) {
      throw "Column 'values' field must be a non-empty array of strings";
    }
    for (let i in col.values) {
      if (typeof col.values[i] !== "string") {
        throw "All values in column 'values' field must be strings";
      }
    }
    if (
      (col.default && col.values.indexOf(col.default) === -1) ||
      (col.defaultTo && col.values.indexOf(col.defaultTo) === -1)
    ) {
      throw "Default value is not one of the available enumerated choices for the enum column.";
    }
  }
  // TODO: warning if field named `id` is not the primary key?
};
