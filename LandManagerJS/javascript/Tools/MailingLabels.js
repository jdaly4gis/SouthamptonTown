function doMailingLabels() {
    map.setCursor("progress");
    //var findMLTask = new esri.tasks.QueryTask(lmURL + "/0");

    var query = new esri.tasks.Query();
    query.returnGeometry = false;
    query.where = "PARCEL_ID = " + dijit.byId('mls').get('value').split(';')[0] + " and DSBL like '" + dijit.byId('mls').get('value').split(';')[1] + "%'";
    //query.outFields = ["*"];
    map.infoWindow.hide();
    map.graphics.clear();
    query.returnGeometry = true;
    taxParcelQueryTask.execute(query, polySpatialRel);
}

function polySpatialRel(poly) {
    //map.graphics.clear();
    map.getLayer("mailingLabelsGraphicsLayer").clear();
    var params = new esri.tasks.BufferParameters();
    var geom;
    geom = poly.features[0].geometry;
    if (geom.type === "polygon") {
        params.geometries = [geom];
        params.distances = [dijit.byId('buffdist').get('value')];
        params.unit = esri.tasks.GeometryService.UNIT_FOOT;
        params.bufferSpatialReference = map.spatialReference;
        params.outSpatialReference = map.spatialReference;
        if (params.distances != 0) {
            gsvc.buffer(params, getBufferForMailingLables);
        }
        else {
            query.outSpatialReference = params.bufferSpatialReference;
            query.spatialRelationship = esri.tasks.Query.SPATIAL_REL_TOUCHES;
            var symbol = useDefaultSymbol();
            var graphic = new esri.Graphic(geom, symbol);
            query.geometry = graphic.geometry;
            map.setExtent(geom.getExtent());
            taxParcelQueryTask.execute(query, getMailingLabels, function (e) {
                alert("There was an error in executing your query.\n\rPlease try again");
                map.setCursor("default");
            });
        }
    }
}
function getBufferForMailingLables(geometries) {
    var query = new esri.tasks.Query();
    query.returnGeometry = true;
    query.outFields = ["*"];
    var graphic = new esri.Graphic(geometries[0]);
    query.geometry = geometries[0];
    query.outSpatialReference = map.spatialReference;
    query.spatialRelationship = esri.tasks.Query.SPATIAL_REL_INTERSECTS;
    taxParcelQueryTask.execute(query, function (e) {
        getMailingLabels(e, "single");
    });
}
function getMailingLabels(fset, sender) {
    var mailingFeatures = [];
    var symbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID,
                new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255, 170, 0]), 2), null);
    var resultFeatures = fset.features;
    var firstGraphic = resultFeatures[0];
    var firstSymbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID,
                        new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID, new dojo.Color([100, 100, 100]), 3), 
                        new dojo.Color([255, 0, 0, 0.20]));
    firstGraphic.setSymbol(firstSymbol);
    var sagYes = false;
    for (var i = 0, il = resultFeatures.length; i < il; i++) {
        var graphic = resultFeatures[i];

        if (graphic.attributes.PARCEL_ID == dijit.byId('mls').get('value') && sender != "interactive") {
            graphic.setSymbol(firstSymbol);
        } else {
            graphic.setSymbol(symbol);
        }
        if (!(resultFeatures[i].attributes.HAMLET == "Village of Sag Harbor - EH")) {
            if (graphic.attributes.PARCEL_ID == dijit.byId('mls').get('value') && sender != "interactive") {
                if (dijit.byId("includeOrig").checked) {
                    mailingFeatures.push(dojo.toJson(graphic.attributes.PARCEL_ID));
                    map.getLayer("mailingLabelsGraphicsLayer").add(graphic);
                }
            } else {
                mailingFeatures.push(dojo.toJson(graphic.attributes.PARCEL_ID));
                map.getLayer("mailingLabelsGraphicsLayer").add(graphic);
            }
        } else {
            sagYes = true; 
        }
    }
    if (sagYes) {
        alert('Your Selection Contains Sag Harbor East Hampton Parcels\n\rThey will not be included in the mailing labels');
    }
    if (mailingFeatures.length > 0) {
        var labelIDs = mailingFeatures.join();
        var theURL = "LabelSearch.aspx?p_ids=" + labelIDs + "&typedata=1";
        showMailingLabels(theURL, 800, 515);
        zoomFeatureSetExtemt(fset);
    } else {
        alert("Please Try another Selection");
        map.setCursor("default");
    }
}
function showMailingLabels(filename, width, height) {
    var winl = (screen.width - width) / 2;
    var wint = (screen.height - height) / 2;
    var winprops = 'height=' + height + ',width=' + width + ',top=' + wint + ',left=' + winl + ',scrollbars=yes';
    newwindow = window.open(filename, 'MailingLabels', winprops);
    if (window.focus) { newwindow.focus() }
}
