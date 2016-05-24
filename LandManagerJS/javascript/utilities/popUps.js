function showPermit(filename,width,height)
{
   var winl = (screen.width - width) / 2;
   var wint = (screen.height - height) / 2;
   var winprops = 'height='+height+',width='+width+',top='+wint+',left='+winl+',resizable=yes,status=no,location=no,scrollbars=no';
   window.open(filename, 'Permits');

   //newwindow.focus();
}

function showPRC(filename,width,height)
{
   var winl = (screen.width - width) / 2;
   var wint = (screen.height - height) / 2;
   var winprops = 'height=' + height + ',width=' + width + ',top=' + wint + ',left=' + winl + ',resizable=no,status=no,location=no,scrollbars=yes';
   window.open(filename);
//   newwindow=window.open(filename,'PropertyRecordCard',winprops);
//   newwindow.focus();
}

function showReferral(filename,width,height)
{
    var winl = (screen.width - width) / 2;
    var wint = (screen.height - height) / 2;
    var winprops = 'height=' + height + ',width=' + width + ',top=' + wint + ',left=' + winl + ',resizable=yes,status=yes,location=yes,scrollbars=yes';
    //var winprops = 'resizable=yes,status=yes,location=yes,scrollbars=yes';
    newwindow = window.open(filename, 'Referrals', winprops);
    newwindow.focus();
}
