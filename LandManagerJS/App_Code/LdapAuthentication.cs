using System;
using System.Text;
using System.Collections;
using System.DirectoryServices;

namespace FormsAuth
{
    public class LdapAuthentication
    {
        private string _path;
        private string _filterAttribute;
        

        public LdapAuthentication(string path)
        {
            _path = path;
        }

        public string IsAuthenticated(string domain, string username, string pwd)
        {
            //string returnString = Authenticate(domain, username, pwd).ToString();
            string domainAndUsername = domain + @"\" + username;
            // DirectorySearcher search = new DirectorySearcher(_path, domainAndUsername);
            DirectoryEntry entry = new DirectoryEntry(_path, domainAndUsername, pwd);
            string returnString = "false";

            try
            {
                //Bind to the native AdsObject to force authentication.
                object obj = entry.NativeObject;
                //returnString = "true";

                DirectorySearcher search = new DirectorySearcher(entry);

                search.Filter = "(SAMAccountName=" + username + ")";
                search.PropertiesToLoad.Add("cn");
                search.PropertiesToLoad.Add("mail");
                search.PropertiesToLoad.Add("memberOf");

                SearchResult result = search.FindOne();

                //Update the new path to the user in the directory.
                //_path = result.Path;
                _filterAttribute = (string)result.Properties["cn"][0];
                string mail = (string)result.Properties["mail"][0];

                int propertyCount = result.Properties["memberOf"].Count;
                String dn;
                int equalsIndex, commaIndex;
                string ou = "";
                //StringBuilder groupNames = new StringBuilder(); //stuff them in | delimited
                for (int propertyCounter = 0; propertyCounter < propertyCount; propertyCounter++)
                {
                    dn = (String)result.Properties["memberOf"][propertyCounter];

                    equalsIndex = dn.IndexOf("=", 1);
                    commaIndex = dn.IndexOf(",", 1);
                    if (-1 == equalsIndex)
                    {
                        return null;
                    }
                    if (dn.Substring((equalsIndex + 1), (commaIndex - equalsIndex) - 1).IndexOf("LM_Editors_") != -1) {
                        string gn = dn.Substring((equalsIndex + 1), (commaIndex - equalsIndex) - 1);

                        if (ou.Length > 0) {
                            ou += "," + gn.Replace("LM_Editors_", "");
                        } else {
                            ou += gn.Replace("LM_Editors_", "");
                        }
                         
                        //groupNames.Append(gn.Replace("LM_Editors_", ""));
                        //groupNames.Append(",");
                    }
                }

                returnString = "{\"items\":\"true\", \"name\":\"" + _filterAttribute + "\", \"email\":\"" + mail + "\", \"groups\":\"" + ou + "\"}";
            }
            catch (Exception ex)
            {
                if (Authenticate(domain, username, pwd))
                {
                    returnString = "{\"items\":\"true\", \"name\":\"No Name\", \"email\":\"No Email\"}";
                }
                else
                {
                    returnString = "{\"items\":\"" + ex.Message.ToString().Replace("\r\n", "") + "\"}";
                }
                
            }
            return returnString;
        }
        private bool Authenticate(string domain, string username, string pwd)
        {
            bool authentic = false;
            try
            {
                DirectoryEntry entry = new DirectoryEntry("LDAP://proliantdc.shtown.local",
                    username, pwd);
                object nativeObject = entry.NativeObject;
                authentic = true;
            }
            catch (DirectoryServicesCOMException) { }
            return authentic;
        }
        public string GetGroups()
        {
            DirectorySearcher search = new DirectorySearcher(_path);
            search.Filter = "(cn=" + _filterAttribute + ")";
            search.PropertiesToLoad.Add("memberOf");
            StringBuilder groupNames = new StringBuilder();

            try
            {
                SearchResult result = search.FindOne();
                int propertyCount = result.Properties["memberOf"].Count;
                string dn;
                int equalsIndex, commaIndex;

                for (int propertyCounter = 0; propertyCounter < propertyCount; propertyCounter++)
                {
                    dn = (string)result.Properties["memberOf"][propertyCounter];
                    equalsIndex = dn.IndexOf("=", 1);
                    commaIndex = dn.IndexOf(",", 1);
                    if (-1 == equalsIndex)
                    {
                        return null;
                    }
                    groupNames.Append(dn.Substring((equalsIndex + 1), (commaIndex - equalsIndex) - 1));
                    groupNames.Append("|");
                }
            }
            catch (Exception ex)
            {
                throw new Exception("Error obtaining group names. " + ex.Message);
            }
            return groupNames.ToString();
        }
    }
}