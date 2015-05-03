﻿(
function () {
    var odataEditor = {
        version: "1.0.0"
    };

    //console.log stub
    if (typeof (console) == "undefined") {
        console = {
            log: function (message) {
                return;
            }
        };
    }

    var escapeHtml = function (s) {
        return s ? s
             .replace(/&/g, "&amp;")
             .replace(/</g, "&lt;")
             .replace(/>/g, "&gt;")
             .replace(/"/g, "&quot;")
             .replace(/'/g, "&#039;")
            : "";
    }

    var escapeJson = function (s) {
        return s ? s
            .replace(/\\n/g, "\\n")
            .replace(/\\'/g, "\\'")
            .replace(/\\"/g, '\\"')
            .replace(/\\&/g, "\\&")
            .replace(/\\r/g, "\\r")
            .replace(/\\t/g, "\\t")
            .replace(/\\b/g, "\\b")
            .replace(/\\f/g, "\\f")
            .replace(/\\/g, "\\\\")
            : "";
    }

    //xml to json snippet; http://davidwalsh.name/convert-xml-json; mit license
    var xmlToJson = function (xml) {
        // Create the return object
        var obj = {};

        if (xml.nodeType == 1) { // element
            // do attributes
            if (xml.attributes.length > 0) {
                obj["@attributes"] = {};
                for (var j = 0; j < xml.attributes.length; j++) {
                    var attribute = xml.attributes.item(j);
                    obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
                }
            }
        } else if (xml.nodeType == 3) { // text
            obj = xml.nodeValue;
        }

        // do children
        if (xml.hasChildNodes()) {
            for (var i = 0; i < xml.childNodes.length; i++) {
                var item = xml.childNodes.item(i);
                var nodeName = item.nodeName;

                //if (typeof (obj[nodeName]) == "undefined") {
                //    obj[nodeName] = xmlToJson(item);
                //} else {
                //    if (typeof (obj[nodeName].push) == "undefined") {
                //        var old = obj[nodeName];
                //        obj[nodeName] = [];
                //        obj[nodeName].push(old);
                //    }
                //    obj[nodeName].push(xmlToJson(item));
                //}

                //changed by mor: treat 1 and many nodes the same - as array item(s)
                if (!obj[nodeName]) {
                    obj[nodeName] = [];
                }
                obj[nodeName].push(xmlToJson(item));
            }
        }
        return obj;
    };

    var localization = {
        "en": {
            confirm_delete: "Delete?",
            confirm_update: "Update?",
            is_mandatory: " is mandatory",
            mandatory: "Mandatory field",
            max_length: "Max length ",
            created: "Successfully created",
            updated: "Successfully updated",
            deleted: "Successfully deleted",
            error_deleting: "Error deleting - ",
            in_use_in_table: " is in use in table ",
            invalid_number: " invalid number value ",
            insert_error_key: "Error, key exists",
            error: "Error occurred",
            add: "Add",
            delete: "Delete"
        },
        "he": {
            confirm_delete: "האם למחוק?",
            confirm_update: "האם לעדכן?",
            is_mandatory: " הוא שדה חובה",
            mandatory: "שדה חובה",
            max_length: "שדה באורך מקסימלי של ",
            created: "נוסף בהצלחה",
            updated: "עודכן בהצלחה",
            deleted: "נמחק בהמצלחה",
            error_deleting: "שגיאת מחיקה - ",
            in_use_in_table: " בשימוש בטבלת ",
            invalid_number: " ערך מספרי שגוי ",
            insert_error_key: "שגיאת הוספה - מפתח קיים",
            error: "ארעה שגיאה",
            add: "הוסף",
            delete: "מחק"
        }
    };

    var getLocalVal = function (key) {
        return localization[odataEditor.settings["lang"]][key] ? localization[odataEditor.settings["lang"]][key] : "N/A";
    }

    var methods = {
        insert: "POST",
        delete: "DELETE",
        update: "PATCH"
    };

    var editableInt = function (column, entry, andUpdate) {
        var uientity = odataEditor.uischema[column.EntityName];

        if (entry && column.__isPk || uientity.readonly) {
            return entry[column.Name];
        }

        var sb = [];

        sb.push("<input type=\"text\" id=\"");
        sb.push(getPkId(column, entry));
        sb.push("\" onchange=\"odataEditor.__validateInt(event, ");
        sb.push(andUpdate);
        sb.push(");\" ");

        if (entry != null) {
            sb.push("value=\"");
            sb.push(entry[column.Name]);
            sb.push("\"");
        }
        sb.push(uientity.readonly ? " disabled" : "");
        sb.push(">")

        return sb.join("");
    }

    var editableDecimal = function (column, entry, andUpdate) {
        var uientity = odataEditor.uischema[column.EntityName];

        if (entry && column.__isPk || uientity.readonly) {
            return parseFloat(entry[column.Name]).toFixed(2);
        }

        var sb = [];

        sb.push("<input type=\"text\" id=\"");
        sb.push(getPkId(column, entry));
        sb.push("\" onchange=\"odataEditor.__validateDecimal(event, ");
        sb.push(andUpdate);
        sb.push(");\" ");

        if (entry != null) {
            sb.push("value=\"");
            sb.push(parseFloat(entry[column.Name]).toFixed(2));
            sb.push("\"");
        }
        sb.push(uientity.readonly ? " disabled" : "");
        sb.push(">")

        return sb.join("");
    }

    var editableStr = function (column, entry, andUpdate) {
        var uientity = odataEditor.uischema[column.EntityName];

        if (entry && column.__isPk || uientity.readonly) {
            return entry[column.Name];
        }

        var sb = [];

        sb.push("<input type=\"text\" id=\"");
        sb.push(getPkId(column, entry));
        sb.push("\" onchange=\"odataEditor.__validateStr(event, ");
        sb.push(andUpdate);
        sb.push(");\" ");

        if (entry != null) {
            sb.push("value=\"");
            sb.push(escapeHtml(entry[column.Name]));
            sb.push("\"");
        }
        sb.push(uientity.readonly ? " disabled" : "");
        sb.push(">")

        return sb.join("");
    }

    var editableBoolean = function (column, entry, andUpdate) {
        var uientity = odataEditor.uischema[column.EntityName];
        var sb = [];

        sb.push("<input type=\"checkbox\" id=\"");
        sb.push(getPkId(column, entry));
        sb.push("\" onchange=\"odataEditor.__validateBoolean(event, ");
        sb.push(andUpdate);
        sb.push(");\" ");

        if (entry != null) {
            sb.push(entry[column.Name] == true ? "checked " : "");
        }
        sb.push(uientity.readonly ? " disabled" : "");
        sb.push(">")

        return sb.join("");
    }

    var editableDateTime = function (column, entry) {
        //TODO
        return entry != null ? entry[column.Name] : column.Name;
    }

    var stringifyIntBox = function (elm) {
        return elm.value;
    }

    var stringifyDecimalBox = function (elm) {
        return elm.value;
    }

    var stringifyTextBox = function (elm) {
        return escapeHtml(elm.value);
    }

    var stringifyCheckBox = function (elm) {
        return elm.checked;
    }

    var stringifyDateTimeBox = function (elm) {
        //TODO
        return elm.value;
    }

    var validators = {
        "Edm.Int16": validateInt,
        "Edm.Int32": validateInt,
        "Edm.String": validateStr,
        "Edm.Boolean": validateBoolean,
        "Edm.DateTime": validateDateTime,
        "Edm.Decimal": validateDecimal,
        "Edm.Double": validateDecimal
    }

    var editables = {
        "Edm.Int16": editableInt,
        "Edm.Int32": editableInt,
        "Edm.String": editableStr,
        "Edm.Boolean": editableBoolean,
        "Edm.DateTime": editableDateTime,
        "Edm.Decimal": editableDecimal,
        "Edm.Double": editableDecimal
    }

    var stringifiers = {
        "Edm.Int16": stringifyIntBox,
        "Edm.Int32": stringifyIntBox,
        "Edm.String": stringifyTextBox,
        "Edm.Boolean": stringifyCheckBox,
        "Edm.DateTime": stringifyDateTimeBox,
        "Edm.Decimal": stringifyDecimalBox,
        "Edm.Double": stringifyDecimalBox
    }

    var fkTables = {};

    var getEntityData = function (entityName) {
        var uientity = odataEditor.uischema[entityName];
        if (!uientity) {
            return null;
        }

        var xmlhttp = new XMLHttpRequest();
        var data = [];

        xmlhttp.open("GET", odataEditor.odataBaseUrl + "/" + uientity.SetName + "?$format=json", false);
        xmlhttp.send();
        data = xmlhttp.responseText;
        data = JSON.parse(xmlhttp.responseText);
        if (data && data.value) {
            data = data.value;
        }

        return data;
    }

    var restDelete = function (entityName, keys) {
        if (!confirm(getLocalVal("confirm_delete"))) {
            return;
        }

        var xmlhttp = getXhr("delete", entityName, keys);
        xmlhttp.onreadystatechange = function (event) {
            xhrDone(event.target, "delete", keys);
        };

        try {
            console.log("deleting from " + entityName + "..");
            document.body.style.cursor = "progress";
            xmlhttp.send();
        } catch (e) {
            console.log(e);
        }
    }

    var restUpdate = function (entityName, keys, data) {
        var xmlhttp = getXhr("update", entityName, keys);
        xmlhttp.onreadystatechange = function (event) {
            xhrDone(event.target, "update", keys, data);
        };

        try {
            console.log("editing " + entityName + "..");
            document.body.style.cursor = "progress";
            xmlhttp.send(JSON.stringify(data));
        } catch (e) {
            console.log(e);
        }
    }

    var restAdd = function (entityName, keys) {
        var data = {};

        var entity = odataEditor.uischema[entityName];
        for (var columnName in entity.columns) {
            var column = entity.columns[columnName];

            if (column.__readonly) {
                continue;
            }

            var elm = document.getElementById(entityName + "_" + columnName);
            if (!elm) {
                continue;
            }

            var value = stringifiers[column.Type](elm);

            if (value === "" && column.Nullable != "False") {
                alert(column.__text + getLocalVal("is_mandatory"));
                elm.focus();
                return;
            }

            data[columnName] = value;
        }

        var xmlhttp = getXhr("insert", entityName, keys);
        xmlhttp.onreadystatechange = function (event) {
            xhrDone(event.target, "insert", null, data);
        };

        try {
            console.log("adding new " + entityName + "..");
            document.body.style.cursor = "progress";
            xmlhttp.send(JSON.stringify(data));
        } catch (e) {
            console.log(e);
        }
    }

    var getXhr = function (method, entityName, keys) {
        var xmlhttp = new XMLHttpRequest();

        var sb = [];
        sb.push(odataEditor.odataBaseUrl);
        sb.push("/");
        sb.push(odataEditor.uischema[entityName].SetName);
        if (keys) {
            sb.push(serializeEntry(entityName, keys));
        }
        var url = sb.join("");
        //TODO: support backslashes in url natively using double encoding or other server-supported technology
        url = url.replace(/\\/g, "[BACKSLASH]");
        var url = encodeURI(url);

        xmlhttp.open(methods[method], url, true);
        xmlhttp.setRequestHeader("DataServiceVersion", "3.0;NetFx");
        xmlhttp.setRequestHeader("MaxDataServiceVersion", "3.0;NetFx");
        xmlhttp.setRequestHeader("Content-Type", "application/json;odata=minimalmetadata");
        xmlhttp.setRequestHeader("Accept", "application/json;odata=minimalmetadata");

        //allow CORS. In order to work, the server has to respond with CORS headers as well.
        xmlhttp.setRequestHeader("Access-Control-Allow-Origin", "*");
        xmlhttp.setRequestHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PATCH, DELETE, PUT");
        xmlhttp.setRequestHeader("Access-Control-Allow-Headers", "X-Requested-With");

        return xmlhttp;
    }

    var xhrDone = function (xmlhttp, verb, keys, data) {
        if (xmlhttp.readyState == 4) {
            console.log(xmlhttp.status + " - " + xmlhttp.statusText);

            xhrCbs[xmlhttp.status](verb, keys, data, xmlhttp);

            document.body.style.cursor = "default";
        }
    }

    //201 - created
    var createdCb = function (verb, keys, data, xmlhttp) {
        odataEditor.genTables(odataEditor.containerId, odataEditor.currentEntityName);
        alert(getLocalVal("created"));
    }

    //204 - no content, for deleted and updated
    var noContentCb = function (verb, keys, data, xmlhttp) {
        xhrCbs[verb](verb, keys, data, xmlhttp);
    }

    var deletedCb = function (verb, keys, data, xmlhttp) {
        var sb = [];
        for (var pkName in keys) {
            sb.push(keys[pkName]);
            sb.push("_");
        }
        sb.pop();
        var tr = document.getElementById(sb.join(""));
        tr.parentElement.removeChild(tr);

        alert(getLocalVal("deleted"));
    }

    var updatedCb = function (verb, keys, data, xmlhttp) {
        alert(getLocalVal("updated"));
    }

    var insertCb = function (verb, keys, data, xmlhttp) {
        alert(getLocalVal("created"));
    }

    var badReqCb = function (verb, keys, data, xmlhttp) {
        console.log("got bad request 400 for keys " + JSON.stringify(keys) + " and data " + JSON.stringify(data));
    }

    var serverErrCb = function (verb, keys, data, xmlhttp) {
        console.log("got server error 500 for keys " + JSON.stringify(keys) + " and data " + JSON.stringify(data));

        if (xmlhttp.responseText.indexOf("DELETE statement conflicted with the REFERENCE constraint") != -1) {
            //delete fk conflict
            var tableNameInd = xmlhttp.responseText.indexOf("table");
            var columnNameInd = xmlhttp.responseText.indexOf("column");
            var endInd = xmlhttp.responseText.indexOf("The statement has been terminated");

            var tableName = xmlhttp.responseText.substring(tableNameInd, columnNameInd);
            tableName = tableName.replace("table", "").replace(/\\"/g, "").replace(",", "").replace("dbo.", "").trim();
            //last 's'
            tableName = tableName.replace(/s$/, "");
            var columnName = xmlhttp.responseText.substring(columnNameInd, endInd);
            columnName = columnName.replace("column", "").replace(/\\r\\n/g, "").replace(/\./g, "").replace(/'/g, "").trim();

            var entity = odataEditor.uischema[tableName];
            var column = entity.columns[columnName];
            alert(getLocalVal("error_deleting") + column.__text + getLocalVal("in_use_in_table") + entity.text);
        }
        else if (xmlhttp.responseText.indexOf("Cannot insert duplicate key") != -1) {
            //insert duplicate pk-s
            var tableNameInd = xmlhttp.responseText.indexOf("Cannot insert duplicate key in object") + 37;
            var endInd = xmlhttp.responseText.indexOf(". The duplicate key");

            var tableName = xmlhttp.responseText.substring(tableNameInd, endInd);
            tableName = tableName.replace("table", "").replace(/\\"/g, "").replace(/'/g, "").replace("dbo.", "").trim();
            //last 's'
            tableName = tableName.replace(/s$/, "");

            var entity = odataEditor.uischema[tableName];
            var sb = [];
            sb.push(getLocalVal("insert_error_key"));
            sb.push(" [");
            for (var keyName in entity.keys) {
                sb.push(entity.columns[keyName].__fk ? entity.columns[keyName].__fk.__descColumn.__text : entity.columns[keyName].__text);
                sb.push(", ");
            }
            sb.pop();
            sb.push("]");
            alert(sb.join(""));
        }
    }

    var notAllowedCb = function (verb, keys, data, xmlhttp) {
        console.log("got method not allowed 405 for keys " + JSON.stringify(keys) + " and data " + JSON.stringify(data));
        alert(getLocalVal("error"));
    }

    var conflictCb = function (verb, keys, data, xmlhttp) {
        console.log("got conflict 409 for keys " + JSON.stringify(keys) + " and data " + JSON.stringify(data));
        var response = JSON.parse(xmlhttp.response);
        if (response && response["odata.error"]) {
            alert(response["odata.error"].message.value);
        }

        //reload. TODO: rollback just updated row
        odataEditor.genTables(odataEditor.containerId, odataEditor.currentEntityName);
    }

    var genErrorCb = function (verb, keys, data, xmlhttp) {
        console.log("got general error 0 for keys " + JSON.stringify(keys) + " and data " + JSON.stringify(data));
        alert(getLocalVal("error"));
    }

    var xhrCbs = {
        201: createdCb,
        204: noContentCb,
        400: badReqCb,
        404: badReqCb,
        500: serverErrCb,
        405: notAllowedCb,
        409: conflictCb,
        0: genErrorCb,
        "delete": deletedCb,
        "update": updatedCb,
        "insert": insertCb
    }

    var serializeEntry = function (entityName, keys) {
        var uientity = odataEditor.uischema[entityName];

        var sb = [];
        sb.push("(");
        for (var keyName in keys) {
            sb.push(keyName);
            sb.push("=");
            sb.push(["Edm.Int32", "Edm.Decimal"].indexOf(uientity.keys[keyName].Type) == -1 ? "'" : "");
            sb.push(keys[keyName]);
            sb.push(["Edm.Int32", "Edm.Decimal"].indexOf(uientity.keys[keyName].Type) == -1 ? "'" : "");
            sb.push(",");
        }
        sb.pop();
        sb.push(")");

        return sb.join("");
    }

    var parseEvent = function (event) {
        var parsed = {
            event: event,
            target: event.target || event.srcElement,
            preventDefault: function () {
                if (this.event.preventDefault) {
                    try {
                        this.event.preventDefault()
                    }
                    catch (e) {
                        console.log(e);
                    }
                }
                return false;
            }
        };

        parsed.args = parsed.target.id.split("_");
        parsed.entityName = parsed.args[0];
        parsed.columnName = parsed.args[1];
        parsed.entity = odataEditor.uischema[parsed.entityName];
        parsed.column = parsed.entity.columns[parsed.columnName];

        return parsed;
    }

    var validateInt = function (event, andUpdate) {
        var parsed = parseEvent(event);

        if ((parsed.target.value === "" && parsed.column.Nullable != "False") || isNaN(parsed.target.value) || parseInt(parsed.target.value) != parseFloat(parsed.target.value)) {
            alert(getLocalVal("invalid_number"));
            parsed.target.value = parsed.target.defaultValue;
            parsed.target.focus();
            parsed.preventDefault();
            return false;
        }

        if (andUpdate) {
            if (!confirm(getLocalVal("confirm_update"))) {
                parsed.target.value = parsed.target.defaultValue;
                parsed.target.focus();
                parsed.preventDefault();
                return false;
            }

            var keys = {};
            var ind = 2;
            for (var keyName in parsed.entity.keys) {
                keys[keyName] = parsed.args[ind];
                ind++;
            }

            var data = {};
            data[columnName] = parsed.target.value;

            restUpdate(parsed.entityName, keys, data);
        }
    }

    var validateDecimal = function (event, andUpdate) {
        var parsed = parseEvent(event);

        if ((parsed.target.value === "" && parsed.column.Nullable != "False") || isNaN(parsed.target.value)) {
            alert(getLocalVal("invalid_number"));
            parsed.target.value = parsed.target.defaultValue;
            parsed.target.focus();
            parsed.preventDefault();
            return false;
        }

        if (andUpdate) {
            if (!confirm(getLocalVal("confirm_update"))) {
                parsed.target.value = parsed.target.defaultValue;
                parsed.target.focus();
                parsed.preventDefault();
                return false;
            }

            var keys = {};
            var ind = 2;
            for (var keyName in parsed.entity.keys) {
                keys[keyName] = parsed.args[ind];
                ind++;
            }

            var data = {};
            data[parsed.columnName] = parsed.target.value;

            restUpdate(parsed.entityName, keys, data);
        }
    }

    var validateStr = function (event, andUpdate) {
        var parsed = parseEvent(event);

        if (parsed.target.value === "" && parsed.column.Nullable != "False") {
            alert(getLocalVal("mandatory"));
            parsed.target.value = parsed.target.defaultValue;
            parsed.target.focus();
            parsed.preventDefault();
            return false;
        }

        if (parsed.column.MaxLength && parsed.target.value.length > parsed.column.MaxLength) {
            alert(getLocalVal("max_length") + parsed.column.MaxLength);
            parsed.target.value = parsed.target.defaultValue;
            parsed.target.focus();
            parsed.preventDefault();
            return false;
        }

        if (andUpdate) {
            if (!confirm(getLocalVal("confirm_update"))) {
                parsed.target.value = parsed.target.defaultValue;
                parsed.target.focus();
                parsed.preventDefault();
                return false;
            }

            var keys = {};
            var ind = 2;
            for (var keyName in parsed.entity.keys) {
                keys[keyName] = parsed.args[ind];
                ind++;
            }

            var data = {};
            data[parsed.columnName] = parsed.target.value;

            restUpdate(parsed.entityName, keys, data);
        }
    }

    var validateDateTime = function () {
        //TODO
    }

    var validateFk = function (event, andUpdate) {
        var parsed = parseEvent(event);

        if (andUpdate) {
            if (!confirm(getLocalVal("confirm_update"))) {
                //no native support for previous value
                parsed.target.selectedIndex = parsed.target.lastSelectedIndex;
                parsed.target.focus();
                parsed.preventDefault();
                return false;
            }
            parsed.target.lastSelectedIndex = parsed.target.selectedIndex;

            var keys = {};
            var ind = 2;
            for (var keyName in parsed.entity.keys) {
                keys[keyName] = parsed.args[ind];
                ind++;
            }

            var data = {};
            data[parsed.columnName] = parsed.target.children[parsed.target.selectedIndex].value;

            restUpdate(parsed.entityName, keys, data);
        }
    }

    var validateBoolean = function (event, andUpdate) {
        var parsed = parseEvent(event);

        if (andUpdate) {
            if (!confirm(getLocalVal("confirm_update"))) {
                //no native support for previous value
                parsed.target.checked = !parsed.target.checked;
                parsed.target.focus();
                parsed.preventDefault();
                return false;
            }

            var keys = {};
            var ind = 2;
            for (var keyName in parsed.entity.keys) {
                keys[keyName] = parsed.args[ind];
                ind++;
            }

            var data = {};
            data[parsed.columnName] = parsed.target.checked ? true : false;

            restUpdate(parsed.entityName, keys, data);
        }
    }

    var getPkId = function (column, entry) {
        var uientity = odataEditor.uischema[column.EntityName];
        var sb = [];

        sb.push(column.EntityName);
        sb.push("_");
        sb.push(column.Name);
        if (entry != null) {
            sb.push("_");
            for (var keyName in uientity.keys) {
                sb.push(entry[keyName]);
                sb.push("_");
            }
            sb.pop();
        }

        return sb.join("");
    }

    //outputs an editable ui for an existing or new entry
    var editableFk = function (column, entry, andUpdate) {
        var uientity = odataEditor.uischema[column.EntityName];
        var fkTable = fkTables[column.__fk.Name];

        if (entry && (column.__isPk || uientity.readonly)) {
            return fkTable[entry[column.Name]];
        }

        var sb = [];

        sb.push("<select id=\"");
        sb.push(getPkId(column, entry));
        sb.push("\" onchange=\"odataEditor.__validateFk(event, ");
        sb.push(andUpdate);
        sb.push(");\"");
        sb.push(uientity.readonly ? " disabled" : "");
        sb.push(">")

        for (var key in fkTable) {
            var value = fkTable[key];

            sb.push("<option value=\"");
            sb.push(key);
            sb.push("\"");
            sb.push((entry != null && entry[column.Name] == key) ? " selected" : "");
            sb.push(">");
            sb.push(value);
            sb.push("</option>");
        }
        sb.push("</select>");

        return sb.join("");
    }

    //"private" exposed function for ui events
    odataEditor.__restDelete = restDelete;
    odataEditor.__restAdd = restAdd;
    odataEditor.__validateFk = validateFk;
    odataEditor.__validateBoolean = validateBoolean;
    odataEditor.__validateDateTime = validateDateTime;
    odataEditor.__validateDecimal = validateDecimal;
    odataEditor.__validateInt = validateInt;
    odataEditor.__validateStr = validateStr;

    odataEditor.set = function (key, val) {
        odataEditor.settings[key] = val;
    }

    odataEditor.init = function (odataBaseUrl, uischema) {
        odataEditor.settings = { lang: "en" };

        odataEditor.odataBaseUrl = odataBaseUrl;
        odataEditor.uischema = uischema;

        var xmlhttp = new XMLHttpRequest();
        var data = null;

        xmlhttp.open("GET", odataBaseUrl + "/$metadata", false);
        xmlhttp.send();
        data = xmlToJson(xmlhttp.responseXML);

        odataEditor.namespace = data["edmx:Edmx"][0]["edmx:DataServices"][0].Schema[0]["@attributes"].Namespace;

        var entities = data["edmx:Edmx"][0]["edmx:DataServices"][0].Schema[0].EntityType;
        //entity-name to entity dic
        var entitiesDic = {};
        for (var i = 0; i < entities.length; i++) {
            entitiesDic[entities[i]["@attributes"].Name] = entities[i];
        }

        //some services put entity set data in a different schema tag
        var entitySets = data["edmx:Edmx"][0]["edmx:DataServices"][0].Schema[0].EntityContainer ? data["edmx:Edmx"][0]["edmx:DataServices"][0].Schema[0].EntityContainer[0].EntitySet : data["edmx:Edmx"][0]["edmx:DataServices"][0].Schema[1].EntityContainer[0].EntitySet;

        //entity-name to entity-set dic
        var entitySetDic = {};
        for (var i = 0; i < entitySets.length; i++) {
            entitySetDic[entitySets[i]["@attributes"].EntityType.replace(odataEditor.namespace + ".", "")] = entitySets[i];
        }

        //remove non-sets entities from uischema - currently handling entity set types only
        var keysToRemove = [];
        for (var uiEntityName in odataEditor.uischema) {
            if (!entitySetDic[uiEntityName]) {
                keysToRemove.push(uiEntityName);
            }
        }
        for (var i = 0; i < keysToRemove.length; i++) {
            delete odataEditor.uischema[keysToRemove[i]];
        }

        for (var i = 0; i < entitySets.length; i++) {
            var entitySet = entitySets[i];
            var entitySetName = entitySet["@attributes"].Name;

            var entityName = entitySet["@attributes"].EntityType.replace(odataEditor.namespace + ".", "");
            var entity = entitiesDic[entityName];
            var uientity = odataEditor.uischema[entityName];

            //irrelevant entity
            if (!uientity) {
                continue;
            }

            uientity.Name = entityName;
            uientity.SetName = entitySetName;

            //default text
            if (!uientity.text) {
                uientity.text = entityName;
            }

            //fill column properties
            var allColumns = !uientity.columns;
            for (var j = 0; j < entity.Property.length; j++) {
                var prop = entity.Property[j];

                //irrelevant column
                //no columns = *
                if (!allColumns && !uientity.columns[prop["@attributes"].Name]) {
                    continue;
                }

                uientity.columns = uientity.columns || {};

                var columnName = prop["@attributes"].Name;
                var uicolumn = uientity.columns[columnName] ? uientity.columns[columnName] : {};
                uicolumn.EntityName = entityName;

                //default text
                if (!uicolumn.__text) {
                    uicolumn.__text = columnName;
                }

                for (var att in prop["@attributes"]) {
                    //irrelevant column attributes
                    if (["__proto__", "p6:StoreGeneratedPattern", "xmlns:p6"].indexOf(att) != -1) {
                        continue;
                    }

                    uicolumn[att] = prop["@attributes"][att];
                }

                uientity.columns[columnName] = uientity.columns[columnName] || uicolumn;
            }

            //pk-s
            uientity.keys = {};
            for (var j = 0; j < entity.Key[0].PropertyRef.length; j++) {
                var pkName = entity.Key[0].PropertyRef[j]["@attributes"].Name;

                uientity.columns[pkName].__isPk = true;
                uientity.keys[pkName] = uientity.columns[pkName];
            }
        }

        //fk-s
        var fks = data["edmx:Edmx"][0]["edmx:DataServices"][0].Schema[0].Association;
        if (fks) {
            for (var i = 0; i < fks.length; i++) {
                if (!fks[i].ReferentialConstraint) {
                    continue;
                }

                var fk = fks[i].ReferentialConstraint[0];

                //entity not in ui schema
                var depEntity = odataEditor.uischema[fk.Dependent[0]["@attributes"].Role];
                if (!depEntity) {
                    continue;
                }

                var dependent = depEntity.columns[fk.Dependent[0].PropertyRef[0]["@attributes"].Name];
                //column not in ui schema
                if (!dependent) {
                    continue;
                }

                var princEntity = odataEditor.uischema[fk.Principal[0]["@attributes"].Role];
                //entity not in ui schema
                if (!princEntity) {
                    continue;
                }

                var principal = princEntity.columns[fk.Principal[0].PropertyRef[0]["@attributes"].Name];
                //column not in ui schema
                if (!principal) {
                    continue;
                }

                dependent.__fk = principal;

                if (principal.__descColumnName) {
                    principal.__descColumn = princEntity.columns[principal.__descColumnName];
                }

                depEntity.__fks = depEntity.__fks || {};
                depEntity.__fks[principal.Name] = principal;
            }
        }

        return odataEditor;
    }

    odataEditor.genTables = function (containerId, entityName) {
        odataEditor.containerId = containerId;
        odataEditor.currentEntityName = entityName;

        var uientity = odataEditor.uischema[entityName];
        var sb = [];

        //fk temp tables
        fkTables = {};
        for (var fkName in uientity.__fks) {
            var fk = uientity.__fks[fkName];

            //keep an id->desc dic
            fkTables[fk.Name] = {};
            var data = getEntityData(fk.EntityName);
            for (var i = 0; i < data.length; i++) {
                var entry = data[i];

                fkTables[fk.Name][entry[fk.Name]] = entry[fk.__descColumn.Name];
            }
        }

        //draw data entry table
        if (!uientity.readonly) {
            sb.push("<table border=\"1\">");

            //header
            sb.push("<thead>");
            for (var columnName in uientity.columns) {
                var column = uientity.columns[columnName];

                if (column.__readonly || !editables[column.Type]) {
                    continue;
                }

                sb.push("<th>");
                sb.push(column.__fk ? column.__fk.__descColumn.__text : column.__text);
                sb.push("</th>");
            }
            sb.push("<th></th></thead>");

            //body
            sb.push("<tbody>");
            for (var columnName in uientity.columns) {
                var column = uientity.columns[columnName];

                //readonly or unsupported types
                if (column.__readonly || !editables[column.Type]) {
                    continue;
                }

                sb.push("<td>");
                var editable = column.__fk ? editableFk : editables[column.Type];

                var andUpdate = false;
                sb.push(editable(column, null, andUpdate));
                sb.push("</td>");
            }

            sb.push("<td>");
            sb.push("<a href=\"javascript:odataEditor.__restAdd('");
            sb.push(entityName);
            sb.push("');\">");
            sb.push(getLocalVal("add"));
            sb.push("</a>");
            sb.push("</td>");
            sb.push("</tbody></table>");
        }

        //draw data table
        sb.push("<table border=\"1\">");

        //header
        sb.push("<thead>");
        if (!uientity.readonly) {
            sb.push("<th>");
            //sb.push();
            sb.push("</th>");
        }

        for (var columnName in uientity.columns) {
            var column = uientity.columns[columnName];

            if (!editables[column.Type]) {
                continue;
            }

            sb.push("<th>");
            sb.push(column.__fk ? column.__fk.__descColumn.__text : column.__text);
            sb.push("</th>");
        }
        sb.push("</thead>");

        //body
        sb.push("<tbody>");
        var data = getEntityData(entityName);
        for (var i = 0; i < data.length; i++) {
            var entry = data[i];
            sb.push("<tr id=\"");
            for (var pkName in uientity.keys) {
                sb.push(entry[pkName]);
                sb.push("_");
            }
            sb.pop();
            sb.push("\">");

            //delete link
            if (!uientity.readonly) {
                sb.push("<td>");
                sb.push("<a href=\"javascript:odataEditor.__restDelete('");
                sb.push(entityName);
                sb.push("', {");
                for (var pkName in uientity.keys) {
                    sb.push(pkName)
                    sb.push(": ");
                    sb.push(["Edm.Int32", "Edm.Decimal"].indexOf(uientity.keys[pkName].Type) == -1 ? "'" : "");
                    sb.push(["Edm.Int32", "Edm.Decimal"].indexOf(uientity.keys[pkName].Type) == -1 ? escapeJson(entry[pkName]) : entry[pkName]);
                    //sb.push(entry[pkName]);
                    sb.push(["Edm.Int32", "Edm.Decimal"].indexOf(uientity.keys[pkName].Type) == -1 ? "'" : "");
                    sb.push(", ");
                }
                sb.pop();
                sb.push("});\">");
                sb.push(getLocalVal("delete"));
                sb.push("</a>");
                sb.push("</td>");
            }

            //editable fields
            for (var columnName in uientity.columns) {
                var column = uientity.columns[columnName];

                //readonly or unsupported types
                if (!column || !editables[column.Type]) {
                    continue;
                }

                //format according to column type (fk, pk or other value-type)
                sb.push("<td>");
                if (column.__readonly || column.__isPk) {
                    sb.push(column.__fk ? fkTables[column.__fk.Name][entry[column.Name]] : entry[column.Name]);
                }
                else {
                    var editable = column.__fk ? editableFk : editables[column.Type];

                    var andUpdate = true;
                    sb.push(editable(column, entry, andUpdate));
                }
                sb.push("</td>");
            }
            sb.push("</tr>");
        }
        sb.push("</tbody>");

        document.getElementById(containerId).innerHTML = sb.join("");

        //fix lastSelectedIndex initial property in select boxes
        //TODO: just for above select boxes
        var selects = document.getElementsByTagName("select");
        for (var i = 0; i < selects.length; i++) {
            var select = selects[i];
            select.lastSelectedIndex = select.selectedIndex;
        }
    }

    this.odataEditor = odataEditor;
})();