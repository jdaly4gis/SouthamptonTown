function aggregateParcelIds() {
    if (document.getElementById('lmUser').value != "General User") {
        var table = document.getElementById("sessionResults");
        var rowCount = table.rows.length;
        var idList = [];
        if (rowCount > 0) {
            for (var i = 0; i < table.rows.length; i++) {
                var row = table.rows[i];
                var chkbox = row.cells[0].childNodes[0];
                if (null != chkbox && true == chkbox.checked) {
                    idList.push(table.rows[i].id.substring(1));
                }
            }
            if (idList.length > 0) {
                answer = confirm("Are you sure you want to Transfer these results");
                if (answer) {
                    TransferParcels(idList.join(":"));
                }
            } else {
                alert("Please select properties to transfer");
            }
        } else {
            alert("Please select a property to transfer");
        }
    } else {
        alert('Please Log in to transfer parcels');
    }
}
function TransferParcels(p_ids) {
    var tResult = new dojox.data.QueryReadStore({ url: 'Modules/transfertoGovern/governTransfer.ashx' });
    tResult.fetch({
        serverQuery: { q: document.getElementById('lmUser').value, parcelIds: p_ids, sender: "add" },
        onError: function (e) {
            alert(e.message);
        },
        onComplete: function (items, request) {
            if (items.length > 0) {
                alert('Parcels Transferred Successfully');
            } else {
                alert('No Parcels Transferred');
            }
        }
    });
}

function loadParcels() {
    if (document.getElementById('lmUser').value != "General User" && document.getElementById('lmUser').value != "") {
        var tResult = new dojox.data.QueryReadStore({ url: 'Modules/transfertoGovern/governTransfer.ashx' });
        tResult.fetch({
            serverQuery: { q: document.getElementById('lmUser').value, parcelIds: null,  sender: "get" },
            onError: function (e) {
                alert(e.message);
            },
            onComplete: function (items, request) {
                if (items.length > 0) {
                    addSelectionToResults(items[0].i);
                } else {
                    alert('No Parcels to load from Govern associated with your User ID');
                }
            }
        });
    } else {
        alert('Please Log in to load records from Govern');
    }
}
function addSelectionToResults(ids) {
    var Task, query;
    Task = new esri.tasks.QueryTask(lmURL + "/0");

    query = new esri.tasks.Query();
    query.outSpatialReference = map.spatialReference;
    query.returnGeometry = true;
    query.outFields = ["*"];
    query.where = "PARCEL_ID in (" + ids + ")";

    Task.execute(query, function (results) {
        var symbol = useDefaultSymbol();
        //create array of attributes
        for (var i = 0; i < results.features.length; i++) {
            var graphic = results.features[i];
            if (!checkIds(results.features[i].attributes.PARCEL_ID, "sessionResults")) {
                graphic.setSymbol(symbol);
                map.getLayer("sessionGraphicsLayer").add(graphic);
            }
        }
        zoomFeatureSetExtemt(results);
    }, function (e) {
        alert('there was an error processing your request, please contact GIS');
    });
}