<%@ WebHandler Language="C#" Class="Handler" %>

using System;
using System.Web;
using System.Text;

public class Handler : IHttpHandler {

    GovernConnect gc = null;
    
    public void ProcessRequest (HttpContext context) {

        string query = HttpUtility.UrlDecode(context.Request["q"]);
        string pids = HttpUtility.UrlDecode(context.Request["parcelIds"]);
        
        string sender = HttpUtility.UrlDecode(context.Request["sender"]);
        string results = "";
        gc = new GovernConnect(query);
        
        if (sender == "delete") {
            gc.DeleteUserRecords();
            results = gc.LoadPCExternal(pids);
        }
        else if (sender == "add") {
            gc.DeleteUserRecords();
            results = gc.LoadPCExternal(pids);
        }
        else if (sender == "get") {
            results += gc.getPCExternal();
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