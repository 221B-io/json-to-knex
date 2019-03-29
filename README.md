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
| nullable   | bool     | true    | Whether or not the column can be null                                                                                                                                                                                                                                                           |
| primary    | bool     | false   | Whether or not this is the primary key of the table                                                                                                                                                                                                                                             |
| unique     | bool     | false   | Whether or not the value is constrained to being unique                                                                                                                                                                                                                                         |
| unsigned   | bool     | false   | Applicable only to integers (TODO: not sure about this), whether or not the value is represented as a signed or unsigned integer.                                                                                                                                                               |
| inTable    | string   | null    | Required if `references` is specified. The name of the table referenced by this foreign key.                                                                                                                                                                                                    |
| references | string   | null    | The name of the column of table `inTable` referenced by this foreign key.                                                                                                                                                                                                                       |
| foreign    | string   | null    | Alias for `references`                                                                                                                                                                                                                                                                          |
| onDelete   | enum     | null    | If `references` is specified, specifies what happens to this item when the foreignkey record is deleted (values: "SET NULL", "CASCADE", "SET DEFAULT", "NO ACTION", "RESTRICT")                                                                                                                 |
| default    | string   | null    | Sets default value of column. For strings, include inner quotes, e.g. "'hello world'"                                                                                                                                                                                                           |
| defaultTo  | string   | null    | Alias for `default`                                                                                                                                                                                                                                                                             |
| index      | bool     | false   | If true, generates an index on this field named `${tableName}_${columnName}`                                                                                                                                                                                                                    |
| columns    | string[] | null    | Required if type == "index". Specifies the columns by name-as-string to include in the index formed by this column. (NOTE: `type: "index"` is different from `index: true`. The former adds a multi-column manually-named index and the latter adds a single-column, automatically-named index) |
| indexType  | string   | null    | If type == "index", and the database is postgres or MySQL, specifies the index type as outlined in the respective db's documentation.                                                                                                                                                           |
