function getPictures(id) {
    var buildingStore = new dojox.data.QueryReadStore({ url: 'getJSON.ashx' });
    buildingStore.fetch({ serverQuery: { type: id, sender: "pic" },
        onComplete: function (items, request) {
            if (items.length > 0) {
                var main = new dijit.layout.TabContainer({ style: "height: 350px; width: 350px; padding-left:10px" });
                var dialog = new dojox.widget.Dialog({
                    content: main,
                    dimensions: [370, 390],
                    title: "Pictures For Parcel ID: " + id,
                    showTitle: true
                });
                main.startup();
                dialog.startup();

                var val = "";
                dialog.set('title', "Pictures For Parcel ID: " + id);
                var tc = new dijit.layout.TabContainer({ style: "height: 100%; width: 100%;" });
                for (var q = 0; q < items.length; q++) {
                    var fields = request.store.getAttributes(items[q]);
                    val = val + "<tr style='vertical-align:middle;'><td class='infoDLG'>" + request.store.getValues(items[q], "ENTRY_DATE") + "<br/> " + request.store.getValues(items[q], "Type") + "</td><td class='infoDLG'>" + request.store.getValues(items[q], "Image") + "</td></tr>";
                }
                saleTab = new dijit.layout.ContentPane({
                    title: "Pictures",
                    content: "<table cellspacing='0' style='width:100%'>" + val + "</table>",
                    selected: true
                });
                main.addChild(saleTab);
                dialog.show();
            } else {
                //                val = "<tr style='vertical-align:middle;'><td class='infoDLG'>No Pictures on File<td/><tr/>";
                alert("No pictures on file");
            }

        }
    });
}