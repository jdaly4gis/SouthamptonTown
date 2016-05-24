using System;
using System.Collections;
using System.Configuration;
using System.IO;
using System.Net;
using System.Net.Mail;
using ESRI.ArcGIS.Geodatabase;
using ESRI.ArcGIS.esriSystem;

namespace FileGeoUpdater
{
    internal class FeatureOperations : LogUtilities
    {
        private readonly Hashtable hash;
        private readonly string target;
        private readonly string test;
        private readonly IWorkspace wSpace;
        private IWorkspace fgdbSpace;
        private string fullPath;
        private ArrayList list;
        private string source;


        public FeatureOperations()
        {
            list = null;
            hash = null;
            wSpace = null;
            fgdbSpace = null;
            fullPath = ConfigurationManager.AppSettings["Geo_Path"] + ConfigurationManager.AppSettings["FGDB_TARG"];
//            source = ConfigurationManager.AppSettings["Geo_Path"] + ConfigurationManager.AppSettings["FGDB_SOURCE"];
//            test = ConfigurationManager.AppSettings["Geo_Path"] + ConfigurationManager.AppSettings["FGDB_TARGET"];
//            target = ConfigurationManager.AppSettings["REMOTE_PATH"] + ConfigurationManager.AppSettings["FGDB_Location"];
        }

        public FeatureOperations(ArrayList list)
            : this()
        {
            this.list = list;
        }

        public FeatureOperations(Hashtable hash)
            : this()
        {
            this.hash = hash;
        }

        public FeatureOperations(ArrayList list, IWorkspace wSpace)
            : this(list)
        {
            this.wSpace = wSpace;
            GetDataSet();
        }

        public FeatureOperations(Hashtable hash, IWorkspace wSpace)
            : this(hash)
        {
            this.wSpace = wSpace;
            this.MakeBackupCopy();
            //UpdateViews();
            this.GetDataSet();
        }

        private bool DoFullRun
        {
            get { return DateTime.Now.DayOfWeek.ToString().Equals("Sunday"); }
        }

        private static string FileDateTime
        {
            get
            {
                string ctemp;
                try
                {
                    DateTime d = DateTime.Now;
                    ctemp = d.ToString("MM") + d.ToString("dd") + d.ToString("yyyy") + d.ToString("hh") +
                            d.ToString("mm") + d.ToString("ss") + d.ToString("tt");
                }
                catch
                {
                    throw;
                }
                return ctemp;
            }
        }

        private IWorkspace OpenFileGeodatabase(string path)
        {
            Type factoryType = Type.GetTypeFromProgID("esriDataSourcesGDB.FileGDBWorkspaceFactory");

            var workspaceFactory = (IWorkspaceFactory)Activator.CreateInstance(factoryType);
            return workspaceFactory.OpenFromFile(path, 0);
        }

        private void GetDataSet()
        {
            
            if (ConfigurationManager.AppSettings["TEST"] == "1")
            {
                fgdbSpace = OpenFileGeodatabase(test);
            }
            else
            {
                fgdbSpace = OpenFileGeodatabase(target);
            }
            IWorkspaceName wsSourceName = new WorkspaceNameClass();
            IWorkspaceName wsTargetName = new WorkspaceNameClass();
            wsSourceName = getWorkspaceName(wSpace);
            wsTargetName = getWorkspaceName(fgdbSpace);

            IEnumDataset dsEnum = wSpace.get_Datasets(esriDatasetType.esriDTFeatureDataset);
            IDataset ds = null;

            for (ds = dsEnum.Next(); ds != null; ds = dsEnum.Next())
            {
               log.Info("Starting Dataset: " + ds.Name);
                IDataset fgDS = GetFGDBDataset(fgdbSpace, ds.Name);
                if (fgDS == null)
                {
                    log.Fatal("Unable to find matching FGDB dataset for: " + ds.Name);
                    Console.WriteLine("Unable to find matching FGDB dataset for: " + ds.Name);
                    break;
                }

                if (ds.Type == esriDatasetType.esriDTFeatureDataset)
                {
                    IEnumDataset dsEnumSubsets = ds.Subsets;
                    IDataset sdeClass = null;

                    for (sdeClass = dsEnumSubsets.Next(); sdeClass != null; sdeClass = dsEnumSubsets.Next())
                    {

                        if (sdeClass.Type == esriDatasetType.esriDTRelationshipClass)
                        {
                            break;
                        }
                        
                        // Source IName
                        IFeatureClassName sourceFeatureClassName = new FeatureClassNameClass();
                        var sourceDatasetName = (IDatasetName)sourceFeatureClassName;
                        sourceDatasetName.WorkspaceName = wsSourceName;
                        sourceDatasetName.Name = sdeClass.Name;
                        var sourceName = (IName)sourceDatasetName;

                        //Source enumerator
                        IEnumName sourceEnumName = new NamesEnumeratorClass();
                        var sourceEnumNameEdit = (IEnumNameEdit)sourceEnumName;
                        sourceEnumNameEdit.Add(sourceName);


                        //Iterate through File Geodatabase
                        IEnumDataset fgdbEnumSubsets = fgDS.Subsets;
                        IDataset fgdbClass = null;

                        for (fgdbClass = fgdbEnumSubsets.Next(); fgdbClass != null; fgdbClass = fgdbEnumSubsets.Next())
                        {
                            if (("VECTOR.SDEADMIN." + fgdbClass.Name) == sdeClass.Name ||
                                ("Vector.SDEADMIN." + fgdbClass.Name) == sdeClass.Name)
                            {
                                break;
                            }
                        }

                        IGeoDBDataTransfer geoDBDataTransfer = new GeoDBDataTransferClass();
                        IEnumNameMapping enumNameMapping = null;
                        IName targetName = fgDS.FullName;

                        bool conflictsFound = false;

                        try
                        {
                            conflictsFound = geoDBDataTransfer.GenerateNameMapping(sourceEnumName, (IName)wsTargetName,
                                                                                   out enumNameMapping);
                        }
                        catch (Exception ex)
                        {
                            log.Warn(
                                string.Concat(new object[] { "Mapping failure for  ", ds.Name, " to ", fgDS.Name, " Message: ", ex.Message }));
                        }
                        enumNameMapping.Reset();
                        conflictsFound = false;
                        if (conflictsFound)
                        {
                            // Iterate through each name mapping.
                            INameMapping nameMapping = null;
                            while ((nameMapping = enumNameMapping.Next()) != null)
                            {
                                // Resolve the mapping's conflict (if there is one).
                                if (nameMapping.NameConflicts)
                                {
                                    nameMapping.TargetName = nameMapping.GetSuggestedName(targetName);
                                }

                                // See if the mapping's children have conflicts.
                                IEnumNameMapping childEnumNameMapping = nameMapping.Children;
                                if (childEnumNameMapping != null)
                                {
                                    childEnumNameMapping.Reset();

                                    // Iterate through each child mapping.
                                    INameMapping childNameMapping = null;
                                    while ((childNameMapping = childEnumNameMapping.Next()) != null)
                                    {
                                        if (childNameMapping.NameConflicts)
                                        {
                                            childNameMapping.TargetName = childNameMapping.GetSuggestedName(targetName);
                                        }
                                    }
                                }
                            }
                        }
                        if (!sdeClass.Name.Equals("VECTOR.SDEADMIN.Villages")
                            && !sdeClass.Name.Equals("VECTOR.SDEADMIN.VillagesAnno")
                            && !sdeClass.Name.Equals("VECTOR.SDEADMIN.Anno_573_2682")
                            && !sdeClass.Name.Equals("VECTOR.SDEADMIN.ServiceRequest")
                            && !sdeClass.Name.Equals("VECTOR.SDEADMIN.ServiceRequestHasServiceRequestComment")
                            )
                        {
                            if (DoFullRun || ConfigurationManager.AppSettings["CopyAll"] == "1")
                            {
                                log.Info("Delete Full [" + ds.Name + "]: " + sdeClass.Name);
                                Console.WriteLine("Delete Full [" + ds.Name + "]: " + sdeClass.Name);
                                Console.WriteLine();
                                try
                                {
                                    fgdbClass.Delete();
                                }
                                catch (Exception)
                                {
                                    log.Info("Exception on 'Delete': [" + ds.Name + "]: " + sdeClass.Name);
                                }
                                if (TransferData(enumNameMapping, targetName, ds.Name, sdeClass.Name) is Exception)
                                {
                                    Console.WriteLine("Failure Copying[" + ds.Name + "]: " + sdeClass.Name);
                                }
                            }
                            else if (hash.ContainsKey("VECTOR.SDEADMIN." + fgdbClass.Name.ToUpper()))
                            {
                                log.Info("Delete Incremental [" + ds.Name + "]: " + sdeClass.Name);
                                Console.WriteLine("Delete Incremental [" + ds.Name + "]: " + sdeClass.Name);
                                Console.WriteLine();
                                try
                                {
                                    fgdbClass.Delete();
                                }
                                catch (Exception)
                                {
                                    log.Info("\tException(failure) to delete: [" + ds.Name + "]: " + sdeClass.Name);
                                }
                                if (TransferData(enumNameMapping, targetName, ds.Name, sdeClass.Name) is Exception)
                                {
                                    Console.WriteLine("\tFailure Copying[" + ds.Name + "]: " + sdeClass.Name);
                                }
                            }
                        }
                    }
                }

            }
                    log.Info("End processing");
        }

        private IDataset GetFGDBDataset(IWorkspace tSpace, string dsName)
        {
            IEnumDataset fgdb_enum = tSpace.get_Datasets(esriDatasetType.esriDTFeatureDataset);
            for (IDataset fgdbds = fgdb_enum.Next(); fgdbds != null; fgdbds = fgdb_enum.Next())
            {
                string fgdbTemp = "VECTOR.SDEADMIN." + fgdbds.Name;
                if (dsName == fgdbTemp)
                {
                    return fgdbds;
                }
            }
            return null;
        }

        private string GetFileStamp()
        {
            return string.Format(".{0:yyyy-MM-dd_hh-mm-ss-tt}", DateTime.Now);
        }

        private static IName getTargetDatasetName(IDataset fgdbDataset)
        {
            var workspaceName = (IWorkspaceName)fgdbDataset.FullName;
            return null;
        }

        private static IWorkspaceName getWorkspaceName(IWorkspace workspace)
        {
            var dataset = (IDataset)workspace;
            return (IWorkspaceName)dataset.FullName;
        }

        private void MakeBackupCopy()
        {
            string path = "";

            if (ConfigurationManager.AppSettings["TEST"] == "1")
            {
                path = ConfigurationManager.AppSettings["Geo_Path"];
            }
            else
            {
                path = ConfigurationManager.AppSettings["REMOTE_PATH"];
            }

            string sourcePath = path + ConfigurationManager.AppSettings["FGDB_Backup"];
            string targetPath = path + ConfigurationManager.AppSettings["FGDB_Backup"] + GetFileStamp();

            log.Info("Source path: [" + sourcePath + "]");
            log.Info("Back Up To: [" + targetPath + "]");

            string[] dirs = Directory.GetDirectories(path, "VECTOR.gdb.*M");
            foreach (string name in dirs)
            {
                Directory.Delete(name, true);
            }

            if (!Directory.Exists(targetPath))
            {
                Directory.CreateDirectory(targetPath);
            }

            if (Directory.Exists(sourcePath))
            {
                string[] files = Directory.GetFiles(sourcePath);
                foreach (string s in files)
                {
                    string fileName = Path.GetFileName(s);
                    string destFile = Path.Combine(targetPath, fileName);
                    File.Copy(s, destFile, true);
                }
            }
            else
            {
                log.Warn("Source path: [" + sourcePath + "] does not exist");
                log.Warn("Target path: [" + targetPath + "] does not exist");
            }
        }

        private object TransferData(IEnumNameMapping enumNameMapping, IName targetName, string dsName, string className)
        {
            IGeoDBDataTransfer2 geoDBDataTransfer = new GeoDBDataTransferClass();
            try
            {
                geoDBDataTransfer.Transfer(enumNameMapping, targetName);
            }
            catch (Exception e)
            {
                Console.WriteLine("Transfer Failure: " + e.Message + " Source: " + className + " Target: " + targetName);
                Console.WriteLine("Transfer Failure: " + e.Message + " Source: " + className + " Target: " + targetName);
                return e;
            }
            Console.WriteLine("\tCopying SDE Class [" + dsName + "]: " + className);
            log.Info("\tCopying SDE Class name: " + className);
            log.Info("\n");

            return null;
        }

        private void UpdateViews()
        {
            switch (ConfigurationManager.AppSettings["TEST"])
            {
                case "1":
                    fgdbSpace = OpenFileGeodatabase(test);
                    break;
                default:
                    fgdbSpace = OpenFileGeodatabase(target);
                    break;
            }

            var viewEnum = wSpace.get_Datasets(esriDatasetType.esriDTFeatureClass);
            IDataset view = viewEnum.Next();
            IWorkspaceName wsSourceName = getWorkspaceName(wSpace);
            var targetName = (IName)getWorkspaceName(fgdbSpace);
        }
    }
}