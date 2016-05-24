function propertyFlags(id, evt) {
    var FlagsStore = new dojox.data.QueryReadStore({ url: 'getJSON.ashx' });
    FlagsStore.fetch({ serverQuery: { type: id, sender: "flag" },
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