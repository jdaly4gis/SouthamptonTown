package gov.townofsouthamptonny.android.youthservices.database;
import gov.townofsouthamptonny.android.youthservices.database.YSDbSchema.YSTable;


import android.database.Cursor;
import android.database.CursorWrapper;

import gov.townofsouthamptonny.android.youthservices.ServicesItem;
import gov.townofsouthamptonny.android.youthservices.YSFetchr;

/**
 * Created by JDaly on 2/24/2016.
 */
public class YSCursorWrapper extends CursorWrapper {
    public YSCursorWrapper(Cursor cursor)  {
        super(cursor);
    }

    public ServicesItem getServicesItem()  {

        String id = getString(getColumnIndex(YSTable.Cols.ID));
        String loc_id = getString(getColumnIndex(YSTable.Cols.LOC_ID));
        String f_name = getString(getColumnIndex(YSTable.Cols.F_NAME));
        String address = getString(getColumnIndex(YSTable.Cols.ADDRESS));
        String civic = getString(getColumnIndex(YSTable.Cols.CIVIC));
        String addressline1 = getString(getColumnIndex(YSTable.Cols.ADDRESSLINE1));
        String addressline2 = getString(getColumnIndex(YSTable.Cols.ADDRESSLINE2));
        String addressline3 = getString(getColumnIndex(YSTable.Cols.ADDRESSLINE3));
        String zip = getString(getColumnIndex(YSTable.Cols.ZIP));
        String fee = getString(getColumnIndex(YSTable.Cols.FEE));
        String contact = getString(getColumnIndex(YSTable.Cols.CONTACT));
        String title = getString(getColumnIndex(YSTable.Cols.TITLE));
        String email = getString(getColumnIndex(YSTable.Cols.EMAIL));
        String phone1 = getString(getColumnIndex(YSTable.Cols.PHONE1));
        String phone1ext = getString(getColumnIndex(YSTable.Cols.PHONE1EXT));
        String phone2 = getString(getColumnIndex(YSTable.Cols.PHONE2));
        String phone2ext = getString(getColumnIndex(YSTable.Cols.PHONE2EXT));
        String fax = getString(getColumnIndex(YSTable.Cols.FAX));
        String weblink = getString(getColumnIndex(YSTable.Cols.WEBLINK));
        String ip_address = getString(getColumnIndex(YSTable.Cols.IP_ADDRESS));
        String mapped = getString(getColumnIndex(YSTable.Cols.MAPPED));
        String submissiondate = getString(getColumnIndex(YSTable.Cols.SUBMISSIONDATE));
        String category = getString(getColumnIndex(YSTable.Cols.CATEGORY));
        String xcoord = getString(getColumnIndex(YSTable.Cols.XCOORD));
        String ycoord = getString(getColumnIndex(YSTable.Cols.YCOORD));
        String lat = getString(getColumnIndex(YSTable.Cols.LAT));
        String lon = getString(getColumnIndex(YSTable.Cols.LON));
        String desc = getString(getColumnIndex(YSTable.Cols.DESC));

        return null;
    }

}
