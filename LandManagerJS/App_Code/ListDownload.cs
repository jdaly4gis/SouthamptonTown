using System;
using System.Collections.Generic;
using System.Collections;
using System.Configuration;
using System.Web;
using System.IO;
using System.Data.SqlClient;
using System.Data;


namespace MailingListHTTPHandler
{

    public class ListDownload : IHttpHandler
    {

        SqlConnection conn = null;
        SqlDataReader rdr = null;
        Object login = null;
        ArrayList parcel_list = new ArrayList();
        string parcel_ids;
        string typedata;

        public ListDownload()
        {
            string connectionInfo = System.Configuration.ConfigurationManager.AppSettings["governConnect"];
            conn = new SqlConnection(connectionInfo);
            login = OpenConnection();
        }

        public ListDownload(string parcel_ids, string typedata)
            : this()
        {
            this.parcel_ids = parcel_ids;
            this.typedata = typedata;
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

        public MemoryStream GetData()
        {
            MemoryStream rstream = new MemoryStream();

            try
            {
                SqlCommand cmd;
                if (this.typedata == "1")
                {
                    cmd = new SqlCommand("SELECT PC_PARCEL.P_ID,PC_PARCEL.TAX_MAP,NA_NAMES.FREE_LINE_1, NA_NAMES.FREE_LINE_2, NA_NAMES.FREE_LINE_3, NA_NAMES.FREE_LINE_4, NA_NAMES.FREE_LINE_5 FROM (NA_NAMES INNER JOIN NA_MAILING_INDEX ON NA_NAMES.NA_ID = NA_MAILING_INDEX.NA_ID) INNER JOIN PC_PARCEL ON NA_MAILING_INDEX.REF_ID = PC_PARCEL.P_ID WHERE (NA_MAILING_INDEX.SUB_SYSTEM = 'RE') AND (NA_MAILING_INDEX.PRIMARY_INDEX = - 1) AND (NA_MAILING_INDEX.MAIL_TYPE = 'o') AND (PC_PARCEL.INACTIVE_YEAR = 9999) AND PC_PARCEL.P_ID IN (" + parcel_ids + ")", conn);
                }
                else
                {
                    cmd = new SqlCommand("SELECT PC_PARCEL.P_ID,PC_PARCEL.TAX_MAP,NA_NAMES.FREE_LINE_1, NA_NAMES.FREE_LINE_2, NA_NAMES.FREE_LINE_3, NA_NAMES.FREE_LINE_4, NA_NAMES.FREE_LINE_5 FROM (NA_NAMES INNER JOIN NA_MAILING_INDEX ON NA_NAMES.NA_ID = NA_MAILING_INDEX.NA_ID) INNER JOIN PC_PARCEL ON NA_MAILING_INDEX.REF_ID = PC_PARCEL.P_ID WHERE (NA_MAILING_INDEX.SUB_SYSTEM = 'RE') AND (NA_MAILING_INDEX.PRIMARY_INDEX = - 1) AND (NA_MAILING_INDEX.MAIL_TYPE = 'o') AND (PC_PARCEL.INACTIVE_YEAR = 9999) AND PC_PARCEL.P_ID IN (" + parcel_ids + ")", conn);
                }

                rdr = cmd.ExecuteReader();
                StreamWriter sw = new StreamWriter(rstream);

                string all_labels = "";
                int count = 0;


                string row = "tm,line1,line2,line3,line4,line5";
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
                    //string label_block = arg1 + "<br>" + arg2 + "<br>" + arg3 + "<br>" + arg4 + "<br>" + arg5 + "<br>" + arg6;

                    row += "\n" + arg1 + ",\"" + arg2 + "\",\"" + arg3 + "\",\"" + arg4 + "\",\"" + arg5 + "\",\"" + arg6 + "\"";

                    //if (count % 2 == 0)
                    //{
                    //    row += "<tr><td colspan='2' height='10'><hr style='color:black;'></td></tr><tr>";
                    //}
                    all_labels += row;
                }

                sw.Write(row);
                sw.Flush();
                sw.Close();
                rstream.Close();
                conn.Close();
                conn.Dispose();
            }
            catch (Exception ex)
            {
                throw ex;
            }
            finally {
                conn.Close();
            }
            //Return the memory Stream
            return (rstream); 
        }

        public void ProcessRequest(HttpContext context)
        {
            try
            {
                System.IO.MemoryStream mstream = GetData();
                byte[] byteArray = mstream.ToArray();

                mstream.Flush();
                mstream.Close();

                context.Response.Clear();
                context.Response.AddHeader("Content-Disposition", "attachment; filename=" + context.Request.Form["txtFileName"].ToString());
                context.Response.AddHeader("Content-Length", byteArray.Length.ToString());
                context.Response.ContentType = "application/octet-stream";
                context.Response.BinaryWrite(byteArray);
            }
            catch (Exception Ex)
            {
                throw Ex;
            }
        } 

        public bool IsReusable
        {
            get
            {
                return false;
            }
        }
    }
}
