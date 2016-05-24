using log4net;
using log4net.Config;
using System;
using ESRI.ArcGIS.esriSystem;

namespace UpdateFeatureClass
{
    public class LogUtilities
    {
        protected static readonly log4net.ILog log = LogManager.GetLogger(typeof(ArcObjectsInit));

        static LogUtilities()
        {
            XmlConfigurator.Configure();
        }
    }
}

