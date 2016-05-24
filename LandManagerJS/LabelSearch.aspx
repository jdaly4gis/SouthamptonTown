<%@ Page Language="C#" MasterPageFile="~/MailingLabel.master" AutoEventWireup="true" CodeFile="LabelSearch.aspx.cs" Inherits="LabelSearch" Title="Mailing Labels" %>
<asp:Content ID="Content1" ContentPlaceHolderID="ContentPlaceHolder1" Runat="Server">
    <div style="width:8.5in;height:auto;overflow:auto"  class="print">
        <table style="width: 800px;" border="0" cellpadding="0" cellspacing="0">
            <tr>
                <%= all_parcels %>
            </tr>
        </table>
    </div>
    <table style="text-align:center;"  class="screen">
        <tr>
            <td style="border-style:none;">

                <div >
                <div style="color: red; font-family: 'Arial'; font-size: x-small; width: 100%;">Labels are in Avery 5161 1" x 4" format</div><br/>
                    <input type="button" value="Print Labels" onclick="window.print()"/>
                    <input type="button" value="Download Labels" onclick="window.location.href='MailingListDownload.ashx?p_ids=<%= parcel_ids %>&typedata=1'" />
                </div>
    
                <p>&nbsp;</p>
                <p>&nbsp;</p>
                <p>&nbsp;</p>
                <p>&nbsp;</p>
                <p>&nbsp;</p>
            </td>
        </tr>
    </table>
</asp:Content>
