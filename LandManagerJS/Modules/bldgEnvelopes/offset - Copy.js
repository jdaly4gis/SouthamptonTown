function initOffset(evt, setBacks) {
    var ogParcel = new esri.layers.GraphicsLayer({ 'id': 'originalParcel' });
    var polygon = evt.features[0].geometry;
    var sfs = new esri.symbol.SimpleFillSymbol();
    var ogPolyGraphic = new esri.Graphic(polygon, sfs, setBacks.Setbacks);
    ogParcel.add(ogPolyGraphic);
    map.addLayer(ogParcel);

    //add line feature
    var firstPoint = evt.features[0].geometry.rings[0][0];
    var lastPointIndex = evt.features[0].geometry.rings[0].length - 2;

    var polyLineLayer = new esri.layers.GraphicsLayer({ 'id': 'polygonToLineLayer' });
    map.addLayer(polyLineLayer);
    var workspaceLayer = new esri.layers.GraphicsLayer({ 'id': 'workspaceLayer' });
    map.addLayer(workspaceLayer);

    var features = [];
    for (i = 0; i < evt.features[0].geometry.rings[0].length - 1; i++) {
        currentPoint = evt.features[0].geometry.rings[0][i];
        var nextPoint;
        if (i == lastPointIndex) {
            nextPoint = firstPoint;
        } else {
            nextPoint = evt.features[0].geometry.rings[0][i + 1];
        }
        var polylineJson = {
            "paths": [[currentPoint, nextPoint]],
            "spatialReference": { "wkid": 102718 }
        };
        var polyline = new esri.geometry.Polyline(polylineJson);
        var graphic = new esri.Graphic(polyline, defaultSymbol, { "OBJECTID": i, "side": "" });

        polyLineLayer.add(graphic);
    }
    map.addLayer(polyLineLayer);
    map.setExtent(polygon.getExtent(), true);
}
//function beFinishBtnClick() {
//    map.setCursor("progress");
//    var params = new esri.tasks.BufferParameters();
//    var front, back;
//    var layer = map.getLayer('polygonToLineLayer');
//    var ogParcel = map.getLayer('originalParcel');
//    var setBacks = ogParcel.graphics[0].attributes;
//    var geoms = {};
//    for (var i = 0; i < layer.graphics.length; i++) {
//        if (layer.graphics[i].attributes.side == "Front") {
//            front = 1;
//        } else if (layer.graphics[i].attributes.side == "Rear") {
//            back = 1;
//        }
//        if (layer.graphics[i].attributes.side != "") {

//            if (geoms[layer.graphics[i].attributes.side]) {
//                geoms[layer.graphics[i].attributes.side].push(layer.graphics[i].geometry);
//            } else {
//                geoms[layer.graphics[i].attributes.side] = [];
//                geoms[layer.graphics[i].attributes.side].push(layer.graphics[i].geometry);
//            }
//        } else {
//            if (geoms["Side"]) {
//                geoms["Side"].push(layer.graphics[i].geometry);
//            } else {
//                geoms["Side"] = [];
//                geoms["Side"].push(layer.graphics[i].geometry);
//            }
//        }
//    }
//    if (front == 1 && back == 1) {
//        var workspaceLayer = map.getLayer('workspaceLayer');
//        for (var x in geoms) {
//            params.geometries = geoms[x];
//            params.distances = [setBacks[x]];
//            params.unit = gsvc.UNIT_FOOT;
//            params.bufferSpatialReference = map.spatialReference
//            params.outSpatialReference = map.spatialReference;
//            params.unionResults = true;
//            gsvc.buffer(params, function (geoms) {
//                gsvc.intersect(geoms, ogParcel.graphics[0].geometry, function (e) {
//                    for (var i = 0; i < e.length; i++) {
//                        var graphic = new esri.Graphic(e[i], finishedSymbol);
//                        workspaceLayer.add(graphic);
//                        map.setCursor("default");
//                    }
//                }, function (e) { map.setCursor("default"); alert(e); });
//            }, function (e) { map.setCursor("default"); alert(e); });
//        }
//    } else {
//        map.setCursor("default");
//        alert('Please select a front or a back');
//    }
//}
function beFinishBtnClick() {
    map.setCursor("progress");
    var params = new esri.tasks.BufferParameters();
    var front, back;
    var layer = map.getLayer('polygonToLineLayer');
    var ogParcel = map.getLayer('originalParcel');
    var setBacks = ogParcel.graphics[0].attributes;
    var geoms = {};
    for (var i = 0; i < layer.graphics.length; i++) {
        if (layer.graphics[i].attributes.side == "Front") {
            front = 1;
        } else if (layer.graphics[i].attributes.side == "Rear") {
            back = 1;
        }
        if (layer.graphics[i].attributes.side != "") {

            if (geoms[layer.graphics[i].attributes.side]) {
                geoms[layer.graphics[i].attributes.side].push(layer.graphics[i].geometry);
            } else {
                geoms[layer.graphics[i].attributes.side] = [];
                geoms[layer.graphics[i].attributes.side].push(layer.graphics[i].geometry);
            }
        } else {
            if (geoms["Side"]) {
                geoms["Side"].push(layer.graphics[i].geometry);
            } else {
                geoms["Side"] = [];
                geoms["Side"].push(layer.graphics[i].geometry);
            }
        }
    }
    if (front == 1 && back == 1) {
        var workspaceLayer = map.getLayer('workspaceLayer');
        var all = {};
        for (var x in geoms) {
            params.geometries = geoms[x];
            params.distances = [setBacks[x]];
            params.unit = gsvc.UNIT_FOOT;
            params.bufferSpatialReference = map.spatialReference
            params.outSpatialReference = map.spatialReference;
            params.unionResults = true;

            all[x] = gsvc.buffer(params);
        }
        dojo.promise.all(all).then(function (results) {
            var geoms = [];
            for (var g in results) {
                geoms.push(results[g][0]);
            }
            gsvc.intersect(geoms, ogParcel.graphics[0].geometry, function (e) {
                for (var i = 0; i < e.length; i++) {
                    var graphic = new esri.Graphic(e[i], finishedSymbol);
                    workspaceLayer.add(graphic);
                }
                map.setCursor("default");
            }, function (e) {
                map.setCursor("default"); alert(e);
            });
        }, function (e) {
            map.setCursor("default"); alert(e);
        });
    } else {
        map.setCursor("default");
        alert('Please select a front or a back');
    }
}
function selectionEnd(geometry, side) {
    beToolBar.deactivate();
    var ogLayer = map.getLayer('polygonToLineLayer');
    var originalP = map.getLayer('originalParcel').graphics[0];
    var offsetGeometry = [];

    for (var i = 0; i < ogLayer.graphics.length; i++) {
        //if (ogLayer.graphics[i].symbol == defaultSymbol) {
        var line1start = new esri.geometry.Point(ogLayer.graphics[i].geometry.paths[0][0], map.spatialReference);
        var line1end = new esri.geometry.Point(ogLayer.graphics[i].geometry.paths[0][1], map.spatialReference);

        var firstPoint = geometry.rings[0][0];
        for (var g = 0; g < geometry.rings[0].length; g++) {
            currentPoint = geometry.rings[0][g];
            var nextPoint;
            if (g == geometry.rings[0].length - 1) {
                nextPoint = firstPoint;
            } else {
                nextPoint = geometry.rings[0][g + 1];
            }

            if (currentPoint[0] != nextPoint[0] && currentPoint[1] != nextPoint[1]) {
                var line2start = new esri.geometry.Point(currentPoint, map.spatialReference);
                var line2end = new esri.geometry.Point(nextPoint, map.spatialReference);

                var intersects = line_intersects_Y_N(line1start.x, line1start.y, line1end.x, line1end.y, line2start.x, line2start.y, line2end.x, line2end.y);
                if (intersects == 1 || geometry.contains(line1start) || geometry.contains(line1end)) {
                    var iiiii = offsetGeometry.indexOf(ogLayer.graphics[i]);
                    if (iiiii == -1) {
                        if (ogLayer.graphics[i].symbol != highlightSymbol) {
                            offsetGeometry.push(ogLayer.graphics[i]);
                            ogLayer.graphics[i].attributes.side = side;
                            ogLayer.graphics[i].setSymbol(highlightSymbol);
                        } else if (ogLayer.graphics[i].symbol == highlightSymbol) {
                            offsetGeometry.push(ogLayer.graphics[i]);
                            ogLayer.graphics[i].setSymbol(defaultSymbol);
                            ogLayer.graphics[i].attributes.side = "";
                        }
                    }
                }
            }
        }
    }
}


function line_intersects_Y_N(p0_x, p0_y, p1_x, p1_y, p2_x, p2_y, p3_x, p3_y) {

    var s1_x, s1_y, s2_x, s2_y;
    s1_x = p1_x - p0_x;
    s1_y = p1_y - p0_y;
    s2_x = p3_x - p2_x;
    s2_y = p3_y - p2_y;

    var s, t;
    s = (-s1_y * (p0_x - p2_x) + s1_x * (p0_y - p2_y)) / (-s2_x * s1_y + s1_x * s2_y);
    t = (s2_x * (p0_y - p2_y) - s2_y * (p0_x - p2_x)) / (-s2_x * s1_y + s1_x * s2_y);

    if (s >= 0 && s <= 1 && t >= 0 && t <= 1) {
        // Collision detected
        return 1;
    }
    return 0; // No collision
}

function bePanelHandler(sender) {
    var ogParcel = map.getLayer('originalParcel');
    var polyLineLayer = map.getLayer('polygonToLineLayer');
    var workspaceLayer = map.getLayer('workspaceLayer');

    document.getElementById('beDialog').style.display = (document.getElementById('beDialog').style.display != 'none' ? 'none' : '');

    //dojo.byId('beDialog').style.display == "none" ? "block" : "none";

    if (document.getElementById('beDialog').style.display == "none") {
        beToolBar.deactivate();
        ogParcel != null ? ogParcel.setVisibility(false) : "";
        polyLineLayer != null ? polyLineLayer.setVisibility(false) : "";
        workspaceLayer != null ? workspaceLayer.setVisibility(false) : "";
    } else {
        ogParcel != null ? ogParcel.setVisibility(true) : "";
        polyLineLayer != null ? polyLineLayer.setVisibility(true) : "";
        workspaceLayer != null ? workspaceLayer.setVisibility(true) : "";
    }
}
function beClear(sender) {
    beToolBar.deactivate();
    var ogParcel = map.getLayer('originalParcel');
    var polyLineLayer = map.getLayer('polygonToLineLayer');
    var workspaceLayer = map.getLayer('workspaceLayer');

    ogParcel != null ? map.removeLayer(ogParcel) : "";
    polyLineLayer != null ? map.removeLayer(polyLineLayer) : "";
    workspaceLayer != null ? map.removeLayer(workspaceLayer) : "";

    dijit.byId('beSelect').set('disabled', false);
    dijit.byId('beSides').set('disabled', true);
    dijit.byId('beFinishBtn').set('disabled', true);
    document.getElementById('beInfoMeasureContainer').innerHTML = "There are No Setbacks";
}