<%@ WebHandler Language="C#" Class="DIQ" %>

using System;
using System.Web;
using System.Text;

public class DIQ : IHttpHandler {

    DIQ_Module diq = null;
    public void ProcessRequest (HttpContext context) {

        string sender = context.Request["sender"];
        string field = context.Request["field"];
        //string appSettings = context.Request["appSettings"];

        string results = "";
        
        diq = new DIQ_Module();
        
        //if (sender == "DIQ")
        //{
            results = diq.getDIQ(sender, field);
        //}
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