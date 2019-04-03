module.exports = {
  booksExample: {
    tables: [
      {
        name: "books",
        columns: [
          {
            name: "id",
            type: "increments"
          },
          { name: "title", type: "string", nullable: false },
          { name: "author", type: "string", index: true },
          { name: "yearPublished", type: "integer" },
          { name: "ISSN", type: "string", unique: true },
          {
            name: "personId", // borrowing the book
            type: "integer",
            unsigned: true
          },
          {
            foreign: "personId",
            references: "id",
            inTable: "persons",
            onDelete: "SET NULL"
          },
          {
            name: "idx",
            type: "index",
            columns: ["title", "author", "yearPublished"]
          }
        ]
      },
      {
        name: "libraries",
        columns: [
          {
            name: "id",
            type: "increments"
          },
          { name: "name", type: "string" },
          {
            name: "locationLatitude",
            type: "float"
          },
          {
            name: "locationLongitude",
            type: "float"
          }
        ]
      },
      {
        name: "booksLibraries",
        columns: [
          {
            name: "bookId", // borrowing the book
            type: "integer",
            unsigned: true
          },
          {
            foreign: "bookId",
            references: "id",
            inTable: "books",
            onDelete: "CASCADE"
          },
          {
            name: "libraryId", // borrowing the book
            type: "integer",
            unsigned: true
          },
          {
            foreign: "libraryId",
            references: "id",
            inTable: "libraries",
            onDelete: "CASCADE"
          }
        ]
      },
      {
        name: "persons",
        columns: [
          {
            name: "id",
            type: "increments"
          },
          { name: "firstName", type: "string" },
          { name: "lastName", type: "string" },
          { name: "born", type: "datetime" }
        ]
      }
    ]
  },
  booksExpected: {
    postgres: {
      indices: [
        {
          schemaname: "public",
          tablename: "books",
          indexname: "books_pkey",
          tablespace: null,
          indexdef:
            "CREATE UNIQUE INDEX books_pkey ON public.books USING btree (id)"
        },
        {
          schemaname: "public",
          tablename: "books",
          indexname: "books_author_index",
          tablespace: null,
          indexdef:
            "CREATE INDEX books_author_index ON public.books USING btree (author)"
        },
        {
          schemaname: "public",
          tablename: "books",
          indexname: "books_issn_unique",
          tablespace: null,
          indexdef:
            'CREATE UNIQUE INDEX books_issn_unique ON public.books USING btree ("ISSN")'
        },
        {
          schemaname: "public",
          tablename: "books",
          indexname: "idx",
          tablespace: null,
          indexdef:
            'CREATE INDEX idx ON public.books USING btree (title, author, "yearPublished")'
        },
        {
          schemaname: "public",
          tablename: "libraries",
          indexname: "libraries_pkey",
          tablespace: null,
          indexdef:
            "CREATE UNIQUE INDEX libraries_pkey ON public.libraries USING btree (id)"
        },
        {
          schemaname: "public",
          tablename: "persons",
          indexname: "persons_pkey",
          tablespace: null,
          indexdef:
            "CREATE UNIQUE INDEX persons_pkey ON public.persons USING btree (id)"
        }
      ],
      columns: {}
    }
  }
};
