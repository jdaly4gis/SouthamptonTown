function getOpenPermits() {
    var value = dV = dijit.byId('selectPermitType').getDisplayedValue();
    if (value == "Expired Permits") {
        value = "expired";
    } else if (value == "All Permits") {
        value = "%";
    }
    dijit.byId('permitGoBtn').set('disabled', true);
    document.getElementById('openPermitsWait').style.display = "block";
    var sc = map.getScale();

    if (dijit.byId('useMapExtent').checked /*|| dijit.byId('useMapExtent').disabled*/ || dV == "Expired Permits" || dV == "All Permits") {
        if (sc < 8000) {
            permitQueryResultsUseMapGeometry(value);
        } else {
            alert('The result set is too large please zoom in to narrow your search');
            dijit.byId('permitGoBtn').set('disabled', false);
            document.getElementById('openPermitsWait').style.display = "none";
        }
    } else {
        //if (value == "expired" || value == "%") {
            //if (sc < 17000) {
                fetchResults(value);
            //} else {
               // alert('Please zoom in to narrow your search results');
                //dijit.byId('permitGoBtn').set('disabled', false);
                //document.getElementById('openPermitsWait').style.display = "none";
            //}
//        } else {
//            fetchResults(value);
//        }
    }
}
function thereWasAnError(e) {
    if (e.message == "Timeout exceeded") {
        alert('The result set is too large please zoom in to narrow your search');
    }
    dijit.byId('permitGoBtn').set('disabled', false);
    document.getElementById('openPermitsWait').style.display = "none";
}

function fetchResults(value) {
    var buildingStore = new dojox.data.QueryReadStore({ url: 'getJSON.ashx' });
    buildingStore.fetch({ serverQuery: { type: value, dept: document.getElementById("openPermitsDepartment").value, sender: "openPermits" },
        onComplete: function (items, request) {
             if (items[0].i.ids) {
                var permitsQuery = new esri.tasks.Query();
                permitsQuery.returnGeometry = true;
                permitsQuery.where = "PARCEL_ID in (" + items[0].i.ids + ")";
                permitsQuery.outFields = ["*"];
                permitsQuery.orderByFields = ["HAMLET", "DSBL"];
                //var permitsQueryTask = esri.tasks.QueryTask(lmURL + "/0");

                if (dijit.byId('useMapExtent').checked || (value == "expired" || value == "%")) {
                    permitsQuery.geometry = map.extent;
                    taxParcelQueryTask.execute(permitsQuery, function (results) { permitQueryResults(results, items); }, thereWasAnError);

                } else {
                    taxParcelQueryTask.execute(permitsQuery, function (results) { permitQueryResults(results, items); }, thereWasAnError);
                }
            } else {
                document.getElementById('openPermitsPanel').style.display = "none";
                alert("There are no permits that for that type, in your department");
                dijit.byId('permitGoBtn').set('disabled', false);
                document.getElementById('openPermitsWait').style.display = "none";
            }
        }
    });
}
function permitQueryResultsUseMapGeometry(value) { 
    var permitsQuery = new esri.tasks.Query();
    permitsQuery.returnGeometry = true;
    permitsQuery.outFields = ["*"];
    permitsQuery.orderByFields = ["HAMLET", "DSBL"];
   // var permitsQueryTask = esri.tasks.QueryTask(lmURL + "/0");
    permitsQuery.geometry = map.extent.getExtent();
    taxParcelQueryTask.execute(permitsQuery, function (results) {
        if (document.getElementById("openPermitsTable").rows.length > 0) {
            clearTableRow("openPermitsTable");
        }
        if (map.getLayer('openPermits')) {
            map.getLayer('openPermits').clear();
        }
        var r = {};
        var ids = [];
        for (var o = 0, len = results.features.length; o < len; o++) {
            ids.push(results.features[o].attributes.PARCEL_ID);
            r[results.features[o].attributes.PARCEL_ID] = results.features[o];
        }
        var buildingStore = new dojox.data.QueryReadStore({ url: 'getJSON.ashx' });
        buildingStore.requestMethod = "post";
        buildingStore.fetch({ serverQuery: { type: value, dept: document.getElementById("openPermitsDepartment").value, ids: ids.join(','), sender: "openPermitsMapExtent" },
            onComplete: function (items, request) {
                if (items.length > 0) {
                    var count = 0;
                    for (var z in items[0].i) {
                        if (r[z]) {
                            r[z].attributes.permits = jsonParse("[" + items[0].i[z] + "]");
                            insertsGraphic(r[z]);
                            updatePermitsGrid(r[z]);
                        }
                        count++;
                    }
                    if (count == 0) {
                        alert('there are no permits that match your search criteria');
                    }
                    document.getElementById('openPermitsWait').style.display = "none";
                    dijit.byId('permitGoBtn').set('disabled', false);
                } else {
                    alert("There are no permits matching your search criteria.");
                }
                //alert(items[0].i);
            }, onError: function (e) {
                alert(e);
            }
        });
    }, thereWasAnError);
}
function permitQueryResults(results, items) { 
    if (results.features.length != 0) {
        if (document.getElementById("openPermitsTable").rows.length > 0) {
            clearTableRow("openPermitsTable");
        }
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
    }
    else {
        alert("Those permits could not be mapped\rPlease Contact The GIS Department");
    }
    document.getElementById('openPermitsWait').style.display = "none";
    dijit.byId('permitGoBtn').set('disabled', false);
    
}
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
function getPermitTypes() {
    var store = dijit.byId('selectPermitType').store;
    var dept = checkedRadioBtn('dept');
    if (document.getElementById("openPermitsDepartment").value != dept) {
        var buildingStore = new dojox.data.QueryReadStore({ url: 'getJSON.ashx' });
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