using System;
using System.Data;
using System.Collections;
using System.Configuration;
using System.Web;
using System.Web.Security;
using System.Web.UI;
using System.Data.SqlClient;
using System.Web.UI.WebControls;
using System.Web.UI.WebControls.WebParts;
using System.Web.UI.HtmlControls;
using JEncode;
using System.Drawing.Imaging;
using System.Collections.ObjectModel;
using System.Collections.Generic;
using System.Web.Script.Serialization;

/// <summary>
/// Summary description for DataAccess
/// </summary>
public class DataAccess 
{
    string sql;
    object login = null;
    string query = null;
    string start = null;
    string parcelID = null;
    string yearID = null;
    string frozenID = null;
    string dept = null;
    string permitType = null;
    string inspector = null;
    string startDate = null;
    string endDate = null;
    public SqlConnection conn = null;
    SqlDataReader rdr = null;
    AccessDataSource dataSource;

    public DataAccess()
    {
        login = OpenConnection();
    }

    public DataAccess(string q)
    {
        this.query = q;
        login = OpenConnection();
    }

    public DataAccess(string q, string s, string sender, string type)
    {
        if (sender == "parcel")
        {
            if (!(q == null))
            {
                this.query = q.Replace("*", "%");
                this.query = q.Replace("-", " - ");
                this.start = s;
                if (type == "14") {
                    login = govWebConnection();
                }
                else
                {
                    login = OpenConnection();
                }
            }
            else
            {
                q = "";
                this.query = q.Replace("*", "%");
                this.query = q.Replace("-", " - ");
                this.start = s;
                login = OpenConnection();
            }
        }
        else if (sender == "offenderLyr")
        {
            offenderConnection();
        } 
        else
        {
            login = govWebConnection();
        }


    }

    private object GetLoginStatus
    {
        get
        {
            return login;
        }
    }
 
    private Object OpenConnection()
    {
        string connectionInfo = System.Configuration.ConfigurationManager.AppSettings["ProliantParcelsConnect"];
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
    private Object govWebConnection()
    {
        string connectionInfo = System.Configuration.ConfigurationManager.AppSettings["governConnect"];
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
    private Object offenderConnection()
    {
        string connectionInfo = System.Configuration.ConfigurationManager.AppSettings["offenderConnect"];
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

    private string GetSearchType(string searchType)
    {
        switch (Convert.ToInt32(searchType))
        {
            case 1:
                //sql = "SELECT TOP (11) P_ID,TAX_MAP,TAX_MAP_UFMT,DSBL,INACTIVE_YEAR,FIRST_NAME,MID_INITIAL,LAST_NAME,COMPANY,CLASS,ROLL_SECTION,FORMATED_ADDRESS,CITY FROM EXPORT WHERE (P_ID LIKE '" + this.query + "') AND (P_ID NOT IN (SELECT TOP (" + this.start + ") P_ID FROM EXPORT WHERE (P_ID LIKE '" + this.query + "')ORDER BY P_ID)) ORDER BY P_ID";
                //sql = "SELECT TOP (100) PERCENT OBJECTID, PARCEL_ID, DSBL, HAMLET FROM  SDEadmin.Tax_Parcels_VW WHERE (PARCEL_ID LIKE '" + this.query + "') AND  (NOT (PARCEL_ID IN (SELECT TOP (" + this.start + ") PARCEL_ID FROM SDEadmin.Tax_Parcels_VW WHERE (PARCEL_ID LIKE '" + this.query + "')  ORDER BY PARCEL_ID))) ORDER BY PARCEL_ID";

                sql = "SELECT     TOP (100) PERCENT OBJECTID, PARCEL_ID, DSBL, HAMLET, floor " +
                        "FROM         (SELECT     OBJECTID, PARCEL_ID, DSBL, HAMLET, 1 AS floor " +
                            "FROM          SDEadmin.Tax_Parcels_VW " +
                            "UNION " +
                            "SELECT     OBJECTID, PARCEL_ID, DSBL, HAMLET, 2 AS Expr1 " +
                            "FROM         SDEadmin.TAX_PARCELS_2ND_VW " +
                            "UNION " +
                            "SELECT     OBJECTID, PARCEL_ID, DSBL, HAMLET, 3 AS Expr1 " +
                            "FROM         SDEadmin.TAX_PARCELS_3RD_VW) AS _TaxParcel_TBL " +
                        "WHERE     (PARCEL_ID LIKE '" + this.query + "') AND (NOT (PARCEL_ID IN " +
                                "(SELECT     TOP (" + this.start + ") PARCEL_ID " +
                                "FROM          (SELECT     OBJECTID, PARCEL_ID, DSBL, HAMLET, 1 AS floor " +
                                                        "FROM          SDEadmin.Tax_Parcels_VW AS Tax_Parcels_VW_1 " +
                                                        "UNION " +
                                                        "SELECT     OBJECTID, PARCEL_ID, DSBL, HAMLET, 2 AS Expr1 " +
                                                        "FROM         SDEadmin.TAX_PARCELS_2ND_VW AS TAX_PARCELS_2ND_VW_1 " +
                                                        "UNION " +
                                                        "SELECT     OBJECTID, PARCEL_ID, DSBL, HAMLET, 3 AS Expr1 " +
                                                        "FROM         SDEadmin.TAX_PARCELS_3RD_VW AS TAX_PARCELS_3RD_VW_1) AS _TaxParcel_TBL_1 " +
                                "WHERE      (PARCEL_ID LIKE '" + this.query + "') " +
                                "ORDER BY PARCEL_ID))) " +
                        "ORDER BY PARCEL_ID";


                break;
            case 2:
                //sql = "SELECT TOP (11) P_ID,TAX_MAP,TAX_MAP_UFMT,DSBL,INACTIVE_YEAR,FIRST_NAME,MID_INITIAL,LAST_NAME,COMPANY,CLASS,ROLL_SECTION,FORMATED_ADDRESS,CITY FROM EXPORT WHERE (DSBL LIKE '" + this.query + "') AND (P_ID NOT IN (SELECT TOP (" + this.start + ") P_ID FROM EXPORT WHERE (DSBL LIKE '" + this.query + "')  AND (NOT (DSBL LIKE '3%')) ORDER BY DSBL)) AND (NOT (DSBL LIKE '3%')) ORDER BY DSBL";
                sql = "SELECT TOP (100) PERCENT  OBJECTID, PARCEL_ID, DSBL, Address, floor "  +
                        "FROM         (SELECT     OBJECTID, PARCEL_ID, DSBL, HAMLET, address, 1 AS floor " +
                            "FROM          SDEadmin.Tax_Parcels_VW " +
                            "UNION " +
                            "SELECT     OBJECTID, PARCEL_ID, DSBL, HAMLET, address, 2 AS Expr1 " +
                            "FROM         SDEadmin.TAX_PARCELS_2ND_VW " +
                            "UNION " +
                            "SELECT     OBJECTID, PARCEL_ID, DSBL, HAMLET, address, 3 AS Expr1 " +
                            "FROM         SDEadmin.TAX_PARCELS_3RD_VW) AS _TaxParcel_TBL " +
                            " WHERE (DSBL LIKE '" + this.query + "')  AND (NOT (PARCEL_ID IN (SELECT TOP (" + this.start + ") PARCEL_ID " +
                        "FROM         (SELECT     OBJECTID, PARCEL_ID, DSBL, HAMLET, address, 1 AS floor " +
                            "FROM          SDEadmin.Tax_Parcels_VW " +
                            "UNION " +
                            "SELECT     OBJECTID, PARCEL_ID, DSBL, HAMLET, address, 2 AS Expr1 " +
                            "FROM         SDEadmin.TAX_PARCELS_2ND_VW " +
                            "UNION " +
                            "SELECT     OBJECTID, PARCEL_ID, DSBL, HAMLET, address, 3 AS Expr1 " +
                            "FROM         SDEadmin.TAX_PARCELS_3RD_VW) AS _TaxParcel_TBL " +
                            " WHERE (DSBL LIKE '" + this.query + "')  ORDER BY DSBL))) ORDER BY DSBL";
                break;
            case 3:
                //sql = "SELECT TOP (11) P_ID,TAX_MAP,TAX_MAP_UFMT,DSBL,INACTIVE_YEAR,FIRST_NAME,MID_INITIAL,LAST_NAME,COMPANY,CLASS,ROLL_SECTION,FORMATED_ADDRESS,CITY FROM EXPORT WHERE (LAST_NAME LIKE '" + this.query + "') AND (P_ID NOT IN (SELECT TOP (" + this.start + ") P_ID FROM EXPORT WHERE (LAST_NAME LIKE '" + this.query + "')  AND (NOT (DSBL LIKE '3%')) ORDER BY LAST_NAME)) AND (NOT (DSBL LIKE '3%')) ORDER BY LAST_NAME";
                sql = "SELECT TOP (100) PERCENT OBJECTID, PARCEL_ID, DSBL, HAMLET, LAST_NAME,FIRST_NAME, ADDRESS, 1 as floor FROM  SDEadmin.Tax_Parcels_VW WHERE NOT(LAST_NAME IS NULL) AND (LAST_NAME <> ' ') AND (LAST_NAME LIKE '" + this.query + "') AND (NOT (PARCEL_ID IN (SELECT TOP (" + this.start + ") PARCEL_ID  FROM SDEadmin.Tax_Parcels_VW  WHERE (LAST_NAME LIKE '" + this.query + "') AND NOT(LAST_NAME IS NULL) AND (LAST_NAME <> ' ') ORDER BY LAST_NAME))) ORDER BY LAST_NAME, FIRST_NAME";
                break;
            case 4:
                //sql = "SELECT TOP (11) P_ID,TAX_MAP,TAX_MAP_UFMT,DSBL,INACTIVE_YEAR,FIRST_NAME,MID_INITIAL,LAST_NAME,COMPANY,CLASS,ROLL_SECTION,FORMATED_ADDRESS,CITY FROM EXPORT WHERE (FORMATED_ADDRESS LIKE '" + this.query + "') AND (P_ID NOT IN (SELECT TOP (" + this.start + ") P_ID FROM EXPORT WHERE (FORMATED_ADDRESS LIKE '" + this.query + "')  AND (NOT (DSBL LIKE '3%'))ORDER BY FORMATED_ADDRESS)) AND (NOT (DSBL LIKE '3%')) ORDER BY FORMATED_ADDRESS";
                //if (Convert.ToInt32(this.start) <= 20)
                //{
                sql = "SELECT TOP (100) PERCENT OBJECTID, PARCEL_ID, DSBL, ADDRESS, HAMLET, floor " +
                        "FROM         (SELECT     OBJECTID, PARCEL_ID, DSBL, HAMLET, address, 1 AS floor " +
                            "FROM          SDEadmin.Tax_Parcels_VW " +
                            "UNION " +
                            "SELECT     OBJECTID, PARCEL_ID, DSBL, HAMLET, address, 2 AS Expr1 " +
                            "FROM         SDEadmin.TAX_PARCELS_2ND_VW " +
                            "UNION " +
                            "SELECT     OBJECTID, PARCEL_ID, DSBL, HAMLET, address, 3 AS Expr1 " +
                            "FROM         SDEadmin.TAX_PARCELS_3RD_VW) AS _TaxParcel_TBL " +
                            " WHERE (ADDRESS LIKE N'" + this.query + "') AND (ADDRESS <> '') AND (NOT (PARCEL_ID IN (SELECT TOP (" + this.start + ") PARCEL_ID " +
                        "FROM         (SELECT     OBJECTID, PARCEL_ID, DSBL, HAMLET, address, 1 AS floor " +
                            "FROM          SDEadmin.Tax_Parcels_VW " +
                            "UNION " +
                            "SELECT     OBJECTID, PARCEL_ID, DSBL, HAMLET, address, 2 AS Expr1 " +
                            "FROM         SDEadmin.TAX_PARCELS_2ND_VW " +
                            "UNION " +
                            "SELECT     OBJECTID, PARCEL_ID, DSBL, HAMLET, address, 3 AS Expr1 " +
                            "FROM         SDEadmin.TAX_PARCELS_3RD_VW) AS _TaxParcel_TBL " +
                            " WHERE (ADDRESS LIKE '" + this.query + "') AND (ADDRESS <> '') ORDER BY ADDRESS))) ORDER BY ADDRESS";
                //}
                //else {
                //    sql = "SELECT TOP (200) OBJECTID, PARCEL_ID, DSBL, ADDRESS, HAMLET FROM SDEadmin.Tax_Parcels_VW WHERE (ADDRESS LIKE N'" + this.query + "') AND (ADDRESS <> '') AND (NOT (PARCEL_ID IN (SELECT TOP (" + this.start + ") PARCEL_ID FROM SDEadmin.Tax_Parcels_VW WHERE (ADDRESS LIKE '" + this.query + "') AND (ADDRESS <> '') ORDER BY ADDRESS))) ORDER BY ADDRESS";
                //}
                break;
            case 5:
                sql = "SELECT     TOP (100) PERCENT dbo.PC_LK_PARCEL_BLDG.P_ID as [P ID], CAST(MA_BUILDINGS.BLDG_ID AS varchar(8)) + '.' + CAST(MA_BUILDINGS.BLDG_SEQ AS varchar(3)) as  [BLDG ID], " +
                      "dbo.VT_USR_MODEL.LONG_DESC AS [Model Description], dbo.VT_USR_BLDGUSE.LONG_DESC as [Use Description], " +
                      "dbo.MA_BUILDINGS.YEAR_BUILT as [Year Built], dbo.MA_BUILDINGS.EYB [Effective Year Built], dbo.MA_BUILDINGS.TOTAL_VALUE AS Value, " +
                      "dbo.MA_BUILDINGS.TOTAL_LIVING_AREA AS  [Living Area], dbo.MA_BUILDINGS.TOTAL_ACTUAL as [Total Area], dbo.MA_BUILDINGS.MS9010_CD AS [%COMPLETE],  dbo.MA_BUILDINGS.SETAB16_CD AS Beds, dbo.MA_BUILDINGS.SETAB10_CD + '.' + ISNULL(dbo.MA_BUILDINGS.SETAB11_CD,  '00') AS Baths " +
                      "FROM  dbo.MA_BUILDINGS INNER JOIN " +
                      "dbo.PC_LK_PARCEL_BLDG ON dbo.MA_BUILDINGS.BLDG_ID = dbo.PC_LK_PARCEL_BLDG.BLDG_ID AND " +
                      "dbo.MA_BUILDINGS.BLDG_SEQ = dbo.PC_LK_PARCEL_BLDG.BLDG_SEQ INNER JOIN " +
                      "dbo._YEAR_MA ON dbo.MA_BUILDINGS.YEAR_ID = dbo._YEAR_MA.CURRENT_FY INNER JOIN " +
                      "dbo.MA_BUILDINGS_2 ON dbo.MA_BUILDINGS.YEAR_ID = dbo.MA_BUILDINGS_2.YEAR_ID AND " +
                      "dbo.MA_BUILDINGS.FROZEN_ID = dbo.MA_BUILDINGS_2.FROZEN_ID AND dbo.MA_BUILDINGS.BLDG_ID = dbo.MA_BUILDINGS_2.BLDG_ID AND " +
                      "dbo.MA_BUILDINGS.BLDG_SEQ = dbo.MA_BUILDINGS_2.BLDG_SEQ INNER JOIN " +
                      "dbo.VT_USR_MODEL ON dbo.MA_BUILDINGS.BLDG_MODEL_CODE = dbo.VT_USR_MODEL.CODE INNER JOIN " +
                      "dbo.VT_USR_BLDGUSE ON dbo.MA_BUILDINGS.BLDG_USE_CODE = dbo.VT_USR_BLDGUSE.CODE AND " +
                      "dbo.MA_BUILDINGS.YEAR_ID = dbo.VT_USR_BLDGUSE.YEAR_ID " +
                        "WHERE     (dbo.PC_LK_PARCEL_BLDG.INACTIVE_YEAR = 9999) AND (dbo.MA_BUILDINGS.FROZEN_ID = 0) AND (dbo.PC_LK_PARCEL_BLDG.P_ID = " + this.parcelID + ")";


                break;
                case 6:
                    sql = "SELECT     TOP (100) PERCENT dbo.PC_LK_PARCEL_SALE.P_ID AS [P ID], CAST(MA_SALES.SALE_DATE AS varchar(11)) AS [Sale Date], MA_SALES.DEED_BOOK AS [Deed Book], " +
                     " MA_SALES.DEED_PAGE AS [Deed Page], MA_SALES.DOCUMENT_NO AS [Document #], VT_USR_QUAL.LONG_DESC AS Qualification, VT_USR_SALADJ.LONG_DESC AS [Adj Reason],  " +
                     " MA_SALES.SALE_PRICE AS [Sale Price], MA_SALES.SUBJECT_SALE_PRICE AS [Subject Sale Price], VT_USR_SACDCODE.LONG_DESC AS [Condition Code],  " +
                      "VT_USR_SALINS.LONG_DESC AS Instrument, MA_SALES.VACANT, MA_SALES.FROZEN_ID AS [FROZEN ID], MA_SALES.YEAR_ID AS [Year ID], MA_SALES.SALE_ID AS [Sale ID] " +
                     "   FROM         dbo.MA_SALES AS MA_SALES INNER JOIN " +
                      "dbo.PC_LK_PARCEL_SALE ON MA_SALES.SALE_ID = dbo.PC_LK_PARCEL_SALE.SALE_ID LEFT OUTER JOIN " +
                      "dbo.VT_USR_SACDCODE AS VT_USR_SACDCODE ON MA_SALES.CONDITION_CODE = VT_USR_SACDCODE.CODE LEFT OUTER JOIN " +
                      "dbo.VT_USR_SALADJ AS VT_USR_SALADJ ON MA_SALES.ADJ_REASONS = VT_USR_SALADJ.CODE LEFT OUTER JOIN " +
                      "dbo.VT_USR_QUAL AS VT_USR_QUAL ON MA_SALES.QUALIFICATION = VT_USR_QUAL.CODE LEFT OUTER JOIN " +
                      "dbo.VT_USR_SALINS AS VT_USR_SALINS ON MA_SALES.INSTRUMENT = VT_USR_SALINS.CODE "+
                        "WHERE     (dbo.PC_LK_PARCEL_SALE.P_ID = " + this.parcelID + ") " +
                        "ORDER BY MA_SALES.SALE_ID"; 
                    break;
                case 7:
                    sql = "SELECT dbo.PC_DEPT_INFO.P_ID as [Parcel ID], dbo.PC_DOC_LOCATOR.PATH_EXTERNAL as Image, dbo.VT_USR_DEPINF.LONG_DESC as Type, Cast(dbo.PC_DEPT_INFO.ENTRY_DATE as varchar(11)) as ENTRY_DATE FROM dbo.PC_DEPT_INFO INNER JOIN dbo.PC_DOC_LOCATOR ON dbo.PC_DEPT_INFO.DOCUMENT_LOCATOR = dbo.PC_DOC_LOCATOR.DOCUMENT_LOCATOR INNER JOIN dbo.VT_USR_DEPINF ON dbo.PC_DEPT_INFO.DEPT = dbo.VT_USR_DEPINF.DEPT AND  dbo.PC_DEPT_INFO.CODE = dbo.VT_USR_DEPINF.CODE WHERE (NOT (dbo.PC_DOC_LOCATOR.PATH_EXTERNAL IS NULL)) AND (dbo.PC_DEPT_INFO.CODE IN ('salepic', 'bldgpic') AND (dbo.PC_DEPT_INFO.P_ID = " + this.parcelID + ")) ORDER BY  dbo.PC_DEPT_INFO.ENTRY_DATE DESC";
                    break;
            case 8:
                    sql = "SELECT     TOP (100) PERCENT dbo.PC_LK_PARCEL_BLDG.P_ID AS [P ID], CAST(dbo.MA_BUILDINGS.BLDG_ID AS varchar(8)) " +
                      "+ '.' + CAST(dbo.MA_BUILDINGS.BLDG_SEQ AS varchar(3)) AS [BLDG ID], dbo.VT_USR_MODEL.LONG_DESC AS [Model Description], " + 
                      "dbo.VT_USR_BLDGUSE.LONG_DESC AS [Use Description], dbo.MA_BUILDINGS.YEAR_BUILT AS [Year Built], dbo.MA_BUILDINGS.EYB AS [Effective Year Built], "+
                      "dbo.MA_BUILDINGS.TOTAL_VALUE AS Value, dbo.MA_BUILDINGS.TOTAL_LIVING_AREA AS [Living Area], dbo.MA_BUILDINGS.TOTAL_ACTUAL AS [Total Area], "+
                      "dbo.MA_BUILDINGS.MS9010_CD AS [%COMPLETE], dbo.MA_BUILDINGS.SETAB16_CD AS Beds, "+
                      "dbo.MA_BUILDINGS.SETAB10_CD + '.' + ISNULL(dbo.MA_BUILDINGS.SETAB11_CD, '00') AS Baths, dbo.PC_LEGAL_INFO.CLASS "+
                      "  FROM dbo.MA_BUILDINGS INNER JOIN " +
                      "dbo.PC_LK_PARCEL_BLDG ON dbo.MA_BUILDINGS.BLDG_ID = dbo.PC_LK_PARCEL_BLDG.BLDG_ID AND  "+
                      "dbo.MA_BUILDINGS.BLDG_SEQ = dbo.PC_LK_PARCEL_BLDG.BLDG_SEQ INNER JOIN "+
                      "dbo._YEAR_MA ON dbo.MA_BUILDINGS.YEAR_ID = dbo._YEAR_MA.CURRENT_FY INNER JOIN "+
                      "dbo.MA_BUILDINGS_2 ON dbo.MA_BUILDINGS.YEAR_ID = dbo.MA_BUILDINGS_2.YEAR_ID AND "+
                      "dbo.MA_BUILDINGS.FROZEN_ID = dbo.MA_BUILDINGS_2.FROZEN_ID AND dbo.MA_BUILDINGS.BLDG_ID = dbo.MA_BUILDINGS_2.BLDG_ID AND "+
                      "dbo.MA_BUILDINGS.BLDG_SEQ = dbo.MA_BUILDINGS_2.BLDG_SEQ INNER JOIN "+
                      "dbo.VT_USR_MODEL ON dbo.MA_BUILDINGS.BLDG_MODEL_CODE = dbo.VT_USR_MODEL.CO[DE INNER JOIN "+
                      "dbo.VT_USR_BLDGUSE ON dbo.MA_BUILDINGS.BLDG_USE_CODE = dbo.VT_USR_BLDGUSE.CODE AND "+
                      "dbo.MA_BUILDINGS.YEAR_ID = dbo.VT_USR_BLDGUSE.YEAR_ID INNER JOIN "+
                      "dbo.PC_LEGAL_INFO ON dbo._YEAR_MA.CURRENT_FY = dbo.PC_LEGAL_INFO.YEAR_ID AND "+
                      "dbo.MA_BUILDINGS.FROZEN_ID = dbo.PC_LEGAL_INFO.FROZEN_ID AND dbo.PC_LK_PARCEL_BLDG.P_ID = dbo.PC_LEGAL_INFO.P_ID "+
                        "WHERE     (dbo.PC_LK_PARCEL_BLDG.INACTIVE_YEAR = 9999) AND (dbo.MA_BUILDINGS.FROZEN_ID = 0) AND (dbo.PC_LK_PARCEL_BLDG.P_ID IN (" + this.parcelID + "))";
                    break;
            case 9:
                sql = "SELECT TOP (100) PERCENT SUBD_NAME, MINOR, CAST(FILE_DATE AS varchar(11)) AS FILE_DATE " +
                        "FROM SDEadmin.SUBDIVISIONS_VW " +
                        "GROUP BY SUBD_NAME, MINOR, CAST(FILE_DATE AS varchar(11)) " +
                        "HAVING (NOT (SUBD_NAME IS NULL)) AND (SUBD_NAME LIKE  N'" + this.query + "') " +
                        "ORDER BY SUBD_NAME";
                    break;
            case 10:
                    sql = "SELECT     YEAR_BUILT, design, TOTAL_EFFECTIVE, TOTAL_VALUE AS BuildingValue, houseType, Quality, bedrooms, Full_baths, Half_baths, fireplace, condition, hvac, Totbaths, bsmtfin, garage, BLDG_ID, " +
                      "P_ID, YEAR_ID, FROZEN_ID " +
                        "FROM         dbo._BldgInfo_ALL " +
                        "WHERE     (P_ID = " + this.parcelID + ") AND (YEAR_ID = " + this.yearID + ") AND (FROZEN_ID = " + this.frozenID + ")";
                    break;
            case 11:
                    sql = "SELECT top (1) dbo.PC_DEPT_INFO.P_ID as [Parcel ID], dbo.PC_DOC_LOCATOR.PATH_EXTERNAL as Image, dbo.VT_USR_DEPINF.LONG_DESC as Type, Cast(dbo.PC_DEPT_INFO.ENTRY_DATE as varchar(11)) as ENTRY_DATE FROM dbo.PC_DEPT_INFO INNER JOIN dbo.PC_DOC_LOCATOR ON dbo.PC_DEPT_INFO.DOCUMENT_LOCATOR = dbo.PC_DOC_LOCATOR.DOCUMENT_LOCATOR INNER JOIN dbo.VT_USR_DEPINF ON dbo.PC_DEPT_INFO.DEPT = dbo.VT_USR_DEPINF.DEPT AND  dbo.PC_DEPT_INFO.CODE = dbo.VT_USR_DEPINF.CODE WHERE (NOT (dbo.PC_DOC_LOCATOR.PATH_EXTERNAL IS NULL)) AND (dbo.PC_DEPT_INFO.CODE IN ('salepic', 'bldgpic') AND (dbo.PC_DEPT_INFO.P_ID = " + this.parcelID + ")) ORDER BY  dbo.PC_DEPT_INFO.ENTRY_DATE";
                    break;
            case 12:
                    sql = "SELECT     P_ID, BLDG_ID, BLDG_SEQ, BLDG_MODEL_CODE, MODEL_DESC, BLDG_USE_CODE, BLDG_USE_DESC, YEAR_BUILT, EYB, BLDG_VALUE, LV_AREA, "+
                            "TOTAL_ACTUAL, [%COMPLETE], MS9010_VA, Bed, Bath "+
                            "FROM         (SELECT     TOP (100) PERCENT dbo.PC_LK_PARCEL_BLDG.P_ID, dbo.MA_BUILDINGS.BLDG_ID + dbo.MA_BUILDINGS.BLDG_SEQ * .1 AS BLDG_ID, dbo.MA_BUILDINGS.BLDG_SEQ, " +
                                                    "dbo.MA_BUILDINGS.BLDG_MODEL_CODE, dbo.VT_USR_MODEL.LONG_DESC AS MODEL_DESC, dbo.MA_BUILDINGS.BLDG_USE_CODE, "+
                                                    " dbo.VT_USR_BLDGUSE.LONG_DESC AS BLDG_USE_DESC, dbo.MA_BUILDINGS.YEAR_BUILT, dbo.MA_BUILDINGS.EYB, "+
                                                    "dbo.MA_BUILDINGS.TOTAL_VALUE AS BLDG_VALUE, dbo.MA_BUILDINGS.TOTAL_LIVING_AREA AS LV_AREA, dbo.MA_BUILDINGS.TOTAL_ACTUAL, "+
                                                    " dbo.MA_BUILDINGS.MS9010_CD AS [%COMPLETE], dbo.MA_BUILDINGS.MS9010_VA, dbo.MA_BUILDINGS.SETAB16_CD AS Bed, "+
                                                    "CAST(dbo.MA_BUILDINGS.SETAB10_CD AS int) + CAST(dbo.MA_BUILDINGS.SETAB10_CD AS int) * .1 AS Bath "+
                            "FROM          dbo.MA_BUILDINGS INNER JOIN "+
                                                    "dbo.PC_LK_PARCEL_BLDG ON dbo.MA_BUILDINGS.BLDG_ID = dbo.PC_LK_PARCEL_BLDG.BLDG_ID AND "+
                                                    " dbo.MA_BUILDINGS.BLDG_SEQ = dbo.PC_LK_PARCEL_BLDG.BLDG_SEQ INNER JOIN "+
                                                    "dbo._YEAR_MA ON dbo.MA_BUILDINGS.YEAR_ID = dbo._YEAR_MA.CURRENT_FY INNER JOIN "+
                                                    "dbo.MA_BUILDINGS_2 ON dbo.MA_BUILDINGS.YEAR_ID = dbo.MA_BUILDINGS_2.YEAR_ID AND "+
                                                    "dbo.MA_BUILDINGS.FROZEN_ID = dbo.MA_BUILDINGS_2.FROZEN_ID AND dbo.MA_BUILDINGS.BLDG_ID = dbo.MA_BUILDINGS_2.BLDG_ID AND "+
                                                    "dbo.MA_BUILDINGS.BLDG_SEQ = dbo.MA_BUILDINGS_2.BLDG_SEQ INNER JOIN "+
                                                    " dbo.VT_USR_MODEL ON dbo.MA_BUILDINGS.BLDG_MODEL_CODE = dbo.VT_USR_MODEL.CODE INNER JOIN "+
                                                    "dbo.VT_USR_BLDGUSE ON dbo.MA_BUILDINGS.BLDG_USE_CODE = dbo.VT_USR_BLDGUSE.CODE AND  "+
                                                    "dbo.MA_BUILDINGS.YEAR_ID = dbo.VT_USR_BLDGUSE.YEAR_ID "+
                            "WHERE      (dbo.PC_LK_PARCEL_BLDG.INACTIVE_YEAR = 9999) AND (dbo.MA_BUILDINGS.FROZEN_ID = 0)) AS TBL "+
                            "WHERE (" + this.query + ")"; 
                    break;
 case 13:
                sql = "SELECT TOP (100) PERCENT OBJECTID, PARCEL_ID, DSBL, HAMLET, LAST_NAME, FIRST_NAME, ADDRESS, 1 as floor, COMPANY FROM  SDEadmin.Tax_Parcels_VW WHERE NOT(COMPANY IS NULL) AND (COMPANY <> ' ') AND (COMPANY LIKE '" + this.query + "') AND (NOT (PARCEL_ID IN (SELECT TOP (" + this.start + ") PARCEL_ID  FROM SDEadmin.Tax_Parcels_VW  WHERE (COMPANY LIKE '" + this.query + "') AND NOT(COMPANY IS NULL) AND (COMPANY <> ' ') ORDER BY COMPANY))) ORDER BY COMPANY";
                break;
            case 14:
                    sql = "SELECT     dbo.PC_LK_PARCEL_PM.P_ID as 'PARCEL_ID', permitNO_TBL.PM_NUMBER, permitNO_TBL.type,  permitNO_TBL.PM_ID , dbo.PC_ADDRESS.FORMATED_ADDRESS" +
                          "  FROM         (SELECT     PM_ID, PM_NUMBER, 'Permit #' AS type"+
                          "                         FROM          dbo.PM_MASTER"+
                          "                         WHERE      (NOT (PM_NUMBER IS NULL))"+
                          "                         UNION"+
                          "                         SELECT     PM_ID, PM_APPLICATION, 'Application #' AS type"+
                          "                         FROM         dbo.PM_MASTER AS PM_MASTER_2"+
                          "                         WHERE     (NOT (PM_APPLICATION IS NULL))"+
                          "                         UNION"+
                          "                         SELECT     PM_ID, PM_CERTIFICATE, 'Certificate #' AS type"+
                          "                         FROM         dbo.PM_MASTER AS PM_MASTER_1"+
                          "                         WHERE     (NOT (PM_CERTIFICATE IS NULL))) AS permitNO_TBL INNER JOIN"+
                          "                         dbo.PC_LK_PARCEL_PM ON permitNO_TBL.PM_ID = dbo.PC_LK_PARCEL_PM.KEY_ID  INNER JOIN dbo.PC_ADDRESS ON dbo.PC_LK_PARCEL_PM.P_ID = dbo.PC_ADDRESS.P_ID "+
                          "  WHERE     (permitNO_TBL.PM_NUMBER LIKE  N'" + this.query + "')";
                    break;
            //case 15:
            //    sql = "SELECT     LONG_DESC AS [Permit Type]" +
            //            "FROM         dbo.VT_USR_PMTYPE AS VT_USR_PMTYPE " +
            //            "GROUP BY LONG_DESC, DEPT " +
            //            "HAVING     (NOT (LONG_DESC LIKE 'z%')) AND (NOT (LONG_DESC LIKE 'RENTLAW%')) AND (NOT (LONG_DESC = 'RENT - Seasonal Rental Permit')) and (DEPT = '" + this.dept + "') ORDER BY [Permit Type]";
            //    break;
            //case 16:
            //    sql = "SELECT dbo.PC_PARCEL.TAX_MAP, dbo._PERMIT_INFO.[Permit No], dbo._PERMIT_INFO.[Certificate No], dbo._PERMIT_INFO.[Expiration Date],  "+
            //          "dbo._PERMIT_INFO.[Permit Type], dbo._PERMIT_INFO.[Parcel ID], dbo._PERMIT_INFO.PM_ID, dbo._PERMIT_INFO.Description, dbo._PERMIT_INFO.Company,  " +
            //          "dbo._PERMIT_INFO.Department, dbo._PERMIT_INFO.[Application No], dbo._PERMIT_INFO.[Application Date], dbo._PERMIT_INFO.[Permit Date], dbo._PERMIT_INFO.[Certificate Date],  "+
            //          "dbo._PERMIT_INFO.[Last Fee Date], dbo._PERMIT_INFO.[Last Fee], dbo._PERMIT_INFO.[Total Fee] "+
            //            "FROM  dbo._PERMIT_INFO INNER JOIN "+
            //            "    dbo.PC_PARCEL ON dbo._PERMIT_INFO.[Parcel ID] = dbo.PC_PARCEL.P_ID "+
            //            "WHERE (dbo.PC_PARCEL.INACTIVE_YEAR = 9999) AND (NOT (dbo._PERMIT_INFO.[Permit No] IS NULL)) AND (dbo._PERMIT_INFO.[Certificate No] IS NULL) AND (dbo._PERMIT_INFO.DEPT = '" + this.dept + "') AND  " +
            //            "    (dbo._PERMIT_INFO.VOID IS NULL) AND (dbo._PERMIT_INFO.[Expiration Date] < { fn NOW() }) and (dbo._PERMIT_INFO.[Parcel ID] in (" + this.parcelID + ")) AND (NOT (dbo._PERMIT_INFO.[Permit Type] IN ('APEX-Accessory Apt 3 Yr. Permit Exempt', " +
            //          "'APTR-Accessory Apt 3 Yr. Permit', 'RENTLAW - Rent Law Exemption - 2 Year', 'RENTLAW - Rent Law Inspected - 2 Year', 'RENTLAW - Rent Law Standard - 2 Year', " +
            //          "'RENTLAW - Rent Law Violation - 2 Year', 'RENTLAW - Rent Law Waived - 2 Year'))) AND (NOT (dbo._PERMIT_INFO.[Permit Type] LIKE 'Rent%')) " +
            //          "ORDER BY dbo.PC_PARCEL.TAX_MAP DESC";
            //        break;
            //case 17:
            //        sql = "SELECT     dbo._PERMIT_INFO.* " +
            //                "FROM        dbo._PERMIT_INFO INNER JOIN dbo.PC_PARCEL ON dbo._PERMIT_INFO.[Parcel ID] = dbo.PC_PARCEL.P_ID " +
            //                "WHERE     (DEPT in (" + this.dept + ")) and ([Permit Type] like '" + this.permitType + "%') AND ([Certificate No] IS NULL) and  (dbo.PC_PARCEL.INACTIVE_YEAR = 9999)" +
            //                "AND  (dbo._PERMIT_INFO.VOID IS NULL) and (dbo._PERMIT_INFO.[Parcel ID] in (" + this.parcelID + ")) " +
            //                "ORDER BY dbo.PC_PARCEL.TAX_MAP, dbo._PERMIT_INFO.[Expiration Date] DESC";
            //        break;
            
            case 18:
                    sql = "SELECT     pcParcelyrIDfrID.P_ID, pcParcelyrIDfrID.yrID AS YEARID, pcParcelyrIDfrID.frozID AS FROZENID, pcParcelyrIDfrID.TAX_MAP, pcParcelyrIDfrID.SUBD, " +
                    "pcParcelyrIDfrID.EFFECTIVE_YEAR, dbo.PC_AREA.NBHD, ISNULL(dbo.PC_ADDRESS.FORMATED_ADDRESS, 'uknown') + ', ' + ISNULL(dbo.PC_ADDRESS.CITY, " +
                    "'uknown') AS FORMATED_ADDRESS, ISNULL(MA_MASTER_1.MISC_VALUE, 0) as MISC_VALUE, MA_MASTER_1.LAND_VALUE, MA_MASTER_1.BLDG_VALUE, MA_MASTER_1.APPRAISED_VALUE,  " +
                    " MA_MASTER_1.FROZEN_ID, CAST(MA_SALES_2.SALE_DATE AS varchar(11)) AS SALE_DATE, MA_SALES_2.SALE_PRICE, ROUND(ISNULL(dbo.PC_LEGAL_INFO.SIZE_TOTAL, dbo.PC_LEGAL_INFO.SIZE_1 / 43560), 2) " +
                    "AS Area, CASE WHEN class LIKE '%W' THEN 'Water Front' ELSE NULL END AS water " +
                    "FROM         dbo.PC_LEGAL_INFO INNER JOIN " +
                        "(SELECT     dbo.PC_PARCEL.P_ID, ISNULL(maSales2.YEAR_ID, MaMASTER.YearID) AS yrID, ISNULL(maSales2.FROZEN_ID, MaMASTER.FROZEN_ID) AS frozID, " +
                                                "dbo.PC_PARCEL.TAX_MAP, dbo.PC_PARCEL.SUBD, dbo.PC_PARCEL.EFFECTIVE_YEAR " +
                        " FROM          (SELECT     YEAR_ID AS YearID, P_ID, 0 AS FROZEN_ID " +
                                                "FROM          dbo.MA_MASTER INNER JOIN " +
                                                "dbo._YEAR_MA ON dbo.MA_MASTER.YEAR_ID = dbo._YEAR_MA.CURRENT_FY WHERE (dbo.MA_MASTER.FROZEN_ID = 0)) AS MaMASTER RIGHT OUTER JOIN " +
                                                "dbo.PC_PARCEL ON MaMASTER.P_ID = dbo.PC_PARCEL.P_ID LEFT OUTER JOIN " +
                                                    "(SELECT     dbo.MA_SALES.P_ID, dbo.MA_SALES.SALE_PRICE, dbo.MA_SALES.SALE_DATE, dbo.MA_SALES.YEAR_ID, " +
                                                                            " dbo.MA_SALES.FROZEN_ID " +
                                                        "FROM          dbo.MA_SALES INNER JOIN " +
                                                                                "(SELECT     P_ID, MAX(SALE_ID) AS sID " +
                                                                                    "FROM          dbo.MA_SALES AS MA_SALES_1 " +
                                                                                    "WHERE      (QUALIFICATION <> 'n') AND (SALE_PRICE > 0) and (SALE_DATE >= CONVERT(DATETIME, '2006-07-01 00:00:00', 102)) " +
                                                                                    "GROUP BY P_ID) AS maxSale ON dbo.MA_SALES.P_ID = maxSale.P_ID AND dbo.MA_SALES.SALE_ID = maxSale.sID) AS maSales2 ON  " +
                                                "dbo.PC_PARCEL.P_ID = maSales2.P_ID) AS pcParcelyrIDfrID INNER JOIN " +
                    "dbo.PC_ADDRESS ON pcParcelyrIDfrID.P_ID = dbo.PC_ADDRESS.P_ID INNER JOIN " +
                    "dbo.PC_AREA ON pcParcelyrIDfrID.P_ID = dbo.PC_AREA.P_ID AND pcParcelyrIDfrID.yrID = dbo.PC_AREA.YEAR_ID AND  " +
                    "pcParcelyrIDfrID.frozID = dbo.PC_AREA.FROZEN_ID INNER JOIN " +
                    "dbo.MA_MASTER AS MA_MASTER_1 ON pcParcelyrIDfrID.yrID = MA_MASTER_1.YEAR_ID AND pcParcelyrIDfrID.P_ID = MA_MASTER_1.P_ID ON  " +
                    "dbo.PC_LEGAL_INFO.P_ID = pcParcelyrIDfrID.P_ID AND dbo.PC_LEGAL_INFO.YEAR_ID = pcParcelyrIDfrID.yrID LEFT OUTER JOIN " +
                    "dbo.MA_SALES AS MA_SALES_2 INNER JOIN " +
                        "(SELECT     TOP (100) PERCENT dbo.PC_LK_PARCEL_SALE.P_ID, MAX(dbo.PC_LK_PARCEL_SALE.SALE_ID) AS SaleID " +
                        "FROM          dbo.PC_LK_PARCEL_SALE INNER JOIN " +
                                                "dbo.MA_SALES AS MA_SALES_3 ON dbo.PC_LK_PARCEL_SALE.SALE_ID = MA_SALES_3.SALE_ID " +
                        " WHERE      (MA_SALES_3.SALE_PRICE > 0) AND (MA_SALES_3.QUALIFICATION <> 'n') and (MA_SALES_3.SALE_DATE >= CONVERT(DATETIME, '2006-07-01 00:00:00', 102)) " +
                        " GROUP BY dbo.PC_LK_PARCEL_SALE.P_ID) AS MaxSaleTBL ON MA_SALES_2.SALE_ID = MaxSaleTBL.SaleID ON  " +
                    " pcParcelyrIDfrID.P_ID = MaxSaleTBL.P_ID " +
                    "WHERE     (MA_MASTER_1.FROZEN_ID = 0) AND (dbo.PC_LEGAL_INFO.FROZEN_ID = 0) AND (pcParcelyrIDfrID.P_ID IN (" + this.parcelID + ")) AND (NOT (dbo.PC_AREA.NBHD IS NULL))";
                    break;
            case 19:
                    sql = "SELECT     YEAR_BUILT, design, TOTAL_EFFECTIVE, TOTAL_VALUE AS BuildingValue, houseType, Quality, bedrooms, Full_baths, Half_baths, fireplace, condition, hvac, Totbaths, bsmtfin, garage, BLDG_ID, BLDG_SEQ,  " +
                      "P_ID, YEAR_ID, FROZEN_ID " +
                        "FROM         dbo._BldgInfo_ALL " +
                        "WHERE     (P_ID = " + this.parcelID + ") AND (YEAR_ID = " + this.yearID + ") AND (FROZEN_ID = " + this.frozenID + ")";
                    break;
            case 20:
                    sql = "SELECT top (1) dbo.PC_DEPT_INFO.P_ID as [Parcel ID], dbo.PC_DOC_LOCATOR.PATH_EXTERNAL as Image, dbo.VT_USR_DEPINF.LONG_DESC as Type, Cast(dbo.PC_DEPT_INFO.ENTRY_DATE as varchar(11)) as ENTRY_DATE FROM dbo.PC_DEPT_INFO INNER JOIN dbo.PC_DOC_LOCATOR ON dbo.PC_DEPT_INFO.DOCUMENT_LOCATOR = dbo.PC_DOC_LOCATOR.DOCUMENT_LOCATOR INNER JOIN dbo.VT_USR_DEPINF ON dbo.PC_DEPT_INFO.DEPT = dbo.VT_USR_DEPINF.DEPT AND  dbo.PC_DEPT_INFO.CODE = dbo.VT_USR_DEPINF.CODE WHERE (NOT (dbo.PC_DOC_LOCATOR.PATH_EXTERNAL IS NULL)) AND (dbo.PC_DEPT_INFO.CODE IN ('salepic', 'bldgpic') AND (dbo.PC_DEPT_INFO.P_ID = " + this.parcelID + ")) ORDER BY  dbo.PC_DEPT_INFO.ENTRY_DATE";
                    break;
            case 21:
                    sql = "SELECT  Name, Address, level, Hamlet, Offender_ID, DateOfBirth, image as Image, ID, latFeet, lngFeet FROM dbo.OffenderTbl";
                    break;
	        case 22:
                    sql = "SELECT dbo._ZONE_SingleLine.p_id, dbo._ZONE_SingleLine.zoning FROM dbo._YEAR_MA INNER JOIN dbo._ZONE_SingleLine ON dbo._YEAR_MA.CURRENT_FY = dbo._ZONE_SingleLine.year_id WHERE (dbo._ZONE_SingleLine.frozen_id = 0) AND (dbo._ZONE_SingleLine.p_id = '" + this.parcelID + "')";
                    break;
            case 23:
                    sql = "SELECT     TOP (100) PERCENT dbo.PC_LK_PARCEL_INSP.DEPT, dbo.NA_NAMES.FIRST_NAME, dbo.NA_NAMES.LAST_NAME, dbo.PM_INSPECTIONS.INSPECTION_TIME, dbo.PM_INSPECTIONS.NOTES, " + 
                        "dbo.PM_INSPECTIONS.STATUS, dbo.PM_INSPECTIONS.NA_ID, dbo.PM_INSPECTIONS.IN_ID, dbo._LOCATION.FORMATED_ADDRESS, dbo._LOCATION.CITY, dbo._PCPARCEL.DSBL,  " + 
                        "dbo.PC_LK_PARCEL_INSP.P_ID, CONVERT(varchar(10), dbo.PM_INSPECTIONS.INSPECTION_DATE, 101) AS INSPECTION_DATE, dbo.PM_LK_INSP_PERMIT.PM_ID,  " + 
                        "dbo.VT_USR_PMTYPE.SHORT_DESC, dbo.VT_USR_PMTYPE.LONG_DESC as PM_TYPE " + 
                        "FROM         dbo.PM_INSPECTIONS INNER JOIN " + 
                        " dbo.NA_NAMES ON dbo.PM_INSPECTIONS.NA_ID = dbo.NA_NAMES.NA_ID INNER JOIN " + 
                        "dbo.PC_LK_PARCEL_INSP ON dbo.PM_INSPECTIONS.IN_ID = dbo.PC_LK_PARCEL_INSP.IN_ID INNER JOIN " + 
                        "dbo._LOCATION ON dbo.PC_LK_PARCEL_INSP.P_ID = dbo._LOCATION.P_ID INNER JOIN " + 
                        "dbo._PCPARCEL ON dbo.PC_LK_PARCEL_INSP.P_ID = dbo._PCPARCEL.P_ID INNER JOIN " + 
                        "dbo.PM_LK_INSP_PERMIT ON dbo.PC_LK_PARCEL_INSP.IN_ID = dbo.PM_LK_INSP_PERMIT.IN_ID INNER JOIN " + 
                        "dbo.PM_MASTER ON dbo.PM_LK_INSP_PERMIT.PM_ID = dbo.PM_MASTER.PM_ID INNER JOIN " + 
                        "dbo.VT_USR_PMTYPE ON dbo.PM_MASTER.PM_TYPE = dbo.VT_USR_PMTYPE.CODE AND dbo.PC_LK_PARCEL_INSP.DEPT = dbo.VT_USR_PMTYPE.DEPT " + 
                        "WHERE     (dbo.PC_LK_PARCEL_INSP.DEPT = '" + this.dept + "') AND (dbo.PM_INSPECTIONS.NA_ID = '"+ this.inspector + "') AND (CONVERT(datetime, dbo.PM_INSPECTIONS.INSPECTION_DATE, 103) BETWEEN '" + this.startDate + "' AND '" + this.endDate + "')";
                    break;
            case 24:
                     sql = "SELECT dbo.PM_INSPECTORS.NA_ID, dbo.PM_INSPECTORS.DEPT_ID, ISNULL(dbo.NA_NAMES.FIRST_NAME + ' ' + dbo.NA_NAMES.LAST_NAME, 'Unkonwn') AS Name , "+
                          "CASE ISNULL(dbo.NA_NAMES.FIRST_NAME + ' ' + dbo.NA_NAMES.LAST_NAME, 'Unkonwn') " +
                          "WHEN 'David Cange' THEN 1 WHEN 'Thomas Weber' THEN 2 WHEN 'Michael Risolo' THEN 3 WHEN 'Sean McDermott' THEN 4 ELSE 5 END AS InsOrder " +
                        "FROM dbo.PM_INSPECTORS INNER JOIN " +
                        "dbo.NA_NAMES ON dbo.PM_INSPECTORS.NA_ID = dbo.NA_NAMES.NA_ID " +
                        "WHERE (dbo.PM_INSPECTORS.RETIRED IS NULL OR " +
                      "dbo.PM_INSPECTORS.RETIRED = 0) AND (dbo.PM_INSPECTORS.DEPT_ID = '" + this.dept + "') ORDER BY InsOrder , dbo.NA_NAMES.LAST_NAME";
                    break;
            default:
                sql = "SELECT TOP (11) PARCEL_ID, DSBL FROM SDEadmin.TAX_PARCELS WHERE (PARCEL_ID LIKE '" + this.query + "') AND (NOT (PARCEL_ID IN (SELECT TOP (" + this.start + ") PARCEL_ID FROM SDEadmin.TAX_PARCELS WHERE (PARCEL_ID LIKE '" + this.query + "') ORDER BY PARCEL_ID))) ORDER BY PARCEL_ID";
                break;
        }  
        return (sql);
    }
    public string searchSales(string query)
    {
        this.query = query;
        //this.frozenID = frozen;
        //this.yearID = year;
        string sql = this.GetSearchType("12");
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
        dt.DefaultView.Sort = "P_ID";

        string[] tblJson = null;
        tblJson = new string[dt.Rows.Count];
        string returnString = "";
        string jsonString = null;
        string header = "{\"label\": \"P_ID\", \"items\": [";
        string trailer = "]}";

        if (dt.Rows.Count != 0)
        {
            int ncount = 0;
            foreach (DataRow row in dt.Rows)
            {
                Hashtable taxTable = new Hashtable();
                foreach (DataColumn dc in dt.Columns)
                {
                    if (row[dc.ColumnName].ToString() == "")
                    {
                        taxTable.Add(dc.ColumnName, "none");
                    }
                    else
                    {
                        taxTable.Add(dc.ColumnName, row[dc.ColumnName].ToString());
                    }
                }
                jsonString = JSON.JsonEncode(taxTable);

                tblJson[ncount] = jsonString;
                ncount = ncount + 1;

            }
            returnString = header + String.Join(",", tblJson) + trailer;
        }
        dt.Dispose();
        return returnString;
    }
    public string arResults(string type)
    {
        this.parcelID = type;
        string sql = this.GetSearchType("18");
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
        string header = "{\"label\": \"P_ID\", \"items\": [";
        string trailer = "]}";
        if (dt.Rows.Count != 0)
        {
            int ncount = 0;
            foreach (DataRow row in dt.Rows)
            {
                Hashtable taxTable = new Hashtable();
                foreach (DataColumn dc in dt.Columns)
                {
                    //string newval = row[dc.ColumnName].ToString() ?? "&nbsp;";

                    if (row[dc.ColumnName].ToString() == "")
                    {
                        taxTable.Add(dc.ColumnName, "none");
                    }
                    else
                    {
                        taxTable.Add(dc.ColumnName, row[dc.ColumnName].ToString());
                    }
                }
                taxTable.Add("BuildingInfo", arBuildingResults(row["P_ID"].ToString(), row["YEARID"].ToString(), row["FROZENID"].ToString()));
                taxTable.Add("Pictures", arPicResults(row["P_ID"].ToString()));
                jsonString = JSON.JsonEncode(taxTable);

                tblJson[ncount] = jsonString;
                ncount = ncount + 1;

            }
            
            returnString = header + String.Join(",", tblJson) + trailer;
        }
        //finalJSON[tabcount] = tblString = String.Join(",", tblJson);
        dt.Dispose();
        return returnString;
    }
    public string arBuildingResults(string id, string year, string frozen) 
    {
        this.parcelID = id;
        this.frozenID = frozen;
        this.yearID = year;
        string sql = this.GetSearchType("19");
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
        dt.DefaultView.Sort = "TOTAL_EFFECTIVE DESC";

        string[] tblJson = null;
        tblJson = new string[dt.Rows.Count];
        string returnString = "";
        string jsonString = null;
        string header = "{\"identifier\": \"BLDG_ID\", \"label\": \"BLDG_ID\", \"items\": [";
        string trailer = "]}";

        if (dt.Rows.Count != 0)
        {
            int ncount = 0;
            foreach (DataRow row in dt.Rows)
            {
                Hashtable taxTable = new Hashtable();
                foreach (DataColumn dc in dt.Columns)
                {
                    if (row[dc.ColumnName].ToString() == "")
                    {
                        taxTable.Add(dc.ColumnName, "none");
                    }
                    else
                    {
                        taxTable.Add(dc.ColumnName, row[dc.ColumnName].ToString());
                    }
                }
                jsonString = JSON.JsonEncode(taxTable);

                tblJson[ncount] = jsonString;
                ncount = ncount + 1;

            }
            returnString = header + String.Join(",", tblJson) + trailer;
        }
        dt.Dispose();
        return returnString;
    }
    public string arPicResults(string type)
    {
        this.parcelID = type;
        string sql = this.GetSearchType("20");
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
        string header = "{\"identifier\": \"Image\", \"label\": \"ENTRY_DATE\", \"items\": [";
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
                    if (dc.ColumnName == "Image")
                    {
                        string newimage = row["Image"].ToString();
                        string image = "";

                        string img = newimage.Replace("\\", "//");
                        //System.Windows.Forms.WebBrowser

                        image = "<a dojoType='dojox.image.LightboxNano' data-dojo-id='a" + ncount + "' href='file:/" + img + "'>" +
                                        "<img alt='' style='width:185px;' src='file:/" + img + "'/></a>";

                        image = "<img alt='' style='width:185px;' src='file:/" + img + "'/>";
                        picTable.Add(dc.ColumnName, image);
                    }
                    else
                    {
                        picTable.Add(dc.ColumnName, row[dc.ColumnName].ToString());
                    }

                }
                jsonString = JSON.JsonEncode(picTable);

                tblJson[ncount] = jsonString;
                ncount = ncount + 1;

            }
            returnString = header + String.Join(",", tblJson) + trailer;
        }
        //finalJSON[tabcount] = tblString = String.Join(",", tblJson);
        dt.Dispose();
        return returnString;
    }
    public string searchSaleResults(string type)
    {
        this.parcelID = type;
        string sql = this.GetSearchType("8");
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
        string header = "{\"identifier\": \"BLDG ID\", \"label\": \"Ptype\", \"items\": [";
        string trailer = "]}";
        if (dt.Rows.Count != 0)
        {
            int ncount = 0;
            foreach (DataRow row in dt.Rows)
            {
                Hashtable taxTable = new Hashtable();
                //taxTable.Add("ID", ncount);
                foreach (DataColumn dc in dt.Columns)
                {
                    taxTable.Add(dc.ColumnName, row[dc.ColumnName].ToString());

                }
                jsonString = JSON.JsonEncode(taxTable);

                tblJson[ncount] = jsonString;
                ncount = ncount + 1;

            }
            returnString = header + String.Join(",", tblJson) + trailer;
        }
        //finalJSON[tabcount] = tblString = String.Join(",", tblJson);
        dt.Dispose();
        return returnString;
    }
    public string GetBulidingResults(string type)
    {
        this.parcelID = type;
        string sql = this.GetSearchType("5");
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
        string header = "{\"identifier\": \"BLDG ID\", \"label\": \"Ptype\", \"items\": [";
        string trailer = "]}";
        if (dt.Rows.Count != 0)
        {
            int ncount = 0;
            foreach (DataRow row in dt.Rows)
            {
                Hashtable taxTable = new Hashtable();
                //taxTable.Add("ID", ncount);
                foreach (DataColumn dc in dt.Columns)
                {
                    taxTable.Add(dc.ColumnName, row[dc.ColumnName].ToString());

                }
                jsonString = JSON.JsonEncode(taxTable);

                tblJson[ncount] = jsonString;
                ncount = ncount +1;

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
    

    public string GetPicResults(string type)
    {
        this.parcelID = type;
        string sql = "";
        
            //sql = this.GetSearchType("23");
       
            sql = this.GetSearchType("7");
       
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
        string header = "{\"identifier\": \"Image\", \"label\": \"ENTRY_DATE\", \"items\": [";
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
                    if (dc.ColumnName == "Image") {
                        string newimage = row["Image"].ToString();
                        string image = "";

                        string img = newimage.Replace("\\", "//");
                        //System.Windows.Forms.WebBrowser

                        image = "<a dojoType='dojox.image.LightboxNano' data-dojo-id='a" + ncount + "' href='file:/" + img + "'>" +
                                        "<img alt='' title='Click To Enlarge' style='width:185px;' src='file:/" + img + "'/></a>";
                        picTable.Add(dc.ColumnName, image);
                    }
                    else
                    {
                        picTable.Add(dc.ColumnName, row[dc.ColumnName].ToString());
                    }

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
    public string GetSaleResults(string type)
    {
        this.parcelID = type;
        string sql = this.GetSearchType("6");
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
        string header = "{\"identifier\": \"Sale ID\", \"label\": \"Ptype\", \"items\": [";
        string trailer = "]}";
        if (dt.Rows.Count != 0)
        {
            int ncount = 0;
            foreach (DataRow row in dt.Rows)
            {
                Hashtable taxTable = new Hashtable();
                //taxTable.Add("ID", ncount);
                foreach (DataColumn dc in dt.Columns)
                {
                    taxTable.Add(dc.ColumnName, row[dc.ColumnName].ToString());

                }
                jsonString = JSON.JsonEncode(taxTable);

                tblJson[ncount] = jsonString;
                ncount = ncount + 1;

            }
            returnString = header + String.Join(",", tblJson) + trailer;
        }
        else {
            returnString = "{\"items\": []}";
        }
        //finalJSON[tabcount] = tblString = String.Join(",", tblJson);
        dt.Dispose();
        return returnString;
    }

    //public DataTable removeNonRenewablePermits(DataTable table)
    //{
    //    //string currentHighestPM_ID = "";
    //    string[] nonRenewablePermit = new string[] {"Tent Commercial", "Tent Residential", "Bonfire/Rec. Fire App.", "Supervised Public Fireworks Display",
    //                             "Supervised Private Fireworks Display", "Temp Ins Flammable/Comp for Public Assmb"};

    //    for (int i = table.Rows.Count - 1; i >= 0; i--)
    //    {
    //        if (Array.IndexOf(nonRenewablePermit, table.Rows[i]["Permit Type"].ToString()) != -1)
    //        {
    //            DataView dv = table.DefaultView;
    //            dv.RowFilter = "[Permit Type] = '" + table.Rows[i]["Permit Type"].ToString() + "' and [Parcel ID] = '" + table.Rows[i]["Parcel ID"].ToString() + "'";
    //            dv.Sort = "[PM_ID] DESC";
    //            DataTable sortTable = dv.ToTable();
    //            if ((Convert.ToInt32(table.Rows[i]["PM_ID"]) < Convert.ToInt32(sortTable.Rows[0]["PM_ID"])) && table.Rows[i]["DEPT"].ToString() == "16")
    //            {
    //                table.Rows.Remove(table.Rows[i]);
    //            }
    //        }
    //    }
    //    return table;
    //}
    //public string GetOpenPermits(string dept, string type)
    //{
    //    string sql = "";
    //    this.dept = dept;
    //    if (type == "expired") {
    //        sql = this.GetSearchType("16");
    //    }
    //    else if (dept == "code") {
    //        this.permitType = type;
    //        this.dept = "'02', '21'";
    //        sql = this.GetSearchType("14");
    //    }
    //    else {
    //        this.permitType = type;
    //        sql = this.GetSearchType("14");
    //    }
    //    DataTable newdt = new DataTable();
        
    //    SqlCommand command = new SqlCommand(sql, conn);
    //    SqlDataAdapter adapter = new SqlDataAdapter(command);
    //    try
    //    {
    //        adapter.Fill(newdt);
    //    }
    //    finally
    //    {
    //        conn.Close();
    //    }
    //    DataTable dt = new DataTable();
    //    dt = removeNonRenewablePermits(newdt);

    //    string[] pids = new string[dt.Rows.Count];
    //    string returnString = "";
    //    string jsonString = null;
    //    string header = "{\"items\": [";
    //    string trailer = "]}";
        
    //    List<string> list = new List<string>();
    //    Dictionary<string, string> dict = new Dictionary<string, string>();
    //    if (dt.Rows.Count != 0)
    //    {
    //        foreach (DataRow row in dt.Rows)
    //        {
    //            Hashtable taxTable = new Hashtable();
    //            //taxTable.Add("ID", ncount);13872
    //            foreach (DataColumn dc in dt.Columns)
    //            {
    //                taxTable.Add(dc.ColumnName, row[dc.ColumnName].ToString());
    //            }
    //            taxTable.Add("status", getPermitStatus(row["PERMIT NO"].ToString(), row["expiration date"].ToString()));
    //            jsonString = JSON.JsonEncode(taxTable);
    //            if (dict.ContainsKey(row["PARCEL ID"].ToString()))
    //            {
    //                dict[row["PARCEL ID"].ToString()] += "," + jsonString;
    //            }
    //            else
    //            {
    //                dict[row["PARCEL ID"].ToString()] = jsonString;
    //                list.Add(row["PARCEL ID"].ToString());
    //            }
    //        }
    //        dict.Add("ids", String.Join(",", list.ToArray()));
    //    }
    //    else
    //    {
    //        returnString = "{\"items\": []}";
    //    }
    //    dt.Dispose();
    //    JavaScriptSerializer serializer = new JavaScriptSerializer();
    //    serializer.MaxJsonLength = Int32.MaxValue;
    //    returnString = header + serializer.Serialize(dict) + trailer;
    //    return returnString;
    //}
    //public string GetOpenPermits(string dept, string type, string ids)
    //{
    //    string sql = "";
    //    this.dept = dept;
    //    this.parcelID = ids;
    //    this.permitType = type;

    //    if (type == "expired")
    //    {
    //        sql = this.GetSearchType("16");
    //    }
    //    else if (dept == "code")
    //    {
    //        this.permitType = type;
    //        this.dept = "'02', '21'";
    //        sql = this.GetSearchType("17");
    //    }
    //    else
    //    {
    //        this.permitType = type;
    //        sql = this.GetSearchType("17");
    //    }

    //    //sql = this.GetSearchType("17");

    //    DataTable newdt = new DataTable();
    //    DataTable dt = new DataTable();
    //    SqlCommand command = new SqlCommand(sql, conn);
    //    SqlDataAdapter adapter = new SqlDataAdapter(command);
    //    try
    //    {
    //        adapter.Fill(newdt);
    //    }
    //    finally
    //    {
    //        conn.Close();
    //    }
    //    dt = removeNonRenewablePermits(newdt);

    //    string[] pids = new string[dt.Rows.Count];
    //    string returnString = "";
    //    string jsonString = null;
    //    string header = "{\"items\": [";
    //    string trailer = "]}";

    //    List<string> list = new List<string>();
    //    Dictionary<string, string> dict = new Dictionary<string, string>();
    //    if (dt.Rows.Count != 0)
    //    {
    //        foreach (DataRow row in dt.Rows)
    //        {
    //            Hashtable taxTable = new Hashtable();
    //            //taxTable.Add("ID", ncount);13872
    //            foreach (DataColumn dc in dt.Columns)
    //            {
    //                taxTable.Add(dc.ColumnName, row[dc.ColumnName].ToString());
    //            }
    //            taxTable.Add("status", getPermitStatus(row["PERMIT NO"].ToString(), row["expiration date"].ToString()));
    //            jsonString = JSON.JsonEncode(taxTable);
    //            if (dict.ContainsKey(row["PARCEL ID"].ToString()))
    //            {
    //                dict[row["PARCEL ID"].ToString()] += "," + jsonString;
    //            }
    //            else
    //            {
    //                dict[row["PARCEL ID"].ToString()] = jsonString;
    //                //list.Add(row["PARCEL ID"].ToString());
    //            }
    //        }
    //        //dict.Add("ids", String.Join(",", list.ToArray()));
    //    }
    //    else
    //    {
    //        returnString = "{\"items\": []}";
    //    }
    //    dt.Dispose();
    //    JavaScriptSerializer serializer = new JavaScriptSerializer();
    //    serializer.MaxJsonLength = Int32.MaxValue;
    //    returnString = header + serializer.Serialize(dict) + trailer;
    //    return returnString;
    //}
    //public string getPermitStatus(string permitType, string expirationDate) { 
    //    var status = "";
    //    DateTime expriationDate = expirationDate == "undefined" || expirationDate == "" ? DateTime.Today.AddDays(-1) : Convert.ToDateTime(expirationDate);
    //    DateTime currentDate = DateTime.Today;
    //    //var ooo = ['APEX-Accessory Apt 3 Yr. Permit Exempt','APTR-Accessory Apt 3 Yr. Permit','RENTLAW - Rent Law Exemption - 2 Year','RENTLAW - Rent Law Inspected - 2 Year','RENTLAW - Rent Law Standard - 2 Year','RENTLAW - Rent Law Violation - 2 Year','RENTLAW - Rent Law Waived - 2 Year'];
    //    //if (permitType == "")
    //    //{
    //    //    status = "expiredPermit";
    //    //}
    //    //else
    //    //{
    //        //if (permitType == "APEX-Accessory Apt 3 Yr. Permit Exempt" ||
    //        //permitType == "APTR-Accessory Apt 3 Yr. Permit" ||
    //        //permitType == "RENTLAW - Rent Law Exemption - 2 Year" ||
    //        //permitType == "RENTLAW - Rent Law Inspected - 2 Year" ||
    //        //permitType == "RENTLAW - Rent Law Standard - 2 Year" ||
    //        //permitType == "RENTLAW - Rent Law Violation - 2 Year" ||
    //        //permitType == "RENTLAW - Rent Law Waived - 2 Year")
    //        //{
    //        //    if (permitType != "")
    //        //    {
    //        //        status = "activePermit";
    //        //    }
    //        //    else
    //        //    {
    //        //        status = "application";
    //        //    }
    //        //}
    //        //else 
    //        if (permitType != "" && expriationDate > currentDate)
    //        {
    //            status = "activePermit";
    //        }
    //        else if (permitType != "" && expriationDate <= currentDate)
    //        {
    //            status = "expiredPermit";
    //        }
    //        else if (permitType == "")
    //        {
    //            status = "application";
    //        }
    //        else {
    //            status = "unknown";
    //        }
    //    //}
    //    return status;
    //}
    //public string GetPermitTypes(string dept)
    //{
    //    this.dept = dept;
    //    string sql = this.GetSearchType("15");
    //    DataTable dt = new DataTable();
    //    SqlCommand command = new SqlCommand(sql, conn);
    //    SqlDataAdapter adapter = new SqlDataAdapter(command);
    //    try
    //    {
    //        adapter.Fill(dt);
    //    }
    //    finally
    //    {
    //        conn.Close();
    //    }

    //    string[] tblJson = null;
    //    tblJson = new string[dt.Rows.Count + 1];
    //    string returnString = "";
    //    string jsonString = null;
    //    string header = "{\"items\": [";
    //    string trailer = "]}";
        
    //    //string permits = new string["APEX-Accessory Apt 3 Yr. Permit Exempt","APTR-Accessory Apt 3 Yr. Permit", "RENTLAW - Rent Law Exemption - 2 Year", "RENTLAW - Rent Law Inspected - 2 Year",  "RENTLAW - Rent Law Standard - 2 Year", "RENTLAW - Rent Law Violation - 2 Year", "RENTLAW - Rent Law Waived - 2 Year"];

    //    if (dt.Rows.Count != 0)
    //    {
    //        if (dept == "05")
    //        {
    //            returnString = "{\"items\":" + DataTableToJSON(dt) + "}";
    //        }
    //        else
    //        {
    //            int ncount = 0;
    //            foreach (DataRow row in dt.Rows)
    //            {
    //                Hashtable taxTable = new Hashtable();
    //                //taxTable.Add("ID", ncount);
    //                foreach (DataColumn dc in dt.Columns)
    //                {
    //                    if (row[dc.ColumnName].ToString().IndexOf("rentlaw") == -1)
    //                    {
    //                        taxTable.Add(dc.ColumnName, row[dc.ColumnName].ToString());
    //                    }

    //                }
    //                //taxTable.Add("Permit Type", "RENTLAW");
    //                jsonString = JSON.JsonEncode(taxTable);

    //                tblJson[ncount] = jsonString;
    //                ncount = ncount + 1;

    //            }
    //            if (dept == "02")
    //            {
    //                tblJson[ncount] = "{\"Permit Type\":\"RENTLAW\", \"DEPT\":\"02\"}";
    //            }
    //            returnString = header + String.Join(",", tblJson) + trailer;
    //        }
    //    }
    //else if (dept == "code") {
    //        returnString = header + "{\"Permit Type\":\"RENTLAW\", \"DEPT\":\"02\"}" + trailer;
    //    }
    //    else
    //    {
    //        returnString = "{\"items\": []}";
    //    }
    //    //finalJSON[tabcount] = tblString = String.Join(",", tblJson);
    //    dt.Dispose();
    //    return returnString;
    //}
    
    public string GetParcelResults(string type)
    {
        int count = 0;
        string jsonString = null;

        if (this.login is Exception)
        {
            return (jsonString);
        }
        else
        {
this.query = this.query.Replace("'", "\'\'");
            string sql = this.GetSearchType(type);
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

            if (type == "9" ) {
                jsonString = getSubdivisionString(dt);
            }
            else if (type == "14") {
                jsonString = getPermitString(dt);
            }
            else
            {
                string header = "{\"identifier\": \"parcelId\", \"label\": \"eltype\", \"items\": [";
                string trailer = "]}";

                if (dt.Rows.Count != 0)
                {
                    string[] taxnums = new string[dt.Rows.Count];

                    foreach (DataRow row in dt.Rows)
                    {
                        string p_id = row["PARCEL_ID"].ToString();
                        string formatEntry = null;

                        switch (Convert.ToInt32(type))
                        {
                            case 1:
                                string hamlet = "";
                                if (row["HAMLET"].ToString() != "")
                                {
                                    hamlet = " [" + row["HAMLET"].ToString() + "]";
                                }
                                else
                                {
                                    hamlet = "";
                                }
                                formatEntry = row["PARCEL_ID"].ToString() + hamlet;
                                break;
                            case 2:
                                formatEntry = row["DSBL"].ToString().Replace(" ", "");
                                //formatEntry = row["DSBL"].ToString();
                                break;
                            case 3:
                                formatEntry = row["LAST_NAME"].ToString() + ", " + row["FIRST_NAME"].ToString() + " [" + row["ADDRESS"].ToString() + "]";
                                break;
			case 13:
                                formatEntry = row["COMPANY"].ToString() + " [" + row["ADDRESS"].ToString() + "]";
                                break;
                            case 4:
                                string city = "";
                                if (row["ADDRESS"].ToString() != "")
                                {
                                    city = " [" + row["HAMLET"].ToString() + "]";
                                }
                                else
                                {
                                    city = "";
                                }
                                formatEntry = row["ADDRESS"].ToString() + city;
                                break;

                        }
                        string district = row["DSBL"].ToString().Substring(0, 1);
                        Hashtable taxTable = new Hashtable();
                        taxTable.Add("eltype", formatEntry);
                        taxTable.Add("parcelId", p_id + ";" + district + ";" + row["OBJECTID"].ToString() + ";" + row["floor"].ToString());
                        JavaScriptSerializer serializer = new JavaScriptSerializer();
                        jsonString = serializer.Serialize(taxTable);
                        taxnums[count] = jsonString;
                        count++;
                    }
                    string joinedString = String.Join(",", taxnums);
                    jsonString = header + joinedString + trailer;
                }
            }
            dt.Dispose();
        }
        
        return (jsonString);
    }
    private string getSubdivisionString(DataTable dt)
    {
        string header = "{\"identifier\": \"parcelId\", \"label\": \"eltype\", \"items\": [";
        string trailer = "]}";
        int count = 0;
        string jsonString = null;

        if (dt.Rows.Count != 0)
        {
            string[] taxnums = new string[dt.Rows.Count];

            foreach (DataRow row in dt.Rows)
            {
                Hashtable table = new Hashtable();
                table.Add("eltype", row["SUBD_NAME"].ToString() + " (" + row["FILE_DATE"].ToString() + ")");
                table.Add("parcelId", "subd;" + row["SUBD_NAME"].ToString() + ";" + row["FILE_DATE"].ToString());
                
                JavaScriptSerializer serializer = new JavaScriptSerializer();
                jsonString = serializer.Serialize(table);
                taxnums[count] = jsonString;
                count++;
            }
            string joinedString = String.Join(",", taxnums);
            jsonString = header + joinedString + trailer;
        }
        dt.Dispose();
        return jsonString;
    }
    private string getPermitString(DataTable dt)
    {
        string header = "{\"identifier\": \"parcelId\", \"label\": \"eltype\", \"items\": [";
        string trailer = "]}";
        int count = 0;
        string jsonString = null;

        if (dt.Rows.Count != 0)
        {
            string[] taxnums = new string[dt.Rows.Count];

            foreach (DataRow row in dt.Rows)
            {
                Hashtable table = new Hashtable();
                 table.Add("eltype", row["PM_NUMBER"].ToString() + " (" + row["FORMATED_ADDRESS"].ToString() + ") [" + row["type"].ToString() + "]");
                table.Add("parcelId", "pm;" + row["PARCEL_ID"].ToString() + ";" + row["PM_ID"].ToString() + ";1");

                JavaScriptSerializer serializer = new JavaScriptSerializer();
                jsonString = serializer.Serialize(table);
                taxnums[count] = jsonString;
                count++;
            }
            string joinedString = String.Join(",", taxnums);
            jsonString = header + joinedString + trailer;
        }
        else
        {
            jsonString = "{\"items\": []}";
        }
        dt.Dispose();
        return jsonString;
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
    public class Permits
    {
        public string ID { get; set; }
        public Collection<string> permit { get; set; }
    }
    public string addPointLayers(string layer) 
    {
        string sql = this.GetSearchType("21");
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

        string ness = convertDT(dt);

        string[] tblJson = null;
        tblJson = new string[dt.Rows.Count + 1];
        string returnString = "";
        string jsonString = null;
        string header = "{\"items\": [";
        string trailer = "]}";

        if (dt.Rows.Count != -1)
        {
            int ncount = 0;
            foreach (DataRow row in dt.Rows)
            {
                Hashtable taxTable = new Hashtable();
                foreach (DataColumn dc in dt.Columns)
                {
                    if (dc.ColumnName == "Offender_ID")
                    {
                        taxTable.Add(dc.ColumnName, JSON.JsonEncode(row[dc.ColumnName]));
                        //taxTable.Add("Geometry", getOffenderAttributes("SELECT LatFeet, LonFeet FROM dbo.Location WHERE (Offender_ID = " + row[dc.ColumnName].ToString() + " )", "geometry"));
                        taxTable.Add("Alias", getOffenderAttributes("SELECT First + N' ' + Middle + N' ' + Last AS Name FROM dbo.Alias WHERE (Offender_ID = " + row[dc.ColumnName].ToString() + " )", "alias"));
                    }
                    else
                    {
                        taxTable.Add(dc.ColumnName, row[dc.ColumnName].ToString());
                    }
                }
                jsonString = JSON.JsonEncode(taxTable);

                tblJson[ncount] = jsonString;
                ncount = ncount + 1;
            }
            Hashtable fieldInfo = new Hashtable();
            for (int i = 0; i < dt.Columns.Count; i++)
            {
                fieldInfo.Add(dt.Columns[i].ColumnName, dt.Columns[i].DataType.ToString());

            }
            Dictionary<string, object> fieldInfoRow;
            string fieldInfoString = JSON.JsonEncode(fieldInfo);
            fieldInfoRow = new Dictionary<string, object>();
            fieldInfoRow.Add("FieldInfo", fieldInfoString);
            System.Web.Script.Serialization.JavaScriptSerializer serializer = new System.Web.Script.Serialization.JavaScriptSerializer();
            List<Dictionary<string, object>> rows = new List<Dictionary<string, object>>();
            rows.Add(fieldInfoRow);
            tblJson[dt.Rows.Count] = serializer.Serialize(rows);
            returnString = header + String.Join(",", tblJson) + trailer;
        }
        else
        {
            returnString = "{\"items\": []}";
        }
        dt.Dispose();

        return returnString;
    }
    public string loadLayer(string layer)
    {
        string sql = "";
        if (layer == "offenderLyr")
        {
            sql = this.GetSearchType("21");
        } 
        //else if (layer == "Offender_Level_2")
        //{
        //    sql = this.GetSearchType("22");
        //}        
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

        return convertDT(dt);
    }
    public string deleteLayer(string layer, string oid)
    {
        string query = "delete from offenderTbl where offenderTbl.ID = " + oid;
        string returnString = "";
        try
        {
            SqlCommand cmd = new SqlCommand(query, conn);
            cmd.ExecuteNonQuery();
            returnString = "{\"val\" : true}";
        }
        catch (Exception e)
        {
            returnString = "{\"val\" : \"" + e.Message + "\"}";
        }
        finally {
            conn.Close();
        }

        return returnString;

    }
    public string updateLayer(string values, string layer)
    {
        ArrayList json = (ArrayList)JSON.JsonDecode(values);
        for (int i = 0; i < json.Count; i++)
        {
            Hashtable ht = new Hashtable();
            ht = (Hashtable)json[i];
            string[] fields = new string[ht.Values.Count - 2];
            string[] v = new string[ht.Values.Count - 2];
            int count = 0;
            string query = "";
            string status = ht["mapStatus"].ToString();
            if (status == "new")
            {
                foreach (DictionaryEntry pair in ht)
                {
                    if (pair.Key.ToString() != "mapStatus" && pair.Key.ToString() != "ID")
                    {
                        fields[count] = "[" + pair.Key.ToString() + "]";
                        if (pair.Value.ToString() != "")
                        {
                            v[count] = "'" + pair.Value.ToString() + "'";
                        }
                        else
                        {
                            v[count] = "null";
                        }
                        count++;
                    }
                }
                query = "INSERT INTO offenderTBL (" + String.Join(",", fields) + ") VALUES (" + String.Join(",", v) + ");";
            }
            else if (status == "changed")
            {
                foreach (DictionaryEntry pair in ht)
                {
                    if (pair.Key.ToString() != "mapStatus" && pair.Key.ToString() != "ID")
                    {
                        if (pair.Value == null)
                        {
                            fields[count] = "offenderTBL." + pair.Key.ToString() + " = null";
                        }
                        else
                        {
                            fields[count] = "offenderTBL." + pair.Key.ToString() + " = '" + pair.Value + "'";
                        }
                        count++;
                    }
                }
                query = "UPDATE offenderTBL SET " + String.Join(",", fields) + " WHERE ((offenderTBL.ID=" + ht["ID"] + "));";
            }
            SqlCommand cmdIns = new SqlCommand(query, conn);
            try
            {
                cmdIns.ExecuteNonQuery();
            }
            finally {
                conn.Close();
            }

        }
        return loadLayer(layer);
    }
    public string getOffenderAttributes(string sql, string sender) {
        //string sql = "SELECT LatFeet, LonFeet FROM dbo.Location WHERE (Offender_ID = " + id + " )";
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

        string ness = convertDT(dt);

        string[] tblJson = null;
        
        tblJson = new string[dt.Rows.Count];
        string returnString = "";
        //string jsonString = null;
        string header = "";
        string trailer = "";

        if (dt.Rows.Count != 0)
        {
            int ncount = 0;
            foreach (DataRow row in dt.Rows)
            {
                if (sender == "geometry")
                {
                    tblJson[ncount] = "[" + row["LonFeet"] + "," + row["LatFeet"] + "]";
                    header = "{\"points\": [";
                    trailer = "], \"spatialReference\":({ \"wkid\": 102718 })}";
                }
                else {
                    tblJson[ncount] = row["Name"].ToString();
                    header = "{\"names\": [";
                    trailer = "]}";
                }
                ncount = ncount + 1;
            }
            returnString = header + String.Join(",", tblJson) + trailer;
        }
        else
        {
            returnString = "''";
        }
        dt.Dispose();
        return returnString;
    }
    public string convertDT(DataTable dt)
    {
        System.Web.Script.Serialization.JavaScriptSerializer serializer = new System.Web.Script.Serialization.JavaScriptSerializer();
        List<Dictionary<string, object>> rows = new List<Dictionary<string, object>>();
        Dictionary<string, object> row;
        foreach (DataRow dr in dt.Rows)
        {
            row = new Dictionary<string, object>();
            foreach (DataColumn col in dt.Columns)
            {
                string val = dr[col].ToString();
                row.Add(col.ColumnName, val.Trim());
            }
            rows.Add(row);
        }
        Hashtable tblJson = new Hashtable();
        for (int i = 0; i < dt.Columns.Count; i++)
        {
            tblJson.Add(dt.Columns[i].ColumnName, dt.Columns[i].DataType.ToString());

        }
        string jsonString = JSON.JsonEncode(tblJson);
        row = new Dictionary<string, object>();
        row.Add("FieldInfo", jsonString);
        rows.Add(row);
        string oo = serializer.Serialize(rows);
        return serializer.Serialize(rows);
    }
    public string GetOffenderResults(string id)
    {
        this.parcelID = id;
        sql = this.GetSearchType("23");
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
                    if (dc.ColumnName == "Image")
                    {
                        string newimage = row["Image"].ToString();
                        string image = "";
                        string img = newimage.Replace("/", "/").TrimEnd();
                        //bool isImageFile;
                        try
                        {
                            //System.Drawing.Image.FromFile(@"c:\inetpub\wwwroot\affordableHousing\" + img);
                            //System.Drawing.Image.FromFile(@"C:\inetpub\wwwroot\LandManagerJS\" + img);
                            //isImageFile = true;
                            image = "<a dojoType='dojox.image.LightboxNano' data-dojo-id='a" + ncount + "' href='" + img + "'>" +
                                       "<img alt='' title='Click To Enlarge' style='width:100px;' src='" + img + "'/></a>";
                        }
                        catch (System.IO.FileNotFoundException ex)
                        {
                            image = "Invalid Image File Path";

                        }
                        catch (Exception exs)
                        {
                            image = "<a id='a" + ncount + "' target='_blank' href='" + newimage + "'>" + newimage + " </a>";
                        }

                        //System.Windows.Forms.WebBrowser


                        picTable.Add(dc.ColumnName, image);
                    }
                    else
                    {
                        picTable.Add(dc.ColumnName, row[dc.ColumnName].ToString());
                    }

                }
                jsonString = JSON.JsonEncode(picTable);

                tblJson[ncount] = jsonString;
                ncount = ncount + 1;
            }
            returnString = header + String.Join(",", tblJson) + trailer;
        }
        else
        {
            returnString = header + trailer;
        }
        //finalJSON[tabcount] = tblString = String.Join(",", tblJson);
        dt.Dispose();
        return returnString;
    }
    public string getZoning(string ids)
    {
        this.parcelID = ids;
        string sql = this.GetSearchType("22");
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
        tblJson = new string[dt.Rows.Count + 1];
        string returnString = "";

        if (dt.Rows.Count != 0)
        {
            string tblString = "";
            //string tblString = DataTableToJSON(dt);
            string[] zone = dt.Rows[0]["zoning"].ToString().Split(',');

            for (int i = 0; i < zone.Length; i++) {
                switch (zone[i]) { 
                    case "VB":
                        tblString = "{\"Zone\": \"" + zone[i] + "\", \"Setbacks\":{\"Front\":10, \"minSide\": 0, \"Side\": 0, \"SideTotal\":0, \"StreetSide\":10, \"Rear\": 35}}";
                        break;
                    case "HB":
                        tblString = "{\"Zone\": \"" + zone[i] + "\", \"Setbacks\":{\"Front\":50, \"minSide\": 20, \"Side\": 30, \"SideTotal\":60, \"StreetSide\":50, \"Rear\": 50}}";
                        break;
                    case "SCB":
                        tblString = "{\"Zone\": \"" + zone[i] + "\", \"Setbacks\":{\"Front\":100, \"minSide\": 50, \"Side\": 50, \"SideTotal\":100, \"StreetSide\":100, \"Rear\": 50}}";
                        break;
                    case "OD":
                        tblString = "{\"Zone\": \"" + zone[i] + "\", \"Setbacks\":{\"Front\":30, \"minSide\": 15, \"Side\": 20, \"SideTotal\":40, \"StreetSide\":30, \"Rear\": 30}}";
                        break;
                    case "MTL":
                        tblString = "{\"Zone\": \"" + zone[i] + "\", \"Setbacks\":{\"Front\":60, \"minSide\": 50, \"Side\": 50, \"SideTotal\":100, \"StreetSide\":60, \"Rear\": 50}}";
                        break;
                    case "RWB":
                        tblString = "{\"Zone\": \"" + zone[i] + "\", \"Setbacks\":{\"Front\":60, \"minSide\": 50, \"Side\": 50, \"SideTotal\":100, \"StreetSide\":60, \"Rear\": 50}}";
                        break;
                    case "HO":
                        tblString = "{\"Zone\": \"" + zone[i] + "\", \"Setbacks\":{\"Front\":30, \"minSide\": 15, \"Side\": 15, \"SideTotal\":30, \"StreetSide\":30, \"Rear\": 30}}";
                        break;
                    case "HC":
                        tblString = "{\"Zone\": \"" + zone[i] + "\", \"Setbacks\":{\"Front\":30, \"minSide\": 15, \"Side\": 15, \"SideTotal\":30, \"StreetSide\":30, \"Rear\": 30}}";
                        break;
                    case "LI40":
                        tblString = "{\"Zone\": \"" + zone[i] + "\", \"Setbacks\":{\"Front\":50, \"minSide\": 20, \"Side\": 30, \"SideTotal\":60, \"StreetSide\":60, \"Rear\": 60}}";
                        break;
                    case "LI200":
                        tblString = "{\"Zone\": \"" + zone[i] + "\", \"Setbacks\":{\"Front\":60, \"minSide\": 60, \"Side\": 60, \"SideTotal\":120, \"StreetSide\":60, \"Rear\": 60}}";
                        break;
                    case "U25":
                        tblString = "{\"Zone\": \"" + zone[i] + "\", \"Setbacks\":{\"Front\":100, \"minSide\": 100, \"Side\": 100, \"SideTotal\":200, \"StreetSide\":100, \"Rear\": 100}}";
                        break;
                    case "CR200":
                        tblString = "{\"Zone\": \"" + zone[i] + "\", \"Setbacks\":{\"Front\":100, \"minSide\": 50, \"Side\": 62.5, \"SideTotal\":125, \"StreetSide\":100, \"Rear\": 100}}";
                        break;
                    case "CR120":
                        tblString = "{\"Zone\": \"" + zone[i] + "\", \"Setbacks\":{\"Front\":80, \"minSide\": 30, \"Side\": 37.5, \"SideTotal\":75, \"StreetSide\":80, \"Rear\": 100}}";
                        break;
                    case "CR80":
                        tblString = "{\"Zone\": \"" + zone[i] + "\", \"Setbacks\":{\"Front\":80, \"minSide\": 30, \"Side\": 37.5, \"SideTotal\":75, \"StreetSide\":80, \"Rear\": 100}}";
                        break;
                    case "CR60":
                        tblString = "{\"Zone\": \"" + zone[i] + "\", \"Setbacks\":{\"Front\":80, \"minSide\": 25, \"Side\": 32.5, \"SideTotal\":65, \"StreetSide\":80, \"Rear\": 100}}";
                        break;
                    case "CR40":
                        tblString = "{\"Zone\": \"" + zone[i] + "\", \"Setbacks\":{\"Front\":60, \"minSide\": 20, \"Side\": 30, \"SideTotal\":60, \"StreetSide\":60, \"Rear\": 70}}";
                        break;
                    case "R120":
                        tblString = "{\"Zone\": \"" + zone[i] + "\", \"Setbacks\":{\"Front\":80, \"minSide\": 30, \"Side\": 37.5, \"SideTotal\":75, \"StreetSide\":80, \"Rear\": 100}}";
                        break;
                    case "R80":
                        tblString = "{\"Zone\": \"" + zone[i] + "\", \"Setbacks\":{\"Front\":80, \"minSide\": 30, \"Side\": 37.5, \"SideTotal\":75, \"StreetSide\":80, \"Rear\": 100}}";
                        break;
                    case "R60":
                        tblString = "{\"Zone\": \"" + zone[i] + "\", \"Setbacks\":{\"Front\":80, \"minSide\": 25, \"Side\": 32.5, \"SideTotal\":65, \"StreetSide\":80, \"Rear\": 100}}";
                        break;
                    case "R40":
                        tblString = "{\"Zone\": \"" + zone[i] + "\", \"Setbacks\":{\"Front\":60, \"Sminide\": 20, \"Side\": 30, \"SideTotal\":60, \"StreetSide\":60, \"Rear\": 70}}";
                        break;
                    case "R20":
                        tblString = "{\"Zone\": \"" + zone[i] + "\", \"Setbacks\":{\"Front\":40, \"minSide\": 20, \"Side\": 22.5, \"SideTotal\":45, \"StreetSide\":40, \"Rear\": 60}}";
                        break;
                    case "R15":
                        tblString = "{\"Zone\": \"" + zone[i] + "\", \"Setbacks\":{\"Front\":40, \"minSide\": 15, \"Side\": 17.5, \"SideTotal\":35, \"StreetSide\":40, \"Rear\": 50}}";
                        break;
                    case "R10":
                        tblString = "{\"Zone\": \"" + zone[i] + "\", \"Setbacks\":{\"Front\":30, \"minSide\": 10, \"Side\": 12.5, \"SideTotal\":25, \"StreetSide\":30, \"Rear\": 30}}";
                        break;
                    case "MF44":
                        tblString = "{\"Zone\": \"" + zone[i] + "\", \"Setbacks\":{\"Front\":50, \"minSide\": 50, \"Side\": 50, \"SideTotal\":100, \"StreetSide\":50, \"Rear\": 50}}";
                        break;
                    case "MHS40":
                        tblString = "{\"Zone\": \"" + zone[i] + "\", \"Setbacks\":{\"Front\":60, \"minSide\": 20, \"Side\": 30, \"SideTotal\":60, \"StreetSide\":60, \"Rear\": 70}}";
                        break;
                    case "SC44":
                        tblString = "{\"Zone\": \"" + zone[i] + "\", \"Setbacks\":{\"Front\":50, \"minSide\": 50, \"Side\": 50, \"SideTotal\":100, \"StreetSide\":50, \"Rear\": 50}}";
                        break;
                    case "MFPRD":
                        tblString = "{\"Zone\": \"" + zone[i] + "\", \"Setbacks\":{\"Front\":50, \"minSide\": 50, \"Side\": 50, \"SideTotal\":100, \"StreetSide\":50, \"Rear\": 50}}";
                        break;
                }
                tblJson[i] = tblString;
            }
            //returnString = "{\"items\":[{" + tblString + "}]}";
            returnString = "[" + String.Join(",", tblJson) + "]";
        }   
        //finalJSON[tabcount] = tblString = String.Join(",", tblJson);
        dt.Dispose();
        return returnString;
    }
    public string getInspections(string inspector, string dept, string sDate, string eDate)
    {
        this.dept = dept;
        this.inspector = inspector;
        this.startDate = sDate;
        this.endDate = eDate;
        string sql = this.GetSearchType("23");
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
        string header = "{\"label\": \"INSPECTION_DATE\", \"items\": [";
        string trailer = "]}";
        if (dt.Rows.Count != 0)
        {
            int ncount = 0;
            foreach (DataRow row in dt.Rows)
            {
                Hashtable taxTable = new Hashtable();
                //taxTable.Add("ID", ncount);
                foreach (DataColumn dc in dt.Columns)
                {
                    taxTable.Add(dc.ColumnName, row[dc.ColumnName].ToString());

                }
                jsonString = JSON.JsonEncode(taxTable);

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
    public string getInspectors(string dept)
   {
       this.dept = dept;
       string sql = this.GetSearchType("24");
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
       string header = "{\"identifier\": \"NA_ID\", \"label\": \"Name\", \"items\": [";
       string trailer = "]}";
       if (dt.Rows.Count != 0)
       {
           int ncount = 0;
           foreach (DataRow row in dt.Rows)
           {
               Hashtable taxTable = new Hashtable();
               //taxTable.Add("ID", ncount);
               foreach (DataColumn dc in dt.Columns)
               {
                   taxTable.Add(dc.ColumnName, row[dc.ColumnName].ToString());

               }
               jsonString = JSON.JsonEncode(taxTable);

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


//SELECT     OBJECTID, AREA, PERIMETER, TAXMAP, GV_TAXMAP, ACREAGE, DSBL, X_COORD, Y_COORD, FLAG, PROP_TYPE, ROLL_SECT, FIRST_NAME, M_INITIAL, LAST_NAME, ADDRESS, HAMLET, 
//                      COMPANY, PARCEL_ID, SHAPE
//FROM         SDEadmin.TAX_PARCELS
//WHERE    (SHAPE.STIntersects(geometry::STGeomFromText('POLYGON ((1384797.3424426019 254994.61291377246, 1385107.2925820202 254994.61291377246, 1385107.2925820202 254692.99018551409, 1384797.3424426019 254692.99018551409, 1384797.3424426019 254994.61291377246))',
//                       2263)) = '1')