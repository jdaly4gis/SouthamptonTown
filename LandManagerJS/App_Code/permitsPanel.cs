using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Data.SqlClient;
using System.Data;
using System.Web.Script.Serialization;
using JEncode;
using System.Collections;
using System.IO;

/// <summary>
/// Summary description for permitsPanel
/// </summary>
namespace permitsPanelData
{
    public class permitsPanel : IHttpHandler
    {
        string sql;
        public SqlConnection conn = null;

        object login = null;
        string parcelID = null;
        string dept = null;
        string permitType = null;
        int page = 0;
        int pageSize = 0;
        string hamlet = null;
        string status = null;


        private Object govWebConnection()
        {
            string connectionInfo = System.Configuration.ConfigurationManager.AppSettings["governConnect"];
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
        public permitsPanel()
        {
            login = govWebConnection();
        }
        private string GetSearchType(string searchType)
        {
            switch (searchType)
            {
                case "permits":
                    sql = "SELECT     TOP (" + this.pageSize + ") PC_LK_PARCEL_PM.P_ID AS [Parcel ID], PM_MASTER.PM_ID, VT_USR_PMTYPE.LONG_DESC AS [Permit Type], CONVERT(varchar(11), PM_MASTER.EXPIRATION_DATE) " +
                           " AS [Expiration Date], PM_MASTER.PM_APPLICATION AS [Application No], CONVERT(varchar(11), PM_MASTER.APPLICATION_DATE) AS [Application Date], PM_MASTER.PM_NUMBER AS [Permit No],  " +
                           " CONVERT(varchar(11), PM_MASTER.PERMIT_DATE) AS [Permit Date], PM_MASTER.PM_CERTIFICATE AS [Certificate No], CONVERT(varchar(11), PM_MASTER.CERTIFICATE_DATE)  " +
                           " AS [Certificate Date], VT_USR_PMTYPE.DEPT, PC_ADDRESS_2.CITY, " +
                           "     (SELECT     COUNT(*) AS Expr1 " +
                           "     FROM          (SELECT     PM_MASTER.PM_ID " +
                           "                             FROM          dbo.PC_LK_PARCEL_PM AS PC_LK_PARCEL_PM INNER JOIN " +
                           "                                                     dbo.PM_MASTER AS PM_MASTER ON PC_LK_PARCEL_PM.KEY_ID = PM_MASTER.PM_ID INNER JOIN " +
                           "                                                     dbo.VT_USR_PMTYPE AS VT_USR_PMTYPE ON PM_MASTER.PM_TYPE = VT_USR_PMTYPE.CODE INNER JOIN " +
                           "                                                     dbo.VT_USR_DEPART ON PC_LK_PARCEL_PM.DEPT = dbo.VT_USR_DEPART.CODE AND VT_USR_PMTYPE.DEPT = dbo.VT_USR_DEPART.CODE INNER JOIN " +
                           "                                                     dbo.PC_ADDRESS ON PC_LK_PARCEL_PM.P_ID = dbo.PC_ADDRESS.P_ID " +
                           "                             WHERE      (PC_LK_PARCEL_PM.KEY_TYPE = 'pm') AND (PM_MASTER.VOID > - 1 OR " +
                           "                                                     PM_MASTER.VOID IS NULL) AND (VT_USR_PMTYPE.LONG_DESC LIKE '" + this.permitType + "%') AND (dbo.PC_ADDRESS.CITY LIKE '" + this.hamlet + "%') and (PC_LK_PARCEL_PM.DEPT IN (" + this.dept + ")) ) AS derivedtbl_1) AS totalCount " +
                           " FROM         dbo.PC_LK_PARCEL_PM AS PC_LK_PARCEL_PM INNER JOIN " +
                           " dbo.PM_MASTER AS PM_MASTER ON PC_LK_PARCEL_PM.KEY_ID = PM_MASTER.PM_ID INNER JOIN " +
                           " dbo.VT_USR_PMTYPE AS VT_USR_PMTYPE ON PM_MASTER.PM_TYPE = VT_USR_PMTYPE.CODE INNER JOIN " +
                           " dbo.VT_USR_DEPART AS VT_USR_DEPART_2 ON PC_LK_PARCEL_PM.DEPT = VT_USR_DEPART_2.CODE AND VT_USR_PMTYPE.DEPT = VT_USR_DEPART_2.CODE INNER JOIN " +
                           " dbo.PC_ADDRESS AS PC_ADDRESS_2 ON PC_LK_PARCEL_PM.P_ID = PC_ADDRESS_2.P_ID " +
                           " WHERE     (PC_LK_PARCEL_PM.KEY_TYPE = 'pm') AND (PM_MASTER.VOID > - 1 OR " +
                           " PM_MASTER.VOID IS NULL) AND (VT_USR_PMTYPE.LONG_DESC LIKE '" + this.permitType + "%') AND (PC_ADDRESS_2.CITY LIKE '" + this.hamlet + "%') AND (NOT (PM_MASTER.PM_ID IN " +
                           "     (SELECT     TOP (" + this.page + "*" + this.pageSize + ") PM_MASTER.PM_ID " +
                           "     FROM          dbo.PC_LK_PARCEL_PM AS PC_LK_PARCEL_PM INNER JOIN " +
                           "                             dbo.PM_MASTER AS PM_MASTER ON PC_LK_PARCEL_PM.KEY_ID = PM_MASTER.PM_ID INNER JOIN " +
                           "                             dbo.VT_USR_PMTYPE AS VT_USR_PMTYPE ON PM_MASTER.PM_TYPE = VT_USR_PMTYPE.CODE INNER JOIN " +
                           "                             dbo.VT_USR_DEPART AS VT_USR_DEPART_1 ON PC_LK_PARCEL_PM.DEPT = VT_USR_DEPART_1.CODE AND VT_USR_PMTYPE.DEPT = VT_USR_DEPART_1.CODE INNER JOIN " +
                           "                             dbo.PC_ADDRESS AS PC_ADDRESS_1 ON PC_LK_PARCEL_PM.P_ID = PC_ADDRESS_1.P_ID " +
                           "     WHERE      (PC_LK_PARCEL_PM.KEY_TYPE = 'pm') AND (PM_MASTER.VOID > - 1 OR " +
                           "                             PM_MASTER.VOID IS NULL) AND (VT_USR_PMTYPE.LONG_DESC LIKE '" + this.permitType + "%') AND (PC_ADDRESS_1.CITY LIKE '" + this.hamlet + "%') and (PC_LK_PARCEL_PM.DEPT IN (" + this.dept + ")) " +
                            "    ORDER BY PM_MASTER.PM_ID, PC_LK_PARCEL_PM.P_ID))) and (PC_LK_PARCEL_PM.DEPT IN (" + this.dept + ")) " +
                           " ORDER BY PM_MASTER.PM_ID, [Parcel ID]";


                    break;
                case "permitTypes":
                    sql = "SELECT     TOP (100) PERCENT VT_USR_PMTYPE.LONG_DESC AS [Permit Type] "+
                            "FROM         dbo.PC_LK_PARCEL_PM INNER JOIN "+
                            "dbo.PM_MASTER ON dbo.PC_LK_PARCEL_PM.KEY_ID = dbo.PM_MASTER.PM_ID INNER JOIN  "+
                            "dbo.VT_USR_PMTYPE AS VT_USR_PMTYPE ON dbo.PM_MASTER.PM_TYPE = VT_USR_PMTYPE.CODE  "+
                            "WHERE     (NOT (dbo.PC_LK_PARCEL_PM.P_ID IS NULL)) AND (VT_USR_PMTYPE.DEPT = '"+ this.dept + "') "+
                            "GROUP BY VT_USR_PMTYPE.LONG_DESC "+
                            "HAVING      (NOT (VT_USR_PMTYPE.LONG_DESC LIKE 'z%')) AND (NOT (VT_USR_PMTYPE.LONG_DESC LIKE 'RENTLAW%')) AND  "+
                            "(NOT (VT_USR_PMTYPE.LONG_DESC = 'RENT - Seasonal Rental Permit')) "+
                            "ORDER BY [Permit Type]";
                    break;
                case "expredPermits":
                    sql = "SELECT TOP (" + this.pageSize + ") PC_LK_PARCEL_PM.P_ID as [PARCEL ID], PM_MASTER.PM_ID, VT_USR_PMTYPE.LONG_DESC AS [Permit Type], dbo.VT_USR_DEPART.LONG_DESC AS Department, CONVERT(varchar(11), " +
                            "    PM_MASTER.EXPIRATION_DATE) AS [Expiration Date], PM_MASTER.PM_APPLICATION, CONVERT(varchar(11), PM_MASTER.APPLICATION_DATE) AS APPLICATION_DATE, PM_MASTER.PM_NUMBER,  " +
                            "    CONVERT(varchar(11), PM_MASTER.PERMIT_DATE) AS PERMIT_DATE, PM_MASTER.PM_CERTIFICATE, CONVERT(varchar(11), PM_MASTER.CERTIFICATE_DATE) AS CERTIFICATE_DATE,  " +
                            "    PM_MASTER.VOID, PC_LK_PARCEL_PM.DEPT , PM_MASTER.PM_NUMBER AS [PERMIT NO], " +
                            " (SELECT     COUNT(*) AS Expr1 " +
                            "    FROM          (SELECT     PC_LK_PARCEL_PM.P_ID " +
                            "        FROM          dbo.PC_LK_PARCEL_PM AS PC_LK_PARCEL_PM INNER JOIN " +
                            "                                dbo.PM_MASTER AS PM_MASTER ON PC_LK_PARCEL_PM.KEY_ID = PM_MASTER.PM_ID INNER JOIN " +
                            "                                dbo.VT_USR_PMTYPE AS VT_USR_PMTYPE ON PM_MASTER.PM_TYPE = VT_USR_PMTYPE.CODE INNER JOIN " +
                            "                                dbo.VT_USR_DEPART ON PC_LK_PARCEL_PM.DEPT = dbo.VT_USR_DEPART.CODE AND VT_USR_PMTYPE.DEPT = dbo.VT_USR_DEPART.CODE INNER JOIN " +
                            "                                dbo.PC_ADDRESS ON PC_LK_PARCEL_PM.P_ID = dbo.PC_ADDRESS.P_ID " +
                            "        WHERE      (PC_LK_PARCEL_PM.DEPT IN (" + this.dept + ")) AND (PM_MASTER.VOID IS NULL OR " +
                            "                                PM_MASTER.VOID > - 1) AND (PM_MASTER.EXPIRATION_DATE < { fn NOW() }) AND (NOT (PM_MASTER.PM_NUMBER IS NULL)) AND " +
                            "                                (PM_MASTER.PM_CERTIFICATE IS NULL) AND (NOT (PM_MASTER.PM_TYPE LIKE 'Rent%')) AND  " +
                            "                                (NOT (PM_MASTER.PM_TYPE IN ('APEX-Accessory Apt 3 Yr. Permit Exempt', 'APTR-Accessory Apt 3 Yr. Permit', 'RENTLAW - Rent Law Exemption - 2 Year',  " +
                            "                                'RENTLAW - Rent Law Inspected - 2 Year', 'RENTLAW - Rent Law Standard - 2 Year', 'RENTLAW - Rent Law Violation - 2 Year', 'RENTLAW - Rent Law Waived - 2 Year'))) AND  " +
                            "                                (dbo.PC_ADDRESS.CITY LIKE '" + this.hamlet + "%')) AS derivedtbl_1) AS totalCount " +
                            "FROM         dbo.PC_LK_PARCEL_PM AS PC_LK_PARCEL_PM INNER JOIN " +
                            "    dbo.PM_MASTER AS PM_MASTER ON PC_LK_PARCEL_PM.KEY_ID = PM_MASTER.PM_ID INNER JOIN " +
                            "    dbo.VT_USR_PMTYPE AS VT_USR_PMTYPE ON PM_MASTER.PM_TYPE = VT_USR_PMTYPE.CODE INNER JOIN " +
                            "    dbo.VT_USR_DEPART ON PC_LK_PARCEL_PM.DEPT = dbo.VT_USR_DEPART.CODE AND VT_USR_PMTYPE.DEPT = dbo.VT_USR_DEPART.CODE INNER JOIN " +
                            "    dbo.PC_ADDRESS ON PC_LK_PARCEL_PM.P_ID = dbo.PC_ADDRESS.P_ID " +
                            "WHERE (PC_LK_PARCEL_PM.DEPT IN (" + this.dept + ")) AND (PM_MASTER.VOID IS NULL OR " +
                            "    PM_MASTER.VOID > - 1) AND (PM_MASTER.EXPIRATION_DATE < { fn NOW() }) AND (NOT (PM_MASTER.PM_NUMBER IS NULL)) AND (PM_MASTER.PM_CERTIFICATE IS NULL) AND  " +
                            "    (NOT (PM_MASTER.PM_TYPE LIKE 'Rent%')) AND (NOT (PM_MASTER.PM_TYPE IN ('APEX-Accessory Apt 3 Yr. Permit Exempt', 'APTR-Accessory Apt 3 Yr. Permit',  " +
                            "    'RENTLAW - Rent Law Exemption - 2 Year', 'RENTLAW - Rent Law Inspected - 2 Year', 'RENTLAW - Rent Law Standard - 2 Year', 'RENTLAW - Rent Law Violation - 2 Year',  " +
                            "    'RENTLAW - Rent Law Waived - 2 Year'))) AND (dbo.PC_ADDRESS.CITY like '" + this.hamlet + "%') and " +
                            " (NOT (PM_MASTER.PM_ID IN " +
                              "(SELECT     TOP (" + this.page + "*" + this.pageSize + ") PM_MASTER.PM_ID " +
                                "FROM          dbo.PC_LK_PARCEL_PM AS PC_LK_PARCEL_PM INNER JOIN " +
                                "                       dbo.PM_MASTER AS PM_MASTER ON PC_LK_PARCEL_PM.KEY_ID = PM_MASTER.PM_ID INNER JOIN " +
                                "                       dbo.VT_USR_PMTYPE AS VT_USR_PMTYPE ON PM_MASTER.PM_TYPE = VT_USR_PMTYPE.CODE INNER JOIN " +
                                "                       dbo.VT_USR_DEPART AS VT_USR_DEPART_1 ON PC_LK_PARCEL_PM.DEPT = VT_USR_DEPART_1.CODE AND VT_USR_PMTYPE.DEPT = VT_USR_DEPART_1.CODE INNER JOIN " +
                                "                       dbo.PC_ADDRESS AS PC_ADDRESS_1 ON PC_LK_PARCEL_PM.P_ID = PC_ADDRESS_1.P_ID " +
                                "WHERE      (PC_LK_PARCEL_PM.DEPT  IN (" + this.dept + ")) AND (PM_MASTER.VOID IS NULL OR " +
                                "                       PM_MASTER.VOID > - 1) AND (PM_MASTER.EXPIRATION_DATE < { fn NOW() }) AND (NOT (PM_MASTER.PM_NUMBER IS NULL)) AND (PM_MASTER.PM_CERTIFICATE IS NULL) AND  " +
                                "                       (NOT (PM_MASTER.PM_TYPE LIKE 'Rent%')) AND (NOT (PM_MASTER.PM_TYPE IN ('APEX-Accessory Apt 3 Yr. Permit Exempt', 'APTR-Accessory Apt 3 Yr. Permit',  " +
                                "                       'RENTLAW - Rent Law Exemption - 2 Year', 'RENTLAW - Rent Law Inspected - 2 Year', 'RENTLAW - Rent Law Standard - 2 Year', 'RENTLAW - Rent Law Violation - 2 Year',  " +
                                "                       'RENTLAW - Rent Law Waived - 2 Year'))) AND (PC_ADDRESS_1.CITY LIKE '" + this.hamlet + "%') " +
                                "ORDER BY PM_MASTER.PM_ID, PC_LK_PARCEL_PM.P_ID))) " +


                            "ORDER BY PM_MASTER.PM_ID, [Parcel ID]";
                    break;
            }
            return (sql);
        }
        public string GetOpenPermits(string dept, string type, int page, int pageSize, string hamlet, string status)
        {
            string sql = "";
            this.dept = dept;
            this.page = page;
            this.pageSize = pageSize;
            this.hamlet = hamlet;
            this.status = status;

            if (type == "expired")
            {
                sql = this.GetSearchType("expredPermits");
            }
            //else if (dept == "code")
            //{
            //    this.permitType = type;
            //    this.dept = "02, 21";
            //    sql = this.GetSearchType("permits");
            //}
            else
            {
                this.permitType = type;
                sql = this.GetSearchType("permits");
            }
            DataTable newdt = new DataTable();

            SqlCommand command = new SqlCommand(sql, conn);
            SqlDataAdapter adapter = new SqlDataAdapter(command);
            DataTable dt = new DataTable();
            try
            {
                adapter.Fill(newdt);
            }
            finally
            {
                conn.Close();
            }

            dt = removeNonRenewablePermits(newdt);

            string[] pids = new string[dt.Rows.Count];
            string returnString = "";
            string jsonString = null;
            string header = "{\"label\": \"P_ID\", \"items\": [";
            string trailer = "]}";
            string totalCount = "";

            List<string> list = new List<string>();
            Dictionary<string, string> dict = new Dictionary<string, string>();
            if (dt.Rows.Count != 0)
            {
                foreach (DataRow row in dt.Rows)
                {
                    Hashtable taxTable = new Hashtable();
                    //taxTable.Add("ID", ncount);13872
                    foreach (DataColumn dc in dt.Columns)
                    {
                        if (dc.ColumnName.ToString() == "totalCount")
                        {
                            totalCount = row[dc.ColumnName].ToString();
                        }
                        else
                        {
                            taxTable.Add(dc.ColumnName, row[dc.ColumnName].ToString());
                        }
                    }
                    taxTable.Add("status", getPermitStatus(row["PERMIT NO"].ToString(), row["Expiration Date"].ToString(),
                        row["Certificate No"].ToString(), row["Permit No"].ToString(), row["Application No"].ToString()));
                    jsonString = JSON.JsonEncode(taxTable);
                    if (dict.ContainsKey(row["PARCEL ID"].ToString()))
                    {
                        dict[row["PARCEL ID"].ToString()] += "," + jsonString;
                    }
                    else
                    {
                        dict[row["PARCEL ID"].ToString()] = jsonString;
                        list.Add(row["PARCEL ID"].ToString());
                    }
                }
                dict.Add("ids", String.Join(",", list.ToArray()));
                dict.Add("count", totalCount);
            }
            else
            {
                returnString = "{\"items\": []}";
            }
            dt.Dispose();
            JavaScriptSerializer serializer = new JavaScriptSerializer();
            serializer.MaxJsonLength = Int32.MaxValue;
            returnString = header + serializer.Serialize(dict) + trailer;
            return returnString;
        }
        public string getPermitStatus(string permitType, string eDate, string co, string pm, string app)
        {
            var status = "";
            DateTime expriationDate = (eDate == "undefined" || eDate == "") ? DateTime.Today.AddDays(-1) : Convert.ToDateTime(eDate);
            DateTime currentDate = DateTime.Today;

            if ((permitType != "" && expriationDate > currentDate) || (co != ""))
            {
                status = "activePermit";
            }
            else if (permitType != "" && expriationDate <= currentDate)
            {
                status = "expiredPermit";
            }
            else if (permitType == "")
            {
                status = "application";
            }
            else
            {
                status = "unknown";
            }
            return status;
        }
        public string GetPermitTypes(string dept)
        {
            this.dept = dept;
            string sql = this.GetSearchType("permitTypes");
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
            tblJson = new string[dt.Rows.Count + 1];
            string returnString = "";
            string jsonString = null;
            string header = "{\"items\": [";
            string trailer = "]}";

            //string permits = new string["APEX-Accessory Apt 3 Yr. Permit Exempt","APTR-Accessory Apt 3 Yr. Permit", "RENTLAW - Rent Law Exemption - 2 Year", "RENTLAW - Rent Law Inspected - 2 Year",  "RENTLAW - Rent Law Standard - 2 Year", "RENTLAW - Rent Law Violation - 2 Year", "RENTLAW - Rent Law Waived - 2 Year"];

            if (dt.Rows.Count != 0)
            {
                if (dept == "05")
                {
                    returnString = "{\"items\":" + DataTableToJSON(dt) + "}";
                }
                else
                {
                    int ncount = 0;
                    foreach (DataRow row in dt.Rows)
                    {
                        Hashtable taxTable = new Hashtable();
                        //taxTable.Add("ID", ncount);
                        foreach (DataColumn dc in dt.Columns)
                        {
                            if (row[dc.ColumnName].ToString().IndexOf("rentlaw") == -1)
                            {
                                taxTable.Add(dc.ColumnName, row[dc.ColumnName].ToString());
                            }

                        }
                        //taxTable.Add("Permit Type", "RENTLAW");
                        jsonString = JSON.JsonEncode(taxTable);

                        tblJson[ncount] = jsonString;
                        ncount = ncount + 1;

                    }
                    if (dept == "02")
                    {
                        tblJson[ncount] = "{\"Permit Type\":\"RENTLAW\"}";
                    }
                    returnString = header + String.Join(",", tblJson) + trailer;
                }
            }
            else if (dept == "21")
            {
                returnString = header + "{\"Permit Type\":\"RENTLAW\", \"DEPT\":\"02\"}" + trailer;
            }
            else
            {
                returnString = "{\"items\": []}";
            }
            //finalJSON[tabcount] = tblString = String.Join(",", tblJson);
            dt.Dispose();
            return returnString;
        }
        public DataTable removeNonRenewablePermits(DataTable table)
        {
            //string currentHighestPM_ID = "";
            string[] nonRenewablePermit = new string[] {"Tent Commercial", "Tent Residential", "Bonfire/Rec. Fire App.", "Supervised Public Fireworks Display",
                                 "Supervised Private Fireworks Display", "Temp Ins Flammable/Comp for Public Assmb"};

            for (int i = table.Rows.Count - 1; i >= 0; i--)
            {
                if (Array.IndexOf(nonRenewablePermit, table.Rows[i]["Permit Type"].ToString()) != -1)
                {
                    DataView dv = table.DefaultView;
                    dv.RowFilter = "[Permit Type] = '" + table.Rows[i]["Permit Type"].ToString() + "' and [Parcel ID] = '" + table.Rows[i]["Parcel ID"].ToString() + "'";
                    dv.Sort = "[PM_ID] DESC";
                    DataTable sortTable = dv.ToTable();
                    if ((Convert.ToInt32(table.Rows[i]["PM_ID"]) < Convert.ToInt32(sortTable.Rows[0]["PM_ID"])) && table.Rows[i]["DEPT"].ToString() == "16")
                    {
                        table.Rows.Remove(table.Rows[i]);
                    }
                }
            }
            return table;
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
        public MemoryStream getPermitsForDownload(string dept, string type, int page, int pageSize, string hamlet, string status)
        {
            //SqlDataReader rdr = null;
            MemoryStream rstream = new MemoryStream();
            string sql = "";
            this.dept = dept;
            this.page = page;
            this.pageSize = pageSize;
            this.hamlet = hamlet;
            this.status = status;

            try
            {
                StreamWriter sw = new StreamWriter(rstream);
                if (type == "expired")
                {
                    sql = this.GetSearchType("expredPermits");
                }
                //else if (dept == "code")
                //{
                //    this.permitType = type;
                //    this.dept = "02, 21";
                //    sql = this.GetSearchType("permits");
                //}
                else
                {
                    this.permitType = type;
                    sql = this.GetSearchType("permits");
                }
                DataTable newdt = new DataTable();

                SqlCommand command = new SqlCommand(sql, conn);
                SqlDataAdapter adapter = new SqlDataAdapter(command);
                DataTable dt = new DataTable();
                try
                {
                    adapter.Fill(newdt);
                }
                finally
                {
                    conn.Close();
                }

                dt = removeNonRenewablePermits(newdt);
                //DataTableToCSV(dt, sw, true);

                string[] columnNames = dt.Columns.Cast<DataColumn>().Select(column => "\"" + column.ColumnName.Replace("\"", "\"\"") + "\"").ToArray<string>();
                sw.WriteLine(String.Join(",", columnNames));

                foreach (DataRow row in dt.Rows)
                {
                    string[] fields = row.ItemArray.Select(field => "\"" + field.ToString().Replace("\"", "\"\"") + "\"").ToArray<string>();
                    sw.WriteLine(String.Join(",", fields));
                }

                sw.Flush();
                sw.Close();
                rstream.Close();
            }
            catch (Exception ex)
            {
                throw ex;
            }
            finally
            {
                conn.Close();
                conn.Dispose();
            }
            //Return the memory Stream
            return (rstream);
        }
        public static bool DataTableToCSV(DataTable dtSource, StreamWriter writer, bool includeHeader)
        {
            if (dtSource == null || writer == null) return false;

            if (includeHeader)
            {
                string[] columnNames = dtSource.Columns.Cast<DataColumn>().Select(column => "\"" + column.ColumnName.Replace("\"", "\"\"") + "\"").ToArray<string>();
                writer.WriteLine(String.Join(",", columnNames));
                writer.Flush();
            }

            foreach (DataRow row in dtSource.Rows)
            {
                string[] fields = row.ItemArray.Select(field => "\"" + field.ToString().Replace("\"", "\"\"") + "\"").ToArray<string>();
                writer.WriteLine(String.Join(",", fields));
                writer.Flush();
            }

            return true;
        }


        public bool IsReusable
        {
            get { throw new NotImplementedException(); }
        }

        public void ProcessRequest(HttpContext context)
        {
            try
            {
                //System.IO.MemoryStream mstream = GetData();
                //byte[] byteArray = mstream.ToArray();

                string ss = "";

                //mstream.Flush();
                //mstream.Close();

                //context.Response.Clear();
                //context.Response.AddHeader("Content-Disposition", "attachment; filename=" + context.Request.Form["txtFileName"].ToString());
                //context.Response.AddHeader("Content-Length", byteArray.Length.ToString());
                //context.Response.ContentType = "application/octet-stream";
                //context.Response.BinaryWrite(byteArray);
            }
            catch (Exception Ex)
            {
                throw Ex;
            }
        }
    }
}