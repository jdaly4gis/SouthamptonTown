using System;
using System.Data;
using System.Configuration;
using System.Collections;

using System.Collections.Generic;
using System.Web;
using System.Web.Security;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Web.UI.WebControls.WebParts;
using System.Web.UI.HtmlControls;
using System.Data.SqlClient;

/// <summary>
/// Summary description for SqlServerConnect
/// </summary>
public class ParcelToUser
{
    SqlConnection conn = null;
    SqlDataReader rdr = null;
    Object login = null;
    string userid = null;
    ArrayList parcel_list = new ArrayList();

    public Object GetLoginStatus
    {
        get
        {
            return login;
        }
    }

    public ParcelToUser(string userid)
    {
        this.userid = userid;

        string connectionInfo = System.Configuration.ConfigurationManager.AppSettings["governConnect"];
        conn = new SqlConnection(connectionInfo);
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

    public ArrayList GetParcelIDs()
    {
        SqlCommand cmd = new SqlCommand("SELECT TOP 10 * FROM PC_EXTERNAL WHERE USR_ID='" + this.userid + "'", conn);
        //        SqlCommand cmd = new SqlCommand("SELECT * FROM PC_EXTERNAL_TESTJJC WHERE USR_ID='" + this.userid + "'", conn);
        try
        {
            rdr = cmd.ExecuteReader();
        }
        finally {
            conn.Close();
        }
        while (rdr.Read())
        {
            string parcel_id = rdr[1].ToString();
            parcel_list.Add(parcel_id);
        }
        
        return (parcel_list);
    }

    public Hashtable GetYearParams()
     {
         Hashtable paramyear = new Hashtable();
         SqlCommand cmd = new SqlCommand("SELECT PARAMETER_NAME,PARAMETER_VALUE FROM USR_WEB_MENU_PARAM WHERE MENU_ID=15", conn);

         try
         {
             rdr = cmd.ExecuteReader();
         }
         finally
         {
             conn.Close();
         }

         while (rdr.Read())
         {
             string param = rdr[0].ToString();
             string year = rdr[1].ToString();
             paramyear.Add(param, year);
         }

         return (paramyear);
    }

    public string GetMailingLabelInfo(string parcel_ids, string typedata)
    {
        string foo = parcel_ids;

        SqlCommand cmd;
        if (typedata == "1")
        {
            cmd = new SqlCommand("SELECT PC_PARCEL.P_ID,PC_PARCEL.TAX_MAP,NA_NAMES.FREE_LINE_1, NA_NAMES.FREE_LINE_2, NA_NAMES.FREE_LINE_3, NA_NAMES.FREE_LINE_4, NA_NAMES.FREE_LINE_5 FROM (NA_NAMES INNER JOIN NA_MAILING_INDEX ON NA_NAMES.NA_ID = NA_MAILING_INDEX.NA_ID) INNER JOIN PC_PARCEL ON NA_MAILING_INDEX.REF_ID = PC_PARCEL.P_ID WHERE (NA_MAILING_INDEX.SUB_SYSTEM = 'RE') AND (NA_MAILING_INDEX.PRIMARY_INDEX = - 1) AND (NA_MAILING_INDEX.MAIL_TYPE = 'o') AND (PC_PARCEL.INACTIVE_YEAR = 9999) AND PC_PARCEL.P_ID IN (" + parcel_ids + ")", conn);
        }
        else
        {
            cmd = new SqlCommand("SELECT PC_PARCEL.P_ID,PC_PARCEL.TAX_MAP,NA_NAMES.FREE_LINE_1, NA_NAMES.FREE_LINE_2, NA_NAMES.FREE_LINE_3, NA_NAMES.FREE_LINE_4, NA_NAMES.FREE_LINE_5 FROM (NA_NAMES INNER JOIN NA_MAILING_INDEX ON NA_NAMES.NA_ID = NA_MAILING_INDEX.NA_ID) INNER JOIN PC_PARCEL ON NA_MAILING_INDEX.REF_ID = PC_PARCEL.P_ID WHERE (NA_MAILING_INDEX.SUB_SYSTEM = 'RE') AND (NA_MAILING_INDEX.PRIMARY_INDEX = - 1) AND (NA_MAILING_INDEX.MAIL_TYPE = 'o') AND (PC_PARCEL.INACTIVE_YEAR = 9999) AND PC_PARCEL.P_ID IN (" + parcel_ids + ")", conn);
        }
        
        string all_labels = "";
        try
        {
            rdr = cmd.ExecuteReader();
            int count = 0;

            while (rdr.Read())
            {
                count++;
                string arg0 = rdr[0].ToString(); //PC_PARCEL.P_ID
                string arg1 = rdr[1].ToString(); //PC_PARCEL.TAX_MAP
                string arg2 = rdr[2].ToString(); //NA_NAMES.FREE_LINE_1
                string arg3 = rdr[3].ToString(); //NA_NAMES.FREE_LINE_2
                string arg4 = rdr[4].ToString(); //NA_NAMES.FREE_LINE_3
                string arg5 = rdr[5].ToString(); //NA_NAMES.FREE_LINE_4
                string arg6 = rdr[6].ToString(); //NA_NAMES.FREE_LINE_5
                string label_block = arg1 + "<br>" + arg2 + "<br>" + arg3 + "<br>" + arg4 + "<br>" + arg5 + "<br>" + arg6;
                string row = "<td class='print'>" + label_block + "</td>";
                if (count % 2 == 0)
                {
                    row += "</tr>";
                }
                all_labels += row;
            }
        }
        finally
        {
            conn.Close();
        }
        return (all_labels);
    }
}


