function getSaleInfo(id) {

    //dijit.byId("buildingInfo").show();
    //var main = dijit.byId("buildingInfoContents");
    var buildingStore = new dojox.data.QueryReadStore({ url: 'getJSON.ashx' });
    buildingStore.fetch({ serverQuery: { type: id, sender: "sales" },
        onError: function (items) {
            alert(items);
        },
        onComplete: function (items, request) {
            //dialog.set('title', "Building Info For Parcel ID: " + id);
            if (items.length > 0) {
                var main = new dijit.layout.TabContainer({ style: "height: 350px; width: 350px; padding-left:10px" });

                var dialog = new dojox.widget.Dialog({
                    content: main,
                    dimensions: [370, 390],
                    title: "Sales Info For Parcel ID: " + id,
                    showTitle: true
                });
                main.startup();
                dialog.startup();
                dialog.show();
                var tc = new dijit.layout.TabContainer({ style: "height: 100%; width: 100%;" });
                for (var q = 0; q < items.length; q++) {
                    var fields = request.store.getAttributes(items[q]);
                    var tabName;
                    var val = "";
                    var tab = 0;
                    for (var i = 0; i < (fields.length); i++) {
                        val = val + "<tr><td class='infoDLG' style='vertical-align:text-bottom'><font size='3'><bol>" + fields[i] + ":</bol> </td>" + "<td class='infoDLG' style='vertical-align:text-bottom;'><font size='3'>" + request.store.getValues(items[q], fields[i]) + "</td></tr>";
                    }
                    saleTab = new dijit.layout.ContentPane({
                        title: items[q].i["Sale Date"],
                        content: "<table cellspacing='0' style='width:100%'>" + val + "</table>",
                        selected: true
                    });
                    main.addChild(saleTab);
                }
            } else {
//                    saleTab = new dijit.layout.ContentPane({
//                        title: "No Sales",
//                        content: "There is no historic sales information for this property",
//                        selected: true
//                    });
//                    main.addChild(saleTab);
                alert("There are no historic sales for this property");
            }
        }
    });
}