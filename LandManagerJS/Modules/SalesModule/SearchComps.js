function compsQuery(sender) {
    dijit.byId("indicator").set('label', "<img alt='' src='Images/waitBlue.gif'/>");
    var d = dijit.byId("indicator");
    var x = document.getElementsByName("compSearch");
    var ele = {};
    var query = [];
    var queryCount = 0;
    for (i = 0; i < x.length; i++) {
        var ele = x[i];
        var id = x[i].parentNode.parentNode.parentNode.id;
        var field = x[i].parentNode.parentNode.parentNode.title;
        if (!(dojo.byId(id + "V").disabled)) {
            var value = dijit.byId(id + "V").value;
            var range = (dijit.byId(id + "M") != undefined ? dijit.byId(id + "M").value : 0) + 0;
            query[queryCount] = field + (range != 0 ? addrange(range, id, value) : " >= " + value);
            //query[queryCount] = field + (range != 0 ? " between " + (value - range) + " and " + (value + range) : " >= " + value);
            queryCount++;
        } else {
            var value = 0;
            var range = 0;
            query[queryCount] = field + (range != 0 ? " between " + (value - range) + " and " + (value + range) : " >= " + value);
            queryCount++;
        }
    }
    var hamlet = [];
    var list = dojo.query("input:checked", "searchTooltip");
   
    if ((list.length > 0)) {
        for (iq = 0; iq < list.length; iq++) {
            hamlet.push("'" + list[iq].value + "'");
        }
        query[i + 1] = "HAMLET in (" + hamlet.join(',') + ")";
    } else {
        //hamlet.push("'none'");
        query[i + 1] = "HAMLET in ('none')";
    }
    var buildingQuery = query[1] + " and " + query[2] + " and " + query[3] + " and " + query[4] + " and BLDG_USE_CODE = '" + document.getElementById('designSelect').value + "'";

    var store = new dojox.data.QueryReadStore({ url: 'getJSON.ashx' });
    store.fetch({ serverQuery: { type: buildingQuery, sender: "findSales" },
        onError: function () {
            dijit.byId("indicator").set('label', "");
        },
        onComplete: function (items, request) {
            var pid = [];
            for (var q = 0; q < items.length; q++) {
                pid[q] = items[q].i.P_ID;
            }
            var pidString = pid.join(',');
            //manage layers
            var QueryTask = new esri.tasks.QueryTask(lmURL + "/81");
            //Define query parameters
            var Query = new esri.tasks.Query();
            Query.outFields = ['*'];
            Query.returnGeometry = true;
            Query.orderByFields = ["HAMLET DESC"];
            Query.where = "DSBL like '9%' and PARCEL_ID in (" + pidString + ") and " + query[0] + " and " + query[i + 1];
            QueryTask.execute(Query, function (results) {
                   if (results.features.length < 1) {
                    alert('That query did not return results. \rDid you select a Hamlet?');
                } else {
                    for (r = 0; r < results.features.length; r++) {
                        var doj = dojo.toJson(results.features[r].toJson()).replace(/'/g, "&#39;");
                        addComps(results.features[r].toJson(), "sales");
                        //The Recent sales website did not have a graphic layer associated with the results
                        //var graphicLayer;
                       // if (!(map.getLayer('arResults'))) {
//                            graphicLayer = new esri.layers.GraphicsLayer("", { id: "arResults" });
//                            dojo.connect(graphicLayer, "onClick", function (evt) {
//                                //graphicMouseOver(evt);
//                                var table = document.getElementById("arResults");
//                                for (var z = 0, ll = table.rows.length; z < ll; z++) {
//                                    if (table.rows[z].id == "r" + evt.graphic.attributes.PARCEL_ID) {
//                                        table.rows[z].childNodes[0].className = "leftTDA"
//                                        table.rows[z].childNodes[1].className = "middleTDA";
//                                        table.rows[z].childNodes[2].className = "rightTDA";
//                                        //var as = document.getElementById("r" + evt.graphic.attributes.PARCEL_ID);
//                                        table.parentNode.scrollTop = document.getElementById("r" + evt.graphic.attributes.PARCEL_ID).offsetTop;
//                                    } else {
//                                        table.rows[z].childNodes[0].className = "leftTD"
//                                        table.rows[z].childNodes[1].className = "middleTd";
//                                        table.rows[z].childNodes[2].className = "rightTD";
//                                    }
//                                }
//                            });
//                            map.addLayer(graphicLayer);
//                        } else {
//                            graphicLayer = map.getLayer('arResults');
//                        }
//                        var symbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID,
//                            new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID,
//                            new dojo.Color([255, 0, 255]), 2), new dojo.Color([255, 255, 0, 0.25]));

//                        var graphic = new esri.Graphic(results.features[r].geometry, symbol, results.features[r].attributes);
//                        graphicLayer.add(graphic);
                    }
                }
                dijit.byId("indicator").set('label', "");
            }, function (e) {
                dijit.byId("indicator").set('label', "");
                alert(e.message);
            });
        }
    });
}
function addrange(range, id, value) {
    if (document.getElementById(id + "Range").title == "Plus Minus") {
        return " between " + (value - range) + " and " + (value + range);
    } else if (document.getElementById(id + "Range").title == "Minus") {
        return " between " + (value - range) + " and " + (value);
    } else if (document.getElementById(id + "Range").title == "Plus") {
        return " between " + (value) + " and " + (value + range);
    }
}
function disableElements(senderId, ele) {
    var dAble = (ele.checked != true ? true : false);
    if (senderId == "designSelect") {
        document.getElementById(senderId).disabled = dAble;
    } else {
        dojo.byId(senderId + "V").disabled = dAble;
        if (dojo.byId(senderId + "M")) {
            dojo.byId(senderId + "M").disabled = dAble;
        }
    }
}