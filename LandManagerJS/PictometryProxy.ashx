<%@ WebHandler Language="C#" Class="ImageNavigatorProxy" %>

using System;
using System.Globalization;
using System.IO;
using System.Web;
using System.Net;
using System.Text;
using System.Security.Cryptography;

public class ImageNavigatorProxy : IHttpHandler
{    
    
    public void ProcessRequest (HttpContext context)
    {
		// Path to Image Navigator Server.
//      String ImageNavigatorServer = "https://dev.pictometry.com/ImageNavigator/portal/?";
        String ImageNavigatorServer = "https://pol.pictometry.com/imagenavigator/v12/portal/?";

		//PUBLIC Signature Key. A valid key must be obtained from Pictometry before this proxy can work.
        //String SignatureKey = "AE3BB48A008288F3D755C02C8394B0E907FE6578AF8C29762D726AD354E885F7FFFE54A7B0A1C13719B7E942C3D5F3239CD8DF09045CD81EEC3DE1E61908F6F1A8C0109061F0054AA80CE8D305033293C2ED4F6DB34001B0A470D180DF1D6E8CC64AA4E368482E1FE143076224338C26AAB78EEF38BBFAB67DD8595252F5650C";

        //INTERNAL Signature Key. A valid key must be obtained from Pictometry before this proxy can work.
        String SignatureKey = "04A69AF2AA80DDAA4BB749A0B481A9E8DCB8F7ACD843B90BF351DF0316CF85E37A0F39617255512F704D327C135C11B95A1B6E647384D8DF0EF232A8A0A1FFD906BA78F9F90780CA9CD2427E78272815F8BFF5504CA718D4C22052A71E23AE9E906204251F4E2675BD3D1234660A0D1EE88ED37FC414A863B0638AD6B7091CDD";
        
        //String SignatureKey = "";
		// Process GET request.
        if( context.Request.HttpMethod == "GET" )
        {
			try
			{
				HttpWebRequest myHttpWebRequest = (HttpWebRequest)WebRequest.Create(ImageNavigatorServer);
				myHttpWebRequest.Method = "POST";
				myHttpWebRequest.ServicePoint.Expect100Continue = false;
                myHttpWebRequest.ContentType = "application/x-www-form-urlencoded";
                //myHttpWebRequest.ContentType = "application/json";

				// Prepare the parameters for sending.
				System.Text.UTF8Encoding encoding = new System.Text.UTF8Encoding();
				StringBuilder searchParams = new StringBuilder();
				StringBuilder hashParam = new StringBuilder();
				bool first = true;
				foreach (string key in context.Request.QueryString.Keys)
				{
					// Build the string to be hashed from the query values.
					hashParam.Append(context.Request.QueryString[key]);
					searchParams.AppendFormat(CultureInfo.InvariantCulture, "{0}{1}={2}", 
					  first ? String.Empty : "&",
					  context.Server.UrlEncode(key), 
					  context.Server.UrlEncode(context.Request.QueryString[key]));
					first = false;
				}

				// Append the Signature Key.
				hashParam.Append(SignatureKey);

				// Compute MD5 hash.
				StringBuilder hashResult = new StringBuilder();
				byte[] hashData;

				MD5 hashMD5 = new MD5CryptoServiceProvider();
				hashData = hashMD5.ComputeHash(Encoding.ASCII.GetBytes(hashParam.ToString().ToCharArray()));
				for (int i = 0; i < hashData.Length; i++)
				{
					hashResult.Append(hashData[i].ToString("x2"));
				}

				// Append signature to the end of the query string.
				searchParams.AppendFormat(CultureInfo.InvariantCulture, "{0}{1}={2}", "&",
					  context.Server.UrlEncode("ds"), 
					  context.Server.UrlEncode(hashResult.ToString()));

				// Encode the request.
				byte[] bytes = encoding.GetBytes(searchParams.ToString());

				// Write to the server.
				Stream myRequestStream = myHttpWebRequest.GetRequestStream();
				myRequestStream.Write(bytes, 0, bytes.Length);
				myRequestStream.Close();

				// Pick up the response.
				HttpWebResponse myHttpWebResponse = (HttpWebResponse)myHttpWebRequest.GetResponse();
				Stream myResponseStream = myHttpWebResponse.GetResponseStream();
				Encoding myEncoding = Encoding.GetEncoding("utf-8");

				string ctype = myHttpWebResponse.GetResponseHeader("Content-Type");
				if( ctype == "text/html" )
				{
					StreamReader myStreamReader = new StreamReader(myResponseStream, myEncoding);

					// Read 256 characters at a time
					StringBuilder myStringBuilder = new StringBuilder();
					Char[] buffer = new Char[256];
					int count = myStreamReader.Read(buffer, 0, 256);

					while (count > 0)
					{
						myStringBuilder.Append(new String(buffer, 0, count));
						count = myStreamReader.Read(buffer, 0, 256);
					}

					myHttpWebResponse.Close();
					context.Response.ContentType = "text/html";
					context.Response.Write(myStringBuilder.ToString());
				}
				else
				{
					BinaryReader myStreamReader = new BinaryReader(myResponseStream, myEncoding);
					context.Response.AppendHeader("Content-Type", ctype);
					context.Response.AppendHeader("Content-Disposition", myHttpWebResponse.GetResponseHeader("Content-Disposition"));
					context.Response.AppendHeader("Pragma", myHttpWebResponse.GetResponseHeader("Pragma"));
					context.Response.AppendHeader("Expires", myHttpWebResponse.GetResponseHeader("Expires"));

					// Read 256 characters at a time
					byte[] buffer = new byte[256];
					int count = myStreamReader.Read(buffer, 0, 256);

					// Read the data from the input stream and write to the output stream.
					while (count > 0)
					{
						context.Response.OutputStream.Write(buffer, 0, count);
						count = myStreamReader.Read(buffer, 0, 256);
					}
				}

				// Close out the response.
				myHttpWebResponse.Close();
			}
			catch( WebException webExcp )
			{
				// If you reach this point, an exception has been caught.
            	context.Response.ContentType = "text/html";

				WebExceptionStatus status =  webExcp.Status;
    			if( status == WebExceptionStatus.ProtocolError )
				{
        			// Get HttpWebResponse so that you can check the HTTP status code.
        			HttpWebResponse httpResponse = (HttpWebResponse)webExcp.Response;

					// Return the HTTP status code to the client.
					context.Response.StatusCode = (int)httpResponse.StatusCode;
    			}
			}
        }
		else if( context.Request.HttpMethod == "POST" )
		{
			try
			{
				HttpWebRequest myHttpWebRequest = (HttpWebRequest)WebRequest.Create(ImageNavigatorServer);
				myHttpWebRequest.Method = "POST";
				myHttpWebRequest.ServicePoint.Expect100Continue = false;
                myHttpWebRequest.ContentType = "application/x-www-form-urlencoded";
                //myHttpWebRequest.ContentType = "application/json";

				// Prepare the parameters for sending.
				System.Text.UTF8Encoding encoding = new System.Text.UTF8Encoding();
				StringBuilder searchParams = new StringBuilder();
				StringBuilder hashParam = new StringBuilder();
				bool first = true;
				foreach (string key in context.Request.Form.Keys)
				{
					// Build the string to be hashed from the query values.
					hashParam.Append(context.Request.Form[key]);
					searchParams.AppendFormat(CultureInfo.InvariantCulture, "{0}{1}={2}", 
					  first ? String.Empty : "&",
					  context.Server.UrlEncode(key), 
					  context.Server.UrlEncode(context.Request.Form[key]));
					first = false;
				}

				// Append the Signature Key.
				hashParam.Append(SignatureKey);

				// Compute MD5 hash.
				StringBuilder hashResult = new StringBuilder();
				byte[] hashData;

				MD5 hashMD5 = new MD5CryptoServiceProvider();
				hashData = hashMD5.ComputeHash(Encoding.ASCII.GetBytes(hashParam.ToString().ToCharArray()));
				for (int i = 0; i < hashData.Length; i++)
				{
					hashResult.Append(hashData[i].ToString("x2"));
				}

				// Append signature to the end of the query string.
				searchParams.AppendFormat(CultureInfo.InvariantCulture, "{0}{1}={2}", "&",
					  context.Server.UrlEncode("ds"), 
					  context.Server.UrlEncode(hashResult.ToString()));

				// Encode the request.
				byte[] bytes = encoding.GetBytes(searchParams.ToString());

				// Write it to the server.
				Stream myRequestStream = myHttpWebRequest.GetRequestStream();
				myRequestStream.Write(bytes, 0, bytes.Length);
				myRequestStream.Close();

				// Pick up the response.
				HttpWebResponse myHttpWebResponse = (HttpWebResponse)myHttpWebRequest.GetResponse();
				Stream myResponseStream = myHttpWebResponse.GetResponseStream();
				Encoding myEncoding = Encoding.GetEncoding("utf-8");

				string ctype = myHttpWebResponse.GetResponseHeader("Content-Type");
				if( ctype == "text/html" )
				{
					StreamReader myStreamReader = new StreamReader(myResponseStream, myEncoding);

					// Read 256 characters at a time
					StringBuilder myStringBuilder = new StringBuilder();
					Char[] buffer = new Char[256];
					int count = myStreamReader.Read(buffer, 0, 256);

					// Read the data from the input stream and write to the output stream.
					while (count > 0)
					{
						myStringBuilder.Append(new String(buffer, 0, count));
						count = myStreamReader.Read(buffer, 0, 256);
					}

					myHttpWebResponse.Close();
					context.Response.ContentType = "text/html";
					context.Response.Write(myStringBuilder.ToString());
				}
				else
				{
					BinaryReader myStreamReader = new BinaryReader(myResponseStream, myEncoding);
					context.Response.AppendHeader("Content-Type", ctype);
					context.Response.AppendHeader("Content-Disposition", myHttpWebResponse.GetResponseHeader("Content-Disposition"));
					context.Response.AppendHeader("Pragma", myHttpWebResponse.GetResponseHeader("Pragma"));
					context.Response.AppendHeader("Expires", myHttpWebResponse.GetResponseHeader("Expires"));

					// Read 256 characters at a time
					byte[] buffer = new byte[256];
					int count = myStreamReader.Read(buffer, 0, 256);

					// Read the data from the input stream and write to the output stream.
					while (count > 0)
					{
						context.Response.OutputStream.Write(buffer, 0, count);
						count = myStreamReader.Read(buffer, 0, 256);
					}
				}

				// Close out the response.
				myHttpWebResponse.Close();
			}
			catch( WebException webExcp )
			{
				// If you reach this point, an exception has been caught.
            	context.Response.ContentType = "text/html";

				WebExceptionStatus status =  webExcp.Status;
    			if( status == WebExceptionStatus.ProtocolError )
				{
        			// Get HttpWebResponse so that you can check the HTTP status code.
        			HttpWebResponse httpResponse = (HttpWebResponse)webExcp.Response;

					// Return the HTTP status code to the client.
					context.Response.StatusCode = (int)httpResponse.StatusCode;
    			}
			}
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
