<%@ Page Language="C#" AutoEventWireup="true" CodeFile="pictureDownload.aspx.cs" Inherits="pictureDownload" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "https://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html xmlns="https://www.w3.org/1999/xhtml">
    <head id="Head1" runat="server">
        <title></title>
    </head>
    <body style="width:100%; height:100%;" >
        <form runat="server">
            <table style="width: 100%;">
                <tr>
                    <td>
                       Please choose an image to upload
                    </td>
                </tr>
                <tr>
                    <td colspan='2'>
                        <asp:FileUpload ID="FileUpload1" runat="server" />
                    </td>
                </tr>
                <tr>
                    <td colspan='2'>
                        <asp:Button ID="Button1" runat="server" OnClick="Button1_Click" 
                            Text="Upload File" />&nbsp;<br />
                        <br />
                        <asp:Label ID="Label1" runat="server"></asp:Label>
                    </td>
                </tr>
            </table>
        </form>
    </body>
</html>

