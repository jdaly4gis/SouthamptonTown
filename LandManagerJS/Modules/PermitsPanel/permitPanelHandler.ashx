<%@ WebHandler Language="C#" Class="permitPanelHandler" %>

using System;
using System.Text;
using System.Web;
using System.IO;
using permitsPanelData;

public class permitPanelHandler : IHttpHandler {
    
    permitsPanel access = null;

    public void ProcessRequest(HttpContext context)
    {
        string type = context.Request["type"];
        string sender = context.Request["sender"];
        string dept = context.Request["dept"];
        string ids = context.Request["ids"];
        string page = context.Request["page"];
        string pageSize = context.Request["pageSize"];
                
        string status = context.Request["status"];
        string hamlet = context.Request["hamlet"];

        string results = "";
        access = new permitsPanel();
        
        if (sender == "openPermits")
        {
            results = access.GetOpenPermits(dept, type, Convert.ToInt32(page), Convert.ToInt32(pageSize), hamlet, status);
        }
        else if (sender == "permitTypes")
        {
            results = access.GetPermitTypes(type);
        }
        if (sender == "exportPermits")
        {
            System.IO.MemoryStream mstream = access.getPermitsForDownload(dept, type, Convert.ToInt32(page), Convert.ToInt32(pageSize), hamlet, status);
            byte[] byteArray = mstream.ToArray();

            mstream.Flush();
            mstream.Close();

            context.Response.Clear();
            context.Response.AddHeader("Content-Disposition", "attachment; filename="  + type + "_" + hamlet + "_permits.csv");
            context.Response.AddHeader("Content-Length", byteArray.Length.ToString());
            context.Response.ContentType = "application/octet-stream";
            context.Response.BinaryWrite(byteArray);
        }
        else {
            context.Response.ContentType = "application/json";
            context.Response.ContentEncoding = Encoding.UTF8;
            context.Response.Write(results);
        }

    }
 
    public bool IsReusable {
        get {
            return false;
        }
    }

}