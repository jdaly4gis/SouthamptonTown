function clickConnect(connect, taskId, ele) {
    clearActiveLayers();
    clearStreetView();
    if (connect) {
        dojo.disconnect(clickHandler);
        clickHandler = null;
        //changeIdentify(dijit.byId('identify'));
        if (ele.checked) {
            switch (taskId) {
                case 1:
                    dijit.byId("doPRC").set("checked", false);
                    dijit.byId("doReferral").set("checked", false);
                    dijit.byId("identify").set("checked", false);
                    dijit.byId("allIdentify").set("checked", false);
                    dijit.byId("getFlags").set("checked", false);
                    dijit.byId("doPictometry").set("checked", false);
                    dijit.byId("activeIdentify").set("checked", false);
                    dijit.byId("doSV").set("checked", false);
                    dijit.byId("doGroundEle").set("checked", false);
                    clickHandler = dojo.connect(map, "onClick", executePermitTask);
                    break;
                case 2:
                    dijit.byId("doPermits").set("checked", false);
                    dijit.byId("doReferral").set("checked", false);
                    dijit.byId("identify").set("checked", false);
                    dijit.byId("allIdentify").set("checked", false);
                    dijit.byId("getFlags").set("checked", false);
                    dijit.byId("doPictometry").set("checked", false);
                    dijit.byId("activeIdentify").set("checked", false);
                    dijit.byId("doSV").set("checked", false);
                    dijit.byId("doGroundEle").set("checked", false);
                    clickHandler = dojo.connect(map, "onClick", executePRCTask);
                    break;
                case 3:
                    dijit.byId("doPRC").set("checked", false);
                    dijit.byId("doPermits").set("checked", false);
                    dijit.byId("identify").set("checked", false);
                    dijit.byId("allIdentify").set("checked", false);
                    dijit.byId("getFlags").set("checked", false);
                    dijit.byId("doPictometry").set("checked", false);
                    dijit.byId("activeIdentify").set("checked", false);
                    dijit.byId("doSV").set("checked", false);
                    dijit.byId("doReferral").set("checked", false);
                    clickHandler = dojo.connect(map, "onClick", getGroundElevation);
                    break;
                case 4:
                    dijit.byId("doPRC").set("checked", false);
                    dijit.byId("doPermits").set("checked", false);
                    dijit.byId("identify").set("checked", false);
                    dijit.byId("allIdentify").set("checked", false);
                    dijit.byId("getFlags").set("checked", false);
                    dijit.byId("doPictometry").set("checked", false);
                    dijit.byId("activeIdentify").set("checked", false);
                    dijit.byId("doSV").set("checked", false);
                    dijit.byId("doGroundEle").set("checked", false);
                    clickHandler = dojo.connect(map, "onClick", executeReferralTask);
                    break;
                case 5:
                    dijit.byId("doPRC").set("checked", false);
                    dijit.byId("doReferral").set("checked", false);
                    dijit.byId("doPermits").set("checked", false);
                    dijit.byId("allIdentify").set("checked", false);
                    dijit.byId("getFlags").set("checked", false);
                    dijit.byId("doPictometry").set("checked", false);
                    dijit.byId("activeIdentify").set("checked", false);
                    dijit.byId("doSV").set("checked", false);
                    dijit.byId("doGroundEle").set("checked", false);
                    clickHandler = dojo.connect(map, "onClick", executeIdentifyTask);
                    break;
                case 6:
                    dijit.byId("doPRC").set("checked", false);
                    dijit.byId("doReferral").set("checked", false);
                    dijit.byId("doPermits").set("checked", false);
                    dijit.byId("identify").set("checked", false);
                    dijit.byId("getFlags").set("checked", false);
                    dijit.byId("doPictometry").set("checked", false);
                    dijit.byId("activeIdentify").set("checked", false);
                    dijit.byId("doSV").set("checked", false);
                    dijit.byId("doGroundEle").set("checked", false);
                    clickHandler = dojo.connect(map, "onClick", viewAllLayers);
                    break;
                case 7:
                    dijit.byId("doPRC").set("checked", false);
                    dijit.byId("doReferral").set("checked", false);
                    dijit.byId("doPermits").set("checked", false);
                    dijit.byId("identify").set("checked", false);
                    dijit.byId("allIdentify").set("checked", false);
                    dijit.byId("doPictometry").set("checked", false);
                    dijit.byId("activeIdentify").set("checked", false);
                    dijit.byId("doSV").set("checked", false);
                    dijit.byId("doGroundEle").set("checked", false);
                    clickHandler = dojo.connect(map, "onClick", executeGetFlags);
                    break;
                case 8:
                    dijit.byId("doPRC").set("checked", false);
                    dijit.byId("doReferral").set("checked", false);
                    dijit.byId("doPermits").set("checked", false);
                    dijit.byId("identify").set("checked", false);
                    dijit.byId("allIdentify").set("checked", false);
                    dijit.byId("getFlags").set("checked", false);
                    dijit.byId("activeIdentify").set("checked", false);
                    dijit.byId("doSV").set("checked", false);
                    dijit.byId("doGroundEle").set("checked", false);
                    clickHandler = dojo.connect(map, "onClick", function (point) {
                        pictometry(point.mapPoint.x, point.mapPoint.y);
                    });
                    break;
                case 9:
                    dijit.byId("doPRC").set("checked", false);
                    dijit.byId("doReferral").set("checked", false);
                    dijit.byId("doPermits").set("checked", false);
                    dijit.byId("identify").set("checked", false);
                    dijit.byId("allIdentify").set("checked", false);
                    dijit.byId("getFlags").set("checked", false);
                    dijit.byId("doPictometry").set("checked", false);
                    dijit.byId("doSV").set("checked", false);
                    dijit.byId("doGroundEle").set("checked", false);
                    clickHandler = dojo.connect(map, "onClick", identifyActiveLayer);
                    break;
                case 10:
                    dijit.byId("doPRC").set("checked", false);
                    dijit.byId("doReferral").set("checked", false);
                    dijit.byId("doPermits").set("checked", false);
                    dijit.byId("identify").set("checked", false);
                    dijit.byId("allIdentify").set("checked", false);
                    dijit.byId("getFlags").set("checked", false);
                    dijit.byId("doPictometry").set("checked", false);
                    dijit.byId("activeIdentify").set("checked", false);
                    dijit.byId("doGroundEle").set("checked", false);
                    clickHandler = dojo.connect(map, "onClick", StreetView);
                    break;
            }
        } else {
            dijit.byId("doPRC").set("checked", false);
            dijit.byId("doPermits").set("checked", false);
            dijit.byId("doReferral").set("checked", false);
            dijit.byId("identify").set("checked", false);
            dijit.byId("allIdentify").set("checked", false);
            dijit.byId("getFlags").set("checked", false);
            dijit.byId("doPictometry").set("checked", false);
            //dijit.byId("doGroundEle").set("checked", false);
            dijit.byId("activeIdentify").set("checked", false);
            //map.graphics.clear();
        }
    }
}
function executeGetFlags(evt) {
    identifyParams.tolerance = 5;
    identifyParams.returnGeometry = false;
    identifyParams.layerIds = [1];
    identifyParams.layerOption = esri.tasks.IdentifyParameters.LAYER_OPTION_TOP;
    identifyParams.width = map.width;
    identifyParams.height = map.height;
    identifyParams.mapExtent = map.extent;
    identifyParams.geometry = evt.mapPoint ? evt.mapPoint : evt;
    var deferred = identifyTask.execute(identifyParams);
    
    if (checkTown(evt)) {
        deferred.addCallback(function (response) {
            if (response[0]) {
                propertyFlags(response[0].feature.attributes.PARCEL_ID, 'a');
            } else {
                alert("No parcel at that locaiton");
            }
        });
    } else {
        alert("Please select a Town of Southampton Parcel");
    }
}

function initDynamicLayer(url, id) {
    var layer = new esri.layers.ArcGISDynamicMapServiceLayer(url, { id: id, visible: true });
    allLayers.push(layer);
    //return layer;
}
function initTiledLayer(url, id, desc) {
    var layer = new esri.layers.ArcGISTiledMapServiceLayer(url, { id: desc, visible: false });
    allLayers.push(layer);
    //return layer;
}
function doFind(ids) {
    dijit.byId("doFindBtn").set("disabled", true); 
    map.setCursor("progress");
    if (!checkIds(dijit.byId('fs').get('value'), "sessionResults")) {
        query = new esri.tasks.Query();
        query.returnGeometry = false;
        query.outFields = ["*"];
        map.infoWindow.hide();
        query.returnGeometry = true;
        var queryString = [];
        var ll = dijit.byId('fs');

        if (ids) {
            var values = ids.split(',');
            for (var i = 0, ll = values.length; i < ll; i++) {
                var currentVals = values[i].split(';');
                queryString.push("(PARCEL_ID = " + currentVals[0] + " and DSBL like '" + currentVals[1] + "%')");
            }
            query.where = queryString.join(" or ");
            //manage layers
            var parcelQueryTask = new esri.tasks.QueryTask(lmURL + "/0");

            parcelQueryTask.execute(query, function (results) {
                var sender = "";
                if (ids) { sender = "saved" }
                zoomToParcel(results, sender);
            }, function (e) {
                dijit.byId("doFindBtn").set("disabled", false);
                dijit.byId('fs').set('value', "");
                document.getElementById('p_id').value = "";
            });
        } else {
            val = dijit.byId('fs').get('value');
            if (dijit.byId('fs').get('value').split(';')[0] == "subd") {
                //manage Layers
                query.where = "SUBD_NAME ='" + dijit.byId('fs').get('value').split(';')[1] + "' and FILE_DATE = date '" + dijit.byId('fs').get('value').split(';')[2] + "'";
                var subdQueryTask = new esri.tasks.QueryTask(lmURL + "/76");

                subdQueryTask.execute(query, function (results) {
                    zoomGeometry(results.features[0], map);
                    map.setCursor("default");
                    //manage layers
                    var layerNode = document.getElementById('layer76');
                    if (layerNode && !layerNode.childNodes[0].checked) {
                        layerNode.childNodes[0].checked = true;
                        changeLayerVisibility(76, layerNode.childNodes[0]);
                    }
                    dijit.byId('fs').set('value', "");
                    document.getElementById('p_id').value = "";
                    dijit.byId("doFindBtn").set("disabled", false);
                }, function (e) {
                    dijit.byId("doFindBtn").set("disabled", false);
                    dijit.byId('fs').set('value', "");
                    document.getElementById('p_id').value = "";
                });
            } else {
                if (dijit.byId('fs').get('value').split(';')[0] == "pm") {
                    query.where = "PARCEL_ID in (" + dijit.byId('fs').get('value').split(';')[1] + ") and DSBL like '9%'";
                } else {
                    query.where = "PARCEL_ID in (" + dijit.byId('fs').get('value').split(';')[0] + ") and DSBL like '" + dijit.byId('fs').get('value').split(';')[1] + "%'";
                }
                
                //var floor = dijit.byId('fs').get('value').split(';')[3];
                var queryURL = "";
                //manage layers
                switch (dijit.byId('fs').get('value').split(';')[3]) {
                    case '1':
                        queryURL = lmURL + "/0";
                        break;
                    case '2':
                        queryURL = lmURL + "/13";
                        if (!document.getElementById('layer12').childNodes[0].checked) {
                            document.getElementById('layer12').childNodes[0].checked = true;
                            changeLayerVisibility(12, document.getElementById('layer12').childNodes[0]);
                        }
                        break;
                    case '3':
                        queryURL = lmURL + "/14";
                        if (!document.getElementById('layer13').childNodes[0].checked) {
                            document.getElementById('layer13').childNodes[0].checked = true;
                            changeLayerVisibility(13, document.getElementById('layer13').childNodes[0]);
                        }
                        break;
                    default:
                        queryURL = lmURL + "/0";
                        break;
                }
                var parcelQueryTask = new esri.tasks.QueryTask(queryURL);

                parcelQueryTask.execute(query, function (results) {
                    var sender = "";
                    if (ids) { sender = "saved" }
                    zoomToParcel(results, sender);
                }, function (e) {
                    dijit.byId("doFindBtn").set("disabled", false);
                    dijit.byId('fs').set('value', "");
                    document.getElementById('p_id').value = "";
                });
            }
        }
    } else {
        alert('That property is listed already');
    }
}

function zoomToParcel(results, sender) {
    if (sender != "saved") {
        if (dijit.byId('flaggsToggler').checked && !(results.features[0].attributes.HAMLET == "Village of Sag Harbor - EH") ) {
            propertyFlags(results.features[0].attributes.PARCEL_ID, "q");
        }
        zoomGeometry(results.features[0], map);
    }
    var sessionGraphics = map.getLayer("sessionGraphicsLayer");
    
    for (var i = 0, ll = results.features.length; i < ll; i++) {
        if (!checkIds(results.features[i].attributes.PARCEL_ID, "sessionResults")) {
            sessionGraphics.add(results.features[i].setSymbol(useDefaultSymbol()));
        }
    }
    map.setCursor("default");
    dijit.byId('fs').set('value', "");
    document.getElementById('p_id').value = "";
    dijit.byId("doFindBtn").set("disabled", false);
}

function doPermit(sender) {
    clickConnect(true, 1, sender);
}
function doPropertyRecordCard(sender) {
    clickConnect(true, 2, sender);
}
function doGetElevation(sender) {
    clickConnect(true, 3, sender);
}
function doReferral(sender) {
    closeAllPanels();
    clickConnect(true, 4, sender);
}
function doIdentify(sender) {
    closeAllPanels();
    clickConnect(true, 5, sender);
}
function doAllIdentify(sender) {
    closeAllPanels();
    clickConnect(true, 6, sender);
}
function doGetFlags(sender) {
    closeAllPanels();
    clickConnect(true, 7, sender);
}
function doPictometry(sender) {
    clickConnect(true, 8, sender);
}
function doActiveIdentify(sender) {
    clickConnect(true, 9, sender);
}
function doStreetView(sender) {
    clickConnect(true, 10, sender);
}

function executePermitTask(evt) {
    var permitTask, query;
    map.setCursor("progress");

    query = new esri.tasks.Query();
    query.returnGeometry = false;

    query.outFields = ["*"];
    map.infoWindow.hide();
    map.graphics.clear();

    query.geometry = evt.mapPoint ? evt.mapPoint : evt;
    if (checkTown(evt)) {
        taxParcelQueryTask.execute(query, function (fset) {
            if (fset.features.length === 1) {
                showPermitWindow(fset, evt);
                map.setCursor("default");
            } else if (fset.features.length == 0) {
                map.setCursor("default");
                alert("No parcel at that location");
            }
        });
    } else {
        alert("Please select a Town of Southampton Parcel");
        map.setCursor("default");
    }
}

function showPermitWindow(result, symbol) {
    var features = result.features;
    var feature = features[0];
    var attr = feature.attributes;
    var theURL = "https://gis2.southamptontownny.gov/permits/permits.htm?pid=" + attr.PARCEL_ID + "&sender=lm";
    showPermit(theURL, 680, 575);
}

function executePRCTask(evt) {
    var PRCTask, query;
    map.setCursor("progress");

    query = new esri.tasks.Query();
    query.outSpatialReference = { "wkid": 2263 };
    query.returnGeometry = false;
    query.outFields = ["*"];
    
    map.infoWindow.hide();
    map.graphics.clear();
    query.geometry = evt.mapPoint;
    if (checkTown(evt)) {
        taxParcelQueryTask.execute(query, function (fset) {
            if (fset.features.length === 1) {
                showPRCWindow(fset, evt);
                map.setCursor("default");
            } else if (fset.features.length == 0) {
                map.setCursor("default");
                alert("No parcel at that location");
            }
        });
    } else {
        alert("Please select a Town of Southampton Parcel");
        map.setCursor("default");
    }
}
function executeReferralTask(evt) {
    var referralTask, query;
    map.setCursor("progress");

    query = new esri.tasks.Query();
    query.returnGeometry = false;
    map.infoWindow.hide();
    map.graphics.clear();
    query.geometry = evt.mapPoint;
    query.outFields = ["*"];
    if (checkTown(evt)) {
        taxParcelQueryTask.execute(query, function (fset) {
            if (fset.features.length === 1) {
                showReferralWindow(fset, evt);
                map.setCursor("default");
            } else if (fset.features.length == 0) {
                map.setCursor("default");
                alert("No parcel at that location");
            }
        });
    } else {
        alert("Please select a Town of Southampton Parcel");
        map.setCursor("default");
    }
}
function showPRCWindow(result, symbol) {
    map.graphics.clear;
    var features = result.features;
    var feature = features[0];
    var attr = feature.attributes;
    //var theURL = "https://gis2.southamptontownny.gov/WebResources/Reports/affREPORT/default.aspx?ParcelID=" + attr.PARCEL_ID;
    //var theURL = "https://gis2.southamptontownny.gov/affReport/index.html?pid=" + attr.PARCEL_ID;
    openRecordCard(attr.PARCEL_ID);
    //showPRC(theURL, 950, 625);
}
function getGroundElevation(evt) {
    map.setCursor("progress");
    closeDialog();
    var eleIdentifyTask = new esri.tasks.IdentifyTask("https://gis2.southamptontownny.gov/arcgis/rest/services/Imagery/DEM/MapServer");
    eleIdentifyParams = new esri.tasks.IdentifyParameters();
    eleIdentifyParams.layerIds = [1];
    eleIdentifyParams.width = map.width;
    eleIdentifyParams.tolerance = 1;
    eleIdentifyParams.layerOption = esri.tasks.IdentifyParameters.LAYER_OPTION_ALL;
    eleIdentifyParams.height = map.height;
    eleIdentifyParams.geometry = evt.mapPoint;
    eleIdentifyParams.mapExtent = map.extent;

    eleIdentifyParams.spatialReference = map.spatialReference;
    eleIdentifyTask.execute(eleIdentifyParams, function (response) {
        map.setCursor("default");
        if (response.length > 0) {
            var value = "No Data";

            if (response[0].feature.attributes["Pixel Value"] != "NoData") {
                value = response[0].feature.attributes["Pixel Value"] * 1;
                value = value.toFixed(0);
            }
//            var helpText = new dijit.TooltipDialog({
//                content: "Heights are above sea level because the reference datum (NAVD88) is tied to a defined elevation at one point rather than to an location's exact mean sea level",
//                style: "position: absolute; width: auto; z-index:100",
//                connectId: "aslID"
//            });
//            dialog.startup();

            var content = "<div><span>" + value + " Ft. <span>(asl)<span></span><div class='MessageClose' onclick='closeDialog();'>X</div></div>";
            var dialog = new dijit.TooltipDialog({
                id: "tooltipDialog",
                content: content,
                style: "position: absolute; width: auto; z-index:100"
            });
            dialog.startup();
            var evt = map.toScreen(eleIdentifyParams.geometry);
            dojo.style(dialog.domNode, "opacity", 0.85);
            dijit.placeOnScreen(dialog.domNode, { x: evt.x + dojo.byId("leftPane").offsetWidth + 30, y: evt.y }, ["TL", "BL"], { x: 10, y: 10 });
        } else {
            alert("There is no Elevation Information in the location you clicked");
        }

    });
}
function showReferralWindow(result, evt) {
    map.graphics.clear;
    var theURL = "Modules/referrals/Referrals.html?object_id=" + result.features[0].attributes.OBJECTID;
    showReferral(theURL, 1240, 800);
}
function doMultiFind() {
    dijit.byId("doMultiFindBtn").set("disabled", true);
    
    var findTask = new esri.tasks.FindTask(lmURL);
    findParams.searchText = dojo.byId('searchInfo').value;
    findParams.searchFields = ["PARCEL_ID", "DSBL", "ADDRESS", "LAST_NAME", "COMPANY", "ACREAGE"];
    findTask.execute(findParams, showGridResults, function (e) {
        dijit.byId("doMultiFindBtn").set("disabled", false);
    });
}
function showGridResults(results) {
    map.getLayer("multipleResults").clear();

    var symbol = multipleParcelSymbol();
    //var symbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([98,194,204]), 2), new dojo.Color([98,194,204,0.5]));
    var zoomResults = {};
    zoomResults.features = [results.length]

    var dataForGrid = [];
    //Create data object to be used in store
    var i = 0;
    dojo.forEach(results, function (result) {
        var graphic = result.feature;
        graphic.setSymbol(symbol);
        map.getLayer("multipleResults").add(result.feature);
        zoomResults.features[i] = result.feature;
        dataForGrid.push([result.feature.attributes.OBJECTID, "", result.feature.attributes.ADDRESS, result.feature.attributes.PARCEL_ID, result.feature.attributes.DSBL, result.feature.attributes.FIRST_NAME, result.feature.attributes.LAST_NAME, result.feature.attributes.HAMLET, result.feature.attributes.COMPANY, result.feature.attributes.PROP_TYPE, result.feature.attributes.ACREAGE]);
        i++;
    });
    var data = {
        items: dataForGrid
    };
    //Create data store and bind to grid.
    var store = new dojo.data.ItemFileWriteStore({ "data": data });
    var thisGrid = dijit.byId('grid');
    thisGrid.setStore(store);

    thisGrid.onHeaderCellClick = function (e) {
        if (e.cellIndex == 0) {
            dojo.forEach(map.getLayer("multipleResults").graphics, function (graphic) {
                var table = document.getElementById("sessionResults");
                var pid = graphic.attributes["PARCEL_ID"];
                if (!checkIds(pid, "sessionResults")) {
                    graphic.setSymbol(useDefaultSymbol());
                    map.getLayer("sessionGraphicsLayer").add(graphic);
                }
            });
            clearGrid();
        }
        if (e.cellIndex == 1) {
            clearGrid();
        } else {
            thisGrid.setSortIndex(e.cellIndex, !thisGrid.getSortAsc());
            thisGrid.sort();
        }
    };
    //thisGrid.onCellClick = function (e) {
    //    if (e.cellIndex > 1) {
    //        map.setExtent(zoomResults.features[e.rowIndex].geometry.getExtent(), true)
    //    }
    //}

    zoomFeatureSetExtemt(zoomResults);
    dijit.byId("doMultiFindBtn").set("disabled", false);
}
function showSelectByLocationResults(results) {
    map.getLayer("multipleResults").clear();

    var symbol = multipleParcelSymbol();
    
    var zoomResults = {};
    zoomResults.features = [results.length];

    var dataForGrid = [];
    //Create data object to be used in store
    var i = 0;
    dojo.forEach(results, function (result) {
        var graphic = result;
        graphic.setSymbol(symbol);
        map.getLayer("multipleResults").add(result);
        zoomResults.features[i] = result;
        dataForGrid.push([result.attributes.OBJECTID,"", result.attributes.ADDRESS, result.attributes.PARCEL_ID, result.attributes.DSBL, result.attributes.FIRST_NAME, result.attributes.LAST_NAME, result.attributes.HAMLET, result.attributes.COMPANY, result.attributes.PROP_TYPE, result.attributes.ACREAGE]);
        i++;
    });
    var data = {
        items: dataForGrid
    };
    //Create data store and bind to grid.
    var store = new dojo.data.ItemFileWriteStore({ "data": data });
    var thisGrid = dijit.byId('grid');
    thisGrid.setStore(store);

    thisGrid.onHeaderCellClick = function (e) {
        if (e.cellIndex == 0) {
            dojo.forEach(map.getLayer("multipleResults").graphics, function (graphic) {
                var table = document.getElementById("sessionResults");
                var pid = graphic.attributes["PARCEL_ID"];
                if (!checkIds(pid, "sessionResults")) {
                    graphic.setSymbol(useDefaultSymbol()); 
                    map.getLayer("sessionGraphicsLayer").add(graphic);
                }
            });
            clearGrid();
        } if (e.cellIndex == 1) {
            clearGrid();
        } else {
            thisGrid.setSortIndex(e.cellIndex, !thisGrid.getSortAsc());
            thisGrid.sort();
        }
    };
    zoomFeatureSetExtemt(zoomResults);
    dijit.byId("doMultiFindBtn").set("disabled", false);
}
function getCellClicked(e) {
    var grid = dijit.byId("grid");
    var graphicsLayer = map.getLayer("multipleResults");
    if (e.cellIndex == 0) {
        var selectedParcel;
        var clickedTaxLotId = grid.getItem(e.rowIndex)[3][0];
        var clickedFeature = grid.getItem(e.rowIndex);
        var attributes = { "ADDRESS": clickedFeature[2][0], "CITY": clickedFeature[7][0], "DSBL": clickedFeature[4][0], "PARCEL_ID": clickedFeature[3][0] };
        dojo.forEach(graphicsLayer.graphics, function (graphic) {
            if ((graphic.attributes) && graphic.attributes.PARCEL_ID == clickedFeature[3][0]) {
                selectedParcel = graphic;
                return;
            }
        });
        var table = document.getElementById("sessionResults");
        selectedParcel.attributes = attributes;
        if (!checkIds(selectedParcel.attributes.PARCEL_ID, "sessionResults")) {
            removeGridRow(e);
            selectedParcel.setSymbol(useDefaultSymbol());
            map.getLayer("sessionGraphicsLayer").add(selectedParcel);
        } else {
            alert("That Property is already listed");
        }
    } else if (e.cellIndex == 1) {
        removeGridRow(e);
    } else {
        onRowClickHandler(e);
    }
}
function removeGridRow(e) {
    var selectedParcel;
    var grid = dijit.byId("grid");
    var graphicsLayer = map.getLayer("multipleResults");
    var clickedFeature = grid.getItem(e.rowIndex);
    dojo.forEach(graphicsLayer.graphics, function (graphic) {
        if ((graphic.attributes) && graphic.attributes.PARCEL_ID == clickedFeature[3][0]) {
            selectedParcel = graphic;
            return;
        }
    });
    
    grid.store.deleteItem(grid.getItem(e.rowIndex));
    graphicsLayer.remove(selectedParcel);
}
function addGridResultsToResults(id) {
    var zBtn = "<img src='images/add-icon.png'/>";
    return zBtn;
}
function removeGridResults(id) {
    var zBtn = "<img src='images/nav_decline.png'/>";
    return zBtn;
}

function onRowClickHandler(evt) {
    var grid = dijit.byId("grid");
    var graphicsLayer = map.getLayer("multipleResults");
    if (evt.cellIndex != 0 && evt.cellIndex != 1) {
        var clickedTaxLotId = grid.getItem(evt.rowIndex)[3][0];
        var selectedTaxLot;
        dojo.forEach(graphicsLayer.graphics, function (graphic) {
            if ((graphic.attributes) && graphic.attributes.PARCEL_ID == clickedTaxLotId) {
                selectedTaxLot = graphic;
                return;
            }
        });
//        var taxLotExtent = selectedTaxLot.geometry.getExtent();
//        map.setExtent(taxLotExtent);
        zoomGeometry(selectedTaxLot, map);
        if (dijit.byId('flaggsToggler').checked) {
            propertyFlags(clickedTaxLotId, "q");
        }
    }
}
function handleError(err) {
    console.log("Something broke: ", err.message);
}
function useDefaultSymbol() {
    var outline = (dijit.byId('graphPolyOut').value != ""  ? new dojo.Color(dijit.byId('graphPolyOut').value) : new dojo.Color("orange"));
    var fill = ((dijit.byId('graphPolyFill').value != "" && !dijit.byId('TgraphPolyFill').checked) ? new dojo.Color(dijit.byId('graphPolyFill').value) : null);
    polysymbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID,
					    new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, outline, 2),
					    fill);
    if (polysymbol.color){
        polysymbol.color.a = .35;
    }
    return (polysymbol);
}
function multipleParcelSymbol() {
    var outline = new dojo.Color([0, 255, 255, 0.75]);
    var fill = null;
    polysymbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID,
					    new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, outline, 2),
					    null);
    return (polysymbol);
}
function clearGrid() {
    var data = {
        identifier: "PARCEL_ID",  //This field needs to have unique values
        label: "PARCEL_ID", //Name field for display. Not pertinent to a grid but may be used elsewhere.
        items: ""
    };
    var store = new dojo.data.ItemFileReadStore({ data: data });
    var grid = dijit.byId('grid');
    grid.setStore(store);
    map.getLayer("multipleResults").clear();
    map.getLayer("multipleResults").refresh();
    map.getLayer("sessionGraphicsLayer").refresh();
}
function checkIds(id, tableName) {
    var ids = [];
    var bool;
    var table = document.getElementById(tableName);
    var rowCount = table.rows.length;
    var rowId = "r" + id;
    if (rowCount > 0) {
        for (i = 0; i < table.rows.length; i++) {
            if (rowId == table.rows[i].id) {
                bool = true;
                break;
            } else {
                bool = false;
            }
        }
    } else {
        bool = false;
    }
    return bool;
}
function filterResults(sender, x, y) {
    
    var propType = "PROP_TYPE Like '" + dijit.byId("propType").get('value') + "'";
    if (dijit.byId('waterFront').checked) {
        propType = propType + " and PROP_TYPE Like '%W'";
    }
    var date = "saledate between date '" + dijit.byId("startDate").get('displayedValue') + "' and date '" + dijit.byId("endDate").get('displayedValue') + "'";
    var money = "SALE_PRICE between " + dijit.byId("startMoney").get('value') + " and " + dijit.byId("endMoney").get('value');

    var hamlet = [];

    var list = dojo.query("input:checked", "toolTip");
    var query;
    query = propType + " and " + date + " and " + money;

    if ((list.length > 0)) {
        for (i = 0; i < list.length; i++) {
            hamlet.push("'" + list[i].value + "'");
        }

        query = query + " and HAMLET in (" + hamlet.join(',') + ")";
    }
    else {
        hamlet.push("'none'");
    }
    //manage Layers
    var layerDefinitions = [];
    layerDefinitions[81] = query;
    layerDefinitions[82] = query;
    map.getLayer('lmCore').setLayerDefinitions(layerDefinitions, false);

    var qt = new esri.tasks.QueryTask(lmURL + "/81");
    var qTquery = new esri.tasks.Query();
    qTquery.where = query;
    qTquery.returnGeometry = false;
    qt.executeForIds(qTquery, function (results) {
        document.getElementById('filterMessage').style.display = 'block';
        if (results) {
            document.getElementById('filterMessage').innerHTML = 'There are ' + results.length + ' sales that match your criteria';
        } else {
            document.getElementById('filterMessage').innerHTML = 'Your Filter Returned No Results';
        }
    });
}
function isMobile() {
    try {
        document.createEvent("TouchEvent");
        return true;
    }
    catch (e) {
        if ((/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))) {
            return true;
        } else {
            return false;
        }
    }
}