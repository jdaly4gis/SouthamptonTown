<%@ WebHandler Language="C#" Class="GetJSON" %>

using System;
using System.Text;
using System.Web;

public class GetJSON : IHttpHandler {

    DataAccess access = null;

    public void ProcessRequest (HttpContext context) {
        
        string query = HttpUtility.UrlDecode(context.Request["q"]);
        string start = context.Request["start"];
        string type = context.Request["type"];
        string sender = context.Request["sender"];
        string dept = context.Request["dept"];
        string ids = context.Request["ids"];
        string layer = context.Request["layer"];
        string sDate = context.Request["startDate"];
        string eDate = context.Request["endDate"];
        string status = context.Request["status"];
        string hamlet = context.Request["hamlet"];
        
        if (start == null) { start = "0"; }
        if (Convert.ToInt32(start) >= 20)
        {
            string pp = "";
        }
        //if (layer == "Offender_Level_1" || layer == "Offender_Level_2")
        //{
            access = new DataAccess(query, start, sender, type);
        //}
        //else
        //{
        //    access = new DataAccess();
        //}
        
        string results = "";
        if (sender == "parcel")
        {
            results = access.GetParcelResults(type);
        }
        else if (sender == "building")
        {
            results = access.GetBulidingResults(type);
        }
        else if (sender == "sales")
        {
            results = access.GetSaleResults(type);
        }
        else if (sender == "pic")
        {
            results = access.GetPicResults(type);
        }
        else if (sender == "flag")
        {
            //results = access.GetFlagResults(type);
        }
        //else if (sender == "openPermits")
        //{
        //    results = access.GetOpenPermits(dept, type);
        //}
        //else if (sender == "permitTypes")
        //{
        //    results = access.GetPermitTypes(type);
        //}
        //else if (sender == "openPermitsMapExtent")
        //{
        //    results = access.GetOpenPermits(dept, type, ids);
        //}
        else if (sender == "findSales")
        {
            results = access.searchSales(type);
        }
        else if (sender == "arForm")
        {
            results = access.arResults(type);
        }
        else if (sender == "offender")
        {
            results = access.GetOffenderResults(type);
        }
	    else if (sender == "be") {
            results = access.getZoning(ids);
        }
        context.Response.ContentType = "application/json";
        context.Response.ContentEncoding = Encoding.UTF8;

        context.Response.Write(results);
    }

    public bool IsReusable {
        get {
            return false;
        }
    }

}


