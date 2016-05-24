using System;
using System.IO;
using System.Text;
using System.Data;
using System.Configuration;
using System.Collections;
using System.Web;
using System.Web.Security;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Web.UI.WebControls.WebParts;
using System.Web.UI.HtmlControls;

public partial class LabelSearch : System.Web.UI.Page
{
    public string all_parcels = null;
    public string parcel_ids = null;
    public string typedata = null;
    public string downloadURL = null;

    protected void Page_Load(object sender, EventArgs e)
    {
        parcel_ids = Request.Params.Get("p_ids");
        typedata = Request.Params.Get("typedata");
        ParcelToUser p2user = new ParcelToUser("noID");

        all_parcels = p2user.GetMailingLabelInfo(parcel_ids, typedata);
        //downloadURL = "window.location.href='/MailingListDownload.ashx?p_ids=1369,1368&typedata=1'";
        //downloadURL = System.Web.HttpUtility.UrlEncode(downloadURL);
    }


}
