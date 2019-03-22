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
