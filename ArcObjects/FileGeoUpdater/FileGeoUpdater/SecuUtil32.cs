namespace FileGeoUpdater
{
    using System;
    using System.Runtime.InteropServices;

    internal class SecuUtil32
    {
        [DllImport("kernel32.dll", CharSet=CharSet.Auto)]
        public static extern bool CloseHandle(IntPtr handle);
        [DllImport("advapi32.dll", CharSet=CharSet.Auto, SetLastError=true)]
        public static extern bool DuplicateToken(IntPtr ExistingTokenHandle, int SECURITY_IMPERSONATION_LEVEL, ref IntPtr DuplicateTokenHandle);
        [DllImport("advapi32.dll", SetLastError=true)]
        public static extern bool LogonUser(string lpszUsername, string lpszDomain, string lpszPassword, int dwLogonType, int dwLogonProvider, ref IntPtr TokenHandle);
    }
}

