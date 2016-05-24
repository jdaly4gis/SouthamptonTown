<%@ Page Language="C#" AutoEventWireup="true" CodeFile="ViewStreetView.aspx.cs" Inherits="ViewStreetView" %>

 <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "https://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="https://www.w3.org/1999/xhtml" >
<head runat="server">
    <meta http-equiv="content-type" content="text/html; charset=utf-8"/>
    <title>Google Street View for Town of Southampton</title>
 <script src="https://maps.google.com/maps?file=api&amp;v=2&amp;sensor=false&amp;key=ABQIAAAA_uGiu7-Lv2qm-O22gRt81xRjaXx2K7FmNJT1jIkQ4jYRPcpTIBRZeZubvjnnPOepuyN5e2axHbXPRA" type="text/javascript"></script>
    <!--script src="https://maps.google.com/maps?file=api&amp;v=2&amp;key=ABQIAAAA4X2pGw6mwSMuXfE3PkhaGhQhaRi4JdjNb1_WFGSCdJdW5F7TOBQqhVO2pZVP8V3VCDqS075bppOzAA&sensor=false" type="text/javascript"></script-->
            
    <script type="text/javascript">
        var html = '<div style="width:210px; padding-right:10px;">There is no street view data for this coordinate</div>';
	var map;
	var geocoder;
	var address;
	var place;

function createMarker(point,html) {
  var marker = new GMarker(point);


  GEvent.addListener(marker, "click", function()  {
     marker.openInfoWindowHtml(html);
  });
  
  return marker;
}

function OnPageLoad(x,y) {


   if (GBrowserIsCompatible()) {
    
        var currPoint = new GLatLng(y,x);
        var currPointPOV = {yaw:370.64659986187695, pitch: -20};
        var marker = createMarker(currPoint, html);

	    geocoder = new GClientGeocoder();

        panoClient = new GStreetviewClient();      
      
        map = new GMap2(document.getElementById("map_canvas"));
        map.addControl(new GLargeMapControl());
        map.addControl(new GMapTypeControl());
        map.setCenter(currPoint, 15);

        map.addOverlay(marker);
        svOverlay = new GStreetviewOverlay();
        map.addOverlay(svOverlay);
        GEvent.addListener(map, "click", getAddress);
        GEvent.addListener(map, "click", function(overlay,latlng) {
          panoClient.getNearestPanorama(latlng, showPanoData);
        });
        myPano = new GStreetviewPanorama(document.getElementById("pano"));
        myPano.setLocationAndPOV(currPoint, currPointPOV);
        GEvent.addListener(myPano, "error", handleNoFlash);  
//        panoClient.getNearestPanorama(currPoint, showPanoData);
    }
}

function getInitialAddress(initPoint) {
    geocoder.getLocations(initPoint, function (address) {
        var initPmark = address.Placemark[0];
	    place = initPmark.address;
    });
	return (place);
}

function getAddress(overlay, latlng) {
  if (latlng != null) {
      address = latlng;
      geocoder.getLocations(latlng, showAddress);
  }
}


function showAddress(response)
{
   var pmark = response.Placemark[0];
   place = pmark.address;
}

function togglePano()
{
	document.getElementById("pano").style.visibility="visible";
	document.getElementById("map_canvas").style.visibility="hidden";
}

function handleNoFlash(errorCode) {
    if(errorCode == 603)  {
        alert("Error: Flash doesn't appear to be supported by your browser");
        return;
    }
}

function showPanoData(panoData) {
    var displayString = "";
    if (panoData.code != 200) {
        displayString = ["No Street View data for these coordinates"];
        //GLog.write('showPanoData: Server rejected with code: ' + panoData.code);
        return;
    }
    nextPanoId = panoData.links[0].panoId;
    displayString = [
            //        "Panorama ID: " + panoData.location.panoId,
            "Address: " + place,
            "LatLng: " + panoData.location.latlng,
            //        "Copyright: " + panoData.copyright,
            "Description: " + panoData.location.description, 
            //        "Next Pano ID: " + panoData.links[0].panoId
            "Street View: " + '<a href="javascript:onclick=togglePano()">Show</a>'
            ].join("<br/>");

	var btm = document.getElementById("backToMap");
	var nex = document.getElementById("nextlink");

	btm.style.visibility="visible";
	nex.style.visibility="visible";

  map.openInfoWindowHtml(panoData.location.latlng, displayString);
     
  //GLog.write('Viewer moved to' + panoData.location.latlng);
  myPano.setLocationAndPOV(panoData.location.latlng);
}
    
function next() {
  // Get the next panoId
  // Note that this is not sophisticated. At the end of the block, it will get stuck
  panoClient.getPanoramaById(nextPanoId, showPanoData);
}

function backMap() {

document.getElementById("pano").style.visibility="hidden";
document.getElementById("map_canvas").style.visibility="visible";

}
    
function handleNoFlash(errorCode) {
  if (errorCode == 603) {
    alert("Error: Flash doesn't appear to be supported by your browser");
    return;
  }
}

    </script>
</head>
<body style="margin:0px;" onload="OnPageLoad('<%=xcoord %>','<%=ycoord %>')" onunload="GUnload()">
     <form action="" >
       <div id="container" style="position:relative; width: 750px; height: 425px;">
	        <div id="map_canvas" style="position:absolute;margin:0px; top:0px; left:0px; width: 750px; height: 425px; z-index: 2; visibility:visible"></div>
	        <iframe src="javascript:false;" frameborder="0" style="position: absolute;right: 185px; top: 5px; width: 150px; height: 55px;"></iframe>
	        <div name="pano" id="pano" style="width: 100%; height: 100%;"></div>
            <div id="nextlink" style="position:absolute; bottom:20px; right:20px;visibility:hidden;"><input type="button" onclick="next()" value="Next"/></div>
            <div id="backToMap" style="position:absolute; bottom:20px; right:80px;visibility:hidden;"><input type="button" onclick="backMap()" value="Map View"/></div>
       </div>
     </form>
</body>
</html>
