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
using System.IO;
using System.Runtime.InteropServices;
using System.Security.Permissions;
using System.Security.Principal;
using System.Drawing;
using System.Drawing.Imaging;
using aejw.Network;
using System.Collections.Generic;
using System.Web.Script.Serialization;


[assembly: SecurityPermission(SecurityAction.RequestMinimum, UnmanagedCode = true)]

/// <summary>
/// Summary description for namePermits
/// </summary>
public class namePermits 
{
    [PermissionSetAttribute(SecurityAction.Demand, Name = "FullTrust")]

    // Test harness.
    // If you incorporate this code into a DLL, be sure to demand FullTrust.

    [StructLayout(LayoutKind.Sequential)]
    internal struct NETRESOURCE
    {
        public uint dwScope;
        public uint dwType;
        public uint dwDisplayType;
        public uint dwUsage;
        [MarshalAs(UnmanagedType.LPWStr)]
        public string lpLocalName;
        [MarshalAs(UnmanagedType.LPWStr)]
        public string lpRemoteName;
        [MarshalAs(UnmanagedType.LPWStr)]
        public string lpComment;
        [MarshalAs(UnmanagedType.LPWStr)]
        public string lpProvider;
    }

    [DllImport("mpr.dll", EntryPoint = "WNetAddConnection2W", CharSet = System.Runtime.InteropServices.CharSet.Unicode)]
    private static extern uint WNetAddConnection2
                      (
                           ref NETRESOURCE lpNetResource,
                           string lpPassword,
                           string lpUsername,
                           uint dwFlags
                      );

    [DllImport("mpr.dll")]
    private static extern uint WNetCancelConnection2
                      (
                           string lpName,
                           uint dwFlags,
                           bool bForce
                      );

    private const uint RESOURCETYPE_ANY = 0x0;
    private const uint RESOURCETYPE_DISK = 1;
    private const uint CONNECT_UPDATE_PROFILE = 0x1;
    private const uint CONNECT_INTERACTIVE = 0x8;
    private const uint CONNECT_PROMPT = 0x10;
    private const uint CONNECT_REDIRECT = 0x80;
    private const uint CONNECT_COMMANDLINE = 0x800;
    private const uint CONNECT_CMD_SAVECRED = 0x1000;

    public SqlConnection conn = null;
    object login = null;
    public string dept = null;
    public string value = null;
    public string start = null;
    public string count = null;

    public namePermits(string value, string start, string count)
    {
        login = openConnection();
        this.value = value.Replace("*", "%");
        this.start = start;
        this.count = count;
    }
    public namePermits()
    {
        login = openConnection();
    }
    private Object openConnection()
    {
        string connectionInfo = System.Configuration.ConfigurationManager.AppSettings["namePermit_governConnect"];
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
    public string sqlString(string type, string dept) {
        string returnString = "";
        switch (type) { 
            case "1":
                //returnString = "SELECT     TOP (100) PERCENT dbo.PM_LICENSE.NA_ID AS value, dbo.PM_MASTER.PM_NUMBER AS name, dbo.VT_USR_PMTYPE.LONG_DESC AS type " +
                //                    "FROM         dbo.PM_LICENSE INNER JOIN "+
                //                    "dbo.PM_MASTER ON dbo.PM_LICENSE.PM_ID = dbo.PM_MASTER.PM_ID INNER JOIN "+
                //                    "dbo.VT_USR_PMTYPE ON dbo.PM_MASTER.PM_TYPE = dbo.VT_USR_PMTYPE.CODE AND dbo.PM_LICENSE.DEPT = dbo.VT_USR_PMTYPE.DEPT " +
                //                    "WHERE     (dbo.PM_LICENSE.DEPT = '" + dept + "') and (dbo.PM_MASTER.PM_NUMBER like '" + value + "') order by name";
                //returnString = "SELECT     TOP (100) PERCENT dbo.PM_LICENSE.NA_ID AS value, dbo.PM_MASTER.PM_NUMBER AS name, ISNULL(ISNULL(dbo.VT_USR_PROFLD.LONG_DESC, " +
                //                    "                      dbo.VT_USR_PMTYPE.LONG_DESC), 'Miscellaneous') AS type " +
                //                    "FROM         dbo.PM_LICENSE INNER JOIN " +
                //                    "                      dbo.PM_MASTER ON dbo.PM_LICENSE.PM_ID = dbo.PM_MASTER.PM_ID LEFT OUTER JOIN " +
                //                    "                      dbo.PM_LK_PERMIT_TYPE ON dbo.PM_LICENSE.PM_ID = dbo.PM_LK_PERMIT_TYPE.PM_ID LEFT OUTER JOIN " +
                //                    "                      dbo.VT_USR_PMTYPE ON dbo.PM_LK_PERMIT_TYPE.PM_TYPE = dbo.VT_USR_PMTYPE.CODE LEFT OUTER JOIN " +
                //                    "                      dbo.VT_USR_PROFLD ON dbo.PM_LK_PERMIT_TYPE.TYP_OF_WORK = dbo.VT_USR_PROFLD.CODE " +
                //                    "WHERE    (dbo.PM_LICENSE.DEPT = '" + dept + "') AND  (NOT (dbo.PM_MASTER.PM_NUMBER IS NULL)) and (dbo.PM_MASTER.PM_NUMBER like '" + value + "') order by name";
                returnString = "SELECT     TOP (21) value, name, type "+
                                    "FROM         (SELECT     dbo.PM_LICENSE.NA_ID AS value, dbo.PM_MASTER.PM_APPLICATION AS name, ISNULL(ISNULL(dbo.VT_USR_PROFLD.LONG_DESC,  "+
                                    "                            dbo.VT_USR_PMTYPE.LONG_DESC), 'Miscellaneous') AS type "+
                                    "    FROM          dbo.PM_LICENSE INNER JOIN "+
                                    "                            dbo.PM_MASTER ON dbo.PM_LICENSE.PM_ID = dbo.PM_MASTER.PM_ID LEFT OUTER JOIN "+
                                    "                            dbo.PM_LK_PERMIT_TYPE ON dbo.PM_LICENSE.PM_ID = dbo.PM_LK_PERMIT_TYPE.PM_ID LEFT OUTER JOIN "+
                                    "                            dbo.VT_USR_PMTYPE ON dbo.PM_LK_PERMIT_TYPE.PM_TYPE = dbo.VT_USR_PMTYPE.CODE LEFT OUTER JOIN "+
                                    "                            dbo.VT_USR_PROFLD ON dbo.PM_LK_PERMIT_TYPE.TYP_OF_WORK = dbo.VT_USR_PROFLD.CODE "+
                                    "    WHERE      (dbo.PM_LICENSE.DEPT = '" + dept + "') AND (dbo.PM_MASTER.PM_APPLICATION LIKE '" + value + "') AND (NOT (dbo.PM_MASTER.PM_APPLICATION IS NULL)) " +
                                    "    UNION "+
                                    "    SELECT     PM_LICENSE_1.NA_ID AS value, PM_MASTER_1.PM_NUMBER AS name, ISNULL(ISNULL(VT_USR_PROFLD_1.LONG_DESC,  "+
                                    "                            VT_USR_PMTYPE_1.LONG_DESC), 'Miscellaneous') AS type "+
                                    "    FROM         dbo.PM_LICENSE AS PM_LICENSE_1 INNER JOIN "+
                                    "                            dbo.PM_MASTER AS PM_MASTER_1 ON PM_LICENSE_1.PM_ID = PM_MASTER_1.PM_ID LEFT OUTER JOIN "+
                                    "                            dbo.PM_LK_PERMIT_TYPE AS PM_LK_PERMIT_TYPE_1 ON PM_LICENSE_1.PM_ID = PM_LK_PERMIT_TYPE_1.PM_ID LEFT OUTER JOIN "+
                                    "                            dbo.VT_USR_PMTYPE AS VT_USR_PMTYPE_1 ON PM_LK_PERMIT_TYPE_1.PM_TYPE = VT_USR_PMTYPE_1.CODE LEFT OUTER JOIN "+
                                    "                            dbo.VT_USR_PROFLD AS VT_USR_PROFLD_1 ON PM_LK_PERMIT_TYPE_1.TYP_OF_WORK = VT_USR_PROFLD_1.CODE "+
                                    "    WHERE     (PM_LICENSE_1.DEPT = '" + dept + "') AND (NOT (PM_MASTER_1.PM_NUMBER IS NULL)) AND (PM_MASTER_1.PM_NUMBER LIKE '" + value + "')) AS tbl " +
                                    "WHERE     (NOT (value IN "+
                                    "        (SELECT     TOP ("+ Convert.ToInt16(start) +") NA_ID " +
                                    "        FROM          (SELECT     PM_LICENSE_2.NA_ID, PM_MASTER_2.PM_APPLICATION AS name " +
                                    "                                FROM          dbo.PM_LICENSE AS PM_LICENSE_2 INNER JOIN " +
                                    "                                                        dbo.PM_MASTER AS PM_MASTER_2 ON PM_LICENSE_2.PM_ID = PM_MASTER_2.PM_ID LEFT OUTER JOIN "+
                                    "                                                        dbo.PM_LK_PERMIT_TYPE AS PM_LK_PERMIT_TYPE_2 ON PM_LICENSE_2.PM_ID = PM_LK_PERMIT_TYPE_2.PM_ID LEFT OUTER JOIN "+
                                    "                                                        dbo.VT_USR_PMTYPE AS VT_USR_PMTYPE_2 ON PM_LK_PERMIT_TYPE_2.PM_TYPE = VT_USR_PMTYPE_2.CODE LEFT OUTER JOIN "+
                                    "                                                        dbo.VT_USR_PROFLD AS VT_USR_PROFLD_2 ON PM_LK_PERMIT_TYPE_2.TYP_OF_WORK = VT_USR_PROFLD_2.CODE "+
                                    "                                WHERE      (PM_LICENSE_2.DEPT = '" + dept + "') AND (PM_MASTER_2.PM_APPLICATION LIKE '" + value + "') AND (NOT (PM_MASTER_2.PM_APPLICATION IS NULL)) " +
                                    "                                UNION "+
                                    "                                SELECT     PM_LICENSE_1.NA_ID, PM_MASTER_1.PM_NUMBER AS name "+
                                    "                                FROM         dbo.PM_LICENSE AS PM_LICENSE_1 INNER JOIN "+
                                    "                                                        dbo.PM_MASTER AS PM_MASTER_1 ON PM_LICENSE_1.PM_ID = PM_MASTER_1.PM_ID LEFT OUTER JOIN "+
                                    "                                                        dbo.PM_LK_PERMIT_TYPE AS PM_LK_PERMIT_TYPE_1 ON PM_LICENSE_1.PM_ID = PM_LK_PERMIT_TYPE_1.PM_ID LEFT OUTER JOIN "+
                                    "                                                        dbo.VT_USR_PMTYPE AS VT_USR_PMTYPE_1 ON PM_LK_PERMIT_TYPE_1.PM_TYPE = VT_USR_PMTYPE_1.CODE LEFT OUTER JOIN "+
                                    "                                                        dbo.VT_USR_PROFLD AS VT_USR_PROFLD_1 ON PM_LK_PERMIT_TYPE_1.TYP_OF_WORK = VT_USR_PROFLD_1.CODE "+
                                    "                                WHERE     (PM_LICENSE_1.DEPT = '" + dept + "') AND (NOT (PM_MASTER_1.PM_NUMBER IS NULL)) AND (PM_MASTER_1.PM_NUMBER LIKE '" + value + "')) " + 
                                    "                                AS tbl_1 " +
                                    "        ORDER BY tbl_1.name))) "+
                                    "ORDER BY name";
              break;
            case "2":
                returnString = "SELECT     TOP (100) Percent  dbo.PM_LICENSE.NA_ID AS value, ISNULL(dbo.NA_NAMES.COMPANY, dbo.NA_NAMES.LAST_NAME + ', ' + ISNULL(dbo.NA_NAMES.FIRST_NAME + ' ' + dbo.NA_NAMES.MID_INITIAL, dbo.NA_NAMES.FIRST_NAME)) AS name  " +
                                    "FROM         dbo.NA_NAMES INNER JOIN " +
                                    "                      dbo.PM_LICENSE ON dbo.NA_NAMES.NA_ID = dbo.PM_LICENSE.NA_ID  " +
                                    "WHERE     (dbo.PM_LICENSE.DEPT = '" + dept + "') " +
                                    "GROUP BY ISNULL(dbo.NA_NAMES.COMPANY, dbo.NA_NAMES.LAST_NAME + ', ' + ISNULL(dbo.NA_NAMES.FIRST_NAME + ' ' + dbo.NA_NAMES.MID_INITIAL, dbo.NA_NAMES.FIRST_NAME)), dbo.PM_LICENSE.NA_ID " +
                                    "Having (ISNULL(dbo.NA_NAMES.COMPANY, dbo.NA_NAMES.LAST_NAME + ', ' + ISNULL(dbo.NA_NAMES.FIRST_NAME + ' ' + dbo.NA_NAMES.MID_INITIAL, dbo.NA_NAMES.FIRST_NAME)) LIKE '" + value + "') order by name";
                break;
            case "3":
                returnString = "SELECT     TOP (100) PERCENT value, name, type " +
                                    "FROM         (SELECT     TOP (100) PERCENT dbo.PM_LICENSE.NA_ID AS value, dbo.PM_LICENSE.BOAT_REG AS name, dbo.VT_USR_PMTYPE.LONG_DESC AS type " +
                                    "FROM          dbo.PM_LICENSE INNER JOIN " +
                                    "                        dbo.PM_MASTER ON dbo.PM_LICENSE.PM_ID = dbo.PM_MASTER.PM_ID INNER JOIN " +
                                    "                        dbo.VT_USR_PMTYPE ON dbo.PM_LICENSE.DEPT = dbo.VT_USR_PMTYPE.DEPT AND dbo.PM_MASTER.PM_TYPE = dbo.VT_USR_PMTYPE.CODE " +
                                    "WHERE      (dbo.PM_LICENSE.DEPT = '" + dept + "') AND (dbo.PM_LICENSE.KIND = 'pn') AND (NOT (dbo.PM_LICENSE.BOAT_REG IS NULL)) " +
                                    "UNION " +
                                    "SELECT     TOP (100) PERCENT PM_LICENSE_1.NA_ID AS value, PM_LICENSE_1.MV_REG AS name, VT_USR_PMTYPE_1.LONG_DESC AS type " +
                                    "FROM         dbo.PM_LICENSE AS PM_LICENSE_1 INNER JOIN " +
                                    "                        dbo.PM_MASTER AS PM_MASTER_1 ON PM_LICENSE_1.PM_ID = PM_MASTER_1.PM_ID INNER JOIN " +
                                    "                        dbo.VT_USR_PMTYPE AS VT_USR_PMTYPE_1 ON PM_LICENSE_1.DEPT = VT_USR_PMTYPE_1.DEPT AND  " +
                                    "                        PM_MASTER_1.PM_TYPE = VT_USR_PMTYPE_1.CODE " +
                                    "WHERE     (PM_LICENSE_1.DEPT = '" + dept + "') AND (PM_LICENSE_1.KIND = 'pn') AND (NOT (PM_LICENSE_1.MV_REG IS NULL))) AS regNO_TBL " +
                                    "WHERE (name LIKE '" + value + "')  order by name";
                break;
            case "4":
                returnString = "SELECT     TOP (100) PERCENT dbo.PM_LICENSE.NA_ID AS value, dbo.PM_MASTER.PM_NUMBER AS name, ISNULL(dbo.VT_USR_PROFLD.LONG_DESC, 'Miscellaneous') " +
                                    "                      AS type, dbo.PM_LICENSE.DEPT " +
                                    "FROM         dbo.PM_LICENSE INNER JOIN " +
                                    "                      dbo.PM_MASTER ON dbo.PM_LICENSE.PM_ID = dbo.PM_MASTER.PM_ID LEFT OUTER JOIN " +
                                    "                      dbo.PM_LK_PERMIT_TYPE ON dbo.PM_LICENSE.PM_ID = dbo.PM_LK_PERMIT_TYPE.PM_ID LEFT OUTER JOIN " +
                                    "                      dbo.VT_USR_PROFLD ON dbo.PM_LK_PERMIT_TYPE.TYP_OF_WORK = dbo.VT_USR_PROFLD.CODE " +
                                    "WHERE     (NOT (dbo.PM_MASTER.PM_NUMBER IS NULL)) AND (dbo.PM_LICENSE.DEPT = '09')";
                break;
            case "nameInfo":
                returnString = "SELECT     TOP (1) dbo.NA_NAMES.NA_ID, dbo.NA_NAMES.FREE_LINE_1, dbo.NA_NAMES.FREE_LINE_2, dbo.NA_NAMES.FREE_LINE_3, " +
                                    "dbo.NA_NAMES.FREE_LINE_4, dbo.NA_NAMES.FREE_LINE_5, dbo.PM_LICENSE.HAIR_COLOR, CONVERT(VARCHAR(11), dbo.PM_LICENSE.T_DOB, 101) as T_DOB, dbo.PM_LICENSE.EYE_COLOR, " +
                                    "dbo.PM_LICENSE.HEIGHT, photoTBL.PATH_PHOTO, dbo.NA_NAMES.EMAIL, photoTBL.FILE_NAME " +
                                    "FROM dbo.NA_NAMES INNER JOIN " +
                                    "dbo.PM_LICENSE ON dbo.NA_NAMES.NA_ID = dbo.PM_LICENSE.NA_ID LEFT OUTER JOIN " +
                                    "    (SELECT     CAST('\\\\th-govern\\govarch\\level' + CAST(dbo.PC_DOC_LOCATOR.ARCHIVE_LEVEL AS varchar) + '\\' + LEFT(RIGHT(dbo.PC_DOC_LOCATOR.ENTRY_DATE,  " +
                                    "                            12), 4) + RIGHT(LEFT(CONVERT(varchar, dbo.PC_DOC_LOCATOR.ENTRY_DATE, 104), 5), 2) + LEFT(CONVERT(varchar,  " +
                                    "                            dbo.PC_DOC_LOCATOR.ENTRY_DATE, 104), 2) + '\\' + dbo.PC_DOC_LOCATOR.FILE_NAME AS varchar(100)) AS PATH_PHOTO, dbo.NA_DEPT_INFO.NA_ID,  " +
                                    "                            dbo.NA_DEPT_INFO.DEPT, dbo.NA_DEPT_INFO.CODE, dbo.PC_DOC_LOCATOR.FILE_NAME " +
                                    "    FROM          dbo.NA_DEPT_INFO INNER JOIN " +
                                    "                            dbo.PC_DOC_LOCATOR ON dbo.NA_DEPT_INFO.DOCUMENT_LOCATOR = dbo.PC_DOC_LOCATOR.DOCUMENT_LOCATOR " +
                                    "    WHERE      (dbo.NA_DEPT_INFO.CODE = 'lic_photo')) AS photoTBL ON dbo.PM_LICENSE.DEPT = photoTBL.DEPT AND  " +
                                    "dbo.PM_LICENSE.NA_ID = photoTBL.NA_ID " +
                                    "WHERE (dbo.PM_LICENSE.DEPT = '" + dept + "') AND (dbo.NA_NAMES.NA_ID = '" + value + "') ORDER BY T_DOB DESC";
                break;
            case "permitInfo":
                returnString = "SELECT     TOP (100) dbo.PM_MASTER.PM_ID, dbo.VT_USR_PMTYPE.LONG_DESC AS [Permit Type], dbo.PM_LICENSE.MV_MAKE AS [Vehicle Make], " +
                      "dbo.PM_LICENSE.MV_MODEL AS [Vehicle Model], dbo.PM_LICENSE.MV_REG AS [Vehicle Registration], dbo.PM_LICENSE.MV_COLOR AS [Vehicle Color],  " +
                      "dbo.PM_LICENSE.MV_YEAR AS [Vehicle Year], dbo.PM_LICENSE.BOAT_LENGTH AS [Boat Length], dbo.VT_USR_BTMAKE.LONG_DESC AS [Boat Make],  " +
                      "dbo.PM_LICENSE.BOAT_HGT AS [Boat Height], dbo.PM_LICENSE.BOAT_REG AS [Boat Registration], CONVERT(VARCHAR(11), dbo.PM_MASTER.APPLICATION_DATE,  " +
                      "101) AS [Application Date], CONVERT(VARCHAR(11), dbo.PM_MASTER.EXPIRATION_DATE, 101) AS [Expiration Date], dbo.PM_MASTER.TOTAL_FEE AS [Total Fee],  " +
                      "dbo.PM_LK_PERMIT_TYPE.STICKER_NO AS [Sticker #], CASE WHEN dbo.PM_LK_PERMIT_TYPE.CRC_ISSUED <> - 1 OR " +
                      "dbo.PM_LK_PERMIT_TYPE.CRC_ISSUED IS NULL THEN 'No' ELSE 'Yes' END AS [CRC Issued], dbo.VT_USR_TRTWBODY.LONG_DESC AS [Trustee Waterbody],  " +
                      "dbo.PM_LK_PERMIT_TYPE.ANCHOR_WT AS [Anchor Weight], CASE WHEN dbo.PM_LK_PERMIT_TYPE.PROOF_RES <> - 1 OR " +
                      "dbo.PM_LK_PERMIT_TYPE.PROOF_RES IS NULL THEN 'No' ELSE 'Yes' END AS [Proof of Residency], dbo.PM_LK_PERMIT_TYPE.STAKE AS Stake,  " +
                      "dbo.PM_LK_PERMIT_TYPE.NB_OF_ITEMS AS [Number of Items], dbo.PM_LK_PERMIT_TYPE.BLIND_TYPE AS [Blind Type],  " +
                      "dbo.PM_LK_PERMIT_TYPE.LOTTO_NO AS [Dock Lottery #], dbo.VT_USR_DOCK_LOC.LONG_DESC AS [Assigned Dock Location],  " +
                      "dbo.PM_LK_PERMIT_TYPE.SLIP_NO AS [Assigned Slip #], dbo.PM_MASTER.PM_NUMBER AS [Permit #], dbo.PM_MASTER.PM_APPLICATION AS [Application #],  " +
                      "dbo.PM_LK_PERMIT_TYPE.BT_STCKR_NO AS [Boat Sticker #], dbo.PM_LK_PERMIT_TYPE.MAR_SPECIES AS [Marine Species],  " +
                      "dbo.PM_LK_PERMIT_TYPE.GEAR_NUMBER AS [Gear #], dbo.PM_LK_PERMIT_TYPE.FTRAP_LOC AS [Fish Trap Location],  " +
                      "CASE WHEN dbo.PM_LK_PERMIT_TYPE.BONFIRE <> - 1 THEN 'No' WHEN dbo.PM_LK_PERMIT_TYPE.BONFIRE IS NULL THEN NULL ELSE 'yes' END AS [Bonfire?],  " +
                      "CASE WHEN dbo.PM_LK_PERMIT_TYPE.ALCOHOL <> - 1 THEN 'No' WHEN dbo.PM_LK_PERMIT_TYPE.ALCOHOL IS NULL THEN NULL  " +
                      "ELSE 'yes' END AS [Alcohol Present?], dbo.PM_LK_PERMIT_TYPE.TRUSTEE_RD AS [Trustee Rd], dbo.PM_LK_PERMIT_TYPE.NUM_PEOPLE AS [Number of People],  " +
                      "dbo.PM_LK_PERMIT_TYPE.TRUST_RDPRK AS [Trustee Rd Parking], dbo.PM_LK_PERMIT_TYPE.TRUST_PM_NO AS [Trustee Permit #],  " +
                      "ISNULL(ISNULL(dbo.VT_USR_PROFLD.LONG_DESC, dbo.VT_USR_PMTYPE.LONG_DESC), 'Miscellaneous') AS Type,  " +
                      "dbo.PM_LK_PERMIT_TYPE.SUSPND_UNTL AS [Suspend Until],  " +
                      "CASE WHEN dbo.PM_LK_PERMIT_TYPE.PREF_EAST <> - 1 THEN 'No' WHEN dbo.PM_LK_PERMIT_TYPE.PREF_EAST IS NULL THEN NULL  " +
                      "ELSE 'yes' END AS [Pref. Bay Ave/Eastport Dock], dbo.PM_LK_PERMIT_TYPE.PREF_EAST_N AS [Pref. Bay Ave/Eastport Dock #],  " +
                      "CASE WHEN dbo.PM_LK_PERMIT_TYPE.PREF_FORT <> - 1 THEN 'No' WHEN dbo.PM_LK_PERMIT_TYPE.PREF_FORT IS NULL THEN NULL  " +
                      "ELSE 'yes' END AS [Pref. Old Fort Pond], dbo.PM_LK_PERMIT_TYPE.PREF_FORT_N AS [Pref. Old Fort Pond #],  " +
                      "CASE WHEN dbo.PM_LK_PERMIT_TYPE.PREF_SPK <> - 1 THEN 'No' WHEN dbo.PM_LK_PERMIT_TYPE.PREF_SPK IS NULL THEN NULL  " +
                      "ELSE 'yes' END AS [Pref. Speonk Shore Canal], dbo.PM_LK_PERMIT_TYPE.PREF_SPK_NO AS [Pref. Speonk Shore Canal #],  " +
                      "CASE WHEN dbo.PM_LK_PERMIT_TYPE.PREF_CRESTN <> - 1 THEN 'No' WHEN dbo.PM_LK_PERMIT_TYPE.PREF_CRESTN IS NULL THEN NULL  " +
                      "ELSE 'yes' END AS [Pref. Baycrest Ave Dock], dbo.PM_LK_PERMIT_TYPE.PREF_CRESTN AS [Pref. Baycrest Ave Dock #], dbo.PM_LICENSE.PURPOSE,  " +
                      "CONVERT(VARCHAR(11), dbo.PM_MASTER.PERMIT_DATE, 101) AS [Permit Date] " +
                        "FROM         dbo.PM_LICENSE INNER JOIN " +
                        "dbo.PM_MASTER ON dbo.PM_LICENSE.PM_ID = dbo.PM_MASTER.PM_ID INNER JOIN " +
                        "dbo.PM_LK_PERMIT_TYPE ON dbo.PM_MASTER.PM_ID = dbo.PM_LK_PERMIT_TYPE.PM_ID LEFT OUTER JOIN " +
                        "dbo.VT_USR_TRTWBODY ON dbo.PM_LK_PERMIT_TYPE.TRST_WBODY = dbo.VT_USR_TRTWBODY.CODE LEFT OUTER JOIN " +
                        "dbo.VT_USR_DOCK_LOC ON dbo.PM_LK_PERMIT_TYPE.DOCK_ASSIGN = dbo.VT_USR_DOCK_LOC.CODE LEFT OUTER JOIN " +
                        "dbo.VT_USR_BTMAKE ON dbo.PM_LICENSE.DEPT = dbo.VT_USR_BTMAKE.DEPT AND  " +
                        "dbo.PM_LICENSE.BOAT_MAKE = dbo.VT_USR_BTMAKE.CODE LEFT OUTER JOIN " +
                        "dbo.VT_USR_PROFLD ON dbo.PM_LICENSE.DEPT = dbo.VT_USR_PROFLD.DEPT AND  " +
                        "dbo.PM_LK_PERMIT_TYPE.TYP_OF_WORK = dbo.VT_USR_PROFLD.CODE LEFT OUTER JOIN " +
                        "dbo.VT_USR_PMTYPE ON dbo.PM_LICENSE.DEPT = dbo.VT_USR_PMTYPE.DEPT AND dbo.PM_LK_PERMIT_TYPE.PM_TYPE = dbo.VT_USR_PMTYPE.CODE " +
                                    "WHERE     (dbo.PM_LICENSE.DEPT = '" + dept + "') AND (dbo.PM_LICENSE.NA_ID = " + value + ")";
                break;
            case "otherPermitInfo":
                returnString = "SELECT     TOP (100) PERCENT dbo._PERMIT_INFO.PM_ID, dbo.PM_LK_PERMIT_NAME.NA_ID, dbo._PERMIT_INFO.[Parcel ID], dbo.VT_USR_PMNAME.LONG_DESC, " +
                                "    dbo._PERMIT_INFO.[Permit Type], dbo.PC_ADDRESS.FORMATED_ADDRESS, ISNULL(ISNULL(ISNULL(dbo._PERMIT_INFO.[Certificate Date], dbo._PERMIT_INFO.[Permit Date]), dbo._PERMIT_INFO.[Application Date]), 'Unknown') as date " +
                                "FROM         dbo._PERMIT_INFO INNER JOIN " +
                                "    dbo.PM_LK_PERMIT_NAME ON dbo._PERMIT_INFO.PM_ID = dbo.PM_LK_PERMIT_NAME.KEY_ID INNER JOIN " +
                                "    dbo.VT_USR_PMNAME ON dbo.PM_LK_PERMIT_NAME.LINK_TYPE = dbo.VT_USR_PMNAME.CODE INNER JOIN " +
                                "    dbo.PC_ADDRESS ON dbo._PERMIT_INFO.[Parcel ID] = dbo.PC_ADDRESS.P_ID " +
                                "WHERE     (dbo.PM_LK_PERMIT_NAME.NA_ID =  " + value + ")";
                break;
        }
        return returnString;
    }
    public string driveLetter = null;
    NetworkDrive oNetDrive = new aejw.Network.NetworkDrive();
    public string namePermitSearch(string type, string dept)
	{
        //this.dept = dept;
        string sql = sqlString(type, dept);

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
        string jsonString = null;
        string header = "{\"items\": [";
        string trailer = "]}";

        if (dt.Rows.Count != 0)
        {
            int ncount = 0;
            foreach (DataRow row in dt.Rows)
            {
                Hashtable hTable = new Hashtable();
                //foreach (DataColumn dc in dt.Columns)
                //{
                string entry = null;
                switch (Convert.ToInt32(type))
                {
                    case 1:
                        entry = row["name"] + "[" + row["type"] + "]";
                        break;
                    case 2:
                        entry = row["name"].ToString();
                        break;
                    case 3:
                        entry = row["name"] + "[" + row["type"] + "]";
                        break;
                    default:
                        entry = row["name"] + "[" + row["type"] + "]";
                        break;
                }
                //}
                hTable.Add("value", row["value"]);
                hTable.Add("name", entry);


                jsonString = JSON.JsonEncode(hTable);

                tblJson[ncount] = jsonString;
                ncount = ncount + 1;
            }
            returnString = header + String.Join(",", tblJson) + trailer;
        }
        else
        {
            returnString = "{\"items\": []}";
        }
        dt.Dispose();
        return returnString;
	}

    public string loadPermitAndNameInfo(string type, string dept) {
        driveLetter = mapDrive().ToString();
        string header = "{\"items\": [{";
        string trailer = "}]}";
        return header + loadNameInfo(dept) + "," + loadPermitInfo(dept) + "," + loadOtherPermitInfo(dept) + trailer; 
    }
    public string loadNameInfo(string dept) {
        string sql = sqlString("nameInfo", dept);

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
        string header = "\"nameInfo\": [";
        string trailer = "]";

        if (dt.Rows.Count != 0)
        {
            int ncount = 0;
            foreach (DataRow row in dt.Rows)
            {
                string pics = null;
                Hashtable hTable = new Hashtable();
                foreach (DataColumn dc in dt.Columns)
                {
                    if (dc.ColumnName != "PATH_PHOTO" && dc.ColumnName != "FILE_NAME")
                    {
                        hTable.Add(dc.ColumnName, row[dc.ColumnName].ToString());
                    }
                }
                if (row["FILE_NAME"].ToString() != "")
                {
                    pics = copyFile(row["PATH_PHOTO"].ToString(), null, 0, row["FILE_NAME"].ToString());
                    hTable.Add("PATH_PHOTO", pics.Split('?')[0]);
                }
                jsonString = JSON.JsonEncode(hTable);

                tblJson[ncount] = jsonString;
                ncount = ncount + 1;
            }
            returnString = header + String.Join(",", tblJson) + trailer;
        }
        else
        {
            returnString = "\"nameInfo\": []";
        }
        dt.Dispose();
        return returnString;
    }
    public string loadOtherPermitInfo(string dept)
    {
        string sql = sqlString("otherPermitInfo", dept);

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
        string header = "\"otherPermitInfo\": [";
        string trailer = "]";

        if (dt.Rows.Count != 0)
        {
            int ncount = 0;
            foreach (DataRow row in dt.Rows)
            {
                string pics = null;
                Hashtable hTable = new Hashtable();
                foreach (DataColumn dc in dt.Columns)
                {
                    hTable.Add(dc.ColumnName, row[dc.ColumnName].ToString());
                }
                jsonString = JSON.JsonEncode(hTable);

                tblJson[ncount] = jsonString;
                ncount = ncount + 1;
            }
            returnString = header + String.Join(",", tblJson) + trailer;
        }
        else
        {
            returnString = "\"otherPermitInfo\": []";
        }
        dt.Dispose();
        return returnString;
    }
    public string loadPermitInfo(string dept)
    {
        string sql = sqlString("permitInfo", dept);
        
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
        string header = "\"permitInfo\": [";
        string trailer = "]";

        if (dt.Rows.Count != 0)
        {
            int ncount = 0;
            foreach (DataRow row in dt.Rows)
            {
                string pics;
                Hashtable hTable = new Hashtable();
                foreach (DataColumn dc in dt.Columns)
                {
                    hTable.Add(dc.ColumnName, row[dc.ColumnName].ToString());

                }
                if (row["PM_ID"].ToString() != null)
                {
                    pics = getImageJSON(row["PM_ID"].ToString());
                    hTable.Add("Documents", pics);
                    hTable.Add("Activities", getPermitActivities(row["PM_ID"].ToString(), dept));
                }
                jsonString = JSON.JsonEncode(hTable);

                tblJson[ncount] = jsonString;
                ncount = ncount + 1;
            }
            returnString = header + String.Join(",", tblJson) + trailer;
        }
        else
        {
            returnString = "\"permitInfo\": []";
        }
        dt.Dispose();
        return returnString;
    }
    public string getImageJSON(string pmID)
    {
        string sql = "";
        DataTable subDt = new DataTable();
        sql = "SELECT     TOP (100) PERCENT '\\\\th-govern\\govarch\\' + 'Level' + CAST(dbo.PC_DOC_LOCATOR.ARCHIVE_LEVEL AS varchar(1)) + '\\' + CAST(CONVERT(CHAR(8),  " +
                "dbo.PC_DOC_LOCATOR.ENTRY_DATE, 112) AS varchar(8)) + '\\' + dbo.PC_DOC_LOCATOR.FILE_NAME AS Image, dbo.VT_USR_DEPINF.LONG_DESC AS Type,  " +
                "dbo.PC_DOC_LOCATOR.FILE_NAME, dbo.PM_LICENSE.PM_ID, dbo.NA_DEPT_INFO.REF_ID " +
                "FROM         dbo.PM_LICENSE INNER JOIN " +
                "dbo.NA_DEPT_INFO ON dbo.PM_LICENSE.NA_ID = dbo.NA_DEPT_INFO.NA_ID AND dbo.PM_LICENSE.PM_ID = dbo.NA_DEPT_INFO.REF_ID INNER JOIN " +
                "dbo.PC_DOC_LOCATOR ON dbo.NA_DEPT_INFO.DOCUMENT_LOCATOR = dbo.PC_DOC_LOCATOR.DOCUMENT_LOCATOR INNER JOIN " +
                "dbo.VT_USR_DEPINF ON dbo.NA_DEPT_INFO.CODE = dbo.VT_USR_DEPINF.CODE AND dbo.NA_DEPT_INFO.DEPT = dbo.VT_USR_DEPINF.DEPT " +
                "WHERE     (NOT (dbo.PC_DOC_LOCATOR.FILE_NAME IS NULL)) AND (dbo.PM_LICENSE.PM_ID = " + pmID + ")";
        //sql = "SELECT Type, DOCUMENT_PATH as Image, FILE_NAME FROM dbo._DOC_LOCATOR WHERE([PermitID] = '362066' and P_ID = 42085) GROUP BY Type, Document_Path, FILE_NAME HAVING      (NOT (Type IN ('Building Plans (PDF)', 'Building Plans (Pic)', 'Floor Plan (PDF)', 'Floor Plan PDF', 'Plans (PDF)'))) ORDER BY Type";
        SqlCommand sqlCommand = new SqlCommand(sql, conn);
        SqlDataAdapter adapter = new SqlDataAdapter(sqlCommand);
        try
        {
            adapter.Fill(subDt);
        }
        finally
        {
            conn.Close();
        }
        string pic = "";
        int rowCount = 0;
        if (subDt.Rows.Count != 0)
        {
            foreach (DataRow subRow in subDt.Rows)
            {
                string val = subRow["Type"].ToString();
                int count = ((pic.Length) - (pic.Replace(val, "").Length)) / subRow["Type"].ToString().Length;

                string fileName = subRow["FILE_NAME"].ToString();
                string newimage = copyFile(subRow["Image"].ToString(), driveLetter, rowCount, fileName);

                if (newimage != null)
                {
                    string w = "0";
                    string h = "0";
                    string pgCount = "0";
                    string[] format = newimage.Split('?');
                    newimage = format[0];
                    if (format.Length > 1)
                    {
                        w = format[1];
                        h = format[2];
                        pgCount = format[3];
                    }
                    string image = "";

                    if (newimage == "error")
                    {
                        image = "<tr><td style='width:100%'><a alt='' style='width:" + Convert.ToInt32(w) * .3 + "px; height:" + +Convert.ToInt32(h) * .3 + "px;' href='#' onclick='javascript:alert(\"There was an error processing your request Please Contact GIS\");'/>" + subRow["Type"].ToString() + "</a> " + pgCount + " page(s) </br></td></tr>";
                    }
                    else
                    {
                        image = "<tr><td style='width:100%'><a alt='' target='_blank' style='width:" + Convert.ToInt32(w) * .3 + "px; height:" + +Convert.ToInt32(h) * .3 + "px;' href='" + newimage + "'/>" + subRow["Type"].ToString() + "</a> " + pgCount + " page(s) </br></td></tr>";
                    }
                    pic += image;
                    rowCount++;
                }
            }
        }
        return "<table>" + pic + "</table>";
    }
    public string copyFile(string oldFilePath, string driveLetter, int count, string fileName)
    {
        string copyTo = null;
        string saveTo = null;
        int w = 0;
        int h = 0;
        string pgCount = "";
        string returnImage = "";
        try
        {
            string localFilePath = oldFilePath;
            copyTo = @"E:\Websites\LandManagerJs\Modules\NamePermits\PermitsImages\" + count.ToString() + fileName;
            if (File.Exists(copyTo))
            {
                returnImage = "11";
                saveTo = "/Modules/NamePermits/PermitsImages/" + count + fileName;
            }
            else
            {
                returnImage = "fff";
                File.Copy(localFilePath, copyTo);
                saveTo = "/Modules/NamePermits/PermitsImages/" + count + fileName;
            }
            try
            {
                System.Drawing.Image imgInFile = System.Drawing.Image.FromFile(copyTo);
                pgCount = imgInFile.GetFrameCount(FrameDimension.Page).ToString();
                w = imgInFile.Size.Width;
                h = imgInFile.Size.Height;
            }
            catch (Exception e)
            {
                returnImage = "cant copy 11" + e.Message;
            }
            returnImage = saveTo + "?" + w.ToString() + "?" + h.ToString() + "?" + pgCount;
        }
        catch (Exception e)
        {
            returnImage =  e.Message;
        }
        return returnImage;
    }
    public string getPermitActivities(string pmID, string dept)
    {
        DataTable subDt = new DataTable();
        DataTable Dt = new DataTable();
        string sql = "SELECT     TOP (100) PERCENT activities.STEP_NO AS STEP, activities.Activity, CONVERT(VARCHAR(11), activities.DATE_STARTED, 101) AS [Date Started], CONVERT(VARCHAR(11), activities.COMPLETION_DATE, 101) AS [Completed On], " +
                        "dbo.VT_USR_PMACTAW.LONG_DESC AS Status, activities.ACTIVITY_NO AS [Reference #], activities.LAST_MODIF_UID AS UserID,  "+
                        "activities.ASSIGN_TO AS [Assign To], activities.TIME_SPENT_TOT AS [Total Time Spent], CONVERT(VARCHAR(11), activities.TARGET_COMPL_DATE, 101) AS [Target Date], activities.DATE_STARTED, activities.COMPLETION_DATE " +
                        "FROM         (SELECT     TOP (100) PERCENT dbo.PM_ACTIVITY_STATUS.STEP_NO, dbo.VT_USR_DEPPMACT.LONG_DESC AS Activity, dbo.PM_ACTIVITY_STATUS.DATE_STARTED,  "+
                        "                        dbo.PM_ACTIVITY_STATUS.COMPLETION_DATE,  "+
                        "                        CASE completion_status WHEN 1 THEN next_level_d_1 WHEN 2 THEN next_level_d_2 WHEN 3 THEN next_level_d_3 WHEN 4 THEN next_level_d_4 END AS "+
                        "                        Status, dbo.PM_ACTIVITY_STATUS.ACTIVITY_NO, dbo.PM_ACTIVITY_STATUS.KEY_ID, dbo.VT_USR_DEPPMACT.DEPT,  "+
                        "                        dbo.PM_ACTIVITY_STATUS.LAST_MODIF_UID, dbo.PM_ACTIVITY_STATUS.ASSIGN_TO, dbo.PM_ACTIVITY_STATUS.TIME_SPENT_TOT,  "+
                        "                        dbo.PM_ACTIVITY_STATUS.TARGET_COMPL_DATE "+
                        "FROM          dbo.PM_ACTIVITY_STATUS INNER JOIN "+
                        "                        dbo.VT_USR_DEPPMACT ON dbo.PM_ACTIVITY_STATUS.ACTIVITY_NO = dbo.VT_USR_DEPPMACT.CODE INNER JOIN "+
                        "                        dbo.PM_TYPE_ACTIVITY ON dbo.PM_ACTIVITY_STATUS.KEY_TYPE = dbo.PM_TYPE_ACTIVITY.KEY_TYPE AND  "+
                        "                        dbo.PM_ACTIVITY_STATUS.STEP_NO = dbo.PM_TYPE_ACTIVITY.STEP_NO INNER JOIN "+
                        "                        dbo.PM_MASTER ON dbo.PM_ACTIVITY_STATUS.KEY_ID = dbo.PM_MASTER.PM_ID AND  "+
                        "                        dbo.PM_TYPE_ACTIVITY.PM_TYPE = dbo.PM_MASTER.PM_TYPE) AS activities LEFT OUTER JOIN "+
                        "dbo.VT_USR_PMACTAW ON dbo.VT_USR_PMACTAW.CODE = activities.Status "+
                        "WHERE     (activities.KEY_ID = "+ pmID +") AND (activities.DEPT = '"+ dept + "') "+
                        "ORDER BY STEP, activities.DATE_STARTED, activities.COMPLETION_DATE";

        SqlCommand sqlCommand = new SqlCommand(sql, conn);
        SqlDataAdapter adapter = new SqlDataAdapter(sqlCommand);
        adapter.Fill(Dt);
        string activities = "";

        DataView dv = Dt.DefaultView;
        dv.Sort = "STEP, DATE_STARTED, COMPLETION_DATE";
        subDt = dv.ToTable();

        string tr = "";
        if (subDt.Rows.Count != 0)
        {
            foreach (DataRow row in subDt.Rows)
            {
                string td = "";
                foreach (DataColumn dcs in subDt.Columns)
                {
                    if (row[dcs.ColumnName].ToString() != "" && row[dcs.ColumnName].ToString() != null && dcs.ColumnName.ToString() != "DATE_STARTED" && dcs.ColumnName.ToString() != "COMPLETION_DATE")
                    {
                        td += "<td style='padding:5px;'>" + row[dcs.ColumnName].ToString() + "</td>";
                    }
                }
                activities += "<tr style=''>" + td + "</tr>";
                //activities += "<tr><td style='padding:3px;'> " + row["activity_desc"].ToString() + "</td><td style='padding:3px;'> " + row["Date_Started"].ToString() + "</td><td style='padding:3px;'> " + row["completion_date"].ToString() + "</td><td style='padding:3px;'> " + row["long_desc"].ToString() + "</td></tr>";
            }
            tr = "<tr style='padding:10px;'><th>Step</th><th>Activity</th><th>Started</th><th>Completed</th><th>Status</th><th>Reference #</th><th>UserID</th></tr>";
        }
        return "<table>" + tr + activities + "</table>";
    }
    public string mapDrive()
    {
        string domainName = ConfigurationManager.AppSettings["Domain"];
        string userName = ConfigurationManager.AppSettings["UserName"];
        string passWord = ConfigurationManager.AppSettings["Password"];
        oNetDrive = new aejw.Network.NetworkDrive();
        try
        {
            oNetDrive.LocalDrive = "q:";
            oNetDrive.ShareName = @"\\th-govern\govarch\0";
            oNetDrive.MapDrive(userName, passWord);
        }
        catch (Exception e)
        {
            oNetDrive.LocalDrive = "error";
        }
        return oNetDrive.LocalDrive.ToString();
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

    public bool IsReusable
    {
        get { throw new NotImplementedException(); }
    }

    public void ProcessRequest(HttpContext context)
    {
        throw new NotImplementedException();
    }
}