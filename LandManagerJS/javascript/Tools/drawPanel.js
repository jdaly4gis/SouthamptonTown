var switchGraphic = false;
var ogSymbol;
function setActiveSymbol(graphic) {
    var symbol;
    //ogSymbol.push(graphic.symbol);
    switch (graphic.symbol.type) {
        case "simplemarkersymbol":
            symbol = new esri.symbol.PictureMarkerSymbol("images/move.png", 30, 30);
            break;
        case "textsymbol":
            symbol = new esri.symbol.TextSymbol(graphic.symbol.text, graphic.symbol.font, new dojo.Color([255, 0, 0]));
            //symbol = graphic.symbol;
           
            symbol.setAlign(graphic.symbol.align);
            symbol.setDecoration(esri.symbol.TextSymbol.DECORATION_LINETHROUGH);
            //symbol.font.setWeight(esri.symbol.Font.WEIGHT_BOLDER);
            break;
        default:
            symbol = graphic.symbol;
            break;
    }
    return symbol;
}
function getCurrentGraphic(evt) {
    dijit.byId('graphicsDelete').set('disabled', false);
    //ogSymbol = evt.graphic.symbol;
    ogSymbol = new esri.symbol.fromJson(evt.graphic.symbol.toJson());
    evt.graphic.setSymbol(setActiveSymbol(evt.graphic));
    if (evt.graphic.symbol.declaredClass != "esri.symbol.TextSymbol") {
        activateToolbar(evt, 'graphic');
    } else {
        activateToolbar(evt, 'text');
    }
}
function initDrawPanel(map) {
    drawToolsLayer = new esri.layers.GraphicsLayer();
    drawToolsLayer.id = "drawToolsLayer";
    drawToolsTextLayer = new esri.layers.GraphicsLayer();
    drawToolsTextLayer.id = "drawToolsTextLayer";
    map.addLayer(drawToolsTextLayer);
//    drawToolsTextLayer.setVisibility(true);
    map.on('dbl-click', function (evt) {
        //evt.stopPropagation();
        map.isDoubleClickZoom ? null : map.enableDoubleClickZoom();
        switchGraphic = false;
        var state = editToolbar.getCurrentState();
        editToolbar.deactivate();
        var layerID = state.graphic ? state.graphic.getLayer().id : null;
        if (state.tool > 0 && layerID != "measureGraphicsLayer") {
            if (state.graphic.symbol.declaredClass == "esri.symbol.TextSymbol") {
                ogSymbol.setText(state.graphic.symbol.text);
            }
            state.graphic.setSymbol(ogSymbol);
        } else {
            if (layerID == "measureGraphicsLayer") {
                getAreaAndLength(state.graphic.geometry);
                map.enableDoubleClickZoom();
            }
        }
    });
    drawToolsTextLayer.on("click", function (evt) {
        var state = editToolbar.getCurrentState();
        evt.stopPropagation();
        switchGraphic = false;
        var panel = dojo.byId('drawPanel');
        //map.disableDoubleClickZoom();
        if (state.tool == 0) {
            if (panel.style.display != 'none') {
                getCurrentGraphic(evt);
            }
        } else {
            if (state.graphic.geometry != evt.graphic.geometry) {
                switchGraphic = true;
                state.graphic.setSymbol(ogSymbol);
                getCurrentGraphic(evt);
            } else {
                evt.graphic.setSymbol(ogSymbol);
            }
        }
    });
    drawToolsLayer.on("click", function (evt) {
        var state = editToolbar.getCurrentState();
        evt.stopPropagation();
        switchGraphic = false;
        var panel = dojo.byId('drawPanel');
        //map.disableDoubleClickZoom();
        if (state.tool == 0) {
            if (panel.style.display != 'none') {
                getCurrentGraphic(evt);
            }
        } else {
            if (state.graphic.geometry != evt.graphic.geometry) {
                switchGraphic = true;
                state.graphic.setSymbol(ogSymbol);
                getCurrentGraphic(evt);
            } else {
                evt.graphic.setSymbol(ogSymbol);
            }
        }
    });
    drawToolsLayer.on("mouse-out", function (e) {
        closeDialog();
    });
    drawToolsLayer.on("mouse-over", function (e) {
        closeDialog();
        var text = "";
        for (x in e.graphic.attributes) {
            text += x + ": " + e.graphic.attributes[x] + "<br/>";
        }
        if (text != "") {
            var dialog = new dijit.TooltipDialog({
                id: "tooltipDialog",
                content: text,
                style: "position: absolute; width: auto; z-index:100"
            });
            dialog.startup();
            var evt = e.screenPoint;
            dojo.style(dialog.domNode, "opacity", 0.85);
            dijit.placeOnScreen(dialog.domNode, { x: evt.x + dojo.byId("leftPane").offsetWidth + 30, y: evt.y }, ["TL", "BL"], { x: 10, y: 10 });
        }
    });
    drawToolsTextLayer.on("mouse-out", function (e) {
        closeDialog();
    });
    drawToolsTextLayer.on("mouse-over", function (e) {
        closeDialog();
        var text = "";
        for (x in e.graphic.attributes) {
            text += x + ": " + e.graphic.attributes[x] + "<br/>";
        }
        if (text != "") {
            var dialog = new dijit.TooltipDialog({
                id: "tooltipDialog",
                content: text,
                style: "position: absolute; width: auto; z-index:100"
            });
            dialog.startup();
            var evt = e.screenPoint;
            dojo.style(dialog.domNode, "opacity", 0.85);
            dijit.placeOnScreen(dialog.domNode, { x: evt.x + dojo.byId("leftPane").offsetWidth + 30, y: evt.y }, ["TL", "BL"], { x: 10, y: 10 });
        }
    });
    editToolbar = new esri.toolbars.Edit(map);
    editToolbar.on('activate', function (e) {
        map.disableDoubleClickZoom();
    });
    editToolbar.on('deactivate', function (evt) {
        var state = editToolbar.getCurrentState();
        if (!switchGraphic) {
            dijit.byId('graphicsDelete').set('disabled', true);
            dojo.forEach(dijit.byId('collapseToolbar').getChildren(), function (child) {
                child.set("disabled", false);
            });
            dojo.forEach(dojo.query('.drawTools'), function (child) {
                var widget = dijit.registry.getEnclosingWidget(child);
                widget.set('disabled', false);
                //child.disabled = true;
            });
        }
        if ((evt.info.isModified || document.getElementById("storeMeasurements").checked) && evt.graphic.symbol.declaredClass != "esri.symbol.TextSymbol") {
            evt.graphic.attributes = getGraphicsAreaAndLength(evt.graphic.geometry);
        }
    });
    map.addLayer(drawToolsLayer);
    graphToolBar = new esri.toolbars.Draw(map);

    dojo.connect(graphToolBar, "onDrawEnd",  drawEnd);
}
function drawEnd(geom, sender) {
    var graphSymbol;
    graphToolBar.deactivate();
    map.enableDoubleClickZoom();
    switch (geom.type) {
        case "point":
            if (activeDrawTool == "Point" || sender == "convertGraphics") {
                //dijit.byId('drawPOINT').set('checked', false);
                var pointStyle = eval(dijit.byId("drawPointStyle").value);
                var pointColor = new dojo.Color(dijit.byId("drawPointColor").value);
                pointColor.a = ".50";
                var pointSize = dijit.byId("drawPointSize").value;
                graphSymbol = new esri.symbol.SimpleMarkerSymbol(pointStyle, pointSize,
                              new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID,
                              new dojo.Color([0, 0, 0]), 1), pointColor);
            } else {
                //dijit.byId('drawTEXT').set('checked', false);
                createEditableTextBox(geom, "");
            }
            break;
        case "polyline":
            //dijit.byId('drawPOLYLINE').set('checked', false);
            if (document.getElementById("startArrow").checked) {
                var pt1 = geom.paths[0][0];
                var pt2 = geom.paths[0][1];
                var point = new esri.geometry.Point(pt1);
                var arrowGraphic = new esri.Graphic(point, arrow(pt1, pt2));
                drawToolsLayer.add(arrowGraphic);
            }
            if (document.getElementById("endArrow").checked) {
                var pt1 = geom.paths[0][geom.paths[0].length - 3];
                var pt2 = geom.paths[0][geom.paths[0].length - 2];
                var point = new esri.geometry.Point(pt2);
                var arrowGraphic = new esri.Graphic(point, arrow(pt2, pt1));
                drawToolsLayer.add(arrowGraphic);
            }
            var lineStyle = eval(dijit.byId("lineStyle").value);
            var lineType = dijit.byId("lineStyle").get('displayedValue');
            var lineColor = new dojo.Color(dijit.byId("drawLineColor").value);
            lineColor.a = ".50";
            var lineSize = dijit.byId("lineSize").value;
            graphSymbol = new esri.symbol.SimpleLineSymbol(lineStyle, lineColor, lineSize);
            break;
        case "polygon":
            var outColor, outStyle, fillColor, fillStyle;
            outColor = dijit.byId("outColor").value;
            outStyle = eval(dijit.byId("outStyle").value);
            fillColor = new dojo.Color(dijit.byId("fillColor").value);
            fillColor.a = ".25";
            fillStyle = eval(dijit.byId("fillStyle").value);
            graphSymbol = new esri.symbol.SimpleFillSymbol(fillStyle, new esri.symbol.SimpleLineSymbol(outStyle,
                            new dojo.Color(dijit.byId("outColor").value), 3),
                            fillColor);
            break;
    }
    if (activeDrawTool != "text") {
        var attr = {};
        if (document.getElementById("storeMeasurements").checked && activeDrawTool != "text") {
            attr = getGraphicsAreaAndLength(geom);
        }
        var graphic = new esri.Graphic(geom, graphSymbol, attr);
        drawToolsLayer.add(graphic);
        if (geom.type != "point") {
            if (dojo.byId('buffer' + geom.type + 'Graphic').checked) {
                doBuffer(geom, "buff" + geom.type + "GraphicDist");
            }
        }
    }
}
function getGraphicsAreaAndLength(geometry) {
    var attr = {};
    if (document.getElementById("storeMeasurements").checked) {
        switch (geometry.type) {
            case "point":
                var params = new esri.tasks.ProjectParameters();
                params.geometries = [geometry];
                params.outSR = new esri.SpatialReference({ wkid: document.getElementById("pointSelect").value });
                //params.transformation = transformation;
                gsvc.project(params, function (e) {
                    if (document.getElementById("pointSelect")[document.getElementById("pointSelect").selectedIndex].text == "DMS") {
                        attr["Longitude"] = DMS(e[0].x);
                        attr["Lattitude"] = DMS(e[0].y);
                    } else {
                        attr["Longitude"] = e[0].x.toFixed(3);
                        attr["Lattitude"] = e[0].y.toFixed(3);
                    }
                });
                symbol = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_SQUARE, 10, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255, 0, 0]), 1), new dojo.Color([0, 255, 0, 0.25]));
                break;
            case "polyline":
                var lengthParams = new esri.tasks.LengthsParameters();
                lengthParams.polylines = [geometry];
                lengthParams.lengthUnit = eval(document.getElementById("lengthSelect").value);
                lengthParams.geodesic = true;
                symbol = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_DASH, new dojo.Color([255, 0, 0]), 1.5);
                var graphic = new esri.Graphic(geometry);
                gsvc.lengths(lengthParams, function (e) {
                    attr["length"] = dojo.number.format(e.lengths[0].toFixed(2)) + " " + document.getElementById("lengthSelect")[document.getElementById("lengthSelect").selectedIndex].text;
                });
                break;
            case "polygon":
                symbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_DASHDOT, new dojo.Color([255, 0, 0]), 1.5), new dojo.Color([255, 255, 0, 0.25]));
                var graphic = new esri.Graphic(geometry);
                var areasAndLengthParams = new esri.tasks.AreasAndLengthsParameters();
                areasAndLengthParams.lengthUnit = eval(document.getElementById("lengthSelect").value);
                areasAndLengthParams.areaUnit = eval(document.getElementById("areaSelect").value);
                areasAndLengthParams.polygons = [geometry];
                gsvc.areasAndLengths(areasAndLengthParams, function (e) {
                    attr['area'] = dojo.number.format(e.areas[0].toFixed(2)) + " " + document.getElementById("areaSelect")[document.getElementById("areaSelect").selectedIndex].text;
                    //attr['perimeter'] = dojo.number.format(e.lengths[0].toFixed(2)) + " " + document.getElementById("areaSelect")[document.getElementById("areaSelect").selectedIndex].text;
                });
                break;
        }
    }
    return attr;
}
function activateToolbar(evt, text) {
    var tool = 0;
    var options = {};
    if (text != "text") {
        tool = tool | esri.toolbars.Edit.MOVE;
        tool = tool | esri.toolbars.Edit.EDIT_VERTICES;
        tool = tool | esri.toolbars.Edit.SCALE;
        tool = tool | esri.toolbars.Edit.ROTATE;
    } else {
        tool = tool | esri.toolbars.Edit.MOVE;
	tool = tool | esri.toolbars.Edit.EDIT_TEXT;
    }
    
    options = {
        allowAddVertices: true,
        allowDeleteVertices: true,
        uniformScaling: true
    };

    editToolbar.activate(tool, evt.graphic, options);

    dojo.forEach(dijit.byId('collapseToolbar').getChildren(), function (child) {
        child.set("disabled", true);
    });
    dojo.forEach(dojo.query('.drawTools'), function (child) {
        var widget = dijit.registry.getEnclosingWidget(child);
        widget.set('disabled', true);
    });
}
function arrow(pt1, pt2) {
    return new esri.symbol.TextSymbol({
        text: "▲",
        //text: "^",
        angle: setAngle(pt1, pt2),
        type: "esriTS",
        color: new dojo.Color(dijit.byId("drawLineColor").value),
        font: {
            size: dijit.byId("lineSize").value * 7,
            style: 'normal',
            type: 'font',
            variant: "normal",
            weight: "normal",
            family: "Lucida Grande Console"

        }
    });
}
function setAngle (p1, p2){
    var rise = p2[1] - p1[1];
    var run = p2[0] - p1[0];
    var angle = ((180/Math.PI) * Math.atan2(run, rise))
    return -(angle + 180);
}
var textBlur = 0, activeTool;
function toggleDrawTool(tool, vis) {
    document.getElementById("PointSymbolBuilder").style.display = "none";
    document.getElementById("LineSymbolBuilder").style.display = "none";
    document.getElementById("PolygonSymbolBuilder").style.display = "none";
    document.getElementById("textSymbolBuilder").style.display = "none";
    document.getElementById(tool + "SymbolBuilder").style.display = "block";
    switch (tool) {
        case "Point":
            activeTool = tool;
            //map.enableDoubleClickZoom();
            graphToolBar.activate(esri.toolbars.Draw.POINT);
            //graphToolBar._tooltip.innerHTML = "Click to add a point";
            document.getElementById("PointSymbolBuilder").style.display = "block";
            break;
        case "Line":
            activeTool = tool;
            //map.disableDoubleClickZoom();
            graphToolBar.activate(esri.toolbars.Draw.POLYLINE);
            document.getElementById("LineSymbolBuilder").style.display = "block";
            break;
        case "Polygon":
            activeTool = tool;
            //map.disableDoubleClickZoom();
            graphToolBar.activate(esri.toolbars.Draw.POLYGON);
            document.getElementById("PolygonSymbolBuilder").style.display = "block";
            break;
        case "text":
            activeTool = "Point";
            graphToolBar.activate(esri.toolbars.Draw.POINT);
            //graphToolBar._tooltip.innerHTML = "Click to add some text";
            document.getElementById("textSymbolBuilder").style.display = "block";
            break;
    }
}

function addTextToMap(ele, x , y) {
    var geom = new esri.geometry.Point(x, y, map.spatialReference);
    var screenPoint = map.toScreen(geom);
    //screenPoint.x = screenPoint.x + dojo.byId("leftPane").offsetWidth
    var text = ele.value;
    dojo.destroy(ele);
    dojo.destroy(document.getElementById('underlay'));
    text = text.replace(/\n\r?/g, ';');
    var multiLines = text.split(';');
    for (i = 0; i < multiLines.length; i++) {
        var displayText = multiLines[i];
        graphSymbol = new esri.symbol.TextSymbol(displayText, null, new dojo.Color(dijit.byId('textColor').value));

        graphSymbol.font.setFamily(dijit.byId('textStyle').value);
        graphSymbol.font.setSize(dijit.byId('textSize').value * 1);
        graphSymbol.setAlign(esri.symbol.TextSymbol.ALIGN_START);
        screenPoint.y = screenPoint.y + dijit.byId('textSize').value;
        
        var point = map.toMap(screenPoint);

        var graphic = new esri.Graphic(point, graphSymbol);
        drawToolsTextLayer.add(graphic);
    }
}
function createEditableTextBox(geom, text) {
    var point = map.toScreen(geom);
    var tag;
    if (text == null || text == "") {
        text = "No Description Available";
    }
    if (!document.getElementById("newText")) {
        tag = dojo.create("textarea");
        tag.id = "newText";
        tag.style.width = "300px";
        document.body.appendChild(tag);
    }

    var under = document.createElement("div");
    under.id = "underlay";
    document.body.appendChild(under);

    document.getElementById('underlay').style.display = 'block';
    document.getElementById("newText").style.fontFamily = dijit.byId('textStyle').value;
    document.getElementById("newText").style.color = dijit.byId('textColor').value;
    document.getElementById("newText").style.position = "absolute";
    document.getElementById("newText").style.zIndex = "1000";
    document.getElementById("newText").style.fontSize = dijit.byId('textSize').value + "pt";
    document.getElementById("newText").value = "Click to Change Text";
    document.getElementById("newText").onclick = function () {
        this.value = "";
    };
    var mouseX = point.x;
    var mouseY = point.y;

    //set container position:
    document.getElementById("newText").style.left = (mouseX + dojo.byId("leftPane").offsetWidth + 30) + "px";
    document.getElementById("newText").style.top = mouseY + "px";

    document.getElementById("newText").style.display = "Block";
    document.getElementById("newText").onchange = function () {
        addTextToMap(this, geom.x, geom.y);
    };
}

function selectColor(e, element) {
    if (e == "#ffff00" || e == "#ffffff") {
        document.getElementById(element).style.backgroundColor = "#C0C0C0";
        document.getElementById(element).style.color = e;
    }
    else {
        document.getElementById(element).style.backgroundColor = "";
        document.getElementById(element).style.color = e;
    }
}
function selectSymbol(geomType) {
    switch (geomType) {
        case "Point":
            break;
        case "Polyline":
            break;
        case "Polygon":
            break;
    }
}

function closeDrawPanel() {
    //var radioList = dojo.query('input', 'Fieldset1');
    //for (q = 0; q < radioList.length; q++) {
    //    var radio = dijit.byId(radioList[q].id);
    //    if (radio.checked) {
            //radio.set('checked', false);
            //toggleDrawTool("point", false);
            graphToolBar.deactivate();
    //    }
    //}
    document.getElementById('drawPanel').style.display = "none";
}
function doBuffer(geometry, id) {
    switch (geometry.type) {
        case "point":
            var symbol = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_SQUARE, 10, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255, 0, 0]), 1), new dojo.Color([0, 255, 0, 0.25]));
            break;
        case "polyline":
            var symbol = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_DASH, new dojo.Color([255, 0, 0]), 1);
            break;
        case "polygon":
            var symbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_NONE, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_DASHDOT, new dojo.Color([255, 0, 0]), 2), new dojo.Color([255, 255, 0, 0.25]));
            break;
    }
    //setup the buffer parameters
    var params = new esri.tasks.BufferParameters();
    params.distances = [dijit.byId(id).value];
    params.bufferSpatialReference = map.spatialReference;
    params.outSpatialReference = map.spatialReference;
    params.unit = eval("esri.tasks.GeometryService.UNIT_FOOT");


    if (geometry.type === "polygon") {
        //if geometry is a polygon then simplify polygon.  This will make the user drawn polygon topologically correct.
        gsvc.simplify([geometry], function (geometries) {
            params.geometries = geometries;
            gsvc.buffer(params, showBuffer);
        });
    } else {
        params.geometries = [geometry];
        gsvc.buffer(params, showBuffer, function (e) {
            alert(e);
        });
    }
}
function showBuffer(bufferedGeometries) {
    var symbol = new esri.symbol.SimpleFillSymbol(
        esri.symbol.SimpleFillSymbol.STYLE_SOLID,
        new esri.symbol.SimpleLineSymbol(
          esri.symbol.SimpleLineSymbol.STYLE_SOLID,
          new dojo.Color([255, 0, 0, 0.65]), 2
        ),
        new dojo.Color([255, 0, 0, 0.35])
      );
    dojo.forEach(bufferedGeometries, function (geometry) {
        var graphic = new esri.Graphic(geometry, symbol);
        drawToolsLayer.add(graphic);
    });
}

function createGraphicsMenu() {
    // Creates right-click context menu for GRAPHICS
    ctxMenuForGraphics = new dijit.Menu({});

    ctxMenuForGraphics.addChild(new dijit.MenuItem({
        label: "Start Editing",
        onClick: function () {
            activateToolbar(selected);
            dojo.forEach(dijit.byId('collapseToolbar').getChildren(), function (child) {
                child.set("disabled", true);
            });
        }
    }));
    //ctxMenuForGraphics.addChild(new dijit.MenuSeparator());
    ctxMenuForGraphics.addChild(new dijit.MenuItem({
        label: "Stop Editing",
        onClick: function () {
            editToolbar.deactivate();
            dojo.forEach(dijit.byId('collapseToolbar').getChildren(), function (child) {
                child.set("disabled", false);
            });
        }
    }));
    ctxMenuForGraphics.addChild(new dijit.MenuSeparator());
    ctxMenuForGraphics.addChild(new dijit.MenuItem({
        label: "Delete",
        onClick: function () {
            var con = confirm("Are you sure you wish to\r\delete the selected graphic?");
            if (con) {
                editToolbar.deactivate();
                drawToolsLayer.remove(selected);
                dojo.forEach(dijit.byId('collapseToolbar').getChildren(), function (child) {
                    child.set("disabled", false);
                });
            }
        }
    }));
    ctxMenuForGraphics.addChild(new dijit.MenuItem({
        label: "Remove All",
        onClick: function () {
            var con = confirm("Are you sure you wish to\r\remove all graphics from your current session?");
            if (con) {
                editToolbar.deactivate();
                drawToolsLayer.clear();
                dojo.forEach(dijit.byId('collapseToolbar').getChildren(), function (child) {
                    child.set("disabled", false);
                });
            }
        }
    }));
    ctxMenuForGraphics.startup();

    drawToolsLayer.on("mouse-over", function (evt) {
        // We'll use this "selected" graphic to enable editing tools
        // on this graphic when the user click on one of the tools
        // listed in the menu.
        selected = evt.graphic;

        // Let's bind to the graphic underneath the mouse cursor           
        ctxMenuForGraphics.bindDomNode(evt.graphic.getDojoShape().getNode());
    });

    drawToolsLayer.on("mouse-out", function (evt) {
        ctxMenuForGraphics.unBindDomNode(evt.graphic.getDojoShape().getNode());
    });
}