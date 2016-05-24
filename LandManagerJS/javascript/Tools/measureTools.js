function activateMeasureTools(sender) {
    activeMeasureTool = sender;
    editToolbar.deactivate();
    dijit.byId('convertMeasureGraphicsBTN').set('disabled', true);
    map.getLayer("measureGraphicsLayer").clear();

    switch (sender) {
        case "point":
            document.getElementById("pointSelect").style.display = "block";
            document.getElementById("lengthSelect").style.display = "none";
            document.getElementById("areaSelect").style.display = "none";
            measureToolbar.activate(esri.toolbars.Draw.POINT);
            break; ;
        case "polyline":
            document.getElementById("pointSelect").style.display = "none";
            document.getElementById("lengthSelect").style.display = "block";
            document.getElementById("areaSelect").style.display = "none";
            measureToolbar.activate(esri.toolbars.Draw.POLYLINE);
            dynamicMeasurements(sender);
            break;
        case "polygon":
            document.getElementById("pointSelect").style.display = "none";
            document.getElementById("lengthSelect").style.display = "block";
            document.getElementById("areaSelect").style.display = "block";
            measureToolbar.activate(esri.toolbars.Draw.POLYGON);
            dynamicMeasurements(sender);
            break;
        case "circle":
            document.getElementById("pointSelect").style.display = "none";
            document.getElementById("lengthSelect").style.display = "block";
            document.getElementById("areaSelect").style.display = "block";
            measureToolbar.activate(esri.toolbars.Draw.CIRCLE);
            dynamicMeasurements(sender);
            break;
    }

}
function dynamicMeasurements(sender) {
    dojo.disconnect(clickHandler);
    var totalLength = 0;
    clickHandler = map.on('click', function (evt) {
        var ooo = "p";
        if (measureToolbar._graphic) {
            var vertex = measureToolbar._graphic.geometry.paths && !measureToolbar._graphic.geometry.points ? measureToolbar._graphic.geometry.paths[0] : measureToolbar._graphic.geometry.rings[0];
            if (vertex.length > 1) {
                var endPoint = vertex[vertex.length - 1];
                var startPoint = vertex[vertex.length - 2];

                var adjacent = startPoint[0] - endPoint[0];
                var opposite = startPoint[1] - endPoint[1];

                var hypotenuse = Math.sqrt(((adjacent * adjacent) + (opposite * opposite)));

                if (hypotenuse > 0) {
                    var angle = Math.atan2(opposite, adjacent) * (180 / Math.PI);

                    if (((opposite <= 0 || adjacent <= 0) && angle > 0) || (opposite <= 0 && adjacent <= 0 && angle <= 0)) {
                        angle += 180;
                    }
                    var midPoint = new esri.geometry.Point([(startPoint[0] + endPoint[0]) / 2, (startPoint[1] + endPoint[1]) / 2], map.spatialReference);

                    var sel = document.getElementById("lengthSelect");
                    totalLength += Math.round(hypotenuse / unitConversion(sel.options[sel.selectedIndex].text), 0) * 1;

                    var graphic = new esri.Graphic(midPoint, getMeasurementTextSymbol(startPoint, endPoint, dojo.number.format(Math.round(hypotenuse / unitConversion(sel.options[sel.selectedIndex].text), 0), { places: 0, locale: 'en-us' }), angle));
                    map.getLayer("measureGraphicsLayer").add(graphic);
                }
            }
        }
    });
    dojo.disconnect(hoverHandler);
    hoverHandler = map.on("mouse-move", function (evt) {
        if (measureToolbar._graphic) {
            var graphicVertex = measureToolbar._graphic.geometry.paths && !measureToolbar._graphic.geometry.points ? measureToolbar._graphic.geometry.paths[0] : measureToolbar._graphic.geometry.rings[0];
            var endPoint = evt.mapPoint;
            var startPoint = graphicVertex[graphicVertex.length - 1];
            var firstPoint = graphicVertex[0];

            var run = startPoint[0] - endPoint.x;
            var rise = startPoint[1] - endPoint.y;

            var a2b2 = ((run * run) + (rise * rise));

            var hypotenuse = Math.sqrt(a2b2);
            if (hypotenuse > 0) {
                var sel = document.getElementById("lengthSelect");
                var val = (hypotenuse / unitConversion(sel.options[sel.selectedIndex].text)) + totalLength;
                //if (measureToolbar._graphic.geometry.type == "polygon" && graphicVertex.length > 2) {
                //    var hyp2 = Math.sqrt(Math.pow((endPoint.x - firstPoint[0]), 2) + Math.pow((endPoint.y - firstPoint[1]), 2));
                //    val += (hyp2 / unitConversion(sel.options[sel.selectedIndex].text));
                //}
                document.getElementById('measureLengthResult').innerHTML = dojo.number.format(val, { places: 0, locale: 'en-us' }) + " " + sel.options[sel.selectedIndex].text;
            }
        }
    });
}
function getMeasurementTextSymbol(pt1, pt2, val, angle) {
    return new esri.symbol.TextSymbol({
        text: val,
        angle: angle,
        type: "esriTS",
        color: new dojo.Color([255, 0, 0]),
        font: {
            size: 16,
            style: 'normal',
            type: 'font',
            variant: "normal",
            weight: "normal",
            family: "Lucida Grande Console"
        }
    });
}

function getAreaAndLength(geometry) {
    dojo.byId("measureResult").innerHTML = "<img alt='' src='images/wait.gif' />";
    document.getElementById('measureLengthResult').innerHTML = "";
    dijit.byId('convertMeasureGraphicsBTN').set('disabled', true);
    var symbol;
    switch (geometry.type) {
        case "point":
            var params = new esri.tasks.ProjectParameters();
            params.geometries = [geometry];
            params.outSR = new esri.SpatialReference({ wkid: document.getElementById("pointSelect").value });
            //params.transformation = transformation;
            gsvc.project(params, outputAreaAndLength, function (e) {
                dojo.byId("measureResult").innerHTML = "<img alt='' src='' />";
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
            gsvc.lengths(lengthParams, outputAreaAndLength, function (e) {
                dojo.byId("measureResult").innerHTML = "<img alt='' src='' />";
            });
            break;
        case "polygon":
            symbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_DASHDOT, new dojo.Color([255, 0, 0]), 1.5), new dojo.Color([255, 255, 0, 0.25]));
            var graphic = new esri.Graphic(geometry);
            var areasAndLengthParams = new esri.tasks.AreasAndLengthsParameters();
            areasAndLengthParams.lengthUnit = eval(document.getElementById("lengthSelect").value);
            areasAndLengthParams.areaUnit = eval(document.getElementById("areaSelect").value);
            areasAndLengthParams.polygons = [geometry];
            gsvc.areasAndLengths(areasAndLengthParams, outputAreaAndLength, function (e) {
                dojo.byId("measureResult").innerHTML = "<img alt='' src='' />";
            });
            break;
    }
    var graphic = new esri.Graphic(geometry, symbol, { "type": activeMeasureTool });
    map.getLayer("measureGraphicsLayer").clear();
    map.getLayer("measureGraphicsLayer").add(graphic);
    dijit.byId('convertMeasureGraphicsBTN').set('disabled', false);
    measureToolbar.deactivate();
    dojo.disconnect(hoverHandler);
    dojo.disconnect(clickHandler);
}
function editMeasureGraphic(graphic) {
    if (activeMeasureTool == "circle" || activeMeasureTool == "") {

    } else {
        activateToolbar(graphic, "measure");
    }
}
function outputAreaAndLength(result) {
    switch (activeMeasureTool) {
        case "point":
            if (document.getElementById("pointSelect")[document.getElementById("pointSelect").selectedIndex].text == "DMS") {
                dojo.byId("measureResult").innerHTML = "Longitude (x): " + DMS(result[0].x) + "<br/> Latitude (y): " + DMS(result[0].y);
            } else {
                dojo.byId("measureResult").innerHTML = "Longitude (x): " + result[0].x.toFixed(6) + "<br/> Latitude (y): " + result[0].y.toFixed(6);
            }
            break;
        case "polyline":
            dojo.byId("measureResult").innerHTML = dojo.number.format(result.lengths[0].toFixed(2)) + " " + document.getElementById("lengthSelect")[document.getElementById("lengthSelect").selectedIndex].text;
            break;
        case "polygon":
            dojo.byId("measureResult").innerHTML = "Perimeter: " + dojo.number.format(result.lengths[0].toFixed(2)) + " " + document.getElementById("lengthSelect")[document.getElementById("lengthSelect").selectedIndex].text + "<br/>" + dojo.number.format(result.areas[0].toFixed(2)) + " " + document.getElementById("areaSelect")[document.getElementById("areaSelect").selectedIndex].text;
            break;
        case "circle":
            measureToolbar.finishDrawing();
            //6.28318 is 2 * pi
            dojo.byId("measureResult").innerHTML = " Radius: " + dojo.number.format(result.lengths[0].toFixed(3) / 6.28318) + " " + document.getElementById("lengthSelect")[document.getElementById("lengthSelect").selectedIndex].text + "<br/>Area: " + dojo.number.format(result.areas[0].toFixed(2)) + " " + document.getElementById("areaSelect")[document.getElementById("areaSelect").selectedIndex].text;
            break;
    }
}
function DMS(val) {
    var value = val.toString().split('.');
    var d, m, s, ms;
    d = value[0];
    mss = ("." + value[1]) * 60;
    ms = mss.toString().split('.');
    m = ms[0];
    s = ("." + ms[1]) * 60;
    return d + "&deg " + m + "&quot " + Math.round(s * 10000) / 10000 + "'";
}
function measureGraphichandleChange(sender) {
    var graphi = map.getLayer("measureGraphicsLayer").graphics;
    if (graphi[0] && graphi[0].symbol.type != "textsymbol") {
        getAreaAndLength(graphi[0].geometry);
    }
}
function convertMeasureToGraphic() {
    var graphi = map.getLayer("measureGraphicsLayer").graphics;
    for (var i = 0; i < graphi.length; i++) {
        if (graphi[i].symbol.type != "textsymbol") {
            drawEnd(graphi[i].geometry, "convertGraphics");
            map.getLayer("measureGraphicsLayer").clear();
        }
    }
    dijit.byId('convertMeasureGraphicsBTN').set('disabled', true);
}
function unitConversion(unit) {
    var value;
    switch (unit) {
        case "Miles":
            value = 5280;
            break;
        case "Kilometers":
            value = 3280.84;
            break;
        case "Feet":
            value = 1;
            break;
        case "Meters":
            value = 3.28084;
            break;
        case "Nautical Mile":
            value = 6076.12;
            break;
    }
    return value;
}

function addPointViaLatLng(x, y) {
    var pt = new esri.geometry.Point(x, y);
    var params = new esri.tasks.ProjectParameters();
    params.geometries = [pt];
    params.outSR = map.spatialReference;


    gsvc.project(params, function (geom) {
        map.centerAndZoom(geom[0], 7);

        var symbol = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_SQUARE, 20, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255, 0, 0]), 1), new dojo.Color([0, 255, 0, 0.25]));
        var graphic = new esri.Graphic(geom[0], symbol);
        map.getLayer("measureGraphicsLayer").clear();
        map.getLayer("measureGraphicsLayer").add(graphic);
        dijit.byId('convertMeasureGraphicsBTN').set('disabled', false);
        activeMeasureTool = "";
    }, function (e) {
        alert('there was an error');
    })

}