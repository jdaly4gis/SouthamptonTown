function propertyFlags(id, evt) {
    var FlagsStore = new dojox.data.QueryReadStore({ url: 'modules/flags/getFlags.ashx' });
    FlagsStore.fetch({ serverQuery: { p_ID: id, sender: "flag" },
        onError: function (e) {
            alert(e.message);
        },
        onComplete: function (items, request) {
            var val = "";
            if (items.length > 0) {
                var main = new dijit.layout.TabContainer({ style: "height: 350px; width: 350px; padding-left:10px" });
                main.startup();
                var dialog = new dojox.widget.Dialog({
                    content: main,
                    dimensions: [370, 390],
                    title: "Flags For Parcel ID: " + id,
                    showTitle: true
                });
                dialog.startup();
                var tc = new dijit.layout.TabContainer({ style: "height: 100%; width: 100%;" });
                for (var q = 0; q < items.length; q++) {
                    var fields = request.store.getAttributes(items[q]);
                    var expDate;
                    if (items[q].i.EXP_DATE == "") { expDate = "No Date"; } else { expDate = items[q].i.EXP_DATE; }
                    if (items[q].i.FieldOrder == 1) {
                        val += "<tr style='vertical-align:middle;'><td class='infoDLG'><p style='font-size:Small;font-weight: bold;text-decoration: underline;'>" + items[q].i.message + "</p></td></tr>";
                    } else {
                        val += "<tr style='vertical-align:middle;'><td class='infoDLG'><b><u>Expires:&nbsp;" + expDate + "</u></b><br/> " + items[q].i.message + "</td></tr>";
                    }
                }
                var Tab = new dijit.layout.ContentPane({
                    title: "Flags",
                    content: "<table cellspacing='0' style='width:100%'>" + val + "</table>",
                    selected: true
                });
                main.addChild(Tab);
                dialog.show();
            }
            else {
                if (evt == "q") { } else {
                    alert("There are no flags on this property");
                }
            }
        }
    });
}
function showFlagsOnMap(check) {
    var dept = getDepartment();
    if (dept == "all" || dept == "Basic") {
        dept = "-1";
    }
    //if (check) {
        var layer = map.getLayer('propertyFlags');
        if (layer) {
            layer.setVisibility(check);
        } else {
            //for (var x in map.graphicsLayerIds) {
            //    if (map.graphicsLayerIds[x].indexOf('propertyFlags') != -1) {
            //        map.removeLayer(map.getLayer(map.graphicsLayerIds[x]));
            //    }
            //}
            layer = new esri.layers.GraphicsLayer({ id: "propertyFlags" });
            layer.setVisibility(check);
            map.addLayer(layer);
            map.setCursor("progress");
            var FlagsStore = new dojox.data.QueryReadStore({ url: 'modules/flags/getFlags.ashx' });
            FlagsStore.fetch({
                onBegin: function (e) {
                    
                },
                serverQuery: { dept: dept, sender: "showAllflag" },
                onError: function (e) {
                    alert(e.message);
                    map.setCursor("default");
                },
                onComplete: function (items, request) {
                    var val = "";
                    map.setCursor("default");
                    if (items.length > 0) {

                        //var marker = new esri.symbol.SimpleMarkerSymbol();
                        //marker.setSize(30);
                        //marker.setColor(new dojo.Color([255, 0, 0, 0.5]));
                        //marker.setPath("M16,3.5c-4.142,0-7.5,3.358-7.5,7.5c0,4.143,7.5,18.121,7.5,18.121S23.5,15.143,23.5,11C23.5,6.858,20.143,3.5,16,3.5z M16,14.584c-1.979,0-3.584-1.604-3.584-3.584S14.021,7.416,16,7.416S19.584,9.021,19.584,11S17.979,14.584,16,14.584z");
                        //marker.setStyle(esri.symbol.SimpleMarkerSymbol.STYLE_PATH);

                        var graphSymbol = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_SQUARE, 10,
                                           new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID,
                                           new dojo.Color([255, 0, 0]), 1),
                                           new dojo.Color([125, 125, 125, 0.5]));
                        for (var i = 0 ; i < items.length; i++) {
                            var geom = new esri.geometry.Point(items[i].i.Xcoord, items[i].i.Ycoord, map.spatialReference);
                            var graph = new esri.Graphic(geom, graphSymbol, { message: items[i].i.message });
                            layer.add(graph);
                        }
                        layer.on('mouse-over', function () {
                            map.setCursor('pointer');
                        });
                        layer.on('mouse-over', function () {
                            map.setCursor('default');
                        });
                        layer.on("click", function (evt) {
                            var cont = evt.graphic.attributes.message.length >= 75 ? evt.graphic.attributes.message + "..." : evt.graphic.attributes.message;
                            var dialog = new dijit.TooltipDialog({
                                content: "<div style='width:200px;'>" + cont + "</div>",
                                style: "position: absolute; width:auto; z-index:100"
                            });
                            dialog.startup();
                            dojo.style(dialog.domNode, "opacity", 0.85);
                            dijit.popup.open({ popup: dialog, x: evt.pageX, y: evt.pageY });
                            dialog.focus();
                            dojo.connect(dialog, "onBlur", function () {
                                dijit.popup.close();
                            });
                        });
                    }
                    else {
                        alert("There are no flags for your department");
                    }
                }
            });
        }
    //} else {
    //    for (var x in map.graphicsLayerIds) {
    //        if (map.graphicsLayerIds[x].indexOf('propertyFlags_') != -1) {
    //            map.getLayer(map.graphicsLayerIds[x]).setVisibility(check);
    //        }
    //    }
    //}
}