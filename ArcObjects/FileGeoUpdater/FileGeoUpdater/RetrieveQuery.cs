using System;
using System.Data;
using System.Configuration;
using System.Collections;
using System.Collections.Generic;
using System.Web;
using System.Security;
using System.Data.SqlClient;

/// <summary>
/// Summary description for SqlServerConnect
/// </summary>
public class RetrieveQuery
{
    SqlConnection conn = null;
    Object login = null;
    string whereClauseItem = null;
    string query = null;
    ArrayList parcel_list = new ArrayList();

    public Object GetLoginStatus
    {
        get
        {
            return this.login;
        }
    }

    public RetrieveQuery()
    {
        this.conn = null;
        this.login = null;
        this.whereClauseItem = null;
        this.query = null;
        this.parcel_list = null;
        this.DBLogin();
    }

    public RetrieveQuery(string query)
    {
        this.query = query;
    }

    public RetrieveQuery(string whereClauseItem, string query)
    {
        this.whereClauseItem = whereClauseItem;
    }

    private void DBLogin()
    {
        this.conn = new SqlConnection(ConfigurationManager.ConnectionStrings["QueryVector"].ConnectionString);
        this.login = this.OpenConnection();
    }

    private Object OpenConnection()
    {
        try
        {
            this.conn.Open();
        }
        catch (Exception e)
        {
            return e;
        }

        return (this.conn);
    }

    public object GetSelection()
    {

        int cnt = 0;
        Hashtable tables = new Hashtable();

        using (SqlCommand cmd = new SqlCommand("dbo.Export_TO_FGDB"))
        {
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Connection = this.conn;
            using (SqlDataReader rdr = cmd.ExecuteReader(CommandBehavior.CloseConnection))
            {
                while (rdr.Read())
                {
                    string tabname = rdr.GetString(rdr.GetOrdinal("table_name"));
                    tabname = "VECTOR.SDEADMIN." + tabname;
                    tables.Add(tabname, cnt);
                    cnt++;
                }
                rdr.Close();
            }
        }

        return (tables);
    }
}


