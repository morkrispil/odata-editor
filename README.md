# odata-editor
**<a href="http://odata.org" target="_blank">OData</a> simple view &amp; edit javascript library (WIP).**


In short, <a href="http://odata.org" target="_blank">OData</a> allows for REST operations against a server "schema".

odata-editor makes your backoffice and admin table-data-entry easy as web :)
You'll need OData support on your server, obviously. The OData schema represents a database ORM or just an object model.
Some projects include:
* <a href="http://olingo.apache.org/" target="_blank">olingo.apache.org</a>
* <a href="https://code.google.com/p/odata4j/" target="_blank">odata4j</a>
* <a href="https://www.npmjs.com/package/odata-server" target="_blank">nodejs</a>
* <a href="https://msdn.microsoft.com/en-us/data/odata.aspx" target="_blank">wcf odata</a>

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
	Person : { text : "people", orderby : "Name desc", top : 2, filter : "ID gt 0" }, //using orderby, top and filter
	Product : { text : "products", readonly : true }, //readonly entity
	ProductDetail : { columns : { //column selection and specification
						ProductID : { text: "Product Code", readonly: true }},
                    custom: {
                        cancelOrder: { text: "click to cancel", confirm: "cancel order?", uri: "handlers/cancelorder", cb: cancelOrderCb }
                    }
	}
};
odataEditor.init("http://services.odata.org/V3/(S(05q5qkboemohigishovrhcxi))/OData/OData.svc", uischema);
odataEditor.genTables("odataContainerDiv", "ProductDetail");
```

Check the included test page for a simple running example.

Advanced features:
* Custom handlers columns
* Custom html columns
* Verb tunneling, substituting DELETE, PUT, PATCH and MERGE for POST, using X-HTTP-Method header. (for blocking servers / FWs)
* secondary sort by fk column. Currently limited to 1 column ascending


Supported types:
* Edm.Int16
* Edm.Int32
* Edm.String
* Edm.Boolean
* Edm.Decimal
* Edm.Double
* Edm.DateTime

Supportes languages:
* En
* He
* TODO: more

**I'm looking for contributors for enhancements and localization support :)**

