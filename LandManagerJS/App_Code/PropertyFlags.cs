using System;
using System.Collections;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Web;
using JEncode;

/// <summary>
/// Summary description for PropertyFlags
/// </summary>
public class PropertyFlags
{

    object login = null;
    public SqlConnection conn = null;

	public PropertyFlags()
	{
		login = OpenConnection();
	}

    private Object OpenConnection()
    {
        string connectionInfo = System.Configuration.ConfigurationManager.AppSettings["vector_flags_connect"];
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
    public string showAllFlags(string dept)
    {
        //string sql = "SELECT     TOP (100) PERCENT derivedtbl_1.Xcoord, derivedtbl_1.Ycoord, MessageTable.DEPT, MessageTable.P_ID " +
        //                "FROM         (SELECT     TOP (100) PERCENT P_ID, CAST(MESSAGE AS varchar(MAX)) AS message, EXP_DATE, DEPT " +
        //                "FROM          GOV_DB.dbo.PC_MESSAGE " +
        //                "WHERE      (EXP_DATE IS NULL) OR " +
        //                "                        (EXP_DATE >= { fn NOW() }) " +
        //                "UNION " +
        //                "SELECT     GOV_DB.dbo.PC_AREA.P_ID, 'This Parcel Flagged on Wetlands Inventory' AS Message, { fn NOW() } AS Expr1, '05' AS dept " +
        //                "FROM         GOV_DB.dbo.PC_AREA INNER JOIN " +
        //                "                        GOV_DB.dbo._YEAR_PC ON GOV_DB.dbo.PC_AREA.YEAR_ID = GOV_DB.dbo._YEAR_PC.CURRENT_FY " +
        //                "WHERE     (GOV_DB.dbo.PC_AREA.FROZEN_ID = 0) AND (GOV_DB.dbo.PC_AREA.DIST_OTHER = 'wetinv')) AS MessageTable INNER JOIN " +
        //                "    (SELECT     SHAPE.STCentroid() AS centroid, SHAPE.STCentroid().STX AS Xcoord, SHAPE.STCentroid().STY AS Ycoord, PARCEL_ID " +
        //                "    FROM          SDEadmin.TAX_PARCELS_VW) AS derivedtbl_1 ON MessageTable.P_ID = derivedtbl_1.PARCEL_ID " +
        //                "WHERE     (MessageTable.DEPT = '" + dept + "')";

        string sql = "SELECT GOV_DB.dbo.PC_MESSAGE.P_ID, CAST(GOV_DB.dbo.PC_MESSAGE.MESSAGE AS varchar(75)) AS message, " +
                "GOV_DB.dbo.PC_MESSAGE.EXP_DATE, GOV_DB.dbo.PC_MESSAGE.DEPT, geomTBL.Xcoord, geomTBL.Ycoord " +
                "FROM         GOV_DB.dbo.PC_MESSAGE INNER JOIN " +
                "    (SELECT     SHAPE.STCentroid() AS centroid, SHAPE.STCentroid().STX AS Xcoord, SHAPE.STCentroid().STY AS Ycoord, PARCEL_ID " +
                "    FROM          SDEadmin.TAX_PARCELS_VW WHERE (DSBL LIKE '9%')) AS geomTBL ON GOV_DB.dbo.PC_MESSAGE.P_ID = geomTBL.PARCEL_ID " +
                "WHERE     (GOV_DB.dbo.PC_MESSAGE.EXP_DATE IS NULL OR " +
                "GOV_DB.dbo.PC_MESSAGE.EXP_DATE >= { fn NOW() }) AND (GOV_DB.dbo.PC_MESSAGE.DEPT in (" + dept + "))"; 

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
                Hashtable picTable = new Hashtable();
                //taxTable.Add("ID", ncount);
                foreach (DataColumn dc in dt.Columns)
                {
                    picTable.Add(dc.ColumnName, row[dc.ColumnName].ToString());
                }
                jsonString = JSON.JsonEncode(picTable);

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
    public string GetFlagResults(string pid)
    {
        string sql = "SELECT     TOP (100) PERCENT P_ID, message, EXP_DATE, FieldOrder " +
                        "FROM         (SELECT     TOP (100) PERCENT P_ID, CAST(MESSAGE AS varchar(8000)) AS message, EXP_DATE, 2 AS FieldOrder " +
                        "    FROM          GOV_DB.dbo.PC_MESSAGE " +
                        "    WHERE      (EXP_DATE IS NULL) OR " +
                        "                            (EXP_DATE >= { fn NOW() }) " +
                        "    UNION " +
                        "    SELECT     GOV_DB.dbo.PC_AREA.P_ID, 'This Parcel Flagged on Wetlands Inventory' AS Message, { fn NOW() } AS Expr1, 1 AS Expr2 " +
                        "    FROM         GOV_DB.dbo.PC_AREA INNER JOIN " +
                        "                            GOV_DB.dbo._YEAR_PC ON GOV_DB.dbo.PC_AREA.YEAR_ID = GOV_DB.dbo._YEAR_PC.CURRENT_FY " +
                        "    WHERE     (GOV_DB.dbo.PC_AREA.FROZEN_ID = 0) AND (GOV_DB.dbo.PC_AREA.DIST_OTHER = 'wetinv')) AS MessageTable " +
                        "WHERE     (P_ID = " + pid + ") " +
                        "ORDER BY FieldOrder";
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
        string header = "{\"label\": \"EXP_DATE\", \"items\": [";
        string trailer = "]}";
        if (dt.Rows.Count != 0)
        {
            int ncount = 0;
            foreach (DataRow row in dt.Rows)
            {
                Hashtable picTable = new Hashtable();
                //taxTable.Add("ID", ncount);
                foreach (DataColumn dc in dt.Columns)
                {
                    picTable.Add(dc.ColumnName, row[dc.ColumnName].ToString());
                }
                jsonString = JSON.JsonEncode(picTable);

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
}