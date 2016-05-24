function geolocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(zoomToLocation, locationError, { enableHighAccuracy: true, timeout: 10000, maximumAge: 10000 });
    } else {
        alert('Your browser does not support geolocation');
    }
}
function zoomToLocation(position) {
    var pt = esri.geometry.geographicToWebMercator(new esri.geometry.Point(position.coords.longitude, position.coords.latitude));
    //uncomment to add a graphic at the current location
    map.graphics.clear();
    var params = new esri.tasks.ProjectParameters();
    params.geometries = [pt];
    params.outSR = map.spatialReference;
    gsvc.project(params, function (geometry) {
        var graphic = new esri.Graphic(geometry[0], setInactiveSymbol('point'));
        map.centerAndZoom(geometry[0], 17);
        map.graphics.add(graphic);
        setTimeout(function () {
            map.graphics.remove(graphic);
        }, 5000);
    });

   
}
function locationError(error) {
    switch (error.code) {
        case error.PERMISSION_DENIED:
            alert("Location not provided");
            break;
        case error.POSITION_UNAVAILABLE:
            alert("Current location not available");
            break;
        case error.TIMEOUT:
            alert("Timeout");
            break;
        default:
            alert("unknown error");
            break;
    }
}
function setInactiveSymbol(type) {
    var symbol;
    switch (type) {
        case "point":
            symbol = new esri.symbol.PictureMarkerSymbol("images/blueDot.png", 40, 40);
            break;
        case "polygon":
            symbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID,
				            new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID,
				            new dojo.Color("fuchsia"), 3),
				            new dojo.Color([98, 194, 204, 0.0])
                        );
            break;
    }
    return symbol;
}