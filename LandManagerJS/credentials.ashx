<%@ WebHandler Language="C#" Class="credentials" %>

using System;
using System.Web;
using System.DirectoryServices;
using FormsAuth;
using System.Text;

public class credentials : IHttpHandler {

    public void ProcessRequest (HttpContext context) {
        string u = HttpUtility.UrlDecode(context.Request["user"]);
        string p = HttpUtility.UrlDecode(context.Request["pass"]);
        string sender = HttpUtility.UrlDecode(context.Request["sender"]);
        string results = "";
        string d = HttpUtility.UrlDecode(context.Request["d"]);
                
        string isOnLAN = "False";
        if (sender == "init")
        {
            string IPAddress = string.Empty;
            string SearchName = string.Empty;

            string[] ipList = new string[] { "10.", "166.143.", "166.148.", "208.87.233.180", "24.187.253.195", "70.192.80.92", "65.51.179.193"/*, "127.0.0.1" */};

            for (int x = 0; x < ipList.Length; x++)
            {
                if (System.Web.HttpContext.Current.Request.UserHostAddress.StartsWith(ipList[x]))
                {
                    isOnLAN = "True";
                    break;
                }
            }
            results = "{\"items\":\"" + isOnLAN + "\"}";
        }
        else if (sender == "cred" || sender == "changeUser")
        {
            LdapAuthentication auth = new LdapAuthentication("LDAP://proliantdc.shtown.local");
            //bool aa = auth.IsAuthenticated("shtown", u, p);
            //if (u.ToUpper() == "LANDMAN" && p == "landMan1")
            //{
            results = auth.IsAuthenticated(d.ToString(), u.ToString(), p.ToString());
            //results = "{\"items\":\"" + d.ToString() + " " + u.ToString() + " " + p.ToString() + "\"}";
            //}
            //else
            //{
            //    results = "{\"items\":\"false\"}";
            //}

        }
        else if (sender == "police")
        {
            if (u.ToUpper() == "POLICE" && p == "PoliceInfo116")
            {
                results = "{\"items\":\"true\"}";
            }
            else
            {
                results = "{\"items\":\"false\"}";
            }
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