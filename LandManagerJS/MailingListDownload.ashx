<%@ WebHandler Language="C#" Class="MailingListDownload" %>

using System;
using System.Web;
using System.IO;
using MailingListHTTPHandler;


public class MailingListDownload : IHttpHandler
{
    ListDownload mlist;

    public void ProcessRequest(HttpContext context)
    {
        string p_ids = context.Request["p_ids"];
        string typedata = context.Request["typedata"];
        

        mlist = new ListDownload(p_ids, typedata);
        MemoryStream mstream = mlist.GetData();

        byte[] byteArray = mstream.ToArray();

        mstream.Flush();
        mstream.Close();

        context.Response.Clear();
        context.Response.AddHeader("Content-Disposition", "attachment; filename=Labels.csv");
        context.Response.AddHeader("Content-Length", byteArray.Length.ToString());
        context.Response.ContentType = "application/octet-stream";
        context.Response.BinaryWrite(byteArray);
    }

    public bool IsReusable
    {
        get
        {
            return false;
        }
    }
}


