//function createMapMenu() {
//    // Creates right-click context menu for map
//    ctxMenuForMap = new dijit.Menu({
//        onOpen: function (box) {
//            // Lets calculate the map coordinates where user right clicked.
//            // We'll use this to create the graphic when the user clicks
//            // on the menu item to "Add Point"
//            currentLocation = getMapPointFromMenuPosition(box);
//            //editToolbar.deactivate();
//        }
//    });
//    ctxMenuForMap.addChild(new dijit.MenuItem({
//        label: "Zoom In",
//        iconClass: "zoominIcon",
//        onClick: function () {
////                        var minx = map.extent.xmin;
////                        var maxx = map.extent.xmax;
////                        var miny = map.extent.ymax;
////                        var maxy = map.extent.ymin;
////                        var newMinX = (((map.extent.xmin + map.extent.xmax) / 2) + map.extent.xmin) / 2;
////                        var newMaxX = (((map.extent.xmin + map.extent.xmax) / 2) + map.extent.xmax) / 2;
////                        var newMinY = (((map.extent.ymin + map.extent.ymax) / 2) + map.extent.ymin) / 2;
////                        var newMaxY = (((map.extent.ymin + map.extent.ymax) / 2) + map.extent.ymax) / 2;
//                      map.centerAndZoom(currentLocation, map.getLevel() + 1);
//        }
//    }));
//    ctxMenuForMap.addChild(new dijit.MenuItem({
//        label: "Zoom Out",
//        iconClass: "zoomoutIcon",
//        onClick: function () { map.centerAndZoom(currentLocation, map.getLevel() - 1); }
//    }));
//    ctxMenuForMap.addChild(new dijit.MenuSeparator());
//    ctxMenuForMap.addChild(new dijit.MenuItem({
//        label: "Previous Extent",
//        iconClass: "zoomprevIcon",
//        disabled: true,
//        onClick: function () { navToolbar.zoomToPrevExtent(); }
//    }));
//    ctxMenuForMap.addChild(new dijit.MenuItem({
//        label: "Next Extent",
//        iconClass: "zoomnextIcon",
//        disabled: true,
//        onClick: function () { navToolbar.zoomToNextExtent(); }
//    }));
//    ctxMenuForMap.addChild(new dijit.MenuSeparator());

//    ctxMenuForMap.addChild(new dijit.MenuItem({
//        label: "Full Extent",
//        iconClass: "zoomfullextIcon",
//        onClick: function (pt) {
//                       var startExtent = new esri.geometry.Extent({
//                           "xmin": 1297232.4692940111,
//                           "ymin": 223864.66964762594,
//                           "xmax": 1501876.5665162336,
//                           "ymax": 325535.6765920704,
//                            "spatialReference": { "wkid":102718 } 
//                        });
//            map.setExtent(startExtent);
//        }
//    }));
////    ctxMenuForMap.addChild(new dijit.MenuItem({
////        label: "Oblique View",
////        onClick: function (pt) {
////            dijit.byId('pictoDialog').show();
////            var gem = map.toMap(pt);
////            var outSR = new esri.SpatialReference({ wkid: 4326 });
////            gsvc.project([gem], outSR, function (projectedPoints) {
////                //window.open("PictometryOnline.html?xcoord=" + projectedPoints[0].x + "&ycoord=" + projectedPoints[0].y);
////                pictoInit(projectedPoints[0].y, projectedPoints[0].x);
////            });
////            //pictoInit(gem.y, gem.x);
////        }
////    }));
//    ctxMenuForMap.addChild(new dijit.MenuSeparator());
//    ctxMenuForMap.addChild(new dijit.MenuItem({
//        label: "Cancel Menu",
//        iconClass: "deactivateIcon",
//        onClick: function () { navToolbar.deactivate(); }
//    }));
//    ctxMenuForMap.startup();
//    ctxMenuForMap.bindDomNode(map.container);
//}
function createMapMenu() {
    //var pMenu;
    ctxMenuForMap = new dijit.Menu({
        onOpen: function (box) {
            currentLocation = getMapPointFromMenuPosition(box);
        }
    });
    ctxMenuForMap.addChild(new dijit.MenuItem({
        label: "Measure Line",
        iconClass: "measureLine",
        onClick: function () {
            selectByLocationToolBar.deactivate();
            mailingLablesToolBar.deactivate();
            document.getElementById('measurePanel').style.display = "block";
            clickConnect(true, "3", this);
            activateMeasureTools('polyline');
        }
    }));
    ctxMenuForMap.addChild(new dijit.MenuItem({
        label: "Get Permits",
        iconClass: "getPermits",
        onClick: function () {
            executePermitTask(currentLocation)
        }
    }));
    ctxMenuForMap.addChild(new dijit.MenuItem({
        label: "Get Flags",
        iconClass:"getFlags",
        onClick: function () { executeGetFlags(currentLocation) }
    }));
    ctxMenuForMap.addChild(new dijit.MenuSeparator());

    //navigation Menu
    pSubMenu = new dijit.Menu();
    pSubMenu.addChild(new dijit.MenuItem({
        label: "Zoom In",
        iconClass: "zoominIcon",
        onClick: function () {
            map.centerAndZoom(currentLocation, map.getLevel() + 1);
        }
    }));
    pSubMenu.addChild(new dijit.MenuItem({
        label: "Zoom Out",
        iconClass: "zoomoutIcon",
        onClick: function () { map.centerAndZoom(currentLocation, map.getLevel() - 1); }
    }));
    pSubMenu.addChild(new dijit.MenuSeparator());
    pSubMenu.addChild(new dijit.MenuItem({
        label: "Previous Extent",
        id: "zoomprev",
        iconClass: "zoomprevIcon",
        disabled: true,
        onClick: function () { navToolbar.zoomToPrevExtent(); }
    }));
    pSubMenu.addChild(new dijit.MenuItem({
        label: "Next Extent",
        id: "zoomnext",
        iconClass: "zoomnextIcon",
        disabled: true,
        onClick: function () { navToolbar.zoomToNextExtent(); }
    }));
    pSubMenu.addChild(new dijit.MenuSeparator());

    pSubMenu.addChild(new dijit.MenuItem({
        label: "Full Extent",
        iconClass: "zoomfullextIcon",
        onClick: function (pt) {
            var startExtent = new esri.geometry.Extent({
                "xmin": 1297232.4692940111,
                "ymin": 223864.66964762594,
                "xmax": 1501876.5665162336,
                "ymax": 325535.6765920704,
                "spatialReference": { "wkid": 102718 }
            });
            map.setExtent(startExtent);
        }
    }));

    ctxMenuForMap.addChild(new dijit.PopupMenuItem({
        label: "Navigation",
        popup: pSubMenu
    }));
    ctxMenuForMap.addChild(new dijit.MenuSeparator());
    ctxMenuForMap.addChild(new dijit.MenuItem({
        label: "Cancel Menu",
        iconClass: "deactivateIcon",
        onClick: function () { navToolbar.deactivate(); }
    }));
    ctxMenuForMap.startup();
    ctxMenuForMap.bindDomNode(map.container);
}
function getMapPointFromMenuPosition(box) {
    var x = box.x, y = box.y;
    switch (box.corner) {
        case "TR":
            x += box.w;
            break;
        case "BL":
            y += box.h;
            break;
        case "BR":
            x += box.w;
            y += box.h;
            break;
    }
    var screenPoint = new esri.geometry.Point(x - map.position.x, y - map.position.y);
    return map.toMap(screenPoint);
}
function extentHistoryChangeHandler() {
    var tb = pSubMenu.getChildren();
    for (i = 0; i < tb.length; i++) {
        if (tb[i].label == "Previous Extent") {
            tb[i].setDisabled(navToolbar.isFirstExtent());
        }
        if (tb[i].label == "Next Extent") {
            tb[i].setDisabled(navToolbar.isLastExtent());
        }
    }
    navToolbar.deactivate();
//    var sc = map.getScale();
//    if (map.getLayer("Elevation").visible == true && map.getScale() > 16000) {
//        alert("Elevation is not visible at this scale \rplease zoom in to view detail");
//    }
    dijit.byId("zoomprev").disabled = navToolbar.isFirstExtent();
    dijit.byId("zoomnext").disabled = navToolbar.isLastExtent();
} 