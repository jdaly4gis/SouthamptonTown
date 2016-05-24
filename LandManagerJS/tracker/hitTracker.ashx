<%@ WebHandler Language="C#" Class="hitTracker" %>

using System;
using System.Web;

public class hitTracker : IHttpHandler {

    tracker track = new tracker();
    
    public void ProcessRequest (HttpContext context) {
        track.insertHitCount(System.Web.HttpContext.Current.Request.UserHostAddress);
    }
 
    public bool IsReusable {
        get {
            return false;
        }
    }

}