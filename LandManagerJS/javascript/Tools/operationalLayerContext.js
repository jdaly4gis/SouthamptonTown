function createOLMenu() {
    // Creates right-click context menu for map
    ctxMenuForOL = new dijit.Menu({
        onOpen: function (box) {
            // Lets calculate the map coordinates where user right clicked.
            // We'll use this to create the graphic when the user clicks
            // on the menu item to "Add Point"
            //currentLocation = getMapPointFromMenuPosition(box);
            //editToolbar.deactivate();
        }
    });
    ctxMenuForOL.addChild(new dijit.MenuItem({
        label: "Collapse All",
        //iconClass: "zoominIcon",
        onClick: function () {
            hideAllNodes(true);
        }
    }));
    ctxMenuForOL.addChild(new dijit.MenuItem({
        label: "Expand All",
        //iconClass: "zoominIcon",
        onClick: function () {
            hideAllNodes(false);
        }
    }));

//    ctxMenuForOL.addChild(new dijit.MenuSeparator());
//    ctxMenuForOL.addChild(new dijit.MenuItem({
//        label: "Turn All Layers On",
//        //iconClass: "zoominIcon",
//        onClick: function () {
//            
//        }
//    }));
//    ctxMenuForOL.addChild(new dijit.MenuItem({
//        label: "Turn All Layers Off",
//        //iconClass: "zoominIcon",
//        onClick: function () {
//           
//        }
//    })); 
    //ctxMenuForOL.addChild(new dijit.MenuSeparator());
    //ctxMenuForOL.addChild(new dijit.MenuItem({
    //    label: "Revert Legend",
    //    //iconClass: "zoominIcon",
    //    onClick: function () {
    //        createLegend(map);
    //        //hideLegendItemsOnRasterLayer(false, 0);
    //        revertLegend();
    //    }
    //}));
    ctxMenuForOL.addChild(new dijit.MenuSeparator());
    ctxMenuForOL.addChild(new dijit.MenuItem({
        label: "Cancel Menu",
        //iconClass: "zoominIcon",
        onClick: function () {
        }
    }));
    ctxMenuForOL.startup();
    ctxMenuForOL.bindDomNode(dojo.byId("operationalLayersHeading"));
}