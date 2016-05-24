function collapse(id) {
    var el = document.getElementById(id);
    if (el.style.display == "block") {
        document.getElementById(id).style.display = 'none';
        document.getElementById(id + "Img").src = 'Images/expand_icon.gif';
    } else {
        document.getElementById(id).style.display = 'block';
        document.getElementById(id + "Img").src = 'Images/collapse_icon.gif';     
    }
}
function updateLayerVisibility(id, ele) {
    //this function makes the property addresses visible
    //the settings checkbox is syncronized with the legend checkbox
    
    var visible = map.getLayer("lmCore").visibleLayers;
    if (ele.checked) {
        if (dojo.indexOf(visible, id) == -1) {
            visible.push(id);
        }
        document.getElementById("layer" + id).children[0].checked = true;
    } else {
        document.getElementById("layer" + id).children[0].checked = false;
        if (dojo.indexOf(visible, id) != -1) {
            visible.splice(dojo.indexOf(visible, id), 1);
        }
    }
    map.getLayer("lmCore").setVisibleLayers(visible);
}
function toggleAerials(value) {
    var element1 = document.createElement("input");
    element1.type = "checkbox";
    if (value == "al") {
        map._layers.layer0.show();
        map._layers.layer1.show();
        element1.checked = true;
        updateLayerVisibility('20', element1);
        element1.checked = false;
        updateLayerVisibility('27', element1);
    } else {
        map._layers.layer0.hide();
        map._layers.layer1.show();
        element1.checked = false;
        updateLayerVisibility('20', element1);
        element1.checked = true;
        updateLayerVisibility('27', element1);
    }
}
function exportList() {
    var table = document.getElementById("results");
    var radioList = dojo.query('input:checked', 'results');
    for (i = 0; i < radioList.length; i++) {
        var feature = document.getElementById('h' + radioList[i].id);
        var val = eval('('+ feature.value +')');
    }
}
function getData(id) {
    dojo.byId('p_id').value = id;
}
function handleChange(id) {
    var radioButtons = dojo.query(".aSearch");
    for (var i = 0; i < radioButtons.length; i++) {
        if (radioButtons[i].checked) {
            dojo.byId('type').value = radioButtons[i].value;
        }
    }
    //var id = dijit.byId('fs');
    dijit.byId('fs').set('value', "");
    dijit.byId('fs').focus();
}
function toggleFieldset(el) {
    var divs = dojo.query("div", el.target.parentNode.parentNode);
    if (divs.length) {
        var div = divs[0];

        if (el.target.checked) {
            dojo.removeClass(div, "disabled");
        } else {
            dojo.addClass(div, "disabled");
        }
    }
}
function detectIE() {
    var ms_ie = false;
    var ua = window.navigator.userAgent;
    var old_ie = ua.indexOf('MSIE ');
    var new_ie = ua.indexOf('Trident/');

    if ((old_ie > -1) || (new_ie > -1)) {
        ms_ie = true;
    }
    if (/Edge\/12./i.test(navigator.userAgent)) {
        // this is Microsoft Edge
        ms_ie = true;
    }
    return ms_ie;
}
function fixPrintIssues(ioArgs) {
    // look for requests to the print service
    var u = ioArgs.url;
    if (ioArgs.url.search("Print") > 0) {
        var webmapJson = dojo.fromJson(ioArgs.content.Web_Map_as_JSON);
        // check that the webmap JSON has operational layers
        // bing is always considered an operational layer
        if (webmapJson.operationalLayers.length) {
            //webmapJson.operationalLayers[4].featureCollection.layers[0].featureSet.features[5].symbol.align;
            dojo.forEach(webmapJson.operationalLayers, function (lyr) {
                if (lyr.id == "map_graphics") {
                    var newCollection = lyr.featureCollection
                    for (i = 0; i < map.graphics.graphics.length; i++) {
                        if (!map.graphics.graphics[i].visible) {
                            lyr.featureCollection.layers.splice(i, 1);
                        }
                    }
                } 
//else if (lyr.id == "drawToolsLayer") {
//                    for (i = 0; i < lyr.featureCollection.layers[0].featureSet.features.length; i++) {
//                        if (lyr.featureCollection.layers[0].featureSet.features[i].symbol.type == "esriTS") {
//                            //lyr.featureCollection.layers[0].featureSet.features[i].symbol.color[3] = 1;
//                        }
//                    }
//                }
            });
            webmapJson.layoutOptions.titleText = dijit.byId('printMapTitle').value;
            webmapJson.layoutOptions.authorText = dijit.byId('printMapAuthor').value;
            webmapJson.layoutOptions.legendOptions = !(document.getElementById('printLegend').checked) ? "" : webmapJson.layoutOptions.legendOptions;
            ioArgs.content.Format = document.getElementById("printExportTemplate").value;
            ioArgs.content.Web_Map_as_JSON = dojo.toJson(webmapJson);
        }
    }
    return ioArgs;
}
function toggleToolBar(toolbar) {
    var ppp = dijit.byId(toolbar);
    if (dijit.byId(toolbar).style == "") {
        dijit.byId(toolbar).style = 'display:none';
    } else {
        dijit.byId(toolbar).style = 'display:block';
    }
}
function togglePanel(panel) {
    var panelList = dojo.query(".Panel");
    //var radioList = dojo.query('input:checked', 'drawPanel');
    clearStreetView();
    if (document.getElementById(panel).style.display == "block") {
        document.getElementById(panel).style.display = "none";
        if (panel == "drawPanel") {
            closeDrawPanel();
        } else {
            //measurement.clearResult();
            if (map.getLayer("measureGraphicsLayer")) {
                map.getLayer("measureGraphicsLayer").clear();
            }
            measureToolbar.deactivate();
            mailingLablesToolBar.deactivate();
            if (map.getLayer("mailingLabelsGraphicsLayer")) {
                map.getLayer("mailingLabelsGraphicsLayer").clear();
            }
            selectByLocationToolBar.deactivate();
            //map.getLayer("multipleResultsGraphicsLayer").clear();
        }
    } else {
        for (i = 0; i < panelList.length; i++) {
            if (panelList[i].id == panel) {
                if (!(panel == "dashBoard") && dijit.byId('identify').checked) {
                    dijit.byId('identify').set('checked', false);
                    //changeIdentify(dijit.byId('identify'));
                }
                dojo.disconnect(clickHandler);
                document.getElementById(panel).style.display = "block";
            } else {
                document.getElementById(panelList[i].id).style.display = "none";
                if (panelList[i].id == "drawPanel") {
                    closeDrawPanel();
                } else if (panelList[i].id == "measurePanel") {
                    if (map.getLayer("measureGraphicsLayer")) {
                        map.getLayer("measureGraphicsLayer").clear();
                    }
                    measureToolbar.deactivate();
                } else if (panelList[i].id == "mailingLablePanel") {
                    mailingLablesToolBar.deactivate();
                    if (map.getLayer("mailingLabelsGraphicsLayer")) {
                        map.getLayer("mailingLabelsGraphicsLayer").clear();
                    }
                } else if (panelList[i].id == "selectByLocationPanel") {
                    selectByLocationToolBar.deactivate();
                    //map.getLayer("multipleResultsGraphicsLayer").clear();
                }
            }
            function togglePanel(panel) {
                var panelList = dojo.query(".Panel");
                //var radioList = dojo.query('input:checked', 'drawPanel');
                clearStreetView();
                if (document.getElementById(panel).style.display == "block") {
                    document.getElementById(panel).style.display = "none";
                    if (panel == "drawPanel") {
                        closeDrawPanel();
                    } else {
                        //measurement.clearResult();
                        if (map.getLayer("measureGraphicsLayer")) {
                            map.getLayer("measureGraphicsLayer").clear();
                        }
                        measureToolbar.deactivate();
                        mailingLablesToolBar.deactivate();
                        if (map.getLayer("mailingLabelsGraphicsLayer")) {
                            map.getLayer("mailingLabelsGraphicsLayer").clear();
                        }
                        selectByLocationToolBar.deactivate();
                        //map.getLayer("multipleResultsGraphicsLayer").clear();
                    }
                } else {
                    for (i = 0; i < panelList.length; i++) {
                        if (panelList[i].id == panel) {
                            if (!(panel == "dashBoard") && dijit.byId('identify').checked) {
                                dijit.byId('identify').set('checked', false);
                                //changeIdentify(dijit.byId('identify'));
                            }
                            dojo.disconnect(clickHandler);
                            document.getElementById(panel).style.display = "block";
                        } else {
                            document.getElementById(panelList[i].id).style.display = "none";
                            if (panelList[i].id == "drawPanel") {
                                closeDrawPanel();
                            } else if (panelList[i].id == "measurePanel") {
                                if (map.getLayer("measureGraphicsLayer")) {
                                    map.getLayer("measureGraphicsLayer").clear();
                                }
                                measureToolbar.deactivate();
                            } else if (panelList[i].id == "mailingLablePanel") {
                                mailingLablesToolBar.deactivate();
                                if (map.getLayer("mailingLabelsGraphicsLayer")) {
                                    map.getLayer("mailingLabelsGraphicsLayer").clear();
                                }
                            } else if (panelList[i].id == "selectByLocationPanel") {
                                selectByLocationToolBar.deactivate();
                                //map.getLayer("multipleResultsGraphicsLayer").clear();
                            }
                        }
                    }
                }
            }
            function closeAllPanels() {
                var panelList = dojo.query(".Panel");
                for (i = 0; i < panelList.length; i++) {
                    document.getElementById(panelList[i].id).style.display = "none";
                    if (panelList[i].id == "drawPanel") {
                        closeDrawPanel();
                    } else if (panelList[i].id == "measurePanel") {
                        map.getLayer("measureGraphicsLayer").clear();
                        measureToolbar.deactivate();
                    } else if (panelList[i].id == "mailingLablePanel") {
                        mailingLablesToolBar.deactivate();
                        map.getLayer("mailingLabelsGraphicsLayer").clear();
                    } else if (panelList[i].id == "selectByLocationPanel") {
                        selectByLocationToolBar.deactivate();
                        //map.getLayer("multipleResultsGraphicsLayer").clear();
                    }
                }
            }
            function closeMeasurePanel() {
                if (document.getElementById('measurePanel').style.display == "block") {
                    map.getLayer("measureGraphicsLayer").clear();
                    measureToolbar.deactivate();
                    document.getElementById('measurePanel').style.display = "none";
                    mailingLablesToolBar.deactivate();
                    map.getLayer("mailingLabelsGraphicsLayer").clear();
                }
            }
        }
    }
}
function closeAllPanels() {
    var panelList = dojo.query(".Panel");
    for (i = 0; i < panelList.length; i++) {
        document.getElementById(panelList[i].id).style.display = "none";
        if (panelList[i].id == "drawPanel") {
            closeDrawPanel();
        } else if (panelList[i].id == "measurePanel") {
            map.getLayer("measureGraphicsLayer").clear();
            measureToolbar.deactivate();
        } else if (panelList[i].id == "mailingLablePanel") {
            mailingLablesToolBar.deactivate();
            map.getLayer("mailingLabelsGraphicsLayer").clear();
        } else if (panelList[i].id == "selectByLocationPanel") {
            selectByLocationToolBar.deactivate();
            //map.getLayer("multipleResultsGraphicsLayer").clear();
        }
    }
}
function closeMeasurePanel() {
    if (document.getElementById('measurePanel').style.display == "block") {
        map.getLayer("measureGraphicsLayer").clear();
        measureToolbar.deactivate();
        document.getElementById('measurePanel').style.display = "none";
        mailingLablesToolBar.deactivate();
        map.getLayer("mailingLabelsGraphicsLayer").clear();
    }
}
function closeDialog(graphic) {
    if (graphic) {
        if (graphic.graphic.symbol == graphic.graphic.getLayer().getSelectionSymbol() && graphic.graphic.getLayer() == map.getLayer("waterLayer")) {
            graphic.graphic.getLayer().clearSelection();
            //graphic.graphic.symbol.outline.style == graphic.graphic.getLayer().getSelectionSymbol();
        }
    }
    var widget = dijit.byId("tooltipDialog");
    if (widget) {
        widget.destroy();
    }
}
function setMapGraphicsMouse() {
    dojo.connect(map.graphics, "onMouseMove", function (evt) {
        closeDialog();
        if (evt.graphic.attributes) {
            if (evt.graphic.geometry.type == "polygon" && evt.graphic.attributes) {
                evt.graphic.setSymbol(highlightSymbol);
                evt.graphic._graphicsLayer.displayField = "ADDRESS";
                showTooltip1(evt);
            } else {
                var symbol = esri.symbol.PictureMarkerSymbol({
                    "angle": 0,
                    "xoffset": 0,
                    "yoffset": 12,
                    "type": "esriPMS",
                    "url": pointSymbolURL,
                    "contentType": "image/png",
                    "width": 28,
                    "height": 28
                });
                if (evt.graphic.geometry.type == "polygon") {
                } else {
                    evt.graphic.setSymbol(symbol);
                    var level = checkLevel();
                    var dialog;
                    if (countToolTips < 1) {
                        dialog = new dijit.TooltipDialog({
                            id: "tooltipDialog",
                            content: evt.graphic.attributes.address + evt.graphic.attributes.message,
                            style: "position: absolute; width: auto; font: normal normal bold 6pt Tahoma;z-index:100"
                        });
                        //showTooltip(evt.graphic.geometry.x, evt.graphic.geometry.y + level, evt.graphic.attributes.address + evt.graphic.attributes.message);
                    } else {
                        dialog = new dijit.TooltipDialog({
                            id: "tooltipDialog",
                            content: evt.graphic.attributes.address,
                            style: "position: absolute; width: auto; font: normal normal bold 6pt Tahoma;z-index:100"
                        });
                        //showTooltip(evt.graphic.geometry.x, evt.graphic.geometry.y + level, evt.graphic.attributes.address);
                    }
                    dialog.startup();
                    dojo.style(dialog.domNode, "opacity", 0.85);
                    dijit.placeOnScreen(dialog.domNode, { x: evt.pageX, y: evt.pageY }, ["TL", "BL"], { x: 10, y: 10 });
                }
            }
        }
    });
}
function setMapGraphicsMouseOut() {
    dojo.connect(map.graphics, "onMouseOut", function (evt) {
        if (evt.graphic.attributes) {
            if (evt.graphic.geometry.type == "point") {
                var symbol = esri.symbol.PictureMarkerSymbol({
                    "angle": 0,
                    "xoffset": 0,
                    "yoffset": 12,
                    "type": "esriPMS",
                    "url": pointSymbolURL,
                    "contentType": "image/png",
                    "width": 24,
                    "height": 24
                });
                if (evt.graphic.geometry.type == "polygon") {
                } else {
                    evt.graphic.setSymbol(symbol);
                }
            } else {
                if (!evt.graphic.attributes) {
                } else {
                    evt.graphic.setSymbol(polysymbol);
                }
            }
        closeDialog();
        countToolTips++;
        }
    });
} 
function handlePrintError(err) {
    alert("Printer Error: ", err.message);
}
function handlePrintInfo(resp) {

    var layoutTemplate, templateNames, mapOnlyIndex, templates;
    
    layoutTemplate = dojo.filter(resp.parameters, function (param, idx) {
        return param.name === "Layout_Template";
    });
    if (layoutTemplate.length == 0) {
        console.log("print service parameters name for templates must be \"Layout_Template\"");
        return;
    }
    templateNames = layoutTemplate[0].choiceList;

    templates = dojo.map(templateNames, function (ch) {
        var plate = new esri.tasks.PrintTemplate();
        plate.layout = plate.label = ch;
        plate.format = "";
        plate.label = plate.label.toString().replace("_", " ");
        var ll = new esri.tasks.LegendLayer();
        ll.layerId = "lmCore";
        ll.subLayerIds = [4, 5, 7, 8, 9, 10, 11, 12, 13, 17, 25, 27, 35, 38, 39, 40, 41, 42, 43, 44, 45, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 72, 79, 80, 81, 85, 86, 87, 91];
        plate.layoutOptions = {
            "authorText": "",
            "copyrightText": "Suffolk County Real Property Tax Service\nCOPYRIGHT 2012, COUNTY OF SUFFOLK, N.Y.",
            "legendLayers": plate.label.indexOf('ONLY') == -1 ? [ll] : [],
            "titleText": "",
            "scalebarUnit": ""
        };
        return plate;
    });

    var plate = new esri.tasks.PrintTemplate();
    plate.label = "Map Only - Tabloid (Portrait)";
    plate.format = "";
    plate.exportOptions = { width: 1056, height: 1632, dpi: 96 };
    plate.layoutOptions = {
        "authorText": "",
        "copyrightText": "Suffolk County Real Property Tax Service\nCOPYRIGHT 2012, COUNTY OF SUFFOLK, N.Y.",
        "legendLayers": [],
        "titleText": "",
        "scalebarUnit": ""
    };
    templates.push(plate);
    var plate2 = new esri.tasks.PrintTemplate();
    plate2.label = "Map Only - Tabloid (Landscape)";
    plate2.format = "";
    plate2.exportOptions = { width: 1632, height: 1056, dpi: 96 };
    plate2.layoutOptions = {
        "authorText": "",
        "copyrightText": "Suffolk County Real Property Tax Service\nCOPYRIGHT 2012, COUNTY OF SUFFOLK, N.Y.",
        "legendLayers": [],
        "titleText": "",
        "scalebarUnit": ""
    };
    templates.push(plate2);
    // create the print dijit
    var printer = new esri.dijit.Print({
        "map": map,
        "templates": templates,
	url: "https://gis2.southamptontownny.gov/arcgis/rest/services/Printers/ExportWebMap_Custom/GPServer/Export%20Web%20Map",
        //url: "https://gis2.southamptontownny.gov/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task"
    }, dojo.byId("printButton"));
    printer._printText = "Layout Types";
    printer.startup();
    dojo.connect(printer, 'onPrintStart', function (e) {
        alert('Please be patient while the map is printing'); 
    });
    dojo.connect(printer, 'onPrintComplete', function (value) {
        if (value.url.search('.jpg')) {
            printer._hyperlinkClick();
        } else {
            window.open(value.url, "_blank");
        }
        //printer._hyperlinkClick();
    });
}

function fullExtent() {
    var startExtent = new esri.geometry.Extent({
        "xmin": 1297232.4692940111,
        "ymin": 223864.66964762594,
        "xmax": 1501876.5665162336,
        "ymax": 325535.6765920704,
        "spatialReference": { "wkid": 102718 }
    });
    map.setExtent(startExtent);
}

function toggleNavArrowDisplay(val){
    if(val){
        document.getElementById("navArrows").style.display = "block"; 
    } 
    else{
        document.getElementById("navArrows").style.display = "none";
    };
}
function changeRange(ele) {
    if (ele.title == "Plus Minus") {
        ele.title = "Minus";
        ele.innerHTML = "-";
    } else if (ele.title == "Minus") {
        ele.title = "Plus"
        ele.innerHTML = "+"
    } else if (ele.title == "Plus") {
        ele.title = "Plus Minus"
        ele.innerHTML = "&plusmn;"
    }
}
function zoomFeatureSetExtemt(sResults) {
    var xmax = sResults.features[0].geometry.getExtent().xmax;
    var ymax = sResults.features[0].geometry.getExtent().ymax;
    var xmin = sResults.features[0].geometry.getExtent().xmin;
    var ymin = sResults.features[0].geometry.getExtent().ymin;

    for (i = 0; i < sResults.features.length; i++) {
        if (xmax < sResults.features[i].geometry.getExtent().xmax) {
            xmax = sResults.features[i].geometry.getExtent().xmax
        };
        if (ymax < sResults.features[i].geometry.getExtent().ymax) {
            ymax = sResults.features[i].geometry.getExtent().ymax
        };
        if (xmin > sResults.features[i].geometry.getExtent().xmin) {
            xmin = sResults.features[i].geometry.getExtent().xmin
        };
        if (ymin > sResults.features[i].geometry.getExtent().ymin) {
            ymin = sResults.features[i].geometry.getExtent().ymin
        };
    }
    var extent = new esri.geometry.Extent(xmin - 500, ymin - 500, xmax + 500, ymax + 500, map.spatialReference);
    map.setExtent(extent.getExtent(), true);
}
function createRow(centroid, feature, type) {
    useDefaultSymbol();
    var table = document.getElementById("sessionResults");
    var rowCount = table.rows.length;
    var show, cellInnerHtml, rowClass, PID;
    var row = table.insertRow(0);
    show = "<b><u>" + feature.attributes.ADDRESS + "</u></b><br/>" + feature.attributes.DSBL;
    row.id = "r" + feature.attributes.PARCEL_ID;
    cellInnerHtml = "<div class='upper'>" + feature.attributes.ADDRESS +
                ", " + (feature.attributes.HAMLET ? feature.attributes.HAMLET : feature.attributes.CITY) + "</div><div class='lower'>" +
                feature.attributes.DSBL +
                "</div><input id='h" + feature.attributes.PARCEL_ID + "' type='hidden' value='" + dojo.toJson(feature) + "'/>";

    rowClass = "searchResults2";
    PID = feature.attributes.PARCEL_ID;
    if (!dijit.byId('TgraphPolyFill').checked && polysymbol.color) {
        row.style.backgroundColor = polysymbol.color.toHex();
    }
    row.onmouseout = function () {
        closeDialog();
    };
    row.onmouseover = function () {
        closeDialog();
        if (map.extent.contains(centroid)) {
            var dialog = new dijit.TooltipDialog({
                id: "tooltipDialog",
                content: show,
                style: "position: absolute; width: auto; z-index:100"
            });
            dialog.startup();
            var evt = map.toScreen(centroid);
            dojo.style(dialog.domNode, "opacity", 0.85);
            dijit.placeOnScreen(dialog.domNode, { x: evt.x + dojo.byId("leftPane").offsetWidth + 30, y: evt.y }, ["TL", "BL"], { x: 10, y: 10 });
        }
    };

    var cell1 = row.insertCell(0);
    var element1 = document.createElement("input");
    element1.type = "checkbox";
    element1.className = "editCheckBox";
    if (document.getElementById('resultsEditOptions').style.display == "block") {
        element1.style.display = "block";
    }
    cell1.appendChild(element1);
    cell1.className = "leftTD";

    var cell2 = row.insertCell(1);
    cell2.innerHTML = cellInnerHtml;
    cell2.id = PID;
    cell2.className = "rightTD";
    row.className = rowClass;
    cell2.onclick = function () {
        zoomGeometry(feature, map);
    };

    cell1.style.borderColor = polysymbol.outline.color.toHex();
    cell2.style.borderColor = polysymbol.outline.color.toHex();

    document.getElementById("resultsDiv").style.display = 'block';
    document.getElementById("resultsDivImg").src = 'Images/collapse_icon.gif';
    dijit.byId('resultsEditController').set('disabled', false);
}
function clearTableRow(tableId) {
    var table = document.getElementById(tableId);
    var rowCount = table.rows.length;
    if (rowCount > 0) {
        for (var i = 0; i < rowCount; i++) {
            var row = table.rows[i];
            
            //var chkbox = row.cells[0].childNodes[0];
            table.deleteRow(i);
            rowCount--;
            i--;
        }
    }
}
function showTooltip1(evt) {
    closeDialog();
    if (map.extent.contains(centroid)) {
        var dialog = new dijit.TooltipDialog({
            id: "tooltipDialog",
            content: evt.graphic.attributes[evt.graphic._graphicsLayer.displayField],
            style: "position: absolute; width: auto; font: normal normal bold 6pt Tahoma;z-index:100"
        });
        dialog.startup();

        dojo.style(dialog.domNode, "opacity", 0.85);
        dijit.placeOnScreen(dialog.domNode, { x: evt.pageX, y: evt.pageY }, ["TL", "BL"], { x: 10, y: 10 });
    }
}
function zoomGeometry(json, map) {
    var geo = esri.geometry.Polygon(json.geometry);
    var ext = geo.getExtent();
    var extent;
    if ((ext.xmax - ext.xmin < 250) || (ext.ymax - ext.ymin < 250)) {
        extent = new esri.geometry.Extent(ext.xmin - 75, ext.ymin - 75, ext.xmax + 75, ext.ymax + 75, ext.spatialReference);
    } else {
        extent = new esri.geometry.Extent(ext.xmin, ext.ymin, ext.xmax, ext.ymax, ext.spatialReference);
    }
    map.setExtent(extent, true);
}
function deleteRow() {
    var graphicLayer = map.getLayer("sessionGraphicsLayer");
    var removeGraphicID = [];
    var table = document.getElementById("sessionResults");
    var rowCount = table.rows.length;

    if (rowCount > 0) {
        var removeIDs = [];
        for (var i = 0; i < rowCount; i++) {
            var row = table.rows[i];
            var chkbox = row.cells[0].childNodes[0];
            var graph = eval("(" + row.childNodes[1].childNodes[2].value + ")");
            if (chkbox != null && chkbox.checked == true) {
                removeIDs.push(graph.attributes.PARCEL_ID);
            }
        }
        if (removeIDs.length > 0) {
            var answer = confirm("Are you sure you want to Delete these results");
            if (answer) {
                for (var i = 0; i < rowCount; i++) {
                    var row = table.rows[i];
                    var chkbox = row.cells[0].childNodes[0];
                    if (null != chkbox && true == chkbox.checked) {
                        table.deleteRow(i);
                        removeGraphicID.push(row.id.substring(1) * 1);
                        rowCount--;
                        i--;
                    }
                }
                if (removeGraphicID.length > 0) {
                    for (var a = 0; a < graphicLayer.graphics.length; a++) {
                        //var ppp = removeGraphicID.indexOf(graphicLayer.graphics[a].attributes.PARCEL_ID);
                        if (removeGraphicID.indexOf(graphicLayer.graphics[a].attributes.PARCEL_ID * 1) != -1) {
                            graphicLayer.remove(graphicLayer.graphics[a]);
                        }
                    }
                }
            }
        } else {
            alert("You did not select any properties to delete");
        }
    }
    if (rowCount == 0) {
        dijit.byId('resultsEditController').set('disabled', true);
        document.getElementById('resultsEditOptions').style.display = 'none';
        dijit.byId('resultsEditController').domNode.style.display = 'block';
    }
}
//function saveResults() {
//    var table = document.getElementById("sessionResults");
//    var rowCount = table.rows.length;
//    var save = [];
//    if (rowCount > 0) {
//        var answer = confirm("Are you sure you want to save these results?");
//        if (answer && rowCount > 0) {
//            for (var i = 0; i < rowCount; i++) {
//                var row = table.rows[i];
//                //row.childNodes[1].childNodes
//                var chkbox = row.cells[0].childNodes[0];
//                var graph = eval("(" + row.childNodes[1].childNodes[2].value + ")");
//                var district = graph.attributes.DSBL.substring(0, 1);
//                if (chkbox != null && chkbox.checked == true) {
//                    save.push(graph.attributes.PARCEL_ID + ";" + district);
//                }
//            }
//        }
//        if (save.length > 0) {
//            setCookie("landManagerSessionResults", save.join(','), 2);
//        }
//    } 
//}
function saveResults() {
    var table = document.getElementById("sessionResults");
    var rowCount = table.rows.length;
    var save = [];
    if (rowCount > 0) {
        for (var i = 0; i < rowCount; i++) {
            var row = table.rows[i];
            var chkbox = row.cells[0].childNodes[0];
            var graph = eval("(" + row.childNodes[1].childNodes[2].value + ")");
            var district = graph.attributes.DSBL.substring(0, 1);
            if (chkbox != null && chkbox.checked == true) {
                save.push(graph.attributes.PARCEL_ID + ";" + district);
            }
        }
        if (save.length > 0) {
            var answer = confirm("Are you sure you want to save these results?");
            if (answer) {
                setCookie("landManagerSessionResults", save.join(','), 2);
            }
        } else {
            alert("You did not select any properties to save");
        }
    }
}
function saveAllResults() {
    var table = document.getElementById("sessionResults");
    var rowCount = table.rows.length;
    var save = [];
    if (rowCount > 0) {
        for (var i = 0; i < rowCount; i++) {
            var row = table.rows[i];
            var chkbox = row.cells[0].childNodes[0];
            var graph = eval("(" + row.childNodes[1].childNodes[2].value + ")");
            var district = graph.attributes.DSBL.substring(0, 1);
            save.push(graph.attributes.PARCEL_ID + ";" + district);
        }
        //if (save.length > 0) {
        var answer = confirm("Are you sure you want to save these results?");
        if (answer) {
            setCookie("landManagerSessionResults", save.join(','), 2);
        }
    }
}
function clearSavedResults() {
    var conf = confirm("This will clear any previously saved results\n\rDo you wish to continue?");
    if (conf) {
        setCookie("landManagerSessionResults", "", 2);
    }
}
function toggleAllowEditResults(ele) {
    var eles = document.getElementsByClassName('editCheckBox');
    var on = 'none';
    if (ele == "allow") { on = 'block' };
    for (i = 0; i < eles.length; i++) {
        eles[i].style.display = on;
    }
}
function clearTable() {
    var table = document.getElementById("sessionResults");
    var rowCount = table.rows.length;
    var answer;
    if (rowCount > 0) {
        answer = confirm("Are you sure you want to Clear these results");
    }
    if (answer && rowCount > 0) {
        for (var i = 0; i < rowCount; i++) {
            var row = table.rows[i];
            var chkbox = row.cells[0].childNodes[0];
            table.deleteRow(i);
            rowCount--;
            i--;
        }
        map.getLayer("sessionGraphicsLayer").clear();
        dijit.byId('resultsEditController').set('disabled', true);
        document.getElementById('resultsEditOptions').style.display = 'none';
        dijit.byId('resultsEditController').domNode.style.display = 'block';
    }
}
function selectAll() {
    var table = document.getElementById("sessionResults");
    var rowCount = table.rows.length;
   
    if (rowCount > 0) {
        for (var i = 0; i < rowCount; i++) {
            var row = table.rows[i];
            var chkbox = row.cells[0].childNodes[0];
            chkbox.checked = true;
        }
    }
}
function selectNone() {
    var table = document.getElementById("sessionResults");
    var rowCount = table.rows.length;

    if (rowCount > 0) {
        for (var i = 0; i < rowCount; i++) {
            var row = table.rows[i];
            var chkbox = row.cells[0].childNodes[0];
            chkbox.checked = false;
        }
    }
}
function shareMap() {
    var content = map.extent.toJson();
    var url = "https://lm.southamptontownny.gov?extent=" + content.xmin + "," + content.ymin + "," + content.xmax + "," + content.ymax;
    var dialog = dijit.byId("showExtentLinkDLG");
    dialog.startup();
    
    dialog.set('content', '<h3 style="margin-top:0">Copy The Link Below</h3><p style="margin:5px;padding:10px;word-wrap:break-word;border:1px solid #769DC4;font-family: calibri; font-size: small; font-weight: bold"><a href="' + url + '" target="_blank">' + url + '</a></p>');
    dialog.show();
}
function shareResults() {
    var table = document.getElementById("sessionResults");
    var rowCount = table.rows.length;
    var share = [];
    if (rowCount > 0) {
        for (var i = 0; i < rowCount; i++) {
            var row = table.rows[i];
            var chkbox = row.cells[0].childNodes[0];

            if (chkbox.checked == true) {
                var graph = eval("(" + row.childNodes[1].childNodes[2].value + ")");
                var district = graph.attributes.DSBL.substring(0, 1);
                share.push(graph.attributes.PARCEL_ID + ";" + district);
            }
        }
    }
    if (share.length > 0) {
        var mailTo = "mailTo:?body=" + window.location.href + "?pids=" + share.join(',') + "&Subject=View these properties in Land Manager";
        //window.location.href(mailTo);
	window.open(mailTo);
    } else {
        alert("You did not select any properties to share");
    }
}
function findURLParameters(vars, parameter) {
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        if (decodeURIComponent(pair[0]) == parameter) {
            return decodeURIComponent(pair[1]);
        }
    }
}
function checkTown(geometry) {
    var lat = (geometry.mapPoint ? geometry.mapPoint.y : geometry.y);
    var lng = (geometry.mapPoint ? geometry.mapPoint.x : geometry.x);
    var townPoly = new esri.geometry.Polygon({
        "rings": [
     [
      [1387321.339841187, 227924.2915764302],
      [
       1383914.4513137788,
       226431.85656918585
      ],
      [
       1342309.1424641907,
       208206.14105218649
      ],
      [
       1336570.9039406925,
       222797.77853551507
      ],
      [
       1336512.0841764361,
       222947.34943060577
      ],
      [
       1336503.6635896116,
       223441.28184168041
      ],
      [
       1336627.8677375317,
       223820.34735651314
      ],
      [
       1336725.606387198,
       224247.08337968588
      ],
      [
       1336729.7835441977,
       224340.18850843608
      ],
      [
       1336807.9795820266,
       224358.0313205272
      ],
      [
       1336742.6624554396,
       224627.25584769249
      ],
      [
       1336748.2815386951,
       224752.50297251344
      ],
      [
       1336751.1437376887,
       224816.30008901656
      ],
      [
       1336306.225336194,
       225513.42303860188
      ],
      [
       1336291.4071243554,
       238340.88655684888
      ],
      [
       1336310.1377299428,
       238692.57843877375
      ],
      [
       1336125.4871806055,
       238868.73753526807
      ],
      [
       1335909.3980458528,
       239074.88968202472
      ],
      [
       1336254.2231436074,
       242228.89059185982
      ],
      [
       1336272.3763225228,
       242394.93159835041
      ],
      [
       1336317.6268881857,
       242624.03973594308
      ],
      [
       1336708.6694131941,
       244603.92521184683
      ],
      [
       1336756.5193831027,
       244846.19572468102
      ],
      [
       1336596.7418155223,
       245651.22823534906
      ],
      [
       1337431.7020878643,
       249387.73880693316
      ],
      [
       1337611.3523191065,
       250180.10106734931
      ],
      [
       1338336.0195049345,
       253376.29874318838
      ],
      [
       1339228.2231011093,
       257311.42276269197
      ],
      [
       1340074.4815791845,
       261043.89626885951
      ],
      [
       1341033.0610268563,
       265271.76150077581
      ],
      [
       1341896.574063614,
       269080.32507784665
      ],
      [
       1342630.2533705235,
       272316.24511519074
      ],
      [
       1343258.4371535182,
       275086.87047943473
      ],
      [
       1343312.418016687,
       275129.42223159969
      ],
      [
       1343653.4248806089,
       275282.4301276803
      ],
      [
       1344219.4355596155,
       275710.44534777105
      ],
      [
       1344706.4470527768,
       275485.46121768653
      ],
      [
       1345386.4512701929,
       275616.46489268541
      ],
      [
       1346756.4823227823,
       275070.49255943298
      ],
      [
       1346898.4856476933,
       274940.49347560108
      ],
      [
       1346961.4868340194,
       274910.49419176579
      ],
      [
       1347269.4934358597,
       274939.50003926456
      ],
      [
       1347420.4964146912,
       275050.50408235192
      ],
      [
       1347636.501232028,
       274954.50657093525
      ],
      [
       1347751.5039547682,
       274842.50745110214
      ],
      [
       1347889.5066315234,
       274983.50159168243
      ],
      [
       1347848.5054011941,
       275137.50292409956
      ],
      [
       1347925.5068876147,
       275238.50534677505
      ],
      [
       1348246.5233059376,
       275402.51322084665
      ],
      [
       1348408.5269189477,
       275385.51587952673
      ],
      [
       1348521.5289895236,
       275560.52012269199
      ],
      [
       1348602.1334871054,
       275643.19252951443
      ],
      [
       1348716.5325365216,
       275760.52628435194
      ],
      [
       1348805.5343270302,
       275920.5299013555
      ],
      [
       1348956.5373058617,
       276032.53394243121
      ],
      [
       1349095.540308699,
       276056.53684718907
      ],
      [
       1349241.5436256081,
       275998.53860360384
      ],
      [
       1349745.5544286072,
       276055.54833211005
      ],
      [
       1349866.5564831942,
       276269.56332401931
      ],
      [
       1350136.5621767789,
       276330.55893693864
      ],
      [
       1350366.5676222742,
       276150.57077986002
      ],
      [
       1350861.588285774,
       276060.57850576937
      ],
      [
       1351156.5342181921,
       276390.57817384601
      ],
      [
       1351639.6047743559,
       276329.58584177494
      ],
      [
       1351986.6122824401,
       276390.59293760359
      ],
      [
       1352217.6173978597,
       276329.59634043276
      ],
      [
       1352386.6213249415,
       276070.59587419033
      ],
      [
       1352821.6211111099,
       275870.60086736083
      ],
      [
       1353101.627112776,
       275855.61566109955
      ],
      [
       1353396.6337406039,
       275669.61865776777
      ],
      [
       1353549.6370435208,
       275683.62158252299
      ],
      [
       1353721.6504790187,
       275746.62539352477
      ],
      [
       1353826.6528936923,
       275720.62675786018
      ],
      [
       1353945.6454378515,
       275743.62933652103
      ],
      [
       1353996.6466481984,
       275670.62915444374
      ],
      [
       1354340.6538341939,
       275691.63567410409
      ],
      [
       1354551.6583334357,
       275865.6418877691
      ],
      [
       1354886.6655374467,
       275841.64751318097
      ],
      [
       1355084.6697346121,
       275892.65167626739
      ],
      [
       1355287.6739217788,
       276092.65816602111
      ],
      [
       1355584.6805456132,
       276152.66427960992
      ],
      [
       1355716.6832343638,
       276146.66658818722
      ],
      [
       1356006.6993866116,
       276207.6723716855
      ],
      [
       1356064.7005829364,
       276505.67768119276
      ],
      [
       1356246.8977251053,
       276459.86642110348
      ],
      [
       1357436.730319187,
       276160.69740001857
      ],
      [
       1358096.7447471917,
       276170.7091910243
      ],
      [
       1358611.7558562756,
       276480.72300668061
      ],
      [
       1359376.77237086,
       276620.73880277574
      ],
      [
       1360074.7873790264,
       276465.74895526469
      ],
      [
       1360367.3747203648,
       276519.20390085876
      ],
      [
       1361771.8243392706,
       276775.7939388603
      ],
      [
       1362536.8306832761,
       276410.80221477151
      ],
      [
       1363298.8478600234,
       277117.8263912648
      ],
      [
       1365566.89844203,
       277830.87811477482
      ],
      [
       1366652.8733041883,
       278345.88561493158
      ],
      [
       1375145.0610441864,
       278593.05375577509
      ],
      [
       1387448.3326974362,
       280215.27688926458
      ],
      [
       1389215.9154483527,
       280830.25072494149
      ],
      [
       1408272.4370465279,
       287890.72184018791
      ],
      [
       1412960.5979457796,
       289627.66816943884
      ],
      [
       1431760.3247819394,
       315171.48453576863
      ],
      [
       1436737.434906438,
       317511.9637786895
      ],
      [
       1450347.3263217807,
       323911.95754034817
      ],
      [
       1458367.3125783652,
       313631.83439984918
      ],
      [
       1454258.5540636033,
       309838.91974160075
      ],
      [
       1454551.6633855253,
       309310.71410509944
      ],
      [
       1454714.37762703,
       309017.49225060642
      ],
      [
       1455041.4717891067,
       308428.04723526537
      ],
      [
       1455047.0291926861,
       308418.03249152005
      ],
      [
       1455155.6247760206,
       308222.33636060357
      ],
      [
       1455909.1541088521,
       306864.42011319101
      ],
      [
       1455928.8066286147,
       306829.00548584759
      ],
      [
       1456130.2363438606,
       306465.63088451326
      ],
      [
       1456763.5441323519,
       305328.4533688575
      ],
      [
       1456820.8212487698,
       305225.60613361001
      ],
      [
       1457637.0466504395,
       303741.68915393949
      ],
      [
       1457650.016440779,
       303718.10882051289
      ],
      [
       1458982.0098397732,
       301304.46141685545
      ],
      [
       1460995.6774003655,
       297654.43623660505
      ],
      [
       1462710.0712812692,
       294546.88733360171
      ],
      [
       1464243.8641454428,
       291766.70326143503
      ],
      [
       1464530.3094386905,
       291251.51498734951
      ],
      [
       1464943.6534282714,
       290508.09160543978
      ],
      [
       1465845.7995898575,
       288787.53271059692
      ],
      [
       1465870.0328091085,
       288741.31561143696
      ],
      [
       1465582.0547105223,
       288658.88500201702
      ],
      [
       1465501.8275087774,
       288635.65768626332
      ],
      [
       1464924.3345692754,
       288468.46215452254
      ],
      [
       1464456.0484323651,
       288332.88368551433
      ],
      [
       1464279.8919605315,
       288281.88313135505
      ],
      [
       1464137.1885057688,
       288283.14395560324
      ],
      [
       1465233.7125594467,
       286561.32751736045
      ],
      [
       1465658.3413033634,
       285729.95089927316
      ],
      [
       1465898.5616234392,
       285259.62605251372
      ],
      [
       1466244.0215624422,
       284687.89097552001
      ],
      [
       1466755.8814311028,
       283901.46439877152
      ],
      [
       1467045.6377413571,
       283427.38627868891
      ],
      [
       1467358.4317351878,
       282915.61597676575
      ],
      [
       1467638.1316351146,
       282531.28275594115
      ],
      [
       1469057.7331266105,
       280667.49612918496
      ],
      [
       1478731.0914045274,
       267967.48183110356
      ],
      [
       1435542.7899860293,
       249048.30838343501
      ],
      [
       1387321.339841187,
       227924.2915764302]
     ]
    ],
        "spatialReference": {
            "wkid": 102718
        }
    });
    //var projectPoint = new esri.geometry.Point(lng, lat, map.spatialReference);
    var bool = townPoly.contains((geometry.mapPoint ? geometry.mapPoint : geometry));
    return bool;
}
function myTrim(x) {
    return x.replace(/^\s+|\s+$/gm, '');
}