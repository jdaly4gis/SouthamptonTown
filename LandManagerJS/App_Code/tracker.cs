using System;
using System.Collections;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using JEncode;

/// <summary>
/// Summary description for credentials
/// </summary>
public class tracker
{
    AccessDataSource dataSource;

    public string insertHitCount(string ipAddress)
    {
        string query = "INSERT INTO hitTable (ipAddress,entryDate) VALUES ('" + ipAddress + "', '" + String.Format("{0:MM/dd/yyyy}", DateTime.Today) +"');";
        //dataSource = new AccessDataSource();
	dataSource = new AccessDataSource(@"E:\\WebSites\\LandManagerJS\\tracker\\hitTracker.mdb", "INSERT INTO hitTable (ipAddress,entryDate) VALUES ('" + ipAddress + "', '" + String.Format("{0:MM/dd/yyyy}", DateTime.Today) + "');");
        //dataSource.DataFile = @"E:\\WebSites\\LandManagerJS\\tracker\\hitTracker.mdb";
        dataSource.InsertCommand = query;
        dataSource.Insert();

        return "";
    }
    public string getHitCount(string sender)
    {
        dataSource = new AccessDataSource();
        dataSource.DataFile = "tracker/hitTracker.mdb";
        dataSource.SelectCommand = "SELECT Count(hitTable.entryDate) AS CountOfentryDate FROM hitTable;";

        DataView dv = (DataView)dataSource.Select(DataSourceSelectArguments.Empty);
        DataTable dt = dv.ToTable();
        dataSource.Dispose();
        dv.Dispose();
        
        string[] tblJson = null;
        tblJson = new string[dt.Rows.Count];
        string ss = "{\"items\": { \"count\":" + dt.Rows[0]["CountOfentryDate"] + "}}";
        return (ss);

    }
}