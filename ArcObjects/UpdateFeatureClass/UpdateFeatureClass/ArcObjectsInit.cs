using ESRI.ArcGIS.esriSystem;
using System;
using System.Runtime.InteropServices;

namespace UpdateFeatureClass
{

    public class ArcObjectsInit : LogUtilities
    {
        private IAoInitialize iInit;
        private object tryInit;

        private object ActivateSingletonClass(string name)
        {
            return Activator.CreateInstance(Type.GetTypeFromProgID(name));
        }

        public object InitializeArcObjects()
        {
            ESRI.ArcGIS.RuntimeManager.Bind(ESRI.ArcGIS.ProductCode.Desktop);

            int errCount = 0;
            this.iInit = new AoInitializeClass();
            esriLicenseStatus licenseStatus = esriLicenseStatus.esriLicenseUnavailable;
            licenseStatus = this.iInit.Initialize(esriLicenseProductCode.esriLicenseProductCodeAdvanced);
            string message = null;
            string errMessages = null;
            foreach (int code in Enum.GetValues(typeof(esriLicenseProductCode)))
            {
                string name = Enum.GetName(typeof(esriLicenseProductCode), code);
                int status = Convert.ToInt32(this.iInit.IsProductCodeAvailable((esriLicenseProductCode) code));

                switch (status)
                {
                    case 30:
                        message = "License Unavailable";
                        goto Label_0185;

                    case 40:
                        message = "License Failure";
                        goto Label_0185;

                    case 10:
                        message = "Checking Out Available License: (" + name + ")";
                        try
                        {
                            this.iInit.Initialize((esriLicenseProductCode) code);
                            LogUtilities.log.Info("Successful Checkout: " + message);
                            Console.WriteLine("Successful Checkout: " + message);
                            this.tryInit = null;
                            goto Label_0248;
                        }
                        catch (Exception e)
                        {
                            return e;
                        }
                    case 20:
                        break;

                    case 50:
                        message = "License Already Initialized";
                        goto Label_0185;

                    case 60:
                        message = "License Not Initialized";
                        goto Label_0185;

                    case 70:
                        message = "License Checked Out";
                        goto Label_0185;

                    case 80:
                        message = "License Checked In";
                        goto Label_0185;

                    default:
                        goto Label_0185;
                }
                message = "License Not licensed";
            Label_0185:
                if (status != 10)
                {
                    string[] ctemp = new string[] { (++errCount).ToString(), ":(", message, ") for ", name, "  " };
                    errMessages = string.Concat(ctemp);
                    this.tryInit = new Exception("Licensing checkout failed due to errors above");
                    LogUtilities.log.Warn("Checkout Failure: " + errMessages);
                    Console.WriteLine("Checkout Failure: " + errMessages);
                }
            }
        Label_0248:
            return this.tryInit;
        }

        public void ShutDownArcObjects()
        {
            this.iInit.Shutdown();
        }
    }
}

