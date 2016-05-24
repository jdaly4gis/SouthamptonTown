<%@ WebHandler Language="C#" Class="accela" %>

using System;
using System.Web;
using System.Text;

public class accela : IHttpHandler {

    accela_Module acc;
    public void ProcessRequest (HttpContext context) {
        
        string pids = HttpUtility.UrlDecode(context.Request["id"]);

        acc = new accela_Module();
        context.Response.ContentType = "application/json";
        context.Response.ContentEncoding = Encoding.UTF8;
        context.Response.Write(acc.getAccelaInspections(pids));
        
    }
 
    public bool IsReusable {
        get {
            return false;
        }
    }

}