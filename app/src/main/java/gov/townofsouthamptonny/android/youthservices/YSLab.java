package gov.townofsouthamptonny.android.youthservices;

import android.app.Service;
import android.content.ContentValues;
import android.content.Context;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import gov.townofsouthamptonny.android.youthservices.database.YSBaseHelper;
import gov.townofsouthamptonny.android.youthservices.database.YSDbSchema;
import gov.townofsouthamptonny.android.youthservices.database.YSDbSchema.YSTable;

/**
 * Created by JDaly on 2/24/2016.
 */
public class YSLab {

    private static YSLab sYSLab;
    private Context mContext;
    private SQLiteDatabase mDatabase;

    public static YSLab get(Context context)  {
        if(sYSLab == null) sYSLab = new YSLab(context);
        return sYSLab;
    }

    private YSLab(Context context) {
        mContext  = context.getApplicationContext();
        mDatabase = new YSBaseHelper(mContext).getWritableDatabase();
    }

    public void addServicesItem(ServicesItem si)  {

        ContentValues values = getContentValues(si);
        mDatabase.insert(YSTable.NAME, null, values);
    }

    public List<ServicesItem> getServicesItem(ServicesItem si)  {
        return new ArrayList<>();
    }

    public ServicesItem getServicesItem(UUID id)  {
        return null;
    }

    public void updateServicesItem(ServicesItem si)  {
        String id = si.getID().toString();
        ContentValues values = getContentValues(si);

        mDatabase.update(YSTable.NAME, values, YSTable.Cols.ID + " = ?", new String[] {id});
    }

    private static ContentValues getContentValues(ServicesItem si)  {
        ContentValues  values = new ContentValues();

                values.put(YSTable.Cols.ID, si.getID());
                values.put(YSTable.Cols.LOC_ID, si.getLoc_ID());
                values.put(YSTable.Cols.F_NAME, si.getF_Name());
                values.put(YSTable.Cols.ADDRESS, si.getAddress());
                values.put(YSTable.Cols.CIVIC, si.getCivic());
                values.put(YSTable.Cols.ADDRESSLINE1, si.getAddressLine1());
                values.put(YSTable.Cols.ADDRESSLINE2, si.getAddressLine2());
                values.put(YSTable.Cols.ADDRESSLINE3, si.getAddressLine3());
                values.put(YSTable.Cols.ZIP, si.getZip());
                values.put(YSTable.Cols.FEE, si.getFee());
                values.put(YSTable.Cols.CONTACT, si.getContact());
                values.put(YSTable.Cols.TITLE, si.getTitle());
                values.put(YSTable.Cols.EMAIL, si.getEmail());
                values.put(YSTable.Cols.PHONE1, si.getPhone1());
                values.put(YSTable.Cols.PHONE1EXT, si.getPhone1Ext());
                values.put(YSTable.Cols.PHONE2, si.getPhone2());
                values.put(YSTable.Cols.PHONE2EXT, si.getPhone2xt());
                values.put(YSTable.Cols.FAX, si.getFax());
                values.put(YSTable.Cols.WEBLINK, si.getWebLink());
                values.put(YSTable.Cols.IP_ADDRESS, si.getIP_Address());
                values.put(YSTable.Cols.MAPPED, si.getMapped());
                values.put(YSTable.Cols.SUBMISSIONDATE, si.getSubmissionDate());
                values.put(YSTable.Cols.CATEGORY, si.getCategory());
                values.put(YSTable.Cols.XCOORD, si.getxCoord());
                values.put(YSTable.Cols.YCOORD, si.getyCoord());
                values.put(YSTable.Cols.LAT, si.getLat());
                values.put(YSTable.Cols.LON, si.getLon());
                values.put(YSTable.Cols.DESC, si.getDesc());

        return values;
    }

    private Cursor queryServices(String whereClause, String[] whereArgs) {
        Cursor cursor = mDatabase.query(
                YSTable.NAME,
                null,
                whereClause,
                whereArgs,
                null,
                null,
                null
        );

        return cursor;
    }
}
