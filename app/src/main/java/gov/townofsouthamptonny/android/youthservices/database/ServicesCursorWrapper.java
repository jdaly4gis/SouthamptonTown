package gov.townofsouthamptonny.android.youthservices.database;

import android.database.Cursor;
import android.database.CursorWrapper;

import java.util.UUID;

import gov.townofsouthamptonny.android.youthservices.database.YSDbSchema.*;

import gov.townofsouthamptonny.android.youthservices.ServicesGenerator;
import gov.townofsouthamptonny.android.youthservices.ServicesItem;

/**
 * Created by JDaly on 3/3/2016.
 */
public class ServicesCursorWrapper extends CursorWrapper {
    public ServicesCursorWrapper(Cursor cursor) {
        super(cursor);
    }

    public ServicesItem getServicesItem()  {

        String uuidString = getString(getColumnIndex(YSTable.Cols.UUID));
        String id = getString(getColumnIndex(YSTable.Cols.ID));
        String loc_id = getString(getColumnIndex(YSTable.Cols.LOC_ID));
        String f_name = getString(getColumnIndex(YSTable.Cols.F_NAME));
        String address = getString(getColumnIndex(YSTable.Cols.ADDRESS));
        String civic = getString(getColumnIndex(YSTable.Cols.CIVIC));
        String addressLine1 = getString(getColumnIndex(YSTable.Cols.ADDRESSLINE1));
        String addressLine2 = getString(getColumnIndex(YSTable.Cols.ADDRESSLINE2));
        String addressLine3 = getString(getColumnIndex(YSTable.Cols.ADDRESSLINE3));
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
        String submissionDate = getString(getColumnIndex(YSTable.Cols.SUBMISSIONDATE));
        String category = getString(getColumnIndex(YSTable.Cols.CATEGORY));
        String xcoord = getString(getColumnIndex(YSTable.Cols.XCOORD));
        String ycoord = getString(getColumnIndex(YSTable.Cols.YCOORD));
        String lat = getString(getColumnIndex(YSTable.Cols.LAT));
        String lon = getString(getColumnIndex(YSTable.Cols.LON));
        String desc = getString(getColumnIndex(YSTable.Cols.DESC));

        ServicesItem service = new ServicesItem(UUID.fromString(uuidString));
        service.setID(id);
        service.setLoc_ID(loc_id);
        service.setF_Name(f_name);
        service.setAddress(address);
        service.setCivic(civic);
        service.setAddressLine1(addressLine1);
        service.setAddressLine2(addressLine2);
        service.setAddressLine3(addressLine3);
        service.setZip(zip);
        service.setFee(fee);
        service.setContact(contact);
        service.setTitle(title);
        service.setEmail(email);
        service.setPhone1(phone1);
        service.setPhone1Ext(phone1ext);
        service.setPhone2xt(phone2ext);
        service.setFax(fax);
        service.setWebLink(weblink);
        service.setIP_Address(ip_address);
        service.setMapped(mapped);
        service.setSubmissionDate(submissionDate);
        service.setCategory(category);
        service.setxCoord(xcoord);
        service.setyCoord(ycoord);
        service.setLat(lat);
        service.setLon(lon);
        service.setDesc(desc);


        return null;
    }

}
