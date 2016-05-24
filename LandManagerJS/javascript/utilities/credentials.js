function checkCredentials(sender, ele) {
    var tryCount = 1;
    var oo = document.getElementById('passValid').value;
    if ((sender == "init" && eval('(' + callASHX("credentials.ashx?sender=init") + ')').items == "True") || (sender == "init" && document.getElementById('passValid').value == 'true')) {
            document.getElementById('enableJava').style.display = "none";
            //ele.set('label', "Switch User: (General)");
            document.getElementById('lmUserName').innerHTML = "General User";
            document.getElementById('lmUser').value = "General User";
            document.getElementById('lmUserEmail').value = "General User";
                        document.getElementById('lmUserGroups').value = "General User";

            createLegend(map);
    } else {
        if (sender == "init") {
            sender = "cred";
//alert('');
	    //callASHX("tracker/hitTracker.ashx"); 
        }
        var form = new dijit.form.Form({
            encType: 'multipart/form-data',
            action: '#',
            method: '',
            style: "margin:10px; background-color: white;",
            onSubmit: function (event) {
                dojo.stopEvent(event);
                //okBtn.set('disabled', true);
                //var uu = Url.decode(u.value);
                var sss = p;
                message.innerHTML = "";
                //var url =  ("credentials.ashx?d=" + domain.value + "&t=" + Math.random() + "&sender=" + sender + "&user=" + u.value + "&pass=" + encodeURIComponent(p.getDisplayedValue()));
                //alert(url);
                var creds = eval('(' + callASHX("credentials.ashx?d=" + domain.value + "&t=" + Math.random() + "&sender=" + sender + "&user=" + u.value + "&pass=" + encodeURIComponent(p.getDisplayedValue())) + ')');
                //alert(creds.items);
                if (creds.items != "true" && tryCount < 3) {
                    var countsLeft = 3 - tryCount;
                    tryCount++;
                    
                    //okBtn.set('disabled', false); 
                    message.innerHTML = "You have entered an incorrect username or password <br/>" + creds.items + "<br/>You have " + countsLeft + " tries left";
                    okBtn.set('label', "Ok");

                    document.getElementById('passValid').value = '';
                } else if (creds.items != "True" && tryCount >= 3) {
                    alert('You have tried too many times');
                    //okBtn.set('disabled', false); 
                    dlg.hide(); okBtn.set('label', "Ok");

                    document.getElementById('passValid').value = '';
                } else if (creds.items == "true") {
                    document.getElementById('passValid').value = 'true';
                    //ele.set('label', "Log Out");
                    if (sender == "police") {
                        startEditing();
                        dialog = new dijit.TooltipDialog({
                            style: "position: absolute; font: normal normal normal 10pt Helvetica;z-index:100"
                        });
                        dialog.startup();
                        var masterInfo = eval('(' + callASHX("getData.ashx?type=load&layer=offenderLyr") + ')');
                        addPointLayer(masterInfo, "offenderLyr");

                        offenderPanelHandler(sender);
                    } else {
                        document.getElementById('lmUserName').innerHTML = creds.name;
                        document.getElementById('lmUser').value = u.value;
                        document.getElementById('lmUserEmail').value = creds.email;
                        document.getElementById('lmUserGroups').value = creds.groups;

                        //ele.set('label', "Switch User: (" + u.value + ")");
                        //dijit.byId('selectInspector').set('value', creds.name + ";" + creds.email);
                        //dijit.byId('selectInspector').set('displayedValue', creds.name);3
                        //dijit.byId('selectInspector').set('disabled', true);
                        //clearTableRow('inspectTable');
                        //map.getLayer('inspections') ? map.getLayer('inspections').clear() : "";

                        if (sender != "changeUser") {
                            document.getElementById('enableJava').style.display = "none";
                            createLegend(map);
                        }
                    }
                    dlg.hide();
                    okBtn.set('label', "Ok");
                    //okBtn.set('disabled', false);
                }
            }
        });

        var dlg = new dijit.Dialog({
            content: form,
            "title": "Enter Username and Password",
            "style": "width: 300px; "
        });

        var message = dojo.create("div", {
            innerHTML: "",
            "class": "authMessage"
        }, dlg.containerNode);
        
        var domain = new dijit.form.Select({
            name: "Domain",
            style: "width:100px;",
            options: [
            { label: "shtown", value: "shtown",  selected: true },
            { label: "shpolice", value: "Shpolice" }
            ]
        }).placeAt(form.containerNode);

        var u = new dijit.form.TextBox({
            value: "",
            placeHolder: "Username"
        }).placeAt(form.containerNode);

        var p = new dijit.form.TextBox({
            value: "",
            type: "password",
            placeHolder: "Password"
        }).placeAt(form.containerNode);

        var actionBar = dojo.create("div", {
            'class': "dijitDialogPaneActionBar"
        });
        
        var okBtn = new dijit.form.Button({
            label: "Ok",
            type: 'submit'
        }).placeAt(actionBar);
       
        new dijit.form.Button({
            "label": "Cancel",
            onClick: function (e) {
                if (sender != "police" && sender != "changeUser") {
                    window.close();
                } else {
                    dlg.hide();
                    dijit.byId('editToggler').set('checked', true);
                }
            }
        }).placeAt(actionBar);
        
        form.domNode.appendChild(actionBar);
        form.startup();
        dlg.startup();
        dlg.show();
    }
}
function changeUser(val, sender) {
    if (document.getElementById('lmUserName').innerHTML != "General User") {
        document.getElementById('lmUserName').innerHTML = "General User";
        document.getElementById('lmUser').value = "General User";
        document.getElementById('lmUserEmail').value = "General User";
        alert("You have been logged out");
        sender.set('label', "Log In");
    } else {
        checkCredentials(val, sender);
    }
}
