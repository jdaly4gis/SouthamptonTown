function namePermitSearchType() {
    var radioButtons = dojo.query(".namePermitSearchType");
    for (var i = 0; i < radioButtons.length; i++) {
        if (radioButtons[i].checked) {
            return radioButtons[i].value;
        }
    }
}
function loadNamePermitTypes(sender) {
    var dv = dijit.byId('NamePermitsSearch').item.i.name;
    //dv = "Eberts, Merriah";
    var type = dijit.byId('NamePermitsSearch').item.i.type;
    //type = "nameSearch";
    var value = dijit.byId('NamePermitsSearch').item.i.value;
    //value = "518090";
    var store = new dojox.data.QueryReadStore({ url: 'modules/namePermits/namePermitsHandler.ashx' });
    sender.set('iconClass', 'dijitIconLoading');
    sender.set('disabled', true);
    store.fetch({
        serverQuery: { sender: "loadNamePermitTypes", type: type, value: value, dept: getDepartment() },
        onError: function (items) {
            alert(items);
        },
        onComplete: function (items, request) {
            if (items.length > 0) {
                var tc, freeLines, photo, personalInfo;
                if (document.getElementById('peopleManager')) {
                    dojo.destroy(document.getElementById('peopleManager'));
                }
                for (var x in items[0].i) {
                    switch (x) {
                        case "nameInfo":
                            freeLines = items[0].i.nameInfo[0].FREE_LINE_1 + "<br/>" + items[0].i.nameInfo[0].FREE_LINE_2 + "<br/>" + items[0].i.nameInfo[0].FREE_LINE_3 + "<br/>" + items[0].i.nameInfo[0].FREE_LINE_4 + "<br/>" + items[0].i.nameInfo[0].FREE_LINE_5 + "Email: " + items[0].i.nameInfo[0].EMAIL;
                            
                            if (items[0].i.nameInfo[0].PATH_PHOTO) {
                                photo = "<a data-dojo-type='dojox/image/LightboxNano' href='" + items[0].i.nameInfo[0].PATH_PHOTO + "'><img src='" + items[0].i.nameInfo[0].PATH_PHOTO + "' style='box-shadow: 1px 1px 3px #000;max-height:120px;'></a>";
                            } else {
                                photo = "There is no Photo"
                            }
                            //var mo = new Date(items[0].i.nameInfo[0].T_DOB).getMonth() * 1 + 1
                            //var dob = items[0].i.nameInfo[0].T_DOB != "" ? new Date(items[0].i.nameInfo[0].T_DOB).getDate() + "/" + mo + "/" + new Date(items[0].i.nameInfo[0].T_DOB).getFullYear() : "";
                            personalInfo = "Date of Birth: " + items[0].i.nameInfo[0].T_DOB  + "<br/>Hair Color: " + items[0].i.nameInfo[0].HAIR_COLOR + "<br/>Eye Color: " + items[0].i.nameInfo[0].EYE_COLOR + "<br/>Height: " + items[0].i.nameInfo[0].HEIGHT;
                            break;
                        case "permitInfo":
                            var tc = new dijit.layout.TabContainer({ style: "height: 100%; width: 100%;" });
                            var fieldOrder = ['PM_ID', 'Permit Type', 'PURPOSE', 'Application #', 'Application Date', 'Permit #', 'Permit Date', 'Expiration Date', 'Total Fee',
                                'Proof of Residency', 'Trustee Permit #', 'Sticker #', 'Trustee Waterbody', 'Number of Items', 'Vehicle Make', 'Vehicle Model', 'Vehicle Registration',
                                'Vehicle Color', 'Vehicle Year', 'Boat Length', 'Boat Make', 'Boat Registration', 'Boat Height', 'Boat Sticker #', 'Anchor Weight', 'Stake', 'CRC Issued',
                                'Dock Lottery #', 'Assigned Dock Location', 'Assigned Slip #', 'Pref. Bay Ave/Eastport Dock', 'Pref. Bay Ave/Eastport Dock #', 'Pref. Old Fort Pond',
                                'Pref. Old Fort Pond #', 'Pref. Speonk Shore Canal', 'Pref. Speonk Shore Canal #', 'Pref. Baycrest Ave Dock', 'Pref. Baycrest Ave Dock #',
                                'Number of People', 'Bonfire?', 'Alcohol Present?', 'Trustee Rd', 'Trustee Rd Parking', 'Fish Trap Location', 'Marine Species', 'Gear #', 'Blind Type', 'Type', 'Suspend Until'];

                            var permits = items[0].i[x];
                            for (var i = 0; i < permits.length; i++) {
                                var val = "";
                                var act = "";
                                //for (var x in permits[i]) {
                                //    if (permits[i][x] != "") {
                                //        if (x == "Activities") {
                                //            act = "<tr><td style='vertical-align:text-bottom; width:30%;text-decoration:underline;font-weight:bold;'><img style='vertical-align:middle; padding:3px;' src='images/expand_icon.gif' onclick=\"document.getElementById('" + i + "act').style.display = document.getElementById('" + i + "act').style.display == 'none' ? 'block' : 'none'; this.src = document.getElementById('" + i + "act').style.display == 'none' ? 'images/expand_icon.gif' : 'images/collapse_icon.gif'; \" />" + x + ":</td><td style='vertical-align:text-bottom;width:70%'><div style='display:none;' id='" + i + "act'>" + permits[i][x] + "</div></td></tr>";
                                //        } else {
                                //            val += "<tr><td class='infoDLG' style='vertical-align:text-bottom;font-weight:bold;'>" + x + ": </td><td class='infoDLG'> " + permits[i][x] + "</td></tr>"
                                //        }
                                //    }
                                //}
                                for (var x in fieldOrder) {
                                    if (permits[i][fieldOrder[x]] != "") {
                                        if (fieldOrder[x] == "Activities") {
                                            act = "<tr><td style='vertical-align:text-bottom; width:30%;text-decoration:underline;font-weight:bold;'><img style='vertical-align:middle; padding:3px;' src='images/expand_icon.gif' onclick=\"document.getElementById('" + i + "act').style.display = document.getElementById('" + i + "act').style.display == 'none' ? 'block' : 'none'; this.src = document.getElementById('" + i + "act').style.display == 'none' ? 'images/expand_icon.gif' : 'images/collapse_icon.gif'; \" />" + x + ":</td><td style='vertical-align:text-bottom;width:70%'><div style='display:none;' id='" + i + "act'>" + permits[i][fieldOrder[x]] + "</div></td></tr>";
                                        } else {
                                            val += "<tr><td class='infoDLG' style='vertical-align:text-bottom;font-weight:bold;'>" + fieldOrder[x] + ": </td><td class='infoDLG'> " + permits[i][fieldOrder[x]] + "</td></tr>"
                                        }
                                    }
                                }
                                var tab = new dijit.layout.ContentPane({
                                    title: permits[i]['Permit Type'],
                                    content: "<table cellspacing='0' style='width:100%;'>" + val + act + "</table>",
                                    style: "margin:3px;height:100%; width:100%;"
                                });
                                tc.addChild(tab);
                            }
                            break;
                        case "otherPermitInfo":
                            var otherPermits = items[0].i[x];
                            var content = "";
                            if (otherPermits.length > 0) {
                                var props = [];

                                for (var x = 0; x < otherPermits.length; x++) {
                                    var addToMap = "<td class='infoDLG'></td>";
                                    if (props.indexOf(otherPermits[x]['Parcel ID']) < 0) {
                                        addToMap = "<td class='infoDLG permitInfoDLG' style='cursor:pointer' onClick='doFind(\"" + otherPermits[x]['Parcel ID'] + ";9\")' > Add to Map Results</td>";
                                    }
                                    content += "<tr><td class='infoDLG' style='vertical-align:text-bottom;font-weight:bold;'>" + otherPermits[x]['Permit Type'] + "(" + otherPermits[x]['date'] + "): </td><td class='infoDLG'><a href='https://gis2.southamptontownny.gov/permits/permits.htm?pid=" + otherPermits[x]['Parcel ID'] + "&sender=lm' target='_blank'>" + otherPermits[x]['FORMATED_ADDRESS'] + "</a></td>" + addToMap + "</tr>"
                                    props.push(otherPermits[x]['Parcel ID']);
                                    //content += "<tr><td class='infoDLG' style='vertical-align:text-bottom;font-weight:bold;'>" + otherPermits[x]['Permit Type'] + "(" + otherPermits[x]['date'] + "): </td><td class='infoDLG permitInfoDLG' style='cursor:pointer' onClick='doFind(\"" + otherPermits[x]['Parcel ID'] + ";9\")' > Add " + otherPermits[x]['FORMATED_ADDRESS'] + " to Map Results</td></tr>"
                                }
                                var tab = new dijit.layout.ContentPane({
                                    title: "Permits",
                                    content: "<table cellspacing='0' style='width:100%;'>" + content + "</table>",
                                    style: "margin:3px;height:100%; width:100%;"
                                });
                                tc.addChild(tab);
                            }
                            break;
                    }
                }
                var iDiv = document.createElement('div');
                iDiv.id = 'peopleManager';

                iDiv.className = 'customDialogPanel';
                document.getElementsByTagName('body')[0].appendChild(iDiv);
                iDiv.innerHTML = '<div class="firstMessageClose" onclick="dojo.destroy(document.getElementById(\'peopleManager\'));">X</div>';

                var borderContainer = new dijit.layout.BorderContainer({
                    style: "height: 100%; width: 100%"
                }).placeAt(iDiv);

                var topContentPane = new dijit.layout.ContentPane({
                    region: 'top',
                    style: "height: 30%; width: 100%;",
                    content: "<table cellspacing='5' style=''><tr><td style='border:solid 1px; padding:2px;'>" + photo + "</td><td style=''>" + freeLines + "<hr/> " + personalInfo + "</td><tr></table>"
                    //content: "<div style='heigth:100%'><span>" + freeLines + "<br/> " + personalInfo + "</span>"+ photo + "</div>"
                });           
                borderContainer.addChild(topContentPane);
                var contentPane = new dijit.layout.ContentPane({
                    region: 'center',
                    style: "padding:10px;hwidth: 100%;",
                    content: tc
                });
                
                borderContainer.addChild(contentPane);
                borderContainer.startup();
                sender.set('disabled', false);
                sender.set('iconClass', '');
            } else {
                alert('there was an error processing your reuqest');
                sender.set('disabled', false);
                sender.set('iconClass', '');
            }
        }
    });
}