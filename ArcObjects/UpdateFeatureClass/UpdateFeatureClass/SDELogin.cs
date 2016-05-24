// Decompiled with JetBrains decompiler
// Type: SDELoginHelper.SDELogin
// Assembly: UpdateFeatureClass, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null
// MVID: D1915941-0CFA-4E01-B14C-416E7507180F
// Assembly location: C:\UpdateFeatureClass\UpdateFeatureClass.exe

using ESRI.ArcGIS.esriSystem;
using ESRI.ArcGIS.Geodatabase;
using System;
using System.Runtime.InteropServices;

namespace SDELoginHelper
{
  [Guid("dbb1b001-c731-45a5-b3c8-a6ab07359ed1")]
  [ProgId("AddSDEData.SDELogin")]
  [ClassInterface(ClassInterfaceType.None)]
  public class SDELogin
  {
    private object login;

    public object openSDEWorkspace(string server, string instance, string user, string pass, string db, string version, string auth_mode)
    {
      IPropertySet ConnectionProperties = (IPropertySet) this.ActivateSingletonClass("esriSystem.propertyset");
      ConnectionProperties.SetProperty("SERVER", server);
      ConnectionProperties.SetProperty("INSTANCE", instance);
      ConnectionProperties.SetProperty("USER", user);
      ConnectionProperties.SetProperty("PASSWORD", pass);
      ConnectionProperties.SetProperty("DATABASE",  db);
      ConnectionProperties.SetProperty("VERSION", version);
      ConnectionProperties.SetProperty("AUTHENTICATION_MODE", auth_mode);
      IWorkspaceFactory workspaceFactory = (IWorkspaceFactory) this.ActivateSingletonClass("esriDataSourcesGDB.sdeworkspacefactory");

      try
      {
        this.login = (object)workspaceFactory.Open(ConnectionProperties, 0);
      }
      catch (Exception ex)
      {
        this.login = (object) ex;
      }
      return this.login;
    }

    private object ActivateSingletonClass(string name)
    {
      return Activator.CreateInstance(Type.GetTypeFromProgID(name));
    }
  }
}
