using System;
using System.Collections;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;
using System.Web;
using JEncode;
using System.Data;

/// <summary>
/// Summary description for Class1
/// </summary>
public class GovernConnect
{
    private SqlConnection conn = null;
    private string query = null;
    private object login = null;

	public GovernConnect()
	{
        login = OpenConnection();
	}

	public GovernConnect(string q) : this()
	{
        this.query = q;
	}

    public Object OpenConnection()
    {
        string connectionInfo = System.Configuration.ConfigurationManager.AppSettings["GovernConnect"];
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
    public string DeleteUserRecords()
    {
        string numDeleted = "";
        try
        {
            SqlCommand command = new SqlCommand("DELETE FROM PC_EXTERNAL WHERE USR_ID='" + this.query + "'", conn);
            int rdr = 0;
            rdr = command.ExecuteNonQuery();

            numDeleted = rdr.ToString();
        }
        catch {
            conn.Close();
        }
        return (numDeleted);
    }
    public string LoadPCExternal(string ids)
    {
        string header = "{\"label\": \"PARCELS\", \"items\": [";
        string trailer = "]}";
        string jsonString = null;

        int count = 0;

        string[] parcelIds = ids.Split(':');
        string[] tblJson = new string[parcelIds.Length];

        try
        {
            foreach (string id in parcelIds)
            {
                SqlCommand command = new SqlCommand("INSERT INTO PC_EXTERNAL (USR_ID, P_ID) VALUES ('" + this.query + "','" + id + "')", conn);
                int rdr = command.ExecuteNonQuery();
                Hashtable idTable = new Hashtable();

                idTable.Add("parcel_id", id);
                idTable.Add("count", count);

                jsonString = JSON.JsonEncode(idTable);
                tblJson[count] = jsonString;
                count++;
            }
        }
        finally {
            conn.Close();
        }

        string joinedString = String.Join(",", tblJson);
         
        return(header + joinedString + trailer);
    }
    public string getPCExternal()
    {
        DataTable dt = new DataTable();
        SqlCommand command = new SqlCommand("select P_ID from PC_EXTERNAL where (USR_ID = '" + this.query + "')", conn);
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

        if (dt.Rows.Count != 0)
        {
            int ncount = 0;
            foreach (DataRow row in dt.Rows)
            {
                Hashtable taxTable = new Hashtable();
                //taxTable.Add("ID", ncount);

                tblJson[ncount] = row["P_ID"].ToString();
                ncount = ncount + 1;

            }
            returnString = "{\"items\": [\"" + String.Join(",", tblJson) + "\"]}";
        }
        else {
            returnString = "{\"items\":[]}";
        }
        dt.Dispose();
        return returnString;
    }
    public string GetYearParams()
    {
        DataTable dt = new DataTable();
        SqlCommand cmd = new SqlCommand("SELECT PARAMETER_NAME, PARAMETER_VALUE FROM dbo.USR_WEB_MENU_PARAM WHERE (PARAMETER_NAME = 'YEAR_ID_TX' OR PARAMETER_NAME = 'YEAR_ID_MA') AND (MENU_ID = 21)", conn);
        
        SqlDataAdapter adapter = new SqlDataAdapter(cmd);
        try
        {
            adapter.Fill(dt);
        }
        finally
        {
            conn.Close();
        }

        //string header = "{\"items\": [";
        //string trailer = "]}";
        string jsonString = null;
        string[] tblJson = null;
        tblJson = new string[dt.Rows.Count];
        //string returnString = "";

        if (dt.Rows.Count != 0)
        {
            //int ncount = 0;
            Hashtable taxTable = new Hashtable();
            foreach (DataRow row in dt.Rows)
            {
                //foreach (DataColumn dc in dt.Columns)
                //{
                taxTable.Add(row["PARAMETER_NAME"], row["PARAMETER_VALUE"].ToString());
                //}
            }
            jsonString = JSON.JsonEncode(taxTable);

            //tblJson[ncount] = jsonString;
            //ncount = ncount + 1;
            //returnString = header + String.Join(",", tblJson) + trailer;
        }

        dt.Dispose();
        return jsonString;
    }
}