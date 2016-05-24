using System;
using System.Collections.Generic;
using System.Text;
using System.Runtime.InteropServices;

using ESRI.ArcGIS.esriSystem;

namespace UpdateFeatureClass
{
    [Guid("c12e57ff-e463-4293-817c-f31febe4f4c3")]
    [ClassInterface(ClassInterfaceType.None)]
    [ProgId("UpdateFeatureClass.ArcObjectsInit")]
    public class ArcObjectsInit
    {

        private IAoInitialize iInit;
        private object tryInit;

        public object InitializeArcObjects()
        {
            iInit = new AoInitializeClass();

            if (iInit.IsProductCodeAvailable(esriLicenseProductCode.esriLicenseProductCodeEngine) == esriLicenseStatus.esriLicenseAvailable)
            {
                iInit.Initialize(esriLicenseProductCode.esriLicenseProductCodeEngine);
            }
            else if (iInit.IsProductCodeAvailable(esriLicenseProductCode.esriLicenseProductCodeArcInfo) == esriLicenseStatus.esriLicenseAvailable)
            {
                iInit.Initialize(esriLicenseProductCode.esriLicenseProductCodeArcInfo);
                //esriLicenseStatus licensestatus = iInit.CheckOutExtension(esriLicenseExtensionCode.esriLicenseExtensionCodeSpatialAnalyst);
            }
            else if (iInit.IsProductCodeAvailable(esriLicenseProductCode.esriLicenseProductCodeArcEditor) == esriLicenseStatus.esriLicenseAvailable)
            {
                iInit.Initialize(esriLicenseProductCode.esriLicenseProductCodeArcEditor);
            }
            else if (iInit.IsProductCodeAvailable(esriLicenseProductCode.esriLicenseProductCodeArcView) == esriLicenseStatus.esriLicenseAvailable)
            {
                iInit.Initialize(esriLicenseProductCode.esriLicenseProductCodeArcView);
            }
            else
            {
                tryInit = new Exception("Unable to initialize ArcObjects.");
            }

            return (tryInit);
        }

        public void ShutDownArcObjects()
        {
            iInit.Shutdown();
        }


        private System.Object ActivateSingletonClass(string name)
        {
            Type theType = System.Type.GetTypeFromProgID(name);
            return (System.Activator.CreateInstance(theType));
        }          
    }
}
