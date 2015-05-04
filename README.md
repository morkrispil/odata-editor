# odata-editor
**<a href="http://odata.org" target="_blank">OData</a> simple view &amp; edit javascript library (WIP).**


In short, <a href="http://odata.org" target="_blank">OData</a> allows for REST operations against a server "schema".

odata-editor makes your backoffice and admin table-data-entry easy as web :)
You'll need OData support on your server, obviously. The OData schema represents a database ORM or just an object model.
Some projects include:
* http://olingo.apache.org/
* https://code.google.com/p/odata4j/
* https://www.npmjs.com/package/odata-server
* https://msdn.microsoft.com/en-us/data/odata.aspx

Key features:
* Reading and processing of the server schema, including: entity and column properties, PKs and FKs
* Filtering and enhancing the schema using a provided ui-schema
* Genreating the appropriate html table for either read or write modes
* Handling data entry and FKs validation according to the server schema
* Handling REST operations: GET, POST, PATCH and DELETE
* Providing a simple user experience for the responses and errors
* 100% pure javascript

Simple usage:
* Provide an OData service uri
* Provide a ui-schema json (display names, read / write flags and more)
* Provide an html container id, for the generated html

```javascript
var uischema = {
  "Person" : {"text" : "people"}, //custom entity name
  "Product" : {"text" : "products", "readonly" : true}, //readonly flag
  "ProductDetail" : {} //all columns
}
var odata = odataEditor.init("path/to/base/odata/service", uischema);
odata.genTables("odataContainerDiv", "ProductDetail");
```

Check the included test page for a simple running example.

Supported types:
* Edm.Int16
* Edm.Int32
* Edm.String
* Edm.Boolean
* Edm.Decimal
* Edm.Double
* TODO: date time

Supportes languages:
* En
* He
* TODO: more

**I'm looking for contributors for enhancements and localization support :)**

