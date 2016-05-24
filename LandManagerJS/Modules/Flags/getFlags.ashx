<%@ WebHandler Language="C#" Class="GetJSON" %>

using System;
using System.Text;
using System.Web;

public class GetJSON : IHttpHandler {

    PropertyFlags pFlags = null;

    public void ProcessRequest (HttpContext context) {
        
        string p_ID = context.Request["p_ID"];
        string sender = context.Request["sender"];
        string dept = context.Request["dept"];

        pFlags = new PropertyFlags();

        
        string results = "";
        if (sender == "flag")
        {
            results = pFlags.GetFlagResults(p_ID);
        }
        else if (sender == "showAllflag")
        {
            results = pFlags.showAllFlags(dept);
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


