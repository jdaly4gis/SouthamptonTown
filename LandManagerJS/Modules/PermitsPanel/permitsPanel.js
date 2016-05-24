function getPermitTypes() {
    var store = dijit.byId('selectPermitType').store;
    var dept = checkedRadioBtn('dept');
    if (document.getElementById("openPermitsDepartment").value != dept) {
        var buildingStore = new dojox.data.QueryReadStore({ url: 'modules/permitsPanel/permitPanelHandler.ashx' });
        buildingStore.fetch({ serverQuery: { type: dept, sender: "permitTypes" },
            onError: function (items) {
                alert(items);
            },
            onComplete: function (items, request) {
                if (items.length > 0) {
                    document.getElementById("openPermitsDepartment").value = dept;
                    var data = [];
                    var currentItems = [];
                    var count = 0;
                    if (dept != "code") {
                        data.push({ id: 0, field: "All Permits" }, { id: 1, field: "Expired Permits" });
                        count = 2;
                    }
                    for (var z = 0; z < items.length; z++) {
                        if (currentItems.indexOf(items[z].i["Permit Type"]) != -1) { } else {
                            data.push({ id: count, field: items[z].i["Permit Type"] });
                            currentItems.push(items[z].i["Permit Type"]);
                            count++;
                        }
                    }
                    dijit.byId('selectPermitType').set('store', new dojo.store.Memory({ id: "id", data: data }));

                } else {
                    document.getElementById('openPermitsPanel').style.display = "none";
                    alert("There are no permits for your department");
                }
            }
        });
    }
}



function moveTypes(moveType) {
    var page = parseInt(document.getElementById('lblPageNumber').innerHTML) - 1;

    if (moveType == "previous" && (parseInt(document.getElementById('lblPageNumber').innerHTML) > 1)) {
        document.getElementById('lblPageNumber').innerHTML = page;
        if (page > 0) {
            loadData_PermitsPanel(page - 1, moveType);
        } else {
            dijit.byId(moveType + 'Button').set('disabled', false);
        }
    }
    else if (moveType == "next") {
        document.getElementById('lblPageNumber').innerHTML = parseInt(page) + 2;
        loadData_PermitsPanel(page + 1, moveType);
    } else if (moveType == "go") {
        document.getElementById('lblPageNumber').innerHTML = 1;
        loadData_PermitsPanel(0, 'next');
    }

}
function exportPermitsPanel() {
   
    var value = dV = dijit.byId('selectPermitType').getDisplayedValue();
    if (value == "Expired Permits") {
        value = "expired";
    } else if (value == "All Permits") {
        value = "%";
    }
    //document.getElementById('openPermitsWait').style.display = "block";

    var page = 'modules/permitsPanel/permitPanelHandler.ashx?type=' + value + '&dept=' + document.getElementById("openPermitsDepartment").value + '&sender=exportPermits&status=&hamlet=' + document.getElementById('permitsPanelHamlet').value + '&page=0&pageSize=2147483647';
    window.location.href = page;
    //if (oo) {
    //    alert(oo);
    //}
    //var buildingStore = new dojox.data.QueryReadStore({ url: 'modules/permitsPanel/permitPanelHandler.ashx', urlPreventCache: true });
}
function loadData_PermitsPanel(page, moveType) {
    dijit.byId(moveType + 'Button').set('disabled', true);
    var pageSize = dijit.byId('permitPanelPageSize').value;
    var value = dV = dijit.byId('selectPermitType').getDisplayedValue();
    if (value == "Expired Permits") {
        value = "expired";
    } else if (value == "All Permits") {
        value = "%";
    }
    document.getElementById('openPermitsWait').style.display = "block";
    dijit.byId('exportPermits').set('disabled', true);
    var buildingStore = new dojox.data.QueryReadStore({ url: 'modules/permitsPanel/permitPanelHandler.ashx', urlPreventCache: true });
    buildingStore.fetch({
        serverQuery: { type: value, dept: document.getElementById("openPermitsDepartment").value, sender: "openPermits", status: "", hamlet: document.getElementById('permitsPanelHamlet').value, page: page, pageSize: pageSize },
        onComplete: function (items, request) {
            clearTableRow('openPermitsTable');
            if (items[0].i.count != undefined) {
                dijit.byId('exportPermits').set('disabled', false);
                document.getElementById('openPermitsFilterOptions').style.display = "none";
                var permitsQuery = new esri.tasks.Query();
                permitsQuery.returnGeometry = true;
                permitsQuery.where = "PARCEL_ID in (" + items[0].i.ids + ")";
                permitsQuery.outFields = ["*"];
                permitsQuery.orderByFields = ["HAMLET", "DSBL"];
                //if (dijit.byId('useMapExtent').checked || (value == "expired" || value == "%")) {
                //    permitsQuery.geometry = map.extent;
                //}
                taxParcelQueryTask.execute(permitsQuery, function (results) {
                    var r = {};
                    for (var o = 0, len = results.features.length; o < len; o++) {
                        results.features[o].attributes.permits = jsonParse("[" + items[0].i[results.features[o].attributes.PARCEL_ID] + "]");
                        r[results.features[o].attributes.PARCEL_ID] = results.features[o];
                    }
                    if (map.getLayer('openPermits')) {
                        map.getLayer('openPermits').clear();
                    }

                    var obj = items[0].i;
                    for (var z in obj) {
                        if (z != "ids") {
                            if (r[z]) {
                                insertsGraphic(r[z]);
                                updatePermitsGrid(r[z]);
                            } else {
                                //updatePermitsGrid({ attributes: { permits: jsonParse("[" + items[0].i[z] + "]")} });
                            }
                        }
                    }
                    dijit.byId('nextButton').set('disabled', false);
                    if (parseInt(items[0].i.count) > pageSize) {
                        document.getElementById('additionalPermits').style.display = "block";
                        var pageCount = parseInt(items[0].i.count) - (page * pageSize);
                        if ((pageCount < pageSize)) {
                            dijit.byId(moveType + 'Button').set('disabled', true);
                        } else {
                            dijit.byId(moveType + 'Button').set('disabled', false);
                        }
                        if (page == 0) {
                            dijit.byId('previousButton').set('disabled', true);
                        } else if (page > 0) {
                            dijit.byId('previousButton').set('disabled', false);
                        }
                    } else {
                        document.getElementById('additionalPermits').style.display = "none";
                    }
                    document.getElementById('openPermitsWait').style.display = "none";
                }, function (e) {
                    alert('e');
                    dijit.byId(moveType + 'Button').set('disabled', false);
                    document.getElementById('openPermitsWait').style.display = "none";
                    document.getElementById('additionalPermits').style.display = "none";
                });
            } else {
                alert('Your search didnt return any results');
                dijit.byId('exportPermits').set('disabled', true);
                dijit.byId(moveType + 'Button').set('disabled', false);
                document.getElementById('openPermitsWait').style.display = "none";
                document.getElementById('additionalPermits').style.display = "none";
            }

        }, onError: function (e) {

            alert(e);
        }
    });
}


//function permitQueryResults(results, items) { 
//    if (results.features.length != 0) {
//        if (document.getElementById("openPermitsTable").rows.length > 0) {
//            clearTableRow("openPermitsTable");
//        }
//        var r = {};
//        for (var o = 0, len = results.features.length; o < len; o++) {
//            results.features[o].attributes.permits = jsonParse("[" + items[0].i[results.features[o].attributes.PARCEL_ID] + "]");
//            r[results.features[o].attributes.PARCEL_ID] = results.features[o];
//        }
//        if (map.getLayer('openPermits')) {
//            map.getLayer('openPermits').clear();
//        }
//        var obj = items[0].i;
//        for (var z in obj) {
//            if (z != "ids") {
//                if (r[z]) {
//                    insertsGraphic(r[z]);
//                    updatePermitsGrid(r[z]);
//                } else {
//                    //updatePermitsGrid({ attributes: { permits: jsonParse("[" + items[0].i[z] + "]")} });
//                }
//            }
//        }
//    }
//    else {
//        alert("Those permits could not be mapped\rPlease Contact The GIS Department");
//    }
//    document.getElementById('openPermitsWait').style.display = "none";
//    dijit.byId('permitGoBtn').set('disabled', false);
//}

function updatePermitsGrid(result) {
    var table = document.getElementById("openPermitsTable");
    var rowCount = table.rows.length;
    var row = table.insertRow(rowCount);
    row.onmouseout = function () {
        closeDialog();
    };
    row.id = result.attributes.PARCEL_ID;
    if (result.attributes.permits.length == 1) {
        row.className = result.attributes.permits[0].status;
    }

    var cell2 = row.insertCell(0);
    cell2.className = "leftTD";
    var cellInnerHtml = "<div class='upper'>" + result.attributes.ADDRESS + ", " + result.attributes.HAMLET + "</div><div class='lower'>" + result.attributes.DSBL + "</div>";
    cell2.innerHTML = cellInnerHtml;
    if (result.geometry) {
        cell2.onclick = function () {
            map.setExtent(result.geometry.getExtent(), true);
            for (var z = 0, ll = table.rows.length; z < ll; z++) {
                if (table.rows[z].id == cell2.parentNode.id) {
                    table.rows[z].childNodes[0].className = "leftTDA"
                    table.rows[z].childNodes[1].className = "rightTDA";
                } else {
                    table.rows[z].childNodes[0].className = "leftTD"
                    table.rows[z].childNodes[1].className = "rightTD";
                }
            }
        };
        var centroid = getCentroid(result.geometry.getExtent());
        row.onmouseover = function () {
            closeDialog();
            if (map.extent.contains(centroid)) {
                var dialog = new dijit.TooltipDialog({
                    id: "tooltipDialog",
                    content: "<b><u>" + result.attributes.ADDRESS + "</u></b><br/>" + result.attributes.DSBL,
                    style: "position: absolute; width: auto; z-index:100"
                });
                dialog.startup();
                var evt = map.toScreen(centroid);
                dojo.style(dialog.domNode, "opacity", 0.85);
                dijit.placeOnScreen(dialog.domNode, { x: evt.x + dojo.byId("leftPane").offsetWidth + 30, y: evt.y }, ["TL", "BL"], { x: 10, y: 10 });
            }
        };
    } 
    var permitInfo = row.insertCell(1);
    permitInfo.className = "rightTD";
    permitInfo.innerHTML = "<img src='images/info-icon3.png' alt=''/>";
    permitInfo.onclick = function (cc) {
        loadPermitInfo(result.attributes.permits);

    }
}
function loadPermitInfo(items) {
    var main = new dijit.layout.TabContainer({ style: "height: 350px; width: 350px; padding-left:10px" });
    //main.tabStrip = true;
    main.startup();
    var dialog = new dojox.widget.Dialog({
        content: main,
        dimensions: [370, 390],
        showTitle: true
    });
    dialog.startup();
     
    var tc = new dijit.layout.TabContainer({ style: "height: 100%; width: 100%;" });

    for (var q = 0; q < items.length; q++) {
        var val = "";
        for (var item in items[q]) {
            if (item == "Expiration Date" && items[q]['status'] == "expiredPermit") {
                val = val + "<tr style='color:Red'><td style='text-decoration:underline;font-weight:bold;vertical-align:text-bottom width:30%;border: 1px solid #C0C0C0;'><bol>" + item + ":</bol> </td>" + "<td style='vertical-align:text-bottom;width:70%; border: 1px solid #C0C0C0;'><font size='3'>" + items[q][item] + "</td></tr>";
            } else 
            if (!(item == "InnerTabName" /*|| item == "VOID"*/ || item == "rental" || item == "MASTER_PID" || item == "status")) {
                    val = val + "<tr><td style='text-decoration:underline;font-weight:bold;vertical-align:text-bottom width:30%;border: 1px solid #C0C0C0;'><bol>" + item + ":</bol> </td>" + "<td style='vertical-align:text-bottom;width:70%; border: 1px solid #C0C0C0;'><font size='3'>" + items[q][item] + "</td></tr>";
            }
            //else {
                tabName = items[q]["Permit Type"];
            //}
        }
        var Tab = new dijit.layout.ContentPane({
            title: tabName,
            content: "<table cellspacing='0' style='width:100%; border-collapse:collapse;'>" + val + "</table>",
            selected: true
        });
        main.addChild(Tab);
    }

    dialog.show();
}
function insertsGraphic(graphic) {
    var graphicLayer;
    if (!(map.getLayer('openPermits'))) {
        graphicLayer = new esri.layers.GraphicsLayer("", { id: "openPermits" });
        dojo.connect(graphicLayer, "onClick", function (evt) {
            graphicMouseOver(evt);
            var table = document.getElementById("openPermitsTable");
            for (var z = 0, ll = table.rows.length; z < ll; z++) {
                if (table.rows[z].id == evt.graphic.attributes.PARCEL_ID) {
                    table.rows[z].childNodes[0].className = "leftTDA"
                    table.rows[z].childNodes[1].className = "rightTDA";
                    table.parentNode.parentNode.scrollTop = document.getElementById(evt.graphic.attributes.PARCEL_ID).offsetTop;
                } else {
                    table.rows[z].childNodes[0].className = "leftTD"
                    table.rows[z].childNodes[1].className = "rightTD";
                }
            }
        });
        map.addLayer(graphicLayer);
    } else {
        graphicLayer = map.getLayer('openPermits');
    }
    var color = "";
    var p = graphic.attributes.permits;
    if (p.length > 1) {
        color = new dojo.Color([255, 0, 255]);
    } else if (p[0].status == "activePermit") {
        color = new dojo.Color([0, 255, 0]);
    } else if (p[0].status == "expiredPermit") {
        color = new dojo.Color([255, 0, 0]);
    } else {
        color = new dojo.Color([0, 0, 255]);
    }

    var symbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID,
                new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID,
                color, 2), new dojo.Color([255, 255, 0, 0.25]));


    var graphic = new esri.Graphic(graphic.geometry, symbol, graphic.attributes);
    graphicLayer.add(graphic);
}
function togglePermitsLayer() {
   var vis;
   if (map.getLayer('openPermits')) {
       if (document.getElementById('openPermitsPanel').style.display == "" || document.getElementById('openPermitsPanel').style.display == "block") {
           vis = true;
       }
       else {
           vis = false;
       }
       map.getLayer('openPermits').setVisibility(vis);
   }
}
function getCentroid(extent) {
    var x = (extent.xmin + extent.xmax) / 2;
    var y = (extent.ymin + extent.ymax) / 2;
    var point = new esri.geometry.Point(x, y, map.spatialReference);
    return point;
}
function graphicMouseOver(graphic) {
    var head = graphic.graphic.attributes.permits.length > 1 ? "Multiple Permits" : graphic.graphic.attributes.permits[0]["Permit Type"];
    var t = "<div style='width:200px;'>" + head + "</div><hr/>" +
                            graphic.graphic.attributes.ADDRESS + "<br/> " +  graphic.graphic.attributes.HAMLET + "</div>";
    
    var dialog = new dijit.TooltipDialog({
        //id: "tooltipDialog2",
        content:t,
        style: "position: absolute; width: auto; z-index:100"
    });
//    var permitLink = document.createElement("div");
//    permitLink.innerHtml = "<img src='images/info-icon3.png' alt=''/>";
//    permitLink.onClick = function (e) {
//        loadPermitInfo(graphic.graphic.attributes.permits);
//    };
//    dojo.place(permitLink, dialog.domNode);
    dialog.startup();

    
    //dialog.addChild(permitLink);
    dojo.style(dialog.domNode, "opacity", 0.85);
    dijit.popup.open({ popup: dialog, x: graphic.pageX, y: graphic.pageY });
    dialog.focus();

    dojo.connect(dialog, "onBlur", function () {
        dijit.popup.close();
    });
}

function thereWasAnError(e) {
    if (e.message == "Timeout exceeded") {
        alert('The result set is too large please zoom in to narrow your search');
    }
    dijit.byId('permitGoBtn').set('disabled', false);
    document.getElementById('openPermitsWait').style.display = "none";
}
