using System;
using System.Collections.Generic;
//using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Data;
using System.Data.SqlClient;
using System.IO;

public partial class pictureDownload : System.Web.UI.Page
{
    public string oid = null;
    public string layer = null;
    SqlConnection conn = null;
    protected void Page_Load(object sender, EventArgs e)
    {
        oid = Request.Params["oid"];
        layer = Request.Params["layer"];
    }

    protected void Button1_Click(object sender, EventArgs e)
    {
        if (FileUpload1.HasFile)
            try
            {
                //insert value
                string sql = "update dbo.OffenderTBL Set Image = 'offenderModule/offenderImages/" + FileUpload1.FileName + "' WHERE(id = " + oid + ")";

                string connectionInfo = System.Configuration.ConfigurationManager.AppSettings["offenderConnect"];
                conn = new SqlConnection(connectionInfo);
                conn.Open();

                SqlCommand cmdIns = new SqlCommand(sql, conn);
                cmdIns.ExecuteNonQuery();
                conn.Close();

                //upload the image
                string filepath = @"E:\\WebSites\\LandManagerJS\\offenderModule\\OffenderImages\\";
                FileUpload1.SaveAs(filepath + "\\" +  FileUpload1.FileName);
                Label1.Text = "File name: " +
                     FileUpload1.PostedFile.FileName + "<br/>" +
                     FileUpload1.PostedFile.ContentLength + " kb<br/>" +
                     "Content type: " +
                     FileUpload1.PostedFile.ContentType + "<br>Upload Successfull!";
                

            }
            catch (Exception ex)
            {
                Label1.Text = "ERROR: " + ex.Message.ToString();
                //if (conn.State
            } 
        else
        {
            Label1.Text = "You have not specified a file.";
        }
    }
}