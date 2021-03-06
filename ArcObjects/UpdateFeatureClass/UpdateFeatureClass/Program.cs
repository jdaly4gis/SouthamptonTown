// Decompiled with JetBrains decompiler
// Type: UpdateFeatureClass.Program
// Assembly: UpdateFeatureClass, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null
// MVID: D1915941-0CFA-4E01-B14C-416E7507180F
// Assembly location: C:\UpdateFeatureClass\UpdateFeatureClass.exe

using ESRI.ArcGIS.esriSystem;
using ESRI.ArcGIS.Geodatabase;
using SDELoginHelper;
using System;
using System.Collections;
using System.Configuration;
using System.Diagnostics;
using System.IO;
using System.Threading;

namespace UpdateFeatureClass
{
   internal class Program : LogUtilities
   {
      private static LicenseInitializer m_AOLicenseInitializer = new LicenseInitializer();

      private static void Main(string[] args)
    {
      Program.m_AOLicenseInitializer.InitializeApplication(new esriLicenseProductCode[1]
      {
        esriLicenseProductCode.esriLicenseProductCodeAdvanced
      }, new esriLicenseExtensionCode[0]);
      ArrayList arrayList = new ArrayList();
      SDELogin sdeLogin = new SDELogin();
      ArcObjectsInit arcObjectsInit = new ArcObjectsInit();
      int num1 = 0;
      int num2 = 3;
      LogUtilities.log.Info((object) (Path.GetFileName(Process.GetCurrentProcess().MainModule.FileName) + ": ************ START ************"));
      object obj1;
      do
      {
        obj1 = arcObjectsInit.InitializeArcObjects();
        if (obj1 == null)
        {
          object obj2 = sdeLogin.openSDEWorkspace(ConfigurationManager.AppSettings["SDE_NAME"], "sde:sqlserver:" + ConfigurationManager.AppSettings["SDE_NAME"], 
             ConfigurationManager.AppSettings["SDE_PASS"],ConfigurationManager.AppSettings["SDE_PASS"],ConfigurationManager.AppSettings["SDE_DB"], "sde.DEFAULT", "DBMS");
          if (obj2 is Exception)
          {
            LogUtilities.log.Fatal((object) (Path.GetFileName(Process.GetCurrentProcess().MainModule.FileName) + ": " + obj2.ToString()));
            break;
          }
          else
          {
            IWorkspace wSpace = obj2 as IWorkspace;
            ArrayList selection = new RetrieveQuery("SELECT * FROM EXPORT").GetSelection();
            if (selection.Count == 0)
            {
              LogUtilities.log.Warn((object) string.Concat(new object[4]
              {
                (object) Path.GetFileName(Process.GetCurrentProcess().MainModule.FileName),
                (object) ": Possible error processing ",
                (object) selection.Count,
                (object) " records."
              }));
            }
            else
            {
              LogUtilities.log.Info((object) string.Concat(new object[4]
              {
                (object) Path.GetFileName(Process.GetCurrentProcess().MainModule.FileName),
                (object) ": Successfuly queried the Export table with a total of ",
                (object) selection.Count,
                (object) " records."
              }));
              FeatureOperations featureOperations = new FeatureOperations(selection, wSpace);
            }
            arcObjectsInit.ShutDownArcObjects();
          }
        }
        else if (num1 < num2)
        {
//          LogUtilities.log.Warn(Path.GetFileName(Process.GetCurrentProcess().MainModule.FileName) + (object) " " + obj1.ToString() + " on attempt " + (string) (ValueType) ++num1 + ". Retrying...");
          LogUtilities.log.Warn(Path.GetFileName(Process.GetCurrentProcess().MainModule.FileName) + " " + obj1.ToString() + " on attempt " +  ++num1 + ". Retrying...");
          Thread.Sleep(5000);
        }
        else
        {
          LogUtilities.log.Fatal((object) (Path.GetFileName(Process.GetCurrentProcess().MainModule.FileName) + ": License checkout tries has exceeded value set in MAX_TRIES. Run failed"));
          break;
        }
      }
      while (obj1 != null);
      LogUtilities.log.Info((object) (Path.GetFileName(Process.GetCurrentProcess().MainModule.FileName) + ": ************ FINIS ************" + Environment.NewLine));
      Program.m_AOLicenseInitializer.ShutdownApplication();
    }
   }
}
