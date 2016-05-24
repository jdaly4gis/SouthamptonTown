using System;
using System.Web;
using System.Web.Services;
using System.Data;
using System.Collections;
using System.Collections.Generic;
using System.Text;
using System.Runtime.InteropServices;

using ESRI.ArcGIS.esriSystem;
using ESRI.ArcGIS.Server;
using ESRI.ArcGIS.Geodatabase;


namespace SDELoginHelper
{
    [Guid("dbb1b001-c731-45a5-b3c8-a6ab07359ed1")]
    [ClassInterface(ClassInterfaceType.None)]
    [ProgId("AddSDEData.SDELogin")]
    public class SDELogin
    {
//        IWorkspace ws = null;
        object login = null;
        
        public object openSDEWorkspace(string server, string instance, string user, string pass, string db, string version, string auth_mode)
        {
            IPropertySet propset = (IPropertySet)ActivateSingletonClass("esriSystem.propertyset");
            propset.SetProperty("SERVER", server);
            propset.SetProperty("INSTANCE", instance);
            propset.SetProperty("USER", user);
            propset.SetProperty("PASSWORD", pass);
            propset.SetProperty("DATABASE", db);
            propset.SetProperty("VERSION", version);
            propset.SetProperty("AUTHENTICATION_MODE", auth_mode);

            IWorkspaceFactory workspaceFactory = (IWorkspaceFactory)ActivateSingletonClass("esriDataSourcesGDB.sdeworkspacefactory");
            try
            {
                login = workspaceFactory.Open(propset, 0);
            }
            catch (Exception ex)
            {
                login = ex;
            }

            return (login);
        }

        private System.Object ActivateSingletonClass(string name)
        {
            Type theType = System.Type.GetTypeFromProgID(name);
            return (System.Activator.CreateInstance(theType));
        }          
    }

}
