<%@ WebHandler Language="C#" Class="inspections" %>

using System;
using System.Web;

public class inspections : IHttpHandler {

    inspection_Module insp = null;
    
    public void ProcessRequest (HttpContext context) {
        string sender = context.Request["sender"];
        string dept = context.Request["dept"];
        string in_ID = context.Request["in_ID"];
        string status = context.Request["status"];
        string notes = context.Request["notes"];
        string user = context.Request["user"];
        string typeCD = context.Request["typeCD"];
        
        insp = new inspection_Module();

        string results = "";
        if (sender == "inspector")
        {
            results = insp.getInspectors(dept);
        }
        else if (sender == "inspection")
        {
            string sDate = context.Request["startDate"];
            string eDate = context.Request["endDate"];
            string inspector = context.Request["inspector"];
            results = insp.getInspections(inspector, dept, sDate, eDate);
        } else if (sender == "inspectType") 
        {
            results = insp.getinspectType(in_ID);
        }
        else if (sender == "updateTypes") {
            results = insp.updateInspectionTypes(notes, status, in_ID, typeCD, user);
        }
        else if (sender == "updateInspections")
        {
            string key = context.Request["keyID"];
            string pm_ID = context.Request["pm_ID"];
            string actStatus = context.Request["actStatus"];
            string canEmail = context.Request["canEmail"];
            string senderEmail = context.Request["senderEmail"];
            string formalName = context.Request["formalName"];
            string comments = context.Request["comments"];
            string statusMessage = context.Request["statusMessage"];
            string inspectorEmail = context.Request["inspectorEmail"];
            string permitType = context.Request["permitType"];
            string permitAddress = context.Request["permitAddress"];
            results = insp.updateInspections(notes, status, in_ID, user, actStatus, pm_ID, key, canEmail, formalName, comments, statusMessage, inspectorEmail, permitType, permitAddress, dept);
        }
        else if (sender == "updateActivityStatus")
        {

            //results = insp.updateActivityStatus(status, pm_ID, user, key);
        }
        else if (sender == "addNewInspectionType") {
            results = insp.insertNewInspectionType(in_ID, typeCD, user);
        }
        else if (sender == "inspectionByPID")
        { 
            string pid = context.Request["id"];
            results = insp.getInspections(pid, dept);
        }
        else if (sender == "getInspectionTypes")
        {
            results = insp.getInspectionTypes(dept);
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