# JSON to Knex

## What it does

JSON to Knex dynamically creates tables by parsing a JSON structure into a series of chained knexjs functions using the input you specify.

## Examples

```js
const schema = {
  tables: [
    {
      name: "todo",
      columns: [
        {
          name: "userId",
          type: "integer",
          unsigned: true,
          references: "id",
          inTable: "users",
          onDelete: "SET NULL" // or e.g. "CASCADE"
          // all fields are null by default unless overridden
        },
        {
          name: "description",
          type: "string",
          default: ""
        },
        {
          name: "isDone",
          type: "boolean",
          default: false
        }
      ]
    }
  ]
};
```

will produce

```js
// todo: add transpiled knex here
```

For more examples, see `./examples`.

## Tests

To run the test suite, just type `npm test`

## Contributing

To contribute, feel free to submit PRs that fix issues presented in tickets. Please include a test that verifies that the issue has been solved.

## Documentation

A schema is always represented as:

```js
{
  tables: [
    {
      name: "items",
      columns: [
        {
          name: "foo", // whatever string you want, preferrable camelcase
          type: "bar" // 'string', 'boolean', etc
        }
      ]
    }
    // ...
  ];
}
```

Column objects have a variety of options that can be specified:

| key        | type     | default | description                                                                                                                                                                                                                                                                                     |
| ---------- | -------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Required   |          |         |                                                                                                                                                                                                                                                                                                 |
| name       | string   | null    | Required. Column name in table. Should be camelCased (e.g. "email" or "emailAddress")                                                                                                                                                                                                           |
| type       | enum     | null    | Required. Data type of column (possible values: "binary", "string", "text", "dateTime", "time", "date", "increments", "integer", "json", "index")                                                                                                                                               |
| Optional   |          |         |                                                                                                                                                                                                                                                                                                 |
| nullable   | bool     | true    | whether or not the column can be null                                                                                                                                                                                                                                                           |
| primary    | bool     | false   | whether or not this is the primary key of the table                                                                                                                                                                                                                                             |
| unique     | bool     | false   | whether or not the value is constrained to being unique                                                                                                                                                                                                                                         |
| unsigned   | bool     | false   | applicable only to integers(TODO: not sure about this), whether or not the value is represented as a signed or unsigned integer.                                                                                                                                                                |
| foreign    | bool     | false   | whether or not the column is a foreign key to another table                                                                                                                                                                                                                                     |
| inTable    | string   | null    | Required if foreign == true. The name of the table referenced by this foreign key.                                                                                                                                                                                                              |
| references | string   | null    | Required if foreign == true. The name of the column of table `inTable` referenced by this foreign key.                                                                                                                                                                                          |
| onDelete   | enum     | null    | if foreign == true, specifies what happens to this item when the foreignkey record is deleted (values: "SET NULL", "CASCADE", "SET DEFAULT", "NO ACTION", "RESTRICT")                                                                                                                           |
| default    | string   | null    | sets default value of column. For strings, include inner quotes, e.g. "'hello world'"                                                                                                                                                                                                           |
| defaultTo  | string   | null    | alias for `default`                                                                                                                                                                                                                                                                             |
| index      | bool     | false   | if true, generates an index on this field named `${tableName}_${columnName}`                                                                                                                                                                                                                    |
| columns    | string[] | null    | Required if type == "index". Specifies the columns by name-as-string to include in the index formed by this column. (NOTE: `type: "index"` is different from `index: true`. The former adds a multi-column manually-named index and the latter adds a single-column, automatically-named index) |
| indexType  | string   | null    | If type == "index", and the database is postgres or MySQL, specifies the index type as outlined in the respective db's documentation.                                                                                                                                                           |
