var nodes = [];
//function addComps(json, sender) {
//    //document.getElementById("wait").style.display = "block";
//    //document.getElementById("resultsPanel").style.display = "block";

//    var type = (json.attributes["Parcel ID #"] ? "sale" : "reg");
//    var geometry = esri.geometry.Polygon(json.geometry);

//    if (type == "sale") {
//        if (document.getElementById("arResults").rows.length > 0) {
//            if (checkIds(json.attributes["Parcel ID #"], "arResults")) {
//                //if (sender != "saleSearch") {
//                    alert("That property is listed already");
//                //}
//                //document.getElementById("wait").style.display = "none";
//            } else {
//                gsvc.labelPoints([geometry], function (labelPoint) {
//                    arCreateRow(labelPoint[0], json, "sale");
//                }, function (e) {
//                    alert(e.message);
//                });
//            }
//        } 
//        else {
//            gsvc.labelPoints([geometry], function (labelPoint) {
//                arCreateRow(labelPoint[0], json, "sale");
//            }, function (e) {
//                alert(e.message);
//            });
//        }
//    } 
//    else {
//        if (document.getElementById("arResults").rows.length > 0) {
//            if (checkIds(json.attributes.PARCEL_ID, "arResults")) {
//                alert("That property is listed already");
//                //dijit.byId("indicator").set('label', "");
//            } else {
//                gsvc.labelPoints([geometry], function (labelPoint) {
//                    arCreateRow(labelPoint[0], json, "reg");
//                }, function (e) {
//                    alert(e.message);
//                });
//            }
//        } else {
//            gsvc.labelPoints([geometry], function (labelPoint) {
//                arCreateRow(labelPoint[0], json, "reg");
//            }, function (e) {
//                alert(e.message);
//            });
//        }
//    }
//}
function addComps(json, sender) {
    var geometry = esri.geometry.Polygon(json.geometry);
    if (checkIds(json.attributes.PARCEL_ID, "arResults")) {
        alert("That property is listed already");
    } else {
        gsvc.labelPoints([geometry], function (labelPoint) {
            arCreateRow(labelPoint[0], json, sender);
        }, function (e) {
            alert(e.message);
        });
    }
    
}
function arCreateRow(centroid, feature, type) {
    var table = document.getElementById("arResults");
    var rowCount = table.rows.length;
    var show, cellInnerHtml, rowClass, PID;
    var row = table.insertRow(0);
    if (type == "reg") {
        show = "<b><u>" + feature.attributes.ADDRESS + "</u></b><br/>" + feature.attributes.DSBL;
        row.id = "r" + feature.attributes.PARCEL_ID;
        cellInnerHtml = "<div class='upper'>" + feature.attributes.ADDRESS + 
                        ", " + feature.attributes.HAMLET + "</div><div class='lower'>" + 
                        feature.attributes.DSBL +
                        "</div><input id='h" + feature.attributes.PARCEL_ID  + "' type='hidden' value='" + dojo.toJson(feature) + "'/>";
        rowClass = "searchResults2";
        PID = feature.attributes.PARCEL_ID;
    } else {
        row.id = "r" + feature.attributes.PARCEL_ID;
        show = "<b><u>" + feature.attributes.ADDRESS + "</u></b><br/>" + getDate(new Date(feature.attributes.saledate));
        cellInnerHtml = "<div class='upper'>" + feature.attributes.ADDRESS + ", " + feature.attributes.HAMLET + "</div><div class='lower'>" + getDate(new Date(feature.attributes.saledate)) + " - " + toCurrency(feature.attributes.SALE_PRICE) + "</div><input id='h" + feature.attributes.PARCEL_ID + "' type='hidden' value='" + dojo.toJson(feature) + "'/>";
        rowClass = "searchResults1";
        PID = feature.attributes.PARCEL_ID;
    }
    row.onmouseout = function () {
        closeDialog();
    };
    row.onmouseover = function () {
        closeDialog();
        if (map.extent.contains(centroid)) {
            var dialog = new dijit.TooltipDialog({
                id: "tooltipDialog",
                content: show,
                style: "position: absolute; width: auto; z-index:100"
            });
            dialog.startup();
            var evt = map.toScreen(centroid);
            dojo.style(dialog.domNode, "opacity", 0.85);
            dijit.placeOnScreen(dialog.domNode, { x: evt.x + dojo.byId("leftPane").offsetWidth + 30, y: evt.y }, ["TL", "BL"], { x: 10, y: 10 });
        }
    };

    var cell1 = row.insertCell(0);
    var element1 = document.createElement("input");
    element1.type = "checkbox";
    cell1.appendChild(element1);
    cell1.className = "leftTD";
    
    var sub = row.insertCell(1);
    var subImg = document.createElement("img");
    subImg.src = "Images/Star-grey-icon.png";
    sub.appendChild(subImg);
    sub.className = "middleTd";
    sub.onclick = function () {
        var parentID = this.parentNode.id;
        for (var i = 0; i < table.rows.length; i++) {
            if (table.rows[i].id == parentID && table.rows[i].title != "Subject") {
                table.rows[i].title = "Subject";
                table.rows[i].childNodes[1].childNodes[0].src = "Images/Star-icon-gold.png";
            } else {
                table.rows[i].title = "Comp";
                table.rows[i].childNodes[1].childNodes[0].src = "Images/Star-grey-icon.png";
            }
//            this.parentNode.title = (this.parentNode.title != "Subject" ? "Subject" : "Comp");
//            this.childNodes[0].src = (this.parentNode.title != "Subject" ? "Images/Star-grey-icon.png" : "Images/Star-icon-gold.png");
        }
    };

    var cell2 = row.insertCell(2);
    cell2.innerHTML = cellInnerHtml;
    cell2.id = PID;
    cell2.className = "rightTD";
    row.className = rowClass;
    cell2.onclick = function () {
        //        for (var z = 0, ll = table.rows.length; z < ll; z++) {
        //            if (table.rows[z].id == "r" + feature.attributes.PARCEL_ID) {
        //                table.rows[z].childNodes[0].className = "leftTDA"
        //                table.rows[z].childNodes[1].className = "middleTDA";
        //                table.rows[z].childNodes[2].className = "rightTDA";
        //                //var as = document.getElementById("r" + evt.graphic.attributes.PARCEL_ID);
        //                table.parentNode.scrollTop = document.getElementById("r" + feature.attributes.PARCEL_ID).offsetTop;
        //            } else {
        //                table.rows[z].childNodes[0].className = "leftTD"
        //                table.rows[z].childNodes[1].className = "middleTd";
        //                table.rows[z].childNodes[2].className = "rightTD";
        //            }
        //        }
        //zoomParcel(feature);
        zoomGeometry(feature, map);
    };
   // document.getElementById("wait").style.display = "none";
    if (table.rows.length > 1) {
        dijit.byId("arButton").set("disabled", false);
    }
}
function deleteArTableRow() {
    var table = document.getElementById("arResults");
    var rowCount = table.rows.length;
    var answer;
    if (rowCount > 0) {
        answer = confirm("Are you sure you want to Delete these comps");
    }
    if (answer && rowCount > 0) {
        for (var i = 0; i < rowCount; i++) {
            var row = table.rows[i];
            var chkbox = row.cells[0].childNodes[0];
            if (null != chkbox && true == chkbox.checked) {
                table.deleteRow(i);
                rowCount--;
                i--;
            }
        }
    }
    if (table.rows.length <= 1) {
        dijit.byId("arButton").set("disabled", true);
    }
}
function clearArTable() {
    var table = document.getElementById("arResults");
    var rowCount = table.rows.length;
    var answer;
    if (rowCount > 0) {
        answer = confirm("Are you sure you want to Delete these comps");
    }
    if (answer && rowCount > 0) {
       // document.getElementById('wait').style.display = 'none';
        for (var i = 0; i < rowCount; i++) {
            var row = table.rows[i];
            var chkbox = row.cells[0].childNodes[0];                
            table.deleteRow(i);
            rowCount--;
            i--;
        }
    }
    dijit.byId("arButton").set("disabled", true);
}
//function zoomParcel(json) {
//    var graphic = esri.Graphic();
//    var geometry = esri.geometry.Polygon(json.geometry);
//    graphic.setGeometry(geometry);
//    map.setExtent(graphic.geometry.getExtent());
//}