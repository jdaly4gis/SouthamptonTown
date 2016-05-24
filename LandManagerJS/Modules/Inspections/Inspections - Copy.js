function doInspections() {
    var store = new dojox.data.QueryReadStore({ url: 'modules/Inspections/Inspections.ashx' });
    var dept = checkedRadioBtn('dept');
    if (map.getLayer('inspections')) {
        map.getLayer('inspections').clear();
        clearTableRow('inspectTable');
    }
    var dateStart = dojo.date.locale.format(new Date(), { selector: 'date', formatLength: 'short' });
    var dateEnd = dojo.date.locale.format(new Date(), { selector: 'date', formatLength: 'short' });
    if (dijit.byId('inspectionChangeDates').checked) {
        dateStart = dijit.byId('inspectionStartDate').get('displayedValue');
        dateEnd = dijit.byId('inspectionEndDate').get('displayedValue');
    }
    store.fetch({
        serverQuery: { sender: "inspection", inspector: dijit.byId('selectInspector').get('value'), dept: dept, startDate: dateStart, endDate: dateEnd },
        onComplete: function (items, request) {
            if (items.length > 0) {
                var ids = [];
                var remap = {};
                for (var z in items) {
                    ids.push(items[z].i.P_ID);
                    if (!remap[items[z].i.P_ID]) {
                        remap[items[z].i.P_ID] = [];
                    }
                    remap[items[z].i.P_ID].push(items[z].i);
                    //updateInspectionsGrid(items[z].i);
                }
                var Query = new esri.tasks.Query();
                Query.returnGeometry = true;
                Query.outFields = ["*"];
                Query.orderByFields = ["HAMLET", "DSBL"];
                Query.where = "PARCEL_ID in (" + ids.join(',') + ") and not(DSBL like '3%')";
                taxParcelQueryTask.execute(Query, function (results) {
                    var addedIDs = [];
                    for (var q in results.features) {
                        addedIDs.push(results.features[q].attributes.PARCEL_ID);
                        updateInspectionsGrid(results.features[q], remap[results.features[q].attributes.PARCEL_ID]);
                        insertsInspectionGraphic(results.features[q]);
                    }
                    
                    if (addedIDs.length < items.length) {
                        for (var o = 0; o < items.length; o++) {
                            var id = items[o].i.P_ID * 1;
                            if (addedIDs.indexOf(id) == -1) {
                                updateInspectionsGrid("", [items[o].i]);
                            }
                        }
                    }
                }, function (e) {
                    alert(e);
                });
            } else {
                alert("There are no inspections scheduled for this inspector \n\rfor the selected time period");
            }
        }, onError: function (e) {
            alert(e);
        }
    });
}
function getInspectionsByPID(pid) {
    var store = new dojox.data.QueryReadStore({ url: 'modules/Inspections/Inspections.ashx' });

    store.fetch({
        serverQuery: { sender: "inspectionByPID", id: pid },
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
                    title: "Inspections For Parcel ID: " + pid,
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
                    var insp = '';
                    for (var i = 0; i < (fields.length) ; i++) {
                        if (fields[i] != "inspectionTypes" && fields[i] != "SHORT_DESC" && fields[i] != "P_ID") {
                            val = val + "<tr><td class='infoDLG' style='vertical-align:text-bottom'><bol>" + fields[i] + ":</bol></td>" + "<td class='infoDLG' style='vertical-align:text-bottom;'>" + request.store.getValues(items[q], fields[i]) + "</td></tr>";
                        } else if (fields[i] == "inspectionTypes") {
                            var inTypes = eval("( " + request.store.getValues(items[q], fields[i]) + ")");
                            if (inTypes.items.length > 0) {
                                for (var o = 0; o < inTypes.items.length; o++) {
                                    var inType = inTypes.items[o]["IN_TYPE"] == "" ? "": inTypes.items[o]["IN_TYPE"];
                                    var itStatus = inTypes.items[o]["itStatus"] == "" ? "" : " (" + inTypes.items[o]["itStatus"] + ")";
                                    var itNotes = inTypes.items[o]["itNotes"] == "" ? "" : " - " + inTypes.items[o]["itNotes"];
                                    insp += "<div style='margin-left:15px;'>" + inType + itStatus + itNotes + "</div>";
                                }
                            }
                        }
                    }
                    tab = new dijit.layout.ContentPane({
                        title: items[q].i["SHORT_DESC"] + "<br/>" + items[q].i["Inspection Date"],
                        content: "<table cellspacing='0' style='width:100%'>" + val + "<tr><td colspan='2'><bol>INSPECTIONS:</bol><br/>" + insp + "</td></tr></table>",
                        selected: true
                    });
                    main.addChild(tab);
                }
            } else {
                alert("There are no Inspections for this property");
            }
        }
    });
}
function doInspectors() {
    var dept = checkedRadioBtn('dept');
        map.getLayer('inspections') ? map.getLayer('inspections').clear() : "";
        clearTableRow('inspectTable');
        var store = new dojox.data.QueryReadStore({ url: 'modules/Inspections/Inspections.ashx' });
        
        store.fetch({
            serverQuery: { sender: "inspector", dept: dept },
            onError: function (items) {
                alert(items);
            },
            onComplete: function (items, request) {
                if (items.length > 0) {
                    var data = [];
                    for (var z = 0; z < items.length; z++) {
                        data.push({ id: items[z].i["NA_ID"], field: items[z].i["Name"] });
                    }
                    var d = dijit.byId('selectInspector');
                    dijit.byId('selectInspector').set('store', new dojo.store.Memory({ id: "id", data: data }));
                } else {
                    document.getElementById('inspectDialog').style.display = "none";
                    alert("There are no inspections for your department");
                }
            }
        });
    
}
function updateInspectionsGrid(result, inspections) {
    var table = document.getElementById("inspectTable");
    var rowCount = table.rows.length;
    var row = table.insertRow(rowCount);
    row.onmouseout = function () {
        closeDialog();
    };
    row.id = inspections[0].P_ID;
    row.className = "inspections";
    
    var cell1 = row.insertCell(0);
    if (result.geometry) {
        cell1.innerHTML = "<img class='picImg' src='images/zoomin.png' alt=''/>";
    } else {
        cell1.innerHTML = "<img class='picImg' src='images/block-24.png' alt=''/>";
    }

    var cell2 = row.insertCell(1);
    var titleHTML = "<div class='upper' style='display:inline; font-weight:bold; text-transform: uppercase;'>" + inspections[0].FORMATED_ADDRESS + ", " + inspections[0].CITY + "</div>";
    var contentHTML = "";
    for (var i = 0; i < inspections.length; i++) {
        var inType = inspections[i].PM_TYPE != "" ? inspections[i].PM_TYPE : "No Type Assigned"
        var c = inspections[i].STATUS == "s" || inspections[i].STATUS == "c" ? inspections[i].STATUS : "other";
        var canEmail = (inspections[i].emailCount * 1) > 0 ? true : false;
        contentHTML += "<div class='insp_" + c + "'>&nbsp;&nbsp;-&nbsp;&nbsp;" + inType + "&nbsp;(" + inspections[i].INSPECTION_DATE + ")&nbsp;&nbsp;-&nbsp;<img style='vertical-align:middle;' class='picImg' height='16px' width='16px' src='images/edit.png' alt='' onclick=\"updateInspection('" + inspections[i].IN_ID + "', '" + inType + "', '" + inspections[0].FORMATED_ADDRESS + "', this, " + canEmail + ")\"/></div>";
    }
    cell2.innerHTML = titleHTML + "<br/>" + contentHTML;
    if (result.geometry) {
        cell1.onclick = function () {
            map.setExtent(result.geometry.getExtent(), true);
            for (var z = 0, ll = table.rows.length; z < ll; z++) {
                if (table.rows[z].id == cell1.parentNode.id) {
                    table.rows[z].childNodes[0].className = "A"
                } else {
                    table.rows[z].childNodes[0].className = ""
                }
            }
        };
        var centroid = getCentroid(result.geometry.getExtent());
        row.onmouseover = function () {
            closeDialog();
            if (map.extent.contains(centroid)) {
                var dialog = new dijit.TooltipDialog({
                    id: "tooltipDialog",
                    content: "<b><u>" + result.attributes.ADDRESS + "</u></b>",
                    style: "position: absolute; width: auto; z-index:100"
                });
                dialog.startup();
                var evt = map.toScreen(centroid);
                dojo.style(dialog.domNode, "opacity", 0.85);
                dijit.placeOnScreen(dialog.domNode, { x: evt.x + dojo.byId("leftPane").offsetWidth + 30, y: evt.y }, ["TL", "BL"], { x: 10, y: 10 });
            }
        };
    }
}
function updateInspectionType(sender, typeId, status, notes, inType, inTypeCD, notEditable) {
    var dlg = new dijit.Dialog({
        "title": typeId + " - " + inType,
        "style": "width: 300px;"
    });

    dojo.create("h3", {
        innerHTML: "Status"
    }, dlg.containerNode);
    var status = new dijit.form.Select({
        name: "Domain",
        style: "width:150px; margin:5px;",
        value: status,
        options: [
            { label: "Failed", value: "failed" },
            { label: "Failed - No Access", value: "NOACCESS" },
            { label: "Passed", value: "passed" },
            { label: "Incomplete", value: "Incomplete", selected: true }
        ],
        onChange: function (e) {
            var userName = document.getElementById('lmUserName').innerHTML;
            svBtn.set('disabled', notEditable);
            //svBtn.set('disabled', false);
        }
    }).placeAt(dlg.containerNode);

    dojo.create("hr", {
        style: "width:95%;"
    }, dlg.containerNode);

    dojo.create("h3", {
        innerHTML: "Notes"
    }, dlg.containerNode);
    var notesArea = new dijit.form.SimpleTextarea({
        placeholder: "Notes...",
        rows: "4",
        style: "width:auto;margin:5px;",
        value: notes,
        onChange: function (e) {
            var userName = document.getElementById('lmUserName').innerHTML;
            svBtn.set('disabled', notEditable);
            //svBtn.set('disabled', false);
        },
        onKeyPress: function (e) {
            if (e.keyCode == dojo.keys.ENTER) {
                dojo.stopEvent(e);
            }
        }
    }).placeAt(dlg.containerNode);

    var actionBar = dojo.create("div", {
        "class": "dijitDialogPaneActionBar"
    }, dlg.containerNode);
   
    
    var svBtn  = new dijit.form.Button({
        label: 'Save',
        disabled: true,
        onClick: function (e) {
            var xhrArgs = {
                url: 'modules/Inspections/Inspections.ashx',
                postData: { status: status.value, notes: notesArea.value, sender: "updateTypes", in_ID: typeId, typeCD: inTypeCD, 'user': document.getElementById('lmUser').value },
                preventCache: true,
                handleAs: "text",
                load: function (data) {
                    if (data == "yes") {
                        alert('Data Updated Successfully');
                        if (status.value != "passed" && status.value != "") {
                            sender.src = "images/Edited_Bad.png";
                        } else if (status.value == "passed") {
                            sender.src = "images/Edited_Good.png";
                        } else if (status.value == "") {
                            sender.src = "images/unEdited.png";
                        }
                        sender.onclick = function () { updateInspectionType(sender, typeId, status.value, notesArea.value, inType, inTypeCD, notEditable); };
                        dlg.destroy();
                    } else {
                        alert('there was an error editing the data');
                    }
                },
                error: function (error) {
                    alert('there was an error editing the data');
                }
            }
            var userName = document.getElementById('lmUserName').innerHTML;
            if (userName == "General User") {
                alert('Please log in to make edits');
            } else {
                dojo.xhrPost(xhrArgs);
            }
        }
    }).placeAt(actionBar);
    new dijit.form.Button({
        "label": "Cancel",
        onClick: function () {
            dlg.destroy();
        }
    }).placeAt(actionBar);
    dlg.show();
}
function insertsInspectionGraphic(graphic) {
    var graphicLayer;
    if (!(map.getLayer('inspections'))) {
        graphicLayer = new esri.layers.GraphicsLayer("", { id: "inspections" });
        dojo.connect(graphicLayer, "onClick", function (evt) {
            
            var table = document.getElementById("inspectTable");
            for (var z = 0, ll = table.rows.length; z < ll; z++) {
                if (table.rows[z].id == evt.graphic.attributes.PARCEL_ID) {
                    table.rows[z].childNodes[0].className = "A"
                    table.parentNode.parentNode.scrollTop = document.getElementById(evt.graphic.attributes.PARCEL_ID).offsetTop;
                } else {
                    table.rows[z].childNodes[0].className = ""
                }
            }
        });
        map.addLayer(graphicLayer);
    } else {
        graphicLayer = map.getLayer('inspections');
    }

    var symbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID,
                    new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID,
                    new dojo.Color("fuchsia"), 3),
                    new dojo.Color([98, 194, 204, 0.0]));

    var graphic = new esri.Graphic(graphic.geometry, symbol, graphic.attributes);
    graphicLayer.add(graphic);
}
function toggleInspectLayer() {
    var vis;
    if (map.getLayer('inspections')) {
        if (document.getElementById('inspectDialog').style.display == "" || document.getElementById('inspectDialog').style.display == "block") {
            vis = true;
        }
        else {
            vis = false;
        }
        map.getLayer('inspections').setVisibility(vis);
    }
}
//This function updates the Inspections and displays the individual inspection types for a permit
function updateInspection(id, type, address, ele, canEmail) {
    var xhrArgs = {
        url: 'modules/Inspections/Inspections.ashx',
        postData: { sender: "inspectType", in_ID: id },
        preventCache: true,
        handleAs: "json",
        error: function(items){
            alert(items);
        },
        load: function (items) {
            if (items.items.length > 0) {
                var userName = document.getElementById('lmUserName').innerHTML;
                //dont want users to be able to edit past inspections.   Sets the "disabled" variable.
                var notEditable =  (userName.toUpperCase() != dijit.byId('selectInspector').get('displayedValue').toUpperCase() || items.items[0].STATUS != "s" ? true : false)
                var dlg = new dijit.Dialog({
                    "title": address,
                    "style": "width: 80%;"
                });
                var keyCounter = items.items[0].KEY_COUNTER;
                var pm_ID = items.items[0].PM_ID;
                var inspectTypes = [];
                //title block of the dialog

                dojo.create("h2", {
                    innerHTML: type + " (" + id + ")",
                    style: "text-decoration:underline;"
                }, dlg.containerNode);

                //sub Title block of the dialog
                var dialogTitle = dojo.create("div", {
                    "class": "dialogTitle"
                }, dlg.containerNode);
                dojo.create("h3", {
                    innerHTML: "Inspection Status (" + items.items[0].INSPECTION_DATE + ")"
                }, dialogTitle);

                
                var status = new dijit.form.Select({
                    style: "width:150px; margin:5px;",
                    onChange: function (val) {
                        var c = val == "s" || val == "c" ? val : "other";
                        dialogBody.className = 'insp_' + c; 
                        svBtn.set('disabled', notEditable);
                    },
                    value: items.items[0].STATUS,
                    options: [
                        { label: "Completed", value: "c" },
                        { label: "Scheduled", value: "s", selected: true },
                        { label: "Unscheduled", value: "u" },
                        { label: "Void", value: "v" }
                    ]
                }).placeAt(dialogTitle);

                //body of the dialog
                var c = status.value == "s" || status.value == "c" ? status.value : "other";
                var dialogBody = dojo.create("div", {
                    "class": "insp_" + c,
                    style: "margin:25px;padding:5px;border-bottom:none;"
                }, dlg.containerNode);

                dojo.create("h3", {
                    innerHTML: "Inspection Types" 
                }, dialogBody);
                
                var inspections = [];
                new dijit.form.Button({
                    label: "<img src='images/add-icon.png'/>",
                    disabled: notEditable,
                    onClick: function (e) {
                        addInspectionType(id, type, address, ele, inspections, dlg, canEmail);
                    }
                }).placeAt(dialogBody);
                var final = false;
                for (var z = 0; z < items.items.length; z++) {
                    var img;
                    inspections.push(items.items[z].IN_TYPE_CD);
                    switch (items.items[z].itStatus) {
                        case "passed":
                            img = "images/Edited_Good.png";
                            break;
                        case "":
                            img = "images/unEdited.png"
                            break;
                        default:
                            img = "images/Edited_Bad.png";
                            break;
                    }
                    if (!final && items.items[z].IN_TYPE == "Final Inspection") {
                        final = true;
                    }
                    if (items.items[z].IN_TYPE == "") {
                        inspectTypes.push("")
                    } else {
                        inspectTypes.push("<span class='inspectionTypes'>" + items.items[z].IN_TYPE + "<img style='vertical-align:middle;' class='picImg' src='" + img + "' alt='' onclick=\"updateInspectionType(this, '" + items.items[z].IN_ID + "', \'" + items.items[z].itStatus + "\', \'" + myTrim(items.items[z].itNotes) + "\', \'" + items.items[z].IN_TYPE + "\', \'" + items.items[z].IN_TYPE_CD + "\', " + notEditable + ");\"/></span>");
                    }
                }
                var inTypes = new dijit.layout.ContentPane({
                    content: inspectTypes.join(''),
                    style: "margin-left:15px; max-height:450px; min-width:250px; overflow:auto;margin-top:20px; margin-bottom:20px; ",
                    className: "dijitDialogPaneContentArea"
                }).placeAt(dialogBody);

                var dialogFooter = dojo.create("div", {
                    "class": "dialogFooter"
                }, dlg.containerNode);

                dojo.create("h3", {
                    innerHTML: "Notes"
                }, dialogFooter);

                var notes = new dijit.form.SimpleTextarea({
                    placeholder: "Notes...",
                    rows: "4",
                    style: "width:80%;",
                    value: items.items[0].NOTES,
                    onChange: function (e) {
                        svBtn.set('disabled', notEditable);
                        var oo = dijit.byId('selectInspector').get('displayedValue');
                        //svBtn.set('disabled', false);
                    },
                    onKeyPress: function (e) {
                        if (e.keyCode == dojo.keys.ENTER) {
                            dojo.stopEvent(e);
                        }
                    }
                }).placeAt(dialogFooter);

                //Save and Cancel Buttons
                var actionBar = dojo.create("div", {
                    "class": "dijitDialogPaneActionBar"
                }, dlg.containerNode);
                //var savers = ["David Cange", "Thomas Weber", "Michael Risolo", "Sean McDermott", "Michael Benincasa", "Harold Fisher", "Dennis O'Rourke", "Theresa Trejo", "Mark Viseckas"];
                
                var svBtn = new dijit.form.Button({
                    label: 'Save',
                    disabled: true,
                    onClick: function (e) {
                        var comments
                        if (canEmail) {
                            comments = prompt('This person can be Emailed\nDo you wish to add any comments?', "");
                        } else {
                            alert('There is no Email on File\nPlease leave a Paper Notice');
                        }
                        var pp = dojo.query(".picImg", inTypes.domNode);
                        var passed;
                        var statusMessage = [];
                        for (var z = 0; z < pp.length; z++) {
                            if (pp[z].src.indexOf('Edited_Good') >= 0) {
                                statusMessage.push(pp[z].parentNode.innerText + " - passed");
                                passed = true;
                            } else {
                                statusMessage.push(pp[z].parentNode.innerText + " - Not Approved");
                            }
                        }
                        var actStatus = "";
                        if (final && status.value == "c" && passed) {
                            actStatus = "1";
                        } else {
                            actStatus = "2";
                        }
                        var xhrArgs = {
                            url: 'modules/Inspections/Inspections.ashx',
                            postData: {
                                status: status.value, notes: notes.value, sender: "updateInspections", in_ID: id, 'user': document.getElementById('lmUser').value,
                                //updateActivtyStatus
                                actStatus: actStatus, pm_ID: pm_ID, keyID: keyCounter,
                                //send an email
                                canEmail: canEmail, formalName: document.getElementById('lmUserName').innerHTML, comments: comments, statusMessage: statusMessage.join('\n'), inspectorEmail: document.getElementById('lmUserEmail').value,
                                permitType: type, permitAddress: address
                            },
                            handleAs: "text",
                            preventCache: true,
                            load: function (data) {
                                if (data != "no") {
                                    switch (data) {
                                        case "yes":
                                            alert("Data Uploaded Successfully");
                                            break;
                                        case "yes mail":
                                            alert("Data Uploaded Successfully\nAnd your message has been sent");
                                            break;
                                        case "no mail":
                                            alert("Data Uploaded Successfully\nThere was an error Sending your email");
                                            break;
                                    }
                                    var c = status.value == "s" || status.value == "c" ? status.value : "other";
                                    ele.parentNode.className = "insp_" + c;
                                    dlg.destroy();
                                    createEmailDialog();
                                } else {
                                    alert('there was an error editing the data');
                                }
                            },
                            error: function (error) {
                                alert('there was an error editing the data');
                            }
                        }
                        if (userName == "General User") {
                            alert('Please log in to make edits');
                        } else {
                            dojo.xhrPost(xhrArgs);
                        }
                    }
                }).placeAt(actionBar);
                new dijit.form.Button({
                    "label": "Cancel",
                    onClick: function () {
                        dlg.destroy();
                    }
                }).placeAt(actionBar);
                dlg.show();
            } else {
                alert("There are no inspection types assigned to this Inspection");
            }
        }
    }
    dojo.xhrPost(xhrArgs);
}
function addInspectionType(id, type, address, ele, types, ogDialog, canEmail) {
    var dlg = new dijit.Dialog({
        "title": "Add Inspection Types",
        "style": "width: 300px;"
    });
    dojo.create("h3", {
        innerHTML: "TYPES"
    }, dlg.containerNode);
    var inspType = new dojox.form.CheckedMultiSelect({
        style: "width:150px;padding:5px;",
        multiple: true,
        options: [
            { label: 'Block or Steel Work', value: 'bloc' },
            { label: 'Cast Iron', value: 'cast' },
            { label: 'Complaint', value: 'comp' },
            { label: 'Curb Cut', value: 'curb' },
            { label: 'Final Inspection', value: 'final' },
            { label: 'Footings', value: 'foot' },
            { label: 'Foundation', value: 'found' },
            { label: 'Framing', value: 'frame' },
            { label: 'Insulation', value: 'insul' },
            { label: 'Miscellaneous', value: 'Misc.' },
            { label: 'Check for No Start', value: 'nost' },
            { label: 'Plumbing', value: 'plumb' },
            { label: 'Pre-Existing', value: 'pre-' },
            { label: 'Re-inspection', value: 'rein' },
            { label: 'Up-dated', value: 'up-d' },
            { label: 'Water Test', value: 'wate' },
            { label: 'Section-8', value: 'Sec-8' },
            { label: 'Strapping', value: 'strap' },
            { label: 'Damage Assessment', value: 'dmgassmt' },
            { label: 'Expired', value: 'expr' }
        ]
    }).placeAt(dlg.containerNode);

    for (var t = 0; t < inspType.options.length; t++) {
        var val = inspType.options[t].value; 
        if (types.indexOf(inspType.options[t].value) > -1) {
            inspType.options[t].disabled = true;
        }
    }
    var actionBar = dojo.create("div", {
        "class": "dijitDialogPaneActionBar"
    }, dlg.containerNode);
   //dont need editable because the button that launches this panel controls the editablility of this
    var userName = document.getElementById('lmUserName').innerHTML;
    var svBtn = new dijit.form.Button({
        label: 'Add',
        //disabled: false,
        disabled: (userName.toUpperCase() != dijit.byId('selectInspector').get('displayedValue').toUpperCase() ? true : false),
        onClick: function (e) {
            var xhrArgs = {
                url: 'modules/Inspections/Inspections.ashx',
                postData: { in_ID: id, sender: 'addNewInspectionType', 'user': document.getElementById('lmUser').value, typeCD: inspType.value },
                preventCache: true,
                handleAs: "text",
                load: function (data) {
                    dlg.destroy();
                    if (data == "yes") {
                        ogDialog.destroy();
                        updateInspection(id, type, address, ele, canEmail);
                        alert("Data Uploaded Successfully");
                    } else {
                        alert('there was an error editing the data');
                    }
                },
                error: function (error) {
                    alert('there was an error editing the data');
                }
            }
            if (userName == "General User") {
                alert('Please log in to make edits');
            } else {
                dojo.xhrPost(xhrArgs);
            }
        }
    }).placeAt(actionBar);
    new dijit.form.Button({
        "label": "Cancel",
        onClick: function () {
            dlg.destroy();
            ogDialog.show();
        }
    }).placeAt(actionBar);
    dlg.show();
   
}

function createEmailDialog() {
    
}
