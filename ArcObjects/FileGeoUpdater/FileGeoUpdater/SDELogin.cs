using ESRI.ArcGIS.esriSystem;
using ESRI.ArcGIS.Geodatabase;
using System;
using System.Runtime.InteropServices;

namespace SDELoginHelper
{

    [ProgId("AddSDEData.SDELogin"), Guid("dbb1b001-c731-45a5-b3c8-a6ab07359ed1"), ClassInterface(ClassInterfaceType.None)]
    public static class SDELogin
    {
        public static object login = null;
        public static IWorkspaceFactory2 workspaceFactory = null;

        private static object ActivateSingletonClass(string name)
        {
            return Activator.CreateInstance(Type.GetTypeFromProgID(name));
        }

        public static object openSDEWorkspace(string server, string instance, string user, string pass, string db, string version, string auth_mode)
        {
            IPropertySet propset = (IPropertySet) ActivateSingletonClass("esriSystem.propertyset");

            propset.SetProperty("SERVER", server);
            propset.SetProperty("INSTANCE", instance);
            propset.SetProperty("USER", user);
            propset.SetProperty("PASSWORD", pass);
            propset.SetProperty("DATABASE", db);
            propset.SetProperty("VERSION", version);
            propset.SetProperty("AUTHENTICATION_MODE", auth_mode);

            workspaceFactory = (IWorkspaceFactory2) ActivateSingletonClass("esriDataSourcesGDB.SDEWorkspaceFactory.1");

            try
            {
                login = workspaceFactory.Open(propset, 0);
            }
            catch (Exception ex)
            {
                Console.WriteLine("Failure to open workspace: " + ex.Message);
                login = ex;
            }
            return login;
        }
    }
}

