/// <reference path="../jsapi_vsdoc10_v38.js"/>
function addPointLayer(results, layer) {
    if (map.getLayer(layer)) {
        
    } else {
        var fieldInfo = dojo.fromJson("[" + results[results.length - 1].FieldInfo + "]");
        var graphicLayer = new esri.layers.GraphicsLayer({ id: layer });
        graphicLayer.fieldInfo = fieldInfo[0];
        for (var i = 0; i < results.length - 1; i++) {
            var symbol = setOffenderSymbol(results[i].level);
            var pt = new esri.geometry.Point(results[i].lngFeet, results[i].latFeet, map.spatialReference);
            results[i].mapStatus = "existing";
            var graphic = new esri.Graphic(pt, symbol, results[i]);
            graphicLayer.add(graphic);
        }
        dojo.connect(graphicLayer, "onMouseOver", function (e) {
            map.setCursor("pointer");
        });
        dojo.connect(graphicLayer, "onMouseOut", function (e) {
            map.setCursor("default");
        });

        dojo.connect(graphicLayer, "onClick", function (e) {
            var layer = e.graphic.getLayer();
            selectedGraphic = e.graphic;
            if (dijit.byId('editToggler').checked){
                showEditorPopup(e, layer);
            } else {
                showInfoPopup(e);
            }
        });
        map.addLayer(graphicLayer);
    }
    dijit.byId('saveChanges').set('disabled', true);
    dijit.byId('deleteChanges').set('disabled', true);
}
function setOffenderSymbol(level) {
    //var level = results[i].level;
    var marker;
    switch (level) {
        case '1':
            marker = "SQUARE";
            break;
        case '2':
            marker = "CIRCLE";
            break;
        case '3':
            marker = "DIAMOND";
            break;
        default:
            marker = "SQUARE";
            break;
    }
    var symbol = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol["STYLE_" + marker], 20,
           new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID,
           new dojo.Color([(85 * level), 0, 0]), 1), new dojo.Color([0, 0, (85 * level), 0.25]));
    return symbol;
}
function offenderPanelHandler(sender) {
    var rr = document.getElementById('offenderEditPanel').style.display;
    var toggle = ((rr != 'none' && rr != '') ? true : false);
    var layer = map.getLayer('offenderLyr');
    
    if (toggle) {
        layer.setVisibility(toggle);

        document.getElementById('offenderEditPanel').style.display = '';
        dijit.byId('offender').set('checked', true);

    } else {
        if (confirmSaveEdits(sender)) {
            layer.setVisibility(toggle);

            document.getElementById('offenderEditPanel').style.display = 'none';
            dijit.byId('editToggler').set("checked", false);
            dijit.byId('addOffender').set("checked", false);
            offenderEditToolbar.deactivate();
            dijit.byId('offender').set('checked', false);
            document.getElementById('editorOptions').style.display = 'none';
        }
    }
}
function startEditingHandler(sender) {
    if (sender.checked) {
        document.getElementById('editorOptions').style.display = 'block';
    } else {
        if (confirmSaveEdits(sender)) {
            document.getElementById('editorOptions').style.display = 'none';
            offenderEditToolbar.deactivate();
        } else {
            sender.set('checked', true);
        }
    }
}
function changeOffenderInfo(vals) {
    var val = vals.split("::");
    var image = "";
    var info = dijit.byId('offenderInfo');
    var offInfo = "Offender ID: " + val[1] + "<br/>" + val[2] + " " + val[3] + "<br/>" + val[4] + " " + val[5] + "(Res) <br/>DOB: " + val[6];

    image = "<a dojoType='dojox.image.LightboxNano' href='offenderModule\\OffenderImages\\img_" + val[1] + ".jpg'><img alt='' title='Click To Enlarge' style='width:50px;' src='offenderModule\\OffenderImages\\img_" + val[1] + ".jpg'/></a>";
    
    var content = "<div class='closePanelButton' style='float:right; font-weight: bold; cursor:pointer;' onclick='dijit.popup.close();'>x</div>Sex Offender<hr>" +
                    "<table><tr><td>" + offInfo + "</td><td>" + image + "</td></tr></table>"
    info.setContent(content);
}
function confirmSaveEdits(ele) {
    var uCount = 0;
    var returnstring = true;
    var layer = map.getLayer('offenderLyr');
    var updateArray = [];
    //var insertArray = [];
    for (g = 0; g < layer.graphics.length; g++) {
        if (layer.graphics[g].attributes["mapStatus"] != "existing") {
            uCount++;
            break;
        }
    }
    if (uCount != 0) {
        var con = confirm("You have not saved all your edits.\n\rAre you sure you want to stop editing?\n\r\n\rYour edits will be maintained until you close your browser.");
        if (!con) {
            returnstring = false;
        }
    } 
    return returnstring;
}
function startEditing() {
    document.getElementById('offenderEditPanel').style.display = "block";

    if (!offenderEditToolbar) {
        offenderEditToolbar = new esri.toolbars.Draw(map);
        dojo.connect(offenderEditToolbar, "onDrawEnd", function (geom) {
            var graphicLayer, attr, title;
            offenderEditToolbar.deactivate();
            dijit.byId('addOffender').set('checked', false);
            
            var symbol = setOffenderSymbol(1);

            var params = new esri.tasks.ProjectParameters();
            params.geometries = [geom];
            params.outSR = new esri.SpatialReference({ wkid: 4326 });
            attr = { Name: "", level: '1', Address: "", Hamlet: "", Offender_ID: "", DateOfBirth: "", Image: "", ID: "", latFeet: geom.y, lngFeet: geom.x, mapStatus: "new" };

            var graphic = new esri.Graphic(geom, symbol, attr, null);
            var layer = map.getLayer('offenderLyr');
            if (!layer) {
                layer = new esri.layers.GraphicsLayer({ id: 'offenderLyr' });
                map.addLayer(layer);
            }
            layer.add(graphic);
            dijit.byId('saveChanges').set('disabled', false);
        });
    }
    dijit.popup.close();
}
function showInfoPopup(evt) {
    val = "Offender ID: " + evt.graphic.attributes['Offender_ID'] + "<br/>ID: " + evt.graphic.attributes['ID'] + "<br/>Name: " + evt.graphic.attributes['Name'] + "<br/>Address: " + evt.graphic.attributes['Address'] + " " + evt.graphic.attributes['Hamlet'] + "<br/>DOB: " + evt.graphic.attributes['DateOfBirth'] + "<br/>Level: " + evt.graphic.attributes['level'];
    image = "<a dojoType='dojox.image.LightboxNano' href='" + evt.graphic.attributes.Image + "'><img alt='' title='Click To Enlarge' style='width:50px;' src='" + evt.graphic.attributes.Image + "'/></a>";

    var t = "<div dojoType='dijit.layout.ContentPane' id='offenderInfo'  style='width:250px;'><div class='closePanelButton' style='float:right; font-weight: bold; cursor:pointer;' onclick='dijit.popup.close();'>x</div>Sex Offender<hr>" +
                "<table><tr><td>" + val + "</td><td>" + image + "</td></tr></table></div>";
                //+ "<br/>Others listed at this address <br/><select onchange=changeOffenderInfo(this.value)>" + links + "</select>";

    dialog.setContent(t);
    dojo.style(dialog.domNode, "opacity", 0.85);
    dijit.popup.open({ popup: dialog, x: evt.pageX, y: evt.pageY });
    dialog.focus();
}
function showEditorPopup(evt) {
    var t = "";
    var layer = evt.graphic.getLayer();
    var attr = evt.graphic.attributes;
    var pointX = evt.pageX;
    var pointY = evt.pageY;
    var table = document.createElement('table');
    table.style = 'width:85%;';
    for (var k in attr) {
        if (k != "mapStatus") {
            var rowCount = table.rows.length;
            var row = table.insertRow(rowCount);

            var cell1 = row.insertCell(0);
            cell1.innerHTML = k;
            var cell2 = row.insertCell(1);
            var element;

            var value = attr[k];
            var inputType;

            if (layer.fieldInfo[k] == "System.String" && k == "level") {
                var select = document.createElement('select');
                select.setAttribute('style', 'width:150px;');
                select.onchange = function (e) {
                    var graphic = (evt.graphic ? evt.graphic : evt);
                    var symbol = setOffenderSymbol(this.value);

                    graphic.setSymbol(symbol);
                    if (attr['mapStatus'] != "new") {
                        attr['mapStatus'] = "changed";
                    }
                    attr[e.srcElement.parentNode.parentNode.childNodes[0].innerHTML] = this.value;
                    dijit.byId('saveChanges').set('disabled', false);
                    graphic.attributes.level = this.value;
                }
                var optionList = [1, 2, 3];

                for (o = 0; o < optionList.length; o++) {
                    var option = document.createElement("option");
                    option.value = option.text = optionList[o];
                    if (optionList[o] == attr['Status']) {
                        option.selected = true;
                    }
                    select.add(option);
                }
                select.value = evt.graphic.attributes.level * 1;
                cell2.appendChild(select);
            } else if (layer.fieldInfo[k] == "System.String" && k != "Image") {
                inputType = new dijit.form.TextBox({
                    value: value,
                    style: 'width:125px;'
                }).placeAt(cell2);
            } else if (k == "Image" && evt.graphic.attributes.ID != "") {
                inputType = new dijit.form.Button({
                    label: "upload Image",
                    onClick: function (e) {
                        photos(evt.graphic.attributes.ID, layer);
                    }
                }).placeAt(cell2);
            } else if (k == "Image" && evt.graphic.attributes.ID == "") {
                inputType = new dijit.form.Button({
                    label: "upload Image",
                    disabled: true
                }).placeAt(cell2);
            } 
            else if (layer.fieldInfo[k] == "System.Int32" || layer.fieldInfo[k] == "System.Int16") {
                inputType = new dijit.form.NumberTextBox({
                    value: value,
                    style: 'width:125px;',
                    constraints: { pattern: "#" }
                }).placeAt(cell2);
            } else if (layer.fieldInfo[k] == "System.Double") {
                inputType = new dijit.form.NumberTextBox({
                    value: value,
                    style: 'width:125px;'
                }).placeAt(cell2);
            } else if (layer.fieldInfo[k] == "System.Single") {
                inputType = new dijit.form.NumberTextBox({
                    value: value,
                    style: 'width:125px;',
                    constraints: { pattern: "00.########" }
                }).placeAt(cell2);
            }
            else if (layer.fieldInfo[k] == "System.DateTime") {
                var date;
                if (attr[k] != "null" && attr[k] != null && attr[k] != "") {
                    date = new Date(jsonParse(attr[k]));
                } else {
                    date = null;
                }
                inputType = new dijit.form.DateTextBox({
                    value: date,
                    style: 'width:125px;'
                }).placeAt(cell2);
            }
            dojo.connect(inputType, "onChange", function (e) {
                attr[this.domNode.parentNode.parentNode.childNodes[0].innerHTML] = this.value;
                if (attr['mapStatus'] != "new") {
                    attr['mapStatus'] = "changed";
                }
                dijit.byId('saveChanges').set('disabled', false);
            });
            if (k == "ID" || k == "lat" || k == "lng" || k == "lngFeet" || k == "latFeet") {
                inputType.set('disabled', true);
            }
        } 
    }

    var mainDiv = document.createElement('div');
    mainDiv.setAttribute('style', 'width:250px;');
    //cant add documents unless the feature has been saved
    mainDiv.innerHTML = "<div class='closePanelButton' style='float:right; font-weight: bold; cursor:pointer;' onclick='dijit.popup.close();'>x</div>Sex Offender<hr>";

    var tableContainer = document.createElement('div');
    tableContainer.setAttribute('style', 'height:150px; overflow-y:scroll;');
    tableContainer.appendChild(table);

    mainDiv.appendChild(tableContainer);
    
    dijit.byId('deleteChanges').set('disabled', false);
    dialog.setContent(mainDiv);
    dojo.style(dialog.domNode, "opacity", 1);
    dijit.popup.open({ popup: dialog, x: pointX, y: pointY });

    dojo.connect(dialog, "onHide", function () {
        dijit.byId('deleteChanges').set('disabled', true);
    });
}
function photos(oid, layer) {
    dijit.popup.close();
        var dialog = new dojox.widget.Dialog({
            content: "<iframe style='height:95%; width:95%; overflow:hidden; border:none;' src='offenderModule/pictureDownload.aspx?oid=" + oid + "&&layer=" + layer.id + "'></iframe>",
            dimensions: [370, 390],
            title: "Upload Documents - Offender Level 1",
            showTitle: true
        });
        dialog.startup();
        dialog.show();
}
function saveChanges() {
    var layers = ["offenderLyr"];
    for (i = 0; i < layers.length; i++) {
        var layer = map.getLayer(layers[i]);
        var updateArray = [];
        var uCount = 0;
        for (g = 0; g < layer.graphics.length; g++) {
            if (layer.graphics[g].attributes["mapStatus"] != "existing") {
                updateArray[uCount] = dojo.toJson(layer.graphics[g].attributes);
                uCount++;
            } 
        }
        if (uCount != 0) {
            var updateString = "[" + updateArray.join(',') + "]";
            var updatedLayer = eval('(' + callASHX("getData.ashx?type=update&layer=" + layers[i] + "&vals=" + updateString) + ')');
            alert("Your Edits to: " + layers[i] + " Are Successful");
            map.removeLayer(layer);
            addPointLayer(updatedLayer, layers[i]);
        }
    }
    dijit.popup.close();
    dijit.byId('saveChanges').set('disabled', true);
}
function deleteChanges() {
    var con = confirm("Are you sure you want to remove this point?");
    if (con) {
        dijit.popup.close();
        var layer = selectedGraphic.getLayer();
        if (layer == "null") {
            alert('please try again');
        } else {
            if (selectedGraphic.attributes["mapStatus"] != "new") {
                var oid = selectedGraphic.attributes["ID"];
                var updatedLayer = eval('(' + callASHX("getData.ashx?type=delete&layer=" + layer.id + "&vals=" + oid) + ')');
                if (updatedLayer.val == true) {
                    alert('Deletes Successful');
                    layer.remove(selectedGraphic);
                } else {
                    alert(updatedLayer.val);
                }
            } else if (selectedGraphic.attributes["mapStatus"] == "new") {
                layer.remove(selectedGraphic);
            }
        }
        var uCount = 0;
        for (g = 0; g < layer.graphics.length; g++) {
            if (layer.graphics[g].attributes["mapStatus"] != "existing") {
                uCount++;
            }
        }
        if (uCount == 0) {
            dijit.byId('saveChanges').set('disabled', true);
        }
    } else {
        dijit.byId('deleteChanges').set('disabled', true);
    }
}
