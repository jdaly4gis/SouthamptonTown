using System;
using System.Collections;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Web;
using System.Web.Script.Serialization;
using JEncode;

/// <summary>
/// Summary description for accela_Module
/// </summary>
public class accela_Module
{
    string sql;
    public SqlConnection conn = null;
    object login = null;
	public accela_Module()
	{
        login = accelaConnection();
	}
    private Object accelaConnection()
    {
        string connectionInfo = System.Configuration.ConfigurationManager.AppSettings["AccelaModuleConnection"];
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
    public string getAccelaInspections(string id)
    {
        string sql = "SELECT     TOP (100) PERCENT RECORDS.PARCEL_NBR,RECORDS.RECORD_ID, RECORDS.COMPLAINT_TYPE, RECORDS.DATE_OPENED, RECORDS.CREATED_BY,  left(RECORDS.RECORD_TYPE, 4) as RECORD_TYPE, RECORDS.DESCRIPTION, ID_REC, " +
                            "CCOMMENTS.COMMENT_DATE,CCOMMENTS.ADDED_BY, CCOMMENTS.COMMENTS, ID_COMM, INSPECTIONS.DATE_INSPECTION, INSPECTIONS.RESULT, RECORDS.RECORD_STATUS, " +
                            "INSPECTIONS.COMMENTS_RESULT, ID_INSP " +
                    "FROM (SELECT     dbo.RECORDS.*, row_number() OVER (order by PARCEL_NBR, RECORD_ID)  AS ID_REC " +
                            "FROM         dbo.RECORDS  " +
                            "where (PARCEL_NBR =  '" + id + "')) RECORDS LEFT OUTER JOIN " +
                        "(SELECT     dbo.CCOMMENTS.*, row_number() OVER (order by PARCEL_NBR, record_ID, COMMENT_DATE)  AS ID_COMM " +
                            "FROM         dbo.CCOMMENTS  " +
                            "where  (PARCEL_NBR =  '" + id + "')) CCOMMENTS ON CCOMMENTS.PARCEL_NBR = RECORDS.PARCEL_NBR AND CCOMMENTS.RECORD_ID = RECORDS.RECORD_ID LEFT OUTER JOIN " +
                        "(SELECT     dbo.INSPECTIONS.*, row_number() OVER (order by PARCEL_NBR, DATE_INSPECTION,  record_ID) AS ID_INSP " +
                            "FROM         dbo.INSPECTIONS  " +
                            "where (PARCEL_NBR =  '" + id + "')) INSPECTIONS ON RECORDS.PARCEL_NBR = INSPECTIONS.PARCEL_NBR AND RECORDS.RECORD_ID = INSPECTIONS.RECORD_ID order by  ID_REC";
        //string sql = "SELECT dbo.RECORDS.* FROM dbo.RECORDS WHERE (PARCEL_NBR = '" + id + "'); SELECT dbo.INSPECTIONS.*FROM dbo.INSPECTIONS WHERE (PARCEL_NBR = '" + id + "'); SELECT dbo.CCOMMENTS.* FROM dbo.CCOMMENTS WHERE (PARCEL_NBR = '" + id + "')";
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
        string header = "{\"items\": ";
        string trailer = "}";
        if (dt.Rows.Count != 0)
        {
            //int ncount = 0;
            //foreach (DataRow row in dt.Rows)
            //{
            //    Hashtable taxTable = new Hashtable();
            //    //taxTable.Add("ID", ncount);
            //    foreach (DataColumn dc in dt.Columns)
            //    {
            //        taxTable.Add(dc.ColumnName, row[dc.ColumnName].ToString());

            //    }
            //    jsonString = JSON.JsonEncode(taxTable);

            //    tblJson[ncount] = jsonString;
            //    ncount = ncount + 1;

            //}
            //returnString = header + String.Join(",", tblJson) + trailer;
            
            returnString = header + DataTableToJSON(dt) + trailer;
        }
        else
        {
            returnString = "{\"items\": []}";
        }
        //finalJSON[tabcount] = tblString = String.Join(",", tblJson);
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
}

//SELECT     dbo.RECORDS.*, row_number() OVER (order by PARCEL_NBR, RECORD_ID)  AS ID_REC
//FROM         dbo.RECORDS

//SELECT     dbo.INSPECTIONS.*, row_number() OVER (order by PARCEL_NBR, record_ID, DATE_SCHEDULED)  AS ID_INSP
//FROM         dbo.INSPECTIONS

//SELECT     dbo.CCOMMENTS.*, row_number() OVER (order by PARCEL_NBR, record_ID, COMMENT_DATE)  AS ID_COMM
//FROM         dbo.CCOMMENTS

//*********///////Without IDS
//SELECT     TOP (100) PERCENT dbo.RECORDS.PARCEL_NBR, dbo.RECORDS.RECORD_ID, dbo.RECORDS.DATE_OPENED, dbo.RECORDS.CREATED_BY, dbo.RECORDS.RECORD_TYPE, 
//                      dbo.CCOMMENTS.COMMENT_DATE, dbo.CCOMMENTS.ADDED_BY, dbo.CCOMMENTS.COMMENTS, dbo.INSPECTIONS.DATE_INSPECTION, dbo.INSPECTIONS.RESULT, 
//                      dbo.INSPECTIONS.COMMENTS_RESULT
//FROM         dbo.RECORDS LEFT OUTER JOIN
//                      dbo.CCOMMENTS ON dbo.CCOMMENTS.PARCEL_NBR = dbo.RECORDS.PARCEL_NBR AND dbo.CCOMMENTS.RECORD_ID = dbo.RECORDS.RECORD_ID LEFT OUTER JOIN
//                      dbo.INSPECTIONS ON dbo.RECORDS.PARCEL_NBR = dbo.INSPECTIONS.PARCEL_NBR AND dbo.RECORDS.RECORD_ID = dbo.INSPECTIONS.RECORD_ID
//WHERE     (dbo.RECORDS.PARCEL_NBR = '39601') OR
//                      (dbo.RECORDS.PARCEL_NBR = '77557')

//************With IDS whole Table in Window
//SELECT     TOP (100) PERCENT RECORDS.PARCEL_NBR,RECORDS.RECORD_ID, RECORDS.DATE_OPENED, RECORDS.CREATED_BY, RECORDS.RECORD_TYPE, ID_REC, 
//                      CCOMMENTS.COMMENT_DATE,CCOMMENTS.ADDED_BY, CCOMMENTS.COMMENTS, ID_COMM, INSPECTIONS.DATE_INSPECTION, INSPECTIONS.RESULT, 
//                     INSPECTIONS.COMMENTS_RESULT, ID_INSP
//FROM          (SELECT     dbo.RECORDS.*, row_number() OVER (order by PARCEL_NBR, RECORD_ID)  AS ID_REC
//FROM         dbo.RECORDS) RECORDS LEFT OUTER JOIN
//                      (SELECT     dbo.CCOMMENTS.*, row_number() OVER (order by PARCEL_NBR, record_ID, COMMENT_DATE)  AS ID_COMM
//FROM         dbo.CCOMMENTS) CCOMMENTS ON CCOMMENTS.PARCEL_NBR = RECORDS.PARCEL_NBR AND CCOMMENTS.RECORD_ID = RECORDS.RECORD_ID LEFT OUTER JOIN
//                       (SELECT     dbo.INSPECTIONS.*, row_number() OVER (order by PARCEL_NBR, record_ID, DATE_SCHEDULED)  AS ID_INSP
//FROM         dbo.INSPECTIONS) INSPECTIONS ON RECORDS.PARCEL_NBR = INSPECTIONS.PARCEL_NBR AND RECORDS.RECORD_ID = INSPECTIONS.RECORD_ID
//WHERE     (RECORDS.PARCEL_NBR = '39601') OR
//                      (RECORDS.PARCEL_NBR = '77557')

/////////Only Selected Records in window
//SELECT     TOP (100) PERCENT RECORDS.PARCEL_NBR,RECORDS.RECORD_ID, RECORDS.DATE_OPENED, RECORDS.CREATED_BY, RECORDS.RECORD_TYPE, ID_REC, 
//                      CCOMMENTS.COMMENT_DATE,CCOMMENTS.ADDED_BY, CCOMMENTS.COMMENTS, ID_COMM, INSPECTIONS.DATE_INSPECTION, INSPECTIONS.RESULT, 
//                     INSPECTIONS.COMMENTS_RESULT, ID_INSP
//FROM          (SELECT     dbo.RECORDS.*, row_number() OVER (order by PARCEL_NBR, RECORD_ID)  AS ID_REC
//                     FROM         dbo.RECORDS 
//                      where (PARCEL_NBR = '39601') OR  (PARCEL_NBR = '77557')) RECORDS LEFT OUTER JOIN
//                    (SELECT     dbo.CCOMMENTS.*, row_number() OVER (order by PARCEL_NBR, record_ID, COMMENT_DATE)  AS ID_COMM
//                      FROM         dbo.CCOMMENTS 
//                      where (PARCEL_NBR = '39601') OR (PARCEL_NBR = '77557')) CCOMMENTS ON CCOMMENTS.PARCEL_NBR = RECORDS.PARCEL_NBR AND CCOMMENTS.RECORD_ID = RECORDS.RECORD_ID LEFT OUTER JOIN
//                    (SELECT     dbo.INSPECTIONS.*, row_number() OVER (order by PARCEL_NBR, record_ID, DATE_SCHEDULED)  AS ID_INSP
//                      FROM         dbo.INSPECTIONS 
//                     where (PARCEL_NBR = '39601') OR (PARCEL_NBR = '77557')) INSPECTIONS ON RECORDS.PARCEL_NBR = INSPECTIONS.PARCEL_NBR AND RECORDS.RECORD_ID = INSPECTIONS.RECORD_ID