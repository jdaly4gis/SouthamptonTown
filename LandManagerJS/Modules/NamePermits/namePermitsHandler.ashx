<%@ WebHandler Language="C#" Class="namePermitsHandler" %>

using System;
using System.Web;

public class namePermitsHandler : IHttpHandler {

    namePermits permits = null;
    
    public void ProcessRequest (HttpContext context) {

        string dept = context.Request["dept"];
        string value = context.Request["value"];
        string type = context.Request["type"];
        string start = context.Request["start"];
        string count = context.Request["count"];
        string sender = context.Request["sender"];
        
        string results = "";
        if (sender == "namePermitsearch") {
            permits = new namePermits(value, start, count);
            results = permits.namePermitSearch(type, dept);
        }
        else if (sender == "loadNamePermitTypes")
        {
            permits = new namePermits(value, start, count);
            results = permits.loadPermitAndNameInfo(type, dept);
        }
        
        context.Response.ContentType = "application/json";
        context.Response.ContentEncoding = System.Text.Encoding.UTF8;

        context.Response.Write(results);  
    }
 
    public bool IsReusable {
        get {
            return false;
        }
    }

}