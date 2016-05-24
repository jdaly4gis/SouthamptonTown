<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "https://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html xmlns="https://www.w3.org/1999/xhtml" >
<head>
<title>Mailing Labels</title>
<script src="tmpl.min.js"></script>

<script type="text/x-tmpl" id="tmpl-demo">
<h3>{%=o.title%}</h3>
<p>Released under the
<a href="{%=o.license.url%}">{%=o.license.name%}</a>.</p> 
<h4>Features</h4>
<ul>
{% for (var i=0; i<o.features.length; i++) { %}
    <li>{%=o.features[i]%}</li>
{% } %}
</ul>
</script>
</head>

<body>
    <form name="aspnetForm" method="post" action="LabelSearch.aspx?p_ids=42454%2c42467%2c42456%2c42437%2c42439%2c42438%2c42468%2c42466&amp;typedata=1" id="aspnetForm">
<div>
<input type="hidden" name="__VIEWSTATE" id="__VIEWSTATE" value="/wEPDwULLTExNDk5OTk1NTBkZPKsZ3AKsJ/N9W6qdshOdm02VfZo" />
</div>

        
<div style="width:800px;height:515px;overflow:auto">
    <table style="width: 800px;" border="0" cellpadding="0" cellspacing="0">
        <tr>
            <td class='print'>473689 296.000-0004-015.000<br>Lawrence Grossenbacher<br>95 N Pearl St<br>Pearl River NY  10965<br><br></td><td class='print'>473689 296.000-0004-016.000<br>Brian L Penney<br>5 Harvard Dr<br>Hampton Bays, NY  11946<br><br></td></tr><td class='print'>473689 296.000-0004-017.000<br>Carl Peter White<br>7 Harvard Dr<br>Hampton Bays, NY  11946<br><br></td><td class='print'>473689 296.000-0004-032.000<br>John Powers<br>441 E 20th St Apt 9F<br>New York, NY  10010<br><br></td></tr><td class='print'>473689 296.000-0004-034.000<br>Josephine S Hand<br>30 Riverside Dr<br>Riverhead NY  11901<br><br></td><td class='print'>473689 296.000-0005-008.000<br>Carlene Devito Meryle (Life Estate)<br>7 Yale Dr<br>Hampton Bays, NY  11946<br><br></td></tr><td class='print'>473689 296.000-0005-009.000<br>Ronald Anthony Spellman (Life Estate)<br>5 Yale Dr<br>Hampton Bays, NY  11946<br><br></td><td class='print'>473689 296.000-0005-010.000<br>Catherine Garity<br>3 Yale Dr<br>Hampton Bays, NY  11946<br><br></td></tr>
        </tr>
        <tr>
        <td colspan="2" style="border-style:none;">
            <p>
                <div style="text-align:center;">
                    <input type="button" value="Print Labels" />
                    <input type="button" value="Download Labels" onclick="window.location.href='/MailingListDownload.ashx?p_ids=42454,42467,42456,42437,42439,42438,42468,42466&typedata=1'" />
                </div>
            </p>
            <p>&nbsp;</p>
            <p>&nbsp;</p>
            <p>&nbsp;</p>
            <p>&nbsp;</p>
            <p>&nbsp;</p>
        </td>
        </tr>
    </table>
</div>

    </form>
</body>
</html>

