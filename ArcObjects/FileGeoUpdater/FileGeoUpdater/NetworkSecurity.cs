using System;
using System.Runtime.InteropServices;
using System.Security.Principal;

namespace FileGeoUpdater
{

    public class NetworkSecurity:LogUtilities
    {
        public static WindowsImpersonationContext ImpersonateUser(string strDomain, string strLogin, string strPwd, LogonType logonType, LogonProvider logonProvider)
        {
            WindowsImpersonationContext ctext;
            IntPtr tokenHandle = new IntPtr(0);
            IntPtr dupeTokenHandle = new IntPtr(0);
            try
            {
                tokenHandle = IntPtr.Zero;
                dupeTokenHandle = IntPtr.Zero;
                if (!SecuUtil32.LogonUser(strLogin, strDomain, strPwd, (int) logonType, (int) logonProvider, ref tokenHandle))
                {
                    int ret = Marshal.GetLastWin32Error();
                    throw new ApplicationException(string.Format("LogonUser failed with error code : {0}", ret), null);
                }
                if (!SecuUtil32.DuplicateToken(tokenHandle, 2, ref dupeTokenHandle))
                {
                    SecuUtil32.CloseHandle(tokenHandle);
                    throw new ApplicationException("Failed to duplicate token", null);
                }
                ctext = new WindowsIdentity(dupeTokenHandle).Impersonate();
            }
            catch (Exception ex)
            {
                LogUtilities.log.Fatal(ex.Message, ex);
                throw new ApplicationException(ex.Message, ex);
            }
            return ctext;
        }
    }
}

