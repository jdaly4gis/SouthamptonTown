using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Data.SqlClient;
using System.Data;
using System.Collections;
using JEncode;
using System.Web.Script.Serialization;
using System.Diagnostics;

/// <summary>
/// Summary description for DIQ_Module
/// </summary>
public class DIQ_Module
{
    string sql;
    public SqlConnection conn = null;
    object login = null;
	public DIQ_Module()
	{
        login = govWebConnection();
	}
    private Object govWebConnection()
    {
        string connectionInfo = System.Configuration.ConfigurationManager.AppSettings["DIQ_ParcelsConnect"];
        //string connectionInfo = System.Configuration.ConfigurationManager.AppSettings[appSettings];
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
    

    public string getDIQ(string sender, string field)
    {
        string query = "SELECT TOP (100) PERCENT " + field + "_VAL as DIQ_VAL," + field + "_CD as DIQ_CD  FROM  SDEadmin." + sender + " WHERE (NOT (" + field + "_CD IS NULL)) and (NOT (" + field + "_VAL IS NULL)) GROUP BY " + field + "_VAL," + field + "_CD ORDER BY " + field + "_CD";
        //string query = getSQL(sender, field);

        DataTable dt = new DataTable();
        SqlCommand command = new SqlCommand(query, conn);
        SqlDataAdapter adapter = new SqlDataAdapter(command);
        string returnString = "";
        try
        {
            Stopwatch stopWatch = new Stopwatch();
            stopWatch.Start();
            adapter.Fill(dt);
            stopWatch.Stop();
            returnString = DataTableToJSON(dt);
        }
        catch (Exception e) {
            returnString = "{\"items\": []}";
        }
        finally
        {
            conn.Close();
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

    
    private string getSQL(string type, string field)
    {
        string sql = "";
        switch (type)
        {
            case "BLDG_DIQ":
                sql = "SELECT "+ field + " as DIQ" + 
                    " FROM         (SELECT     GOV_DB.dbo.MA_BUILDINGS.BLDG_ID, GOV_DB.dbo.MA_BUILDINGS.BLDG_SEQ, GOV_DB.dbo.VT_USR_MODEL.LONG_DESC AS MODEL, "+
                    "        GOV_DB.dbo.VT_USR_BLDGUSE.LONG_DESC AS BLDG_USE, GOV_DB.dbo.MA_BUILDINGS.MS9013_CD AS ENHANCE, GOV_DB.dbo.MA_BUILDINGS.MS9012_CD AS S_ADQ,  "+
                    "        GOV_DB.dbo.MA_BUILDINGS.MS9003_CD AS Historic, GOV_DB.dbo.MA_BUILDINGS_2.MS5010_CD AS E_Homes "+
                    "FROM          GOV_DB.dbo.MA_BUILDINGS INNER JOIN "+
                    "        GOV_DB.dbo._YEAR_MA ON GOV_DB.dbo.MA_BUILDINGS.YEAR_ID = GOV_DB.dbo._YEAR_MA.CURRENT_FY INNER JOIN "+
                    "        GOV_DB.dbo.VT_USR_MODEL ON GOV_DB.dbo.MA_BUILDINGS.BLDG_MODEL_CODE = GOV_DB.dbo.VT_USR_MODEL.CODE INNER JOIN "+
                    "        GOV_DB.dbo.VT_USR_BLDGUSE ON GOV_DB.dbo.MA_BUILDINGS.YEAR_ID = GOV_DB.dbo.VT_USR_BLDGUSE.YEAR_ID AND  "+
                    "        GOV_DB.dbo.MA_BUILDINGS.BLDG_USE_CODE = GOV_DB.dbo.VT_USR_BLDGUSE.CODE INNER JOIN "+
                    "        GOV_DB.dbo.MA_BUILDINGS_2 ON GOV_DB.dbo.MA_BUILDINGS.YEAR_ID = GOV_DB.dbo.MA_BUILDINGS_2.YEAR_ID AND  "+
                    "        GOV_DB.dbo.MA_BUILDINGS.FROZEN_ID = GOV_DB.dbo.MA_BUILDINGS_2.FROZEN_ID AND GOV_DB.dbo.MA_BUILDINGS.BLDG_ID = GOV_DB.dbo.MA_BUILDINGS_2.BLDG_ID AND  "+
                    "        GOV_DB.dbo.MA_BUILDINGS.BLDG_SEQ = GOV_DB.dbo.MA_BUILDINGS_2.BLDG_SEQ "+
                    "WHERE      (GOV_DB.dbo.MA_BUILDINGS.FROZEN_ID = 0)) AS info_tbl "+
                    "GROUP BY " + field +
                    " HAVING      (NOT ("+ field +" IS NULL))";
                break;
            case "BLDG_DIQ_HOLD":
                sql = "SELECT " + field + " as DIQ" +
                    " FROM         (SELECT     GOV_DB_HOLD.dbo.MA_BUILDINGS.BLDG_ID, GOV_DB_HOLD.dbo.MA_BUILDINGS.BLDG_SEQ, GOV_DB_HOLD.dbo.VT_USR_MODEL.LONG_DESC AS MODEL, " +
                    "        GOV_DB_HOLD.dbo.VT_USR_BLDGUSE.LONG_DESC AS BLDG_USE, GOV_DB_HOLD.dbo.MA_BUILDINGS.MS9013_CD AS ENHANCE, GOV_DB_HOLD.dbo.MA_BUILDINGS.MS9012_CD AS S_ADQ,  " +
                    "        GOV_DB_HOLD.dbo.MA_BUILDINGS.MS9003_CD AS Historic, GOV_DB_HOLD.dbo.MA_BUILDINGS_2.MS5010_CD AS E_Homes " +
                    "FROM          GOV_DB_HOLD.dbo.MA_BUILDINGS INNER JOIN " +
                    "        GOV_DB_HOLD.dbo._YEAR_MA ON GOV_DB_HOLD.dbo.MA_BUILDINGS.YEAR_ID = GOV_DB_HOLD.dbo._YEAR_MA.CURRENT_FY INNER JOIN " +
                    "        GOV_DB_HOLD.dbo.VT_USR_MODEL ON GOV_DB_HOLD.dbo.MA_BUILDINGS.BLDG_MODEL_CODE = GOV_DB_HOLD.dbo.VT_USR_MODEL.CODE INNER JOIN " +
                    "        GOV_DB_HOLD.dbo.VT_USR_BLDGUSE ON GOV_DB_HOLD.dbo.MA_BUILDINGS.YEAR_ID = GOV_DB_HOLD.dbo.VT_USR_BLDGUSE.YEAR_ID AND  " +
                    "        GOV_DB_HOLD.dbo.MA_BUILDINGS.BLDG_USE_CODE = GOV_DB_HOLD.dbo.VT_USR_BLDGUSE.CODE INNER JOIN " +
                    "        GOV_DB_HOLD.dbo.MA_BUILDINGS_2 ON GOV_DB_HOLD.dbo.MA_BUILDINGS.YEAR_ID = GOV_DB_HOLD.dbo.MA_BUILDINGS_2.YEAR_ID AND  " +
                    "        GOV_DB_HOLD.dbo.MA_BUILDINGS.FROZEN_ID = GOV_DB_HOLD.dbo.MA_BUILDINGS_2.FROZEN_ID AND GOV_DB_HOLD.dbo.MA_BUILDINGS.BLDG_ID = GOV_DB_HOLD.dbo.MA_BUILDINGS_2.BLDG_ID AND  " +
                    "        GOV_DB_HOLD.dbo.MA_BUILDINGS.BLDG_SEQ = GOV_DB_HOLD.dbo.MA_BUILDINGS_2.BLDG_SEQ " +
                    "WHERE      (GOV_DB_HOLD.dbo.MA_BUILDINGS.FROZEN_ID = 0)) AS info_tbl " +
                    "GROUP BY " + field +
                    " HAVING      (NOT (" + field + " IS NULL))";
                break;
            case "MA_LAND_VW":
                sql = "SELECT " + field + " as DIQ " +
                        "FROM         SDEadmin.MA_LAND_VW " +
                        "GROUP BY " + field +
                        " HAVING      (NOT (" + field + " IS NULL))";
                break;
            case "MA_LAND_VW_HOLD":
                sql = "SELECT " + field + " as DIQ " +
                        "FROM         SDEadmin.MA_LAND_VW_HOLD " +
                        "GROUP BY " + field +
                        " HAVING      (NOT (" + field + " IS NULL))";
                break;
            case "MA_SITE_VW":
                sql = "SELECT   " + field + " as DIQ" +
                            " FROM         (SELECT     GOV_DB.dbo.MA_SITE.P_ID, MAX(GOV_DB.dbo.MA_SITE.ROAD_TYP_CD) AS ROAD_TYP_CD, MAX(GOV_DB.dbo.MA_SITE.SITE35_CD) AS SITE35_CD,  " +
                            "                                              MAX(GOV_DB.dbo.MA_SITE.SITE30_CD) AS SITE30_CD, MAX(GOV_DB.dbo.MA_SITE.SITE28_CD) AS SITE28_CD, MAX(GOV_DB.dbo.MA_SITE.SITE27_CD)  " +
                            "                                              AS SITE27_CD, MAX(GOV_DB.dbo.MA_SITE.SITE25_CD) AS SITE25_CD, MAX(GOV_DB.dbo.MA_SITE.SITE_ADV_CD) AS SITE_ADV_CD,  " +
                            "                                              MAX(GOV_DB.dbo.MA_SITE.MKTADJ_CD) AS MKTADJ_CD, MAX(GOV_DB.dbo.MA_SITE.SITE40_CD) AS SITE40_CD, MAX(GOV_DB.dbo.MA_SITE.SITE26_CD)  " +
                            "                                              AS SITE26_CD " +
                            "                       FROM          GOV_DB.dbo.MA_SITE INNER JOIN " +
                            "                                              GOV_DB.dbo._YEAR_MA ON GOV_DB.dbo.MA_SITE.YEAR_ID = GOV_DB.dbo._YEAR_MA.CURRENT_FY " +
                            "                       WHERE      (GOV_DB.dbo.MA_SITE.FROZEN_ID = 0) " +
                            "                       GROUP BY GOV_DB.dbo.MA_SITE.P_ID) AS AJD_TBL INNER JOIN " +
                            "                      GOV_DB.dbo.PC_PARCEL ON AJD_TBL.P_ID = GOV_DB.dbo.PC_PARCEL.P_ID " +
                            "WHERE     (GOV_DB.dbo.PC_PARCEL.INACTIVE_YEAR > YEAR({ fn NOW() })) AND (GOV_DB.dbo.PC_PARCEL.EFFECTIVE_YEAR <= YEAR({ fn NOW() })) " +
                            "GROUP by " + field +
                            " HAVING      (NOT (" + field + " IS NULL))";
                break;
            case "MA_SITE_VW_HOLD":
                sql = "SELECT   " + field + " as DIQ" +
                            " FROM         (SELECT     GOV_DB_HOLD.dbo.MA_SITE.P_ID, MAX(GOV_DB_HOLD.dbo.MA_SITE.ROAD_TYP_CD) AS ROAD_TYP_CD, MAX(GOV_DB_HOLD.dbo.MA_SITE.SITE35_CD) AS SITE35_CD,  " +
                            "                                              MAX(GOV_DB_HOLD.dbo.MA_SITE.SITE30_CD) AS SITE30_CD, MAX(GOV_DB_HOLD.dbo.MA_SITE.SITE28_CD) AS SITE28_CD, MAX(GOV_DB_HOLD.dbo.MA_SITE.SITE27_CD)  "+
                            "                                              AS SITE27_CD, MAX(GOV_DB_HOLD.dbo.MA_SITE.SITE25_CD) AS SITE25_CD, MAX(GOV_DB_HOLD.dbo.MA_SITE.SITE_ADV_CD) AS SITE_ADV_CD,  "+
                            "                                              MAX(GOV_DB_HOLD.dbo.MA_SITE.MKTADJ_CD) AS MKTADJ_CD, MAX(GOV_DB_HOLD.dbo.MA_SITE.SITE40_CD) AS SITE40_CD, MAX(GOV_DB_HOLD.dbo.MA_SITE.SITE26_CD)  "+
                            "                                              AS SITE26_CD "+
                            "                       FROM          GOV_DB_HOLD.dbo.MA_SITE INNER JOIN "+
                            "                                              GOV_DB_HOLD.dbo._YEAR_MA ON GOV_DB_HOLD.dbo.MA_SITE.YEAR_ID = GOV_DB_HOLD.dbo._YEAR_MA.CURRENT_FY "+
                            "                       WHERE      (GOV_DB_HOLD.dbo.MA_SITE.FROZEN_ID = 0) "+
                            "                       GROUP BY GOV_DB_HOLD.dbo.MA_SITE.P_ID) AS AJD_TBL INNER JOIN "+
                            "                      GOV_DB_HOLD.dbo.PC_PARCEL ON AJD_TBL.P_ID = GOV_DB_HOLD.dbo.PC_PARCEL.P_ID "+
                            "WHERE     (GOV_DB_HOLD.dbo.PC_PARCEL.INACTIVE_YEAR > YEAR({ fn NOW() })) AND (GOV_DB_HOLD.dbo.PC_PARCEL.EFFECTIVE_YEAR <= YEAR({ fn NOW() })) "+
                            "GROUP by " + field +
                            " HAVING      (NOT (" + field + " IS NULL))";
                break;
        }
        return sql;
    }
}