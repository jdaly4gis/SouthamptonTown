function createLegend(map) {
    var legendHTML = "";
    for (k = 0; k < map.layerIds.length; k++) {
        var currentLayer = map.getLayer([map.layerIds[k]]);
        var url = '';
        if (currentLayer.id == "lmCore") {
            var handle = esri.request({
                url: currentLayer.url + '/legend',
                content: {
                    f: "json"
                },
                callbackParamName: 'callback',
                handleAs: 'json',
                load: dojo.hitch(this, ieToggler),
                error: dojo.hitch(this, creatLegendInfoError)
            });
        } else {
            
        }
    }
    dojo.connect(map, "onExtentChange", legendScale);
}
function ieToggler(json) {
    if ((getInternetExplorerVersion() <= 7 && getInternetExplorerVersion() > 0) || isMobile()) {
        dijit.byId('legDND').set('disabled', true);
        buildLegendIe7(json);
    } else {
        dijit.byId('legDND').set('disabled', false);  
        buildLegend(json);
    }
}
function getInternetExplorerVersion() {
    // Returns the version of Internet Explorer or a -1
    // (indicating the use of another browser).
    var rv = -1; // Return value assumes failure.
    if (navigator.appName == 'Microsoft Internet Explorer') {
        var ua = navigator.userAgent;
        var re = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
        if (re.exec(ua) != null)
            rv = parseFloat(RegExp.$1);
    }
    return rv;
}

function buildLegendIe7(json) {
    //document.getElementById("operationalLayers").innerHTML = "";
    var legendHTML = "";
    var url = lmURL;
    var scale = map.getScale();
    var operationalLayer = map.getLayer("lmCore");
    for (k = 0; k < json.layers.length; k++) {
        operationalLayer.layerInfos[json.layers[k].layerId].legend = json.layers[k].legend;
    }
    for (j = 0; j < operationalLayer.layerInfos.length; j++) {
        var entry;
//        if (j == 6) {
//            alert('ll');
//        }
        var checked = (operationalLayer.layerInfos[j].defaultVisibility == true ? "checked" : "");
        var scaleClass = (operationalLayer.layerInfos[j].minScale >= scale || operationalLayer.layerInfos[j].minScale == 0 ? "" : "layerOutOfScale");
        if (operationalLayer.layerInfos[j].parentLayerId == -1 && !operationalLayer.layerInfos[j].subLayerIds) {
            var entry = legendEntry(operationalLayer.layerInfos[j].legend, operationalLayer.layerInfos[j].name, operationalLayer.layerInfos[j].id);
            legendHTML += "<div class='Layerdiv " + scaleClass + "' id='layer" + operationalLayer.layerInfos[j].id + "' style='margin-left:25px;' ><input onclick='changeLayerVisibility(" + operationalLayer.layerInfos[j].id + ", this)' type='checkbox' " + checked + "/>" + entry + "</div>";
        } else if (operationalLayer.layerInfos[j].subLayerIds) {
            var entry = subLayersLegend(operationalLayer.layerInfos, j);
            
            legendHTML += "<div class='Layerdiv' style='margin-left:25px;'><div id='layer" + operationalLayer.layerInfos[j].id + "' style='display:inline;'><input onclick='changeLayerVisibility(" + operationalLayer.layerInfos[j].id + ", this)' type='checkbox' " + checked + "/></div><div style='display:inline;'><img alt='collapse' src='images/minus-icon.png' onClick='hideNode(this);'/></div><div style='display:inline;'>" + operationalLayer.layerInfos[j].name + "</div>" + entry + "</div>";
            j += operationalLayer.layerInfos[j].subLayerIds.length;
        }
    }
    document.getElementById("operationalLayers").innerHTML = "<div id='layerVisDiv'>" + legendHTML + "<div>";
    //Manage layers
    document.getElementById("layer2").style.display = "none";
    document.getElementById("layer96").style.display = "none";
    document.getElementById("layer97").style.display = "none";
    document.getElementById("layer98").style.display = "none";
    document.getElementById("layer126").style.display = "none";
    document.getElementById("layer127").style.display = "none";

    var cookie = checkCookie('');
    if (!cookie) {
        dijit.byId("deptDialog").show();
    } else {
        var exp = getCookie("expire");
        var dd = dateDiffInDays(new Date(), new Date(getCookie("expire")));
        if (dd < 2) {
            alert('You have not cleared the internet cache in ' + (10 - dd) + ' days.\n\rPlease do so now before begining work');
        }
        checkCurrentBtn('dept', cookie);
        showLayerByDept(cookie);
    }
    hideLegendItemsOnRasterLayer(false, 0);
}
function buildLegend(json) {
    document.getElementById("operationalLayers").innerHTML = "";
    var legendHTML = [];
    var url = lmURL;
    var scale = map.getScale();
    var operationalLayer = map.getLayer("lmCore");
    lyrInfos = operationalLayer.hasOwnProperty("dynamicLayerInfos") ? operationalLayer.dynamicLayerInfos : operationalLayer.layerInfos;
    for (k = 0; k < json.layers.length; k++) {
        lyrInfos[json.layers[k].layerId].legend = json.layers[k].legend;
    }
    for (j = 0; j < operationalLayer.layerInfos.length; j++) {
        var entry;
//        if (j == 6) {
//            alert('iis');
//        }
        var checked = (operationalLayer.layerInfos[j].defaultVisibility == true ? "checked" : "");
        var scaleClass = (operationalLayer.layerInfos[j].minScale >= scale || operationalLayer.layerInfos[j].minScale == 0 ? "" : "layerOutOfScale");
        if (operationalLayer.layerInfos[j].parentLayerId == -1 && !operationalLayer.layerInfos[j].subLayerIds) {
            entry = legendEntry(operationalLayer.layerInfos[j].legend, operationalLayer.layerInfos[j].name, operationalLayer.layerInfos[j].id);
            legendHTML.push({ name: operationalLayer.layerInfos[j].name, id: ("legendLayer" + operationalLayer.layerInfos[j].id), html: "<div class='Layerdiv " + scaleClass + "' id='layer" + operationalLayer.layerInfos[j].id + "' style='margin-left:25px;' ><input onclick='changeLayerVisibility(" + operationalLayer.layerInfos[j].id + ", this)' type='checkbox' " + checked + "/>" + entry + "</div>" });
        } else if (operationalLayer.layerInfos[j].subLayerIds) {
            entry = subLayersLegend(operationalLayer.layerInfos, j);
            legendHTML.push({ name: operationalLayer.layerInfos[j].name, id: ("legendLayer" + operationalLayer.layerInfos[j].id), html: "<div class='Layerdiv' style='margin-left:25px;'><div id='layer" + operationalLayer.layerInfos[j].id + "' style='display:inline;'><input onclick='changeLayerVisibility(" + operationalLayer.layerInfos[j].id + ", this)' type='checkbox' " + checked + "/></div><div style='display:inline;'><img alt='collapse' src='images/minus-icon.png' onClick='hideNode(this);'/></div><div style='display:inline;'>" + operationalLayer.layerInfos[j].name + "</div>" + entry + "</div>" });
            j += operationalLayer.layerInfos[j].subLayerIds.length;
        }
    }
    //dojo.empty(dojo.byId("operationalLayers"));
    var catalog = buildCatalog("operationalLayers", legendHTML);
    catalog.node.style.display = "block";
    dojo.connect(catalog, "onDndDrop", reorderLayers);
    //var o = catalog.getAllNodes();
    dojo.connect(dijit.byId('activeIdentify'), 'onClick', function (e) {
        //catalog.isSource = (this.checked == true ? false : true);
    });
    dojo.connect(dijit.byId('legDND'), 'onClick', function (e) {
        catalog.isSource = (this.checked == true ? true : false);
    });
    catalog.isSource = false;
    //Manage layers
    document.getElementById("layer2").style.display = "none";
    document.getElementById("layer96").style.display = "none";
    document.getElementById("layer97").style.display = "none";
    document.getElementById("layer98").style.display = "none";
    document.getElementById("layer126").style.display = "none";
    document.getElementById("layer127").style.display = "none";

    hideLegendItemsOnRasterLayer(false, 0);
    var cookie = checkCookie('');
    if (!cookie) {
        dijit.byId("deptDialog").show();
    } else {
        //var exp = getCookie("expire");
        var dd = dateDiffInDays(new Date(), new Date(getCookie("expire")));
        var today = new Date();
        var expire = new Date(getCookie("expire"));
        var diffDays = parseInt((expire - today) / (1000 * 60 * 60 * 24)); 

        if (diffDays < 2) {
            alert('You have not cleared the internet cache in ' + (10 - dd) + ' days.\n\rPlease do so now before begining work');
        }
        checkCurrentBtn('dept', cookie);
        showLayerByDept(cookie);
    }
}
function checkCurrentBtn(name, cookie) {
    var group = document.getElementsByName(name);

    for (var i = 0; i < group.length; i++) {
        if (group.item(i).value == cookie) {
            group.item(i).checked = true;
        } else {
            group.item(i).checked = false;
        }
    }
}
function checkedRadioBtn(name) {
    var group = document.getElementsByName(name);

    for (var i = 0; i < group.length; i++) {
        if (group.item(i).checked) {
            return group.item(i).value;
            break;
        } else {
            //return 'default';
        }
    }
}
function getDepartment() {
    var dept = checkedRadioBtn('dept');
    dept = !dept ? "Basic" : dept;
    setCookie("dept", dept, 5);
    return dept;
    //showLayerByDept(dept);
}
function showLayerByDept(dept) {
    //checkCookie(dept)
    //get Department is called when the ok button is clicked on the department dialog
    dept = !dept ? getDepartment() : dept;
    if (dept != "10") {
        enableSalesModule(true, dept);
    } else {
        enableSalesModule(false, dept);
    }
        //manage layers
    var departmentLayers = {};
    departmentLayers["02"] = [0, 1, 3, 6, 13, 14, 15, 16, 17, 18, 19, 27, 36, 40, 50, 54, 55, 56, 57, 58, 59, 60, 64, 65, 66, 73, 76,
        93, 94, 95, 99, 100, 101, 102, 103, 106, 128];
    departmentLayers["04"] = [0, 1, 3, 6, 13, 14, 15, 16, 17, 18, 19, 27, 36, 40, 50, 54, 55, 56, 57, 58, 59, 60, 64, 65, 66, 73, 76,
        93, 94, 95, 99, 100, 101, 102, 103, 106, 128];

    departmentLayers["10"] = [0, 1, 3, 6, 13, 14, 15, 16, 17, 18, 19, 26, 27, 36, 40, 50, 54, 55, 56, 58, 59, 60, 64, 72, 73, 74, 76, 77,
        93, 94, 95, 99, 100, 101, 102, 103, 106, 112, 113, 114, 125, 128];
    
    departmentLayers["16"] = [];
	departmentLayers["09"] = [];

    departmentLayers["05"] = [0, 1, 3, 5, 6, 7, 13, 14, 16, 17, 18, 19, 27, 36, 40, 41, 50, 54, 55, 56, 57, 58, 59, 60, 64, 65, 66, 73, 74, 75,
        76, 93, 94, 95, 99, 100, 101, 102, 103, 112, 113, 114, 115, 116, 117, 118, 122, 123, 124, 128];
    departmentLayers["21"] = [];
    
    departmentLayers["06"] = [0, 1, 3, 5, 6, 7, 13, 14, 16, 17, 18, 19, 27, 36, 40, 41, 50, 54, 55, 56, 57, 58, 59, 60, 64, 65, 66, 67, 69, 70, 71,
        72, 73, 74, 75, 76, 93, 94, 95, 99, 100, 101, 102, 103, 112, 113, 114, 115, 116, 117, 118, 122, 123, 124, 128];

    departmentLayers.all = [];
    departmentLayers["Basic"] = [0, 1, 2, 13, 14, 15, 16, 17, 18, 19, 126, 127, 128];

    var managedlayers = [0, 1, 2, 16, 17, 93, 94, 95, 96, 97, 98, 99, 100, 101, 127, 128];
    var visLayers = [];



    var layerList = (dojo.query(".dojoDndItem", "operationalLayers").length == 0) ? document.getElementById('operationalLayers').childNodes[0].childNodes : dojo.query(".dojoDndItem", "operationalLayers");
    for (var i = 0; i < layerList.length; i++) {
//        if (i == 66) {
//            alert('iis');
//        }
        var elementID = layerList[i].id != "" || layerList[i].childNodes.length == 0 ? layerList[i].id : layerList[i].childNodes[0].id;
        //var pp = layerList[12].childNodes;
        if (elementID != "") {
            var element = document.getElementById(elementID);

            var layerIndex = layerList[i].id.match(/(\d+)/g) * 1;
            if ((departmentLayers[dept].indexOf(layerIndex) != -1 || dept == "all" || dept == "16" || dept == "21"|| dept == "09") && managedlayers.indexOf(layerIndex) == -1) {
                element.style.display = "block";
            } else if (managedlayers.indexOf(layerIndex) != -1) {

            } else {
                element.style.display = "none";
            }
        }
    }
    if (dept == "02") {
        document.getElementById('type').value = "4";
        for (var i = 0; i < document.forms.parcelSearch.searchType.length; i++) {
            if (document.forms.parcelSearch.searchType[i].value != "4") {
                document.forms.parcelSearch.searchType[i].checked = false;
            } else {
                document.forms.parcelSearch.searchType[i].checked = true;
            }
        }
    }
    var layer = map.getLayer('propertyFlags');
    if (layer) {
        map.removeLayer(layer);
        showFlagsOnMap(dijit.byId("governFlags").checked);
    }
}
function enableSalesModule(enable, dept) {
    dijit.byId('compsDashboardBTN').set('disabled', enable);
    dijit.byId('filterSalesOptions').set('disabled', enable);
dijit.byId('diqLayers').set('disabled', enable);
    if (dept != "10") {
        document.getElementById('compsDashboard').style.display = (enable ? 'none' : '');
    }
//    document.getElementById("arResults").style.display = (enable ? "" : "none");
//    dijit.byId("searchCompsBTN").set('disabled', !enable);
//    dijit.byId("cleanArTableBTN").set('disabled', !enable);
//    dijit.byId("arButton").set('disabled', !enable);
//    if (map.getLayer('arResults')) {
//        map.getLayer('arResults').setVisibility(enable);
//    }
}
function buildCatalog(node, data) {
    var dndObj = new dojo.dnd.Source(node, {
        singular: true,
        creator: catalogNodeCreator 
    });
    dndObj.insertNodes(false, data);
    return dndObj;
}

function reorderLayers(source, nodes, copy, target) {
    //dojo.style(dojo.byId("loading"), "display", "inline-block");
    source.selectNone();
    var lyrs = dojo.query("#operationalLayers input");
    //var lyrs = source.getAllNodes();
    var layerOrder = [];

    for (var r = 0; r < lyrs.length; r++) {
        layerOrder.push(lyrs[r].parentNode.id.substring(5) * 1 + ";" + lyrs[r].checked);
    }
    //if (!app.hasOwnProperty("dynLyrInfos")) {
    var dynLyrInfos = map.getLayer("lmCore").createDynamicLayerInfosFromLayerInfos();
    //}
    var newOrder = [];
    for (var t = 0; t < layerOrder.length; t++) {
        var orderId = layerOrder[t].split(';')[0];
        var vis = eval(layerOrder[t].split(';')[1]);
        dynLyrInfos[orderId].defaultVisibility = vis;
        newOrder.push(dynLyrInfos[orderId]);
        if (dynLyrInfos[orderId].subLayerIds) {
            for (var v = 0; v < dynLyrInfos[orderId].subLayerIds.length; v++) {
                dynLyrInfos[dynLyrInfos[orderId].subLayerIds[v]].defaultVisibility = eval(layerOrder[t + v + 1].split(';')[1])
                newOrder.push(dynLyrInfos[dynLyrInfos[orderId].subLayerIds[v]]);
            }
            t += dynLyrInfos[orderId].subLayerIds.length; 
        }
    }
    var layer = map.getLayer("lmCore");
    map.getLayer("lmCore").setDynamicLayerInfos(newOrder, false);
}

function catalogNodeCreator(item, hint) {
    // create a table/tr/td-based node structure; each item here needs an
    // image, a name, a brief description, and a quantity available
    var tr = document.createElement("tr");
    tr.id = item.id;
    //tr.style = "";
    tr.style.padding = "0px";
    tr.style["border-spacing"] = "0px";
    var Td = document.createElement("td");
    Td.innerHTML = item.html;
    tr.appendChild(Td);
    var qtyTd = document.createElement("td");
    if (hint == "avatar") {
        // put the avatar into a self-contained table
        var table = document.createElement("table");
        var tbody = document.createElement("tbody");
        Td.innerHTML = item.name;
        tbody.appendChild(tr);
        table.appendChild(tbody);
        node = table;
    } 
    return { node: tr, data: item };
};
function setActiveLayer(id) {
    var ele = document.getElementById(id);
    if (dijit.byId("activeIdentify").checked == true) {
        if (ele.className.indexOf("activeLayer") != -1) {
            ele.className = ele.className.replace(new RegExp('\\bactiveLayer\\b'), '');
        } else {
            ele.className += " activeLayer";
        }
    }
}
function legendEntry(legend, name, id) {
    var legendVals = "";
    var url = lmURL;
    for (k = 0; k < legend.length; k++) {
        if (legend[k].label == "") {
            legend[k].label = name;
        }
        if (legend.length > 1) {
            legendVals += "<div><img src='" + url + "/" + id + "/images/" + legend[k].url + "'/>" + legend[k].label + "</div>";
        } else {
            legendVals += "<div style='display: inline'><img src='" + url + "/" + id + "/images/" + legend[k].url + "'/><div style='display: inline' class='legendItemTitle' onclick='setActiveLayer(\"layer" + id + "\")'>" + legend[k].label + "</div></div>";
        }
    }
    if (legend.length > 1) {
        legendVals = "<div style='display: inline'><img alt='expand' src='images/plus-icon.png' onClick='hideNode(this);'/><div style='display: inline' class='legendItemTitle' onclick='setActiveLayer(\"layer" + id + "\")'>" + name + "</div></div><div style='margin-left:25px;display:none'>" + legendVals + "</div>";
    }
    return legendVals;
}
function subLayersLegend(layerInfos, id) {
    var subLayerItems = "";
    var tscale = map.getScale();
    for (q = 0; q < layerInfos[id].subLayerIds.length; q++) {
        sublayerid = layerInfos[id].subLayerIds[q];
        var checked = (layerInfos[sublayerid].defaultVisibility == true ? "checked" : "");
        var scaleClass = "";
        if ((layerInfos[sublayerid].minScale <= tscale && layerInfos[sublayerid].minScale != 0) || (layerInfos[layerInfos[sublayerid].parentLayerId].minScale <= tscale && layerInfos[layerInfos[sublayerid].parentLayerId].minScale != 0)) {
            scaleClass = "layerOutOfScale";
        }
        //var scaleClass = ((layerInfos[sublayerid].minScale <= tscale && layerInfos[sublayerid].minScale != 0) || (layerInfos[layerInfos[sublayerid].parentLayerId].minScale <= tscale && layerInfos[layerInfos[sublayerid].parentLayerId].minScale != 0)) ? "layerOutOfScale" : "");
        subLayerItems += "<div class='Layerdiv " + scaleClass + "' id='layer" + layerInfos[sublayerid].id + "' ><input " + checked + " onclick='changeLayerVisibility(" + layerInfos[sublayerid].id + ", this)' type='checkbox'/>" + legendEntry(layerInfos[sublayerid].legend, layerInfos[sublayerid].name, layerInfos[sublayerid].id) + "</div>";
    }
    return "<div style='margin-left:25px;'>" + subLayerItems + "</div>";
}
function creatLegendInfoError(json) {
    document.getElementById("operationalLayers").innerHTML = "There was an error Loading the Legend";
    //alert("there was an error loading the legend");
}
function hideNode(ele) {
    ele.src = (ele.alt != "collapse" ? "images/minus-icon.png" : "images/plus-icon.png");
    ele.parentNode.parentNode.childNodes[ele.parentNode.parentNode.childNodes.length - 1].style.display = (ele.alt != "expand" ? ("none" || '') : "block");
    ele.alt = (ele.alt != "collapse" ? "collapse" : "expand");
}
function hideAllNodes(hide) {
    var list = dojo.query("#operationalLayers .Layerdiv");
    for (var u = 0; u < list.length; u++) {
        if (list[u].childNodes.length > 2) {
            list[u].childNodes[list[u].childNodes.length - 1].style.display = (hide == false ? "block" : "none");
            list[u].childNodes[1].childNodes[0].alt = (hide == false ? "collapse" : "expand");
            list[u].childNodes[1].childNodes[0].src = (hide == false ? "images/minus-icon.png" : "images/plus-icon.png")
        }
    }
}
function changeLayerVisibility(id, ele) {
    var parentDiv;
    var list = dojo.query("#operationalLayers input");
    var visible = [];
    var coreLayer = map.getLayer("lmCore");
    for (z = 0; z < list.length; z++) {
        var current = list[z].parentNode.id.substring(5) * 1;
        if (list[z].checked && !coreLayer.layerInfos[current].subLayerIds) {
            visible.push(current);
        }
    }
    if (ele.checked) {
        if (coreLayer.layerInfos[id].subLayerIds) {
            for (z = 0; z < coreLayer.layerInfos[id].subLayerIds.length; z++) {
                parentDiv = document.getElementById("layer" + coreLayer.layerInfos[id].subLayerIds[z]);
                if (parentDiv.style.display != "none") {
                    parentDiv.children[0].checked = true;
                    visible.push(coreLayer.layerInfos[id].subLayerIds[z]);
                }
            }
        }
        else if (coreLayer.layerInfos[id].parentLayerId != -1) {
            parentDiv = document.getElementById("layer" + coreLayer.layerInfos[id].parentLayerId);
            parentDiv.children[0].checked = true;
            //visible.push(coreLayer.layerInfos[id].parentLayerId);
        }
        //Manage layers
        if (id == 128) {
            dijit.byId("makeVis").set("checked", true);
        }
        if (id == 118 || id == 119 || id == 120 || id == 121) {
            alert("Information relating to the identity and location \n\rof rare plants and animals is sensitive and should \n\rnot be made available for public use.");
        }
    } else {
        if (coreLayer.layerInfos[id].subLayerIds) {
            for (z = 0; z < coreLayer.layerInfos[id].subLayerIds.length; z++) {
                parentDiv = document.getElementById("layer" + coreLayer.layerInfos[id].subLayerIds[z]);
                parentDiv.children[0].checked = false;
                var remove = visible.indexOf(coreLayer.layerInfos[id].subLayerIds[z]);
                if (remove > -1) {
                    visible.splice(visible.indexOf(coreLayer.layerInfos[id].subLayerIds[z]), 1);
                }
            }
        }
        //Manage layers
        if (id == 128) {
            dijit.byId("makeVis").set("checked", false);
        }
    }
    map.getLayer("lmCore").setVisibleLayers(visible)
}
function revertLegend() {
    var visible = [];
    var coreLayer = map.getLayer("lmCore");
    for (z = 0; z < coreLayer.layerInfos.length; z++) {
        if (coreLayer.layerInfos[z].defaultVisibility) {
            visible.push(coreLayer.layerInfos[z].id);
        }
    }
    map.getLayer("lmCore").setVisibleLayers(visible);
    dijit.byId('makeVis').set('checked', false);
}
function legendScale(e) {
    var list = dojo.query("#operationalLayers input");
    var visible = [];
    var scale = map.getScale();
    var coreLayer = map.getLayer("lmCore");
    for (z = 0; z < list.length; z++) {
        var current = list[z].parentNode.id.substring(5) * 1;
        var scaleClass = "";
        if (coreLayer.layerInfos[coreLayer.layerInfos[current].parentLayerId]) {
            if ((coreLayer.layerInfos[current].minScale <= scale && coreLayer.layerInfos[current].minScale != 0)
                ||(coreLayer.layerInfos[coreLayer.layerInfos[current].parentLayerId].minScale <= scale && coreLayer.layerInfos[coreLayer.layerInfos[current].parentLayerId].minScale != 0)) {
                list[z].parentNode.className = list[z].parentNode.className.replace(new RegExp('\\blayerOutOfScale\\b'), '');
                list[z].parentNode.className += " layerOutOfScale";
            } else {
                list[z].parentNode.className = list[z].parentNode.className.replace(new RegExp('\\blayerOutOfScale\\b'), '');
            }
        } else {
            if ((coreLayer.layerInfos[current].minScale <= scale && coreLayer.layerInfos[current].minScale != 0)) {
                //||(coreLayer.layerInfos[coreLayer.layerInfos[current].parentLayerId].minScale <= scale && coreLayer.layerInfos[coreLayer.layerInfos[current].parentLayerId].minScale != 0)) {
                list[z].parentNode.className = list[z].parentNode.className.replace(new RegExp('\\blayerOutOfScale\\b'), '');
                list[z].parentNode.className += " layerOutOfScale";
            } else {
                list[z].parentNode.className = list[z].parentNode.className.replace(new RegExp('\\blayerOutOfScale\\b'), '');
            }
        }
    }
}
function toggleAerialLayers(layer, ele, connector) {
    dijit.byId(connector).set("checked", ele.checked);
    toggleMapLayer(layer, ele);
}
var imageryLoadedCount = 0;
function toggleMapLayer(layer, ele) {
    if (ele.checked) {
        map.getLayer(layer).setVisibility(true);
    } else {
        map.getLayer(layer).setVisibility(false);
    }
    var imageryLoaded = false;
    
    for (x = 0; x < map.layerIds.length; x++) {
        if (map.getLayer(map.layerIds[x]).visible && map.layerIds[x] != "lmCore" && map.layerIds[x] != "MA_LAND_VW" && map.layerIds[x] != "MA_SITE_VW" && map.layerIds[x] != "BLDG_DIQ" && map.layerIds[x] != "diqLayers") {
            imageryLoaded = true;
            imageryLoadedCount++;
        }
    }
    if (layer != "lmCore") {
        hideLegendItemsOnRasterLayer(imageryLoaded, imageryLoadedCount);
    }
}
function changeLayerOpacity(e, layer) {
    map.getLayer(layer).setOpacity(e / 100);
}
function hideLegendItemsOnRasterLayer(imageryLoaded, howMany) {
    //Manage layers
    var baseMapNodes = [0, 17, 78, 99, 100, 101];
    var imageryNodes = [1, 16, 77, 93, 94, 95];

    var hiddenLayers = [2, 96, 97, 98, 126, 127];
    var lmLayer = map.getLayer("lmCore");
    var visible = lmLayer.visibleLayers;
    if (imageryLoaded) {
        //document.getElementById("layer2").children[0].checked = false;
        document.getElementById("layer96").children[0].checked = false;
        document.getElementById("layer97").children[0].checked = false;
        document.getElementById("layer98").children[0].checked = false;
        document.getElementById("layer126").children[0].checked = false;
        document.getElementById("layer127").children[0].checked = false;

        document.getElementById("layer1").style.display = "";
        if (howMany < 2) {
            document.getElementById("layer1").children[0].checked = document.getElementById("layer0").children[0].checked;
        }
        if (document.getElementById("layer1").children[0].checked && visible.indexOf(1) == -1) {
            visible.push(1);
        }
        
        document.getElementById("layer16").style.display = "";
        if (howMany < 2) {
            document.getElementById("layer16").children[0].checked = document.getElementById("layer17").children[0].checked;
        }
        if (document.getElementById("layer16").children[0].checked && visible.indexOf(16) == -1) {
            visible.push(16);
        }
        document.getElementById("layer81").style.display = "";
        if (howMany < 2) {
            document.getElementById("layer81").children[0].checked = document.getElementById("layer82").children[0].checked;
        }
        if (document.getElementById("layer81").children[0].checked && visible.indexOf(81) == -1) {
            visible.push(81);
        }    
        document.getElementById("layer93").style.display = "";
        if (howMany < 2) {
            document.getElementById("layer93").children[0].checked = document.getElementById("layer99").children[0].checked;
        }
        if (document.getElementById("layer93").children[0].checked && visible.indexOf(93) == -1) {
            visible.push(93);
        }
        
        document.getElementById("layer94").style.display = "";
        if (howMany < 2) {
            document.getElementById("layer94").children[0].checked = document.getElementById("layer100").children[0].checked;
        }
        if (document.getElementById("layer94").children[0].checked && visible.indexOf(94) == -1) {
            visible.push(94);
        }

        document.getElementById("layer95").style.display = "";
        if (howMany < 2) {
            document.getElementById("layer95").children[0].checked = document.getElementById("layer101").children[0].checked;
        }
        if (document.getElementById("layer95").children[0].checked && visible.indexOf(95) == -1) {
            visible.push(95);
        }

        document.getElementById("layer0").style.display = "none";
        document.getElementById("layer0").children[0].checked = false;
        document.getElementById("layer17").style.display = "none";
        document.getElementById("layer17").children[0].checked = false; 
        document.getElementById("layer82").style.display = "none";
        document.getElementById("layer82").children[0].checked = false;
        document.getElementById("layer99").style.display = "none";
        document.getElementById("layer99").children[0].checked = false;
        document.getElementById("layer100").style.display = "none";
        document.getElementById("layer100").children[0].checked = false;
        document.getElementById("layer101").style.display = "none";
        document.getElementById("layer101").children[0].checked = false;

        for (v = 0; v < baseMapNodes.length; v++) {
            if (visible.indexOf(baseMapNodes[v]) != -1) {
                visible.splice(visible.indexOf(baseMapNodes[v]), 1);
            }
        }
        for (q = 0; q < hiddenLayers.length; q++) {
            if (visible.indexOf(hiddenLayers[q]) != -1) {
                visible.splice(visible.indexOf(hiddenLayers[q]), 1);
            }
        }
    } else {
        imageryLoadedCount = 0;
        //document.getElementById("layer2").children[0].checked = true;
        document.getElementById("layer96").children[0].checked = true;
        document.getElementById("layer97").children[0].checked = true;
        document.getElementById("layer98").children[0].checked = true;
        document.getElementById("layer126").children[0].checked = true;
        document.getElementById("layer127").children[0].checked = true;

        document.getElementById("layer0").style.display = "";
        document.getElementById("layer0").children[0].checked = document.getElementById("layer1").children[0].checked;
        if (document.getElementById("layer0").children[0].checked && visible.indexOf(0) == -1) {
            visible.push(0);
        }
        document.getElementById("layer17").style.display = "";
        document.getElementById("layer17").children[0].checked = document.getElementById("layer16").children[0].checked;
        if (document.getElementById("layer17").children[0].checked && visible.indexOf(17) == -1) {
            visible.push(17);
        }
        document.getElementById("layer82").style.display = "";
        document.getElementById("layer82").children[0].checked = document.getElementById("layer81").children[0].checked;
        if (document.getElementById("layer82").children[0].checked && visible.indexOf(82) == -1) {
            visible.push(82);
        }
        document.getElementById("layer99").style.display = "";
        document.getElementById("layer99").children[0].checked = document.getElementById("layer93").children[0].checked;
        if (document.getElementById("layer99").children[0].checked && visible.indexOf(99) == -1) {
            visible.push(99);
        }
        document.getElementById("layer100").style.display = "";
        document.getElementById("layer100").children[0].checked = document.getElementById("layer94").children[0].checked;
        if (document.getElementById("layer100").children[0].checked && visible.indexOf(100) == -1) {
            visible.push(100);
        }
        document.getElementById("layer101").style.display = "";
        document.getElementById("layer101").children[0].checked = document.getElementById("layer95").children[0].checked;
        if (document.getElementById("layer101").children[0].checked && visible.indexOf(101) == -1) {
            visible.push(101);
        }

        document.getElementById("layer1").style.display = "none";
        document.getElementById("layer1").children[0].checked = false;
        document.getElementById("layer16").style.display = "none";
        document.getElementById("layer16").children[0].checked = false;
        document.getElementById("layer81").style.display = "none";
        document.getElementById("layer81").children[0].checked = false;
        document.getElementById("layer93").style.display = "none";
        document.getElementById("layer93").children[0].checked = false;
        document.getElementById("layer94").style.display = "none";
        document.getElementById("layer94").children[0].checked = false;
        document.getElementById("layer95").style.display = "none";
        document.getElementById("layer95").children[0].checked = false;

        for (v = 0; v < imageryNodes.length; v++) {
            if (visible.indexOf(imageryNodes[v]) != -1) {
                visible.splice(visible.indexOf(imageryNodes[v]), 1);
            }
        }
        for (q = 0; q < hiddenLayers.length; q++) {
            if (visible.indexOf(hiddenLayers[q]) == -1) {
                visible.push(hiddenLayers[q]);
            }
        }
    }
    for (q = 0; q < visible.length; q++) {
        if (lmLayer.layerInfos[visible[q]].subLayerIds) {
            visible.splice(visible.indexOf(visible[q]), 1);
        }
    }
    lmLayer.setVisibleLayers(visible);
}