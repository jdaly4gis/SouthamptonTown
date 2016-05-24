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
    SqlDataReader rdr = null;
    Object login = null;
    string whereClauseItem = null;
    string query = null;
    ArrayList parcel_list = new ArrayList();

    public Object GetLoginStatus
    {
        get
        {
            return login;
        }
    }

    public RetrieveQuery()
    {
        DBLogin();
    }

    public RetrieveQuery(string query)
    {
        this.query = query;
        DBLogin();
    }

    public RetrieveQuery(string whereClauseItem, string query)
    {
        this.whereClauseItem = whereClauseItem;
        this.query = query;
        DBLogin();
    }

    private void DBLogin()
    {
        conn = new SqlConnection(ConfigurationManager.ConnectionStrings["QueryVector"].ConnectionString);
        login = OpenConnection();
    }

    private Object OpenConnection()
    {
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

    public ArrayList GetSelection()
    {
        ArrayList table = new ArrayList();
        SqlCommand cmd = new SqlCommand(query, conn);
        rdr = cmd.ExecuteReader();

        while (rdr.Read())
        {
            object[] values = new object[rdr.FieldCount];
            rdr.GetValues(values);
            table.Add(values);
        }

        conn.Close();

        return (table);
    }
}


