using System;
using System.Data;
using System.Collections;
using System.Configuration;
using System.Web;
using System.Web.Security;
using System.Web.UI;
using System.Data.SqlClient;
using System.Web.UI.WebControls;
using System.Web.UI.WebControls.WebParts;
using System.Web.UI.HtmlControls;
using JEncode;
using System.Drawing.Imaging;
using System.Collections.ObjectModel;
using System.Collections.Generic;
using System.Web.Script.Serialization;
using System.Web.Configuration;
using System.Web.SessionState;
using FormsAuth;
using System.Net.Mail;
using System.DirectoryServices;


/// <summary>
/// Summary description for inspections
/// </summary>
public class inspection_Module
{
    string sql;
    object login = null;
    string dept = null;
    string inspector = null;
    string startDate = null;
    string endDate = null;
    string in_ID = null;
string pID = null;
    public SqlConnection conn = null;

    public inspection_Module()
	{
        login = govWebConnection();
       
	}
    private Object govWebConnection()
    {
        string connectionInfo = System.Configuration.ConfigurationManager.AppSettings["inspectionModuleConnection"];
        conn = new SqlConnection(connectionInfo);

        try
        {
            conn.Open();
        }
        catch (Exception e)
        {
            return e;
        }

        return (conn);
    }
    private string getSQLstring(string sender, string field) {
        switch (sender) {
            case "inspections":
                sql = "SELECT     TOP (100) PERCENT dbo.PC_LK_PARCEL_INSP.DEPT, dbo.NA_NAMES.FIRST_NAME, dbo.NA_NAMES.LAST_NAME, dbo.PM_INSPECTIONS.INSPECTION_TIME, dbo.PM_INSPECTIONS.NOTES,  " +
                      "dbo.PM_INSPECTIONS.STATUS, dbo.PM_INSPECTIONS.NA_ID, dbo.PM_INSPECTIONS.IN_ID, dbo._LOCATION.FORMATED_ADDRESS, dbo._LOCATION.CITY, dbo._PCPARCEL.DSBL,  " +
                      "dbo.PC_LK_PARCEL_INSP.P_ID, CONVERT(varchar(10), dbo.PM_INSPECTIONS.INSPECTION_DATE, 101) AS INSPECTION_DATE, dbo.PM_LK_INSP_PERMIT.PM_ID,  " +
                      "dbo.VT_USR_PMTYPE.SHORT_DESC, dbo.VT_USR_PMTYPE.LONG_DESC AS PM_TYPE, dbo.PM_INSPECTIONS.KEY_COUNTER, emailTBL.emailCount, ISNULL(ISNULL(ISNULL(dbo.PM_MASTER.PM_CERTIFICATE, dbo.PM_MASTER.PM_NUMBER), dbo.PM_MASTER.PM_APPLICATION), 'Unknown') AS permitNO " +
                      "  FROM         dbo.PM_INSPECTIONS INNER JOIN " +
                      "dbo.NA_NAMES ON dbo.PM_INSPECTIONS.NA_ID = dbo.NA_NAMES.NA_ID INNER JOIN " +
                      "dbo.PC_LK_PARCEL_INSP ON dbo.PM_INSPECTIONS.IN_ID = dbo.PC_LK_PARCEL_INSP.IN_ID INNER JOIN " +
                      "dbo._LOCATION ON dbo.PC_LK_PARCEL_INSP.P_ID = dbo._LOCATION.P_ID INNER JOIN " +
                      "dbo._PCPARCEL ON dbo.PC_LK_PARCEL_INSP.P_ID = dbo._PCPARCEL.P_ID INNER JOIN " +
                      "dbo.PM_LK_INSP_PERMIT ON dbo.PC_LK_PARCEL_INSP.IN_ID = dbo.PM_LK_INSP_PERMIT.IN_ID INNER JOIN " +
                      "dbo.PM_MASTER ON dbo.PM_LK_INSP_PERMIT.PM_ID = dbo.PM_MASTER.PM_ID INNER JOIN " +
                      "dbo.VT_USR_PMTYPE ON dbo.PM_MASTER.PM_TYPE = dbo.VT_USR_PMTYPE.CODE AND dbo.PC_LK_PARCEL_INSP.DEPT = dbo.VT_USR_PMTYPE.DEPT LEFT OUTER JOIN " +
                      "    (SELECT     TOP (100) PERCENT PM_MASTER_1.PM_ID, COUNT(NA_NAMES_1.EMAIL) AS emailCount "+
                      "      FROM          dbo.PM_MASTER AS PM_MASTER_1 INNER JOIN "+
                      "                             dbo.PM_LK_PERMIT_NAME ON PM_MASTER_1.PM_ID = dbo.PM_LK_PERMIT_NAME.KEY_ID INNER JOIN "+
                      "                             dbo.NA_NAMES AS NA_NAMES_1 ON dbo.PM_LK_PERMIT_NAME.NA_ID = NA_NAMES_1.NA_ID "+
                      "      WHERE      (dbo.PM_LK_PERMIT_NAME.LINK_TYPE IN ('appl', 'age')) AND (dbo.PM_LK_PERMIT_NAME.KEY_TYPE = 'pm') "+
                      "      GROUP BY PM_MASTER_1.PM_ID, NA_NAMES_1.EMAIL " +
                      "      HAVING      (NOT (NA_NAMES_1.EMAIL IS NULL)) AND (NOT (NA_NAMES_1.EMAIL LIKE '%@southamptontow%'))) AS emailTBL ON dbo.PM_MASTER.PM_ID = emailTBL.PM_ID " +
                        "WHERE     (dbo.PC_LK_PARCEL_INSP.DEPT = '" + this.dept + "') AND (dbo.PM_INSPECTIONS.NA_ID = '" + this.inspector + "') AND (CONVERT(datetime, dbo.PM_INSPECTIONS.INSPECTION_DATE, 103) BETWEEN '" + this.startDate + "' AND '" + this.endDate + "')";
                    break;
            case "inspector":
                    sql = "SELECT dbo.PM_INSPECTORS.NA_ID, dbo.PM_INSPECTORS.DEPT_ID, ISNULL(ISNULL(dbo.NA_NAMES.FIRST_NAME + ' ' + dbo.NA_NAMES.MID_INITIAL + ' ' + dbo.NA_NAMES.LAST_NAME, dbo.NA_NAMES.FIRST_NAME + ' ' + dbo.NA_NAMES.LAST_NAME), 'Unknown') AS Name , " +
                               "CASE ISNULL(dbo.NA_NAMES.FIRST_NAME + ' ' + dbo.NA_NAMES.LAST_NAME, 'Unkonwn') " +
                               "WHEN 'David Cange' THEN 1 WHEN 'Thomas Weber' THEN 2 WHEN 'Michael Risolo' THEN 3 WHEN 'Sean McDermott' THEN 4 ELSE 5 END AS InsOrder " +
                             "FROM dbo.PM_INSPECTORS INNER JOIN " +
                             "dbo.NA_NAMES ON dbo.PM_INSPECTORS.NA_ID = dbo.NA_NAMES.NA_ID " +
                             "WHERE (dbo.PM_INSPECTORS.RETIRED IS NULL OR " +
                           "dbo.PM_INSPECTORS.RETIRED = 0) AND (dbo.PM_INSPECTORS.DEPT_ID = '" + this.dept + "') ORDER BY InsOrder , dbo.NA_NAMES.LAST_NAME";
                break;
            case "inspectType":
                sql = "SELECT     dbo.PC_LK_PARCEL_INSP.P_ID, CONVERT(varchar(11), dbo.PM_INSPECTIONS.INSPECTION_DATE, 101) AS INSPECTION_DATE, dbo.PM_INSPECTIONS.STATUS,  " +
                        "dbo.PM_INSPECTIONS.NOTES, dbo.PM_INSPECTIONS.IN_ID, dbo.VT_USR_INSPECT.LONG_DESC AS IN_TYPE, dbo.VT_USR_INSPECT.DEPT,  " +
                        "dbo.PM_LK_INSP_TYPE.STATUS AS itStatus, dbo.PM_LK_INSP_TYPE.NOTES AS itNotes, dbo.PM_INSPECTIONS.KEY_COUNTER,  " +
                        "dbo.PM_LK_INSP_TYPE.IN_TYPE AS IN_TYPE_CD, dbo.PM_LK_INSP_PERMIT.PM_ID, dbo.PM_MASTER.PM_NUMBER " +
                        "FROM         dbo.PM_MASTER INNER JOIN " +
                        "dbo.PC_LK_PARCEL_INSP INNER JOIN " +
                        "dbo.PM_LK_INSP_PERMIT INNER JOIN " +
                        "dbo.PM_INSPECTIONS ON dbo.PM_LK_INSP_PERMIT.IN_ID = dbo.PM_INSPECTIONS.IN_ID ON dbo.PC_LK_PARCEL_INSP.IN_ID = dbo.PM_INSPECTIONS.IN_ID ON  " +
                        "dbo.PM_MASTER.PM_ID = dbo.PM_LK_INSP_PERMIT.PM_ID LEFT OUTER JOIN " +
                        "dbo.PM_LK_INSP_TYPE INNER JOIN " +
                        "dbo.VT_USR_INSPECT ON dbo.PM_LK_INSP_TYPE.IN_TYPE = dbo.VT_USR_INSPECT.CODE ON dbo.PC_LK_PARCEL_INSP.DEPT = dbo.VT_USR_INSPECT.DEPT AND  " +
                        "dbo.PM_INSPECTIONS.IN_ID = dbo.PM_LK_INSP_TYPE.IN_ID " +
                      "WHERE (dbo.PM_INSPECTIONS.IN_ID = " + this.in_ID + ")";
                break;
            case "updateInspectionType":
                sql = "";
                break;
            case "inspectionsByPID":
                sql = "SELECT     TOP (100) PERCENT dbo.PM_INSPECTIONS.NOTES as Notes, " +
                    "dbo.PM_INSPECTIONS.IN_ID as [Inspection ID], dbo.PC_LK_PARCEL_INSP.P_ID, CONVERT(varchar(10), dbo.PM_INSPECTIONS.INSPECTION_DATE, 101) AS [Inspection Date],  " +
                    "dbo.VT_USR_PMTYPE.LONG_DESC AS [Permit Type], " +
                    "dbo.NA_NAMES.LAST_NAME + ', ' + dbo.NA_NAMES.FIRST_NAME AS Inspector, dbo.VT_USR_PMTYPE.SHORT_DESC, CASE STATUS WHEN 'c' THEN 'Complete' WHEN 'v' THEN 'Void' WHEN 's' THEN 'Scheduled' WHEN 'u' THEN 'Unscheduled' END AS Status, ISNULL(ISNULL(ISNULL(dbo.PM_MASTER.PM_CERTIFICATE, dbo.PM_MASTER.PM_NUMBER), dbo.PM_MASTER.PM_APPLICATION), 'Unknown') AS permitNO " +
                    " FROM         dbo.PM_INSPECTIONS INNER JOIN " +
                    "dbo.NA_NAMES ON dbo.PM_INSPECTIONS.NA_ID = dbo.NA_NAMES.NA_ID INNER JOIN " +
                    "dbo.PC_LK_PARCEL_INSP ON dbo.PM_INSPECTIONS.IN_ID = dbo.PC_LK_PARCEL_INSP.IN_ID INNER JOIN " +
                    "dbo.PM_LK_INSP_PERMIT ON dbo.PC_LK_PARCEL_INSP.IN_ID = dbo.PM_LK_INSP_PERMIT.IN_ID INNER JOIN " +
                    "dbo.PM_MASTER ON dbo.PM_LK_INSP_PERMIT.PM_ID = dbo.PM_MASTER.PM_ID INNER JOIN " +
                    "dbo.VT_USR_PMTYPE ON dbo.PM_MASTER.PM_TYPE = dbo.VT_USR_PMTYPE.CODE AND dbo.PC_LK_PARCEL_INSP.DEPT = dbo.VT_USR_PMTYPE.DEPT " +
                    "WHERE     (dbo.PC_LK_PARCEL_INSP.DEPT =  " + this.dept + ") AND (dbo.PC_LK_PARCEL_INSP.P_ID = " + this.pID +")" + 
                    "ORDER BY dbo.PM_INSPECTIONS.INSPECTION_DATE DESC";
                break;
        }
        return sql;
    }
    public static string RemoveLineEndings(string value)
    {
        if (String.IsNullOrEmpty(value))
        {
            return value;
        }
        string lineSeparator = ((char)0x2028).ToString();
        string paragraphSeparator = ((char)0x2029).ToString();

        return value.Replace("\r\n", string.Empty).Replace("\n", string.Empty).Replace("\r", string.Empty).Replace(lineSeparator, string.Empty).Replace(paragraphSeparator, string.Empty);
    }
    public string getInspectors(string dept)
    {
        this.dept = dept;
        string sql = this.getSQLstring("inspector", "");
        DataTable dt = new DataTable();
        SqlCommand command = new SqlCommand(sql, conn);
        SqlDataAdapter adapter = new SqlDataAdapter(command);
        try
        {
            adapter.Fill(dt);
        }
        finally
        {
            conn.Close();
        }

        string[] tblJson = null;
        tblJson = new string[dt.Rows.Count];
        string returnString = "";
        string jsonString = null;
        string header = "{\"identifier\": \"NA_ID\", \"label\": \"Name\", \"items\": [";
        string trailer = "]}";
        if (dt.Rows.Count != 0)
        {
            int ncount = 0;
            foreach (DataRow row in dt.Rows)
            {
                Hashtable taxTable = new Hashtable();
                //taxTable.Add("ID", ncount);
                foreach (DataColumn dc in dt.Columns)
                {
                    taxTable.Add(dc.ColumnName, row[dc.ColumnName].ToString());

                }
                jsonString = JSON.JsonEncode(taxTable);

                tblJson[ncount] = jsonString;
                ncount = ncount + 1;

            }
            returnString = header + String.Join(",", tblJson) + trailer;
        }
        else
        {
            returnString = "{\"items\": []}";
        }
        //finalJSON[tabcount] = tblString = String.Join(",", tblJson);
        dt.Dispose();
        return returnString;
    }
    public string getInspections(string inspector, string dept, string sDate, string eDate) 
    {
        this.dept = dept;
        this.inspector = inspector;
        this.startDate = sDate;
        this.endDate = eDate;
        string sql = this.getSQLstring("inspections", "");
        string statusTypes = "";
        DataTable dt = new DataTable();
        SqlCommand command = new SqlCommand(sql, conn);
        SqlDataAdapter adapter = new SqlDataAdapter(command);
        try
        {
            adapter.Fill(dt);
            statusTypes = getInspectionStatusTypes(this.dept);
        }
        finally
        {
            conn.Close();
        }

        string[] tblJson = null;
        tblJson = new string[dt.Rows.Count + 1];
        string returnString = "";
        string jsonString = null;
        string header = "{\"label\": \"INSPECTION_DATE\", \"items\": [";
        string trailer = "]}";
        if (dt.Rows.Count != 0)
        {
            int ncount = 0;
            foreach (DataRow row in dt.Rows)
            {
                Hashtable taxTable = new Hashtable();
                //taxTable.Add("ID", ncount);
                foreach (DataColumn dc in dt.Columns)
                {
                    taxTable.Add(dc.ColumnName, row[dc.ColumnName].ToString());
                }
                jsonString = JSON.JsonEncode(taxTable);

                tblJson[ncount] = jsonString;
                ncount = ncount + 1;

            }
            tblJson[dt.Rows.Count] = statusTypes;
            returnString = header + String.Join(",", tblJson) + trailer;
        }
        else
        {
            returnString = "{\"items\": []}";
        }
        //finalJSON[tabcount] = tblString = String.Join(",", tblJson);
        dt.Dispose();
        return returnString;
    }
    public string getInspections(string pid, string dept) {
        this.pID = pid;
	this.dept = dept;
        string sql = this.getSQLstring("inspectionsByPID", "");
        DataTable dt = new DataTable();
        SqlCommand command = new SqlCommand(sql, conn);
        SqlDataAdapter adapter = new SqlDataAdapter(command);
        try
        {
            adapter.Fill(dt);
        }
        finally
        {
            conn.Close();
        }

        string[] tblJson = null;
        tblJson = new string[dt.Rows.Count];
        string returnString = "";
        string jsonString = null;
        string header = "{\"items\": [";
        string trailer = "]}";
        if (dt.Rows.Count != 0)
        {
            int ncount = 0;
            foreach (DataRow row in dt.Rows)
            {
                Hashtable taxTable = new Hashtable();
                foreach (DataColumn dc in dt.Columns)
                {
                    taxTable.Add(dc.ColumnName, row[dc.ColumnName].ToString());
                }

                taxTable["inspectionTypes"] = getinspectType(row["Inspection ID"].ToString());
                jsonString = JSON.JsonEncode(taxTable);

                tblJson[ncount] = jsonString;
                ncount = ncount + 1;

            }
            returnString = header + String.Join(",", tblJson) + trailer;
        }
        else
        {
            returnString = "{\"items\": []}";
        }
        dt.Dispose();
        return returnString;
    }
    public string getinspectType(string in_ID)
    {
        this.in_ID = in_ID;
        string sql = this.getSQLstring("inspectType", "");
        DataTable dt = new DataTable();
        SqlCommand command = new SqlCommand(sql, conn);
        SqlDataAdapter adapter = new SqlDataAdapter(command);
        try
        {
            adapter.Fill(dt);
        }
        finally
        {
            conn.Close();
        }

        string[] tblJson = null;
        tblJson = new string[dt.Rows.Count];
        string returnString = "";
        string jsonString = null;
        string header = "{\"label\": \"IN_TYPE\", \"items\": [";
        string trailer = "]}";
        if (dt.Rows.Count != 0)
        {
            int ncount = 0;
            foreach (DataRow row in dt.Rows)
            {
                Hashtable taxTable = new Hashtable();
                //taxTable.Add("ID", ncount);
                foreach (DataColumn dc in dt.Columns)
                {
                    taxTable.Add(dc.ColumnName, row[dc.ColumnName].ToString());

                }
                jsonString = JSON.JsonEncode(taxTable);

                tblJson[ncount] = jsonString;
                ncount = ncount + 1;

            }
            returnString = header + String.Join(",", tblJson) + trailer;
        }
        else
        {
            returnString = "{\"items\": []}";
        }
        //finalJSON[tabcount] = tblString = String.Join(",", tblJson);
        dt.Dispose();
        return returnString;
    }
    public string getInspectionStatusTypes(string dept)
    {
       
        string sql = "SELECT CODE, LONG_DESC FROM dbo.VT_USR_PMINTYST WHERE (DEPT = '" + dept + "')";
        DataTable dt = new DataTable();
        SqlCommand command = new SqlCommand(sql, conn);
        SqlDataAdapter adapter = new SqlDataAdapter(command);
        try
        {
            adapter.Fill(dt);
        }
        finally
        {
            conn.Close();
        }

        string[] tblJson = null;
        tblJson = new string[dt.Rows.Count];
        string returnString = "";
        string jsonString = null;
        string header = "{\"items\": [";
        string trailer = "]}";
        if (dt.Rows.Count != 0)
        {
            int ncount = 0;
            foreach (DataRow row in dt.Rows)
            {
                Hashtable taxTable = new Hashtable();
                //taxTable.Add("ID", ncount);
                foreach (DataColumn dc in dt.Columns)
                {
                    taxTable.Add(dc.ColumnName, row[dc.ColumnName].ToString());

                }
                jsonString = JSON.JsonEncode(taxTable);

                tblJson[ncount] = jsonString;
                ncount = ncount + 1;

            }
            returnString = header + String.Join(",", tblJson) + trailer;
        }
        else
        {
            returnString = "{\"items\": []}";
        }
        dt.Dispose();
        return returnString;
    }
    public string getInspectionTypes(string dept)
    {
        string sql = "SELECT CODE, LONG_DESC FROM dbo.VT_USR_INSPECT WHERE (DEPT = '" + dept + "')";
        DataTable dt = new DataTable();
        SqlCommand command = new SqlCommand(sql, conn);
        SqlDataAdapter adapter = new SqlDataAdapter(command);
        try
        {
            adapter.Fill(dt);
        }
        finally
        {
            conn.Close();
        }

        string[] tblJson = null;
        tblJson = new string[dt.Rows.Count];
        string returnString = "";
        string jsonString = null;
        string header = "{\"items\": [";
        string trailer = "]}";
        if (dt.Rows.Count != 0)
        {
            int ncount = 0;
            foreach (DataRow row in dt.Rows)
            {
                Hashtable taxTable = new Hashtable();
                //taxTable.Add("ID", ncount);
                foreach (DataColumn dc in dt.Columns)
                {
                    taxTable.Add(dc.ColumnName, row[dc.ColumnName].ToString());

                }
                jsonString = JSON.JsonEncode(taxTable);

                tblJson[ncount] = jsonString;
                ncount = ncount + 1;

            }
            returnString = header + String.Join(",", tblJson) + trailer;
        }
        else
        {
            returnString = "{\"items\": []}";
        }
        dt.Dispose();
        return returnString;
    }
    public static string DataTableToJSON(DataTable table)
    {
        List<Dictionary<string, object>> list = new List<Dictionary<string, object>>();

        foreach (DataRow row in table.Rows)
        {
            Dictionary<string, object> dict = new Dictionary<string, object>();

            foreach (DataColumn col in table.Columns)
            {
                dict[col.ColumnName] = row[col];
            }
            list.Add(dict);
        }
        JavaScriptSerializer serializer = new JavaScriptSerializer();
        return serializer.Serialize(list);
    }
    public string updateInspectionTypes(string notes, string status, string id, string type, string user) 
    {
        string returnString = null;

        string d = DateTime.Now.ToString("MM/dd/yyyy");

        string sql = "update dbo.PM_LK_INSP_TYPE set STATUS = '" + status + "', NOTES = '" + notes.Replace("'", "''") + "', LAST_MODIF_DATE= '" + d + "', LAST_MODIF_UID = '" + user + "' where (IN_ID = " + id + ") and (IN_TYPE = '" + type + "')";

        SqlCommand comm = new SqlCommand(sql, conn);
        int r;
        try
        {
            r = comm.ExecuteNonQuery();
        }
        finally
        {
            conn.Close();
        }
        
        if (r > 0) {
            returnString = "yes";
        } else {
            returnString = "no";
        }
        return returnString;
    }
    public string updateInspections(string notes, string status, string id, string user, string actStatus, string pm_id, string key, string canEmail, string formalName, string comments, string statusMessage, string inspectorEmail, string permitType, string permitAddress, string dept)
    {
        string returnString = "yes";
        string d = DateTime.Now.ToString("MM/dd/yyyy");
        string sql1 = "update dbo.PM_INSPECTIONS set STATUS = '" + status + "', NOTES = '" + notes.Replace("'", "''") + "', LAST_MODIF_DATE= '" + d + "', LAST_MODIF_UID = '" + user + "' where (IN_ID = " + id + ")";

        string sql2 = "update dbo.PC_LK_PARCEL_INSP set LAST_MODIF_DATE= '" + d + "', LAST_MODIF_UID = '" + user + "' where (IN_ID = " + id + ")";

        string sql3 = "update dbo.PM_ACTIVITY_STATUS set COMPLETION_STATUS = '" + actStatus + "', COMPLETION_DATE = '" + d + "', LAST_MODIF_UID = '" + user + "', LAST_MODIF_DATE = '" + d + "'  where (KEY_ID = " + pm_id + ") and (Key_COUNTER = " + key + ")";

        int r =0;
        SqlCommand comm1 = new SqlCommand(sql1, conn);
        r += comm1.ExecuteNonQuery();

        SqlCommand comm2 = new SqlCommand(sql2, conn);
        r += comm2.ExecuteNonQuery();

        SqlCommand comm3 = new SqlCommand(sql3, conn);
        r += comm3.ExecuteNonQuery();
        if (r > 2)
        {
            if (canEmail == "true") {
                string sql = "SELECT     TOP (100) PERCENT PM_MASTER_1.PM_ID, NA_NAMES_1.EMAIL, ISNULL(ISNULL(PM_MASTER_1.PM_NUMBER, PM_MASTER_1.PM_APPLICATION), PM_MASTER_1.PM_CERTIFICATE) AS no, ISNULL(NA_NAMES_1.COMPANY, NA_NAMES_1.FIRST_NAME + ' ' + NA_NAMES_1.LAST_NAME) as Name " +
                              "  FROM         dbo.PM_MASTER AS PM_MASTER_1 INNER JOIN "+
                               "                       dbo.PM_LK_PERMIT_NAME ON PM_MASTER_1.PM_ID = dbo.PM_LK_PERMIT_NAME.KEY_ID INNER JOIN "+
                               "                       dbo.NA_NAMES AS NA_NAMES_1 ON dbo.PM_LK_PERMIT_NAME.NA_ID = NA_NAMES_1.NA_ID "+
                               " WHERE     (dbo.PM_LK_PERMIT_NAME.LINK_TYPE IN ('appl', 'age')) AND (dbo.PM_LK_PERMIT_NAME.KEY_TYPE = 'pm') AND (NOT (NA_NAMES_1.EMAIL IS NULL)) AND  "+
                                "                      (NOT (NA_NAMES_1.EMAIL LIKE '%@southamptontow%')) AND (PM_MASTER_1.PM_ID = " + pm_id + ")";

                DataTable dt = new DataTable();
                SqlCommand command = new SqlCommand(sql, conn);
                SqlDataAdapter adapter = new SqlDataAdapter(command);
                try
                {
                    adapter.Fill(dt);
                }
                finally
                {
                    conn.Close();
                }

                
                if (dt.Rows.Count != 0)
                {

                string [] eAddress = new string[dt.Rows.Count];
                string [] eName = new string[dt.Rows.Count];
                int i = 0;

                    foreach (DataRow row in dt.Rows)
                    {
                        eAddress[i] = row["EMAIL"].ToString();
                        eName[i] = row["Name"].ToString();
                        i++;
                    }
                    
                    string mail = sendEmail(formalName, String.Join(";", eAddress), String.Join(",", eName), dt.Rows[0]["no"].ToString(), status, comments, statusMessage, inspectorEmail, permitType, permitAddress, dept);
                    if (mail == "t")
                    {
                        returnString = "yes mail";
                    }
                    else {
                        returnString = "no mail";
                    }
                }

            }
            
        }
        else
        {
            returnString = "no";
            conn.Close();
        }
        return returnString;
    }
    public string insertNewInspectionType(string id, string type, string user)
    {
        string returnString = null;

        string d = DateTime.Now.ToString("MM/dd/yyyy");

        string[] types = type.Split(',');

        int r = 0;
        try
        {
            foreach (string t in types)
            {
                string sql = "insert into dbo.PM_LK_INSP_TYPE (IN_ID, IN_TYPE, LAST_MODIF_UID, LAST_MODIF_DATE) values (" + id + ",'" + t + "', '" + user + "','" + d + "')";
                SqlCommand comm = new SqlCommand(sql, conn);
                r += comm.ExecuteNonQuery();
            }
            if (r > 0)
            {
                returnString = "yes";
            }
            else
            {
                returnString = "no";
            }
        }
        finally
        {
            conn.Close();
        }
        return returnString;
    }

    private string sendEmail(string formalName, string recieverEmail, string recieverName, string permitNo, string status, string corrections, string statusMessage, string inspectorEmail, string permitType, string permitAddress, string dept) {
        string mailsent = "false";
        try
        {
            MailMessage mMailMessage = new MailMessage();
            mMailMessage.From = new MailAddress("NoReplyShtown@southamptontownny.gov");

            mMailMessage.To.Add(recieverEmail);
            
            mMailMessage.Bcc.Add(inspectorEmail);
            
            //set subject
            mMailMessage.Subject = "Southampton Town - " + permitNo;

            //set email body
            
            string d = DateTime.Now.ToString("MM/dd/yyyy");
            string c = corrections == "" ? "N/A" : corrections;
            string statusParagraph = recieverName + ":\n\nThis message is to inform you about the recent " + permitType + " inspection at " + permitAddress + " regarding Reciept/Application/Permit No." + permitNo + 
                ".  The following items have been updated in The Town database: \n\n" + statusMessage + "\n\nPlease take the following actions: " +  c +
                "\n\nIf you have any questions please call the Town of Southampton (631)283-6000\n\n" + formalName + " was your inspector.";
            string note = dept == "02" ? "NOTE: ALL FRAMING, PLUMBING AND ELECTRIC INSPECTIONS MUST BE APPRVOVED PRIOR TO INSULATING AND SHEETROCK" : "";

            string[] mailArr = new string[] { d, statusParagraph, note };
            string all = String.Join("\n\n", mailArr);

            mMailMessage.Body = all;

            // check email type HTML or NOT
            mMailMessage.IsBodyHtml = false;

            // define new SMTP mail client
            SmtpClient mSmtpClient = new SmtpClient();

            //send email using defined SMTP client
            mSmtpClient.Send(mMailMessage);
            mailsent = "t";
        }
        catch (Exception e) {
            mailsent = "f";
        }
        return mailsent;
    }
    //static string GetMail(string user)
    //{
    //    using (var connection = new DirectoryEntry())
    //    {
    //        using (var search = new DirectorySearcher(connection)
    //        {
    //            Filter = "(samaccountname=" + user + ")",
    //            PropertiesToLoad = { "mail" },
    //        })
    //        {
    //            return (string)search.FindOne().Properties["mail"][0];
    //        }
    //    }
    //}
}