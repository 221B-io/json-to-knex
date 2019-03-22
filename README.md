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
| key | values | default | description |
|-|-|-|-|
| name | camelCased string (e.g. "email" or "emailAddress") | none | column name in table
| type | "binary", "string", "text", "dateTime", "time", "date", "increments", "integer", "json", "index" | none | data type of column
| nullable | true or false | true | whether or not the column can be null
| primary | true or false | false | whether or not this is the primary key of the table
| unique |
| unsigned |
| foreign |
| references |
| inTable |
| onDelete |
| default |
| defaultTo |
| index |
