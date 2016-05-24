function getAccelaInspections(id) {
    var store = new dojox.data.QueryReadStore({ url: 'modules/accela/accela.ashx' });

    store.fetch({
        serverQuery: { id: id },
        onError: function (items) {
            alert(items);
        },
        onComplete: function (items, request) {
            if (items.length > 0) {
                var HTMLSTRING = "";
                var records = {};
                var inspCount = 0;
                var commCount = 0;
                for (var z = 0; z < items.length; z++) {
                    var recID = items[z].i.ID_REC;
                    var commID = items[z].i.ID_COMM;
                    var inspID = items[z].i.ID_INSP;
                    
                    if (!records[recID]) {
                        records[recID] = {
                            'PARCEL_NBR': items[z].i["PARCEL_NBR"], 'RECORD_ID': items[z].i["RECORD_ID"],
                            'COMPLAINT_TYPE': items[z].i["COMPLAINT_TYPE"], 'DATE_OPENED': items[z].i["DATE_OPENED"],
                            'RECORD_TYPE': items[z].i["RECORD_TYPE"], "CREATED_BY": items[z].i["CREATED_BY"], 'DESCRIPTION': items[z].i["DESCRIPTION"],
                            'RECORD_STATUS': items[z].i["RECORD_STATUS"], COMMENTS: {}, INSPECTIONS: {}, subRecs: 'none'
                        };
                        if (commID != null) {
                            records[recID].COMMENTS[commID] = {
                                'COMMENT_DATE': items[z].i["COMMENT_DATE"], 'ADDED_BY': items[z].i["ADDED_BY"],
                                'COMMENTS': items[z].i["COMMENTS"]
                            };
                            records[recID].subRecs = "block";
                        }
                        if (inspID != null) {
                            records[recID].INSPECTIONS[inspID] = {
                                'DATE_INSPECTION': items[z].i["DATE_INSPECTION"], 'INSP_RESULT': items[z].i["RESULT"],
                                'COMMENTS_RESULT': items[z].i["COMMENTS_RESULT"]
                            };
                            records[recID].subRecs = "block";
                        }
                    } else {
                        if (!records[recID].INSPECTIONS[inspID] && inspID != null) {
                            records[recID].INSPECTIONS[inspID] = {
                                'DATE_INSPECTION': items[z].i["DATE_INSPECTION"], 'INSP_RESULT': items[z].i["RESULT"],
                                'COMMENTS_RESULT': items[z].i["COMMENTS_RESULT"]
                            };
                            records[recID].subRecs = "block";
                        }
                        if (!records[recID].COMMENTS[commID] && commID != null) {
                            records[recID].COMMENTS[commID] = {
                                'COMMENT_DATE': items[z].i["COMMENT_DATE"], 'ADDED_BY': items[z].i["ADDED_BY"],
                                'COMMENTS': items[z].i["COMMENTS"]
                            };
                            records[recID].subRecs = "block";
                        }
                    }
                }
                for (rec in records) {
                    var recordHeading = records[rec]["COMPLAINT_TYPE"] != null ? records[rec]["COMPLAINT_TYPE"] : records[rec]["RECORD_TYPE"];
                    HTMLSTRING += "<div class='" + records[rec]["RECORD_TYPE"] + "'><table><tr><td><img style='vertical-align:middle; margin:10px;display:" + records[rec]["subRecs"] +
                        "' src='images/expand_icon.gif' id='" + records[rec]["RECORD_ID"] + "Img'" +
                            "onclick='collapse(\"" + records[rec]["RECORD_ID"] + "\");'</td><td><span style='font-weight:bold; font-size: medium; text-decoration:underline'>" + recordHeading + "</span><br/><i>ID#: " +
                            records[rec]["RECORD_ID"] + "</i><br />" + records[rec]["DATE_OPENED"] + " (" + records[rec]["CREATED_BY"] + ")<br/>Status: <b>" + records[rec]["RECORD_STATUS"] + "</b><br/>Description: " + records[rec]["DESCRIPTION"] + "</td></tr></table><hr/>";
                    HTMLSTRING += "<div id='" + records[rec]["RECORD_ID"] + "' style='display:none;'>";
                    for (comm in records[rec].COMMENTS) {
                        HTMLSTRING += "<div class='accelaComments' >Date: " + records[rec].COMMENTS[comm]['COMMENT_DATE'] + "<br />staff: " + records[rec].COMMENTS[comm]["ADDED_BY"] + " <br />Comments: " + records[rec].COMMENTS[comm]["COMMENTS"] + " </div>";
                    }                   
                    for (insp in records[rec].INSPECTIONS) {
                        HTMLSTRING += "<div class='accelaInspectionInfo'>Status: <span class='accelaRecordInfoStatus' >" + records[rec].INSPECTIONS[insp]["INSP_RESULT"] + "</span><br/>Date: " + records[rec].INSPECTIONS[insp]['DATE_INSPECTION'] + "<br />" +
                                "Inspection Comments: <br/> " + records[rec].INSPECTIONS[insp]["COMMENTS_RESULT"] + " </div>";
                    }
                    HTMLSTRING += "</div></div>";
                }
                var dialog = new dojox.widget.Dialog({
                    content: '<div class="accela">' + HTMLSTRING + "</div>",
                    dimensions: [370, 390],
                    title: "Code Enforcement Information for Parcel ID: " + id,
                    showTitle: true,
                    onHide: function (dia) {
                        this.destroy();
                    }
                });
                dialog.startup();
                dialog.show();
                //alert(records);
            } else {
                alert("There are no Code Enforcement inspections for this property");
            }
        }
    });
}