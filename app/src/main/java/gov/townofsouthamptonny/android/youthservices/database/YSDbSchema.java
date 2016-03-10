package gov.townofsouthamptonny.android.youthservices.database;

import android.content.Context;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;

import java.util.UUID;

/**
 * Created by JDaly on 2/24/2016.
 */
public class YSDbSchema {
    public static final class YSTable {
        public static final String NAME = "youthservices";


        public static final class Cols {
            public static final String UUID = "uuid";
            public static final String ID = "ID";
            public static final String LOC_ID = "loc_ID";
            public static final String F_NAME = "F_Name";
            public static final String ADDRESS = "Address";
            public static final String CIVIC = "Civic";
            public static final String ADDRESSLINE1 = "AddressLine1";
            public static final String ADDRESSLINE2 = "AddressLine2";
            public static final String ADDRESSLINE3 = "AddressLine3";
            public static final String ZIP = "Zip";
            public static final String FEE = "Fee";
            public static final String CONTACT = "Contact";
            public static final String TITLE = "Title";
            public static final String EMAIL = "Email";
            public static final String PHONE1 = "Phone1";
            public static final String PHONE1EXT = "Phone1Ext";
            public static final String PHONE2 = "Phone2";
            public static final String PHONE2EXT = "Phone2xt";
            public static final String FAX = "Fax";
            public static final String WEBLINK = "WebLink";
            public static final String IP_ADDRESS = "IP_Address";
            public static final String MAPPED = "Mapped";
            public static final String SUBMISSIONDATE = "SubmissionDate";
            public static final String CATEGORY = "category";
            public static final String XCOORD = "xCoord";
            public static final String YCOORD = "yCoord";
            public static final String LAT = "Lat";
            public static final String LON = "Lon";
            public static final String DESC = "Desc";
        }
    }
}

