function clearStreetView() {
    var svlayer = map.getLayer('svGraphicLayer');
    if (svlayer) {
        svlayer.clear();
    }
}

function StreetView(evt) {
    var svlayer = map.getLayer('svGraphicLayer');
    if (!svlayer) {
        var streetViewGraphic = new esri.layers.GraphicsLayer({ id: 'svGraphicLayer' });
        map.addLayer(streetViewGraphic);
    } else {
        svlayer.clear();
    }
    var sv = new google.maps.StreetViewService();

    document.getElementById("svX").value = evt.mapPoint.x;
    document.getElementById("svY").value = evt.mapPoint.y;
    var panoOptions = {

        addressControlOptions: {
            position: google.maps.ControlPosition.BOTTOM
        },
        clickToGo: true,
        linksControl: false,
        panControl: false,
        zoomControlOptions: {
            style: google.maps.ZoomControlStyle.SMALL
        },
        enableCloseButton: false
    };
    panorama = new google.maps.StreetViewPanorama(document.getElementById('streetview'), panoOptions);

    var outSR = new esri.SpatialReference({ wkid: 4326 });
    gsvc.project([evt.mapPoint], outSR, function (projectedPoints) {
        sv.getPanoramaByLocation(new google.maps.LatLng(projectedPoints[0].y, projectedPoints[0].x), 50, processSVData);
        //var heading = panorama.getPov().heading;
    }, function (e) { alert(e.message); });
}

function processSVData(data, status) {
    if (status == google.maps.StreetViewStatus.OK) {

        panorama.setPano(data.location.pano);
        panorama.setPov({
            heading: 270,
            pitch: 0
        });

        document.getElementById('svDialog').style.display = "block";
        panorama.setVisible(true);
        google.maps.event.addListener(panorama, 'pov_changed', function () {
            var heading = panorama.getPov().heading + 5;
                     
            if (svlayer.graphics[0]) {
                svlayer.graphics[0].symbol.setAngle(heading);
                svlayer.redraw();
            }
        });
        google.maps.event.addListener(panorama, 'position_changed', function () {
            var point = new esri.geometry.Point({ "x": panorama.getPosition().lng(), "y": panorama.getPosition().lat(), " spatialReference": { " wkid": 4326 } });
            svlayer.clear();

            gsvc.project([point], map.spatialReference, function (projectedPoints) {
                var symbol = new esri.symbol.PictureMarkerSymbol('http://static.arcgis.com/images/Symbols/Arrows/icon120.png', 25, 25);
                var heading = panorama.getPov().heading + 5;
                symbol.setAngle(heading);

                svlayer.add(new esri.Graphic(projectedPoints[0], symbol));
                map.centerAt(projectedPoints[0]);
            });
        });
        var svlayer = map.getLayer('svGraphicLayer');
        svlayer.clear();
        var symbol = new esri.symbol.PictureMarkerSymbol('http://static.arcgis.com/images/Symbols/Arrows/icon120.png', 25, 25);
        var heading = panorama.getPov().heading + 5;
        symbol.setAngle(heading);

        var point = new esri.geometry.Point(document.getElementById("svX").value, document.getElementById("svY").value, map.spatialReference);

        var graphic = new esri.Graphic(point, symbol);
        svlayer.add(graphic);
    } else {
        alert('Street View data not found for this location.');
    }
}
//function StreetView(evt) {
//    map.graphics.clear();
//    
//    document.getElementById("svX").value = evt.mapPoint.x;
//    document.getElementById("svY").value = evt.mapPoint.y;
//    Pano = new google.maps.StreetViewPanorama(document.getElementById("streetview"));
//    var gviewClient = new GStreetviewClient();
//    GEvent.addListener(Pano, "error", handleNoFlash);
//    var outSR = new esri.SpatialReference({ wkid: 102100 });
//    gsvc.project([evt.mapPoint], outSR, function (projectedPoints) {
//        viewPoint = esri.geometry.webMercatorToGeographic(projectedPoints[0]);
//        gviewClient.getNearestPanorama(new GLatLng(viewPoint.y, viewPoint.x), showStreetView);
//    }, function (e) { alert(e.message); });
//}
//function handleNoFlash(errorCode) {
//    if (errorCode == FLASH_UNAVAILABLE) {
//        alert("Error: Flash doesn't appear to be supported by your browser");
//        return;
//    }
//}
//function showStreetView(gStreetviewData) {
//    if (gStreetviewData.code != 200) { //no street view for this location
//        if (Pano != null) Pano.hide(); //hide the street view
//        viewStatus = false;
//        viewAddress = "";
//        var symbol = new esri.symbol.SimpleMarkerSymbol().setColor(new dojo.Color([0, 0, 255]));
//        var graphic = new esri.Graphic(esri.geometry.geographicToWebMercator(viewPoint), symbol);
//        map.graphics.add(graphic);
//        alert("No street view for this location");
//    }
//    else {   //street view is available 
//        viewStatus = true;
//        viewAddress = gStreetviewData.location.description;
//        GEvent.addListener(Pano, 'initialized', streetViewChanged); // add an event handling street view changes
//        Pano.setLocationAndPOV(gStreetviewData.location.latlng); //push the pano to a this location
//        //add graphic
//        var symbol = new esri.symbol.SimpleMarkerSymbol().setColor(new dojo.Color([0, 0, 255]));
//        var point = new esri.geometry.Point(document.getElementById("svX").value, document.getElementById("svY").value, map.spatialReference);
//        var graphic = new esri.Graphic(point, symbol);
//        map.graphics.add(graphic);
//        document.getElementById('svDialog').style.display = "block";

//    }
//    //Glocator.getLocations(new GLatLng(viewPoint.y, viewPoint.x), showStreetAddress); //show street address info
//}
////function showStreetAddress(response) {
////    var descContent = "";
////    if (!response || response.Status.code != 200) {
////        if (viewAddress != "")
////            descContent = "<table width='95%'><tr><td><b>View Point Address:</b></td><td>" + getlocalAddress(viewAddress) + "</td></tr><tr><td><b>View Point Lat/Lon:</b></td><td>"
////        else
////            descContent = "<table width='95%'><tr><td><b>View Point Address:</b></td><td>UnKnown Address</td></tr><tr><td><b>View Point Lat/Lon:</b></td><td>"
////        descContent += viewPoint.y + ", " + viewPoint.x + "</td></tr><tr><td>";
////    }
////    else {
////        var place = response.Placemark[0];
////        var point = new GLatLng(place.Point.coordinates[1], place.Point.coordinates[0]);
////        descContent = "<table width='95%'><tr><td><b>View Point Address:</b></td><td>" + getlocalAddress(place.address) + "</td></tr><tr><td><b>View Point Lat/Lon:</b></td><td>" + place.Point.coordinates[1] + ", " + place.Point.coordinates[0] + "</td></tr><tr><td>";
////    }
////    descContent += "<b>View Available:</b></td><td>" + viewStatus + "<td><tr></table>";
////    document.getElementById("Desc").innerHTML = descContent;
////}
////function getlocalAddress(Addr) {
////    var index = Addr.indexOf(',');
////    return Addr.substring(0, index);
////}
//function streetViewChanged(streetLocation) {
//    if (streetLocation) {
//        viewStatus = true;
//        viewAddress = streetLocation.description;
//        var point = new esri.geometry.Point({ "x": streetLocation.latlng.lng(), "y": streetLocation.latlng.lat(), " spatialReference": { " wkid": 4326} });
//        //add to the map
//        map.graphics.clear();
//        gsvc.project([point], map.spatialReference, function (projectedPoints) {
//            var symbol = new esri.symbol.SimpleMarkerSymbol().setColor(new dojo.Color([0, 0, 255]));
//            map.graphics.add(new esri.Graphic(projectedPoints[0], symbol));
//            map.centerAt(projectedPoints[0]);
//        });
//    }
//    //Glocator.getLocations(streetLocation.latlng, showStreetAddress);
//}