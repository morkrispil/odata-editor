# odata-editor
<a href="http://odata.org" target="_blank">OData</a> simple view &amp; edit javascript library (WIP).


In short, <a href="http://odata.org" target="_blank">OData</a> allows for full REST operations against some server "schema".

odata-editor makes your backoffice and admin table-data-entry easy as web :)
You'll need OData support on your server.

Key features:
* Read and process the original schema, including: entity and column properties, PKs and FKs
* Filter and enhance schema against a provided ui-schema
* Genreate an appropriate html table for either: read only or data entry
* Handles data entry and FKs validation according to the schema
* Handles REST operations: GET, POST, PATCH and DELETE
* Handles a simple user experience for the responses and errors
* 100% pure javascript

Simple usage:
* Provide an OData service uri
* Provide a ui-schema json (display names, read / write access and more)
* Provide an html container id, for the generated html

See the test page for a simple running example.
Looking for more contributers for enhancing and localization support :)

Supported types:
* Edm.Int16
* Edm.Int32
* Edm.String
* Edm.Boolean
* Edm.DateTime
* Edm.Decimal
* Edm.Double
* TODO: date time

Supportes languages:
* En
* He
* TODO: more


