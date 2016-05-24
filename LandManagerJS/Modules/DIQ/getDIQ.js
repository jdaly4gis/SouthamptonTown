function changeDIQVis(sender, field, id) {
    //if (document.getElementById('govHold').checked) {
    //    id += 3;
    //}
    var checks = document.getElementsByName(sender + "_sublayers");
    var query = [];
    for (var i = 0; i < checks.length; i++) {
        if (checks[i].checked) {
            query.push("'" + checks[i].id + "'");
        }
    }
    var layer = map.getLayer("diqLayers");
    
    var definitions = layer.layerDefinitions == undefined ? [] : layer.layerDefinitions;
    definitions[id] = field + " in (" + query.join(',') + ")";
    layer.setLayerDefinitions(definitions, false);
}
function getDIQ(field, sender, id) {
    if (document.getElementById('govHold').checked) {
        id += 3;
    }
    
    var layer = map.getLayer("diqLayers");
    if (layer && field != "") {
        var appSettings = (document.getElementById('govHold').checked ? sender + "_HOLD" : sender);
        var querys = "?field=" + field + "&sender=" + appSettings;
        var masterInfo = jsonParse(callASHX("/modules/diq/DIQ.ashx" + querys));
        if (masterInfo.length) {
            field += "_CD";
            layer.setVisibility(true);
            layer.refresh();

            var colors = {};
            var defaultSymbol = new esri.symbol.SimpleFillSymbol().setStyle(esri.symbol.SimpleFillSymbol.STYLE_NULL);
            defaultSymbol.outline.setStyle(esri.symbol.SimpleLineSymbol.STYLE_NULL);
            var renderer = new esri.renderer.UniqueValueRenderer(null, field);

            var query = [];
            var legend = '';
            for (var i = 0; i < masterInfo.length; i++) {
                var hex = rainbow(masterInfo.length, i);
                var color = dojo.Color.fromHex(hex);
                renderer.addValue(masterInfo[i].DIQ_CD, new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([color.r, color.g, color.b])));
                legend += '<div style="margin-left:15px"><input name="' + sender + '_sublayers" id="' + masterInfo[i].DIQ_CD + '" type="checkbox" checked onclick="changeDIQVis(\'' + sender + '\', \'' + field + '\', \'' + id + '\');" style="vertical-align:middle;" /><span style="vertical-align:middle; margin-left: 5px;">' + masterInfo[i].DIQ_VAL + " (" +masterInfo[i].DIQ_CD + ')</span><div style="height: 15px; width: 15px; border: solid 1px; background-color: ' + hex + '; margin-left:25px;"></div></div>';
                query.push("'" + masterInfo[i].DIQ_CD + "'");
            }
            var definitions = [];
            definitions[id] = field + " in (" + query.join(',') + ")";

            layer.setLayerDefinitions(definitions, false);

            document.getElementById(sender + '_Legend').innerHTML = legend;

            var layerDrawingOptions = layer.layerDrawingOptions == undefined ? [] : layer.layerDrawingOptions;
            var layerDrawingOption = new esri.layers.LayerDrawingOptions();
            layerDrawingOption.renderer = renderer;

            if (masterInfo.length > 6) {
                var labelClass = new esri.layers.LabelClass({
                    labelExpression: "[" + field + "]",
                    labelPlacement: "always-horizontal",
                    symbol: new esri.symbol.TextSymbol({
                        font: new esri.symbol.Font("6", esri.symbol.Font.STYLE_NORMAL, esri.symbol.Font.VARIANT_NORMAL, esri.symbol.Font.WEIGHT_BOLD, "Calibri"),
                        color: new dojo.Color('black')
                    }),
                    maxScale: 0,
                    minScale: 6000
                });
                labelClass.labelPlacement = "esriServerPolygonPlacementAlwaysHorizontal"; //"esriServerPolygonPlacementAlwaysHorizontal"

                layerDrawingOption.labelingInfo = [labelClass];
                layerDrawingOption.showLabels = true;
            }

            layerDrawingOptions[id] = layerDrawingOption;
            layer.setLayerDrawingOptions(layerDrawingOptions, false);
            if (!layer.visible) {
                layer.setVisibility(true);
            }
            var visLayers = layer.visibleLayers;
            if (layer.visibleLayers.indexOf(id) == -1) {
                if (((id == 1 && layer.visibleLayers.indexOf(2) != -1) || (id == 2 && layer.visibleLayers.indexOf(1) != -1) && !document.getElementById('govHold').checked)) {
                    if (id == 1) {
                        visLayers.splice(visLayers.indexOf(2), 1);
                        visLayers.push(id);
                        document.getElementById('MA_LAND_VW_CHECK').checked = false;
                    } else if (id == 2) {
                        visLayers.splice(visLayers.indexOf(1), 1);
                        visLayers.push(id);
                        document.getElementById('MA_SITE_VW_CHECK').checked = false;
                    }
                } else if (((id == 4 && layer.visibleLayers.indexOf(5) != -1) || (id == 5 && layer.visibleLayers.indexOf(4) != -1) && document.getElementById('govHold').checked)) {
                    if (id == 4) {
                        visLayers.splice(visLayers.indexOf(5),1);
                        visLayers.push(id);
                        document.getElementById('MA_LAND_VW_CHECK').checked = false;
                    } else if (id == 5) {
                        visLayers.splice(visLayers.indexOf(4),1);
                        visLayers.push(id);
                        document.getElementById('MA_SITE_VW_CHECK').checked = false;
                    }
                } else {
                    visLayers.push(id);
                }
                document.getElementById(sender + '_CHECK').checked = true;
            }

            layer.setVisibleLayers(visLayers);
            map.enableScrollWheelZoom();
        } else {
            alert('There was an error loading the Data From Govern');
            document.getElementById(sender + '_Legend').innerHTML == "";
        }
    } else if (field != "") {
        alert('There was an error loading the Layers');
        document.getElementById(sender + '_Legend').innerHTML == "";
    }
    
}
function addDIQLayers() {
    var DIQs = new esri.layers.ArcGISDynamicMapServiceLayer("https://gis2.southamptontownny.gov/arcgis/rest/services/DataServices/DIQ/MapServer", { id: "diqLayers", visible: false });
    map.addLayer(DIQs, map.layerIds.length - 1);
    DIQs.setVisibleLayers([]);
}
function diqHandler(sender) {
    var list = document.getElementById('navcontainer');
    var items = list.getElementsByTagName('li');
    
    for (var i = 0; i < items.length; i++) {
        var currentID = items[i].id.replace('_Header', '');
        if (sender == items[i]) {
            items[i].style.backgroundColor = "#b2c1d1";
            document.getElementById(currentID).style.display = "block";
        } else {
            items[i].style.backgroundColor = "";
            document.getElementById(currentID).style.display = "none";
        }
    }
}
//function setGovHold(ele) {
//    var layer = map.getLayer("diqLayers");
//    var visLayers = layer.visibleLayers;
//    if (ele.checked) {
//        for (var i = 0; i < visLayers.length; i++) {
//            visLayers[i] += 3;
//        }
//    } else {
//        for (var i = 0; i < visLayers.length; i++) {
//            visLayers[i] -= 3;
//        }
//    }
//    layer.setVisibleLayers(visLayers);
//}
function setGovHold(ele) {
    document.getElementById('BLDG_DIQ_Legend').innerHTML = "";
    document.getElementById('MA_LAND_VW_Legend').innerHTML = "";
    document.getElementById('MA_SITE_VW_Legend').innerHTML = "";
    document.getElementById('BLDG_DIQ_CHECK').checked = false;
    document.getElementById('MA_SITE_VW_CHECK').checked = false;
    document.getElementById('MA_LAND_VW_CHECK').checked = false;
    document.getElementById('BLDG_DIQ_SELECT').value = '';
    document.getElementById('MA_SITE_VW_SELECT').value = '';
    document.getElementById('MA_LAND_VW_SELECT').value = '';

    map.getLayer("diqLayers").setVisibleLayers([]);
}
function changeDIQLayerVisibility(id, sender) {
    var layer = map.getLayer("diqLayers");
    var visLayers = layer.visibleLayers;
    if (document.getElementById('govHold').checked) {
        id += 3;
    }
    var oo = visLayers.indexOf(id);
    if (layer.visibleLayers.indexOf(id) == -1 && sender.checked) {
        visLayers.push(id);
    } else {
        visLayers.splice(visLayers.indexOf(id), 1);
    }
    layer.setVisibleLayers(visLayers);
    
}
function rainbow(numOfSteps, step) {
    var r, g, b;
    var h = step / numOfSteps;
    var i = ~~(h * 6);
    var f = h * 6 - i;
    var q = 1 - f;
    switch (i % 6) {
        case 0: r = 1, g = f, b = 0; break;
        case 1: r = q, g = 1, b = 0; break;
        case 2: r = 0, g = 1, b = f; break;
        case 3: r = 0, g = q, b = 1; break;
        case 4: r = f, g = 0, b = 1; break;
        case 5: r = 1, g = 0, b = q; break;
    }
    var c = "#" + ("00" + (~ ~(r * 255)).toString(16)).slice(-2) + ("00" + (~ ~(g * 255)).toString(16)).slice(-2) + ("00" + (~ ~(b * 255)).toString(16)).slice(-2);
    return (c);
}