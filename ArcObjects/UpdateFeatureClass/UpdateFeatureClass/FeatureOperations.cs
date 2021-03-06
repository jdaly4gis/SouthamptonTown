// Decompiled with JetBrains decompiler
// Type: UpdateFeatureClass.FeatureOperations
// Assembly: UpdateFeatureClass, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null
// MVID: D1915941-0CFA-4E01-B14C-416E7507180F
// Assembly location: C:\UpdateFeatureClass\UpdateFeatureClass.exe

using ESRI.ArcGIS.DataSourcesFile;
using ESRI.ArcGIS.esriSystem;
using ESRI.ArcGIS.Geodatabase;
using System;
using System.Collections;
using System.Configuration;
using System.Diagnostics;
using System.IO;
using System.Runtime.InteropServices;

namespace UpdateFeatureClass
{
   internal class FeatureOperations : LogUtilities
   {
      private ArrayList list;
      private IWorkspace wSpace;

      public static string FileDateTime
      {
         get
         {
            string str = string.Empty;
            try
            {
               DateTime now = DateTime.Now;
               return now.ToString("MM") + now.ToString("dd") + now.ToString("yyyy") + now.ToString("hh") + now.ToString("mm") + now.ToString("ss") + now.ToString("tt");
            }
            catch
            {
               throw;
            }
         }
      }

      public FeatureOperations()
      {
      }

      public FeatureOperations(ArrayList list)
         : this()
      {
         this.list = list;
      }

      public FeatureOperations(ArrayList list, IWorkspace wSpace)
         : this(list)
      {
         this.wSpace = wSpace;
         this.GetDataSet();
      }

      private void GetDataSet()
      {
         IEnumDataset enumDataset = this.wSpace.get_Datasets(esriDatasetType.esriDTFeatureDataset);
         for (IDataset dataset1 = enumDataset.Next(); dataset1 != null; dataset1 = enumDataset.Next())
         {
            if (dataset1.Name == ConfigurationManager.AppSettings["SDE_DB"] + ".SDEADMIN.CADASTRAL")
            {
               IEnumDataset subsets = dataset1.Subsets;
               for (IDataset dataset2 = subsets.Next(); dataset2 != null; dataset2 = subsets.Next())
               {
                  if (dataset2.Name == ConfigurationManager.AppSettings["SDE_DB"] + ".SDEADMIN.Tax_Parcels")
                  {
                     this.CopyFeatureClass(dataset2, this.wSpace);
                     //this.UpdateFeatures(dataset2, this.list);
                  }
               }
            }
         }
      }

      private void CopyFeatureClass(IDataset ds, IWorkspace sourceWorkspace)
      {
         IWorkspace workspace = (IWorkspace)null;
         try
         {
            workspace = new ShapefileWorkspaceFactoryClass().OpenFromFile(ConfigurationManager.AppSettings["BackupLocation"], 0);
         }
         catch (Exception ex)
         {
            string message = ex.Message;
            Console.WriteLine("Unable to write backup file to: " + ConfigurationManager.AppSettings["BackupLocation"]);
            LogUtilities.log.Warn((object)("Unable to write backup file to: " + ConfigurationManager.AppSettings["BackupLocation"]));
         }
         IDataset dataset = (IDataset)workspace;
         IName fullName = ((IDataset)sourceWorkspace).FullName;
         IWorkspaceName workspaceName1 = (IWorkspaceName)dataset.FullName;
         IWorkspaceName workspaceName2 = (IWorkspaceName)fullName;
         IFeatureClassName InputDatasetName = (IFeatureClassName)new FeatureClassNameClass();
         IDatasetName datasetName1 = (IDatasetName)InputDatasetName;
         datasetName1.Name = ConfigurationManager.AppSettings["SDE_DB"] + ".SDEADMIN.Tax_Parcels";
         datasetName1.WorkspaceName = workspaceName2;
         IFeatureClassName outputFClassName = (IFeatureClassName)new FeatureClassNameClass();
         IDatasetName datasetName2 = (IDatasetName)outputFClassName;
         datasetName2.Name = ConfigurationManager.AppSettings["SDE_DB"] + ".SDEADMIN.Tax_Parcels_" + FeatureOperations.FileDateTime;
         datasetName2.WorkspaceName = workspaceName1;
         IFeatureClass featureClass = (IFeatureClass)((IName)InputDatasetName).Open();
         IFieldChecker fieldChecker = (IFieldChecker)new FieldCheckerClass();
            IFields fields = featureClass.Fields;
            IFields fixedFields = (IFields)null;
            IEnumFieldError error = (IEnumFieldError)null;
            fieldChecker.InputWorkspace = sourceWorkspace;
            fieldChecker.ValidateWorkspace = workspace;
            fieldChecker.Validate(fields, out error, out fixedFields);
            if (error != null)
            {
                Console.WriteLine("Errors were encountered during field validation.");
                IFieldError fieldError;
                while ((fieldError = error.Next()) != null)
                    Console.WriteLine("Error: " + ((object)fieldError.FieldError).ToString() + " Field no: " + fieldError.FieldIndex.ToString());
            }
            string shapeFieldName = featureClass.ShapeFieldName;
            int field = featureClass.FindField(shapeFieldName);
            IGeometryDef OutputGeometryDef = (IGeometryDef)((IClone)fields.get_Field(field).GeometryDef).Clone();
            IQueryFilter InputQueryFilter = (IQueryFilter)new QueryFilterClass();
            InputQueryFilter.WhereClause = "";
            IEnumInvalidObject enumInvalidObject = new FeatureDataConverterClass().ConvertFeatureClass(InputDatasetName, InputQueryFilter, (IFeatureDatasetName)null, outputFClassName, OutputGeometryDef, fixedFields, "", 1000, 0);
            enumInvalidObject.Reset();
            IInvalidObjectInfo invalidObjectInfo;
            while ((invalidObjectInfo = enumInvalidObject.Next()) != null)
                Console.WriteLine("Errors occurred for the following feature: {0}", (object)invalidObjectInfo.InvalidObjectID);
        }

        private void UpdateFeatures(IDataset dataset, ArrayList list)
        {

            IQueryFilter filter = (IQueryFilter)new QueryFilterClass();
            IFeatureClass featureClass = (IFeatureClass)dataset;
            IWorkspaceEdit workspaceEdit = (IWorkspaceEdit)this.wSpace;
            Stopwatch stopwatch = Stopwatch.StartNew();
            workspaceEdit.StartEditing(false);
            workspaceEdit.StartEditOperation();
            int count = 0;

                IFeatureCursor featureCursor = featureClass.Update(filter, false);
                IFields fields = featureCursor.Fields;
            foreach (object[] record in list)
            {

                ++count;
                string dsbl_index = (string)record[3];
                filter.WhereClause = "DSBL='" + dsbl_index + "'";
                int field1 = fields.FindField("PARCEL_ID");
                int field2 = fields.FindField("TAXMAP");
                int field3 = fields.FindField("GV_TAXMAP");
                int field4 = fields.FindField("DSBL");
                int field5 = fields.FindField("FLAG");
                int field6 = fields.FindField("FIRST_NAME");
                int field7 = fields.FindField("M_INITIAL");
                int field8 = fields.FindField("LAST_NAME");
                int field9 = fields.FindField("COMPANY");
                int field10 = fields.FindField("PROP_TYPE");
                int field11 = fields.FindField("ROLL_SECT");
                int field12 = fields.FindField("ADDRESS");
                int field13 = fields.FindField("HAMLET");
                string str1 = record[1].ToString();
                string str2 = record[2].ToString();
                string str3 = record[3].ToString();
                string str4 = record[4].ToString();
                string str5 = record[5].ToString();
                string str6 = record[6].ToString();
                string str7 = record[7].ToString();
                string str8 = record[8].ToString();
                string str9 = record[9].ToString();
                string str10 = record[10].ToString();
                string str11 = record[11].ToString();
                string str12 = record[12].ToString();
                for (IFeature feature = featureCursor.NextFeature(); feature != null; feature = featureCursor.NextFeature())
                {
                    if (this.CompareData(record, fields, feature))
                    {
                        try
                        {
                            feature.set_Value(field3,  str1);
                            feature.set_Value(field2,  str2);
                            feature.set_Value(field4,  str3);
                            feature.set_Value(field5,  str4);
                            feature.set_Value(field6,  str5);
                            feature.set_Value(field7,  str6);
                            feature.set_Value(field8,  str7);
                            feature.set_Value(field9,  str8);
                            feature.set_Value(field10, str9);
                            feature.set_Value(field11, str10);
                            feature.set_Value(field12, str11);
                            feature.set_Value(field13, str12);
                            featureCursor.UpdateFeature(feature);
                        }
                        catch
                        {
                            LogUtilities.log.Warn((Path.GetFileName(Process.GetCurrentProcess().MainModule.FileName) + ": Exception thrown on failed update, parcel ID " + field1));
                        }
                        LogUtilities.log.Info("DSBL " + dsbl_index + " has change information");
                        //Console.WriteLine("DSBL " + dsbl_index + " has change information");

                    }
                }
                if (count % 1000 == 0)
                {
                    LogUtilities.log.Info(string.Concat("Record Number: " + count + " ms=" + stopwatch.ElapsedMilliseconds));
                    Console.WriteLine("Record Number: " + count + " ms=" + stopwatch.ElapsedMilliseconds);
                    stopwatch = Stopwatch.StartNew();
                }

            }
            Console.WriteLine("");
            Console.WriteLine("Job Finished...");
            workspaceEdit.StopEditing(true);
            workspaceEdit.StopEditOperation();
        }

        private bool CompareData(object[] record, IFields fields, IFeature feature)
        {
            try
            {
                if (!(record[0].ToString() != feature.get_Value(fields.FindField("PARCEL_ID")).ToString()) 
                    && !(record[1].ToString() != feature.get_Value(fields.FindField("GV_TAXMAP")).ToString()) 
                    && (!(record[2].ToString() != feature.get_Value(fields.FindField("TAXMAP")).ToString()) 
                    && !(record[3].ToString() != feature.get_Value(fields.FindField("DSBL")).ToString())) 
                    && (!(record[4].ToString() != feature.get_Value(fields.FindField("FLAG")).ToString()) 
                    && !(record[5].ToString() != feature.get_Value(fields.FindField("FIRST_NAME")).ToString()) 
                    && (!(record[6].ToString() != feature.get_Value(fields.FindField("M_INITIAL")).ToString()) 
                    && !(record[7].ToString() != feature.get_Value(fields.FindField("LAST_NAME")).ToString()))) 
                    && (!(record[8].ToString() != feature.get_Value(fields.FindField("COMPANY")).ToString()) 
                    && !(record[9].ToString() != feature.get_Value(fields.FindField("PROP_TYPE")).ToString()) 
                    && (!(record[10].ToString() != feature.get_Value(fields.FindField("ROLL_SECT")).ToString()) 
                    && !(record[11].ToString() != feature.get_Value(fields.FindField("ADDRESS")).ToString()))))
                {
                    if (!(record[12].ToString() != feature.get_Value(fields.FindField("HAMLET")).ToString()))
                        goto label_5;
                }
                return true;
            }
            catch
            {
                return false;
            }
        label_5:
            return false;
        }
    }
}
