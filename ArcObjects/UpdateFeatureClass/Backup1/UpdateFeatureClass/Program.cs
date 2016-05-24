using System;
using System.IO;
using System.Collections;
using System.Collections.Generic;
using System.Text;
           
using ESRI.ArcGIS.Geodatabase;
using ESRI.ArcGIS.DataSourcesFile;
using ESRI.ArcGIS.esriSystem;
using ESRI.ArcGIS.Display;

using SDELoginHelper;

namespace UpdateFeatureClass
{
    class Program
    {

        static void Main(string[] args)
        {
            object login;
            ArrayList selection = new ArrayList();
            SDELogin loginObj = new SDELogin();
            ArcObjectsInit arcInit = new ArcObjectsInit();

            IWorkspace wSpace;

//            if (arcInit.InitializeArcObjects().GetType() != typeof(Exception))
            if (arcInit.InitializeArcObjects() == null)
            {
                login = loginObj.openSDEWorkspace("ProliantGIS", "sde:sqlserver:proliantgis", "SDEeditors", "SDEeditors", "VECTOR", "sde.DEFAULT", "OSA");

                if (login is Exception)
                {
                    Console.WriteLine("Failed Login: {0}", login.ToString());
                }
                else
                {
                    wSpace = login as IWorkspace;
                    RetrieveQuery query = new RetrieveQuery("SELECT * FROM EXPORT");
                    selection = query.GetSelection();
                    FeatureOperations featureOps = new FeatureOperations(selection, wSpace);
                }
                arcInit.ShutDownArcObjects();
            }
            else
            {
                Console.WriteLine("Unable to Initialize ArcObjects");
            }
        }
    }

    class FeatureOperations
    {

        ArrayList list = null;
        IWorkspace wSpace = null;

        public FeatureOperations()
        {
        }

        public FeatureOperations(ArrayList list)
        {
            list = this.list;
        }

        public FeatureOperations(ArrayList list, IWorkspace wSpace)
        {
            this.list = list;
            this.wSpace = wSpace;
            GetDataSet();
        }

        private void GetDataSet()
        {

            IEnumDataset dsenum = this.wSpace.get_Datasets(esriDatasetType.esriDTFeatureDataset);
            IDataset ds = dsenum.Next();

            while (ds != null)
            {
                if (ds.Name == "VECTOR.SDEADMIN.CADASTRAL")
                {
                    IEnumDataset dsSub = ds.Subsets;
                    IDataset sdeclass = dsSub.Next();
                    while (sdeclass != null)
                    {
                        if (sdeclass.Name == "VECTOR.SDEADMIN.Tax_Parcels")
                        {
                            CopyFeatureClass(sdeclass,wSpace);
                            UpdateFeatures(sdeclass,list);
                        }

                        sdeclass = dsSub.Next();
                    }
                }
                ds = dsenum.Next();
            }
        }

        private void CopyFeatureClass(IDataset ds,IWorkspace sourceWorkspace)
        {

            String targetWorkspacePath = @"C:\Temp\SDE_Backup";
            IWorkspaceFactory targetWorkspaceFactory = new ShapefileWorkspaceFactoryClass();
            IWorkspace targetWorkspace = targetWorkspaceFactory.OpenFromFile(targetWorkspacePath, 0);

            IDataset targetWorkspaceDataset = (IDataset)targetWorkspace;
            IDataset sourceWorkspaceDataset = (IDataset)sourceWorkspace;
            IName sourceWorkspaceDatasetName = sourceWorkspaceDataset.FullName;
            IName targetWorkspaceDatasetName = targetWorkspaceDataset.FullName;

            IWorkspaceName targetWorkspaceName = (IWorkspaceName)targetWorkspaceDatasetName;
            IWorkspaceName sourceWorkspaceName = (IWorkspaceName)sourceWorkspaceDatasetName;


            IFeatureClassName sourceFeatureClassName = new FeatureClassNameClass();
            IDatasetName sourceDatasetName = (IDatasetName)sourceFeatureClassName;
            sourceDatasetName.Name = "VECTOR.SDEADMIN.Tax_Parcels";
            sourceDatasetName.WorkspaceName = sourceWorkspaceName;

            IFeatureClassName targetFeatureClassName = new FeatureClassNameClass();
            IDatasetName targetDatasetName = (IDatasetName)targetFeatureClassName;

            targetDatasetName.Name = "VECTOR.SDEADMIN.Tax_Parcels_" + FileDateTime;
            targetDatasetName.WorkspaceName = targetWorkspaceName;

            // Open source feature class to get field definitions.
            IName sourceName = (IName)sourceFeatureClassName;
            IFeatureClass sourceFeatureClass = (IFeatureClass)sourceName.Open();

            // Create the objects and references necessary for field validation.
            IFieldChecker fieldChecker = new FieldCheckerClass();
            IFields sourceFields = sourceFeatureClass.Fields;
            IFields targetFields = null;
            IEnumFieldError enumFieldError = null;

            // Set the required properties for the IFieldChecker interface.
            fieldChecker.InputWorkspace = sourceWorkspace;
            fieldChecker.ValidateWorkspace = targetWorkspace;

            // Validate the fields and check for errors.
            fieldChecker.Validate(sourceFields, out enumFieldError, out targetFields);
            if (enumFieldError != null)
            {
                // Handle the errors in a way appropriate to your application.
                IFieldError err = null;
                Console.WriteLine("Errors were encountered during field validation.");
                while ((err = enumFieldError.Next()) != null)
                {
                    Console.WriteLine("Error: " + err.FieldError.ToString() + " Field no: " + err.FieldIndex.ToString());
                }
            }

            // Find the shape field.
            String shapeFieldName = sourceFeatureClass.ShapeFieldName;
            int shapeFieldIndex = sourceFeatureClass.FindField(shapeFieldName);
            IField shapeField = sourceFields.get_Field(shapeFieldIndex);

            // Get the geometry definition from the shape field and clone it.
            IGeometryDef geometryDef = shapeField.GeometryDef;
            IClone geometryDefClone = (IClone)geometryDef;
            IClone targetGeometryDefClone = geometryDefClone.Clone();
            IGeometryDef targetGeometryDef = (IGeometryDef)targetGeometryDefClone;
     
            IQueryFilter queryFilter = new QueryFilterClass();
            queryFilter.WhereClause = "";


            // Create the converter and run the conversion.
            IFeatureDataConverter featureDataConverter = new FeatureDataConverterClass();
            IEnumInvalidObject enumInvalidObject =
              featureDataConverter.ConvertFeatureClass(sourceFeatureClassName,
              queryFilter, null, targetFeatureClassName, targetGeometryDef, targetFields,
              "", 1000, 0);

            // Check for errors.
            IInvalidObjectInfo invalidObjectInfo = null;
            enumInvalidObject.Reset();
            while ((invalidObjectInfo = enumInvalidObject.Next()) != null)
            {
                // Handle the errors in a way appropriate to the application.
                Console.WriteLine("Errors occurred for the following feature: {0}",
                  invalidObjectInfo.InvalidObjectID);
            }

            
        }

        private void UpdateFeatures(IDataset dataset, ArrayList list)
        {
            IQueryFilter queryFilter = new QueryFilterClass();
            IFeatureClass featureClass = (IFeatureClass)dataset;
            IFeatureCursor featureCursor = null;
            IFeature feature = null;

            IWorkspaceEdit pWSE = (IWorkspaceEdit)wSpace;

            pWSE.StartEditing(true);
            pWSE.StartEditOperation();

            int i = 0;


            foreach (object[] record in list)
            {
                i++;
                int id = Convert.ToInt32((record[0]));

                string gvtaxmap = record[1].ToString();
                string tmapumft = record[2].ToString();
                string dsbl     = record[3].ToString();
                string first    = record[5].ToString();
                string initial  = record[6].ToString();
                string last     = record[7].ToString();
                string company  = record[8].ToString();
                string clss     = record[9].ToString();
                string rollsect = record[10].ToString();
                string address  = record[11].ToString();
                string hamlet   = record[12].ToString();

                queryFilter.WhereClause = "PARCEL_ID = "  + id;

                featureCursor = featureClass.Update(queryFilter, false);
                IFields fields = featureCursor.Fields;

                //Get field index of Feature
                int p_id        = fields.FindField("PARCEL_ID");
                int tmapumft_id = fields.FindField("TAXMAP");
                int gvtaxmap_id = fields.FindField("GV_TAXMAP");
                int dsbl_id     = fields.FindField("DSBL");
                int first_id    = fields.FindField("FIRST_NAME");
                int midinit_id  = fields.FindField("M_INITIAL");
                int last_id     = fields.FindField("LAST_NAME");
                //int company_id  = fields.FindField("COMPANY");
                int class_id    = fields.FindField("PROP_TYPE");
                int rollsect_id = fields.FindField("ROLL_SECT");
                int address_id  = fields.FindField("ADDRESS");
                int hamlet_id   = fields.FindField("HAMLET");

                feature = featureCursor.NextFeature();

                while (feature != null)
                {
                    //Set values of fields
                    feature.set_Value(gvtaxmap_id, gvtaxmap);
                    feature.set_Value(tmapumft_id, tmapumft);
                    feature.set_Value(dsbl_id, dsbl);
                    feature.set_Value(first_id, first);
                    feature.set_Value(midinit_id, initial);
                    feature.set_Value(last_id, last);
                    //feature.set_Value(company_id, company);
                    feature.set_Value(class_id, clss);
                    feature.set_Value(rollsect_id, rollsect);
                    feature.set_Value(address_id, address);
                    feature.set_Value(hamlet_id, hamlet);

                    //Commit changes
                    feature.Store();

                    feature = featureCursor.NextFeature();
                }
        
                if (i % 1000 == 0)
                {
                    Console.WriteLine("QueryFilter {0}", queryFilter.WhereClause);
                    Console.WriteLine("Record {0}", i);
                }

                System.Runtime.InteropServices.Marshal.ReleaseComObject(featureCursor);
            }

            Console.WriteLine("");
            Console.WriteLine("Job Finished...");

            pWSE.StopEditing(true);
            pWSE.StopEditOperation();

        }

        public void IFeatureClass__Search(IFeatureClass featureClass)
        {

        }
        #region FileDateTime

        public static string FileDateTime
        {
            get
            {
                DateTime d;
                String s = String.Empty;
                try
                {
                    d = System.DateTime.Now;
                    s = d.ToString("MM") +
                        d.ToString("dd") +
                        d.ToString("yyyy") +
                        d.ToString("hh") +
                        d.ToString("mm") +
                        d.ToString("ss") +
                        d.ToString("tt");
                    return s;
                }
                catch
                {
                    throw;
                }
            }
        }
        #endregion
    }
    
    
}
