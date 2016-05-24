//Layers managed By this Script
//0	    Tax Parcels
//1	    Tax Parcels
//2	    Suffolk County Towns
//15	Community Boundaries
//16	Community Boundaries
//62    Recently Sold Properties
//63    Vacant 
//64    Agricultural
//65    Residential
//66    Commercial
//67    Recreation 
//68    Community Services
//69    Industrial
//70    Public Services 
//71    Wild, Forested, And Conservation Lands 
//82	Protected Lands
//83	Public Lands
//84	Not For Profits
//85	Streams
//85	Mosquito Ditches
//87	Water Bodies
//88	Protected Lands
//89	Public Lands
//90	Not For Profits
//91	Soils
//107	NY Natural Heritage Areas
//108	Natural Heritage Potential
//109	Natural Heritage Communities
//110	Natural Heritage Species
//115	Golf Courses
//115	Basemap
//117	Property Address
//KEY - Manage layers

//0	    Tax Parcels
//1	    Tax Parcels
//2	    Suffolk County Towns
//15	Community Boundaries
//16	Community Boundaries
//70	Protected Lands
//71	Public Lands
//72	Not For Profits
//73	Soils
//74	Streams
//75	Mosquito Ditches
//76	Water Bodies
//77	Protected Lands
//78	Public Lands
//79	Not For Profits
//80	Soils
//96	NY Natural Heritage Areas
//97	Natural Heritage Potential
//98	Natural Heritage Communities
//99	Natural Heritage Species
//104	Golf Courses
//105	Basemap
//106	Property Address

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
    var oo = getInternetExplorerVersion();
    
    if (getInternetExplorerVersion() <= 7 && navigator.appName == 'Microsoft Internet Explorer' || navigator.platform == "iPad") {
        dijit.byId('legDND').set('disabled',true);
        buildLegendIe7(json);
    } else {
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
//function checkVersion() {
//  var msg = "You're not using Internet Explorer.";
//  var ver = getInternetExplorerVersion();

//  if (ver > -1) {
//      if (ver >= 8.0)
//          msg = "You're using a recent copy of Internet Explorer."
//      else
//          msg = "You should upgrade your copy of Internet Explorer.";
//  }
//  alert(msg);
//}
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
    document.getElementById("layer85").style.display = "none";
    document.getElementById("layer86").style.display = "none";
    document.getElementById("layer87").style.display = "none";
    document.getElementById("layer115").style.display = "none";
    document.getElementById("layer116").style.display = "none";

    hideLegendItemsOnRasterLayer(false, 0);
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
    document.getElementById("layer85").style.display = "none";
    document.getElementById("layer86").style.display = "none";
    document.getElementById("layer87").style.display = "none";
    document.getElementById("layer115").style.display = "none";
    document.getElementById("layer116").style.display = "none";

    hideLegendItemsOnRasterLayer(false, 0);
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
    setCookie("dept", dept, 10);
    return dept;
    //showLayerByDept(dept);
}
function showLayerByDept(dept) {
    //checkCookie(dept)
    //get Department is called when the ok button is clicked on the department dialog
    dept = !dept ? getDepartment() : dept;
    var departmentLayers = {};
    departmentLayers["10"] = [0, 1, 5, 14, 15, 16, 117, 60, 25, 26, 33, 34, 35, 36, 41, 38, 37, 49, 17, 18, 19, 20, 21, 22, 23, 40, 44, 45, 46, 47, 50, 93, 94, 95, 116];
    //departmentLayers.Building = [0, 1, 5, 14, 15, 16, 106, 59, 25, 26, 33, 34, 35, 36, 41, 38, 37, 49, 17, 18, 19, 20, 21, 22, 23, 40, 44, 45, 46, 47, 50, 76, 81, 82, 83, 105];
    departmentLayers["02"] = [0, 1, 5, 14, 15, 16, 117, 60, 25, 26, 33, 34, 35, 36, 41, 38, 37, 49, 17, 18, 19, 20, 21, 22, 23, 40, 44, 45, 46, 47, 50, 93, 94, 95, 116];
    departmentLayers["01"] = [];
    departmentLayers["03"] = [];
    departmentLayers["04"] = [];
    departmentLayers["05"] = [];
    departmentLayers["06"] = [];
    departmentLayers["07"] = [];
    departmentLayers["09"] = [];
    departmentLayers["11"] = [];
    departmentLayers["12"] = [];
    departmentLayers["16"] = [];
    departmentLayers["17"] = [];
    departmentLayers["18"] = [];
    departmentLayers["20"] = [];
    departmentLayers["21"] = [];
    departmentLayers["30"] = [];
    departmentLayers["WW"] = [];
    departmentLayers.all = [];
    departmentLayers["Basic"] = [0, 1, 2, 15, 16, 17, 92, 115, 165, 117];
   
    var managedlayers = [0, 1, 2, 15, 16, 17, 85, 86, 87, 92, 116, 117];
    var layerList = (dojo.query(".dojoDndItem", "operationalLayers").length == 0) ? document.getElementById('operationalLayers').childNodes[0].childNodes : dojo.query(".dojoDndItem", "operationalLayers");
    for (var i = 0; i < layerList.length; i++) {
        var text = layerList[i].id;
        var regex = /(\d+)/g;
        if ((departmentLayers[dept].indexOf(text.match(regex) * 1) != -1 || dept == "all") && managedlayers.indexOf(text.match(regex) * 1) == -1) {
            //var ss = dojo.byId(layerList[i].id);
            document.getElementById(layerList[i].id).style.display = "block";

        } else if (managedlayers.indexOf(text.match(regex) * 1) != -1) {
            
        } else {
            document.getElementById(layerList[i].id).style.display = "none";
        }
    }
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

//    var table = document.createElement("table");
//    var tbody = document.createElement("tbody");
//    tbody.appendChild(tr);
//    table.appendChild(tbody);
//    node = table;

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
            //legendVals += "<div><img ondblclick='changeSymbol( " + id + ", this)' src='" + url + "/" + id + "/images/" + legend[k].url + "'/>" + legend[k].label + "</div>";
        } else {
            legendVals += "<div style='display: inline'><img src='" + url + "/" + id + "/images/" + legend[k].url + "'/><div style='display: inline' class='legendItemTitle' onclick='setActiveLayer(\"layer" + id + "\")'>" + legend[k].label + "</div></div>";
            //legendVals += "<div style='display: inline'><img ondblclick='changeSymbol( " + id + ", this)' src='" + url + "/" + id + "/images/" + legend[k].url + "'/><div style='display: inline' class='legendItemTitle' onclick='setActiveLayer(\"layer" + id + "\")'>" + legend[k].label + "</div></div>";
        }
    }
    if (legend.length > 1) {
        legendVals = "<div style='display: inline'><img  alt='expand' src='images/plus-icon.png' onClick='hideNode(this);'/><div style='display: inline' class='legendItemTitle' onclick='setActiveLayer(\"layer" + id + "\")'>" + name + "</div></div><div style='margin-left:25px;display:none'>" + legendVals + "</div>";
    }
    return legendVals;
}
function changeSymbol(id, img) {
    //alert(id);
    var layer = map.getLayer('lmCore');
    var ll = eval(layer.url + "/" + id + "?f=pjson");
    var handle = esri.request({
        url: layer.url + "/" + id + "?f=pjson",
        callbackParamName: 'callback',
        handleAs: 'json',
        load: dojo.hitch(this, function (json) { symbol(json, img) }),
        error: dojo.hitch(this, creatLegendInfoError)
    });

//    var dynLyrInfos = map.getLayer("lmCore").createDynamicLayerInfosFromLayerInfos();
//    map.getLayer("lmCore").setDynamicLayerInfos(dynLyrInfos, true);
}
function findPos(obj) {
    var obj2 = obj;
    var curtop = 0;
    var curleft = 0;
    if (document.getElementById || document.all) {
        do {
            curleft += obj.offsetLeft - obj.scrollLeft;
            curtop += obj.offsetTop - obj.scrollTop;
            obj = obj.offsetParent;
            obj2 = obj2.parentNode;
            while (obj2 != obj) {
                curleft -= obj2.scrollLeft;
                curtop -= obj2.scrollTop;
                obj2 = obj2.parentNode;
            }
        } while (obj.offsetParent)
    } else if (document.layers) {
        curtop += obj.y;
        curleft += obj.x;
    }
    return [curtop, curleft];
}
function symbol(json, img) {
    var myTooltipDialog = new dijit.TooltipDialog();
    
    var outColorDiv = dojo.create('div', {}, myTooltipDialog.containerNode);
    outColorDiv.innerHTML = "Outline Color:<br/>";
    var outColorPalette = new dijit.ColorPalette({
        palette: "3x4",
        onChange: function (val) { dojo.style(dojo.byId('colorSwatch'),{backgroundColor: val}); }
    });
    var outColor = new dijit.form.DropDownButton({
        dropDown: outColorPalette,
        label:  '<span id="colorSwatch" style="height: 10px; width: 10px; border: 1px solid black; background-color: black;">&nbsp;&nbsp;</span>'
    }).placeAt(outColorDiv);

    var innerColorDiv = dojo.create('div', {}, myTooltipDialog.containerNode);
    innerColorDiv.innerHTML = "Inner Color:<br/>";
    
    var innerColorPalette = new dijit.ColorPalette({
        palette: "3x4",
        onChange: function (val) { dojo.style(dojo.byId('colorSwatch2'),{backgroundColor: val}); }
    });

    var inColor = new dijit.form.DropDownButton({
        dropDown: innerColorPalette,
        label: '<span id="colorSwatch2" style="height: 10px; width: 10px; border: 1px solid black; background-color: black;">&nbsp;&nbsp;</span>'
    }).placeAt(innerColorDiv);

    var innerColorTransSpinner = new dijit.form.NumberSpinner({
        value: 1,
        smallDelta: .05,
        constraints: { min: .01, max: 1, places: 2 },
        style: "width:50px"
    }).placeAt(innerColorDiv);

    dijit.popup.open({
        popup: myTooltipDialog,
        around: img
    });

    var actionBar = dojo.create("div", {
        "class": "dijitDialogPaneActionBar"
    }, myTooltipDialog.containerNode);

    new dijit.form.Button({
        "label": "Ok",
        onClick: function (e) {
            var rect = findPos(img);
            var sfs = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID,
                    new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color(outColorPalette.value), 2), //outline
                    null); //color

            sfs.color = new dojo.Color(innerColorPalette.value);
            sfs.color.a = innerColorTransSpinner.value;

            var layerDrawingOption = new esri.layers.LayerDrawingOptions();
            layerDrawingOption.renderer = new esri.renderer.SimpleRenderer(sfs);
            layerDrawingOptions[json.id] = layerDrawingOption;
            map.getLayer('lmCore').setLayerDrawingOptions(layerDrawingOptions);
            //lyrInfos = operationalLayer.hasOwnProperty("dynamicLayerInfos") ? operationalLayer.dynamicLayerInfos : operationalLayer.layerInfos;
            var dynlayeinfo = map.getLayer('lmCore').hasOwnProperty("dynamicLayerInfos") ? map.getLayer('lmCore').dynamicLayerInfos : map.getLayer('lmCore').layerInfos;

            map.getLayer("lmCore").setDynamicLayerInfos(dynlayeinfo, false);
            myTooltipDialog.destroy();
        }
    }).placeAt(actionBar);
    new dijit.form.Button({
        "label": "Cancel",
        onClick: function (e) {
            myTooltipDialog.destroy();
            //dijit.popup.close(myTooltipDialog);
        }
    }).placeAt(actionBar);    
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
    var infos = map.getLayer('lmCore').hasOwnProperty("dynamicLayerInfos") ? map.getLayer('lmCore').dynamicLayerInfos : map.getLayer('lmCore').layerInfos;
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
                parentDiv.children[0].checked = true;
                visible.push(coreLayer.layerInfos[id].subLayerIds[z]);
            }
        }
        else if (coreLayer.layerInfos[id].parentLayerId != -1) {
            parentDiv = document.getElementById("layer" + coreLayer.layerInfos[id].parentLayerId);
            parentDiv.children[0].checked = true;
            //visible.push(coreLayer.layerInfos[id].parentLayerId);
        }
        //Manage layers
        if (id == 117) {
            dijit.byId("makeVis").set("checked", true);
        }
        if (id == 107 || id == 108 || id == 109 || id == 110) {
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
        if (id == 117) {
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
        if (map.getLayer(map.layerIds[x]).visible && map.layerIds[x] != "lmCore") {
            imageryLoaded = true;
            imageryLoadedCount++;
        }
    }
    hideLegendItemsOnRasterLayer(imageryLoaded, imageryLoadedCount);
}
function changeLayerOpacity(e, layer) {
    map.getLayer(layer).setOpacity(e / 100);
}
function hideLegendItemsOnRasterLayer(imageryLoaded, howMany) {
    //Manage layers
    var baseMapNodes = [0, 16, 88, 89, 90];
    var imageryNodes = [1, 15, 82, 83, 84];

    var hiddenLayers = [2, 85, 86, 87, 115, 116];

    var visible = map.getLayer("lmCore").visibleLayers;
    if (imageryLoaded) {
        document.getElementById("layer2").children[0].checked = false;
        document.getElementById("layer85").children[0].checked = false;
        document.getElementById("layer86").children[0].checked = false;
        document.getElementById("layer87").children[0].checked = false;
        document.getElementById("layer115").children[0].checked = false;
        document.getElementById("layer116").children[0].checked = false;

        document.getElementById("layer1").style.display = "";
        if (howMany < 2) {
            document.getElementById("layer1").children[0].checked = document.getElementById("layer0").children[0].checked;
        }
        if (document.getElementById("layer1").children[0].checked && visible.indexOf(1) == -1) {
            visible.push(1);
        }
        
        document.getElementById("layer15").style.display = "";
        if (howMany < 2) {
            document.getElementById("layer15").children[0].checked = document.getElementById("layer16").children[0].checked;
        }
        if (document.getElementById("layer15").children[0].checked && visible.indexOf(15) == -1) {
            visible.push(15);
        }       
        
        document.getElementById("layer82").style.display = "";
        if (howMany < 2) {
            document.getElementById("layer82").children[0].checked = document.getElementById("layer88").children[0].checked;
        }
        if (document.getElementById("layer82").children[0].checked && visible.indexOf(82) == -1) {
            visible.push(82);
        }
        
        document.getElementById("layer83").style.display = "";
        if (howMany < 2) {
            document.getElementById("layer83").children[0].checked = document.getElementById("layer89").children[0].checked;
        }
        if (document.getElementById("layer83").children[0].checked && visible.indexOf(83) == -1) {
            visible.push(83);
        }

        document.getElementById("layer84").style.display = "";
        if (howMany < 2) {
            document.getElementById("layer84").children[0].checked = document.getElementById("layer90").children[0].checked;
        }
        if (document.getElementById("layer84").children[0].checked && visible.indexOf(84) == -1) {
            visible.push(84);
        }
        
//        document.getElementById("layer73").style.display = "";
//        if (howMany < 2) {
//            document.getElementById("layer73").children[0].checked = document.getElementById("layer80").children[0].checked;
//        }
//        if (document.getElementById("layer73").children[0].checked && visible.indexOf(73) == -1) {
//            visible.push(73);
//        }
        document.getElementById("layer0").style.display = "none";
        document.getElementById("layer0").children[0].checked = false;
        document.getElementById("layer16").style.display = "none";
        document.getElementById("layer16").children[0].checked = false;
        document.getElementById("layer88").style.display = "none";
        document.getElementById("layer88").children[0].checked = false;
        document.getElementById("layer89").style.display = "none";
        document.getElementById("layer89").children[0].checked = false;
        document.getElementById("layer90").style.display = "none";
        document.getElementById("layer90").children[0].checked = false;
//        document.getElementById("layer80").style.display = "none";
//        document.getElementById("layer80").children[0].checked = false;
        
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
        document.getElementById("layer2").children[0].checked = true;
        document.getElementById("layer85").children[0].checked = true;
        document.getElementById("layer86").children[0].checked = true;
        document.getElementById("layer87").children[0].checked = true;
        document.getElementById("layer115").children[0].checked = true;
        document.getElementById("layer116").children[0].checked = true;

        document.getElementById("layer0").style.display = "";
        document.getElementById("layer0").children[0].checked = document.getElementById("layer1").children[0].checked;
        if (document.getElementById("layer0").children[0].checked && visible.indexOf(0) == -1) {
            visible.push(0);
        }
        document.getElementById("layer16").style.display = "";
        document.getElementById("layer16").children[0].checked = document.getElementById("layer15").children[0].checked;
        if (document.getElementById("layer16").children[0].checked && visible.indexOf(16) == -1) {
            visible.push(16);
        }

        document.getElementById("layer88").style.display = "";
        document.getElementById("layer88").children[0].checked = document.getElementById("layer82").children[0].checked;
        if (document.getElementById("layer88").children[0].checked && visible.indexOf(88) == -1) {
            visible.push(88);
        }
        document.getElementById("layer89").style.display = "";
        document.getElementById("layer89").children[0].checked = document.getElementById("layer83").children[0].checked;
        if (document.getElementById("layer89").children[0].checked && visible.indexOf(89) == -1) {
            visible.push(89);
        }
        document.getElementById("layer90").style.display = "";
        document.getElementById("layer90").children[0].checked = document.getElementById("layer84").children[0].checked;
        if (document.getElementById("layer90").children[0].checked && visible.indexOf(90) == -1) {
            visible.push(90);
        }
//        document.getElementById("layer80").style.display = "";
//        document.getElementById("layer80").children[0].checked = document.getElementById("layer73").children[0].checked;
//        if (document.getElementById("layer80").children[0].checked && visible.indexOf(80) == -1) {
//            visible.push(80);
//        }

        document.getElementById("layer1").style.display = "none";
        document.getElementById("layer1").children[0].checked = false;
        document.getElementById("layer15").style.display = "none";
        document.getElementById("layer15").children[0].checked = false;
        document.getElementById("layer82").style.display = "none";
        document.getElementById("layer82").children[0].checked = false;
        document.getElementById("layer83").style.display = "none";
        document.getElementById("layer83").children[0].checked = false;
        document.getElementById("layer84").style.display = "none";
        document.getElementById("layer84").children[0].checked = false;
//        document.getElementById("layer73").style.display = "none";
//        document.getElementById("layer73").children[0].checked = false;

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
        var y = map.getLayer("lmCore").layerInfos[visible[q]].subLayerIds;
        if (map.getLayer("lmCore").layerInfos[visible[q]].subLayerIds) {
            visible.splice(visible.indexOf(visible[q]), 1);
        }
    }
    map.getLayer("lmCore").setVisibleLayers(visible);
}