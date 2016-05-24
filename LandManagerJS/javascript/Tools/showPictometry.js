function getRequestParam(name) {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regexS = "[\\?&]" + name + "=([^&#]*)";
    var regex = new RegExp(regexS);
    var results = regex.exec(window.location.href);
    if (results == null) 
        return "";
    else 
        return results[1];
}
// Holds the reference to the Pictometry Navigator object.
var ImgNav = null;
var layer = null;

var latitude;
var longitude;

var day = null;
var month = null;
var year = null;

function pictoInit(lat, long) {
    //var fire = (/Firefox[\/\s](\d+\.\d+)/.test(navigator.userAgent))
    latitude = lat;
    longitude = long;
    ImgNav = null;
    var browser = navigator.appName;

    if (!(document.documentMode || /Edge/.test(navigator.userAgent))) {
        
        dijit.byId('pictoDialog').hide();
        bingLoad(long, lat);
    }
    else {
        var params = {
            UserId: '1292',
            ServerProxy: "PictometryProxy.ashx"
        };
        var dlg = dijit.byId('pictoDialog');

        var element1 = document.createElement("div");
        element1.id = "ImageViewer";
        document.getElementById("ImageViewerContainer").appendChild(element1);

        dojo.connect(dlg, "onHide", function (e) {
            dojo.destroy(element1);
        });

        ImgNav = new Pol.VI.ImageNavigator("ImageViewer", params);
        ImgNav.AttachEvent('onerror', OnError);
        ImgNav.Init();
        ImgNav.Search(latitude, longitude, SearchCallback);
    }
}
// Simple Navigate Fail event handler.
function OnNavigateFail(evt) {
    alert("Navigation Failed: " + evt.reason);
}
// Simple Edge Detect event handler.
function OnEdgeDetect(evt) {
    ImgNav.Navigate();
}
// Simple onclick event handler.
function OnClick(evt) {
    //alert("Mouse: " + evt.mouse.x + ',' + evt.mouse.y + " Image: " + evt.image.x + ',' + evt.image.y);
    //ImgNav.SetCenter(evt.mouse.x, evt.mouse.y);
}
// Simple onviewchange event handler.
function OnViewChange(evt) {
    day = ImgNav.GetDay();
    month = ImgNav.GetMonth();
    year = ImgNav.GetYear();
    document.getElementById('MenuBar').innerHTML = ("Level: " + evt.view.level + " | Type: " + evt.view.type + " | Orientation: " + evt.view.orientation + " | Scale: " + evt.scale * 100 + "% | Date of Image:" + month + "/" + day + "/" + year); ;

    if (ImgNav.CurrentView.orientation == "W") {

        document.getElementById('w').className = "n";
        document.getElementById('e').className = "s";
        document.getElementById('s').className = "w";
        document.getElementById('n').className = "e";

    }
    else if (ImgNav.CurrentView.orientation == "N" || ImgNav.CurrentView.orientation == "Ob") {

        document.getElementById('w').className = "w";
        document.getElementById('e').className = "e";
        document.getElementById('s').className = "s";
        document.getElementById('n').className = "n";

    }
    else if (ImgNav.CurrentView.orientation == "E") {

        document.getElementById('w').className = "s";
        document.getElementById('e').className = "n";
        document.getElementById('s').className = "e";
        document.getElementById('n').className = "w";

    }
    else if (ImgNav.CurrentView.orientation == "S") {

        document.getElementById('w').className = "e";
        document.getElementById('e').className = "w";
        document.getElementById('s').className = "n";
        document.getElementById('n').className = "s";

    }
    return false;
}
// Simple onedgedetect event handler.
function OnEdgeDetect(evt) {
    //alert("Status: " + evt.status + " Reason: " + evt.reason);

}
var i = 0;
function OnScaleChanged(evt) {
    var zoom = ImgNav.GetMouseWheelZoom();
    //var scale = ImgNav.ScaleFactor;
    if (evt.view.orientation == "W" || evt.view.orientation == "E") {

        if (evt.scale < 1 & i < 1) {
            i = i + 1;
            ImgNav.SetScale(.75);
            alert('There Is Not A Lower Resolution Image \n For the ' + evt.view.orientation + ' Facing Direction');
            //MenuBar.innerHTML = ("Level: " + evt.view.level + " | Type: " + evt.view.type + " | Orientation: " + evt.view.orientation + " | Scale: .75 | Date of Image:" + month + "/" + day + "/" + year);

        }
        i = 0;
        //MenuBar.innerHTML = ("Level: " + evt.view.level + " | Type: " + evt.view.type + " | Orientation: " + evt.view.orientation + " | Scale: " + evt.scale + " | Date of Image:" + month + "/" + day + "/" + year);
    }
    else {
        //var scale = ImgNav.GetScale();
        if (evt.view.orientation == "N" || evt.view.orientation == "S") {
            if (evt.scale <= .75 & i < 1) {
                i = i + 1;
                ImgNav.SetScale(.75);
                //MenuBar.innerHTML = ("Level: " + evt.view.level + " | Type: " + evt.view.type + " | Orientation: " + evt.view.orientation + " | Scale: .75 | Date of Image:" + month + "/" + day + "/" + year);
            }
            else {
                if (evt.scale < 1 & evt.view.level == "N" & zoom == true) {
                    zoom = false;
                    ImgNav.SetView("C", ImgNav.CurrentView.type, ImgNav.CurrentView.orientation);
                    ImgNav.SetScale(3.75);
                }
                if (evt.scale > 3.75 & evt.view.level == "C" & zoom == true) {
                    zoom = false;
                    ImgNav.SetView("N", ImgNav.CurrentView.type, ImgNav.CurrentView.orientation);
                    ImgNav.SetScale(1);
                }
                //MenuBar.innerHTML = ("Level: " + evt.view.level + " | Type: " + evt.view.type + " | Orientation: " + evt.view.orientation + " | Scale: " + evt.scale + " | Date of Image:" + month + "/" + day + "/" + year);
            }
        }
        i = 0;
    }
    MenuBar.innerHTML = ("Level: " + evt.view.level + " | Type: " + evt.view.type + " | Orientation: " + evt.view.orientation + " | Scale: " + ImgNav.ScaleFactor * 100 + "% | Date of Image:" + month + "/" + day + "/" + year);
}
function OnError(evt) {
    dojo.byId('pictoControls').style.display = "none";
    alert("Error event");
}
function SearchCallback(resp) {
    // A 0 status indicates the search succeeded. 
    if (resp.status == 0) {
       
        // Find the first available oblique image. 
        var view = ImgNav.FindFirstOblique();
        // Set the view.
        //alert(view);
        //Set The Mouse wheel zoom
        ImgNav.SetMouseWheelZoom(true);
        // Attach to the onclick event.
        ImgNav.AttachEvent('onclick', OnClick);
        var sti = ImgNav.ViewerElements;
        ImgNav.ViewerElements[1].setActive();

        //http: //proliantiis2/ArcGIS/services/Tax_Parcels_Picto/MapServer/WFSServer?
        //
        // Add a feature named 'parcels' and configure the polygon type.
        //
        // The WFS server is at: https://127.0.0.1:8080/geoserver/wfs?version=1.1.0"
        // The bounding box and output geometries are in Lat/Lng order.
        //
        ImgNav.maxscale = "4";

        //ImgNav.Control.Show();
        ImgNav.ToolsRenderer.Show();

        // Attach to the onviewchange event.
        ImgNav.AttachEvent('onviewchange', OnViewChange);

        // Attach to the onedgedetect event.
        ImgNav.AttachEvent('onedgedetect', OnEdgeDetect);

        ImgNav.AttachEvent('onscalechange', OnScaleChanged);
        // Attach to the navigate fail event.
        ImgNav.AttachEvent("onnavigatefail", OnNavigateFail);

        // Attach to the edge detect event.
        ImgNav.AttachEvent("onedgedetect", OnEdgeDetect);

        // Enable Auto Navigation.
        ImgNav.SetAutoNavigate(true);

        ImgNav.SetView(view.level, view.type, view.orientation);
        ImgNav.RemoveOverlay(ImgNav.viewer.overlay);
        addLayer();
        ImgNav.SetMousePan(true);
        getViewerSize();
        dojo.byId('pictoControls').style.display = "block";
        //ImgNav.ContinuousPan(5, 5);
        // Attach the layer to the 'onclick' event.
        //ImgNav.AttachEvent('onclick', OnLayerHandler, layer);
        document.getElementById('pictoWait').style.display = "none";
    }
    else {
        //setTimeout(delayer(), 5000);
        alert("Search Failed: " + resp.reason + '\n You are now being directed to Bing\'s Bird\'s Eye View');
        bingLoad(longitude, latitude);
    }
}
function reDirect() {
    var filename = "BingOblique.html?xcoord=" + longitude + "&ycoord=" + latitude;
    var height = 750;
    var width = 1000;
    var winl = (screen.width - width) / 2;
    var wint = (screen.height - height) / 2;
    var winprops = 'height=' + height + ',width=' + width + ',top=' + wint + ',left=' + winl + ',resizable=no,status=no,location=no';
    //newwindow = window.open(filename, 'MSVE',null);
    //window.location = filename;
    window.open(filename, 'MSVE', winprops);
    //if (window.focus) { newwindow.focus() }
}
function RemoveOverlay(evt) {
    //ImgNav.Remove

    var tagf = evt.target;
    ImgNav.RemoveOverlay(tagf);
}
function ChangeOrientation(orientation, orientation2) {
    var scale = ImgNav.ScaleFactor;
    if (scale < .75) {

    }
    else {
        var st = ImgNav.CurrentView.level;
        if (ImgNav.CurrentView.level == "C" & (orientation2 != "N" && orientation2 != "S")) {
            alert('There is no image at this scale \n For the ' + orientation2 + ' Facing Direction');
        }
        else {
            ImgNav.SetImageType(orientation);
            ImgNav.SetOrientation(orientation2);
        }
    }
}
function ChangeImageType(orientation) {

    ImgNav.SetImageType(orientation);
}
function addLayer() {
    // Create a default marker.

    // Create an Icon object.
    var icon = new Pol.VI.Icon();

    // Point the object to the URL for the image.
    icon.image = 'https://dev.pictometry.com/ImageNavigator/i/ImageNavigator.png';

    // Create a Size object that describes the width and height of the image.
    icon.iconSize = new Pol.VI.Size(60, 60);

    icon.iconAnchor = new Pol.VI.Pixel(30, 60);

    // Create a custom marker passing in the icon object.
    //var custommarker = new Pol.VI.Marker(new Pol.VI.LatLng(43.003591, -77.615835), { icon: icon });

    var defaultmarker = new Pol.VI.Marker(new Pol.VI.LatLng(latitude, longitude), "test");
    //defaultmarker.draggable = true;

    ImgNav.AttachEvent('onlocationchange', dragMarker, defaultmarker);

    // Attach a callback for click events.
    ImgNav.AttachEvent('onclick', OnMarkerClick, defaultmarker);
    //ImgNav.AttachEvent('onclick', OnMarkerClick, custommarker);

    // Add marker to the overlay manager.
    ImgNav.AddOverlay(defaultmarker);
    //ImgNav.AddOverlay(custommarker);
    //ImgNav.Overlay
    // Render it.
    ImgNav.RenderOverlay();
}
function dragMarker(e) {
    RemoveOverlay(e);
    //alert('drag' + e.id);
}
function OnLayerHandler(evt) {
    var target = evt.target;
    var mesg = '';

    if (target) {
        alert("Type: " + evt.type + " Layer: " + target.GetId() + " Shape: " + target.GetShapeId(evt.image.x, evt.image.y) + " @ X: " + evt.image.x + " Y: " + evt.image.y);
    }
}
function OnMarkerClick(evt) {
    var x = evt.target.x;
    // Set-up element options.
    var eoptions = {
        id: 'pointer',
        size: new Pol.VI.Size(120, 50),
        anchor: new Pol.VI.Pixel(-20, 90),
        innerHTML: "<div class='marker'><div onclick='RemoveOverlay(this)' align='right' style=' position:absolute; top:2px;'><span>x</span></div> <br /> <span>Latitude = " + Math.round(evt.target.points.lat * 10000) / 10000 + "\n\ Longitude = " + Math.round(evt.target.points.lng * 10000) / 10000 + "</span></div>"
    };
    // Create new element object.
    var crosshair = new Pol.VI.Element(new Pol.VI.LatLng(evt.target.points.lat, evt.target.points.lng), eoptions);
    ImgNav.AttachEvent('onclick', RemoveOverlay, crosshair);
    // Add the element to the overlay.
    ImgNav.AddOverlay(crosshair);
    // Render it.
    ImgNav.RenderOverlay();
}
function getViewerSize(ele) {
    var dialog = dojo.byId('pictoDialog');
    //var width = document.body.clientWidth;
    //var height = document.body.clientHeight;
    var width = dialog.offsetWidth - 30 ;
    var height = dialog.offsetHeight - 50 ;
   // ImageViewer.style.height = document.documentElement.clientHeight;
    //ImageViewer.style.width = document.documentElement.clientWidth;
    //var size = ImgNav.GetViewerSize();
    ImgNav.SetViewerSize(width, height);

}

function setScale(type) {
    if (ImgNav.ScaleFactor < 4 && type == "in") {
        ImgNav.SetScale(ImgNav.ScaleFactor + .25);
    }
    else if (ImgNav.ScaleFactor <= 4 && type == "out" && ImgNav.ScaleFactor >= .75) {
        ImgNav.SetScale(ImgNav.ScaleFactor - .25);
    }
}
function getRequestParam(name) {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regexS = "[\\?&]" + name + "=([^&#]*)";
    var regex = new RegExp(regexS);
    var results = regex.exec(window.location.href);
    if (results == null)
        return "";
    else
        return results[1];
}
//this is the start of the Bing Maps implementation.
var bingMap = null;
var centerat = null;
var agisve_services = null;

function getBingMapsViewerSize() {
    var dialog = dojo.byId('pictoDialog');
    var width = dialog.offsetWidth - 30;
    var height = dialog.offsetHeight - 50;
    bingMap.Resize(width, height);
    //bingmap.ZoomIn();
}

function bingLoad(x, y) {
    // create point to use as map center point
    alert("Pictometry Requires Microsoft Internet Explorer.\nYou are now viewing imagery from Bing.com");
    //var ss = "bingOblique.html?xcoord=" + x + "&ycoord=" + y;
    window.open("http://lm.southamptontownny.gov/bingOblique.html?xcoord=" + x + "&ycoord=" + y);
    //window.location = "bingOblique.html?xcoord=" + x + "ycoord=" + y;

//    dojo.byId('pictoControls').style.display = "none";
//    centerat = new VELatLong(y, x);
//    pinLocation = new VELatLong(y, x);
//    // new map instance
//    //HideToolTip(this);

//    bingMap = new VEMap('ImageViewerContainer');
//    var mapOptions = new VEMapOptions();
//    mapOptions.EnableBirdseye = true;
//    // load map
//    bingMap.AttachEvent("onobliqueenter", OnObliqueEnterHandler);
//    bingMap.LoadMap(centerat, 19, VEMapStyle.Hybrid, false, VEMapMode.Mode2D, false, 4, mapOptions);
}



