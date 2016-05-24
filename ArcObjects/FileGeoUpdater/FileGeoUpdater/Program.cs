using System;
using SDELoginHelper;
using System.Collections.Generic;
using System.IO;
using System.Text;
using System.Collections;
using System.Configuration;
using System.Diagnostics;
using System.Security.Principal;
using System.Security.Permissions;
using System.Security.AccessControl;
using System.Runtime.InteropServices;
using System.Threading;
using ESRI.ArcGIS.esriSystem;
using ESRI.ArcGIS.Geodatabase;

namespace FileGeoUpdater
{
   internal class Program:LogUtilities
    {
        private const uint CONNECT_CMD_SAVECRED = 0x1000;
        private const uint CONNECT_COMMANDLINE = 0x800;
        private const uint CONNECT_INTERACTIVE = 8;
        private const uint CONNECT_PROMPT = 0x10;
        private const uint CONNECT_REDIRECT = 0x80;
        private const uint CONNECT_UPDATE_PROFILE = 1;
        private const uint RESOURCETYPE_ANY = 0;
        private const uint RESOURCETYPE_DISK = 1;

        private const int ERROR_SUCCESS = 0;

        private static IWorkspaceName getWorkspaceName(IWorkspace workspace)
        {
           var dataset = (IDataset)workspace;
           return (IWorkspaceName)dataset.FullName;
        }

        private static string GetFileStamp()
        {
           return string.Format(".{0:yyyy-MM-dd_hh-mm-ss-tt}", DateTime.Now);
        }

        private static IName getTargetDatasetName(IDataset fgdbDataset)
        {
           var workspaceName = (IWorkspaceName)fgdbDataset.FullName;
           return null;
        }

        private static void WriteStatus(string name, string type)
        {
           Console.WriteLine("Iterating: {0}", name);
           Console.WriteLine("Dataset Type: {0}", type);
           Console.WriteLine();

           log.Info("Iterating Name: " + name);
           log.Info("Dataset Type: " + type);
           log.Info("");
        }

        private static void WriteStatus(string name, string type, string message)
        {
           Console.WriteLine("Error Name: {0} Message {1}", name, message);
           Console.WriteLine("Error Dataset Type: {0}", type);
           Console.WriteLine();

           log.Info("Error Iterating Name: " + name);
           log.Info("Error Dataset Type: " + type);
           log.Info("");
        }

        private static void writeLockFiles(string source)
        {
           try
           {
                 foreach (string f in Directory.GetFiles(source,"*.lock"))
                 {
                    log.Info("Lock On: [" + f + "]");
                    Console.WriteLine(f);
                 }
           }
           catch (Exception ex)
           {
              Console.WriteLine(ex.Message);
              log.Info("Error Getting Lock messages: [" + ex.Message + "]");
           }
        }
        private static bool DoBackupCopy(string path)
        {
           string file = ConfigurationManager.AppSettings["FGDB_FILE"];
           string sourcePath = path + file;
           string targetPath = path + file + GetFileStamp();
           bool backupDone = true;

           writeLockFiles(sourcePath);

           log.Info("Source path: [" + sourcePath + "]");
           log.Info("Back Up To: [" + targetPath + "]");
  
           string backs = file + "." + "*M";
           string[] dirs = Directory.GetDirectories(path, backs);

           foreach (string name in dirs)
           {
              Directory.Delete(name, true);
           }
           
           if (Directory.Exists(sourcePath))
           {
              try
              {
                 // AddDirectorySecurity(sourcePath, WindowsIdentity.GetCurrent().Name, FileSystemRights.FullControl, AccessControlType.Allow);
                 Directory.Move(sourcePath, targetPath);

                 Console.WriteLine("");
                 Console.WriteLine("Moving Directory: [" + sourcePath + "] => " + targetPath);
                 Console.WriteLine("");

                 log.Info("\n");
                 log.Info("Moving Directory: [" + sourcePath + "] => " + targetPath);
                 log.Info("\n");
              }
              catch (Exception ex)
              {
                 backupDone = false;
                 Console.WriteLine("Error creating backup: " + ex.Message);
                 log.Error("Error creating backup: " + ex.Message);

              }
           }

           return backupDone;
        }

        private static void AddDirectorySecurity(string FileName, string Account, FileSystemRights Rights, AccessControlType ControlType)
        {
           DirectoryInfo dInfo = new DirectoryInfo(FileName);
           DirectorySecurity dSecurity = dInfo.GetAccessControl();
           dSecurity.AddAccessRule(new FileSystemAccessRule(Account, Rights, ControlType));
           dInfo.SetAccessControl(dSecurity);
        }

        public static void RemoveDirectorySecurity(string FileName, string Account, FileSystemRights Rights, AccessControlType ControlType)
        {
           DirectoryInfo dInfo = new DirectoryInfo(FileName);
           DirectorySecurity dSecurity = dInfo.GetAccessControl();
           dSecurity.RemoveAccessRule(new FileSystemAccessRule(Account,Rights,ControlType));
           dInfo.SetAccessControl(dSecurity);
        }

        private object TransferData(IEnumNameMapping enumNameMapping, IName targetName, string dsName, string className)
        {
           IGeoDBDataTransfer2 geoDBDataTransfer = new GeoDBDataTransferClass();
           try
           {
              geoDBDataTransfer.Transfer(enumNameMapping, targetName);
              Console.WriteLine("\tCopying SDE Class [" + dsName + "]: " + className);
              log.Info("\tCopying SDE Class name: " + className);
              log.Info("\n");

           }
           catch (Exception e)
           {
              Console.WriteLine("Transfer Failure: " + e.Message + " Source: " + className + " Target: " + targetName);
              log.Error("Transfer Failure: " + e.Message + " Source: " + className + " Target: " + targetName);
              return e;
           }
           
           return null;
        }
        private static IWorkspace OpenFileGeodatabase(string path)
        {
           Type factoryType = Type.GetTypeFromProgID("esriDataSourcesGDB.FileGDBWorkspaceFactory");

           var workspaceFactory = (IWorkspaceFactory)Activator.CreateInstance(factoryType);
           IWorkspaceName workspaceName = workspaceFactory.Create(path, ConfigurationManager.AppSettings["FGDB_FILE"], null, 0);
           ESRI.ArcGIS.esriSystem.IName name = (ESRI.ArcGIS.esriSystem.IName)workspaceName;
           IWorkspace fileGDB = (IWorkspace)name.Open();
           return (fileGDB);
        }

        [STAThread()]
        public static int Main(string[] args)
        {
           //ESRI License Initializer generated code.
           //m_AOLicenseInitializer.InitializeApplication(new esriLicenseProductCode[] { esriLicenseProductCode.esriLicenseProductCodeAdvanced }, new esriLicenseExtensionCode[] { });           

           ArcObjectsInit arcInit = new ArcObjectsInit();
           //Console.WriteLine(WindowsIdentity.GetCurrent().Name);

           string domainName = ConfigurationManager.AppSettings["Domain"];
           string userName = ConfigurationManager.AppSettings["UserName"];
           string passWord = ConfigurationManager.AppSettings["Password"];

           NETRESOURCE ConnInf = new NETRESOURCE
           {
              dwScope = 0,
              dwType = 1,
              dwDisplayType = 0,
              dwUsage = 0,
              lpLocalName = "Q:",
              lpRemoteName = ConfigurationManager.AppSettings["LP_REMOTE"] + '\0',
              lpComment = null,
              lpProvider = null
           };


           uint result = WNetAddConnection2(ref ConnInf, passWord, userName, 0);
           NetworkSecurity.ImpersonateUser(domainName, userName, passWord, LogonType.LOGON32_LOGON_NEW_CREDENTIALS, LogonProvider.LOGON32_PROVIDER_WINNT50);
           Console.WriteLine(WindowsIdentity.GetCurrent().Name);

           log.Info("");
           log.Info("Starting File Geodatabase Update");
           log.Info("Attempting login with result of: " + result.ToString());
           log.Info("Running program as user: " + WindowsIdentity.GetCurrent().Name);

           if ((result == 0) || (0x55 == result))
           {
              log.Info("Attempting to initialize ArcObjects");
              object initSuccess = arcInit.InitializeArcObjects();

              if (initSuccess == null)
              {
                 log.Info("Successful ArcObjects initialization");

                 object login = SDELogin.openSDEWorkspace(ConfigurationManager.AppSettings["SDE_NAME"], "sde:sqlserver:" + ConfigurationManager.AppSettings["SDE_NAME"], "SDEadmin", "SDEadmin", "VECTOR", "sde.DEFAULT", "DBMS");
                 if (login is Exception)
                 {
                    log.Fatal(login.ToString());
                    Console.WriteLine("SDE Failed Login: {0}", login.ToString());
                 }
                 else
                 {
                    log.Info("Successful SDE login");
                    string path = ConfigurationManager.AppSettings["REMOTE_PATH"];

                    if (ConfigurationManager.AppSettings["TEST"] == "1")
                    {
                       path = ConfigurationManager.AppSettings["LOCAL_TEST"];
                    }

                    if (DoBackupCopy(path))
                    {
                       IWorkspace fgdbSpace = OpenFileGeodatabase(path);

                       IWorkspaceName wsSDESource = new WorkspaceNameClass();
                       IWorkspaceName wsFGDBTarget = new WorkspaceNameClass();
                       IName targetName = (IName)wsFGDBTarget;

                       IWorkspace wSpace = login as IWorkspace;

                       wsSDESource = getWorkspaceName(wSpace);
                       wsFGDBTarget = getWorkspaceName(fgdbSpace);

                       IFeatureClassName featureClassName = null;
                       IDatasetName sourceDatasetName = null;

                       IEnumDataset dsEnum = wSpace.get_Datasets(esriDatasetType.esriDTAny);
                       IDataset ds = null;
                        
                       for (ds = dsEnum.Next(); ds != null; ds = dsEnum.Next())
                       {
                          if (ds.Type == esriDatasetType.esriDTFeatureClass)
                          {
                             featureClassName = new FeatureClassNameClass();
                             sourceDatasetName = (IDatasetName)featureClassName;
                          }

                          if (ds.Type == esriDatasetType.esriDTFeatureDataset)
                          {
                             sourceDatasetName = new FeatureDatasetNameClass();
                          }

                          if (ds.Type == esriDatasetType.esriDTRelationshipClass)
                          {
                             //IRelationshipClassName relationshipClassName = new RelationshipClassNameClass();
                             //sourceDatasetName = (IDatasetName)relationshipClassName;
                             continue;
                          }

                          if (ds.Type == esriDatasetType.esriDTTable)
                          {
                             ITableName tableName = new TableNameClass();
                             sourceDatasetName = (IDatasetName)tableName;
                          }


                          sourceDatasetName.WorkspaceName = wsSDESource;
                          sourceDatasetName.Name = ds.Name;
                          IName sourceName = (IName)sourceDatasetName;

                          IEnumName sourceEnumName = new NamesEnumeratorClass();
                          IEnumNameEdit sourceEnumNameEdit = (IEnumNameEdit)sourceEnumName;

                          sourceEnumNameEdit.Add(sourceName);

                          IGeoDBDataTransfer geoDBDataTransfer = new GeoDBDataTransferClass();
                          IEnumNameMapping enumNameMapping = null;

                          try
                          {
                             Boolean conflictsFound = geoDBDataTransfer.GenerateNameMapping(sourceEnumName, (IName)wsFGDBTarget, out enumNameMapping);
                             enumNameMapping.Reset();
                             geoDBDataTransfer.Transfer(enumNameMapping, (IName)wsFGDBTarget);

                             WriteStatus(ds.Name.ToString(), ds.Type.ToString());
                          }
                          catch (Exception ex)
                          {
                             WriteStatus(ds.Name.ToString(), ds.Type.ToString(), ex.Message);
                          }
                       }
                    }
                 }
              }

              else
              {
                 log.Info("Failed ArcObjects initialization");
              }

              arcInit.ShutDownArcObjects();
              //m_AOLicenseInitializer.ShutdownApplication();
           }

           return ERROR_SUCCESS;
        }

        [DllImport("mpr.dll", EntryPoint="WNetAddConnection2W", CharSet=CharSet.Unicode)]
        private static extern uint WNetAddConnection2(ref NETRESOURCE lpNetResource, string lpPassword, string lpUsername, uint dwFlags);
        [DllImport("mpr.dll")]
        private static extern uint WNetCancelConnection2(string lpName, uint dwFlags, bool bForce);

        [StructLayout(LayoutKind.Sequential), PermissionSet(SecurityAction.Demand, Name="FullTrust")]
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
    }
}
