package gov.townofsouthamptonny.android.youthservices.database;

import android.content.Context;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;

import gov.townofsouthamptonny.android.youthservices.database.YSDbSchema.YSTable;

/**
 * Created by JDaly on 2/24/2016.
 */

public class YSBaseHelper extends SQLiteOpenHelper {

    private static final int VERSION = 1;
    private static String DATABASE_NAME = "youthServicesBase.db";

    public YSBaseHelper(Context context)  {
        super(context, DATABASE_NAME, null, VERSION);
    }

    @Override
    public void onCreate(SQLiteDatabase db)  {

        db.execSQL("create table " + YSTable.NAME + "(" +
                        " _id integer primary key autoincrement, " +
                        YSTable.Cols.UUID + ", " +
                        YSTable.Cols.ID + ", " +
                        YSTable.Cols.LOC_ID + ", " +
                        YSTable.Cols.F_NAME + ", " +
                        YSTable.Cols.ADDRESS + ", " +
                        YSTable.Cols.CIVIC + ", " +
                        YSTable.Cols.ADDRESSLINE1 + ", " +
                        YSTable.Cols.ADDRESSLINE2 + ", " +
                        YSTable.Cols.ADDRESSLINE3 + ", " +
                        YSTable.Cols.ZIP + ", " +
                        YSTable.Cols.FEE + ", " +
                        YSTable.Cols.CONTACT + ", " +
                        YSTable.Cols.TITLE + ", " +
                        YSTable.Cols.EMAIL + ", " +
                        YSTable.Cols.PHONE1 + ", " +
                        YSTable.Cols.PHONE1EXT + ", " +
                        YSTable.Cols.PHONE2 + ", " +
                        YSTable.Cols.PHONE2EXT + ", " +
                        YSTable.Cols.FAX + ", " +
                        YSTable.Cols.WEBLINK + ", " +
                        YSTable.Cols.IP_ADDRESS + ", " +
                        YSTable.Cols.MAPPED + ", " +
                        YSTable.Cols.SUBMISSIONDATE + ", " +
                        YSTable.Cols.CATEGORY + ", " +
                        YSTable.Cols.XCOORD + ", " +
                        YSTable.Cols.YCOORD + ", " +
                        YSTable.Cols.LAT + ", " +
                        YSTable.Cols.LON + ", " +
                        YSTable.Cols.DESC +
                        ")");

    }


    @Override
    public void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion)  {

    }

}