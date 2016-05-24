function identify(map) {
    identifyParams.tolerance = 5;
    identifyParams.returnGeometry = true;
    identifyParams.layerIds = [1];
    identifyParams.layerOption = esri.tasks.IdentifyParameters.LAYER_OPTION_TOP;
    identifyParams.width = map.width;
    identifyParams.height = map.height;
}
function executeIdentifyTask(evt) {
    identify(map);
    identifyParams.geometry = evt.mapPoint;
    identifyParams.mapExtent = map.extent;
    var deferred = identifyTask.execute(identifyParams);

    deferred.addCallback(function (response) {
        // response is an array of identify result objects     
        // Let's return an array of features. 
         
        return dojo.map(response, function (result) {

            var feature = result.feature;
            feature.attributes.layerName = result.layerName;
            var doj = dojo.toJson(feature.toJson()).replace(/'/g, "&#39;");
            var company;
            if (feature.attributes.COMPANY == "" || feature.attributes.COMPANY == "Null") {
                company = feature.attributes.FIRST_NAME + " " + feature.attributes.LAST_NAME;
            } else if (feature.attributes.LAST_NAME == "" && feature.attributes.FIRST_NAME == "") {
                company = feature.attributes.COMPANY;
            } else {
                company = feature.attributes.LAST_NAME;
            }
            var pid = feature.attributes.PARCEL_ID;
            var template;
            var dept = getDepartment();
            var lastImg = "";
            var town = feature.attributes.DSBL.charAt(0);

            if (dept == "10") {
                lastImg = "<img class='picImg' src='images/report-edit-icon.png' title='Add Comps' onclick='addComps(" + doj + ", \"reg\");'/>";
            }
            if (dept == "21" || dept == "02") {
                lastImg = "<img  class='picImg' style='width:16px;height:16px;' src='images/shield02.png' title='Get Accela Inspections' onclick='getAccelaInspections(" + feature.attributes.PARCEL_ID + ");'/>" +
                            "<img  class='picImg' style='' src='images/inspections.png' title='Inspections' onclick='getInspectionsByPID(" + feature.attributes.PARCEL_ID + ", \"" + dept +"\");'/>";
            }

            if (town == 9) {
                if (detectIE()) {
                    var header = "<b>Tax Parcels</b>&nbsp;<img class='picImg' src='images/add-icon.png' title='Add To Results' onclick='javascript:addResultsFromIdentify(" + doj + ");'/>&nbsp;" +
                        "<img class='picImg' src='images/airplane.png' title='Pictometry' onclick='javascript:pictometry(" + map.infoWindow._location.x + ", " + map.infoWindow._location.y + ");'/>&nbsp;" +
                        "<hr/>";
                    var body = company.replace(/'/g, "&#39;") + "<br/>" + feature.attributes.ADDRESS + ", " +
                               feature.attributes.HAMLET + "<br/>Acres: " + feature.attributes.ACREAGE + " - SqFT: " +
                               toNumber(feature.attributes.Shape_Area) + "<br/>Property Type: <a href='HelpDocs/propClassManual.pdf#page=" +
                               getPDFPage(feature.attributes.PROP_TYPE.slice(0, 1)) +
                               "' target='_blank'>" + feature.attributes.PROP_TYPE + "</a> <br/>TM#: " + feature.attributes.DSBL + "<br/>Parcel ID: " + feature.attributes.PARCEL_ID +
                               "<br/><br/><div class='parcelInfoLinks'>" +
                               "<img class='picImg' src='images/camera-icon.png' title='Building Pictures' onclick='javascript:getPictures(" + pid + ");'/>&nbsp;" +
                               "<img class='picImg' src='images/layers.png' title='Other Layers' onclick='javascript:viewAllLayers(" + map.infoWindow._location.x + ", " + map.infoWindow._location.y + ");'/>&nbsp;" +
                               "<img class='picImg' src='images/documents2.png' title='Permits' onclick='javascript:showPermits(" + pid + ");'/>&nbsp;" +
                               "<img class='picImg' src='images/building3.png' title='Building Info' onclick='javascript:getBuildingInfo(" + pid + ");'/>" +
                               "<img class='picImg' src='images/flag.png' title='Flags' onclick='javascript:propertyFlags(" + pid + ");'/>&nbsp;" +
                               "<img class='picImg' src='images/sales2.png' title='Sales Info' onclick='javascript:getSaleInfo(" + pid + ");'/>&nbsp;" +
                               "<img class='picImg' src='images/prc3.png' title='Record Card' onclick='openRecordCard(" + pid + ");'/>&nbsp;" + lastImg + "</div>";

                    template = new esri.InfoTemplate("Tax Parcels", header + body);
                } else {
                    var header = "<b>Tax Parcels</b>&nbsp;<img class='picImg' src='images/add-icon.png' title='Add To Results' onclick='javascript:addResultsFromIdentify(" + doj + ");'/>&nbsp;" +
                        "<hr/>";
                    var body = company.replace(/'/g, "&#39;") + "<br/>" + feature.attributes.ADDRESS + ", " +
                               feature.attributes.HAMLET + "<br/>Acres: " + feature.attributes.ACREAGE + " - SqFT: " +
                               toNumber(feature.attributes.Shape_Area) + "<br/>Property Type: <a href='HelpDocs/propClassManual.pdf#page=" +
                               getPDFPage(feature.attributes.PROP_TYPE.slice(0, 1)) +
                               "' target='_blank'>" + feature.attributes.PROP_TYPE + "</a> <br/>TM#: " + feature.attributes.DSBL + "<br/>Parcel ID: " + feature.attributes.PARCEL_ID +
                               "<br/><br/><div class='parcelInfoLinks'>" +
                               "<img class='picImg' src='images/layers.png' title='Other Layers' onclick='javascript:viewAllLayers(" + map.infoWindow._location.x + ", " + map.infoWindow._location.y + ");'/>&nbsp;" +
                               "<img class='picImg' src='images/documents2.png' title='Permits' onclick='javascript:showPermits(" + pid + ");'/>&nbsp;" +
                               "<img class='picImg' src='images/building3.png' title='Building Info' onclick='javascript:getBuildingInfo(" + pid + ");'/>" +
                               "<img class='picImg' src='images/flag.png' title='Flags' onclick='javascript:propertyFlags(" + pid + ");'/>&nbsp;" +
                               "<img class='picImg' src='images/sales2.png' title='Sales Info' onclick='javascript:getSaleInfo(" + pid + ");'/>&nbsp;" +
                               "<img class='picImg' src='images/prc3.png' title='Record Card' onclick='openRecordCard(" + pid + ");'/>&nbsp;" + lastImg;

                    template = new esri.InfoTemplate("Tax Parcels", header + body);
                }

            } else {
                template = new esri.InfoTemplate("Tax Parcels", "<b>Tax Parcels</b> <hr/>" + company.replace(/'/g, "&#39;") + "<br/>" + feature.attributes.ADDRESS + ", " + feature.attributes.HAMLET + "<br/>Acres: " + feature.attributes.ACREAGE + " - SqFT: " + toNumber(feature.attributes.Shape_Area) + "<br/>Property Type: <a href='HelpDocs/propClassManual.pdf#page=" + getPDFPage(feature.attributes.PROP_TYPE.slice(0, 1)) + "' target='_blank'>" + feature.attributes.PROP_TYPE + "</a> <br/>TM#: " + feature.attributes.DSBL + "<br/>Parcel ID: " + feature.attributes.PARCEL_ID + "<br/><br/><div class='parcelInfoLinks'>&nbsp;<img class='picImg' src='images/layers.png' title='Other Layers' onclick='javascript:viewAllLayers(" + map.infoWindow._location.x + ", " + map.infoWindow._location.y + ");'/>&nbsp;<img class='picImg' src='images/airplane.png' title='Pictometry' onclick='javascript:pictometry(" + map.infoWindow._location.x + ", " + map.infoWindow._location.y + ");'/></div>");
            }

            
            feature.setInfoTemplate(template);
            return feature;
        });
    });
    map.infoWindow.setFeatures([deferred]);
    map.infoWindow.show(evt.mapPoint); 
}
function addResultsFromIdentify(feature) {
    if (!checkIds(feature.attributes.PARCEL_ID, "sessionResults")) {
        var graph = new esri.Graphic(feature);
        graph.setSymbol(useDefaultSymbol());
        map.getLayer("sessionGraphicsLayer").add(graph);
    }
}
function openRecordCard(id) {
    window.open("https://gis2.southamptontownny.gov/affReport/index.html?pid=" + id + '&ws=lm');
}
function viewAllLayers(x, y) {
    //Manage Layers
    if (y) {
        //this is from the identify popup window
        identifyParams.geometry = new esri.geometry.Point(x, y, map.spatialReference);
        identifyParams.layerIds = [3, 4, 5, 13, 14, 15, 16, 18, 26, 28, 29, 30, 31, 32, 33, 34, 35, 51, 52, 53,
            54, 55, 56, 58, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 78, 79, 80, 81, 84, 86, 92,
            93, 94, 95, 102, 104, 105, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 119, 120, 121, 122, 123, 124, 125];
    } else {
        
        identifyParams.geometry = x.mapPoint;
        identifyParams.layerIds = [1, 3, 4, 5, 13, 14, 15, 16, 18, 26, 28, 29, 30, 31, 32, 33, 34, 35, 51, 52, 53,
            54, 55, 56, 58, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 78, 79, 80, 81, 84, 86, 92,
            93, 94, 95, 102, 104, 105, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 119, 120, 121, 122, 123, 124, 125];
    }
    identifyParams.mapExtent = map.extent;
    identifyParams.tolerance = 5;
    identifyParams.layerOption = esri.tasks.IdentifyParameters.LAYER_OPTION_ALL;
    identifyParams.returnGeometry = false;
    identifyParams.width = map.width;
    identifyParams.height = map.height;
    var deferred = identifyTask.execute(identifyParams, function (response) {
        document.getElementById('allIdentifyInnerDivContent').innerHTML = "";
        getlayerInfos(response, "all");
    }, document.getElementById('allIdentifyInnerDivContent').innerHTML = "");
    document.getElementById('allIdentifyPanel').style.display = "block";
    document.getElementById('allIdentifyInnerDivContent').innerHTML = "<img alt='' src='images/wait.gif'/>";
}
function clearActiveLayers() {
    var layers = dojo.query(".activeLayer");
    for (i = 0; i < layers.length; i++) {
        layers[i].className = layers[i].className.replace(new RegExp('\\bactiveLayer\\b'), '');
    }
}
function identifyActiveLayer(evt) {

    var layers = dojo.query(".activeLayer");
    var activelayers = [];
    for (i = 0; i < layers.length; i++) {
        activelayers.push(layers[i].id.substring(5));
    }
    if (activelayers.length > 0) {
        identifyParams.tolerance = 5;
        identifyParams.geometry = evt.mapPoint;
        identifyParams.mapExtent = map.extent;
        identifyParams.returnGeometry = true;
        identifyParams.layerIds = [activelayers.join(',')];
        identifyParams.layerOption = esri.tasks.IdentifyParameters.LAYER_OPTION_ALL;
        identifyParams.width = map.width;
        identifyParams.height = map.height;
        var deferred = identifyTask.execute(identifyParams);
        deferred.addCallback(function (response) {
            return dojo.map(response, function (result) {
                var feature = getlayerInfos(result, "active");
                return feature;
            });
        });
        map.infoWindow.setFeatures([deferred]);
        map.infoWindow.show(evt.mapPoint);
    } else {
        alert('Please select a layer(s) to identify in the legend');
    }
}
function getlayerInfos(result, sender) {
    if (sender == "active") {
        var feature = result.feature;
        feature.attributes.layerName = result.layerName;
        var template = new esri.InfoTemplate(result.layerName, createTemplate(result));
        feature.setInfoTemplate(template);
        return feature;
    } else {
    return dojo.map(result, function (res) {
        var template = createTemplate(res);
        var id = document.getElementById('allIdentifyInnerDiv');
        document.getElementById('allIdentifyInnerDivContent').innerHTML += "<br/><hr/>" + template;
        return template;
    });
    }
}
function createTemplate(result) {
    var feature = result.feature;
    var template = '';
    feature.attributes.layerName = result.layerName;
    if (result.layerName == "Tax Parcels") {
        var company;
        if (feature.attributes.COMPANY == "") {
            company = feature.attributes.FIRST_NAME + " " + feature.attributes.LAST_NAME;
        } else if (feature.attributes.LAST_NAME == "" && feature.attributes.FIRST_NAME == "") {
            company = feature.attributes.COMPANY;
        } else {
            company = feature.attributes.LAST_NAME;
        }
        var acres = feature.attributes.ACREAGE;
        var address = feature.attributes.ADDRESS;
        var dsbl = feature.attributes.DSBL;
        var pid = feature.attributes.PARCEL_ID;
        var pType = feature.attributes.PROP_TYPE;
        var hamlet = feature.attributes.HAMLET;
        template = "<b>TAX PARCELS</b>&nbsp;&nbsp<hr/>" + company + "<br/>" + address + ", " + hamlet + "<br/>Acres: " + acres + " - SqFT: " + toNumber(feature.attributes.Shape_Area) + "<br/>Property Type: <a href='HelpDocs/propClassManual.pdf#page=" + getPDFPage(pType.slice(0, 1)) + "' target='_blank'>" + pType + "</a> <br/>TM#: " + dsbl + "<br/>Parcel ID: " + pid;
    }
    else if (result.layerName == "Historic Sites") {
        template = "<b>Historic Sites</b>&nbsp;&nbsp<hr/>" + feature.attributes.LOCATION + "<br/>Address: " + feature.attributes.ADDRESS + "<br/>Type: " + feature.attributes.STATUS + "<br/>State Date: " + feature.attributes.SRDATE + "<br/>Federal date: " + feature.attributes.NRDATE + "<br/>Town date: " + feature.attributes.TOWNDATE + "<br/>Village date: " + feature.attributes.VILL_DATE;
    }
    else if (result.layerName == "Stormwater Abatement") {
        template = "<b>Stormwater Abatement</b>&nbsp;&nbsp<hr/>" + "PROJECT AREA: " + feature.attributes.PROJ_AREA + "<br/>PROJECT: " + feature.attributes.PROJECT + "<br/>GRANT NAME:" + feature.attributes.GRANT_NAME + "<br/>STATUS: " + feature.attributes.STATUS + "<br/>SEGMENT: " + feature.attributes.SEGMENT;
    }
    else if (result.layerName == "Easements/ Covenants and Restrictions") {
        template = "<b>EASEMENTS</b>&nbsp;&nbsp<hr/>" + "EASEMENT TYPE: " + feature.attributes.Easement_T + "<br/>Source File: " + feature.attributes.Source_Fil;
    }
    else if (result.layerName == "Special Groundwater Protection Areas") {
        template = "<b>Special Groundwater Protection Areas</b>&nbsp;&nbsp<hr/>Special Groundwater Protection Areas";
    }
    else if (result.layerName == "Town of Southampton Drainage") {
        template = "<b>DRAINAGE STRUCTURES</b>&nbsp;&nbsp<hr/>" + "STRUCTURE TYPE: " + feature.attributes.STYPE + "<br/>OWNER: " + feature.attributes.OWNER + "<br/>OUTFALL SYSTEM: " + feature.attributes.OUTFALL_SYS + "<br/>VERIFIED (1 = YES): " + feature.attributes.LOCVERIFY;
    }
    else if (result.layerName == "Outfalls") {
        template = "<b>OUTFALLS</b>&nbsp;&nbsp<hr/>" + "Source: " + feature.attributes.SOURCE + "<br/>ID: " + feature.attributes.ID2 + "<br/>Hamlet: " + feature.attributes.Hamlet +
            "<br/>Waterbody: " + feature.attributes.WATERBODY_NAME + "<br/>Road: " +
            feature.attributes.ROAD_NAME + "<br/>TYPE: " + feature.attributes.TYPE + "<br/>Description: " + feature.attributes.DESCRIPTION + "<br/>Site Info: " + feature.attributes.SITE_INFO;
    }
    else if (result.layerName == "2nd Floor Parcel Overlap") {
        template = "<b>2ND FLOOR PARCEL OVERLAYS</b>&nbsp;&nbsp<hr/>" + "PARCEL ID: " + feature.attributes.PARCEL_ID + "<br/>DSBL: " + feature.attributes.DSBL + "<br/>PROP TYPE:" + feature.attributes.PROP_TYPE + "<br/>ROLL SECT: " + feature.attributes.ROLL_SECT;
    }
    else if (result.layerName == "3rd Floor Parcel Overlap") {
        template = "<b>3RD FLOOR PARCEL OVERLAYS</b>&nbsp;&nbsp<hr/>" + "PARCEL ID: " + feature.attributes.PARCEL_ID + "<br/>DSBL: " + feature.attributes.DSBL + "<br/>PROP TYPE:" + feature.attributes.PROP_TYPE + "<br/>ROLL SECT: " + feature.attributes.ROLL_SECT;
    } 
    else if (result.layerName == "Building Footprints") {
        template = "<b>BUILDING FOOTPRINTS</b>&nbsp;&nbsp<hr/>" + "BUILDING ID: " + feature.attributes.BLDG_ID + "<br/>BUILDING SEQ: " + feature.attributes.BLDG_SEQ + "<br/>CIVIC NUMBER:" + feature.attributes.CIVIC_NO + "<br/>KEY ID: " + feature.attributes.KEY_ID;
    }
    else if (result.layerName == "Community Boundaries") {
        template = "<b>COMMUNITY BOUNDARIES</b>&nbsp;&nbsp<hr/>" + feature.attributes.HAMLET_NAM;
    }
    else if (result.layerName == "Flood Hazard Zones") {
        template = "<b>FEMA FIRM</b>&nbsp;&nbsp<hr/>" + "FLOOD ZONE: " + feature.attributes.FLD_ZONE + "<br/>STATIC  BFE: " + feature.attributes.STATIC_BFE + "<br/>FIRM PANEL:" + feature.attributes.FIRM_PAN + "<br/>EFF DATE: " + feature.attributes.EFF_DATE;
    } else if (result.layerName == "Road Manager Pavement Segments (Town)") {
        template = "<b>Road Manager Pavement Segments</b>&nbsp;&nbsp<hr/>" + "Road Name: " + feature.attributes.Name + "<br/>Road Width: " + feature.attributes.Width + " Ft<br/>DtSurvey: " + feature.attributes.DtSurvey + "<br/>PCI: " + feature.attributes.PCI + "<br/>Pavement Type: " + feature.attributes.PavementType + "<br/>ROW Width: " + feature.attributes.ROW_Width + " Ft<br/>From Station: " + feature.attributes.FrStation + "<br/>To Station: " + feature.attributes.ToStation + "<br/>Length: " + toNumber(feature.attributes.Length);
    }
    else if (result.layerName == "Coastal Barrier Resource System") {
        template = "<b>Coastal Barrier Resource System</b>&nbsp;&nbsp<hr/>" + feature.attributes.CBRS_TYP + "<br/>Established: (" + feature.attributes.CBRS_DATE + ")";
    }
    else if (result.layerName == "Old Filed Maps") {
        var hotlink;
        if (feature.attributes.HOTLINK == "" || !feature.attributes.HOTLINK || navigator.appName != "Microsoft Internet Explorer") {
            hotlink = "No Map";
        }
        else {
            hotlink = "<a target='_blank' href='" + feature.attributes.HOTLINK + "'>MAP LINK</a>";
        }
        template = "<b>OLD FILED MAPS</b>&nbsp;&nbsp<hr/>" + "SUBDIVISION NAME: " + feature.attributes.SUBD_NAME + "<br/>FILE DATE: " + feature.attributes.FILE_DATE + "<br/>FILE #: " + feature.attributes.FILE_MAP + "<br/>ATLAS PG: " + feature.attributes.ATLAS_PG + "<br/>" + hotlink;
    }
    else if (result.layerName == "Old Filed Map Overlay Districts") {
        template = "<b>OLD FILED MAP OVERLAY DISTRICTS</b>&nbsp;&nbsp<hr/>" + "NOTE: " + feature.attributes.NOTE1;
    }
    else if (result.layerName == "Redevelopment Sections") {
        var hotlink;
        if (feature.attributes.HOTLINK == "" || !feature.attributes.HOTLINK || navigator.appName != "Microsoft Internet Explorer") {
            hotlink = "No Map";
        }
        else {
            hotlink = "<a target='_blank' href='" + feature.attributes.HOTLINK + "'>MAP LINK</a>";
        }
        template = "<b>REDEVELOPMENT SECTIONS</b>&nbsp;&nbsp<hr/>" + "PARCEL ID: " + feature.attributes.PARCEL_ID + "<br/>DSBL: " + feature.attributes.DSBL + "<br/>OFM: " + feature.attributes.OFM + "<br/>DEV SECT: " + feature.attributes.Dev_Sect + "<br/>UNIT:" + feature.attributes.Unit + "<br/>" + hotlink;
    } else if (result.layerName == "Riverside Overlay District") {
        var hotlink;
        if (feature.attributes.LINK == "" || !feature.attributes.LINK) {
            hotlink = "No Resolution on File";
        }
        else {
            hotlink = "<a target='_blank' href='" + feature.attributes.LINK + "'>Resolution Link</a>";
        }
        template = "<b>RIVERSIDE OVERLAY DISTRICT</b>&nbsp;&nbsp<hr/>ZONE: " + feature.attributes.Zone + "<br/>Area: " + feature.attributes.Area_AC + "<br/>Resolution: " + hotlink;
    }
    else if (result.layerName == "Aquifer Protection Overlay District") {
        template = "<b>AQUIFER PROTECTION OVERLAY DISTRICT</b>&nbsp;&nbsp<hr/>" + "NOTE: " + feature.attributes.NOTE;
    }
    else if (result.layerName == "Ag. Overlay District") {
        template = "<b>AG. OVERLAY DISTRICT</b>&nbsp;&nbsp<hr/>" + "NOTE: " + feature.attributes.NOTE;
    }
    else if (result.layerName == "Central Pine Barrens") {
        template = "<b>CENTRAL PINE BARRENS</b>&nbsp;&nbsp<hr/>" + "ZONE: " + feature.attributes.ZONE + "<br/>PLAN: " + feature.attributes.PLAN_ + "<br/>ID: " + feature.attributes.ID + "<br/>DISTRICT: " + feature.attributes.DISTRICT;
    }
    else if (result.layerName == "Subdivisions") {
        var path;
        if (feature.attributes.PATH != "Null") {
            path = "<a target='_blank' href='" + feature.attributes.PATH + "'>Subdivision Map</a>";
        } else {
            path = "No Map On File";
        }
        template = "<b>SUBDIVISIONS</b>&nbsp;&nbsp<hr/>" + "SUBDIVISION NAME: " + feature.attributes.SUBD_NAME + "<br/>FILE DATE: " + feature.attributes.FILE_DATE + "<br/>MAP NUM: " + feature.attributes.MAP_NUM + "<br/>MAP: " + path + "<br/>PRESCRIBED ZONE: " + feature.attributes.PRESCRIBED_ZONE + "<br/>MINOR: " + feature.attributes.MINOR;
    }
    else if (result.layerName == "Protected Lands") {
        template = "<b>PROTECTED LANDS</b>&nbsp;&nbsp<hr/>" + "PARCEL ID: " + feature.attributes.P_ID + "<br/>DSBL: " + feature.attributes.DSBL + "<br/>ADDRESS: " + feature.attributes.ADDRESS + "<br/>HAMLET: " + feature.attributes.HAMLET + "<br/>COMPANY: " + feature.attributes.COMPANY + "<br/>PRESERVE INFO: " + (feature.attributes.LOTINFO == "Null" ? "N/A" : feature.attributes.LOTINFO) + "<br/>PARK?: " + (feature.attributes.CPF_PARK == "Null" ? "N/A" : feature.attributes.CPF_PARK) + "<br/>PINE BARRENS: " + (feature.attributes.PinePlan == "Null" ? "N/A" : feature.attributes.PinePlan);
    }
    else if (result.layerName == "Public Lands") {
        template = "<b>PUBLIC LANDS</b>&nbsp;&nbsp<hr/>" + "PARCEL ID: " + feature.attributes.PARCEL_ID + "<br/>COMPANY NAME: " + feature.attributes.COMPANY_NAME + "<br/>COMPANY NAME 2: " + feature.attributes.COMPANY_NAME2;
    }
    else if (result.layerName == "Not For Profits") {
        template = "<b>NOT FOR PROFITS</b>&nbsp;&nbsp<hr/>" + "PARCEL ID: " + feature.attributes.PARCEL_ID + "<br/>COMPANY: " + feature.attributes.COMPANY;
    }
    else if (result.layerName == "Soils") {
        template = "<b>SOILS</b>&nbsp;&nbsp<hr/>" + "MUSYM: " + feature.attributes.MUSYM + "<br/>SOIL NAME: " + feature.attributes.SOIL_NAME + "<br/>CLASS: " + feature.attributes.CLASS + "<br/>STATUS: " + feature.attributes.STATUS + "<br/>DRAINAGE CLASS: " + feature.attributes.Drainage_Class + "<br/>SEPTIC ABSORBTION RATING: " + feature.attributes.Septic_Absorb_Rating;
    }
    else if (result.layerName == "School Districts") {
        template = "<b>SCHOOL DISTRICTS</b>&nbsp;&nbsp<hr/>" + feature.attributes.DISTRICT;
    }
    else if (result.layerName == "DEC Freshwater Wetlands") {
        template = "<b>DEC FRESHWATER WETLANDS</b>&nbsp;&nbsp<hr/>" + "NAME: " + feature.attributes.NAME1 + "<br/>Class: " + feature.attributes.CLASS + "<br/>WETLAND ID: " + feature.attributes.WETID;
    }
    else if (result.layerName == "DEC Tidal Wetlands") {
        template = "<b>DEC TIDAL WETLANDS</b>&nbsp;&nbsp<hr/>" + "TW CAT: " + feature.attributes.TWCAT + "<br/>CATEGORY: " + feature.attributes.CATEGORY;
    }
    else if (result.layerName == "Development Rights") {
        template = "<b>DEVELOPMENT RIGHTS</b>&nbsp;&nbsp<hr/>" + "PARCEL ID: " + feature.attributes.PARCEL_ID + "<br/>DSBL: " + feature.attributes.DSBL;
    }
    else if (result.layerName == "Pine Barren Credit Easements(Conservation Easements)") {
        template = "<b>PINE BARRENS CREDIT EASEMENTS</b>&nbsp;&nbsp<hr/>" + "PARCEL ID: " + feature.attributes.PARCEL_ID + "<br/>DSBL: " + feature.attributes.DSBL + "<br/>PBC DATE: " + feature.attributes.PBC_DATE;
    }
    else if (result.layerName == "Pine Barren Overlay Easements(Conservation Easements)") {
        template = "<b>PINE BARRENS OVERLAY EASEMENTS</b>&nbsp;&nbsp<hr/>" + "PARCEL ID: " + feature.attributes.PARCEL_ID + "<br/>PBC DATE: " + feature.attributes.PBC_DATE;
    }
    else if (result.layerName == "Pine Barren Credits Redeemed") {
        template = "<b>PINE BARRENS CREDITS REDEEMED</b>&nbsp;&nbsp<hr/>" + "PARCEL ID: " + feature.attributes.PARCEL_ID + "<br/>DSBL: " + feature.attributes.DSBL + "<br/>CTF NUMBER: " + feature.attributes.CTF_NUMBER + "<br/>OWNER: " + feature.attributes.OWNER + "<br/>REDEEMED: " + feature.attributes.REDEEMED + "<br/>BALANCE: " + feature.attributes.BALANCE + "<br/>DATE: " + feature.attributes.DATE;
    }
    else if (result.layerName == "Town TDR's") {
        var certificate = ""; 
        var comments = "";
        if (feature.attributes.PATH && feature.attributes.PATH != null && feature.attributes.PATH != "Null") {
            certificate = "<br/><a target='_blank' href='" +  feature.attributes.PATH +  "'>Certificate</a>";
        }
        if (feature.attributes.Comments && feature.attributes.Comments != null && feature.attributes.Comments != "Null") {
            comments = "<br/>Comments: " + feature.attributes.Comments;
        }
        template = "<b>TOWN TDR'S</b>&nbsp;&nbsp<hr/>" + "PARCEL ID: " + feature.attributes.Parcel_ID + "<br/>LIBER: " + feature.attributes.LIBER + "<br/>PAGE: " + feature.attributes.PAGE + "<br/>RECORDED: " + feature.attributes.Recorded + "<br/>SCHOOL DISTRICT: " + feature.attributes.SCHOOLDIST + "<br/>REMAINING: " + feature.attributes.Remaining + "<br/>REC PARCEL: " + feature.attributes.REC_PARCEL + "<br/>PRESERVED: " + feature.attributes.Preserved + "<br/>CERT NO: " + feature.attributes.CERT_NO + "<br/>DEV RIGHTS: " + feature.attributes.Dev_Rights + certificate + comments;
    }
    else if (result.layerName == "Land Use") {
        template = "<b>LAND USE</b>&nbsp;&nbsp<hr/>" + feature.attributes.BTCAMP;
    }
    else if (result.layerName == "CPF Priorities") {
        template = "<b>CPF PRIORITIES</b>&nbsp;&nbsp<hr/>" + "PARCEL ID: " + feature.attributes.PARCEL_ID + "<br/>CPF CATEGORY: " + feature.attributes.CPF_CATEGORY;
    }
    else if (result.layerName == "CPF Preserved Properties") {
        template = "<b>CPF PRESERVED PROPERTIES</b>&nbsp;&nbsp<hr/>" + "PARCEL ID: " + feature.attributes.PARCEL_ID + "<br/>CPF STATUS: " + feature.attributes.CPF_STATUS;
    }
    else if (result.layerName == "Critical Environmental Areas") {
        template = "<b>CRITICAL ENVIRONMENTAL AREAS</b>&nbsp;&nbsp<hr/>" + "NAME: " + feature.attributes.NAME + "<br/>AGENCY: " + feature.attributes.AGENCY;
    }
    else if (result.layerName == "Fire Districts") {
        template = "<b>FIRE DISTRICTS</b>&nbsp;&nbsp<hr/>" + "NAME: " + feature.attributes.FD_NAME + "<br/>DISTRICT: " + feature.attributes.DISTRICT + "<br/>FD # " + feature.attributes.FD_NUMBER;
    }
    else if (result.layerName == "Parking Districts") {
        template = "<b>PARKING DISTRICTS</b>&nbsp;&nbsp<hr/>" + "DISTRICT: " + feature.attributes.District;
    }
    else if (result.layerName == "SLOSH - (Sea, Lake, and Overland Surges from Hurricanes)") {
        template = "<b>SLOSH</b>&nbsp;&nbsp<hr/>" + "Category - " + feature.attributes.Category;
    }
    else if (result.layerName == "Highway Districts") {
        template = "<b>HIGHWAY DISTRICTS</b>&nbsp;&nbsp<hr/>" + "ID #: " + feature.attributes.ID;
    }
    else if (result.layerName == "Park Districts") {
        template = "<b>PARK DISTRICTS</b>&nbsp;&nbsp<hr/>" + feature.attributes.Park_Dist;
    }
    else if (result.layerName == "Ambulance Service Areas") {
        template = "<b>Ambulance Service Areas</b><hr/>" + feature.attributes.DISTRICT;
    }
    else if (result.layerName == "Water Districts") {
        template = "<b>WATER DISTRICTS</b>&nbsp;&nbsp<hr/>" + feature.attributes.DISTRICT;
    }
    else if (result.layerName == "Beach Erosion Control Tax District") {
        template = "<b>BEACH EROSION CONTROL TAX DISTRICT</b>&nbsp;&nbsp<hr/>" + "DISTRICT: " + feature.attributes.DISTRICT;
    }
    else if (result.layerName == "Agricultural Dist.5") {
        template = "<b>AGRICULTURAL DIST.5</b>&nbsp;&nbsp<hr/>" + "PARCEL ID: " + feature.attributes.PARCEL_ID;
    }
    else if (result.layerName == "Groundwater Management Zones") {
        template = "<b>GROUNDWATER MANAGEMENT ZONE</b>&nbsp;&nbsp<hr/>" + "ZONE: " + feature.attributes.ZONE;
    }
    else if (result.layerName == "Archeological Sensitive Areas") {
        template = "<b>ARCHEOLOGICAL SENSITIVE AREAS</b>&nbsp;&nbsp<hr/>" + feature.attributes.IN_;
    }
    else if (result.layerName == "Natural Heritage Potential") {
        template = "<b>NATURAL HERITAGE POTENTIAL</b>&nbsp;&nbsp<hr/>" + "SCIENTIFIC NAME: " + feature.attributes.SCIEN_NAME + "<br/>COMMON NAME: " + feature.attributes.COMMONNAME + "<br/>SENSITIVE: " + feature.attributes.SENSITIVE + "<br/>LAST DATE: " + feature.attributes.LAST_DATE + "<br/>LOCATION: " + feature.attributes.LOCATION + "<br/>ELEM GROUP: " + feature.attributes.ELEM_GROUP + "<br/>NY LISTED: " + feature.attributes.NY_LISTED + "<br/>US LISTED: " + feature.attributes.US_LISTED + "<br/>S RANK: " + feature.attributes.S_RANK + "<br/>G RANK: " + feature.attributes.G_RANK;
    }
    else if (result.layerName == "Natural Heritage Communities") {
        template = "<b>NATURAL HERITAGE COMMUNITIES</b>&nbsp;&nbsp<hr/>" + "SCIENTIFIC NAME: " + feature.attributes.SCIEN_NAME + "<br/>COMMON NAME: " + feature.attributes.COMMONNAME + "<br/>SENSITIVE: " + feature.attributes.SENSITIVE + "<br/>LAST DATE: " + feature.attributes.LAST_DATE + "<br/>LOCATION: " + feature.attributes.LOCATION + "<br/>ELEM GROUP: " + feature.attributes.ELEM_GROUP + "<br/>NY LISTED: " + feature.attributes.NY_LISTED + "<br/>US LISTED: " + feature.attributes.US_LISTED + "<br/>S RANK: " + feature.attributes.S_RANK + "<br/>G RANK: " + feature.attributes.G_RANK;
    }
    else if (result.layerName == "Natural Heritage Species") {
        template = "<b>NATURAL HERITAGE SPECIES</b>&nbsp;&nbsp<hr/>" + "SCIENTIFIC NAME: " + feature.attributes.SCIEN_NAME + "<br/>COMMON NAME: " + feature.attributes.COMMONNAME + "<br/>SENSITIVE: " + feature.attributes.SENSITIVE + "<br/>LAST DATE: " + feature.attributes.LAST_DATE + "<br/>LOCATION: " + feature.attributes.LOCATION + "<br/>ELEM GROUP: " + feature.attributes.ELEM_GROUP + "<br/>NY LISTED: " + feature.attributes.NY_LISTED + "<br/>US LISTED: " + feature.attributes.US_LISTED + "<br/>S RANK: " + feature.attributes.S_RANK + "<br/>G RANK: " + feature.attributes.G_RANK;
    }
    else if (result.layerName == "Points of Interest") {
        template = "<b>POINTS OF INTEREST</b>&nbsp;&nbsp<hr/>" + "NAME: " + feature.attributes.NAME + "<br/>PARCEL ID: " + feature.attributes.Parcel_Id + "<br/>ADDRESS: " + feature.attributes.ADDRESS + "<br/>LOCATION: " + feature.attributes.LOCATION + "<br/>TYPE: " + feature.attributes.TYPE + "<br/>AGENCY: " + feature.attributes.Agency + "<br/>MAINTAINED BY: " + feature.attributes.Maint_by + "<br/>FEATURE: " + feature.attributes.Feature + "<br/>DEPARTMENT: " + feature.attributes.Department;
    }
    else if (result.layerName == "Parks") {
        template = "<b>PARKS</b>&nbsp;&nbsp<hr/>" + "NAME: " + feature.attributes.NAME + "<br/>ACRES: " + feature.attributes.Acres + "<br/>AGENCY: " + feature.attributes.Agency + "<br/>TYPE: " + feature.attributes.Type + "<br/>PARKING: " + feature.attributes.Parking + "<br/>VISITORS: " + feature.attributes.Visitors + "<br/>USE: " + feature.attributes.USE_;   }
    else if (result.layerName == "Natural Communities") {
        template = "<b>NATURAL COMMUNITIES</b>&nbsp;&nbsp<hr/>" + "BIO NAME: " + feature.attributes.BIO_NAME + "<br/>HERITAGE: " + feature.attributes.HERITAGE;
    }
    else if (result.layerName == "Significant Coastal Fish and Wildlife Habitat") {
        template = "<b>SIGNIFICANT COASTAL FISH AND WILDLIFE HABITAT</b>&nbsp;&nbsp<hr/>" + "NAME: " + feature.attributes.NAME;
    }
    else if (result.layerName == "Open Space Target Area (1996)") {
        template = "<b>OPEN SPACE TARGET AREA</b>&nbsp;&nbsp<hr/>" + "NAME: " + feature.attributes.NAME;
    }
    else if (result.layerName == "Trails") {
        template = "<b>TRAILS</b>&nbsp;&nbsp<hr/>" + "TRAIL NAME: " + feature.attributes.TRAIL_NAME + "<br/>CONDITION: " + feature.attributes.CONDITION + "<br/>PERMITTED: " + feature.attributes.PERMITTED_ + "<br/>BLAZE DESCRIPTION: " + feature.attributes.BLAZE_DESC + "<br/>FEATURE NAME: " + feature.attributes.FEAT_NAME + "<br/>TRAIL SYSTEM: " + feature.attributes.TRL_SYSTEM + "<br/>LOOP: " + feature.attributes.LOOP + "<br/>GPS DATE: " + feature.attributes.GPS_DATE + "<br/>DATA COLLECTION: " + feature.attributes.DATA_COLL;
    }
    else if (result.layerName == "Water Bodies") {
        template = "<b>WATER BODIES</b>&nbsp;&nbsp<hr/>" + "NAME: " + feature.attributes.NAME + "<br/>LOCATION: " + feature.attributes.Location + "<br/>TYPE: " + feature.attributes.TYPE + "<br/>Owner: " + feature.attributes.STATUS + "<br/>Water Type: " + feature.attributes.WATER + "<br/>ACRES: " + feature.attributes.ACRES;
    }
    else if (result.layerName == "Assessor Photo Insp.") {
        template = "<b>ASSESSOR PHOTO INSP.</b>&nbsp;&nbsp<hr/>" + "PARCEL ID: " + feature.attributes.PARCEL_ID + "<br/>INSPECTION DATE: " + feature.attributes.INSPECTION_DATE + "<br/>STATUS: " + feature.attributes.STATUS;
    }
    else if (result.layerName == "Town Zoning") {
         var ll = "";
        var code = "";
        if (feature.attributes.LocalLaw != "Null") {
            ll = "<br/>Local Law: <a href='" + feature.attributes.LL_PATH + "' target='_blank'>" + feature.attributes.LocalLaw + "</a>";
        }
        if (feature.attributes.CODE != "Null") {
            code = "<br/>Code: " + feature.attributes.CODE
        }
        template = "<b>TOWN ZONING</b>&nbsp;&nbsp<hr/>" + "ZONE: " + feature.attributes.ZONE + "<br/>" + feature.attributes.DESCRIPT + ll + code;
    }
    else if (result.layerName == "North Haven") {
        template = "<b>TOWN ZONING</b>&nbsp;&nbsp<hr/>" + "ZONE: " + feature.attributes.ZONE;
    }
    else if (result.layerName == "Quogue") {
        template = "<b>TOWN ZONING</b>&nbsp;&nbsp<hr/>" + "ZONE: " + feature.attributes.ZONE;
    }
    else if (result.layerName == "Sagaponack") {
        template = "<b>TOWN ZONING</b>&nbsp;&nbsp<hr/>" + "ZONE: " + feature.attributes.ZONE;
    }
    else if (result.layerName == "SagHarbor") {
        template = "<b>TOWN ZONING</b>&nbsp;&nbsp<hr/>" + "ZONE: " + feature.attributes.ZONE; 
    }
    else if (result.layerName == "Southampton") {
        template = "<b>TOWN ZONING</b>&nbsp;&nbsp<hr/>" + "ZONE: " + feature.attributes.ZONE;
    }
    else if (result.layerName == "Westhampton Beach") {
        template = "<b>TOWN ZONING</b>&nbsp;&nbsp<hr/>" + "ZONE: " + feature.attributes.ZONE;
    } else if (result.layerName == "Neighborhoods") {
        template = "<b>Neighborhoods</b>&nbsp;&nbsp<hr/>Neighborhood: " + feature.attributes.NEIGH_CODE + "<br/>" + feature.attributes.HAMLET_NAM;
    } else if (result.layerName == "Groundwater Contributors") {
        template = "<b>Groundwater Contributors</b>&nbsp;&nbsp<hr/>Years: " + feature.attributes.YEARS;
    }
    else if (result.layerName.toString().indexOf("Sold") != -1) {
        var company;
        if (feature.attributes.COMPANY == "") {
            company = feature.attributes.FIRST_NAME + " " + feature.attributes.LAST_NAME;
        } else if (feature.attributes.LAST_NAME == "" && feature.attributes.FIRST_NAME == "") {
            company = feature.attributes.COMPANY;
        } else {
            company = feature.attributes.LAST_NAME;
        }
        template = "<b>" + result.layerName + "</b><hr/>" + company.replace(/'/g, "&#39;") + "<br/>" + feature.attributes.ADDRESS + ", " + feature.attributes.HAMLET + "<br/>" + toCurrency(feature.attributes.SALE_PRICE) + "<br/> " + getDate(new Date(feature.attributes.SALEDATE_TEXT)) + " <br/>Acres: " + feature.attributes.ACREAGE + " - Property Type: <a href='HelpDocs/propClassManual.pdf#page=" + getPDFPage(feature.attributes.PROP_TYPE.slice(0, 1)) + "' target='_blank'>" + feature.attributes.PROP_TYPE + "</a> <br/>TM#: " + feature.attributes.DSBL + "<br/>Parcel ID: " + feature.attributes.PARCEL_ID;
    }
    else if (result.layerName == "Sale Ratios") {
        template = "<b>Sale Ratio</b>&nbsp;&nbsp<hr/>" + "Sale Price: " + toCurrency(feature.attributes.SALE_PRICE) + "<br/>Appraised Value: " + toCurrency(feature.attributes.APPRAISED_VALUE) + "<br/>Sale Ratio: " + Math.round(feature.attributes.SALE_RATIO * 100) + "%";
    }
    else if (result.layerName == "Approved Small Claims") {
        template = "<b>Approved Small Claims</b>&nbsp;&nbsp<hr/>" + "Last Year Start: " + feature.attributes.yr1Start + "<br/>2 Years Ago Start: " + feature.attributes.yr2Start +  "<br/>3 Years Ago Start: " + feature.attributes.yr3Start;
    }
    else if (result.layerName == "2010 Census Boundaries") {
        template = "<b> 2010 Census Info </b>&nbsp;&nbsp<hr/>" + "Total Population: " + feature.attributes.TOTAL_POP + "<br/>Median Age: " + feature.attributes.MED_AGE + "<br/>Housing Units: " + feature.attributes.HOUSE_UNITS + "<br/>Race - White: " + feature.attributes.RACE_WHITE + "<br/>Race - African American: " + feature.attributes.RACE_AF_AM + "<br/>Race - Asian: " + feature.attributes.RACE_ASIAN + "<br/>Race - Hawaiian: " + feature.attributes.RACE_NAT_HAW + "<br/>Race - American Indian: " + feature.attributes.RACE_AM_IND + "<br/>Race - Other: " + feature.attributes.RACE_OTHER + "<br/>Ethnicity - Non Hispanic: " + feature.attributes.ETH_NON_HISP + "<br/>Ethnicity - Hispanic: " + feature.attributes.ETH_HISP;
    }
    else {
        console.log(result.layerName);
    }
    //return feature;
    return template;
}

function pictometry(x, y) {
        dijit.byId('pictoDialog').show();
        var gem = new esri.geometry.Point(x, y, map.spatialReference);
        var outSR = new esri.SpatialReference({ wkid: 4326 });
        gsvc.project([gem], outSR, function (projectedPoints) {
            //window.open("PictometryOnline.html?xcoord=" + projectedPoints[0].x + "&ycoord=" + projectedPoints[0].y);
            pictoInit(projectedPoints[0].y, projectedPoints[0].x);
        });
        //pictoInit(gem.y, gem.x);
}
function showPermits(id) {
     showPermit("https://gis2.southamptontownny.gov/permits/permits.htm?pid=" + id + "&sender=lm", 680, 575);
}
function stringifyJSON(json) {

    json = json.replace(/[\\]/g, '\\\\');
    json = json.replace(/[\"]/g, '\\\"');
    json = json.replace(/[\/]/g, '\\/');
    json = json.replace(/[\b]/g, '\\b');
    json = json.replace(/[\f]/g, '\\f');
    json = json.replace(/[\n]/g, '\\n');
    json = json.replace(/[\r]/g, '\\r');
    json = json.replace(/[\t]/g, '\\t');
    json = json.replace(/[\']/g, " apos; ");
    return json;

}
function getPDFPage(propType) {
    var pageNumber;

    switch (propType) {
        case '1':
            pageNumber = 9;
            break;
        case '2':
            pageNumber = 11;
            break;
        case '3':
            pageNumber = 13;
            break;
        case '4':
            pageNumber = 15;
            break;
        case '5':
            pageNumber = 22;
            break;
        case '6':
            pageNumber = 25;
            break;
        case '7':
            pageNumber = 27;
            break;
        case '8':
            pageNumber = 30;
            break;
        case '9':
            pageNumber = 35;
            break;
    }

    return pageNumber;
}
function getDate(date) {
    var MONTH_NAMES = new Array('January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'); 
    var DAY_NAMES = new Array('Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat');

    var y = date.getFullYear();
    var m = date.getMonth();
    var d = date.getDate();

    return MONTH_NAMES[m] + " " + d + ", " + y;
}
function toCurrency(num) {
    var sign;
    var cents;
    var i;
    num = num.toString().replace(/\$|\,/g, '');
    if (isNaN(num)) {
        num = "0";
    }
    sign = (num == (num = Math.abs(num)));
    num = Math.floor(num * 100 + 0.50000000001);
    cents = num % 100; num = Math.floor(num / 100).toString();
    if (cents < 10) {
        cents = '0' + cents;
    }
    for (i = 0; i < Math.floor((num.length - (1 + i)) / 3); i++) {
        num = num.substring(0, num.length - (4 * i + 3)) + ',' + num.substring(num.length - (4 * i + 3));
    }
    return (((sign) ? '' : '-') + '$' + num + '.' + cents);
}
function toNumber(num) {
    var sign;
    var cents;
    var i;
    num = num.toString().replace(/\$|\,/g, '');
    if (isNaN(num)) {
        num = "0";
    }
    sign = (num == (num = Math.abs(num)));
    num = Math.floor(num * 100 + 0.50000000001);
    cents = num % 100; num = Math.floor(num / 100).toString();
    if (cents < 10) {
        cents = '0' + cents;
    }
    for (i = 0; i < Math.floor((num.length - (1 + i)) / 3); i++) {
        num = num.substring(0, num.length - (4 * i + 3)) + ',' + num.substring(num.length - (4 * i + 3));
    }
    return (((sign) ? '' : '-') + num + '.' + cents);
}