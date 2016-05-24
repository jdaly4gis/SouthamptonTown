#!/usr/bin/perl -w
package DB;

use XMLRPC::Lite;
use URI::Escape;
use Data::Dumper;
use DBI;
use DBD::ODBC;
use strict;
use Error;
use FileHandle;
use MIME::Lite;
use warnings;
use Log::Log4perl;

my $from = 'errors@southamptontownny.gov';
my $to   = 'jdaly@southamptontownny.gov';
my $cc   = 'mbaldwin@southamptontownny.gov';
#my $cc   = 'jcapone@southamptontownny.gov';
my $subject = 'Update DB Task Failure';
my $log;

my $GOVDSN  = "Govern_64";
my $govuser = "webdb";
my $govpass = "wgov021";

my $GOVSAGDSN  = "GovSag_64";
my $govsaguser = "webdb";
my $govsagpass = "wgov021";

my $PSDSN  = "ProfessionalServices";
my $psuser = "";
my $pspass = "";

my @tables = ('PC_PARCEL');
my $program = "C://Perl64/bin/perl.exe C://Perl64/eg/govtask.pl";
my $logfile = "C://LogFiles/UpdateErrors.log";


#######################################################################################
#  Function: connectToSQLServer()
#
#  Description: Connect to SQL Server.  Note: If Windows Based Authentication is
#  activated, the user and password fields are irrelevant.
#

sub connectToSQLServer
  {
    my ($DSN,$user,$pass) = @_;
    my ($err);
    my %attr= (
               LongTruncOk => 1,
               PrintError => 1
#               RaiseError => 1
              );

    my $dbh = DBI->connect("dbi:ODBC:$DSN",$user,$pass, \%attr);

    if(!defined($dbh))
      {
        $err = new Error(qq(SQL Connect: $DBI::errstr\n));
      }

    return($err,$dbh);
  }


#######################################################################################
#  Function: update_PC_PARCEL
#
#  Description: update the PC_PARCEL table
#

sub update_PC_PARCEL
  {

    my ($err,$dbh) = connectToSQLServer($GOVDSN,$govuser,$govpass);
    if (defined($err) && $err->hasError())
      {
        $err->push (qq(Failed to Connect to SQL Server\n));
      }
    else
      {
        my $rows = $dbh->selectall_arrayref('SELECT * FROM PC_PARCEL');
        if(!defined($rows))
          {
            $err = new Error(qq(Rows not defined: no rows returned from SELECT query\n));
          }
        else
          {
            undef($dbh);
            my ($err,$dbh) = connectToSQLServer($PSDSN,$psuser,$pspass);
            if (defined($err) && $err->hasError())
              {
                $err->push (qq(Failed ProliantGIS login for PC_PARCEL update\n));
              }
            else
              {
                $err = delete_from_table($dbh, 'PC_PARCEL');
                if (defined($err) && $err->hasError())
                  {
                    $err->push (qq(Failed to delete table PC_PARCEL\n));
                  }
                else
                  {
                    for (@$rows)
                      {
                        my $insert_handle = $dbh->prepare_cached('INSERT INTO PC_PARCEL VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)');

                        if(!$insert_handle->execute(@$_[0],@$_[1],@$_[2],@$_[3],@$_[4],@$_[5],@$_[6],@$_[7],@$_[8],@$_[9],@$_[10],@$_[11],@$_[12],@$_[13],@$_[14],@$_[15],@$_[16],@$_[17],@$_[18],@$_[19],@$_[20],@$_[21],@$_[22],@$_[23],@$_[24],@$_[25],@$_[26],@$_[27],@$_[28],@$_[29],@$_[30],@$_[31],@$_[32],@$_[33],@$_[34],@$_[35],@$_[36],@$_[37],@$_[38],@$_[39],@$_[40],@$_[41],@$_[42]))
                          {
                            $err = new Error(qq(Failed to Add Record for PC_PARCEL: $dbh->errstr\n));
                          }
                      }
                  }
              }
          }
      }

    undef($dbh);

    return ($err);
  }

#######################################################################################
#  Function: update_PC_DOC_LOCATOR
#
#  Description: update the PC_DOC_LOCATOR table
#

sub update_PC_DOC_LOCATOR
  {

    my ($err,$dbh) = connectToSQLServer($GOVDSN,$govuser,$govpass);
    if (defined($err) && $err->hasError())
      {
        $err->push (qq(Failed to Connect to SQL Server\n));
      }
    else
      {
        my $rows = $dbh->selectall_arrayref('SELECT * FROM PC_DOC_LOCATOR');
        if(!defined($rows))
          {
            $err = new Error(qq(Rows not defined: no rows returned from SELECT query\n));
          }
        else
          {
            undef($dbh);
            my ($err,$dbh) = connectToSQLServer($PSDSN,$psuser,$pspass);
            if (defined($err) && $err->hasError())
              {
                $err->push (qq(Failed ProliantGIS login for PC_DOC_LOCATOR update\n));
              }
            else
              {
                $err = delete_from_table($dbh, 'PC_DOC_LOCATOR');
                if (defined($err) && $err->hasError())
                  {
                    $err->push (qq(Failed to delete table PC_DOC_LOCATOR\n));
                  }
                else
                  {
                    for (@$rows)
                      {
                        my $insert_handle = $dbh->prepare_cached('INSERT INTO PC_DOC_LOCATOR VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)');

                        if(!$insert_handle->execute(@$_[0],@$_[1],@$_[2],@$_[3],@$_[4],@$_[5],@$_[6],@$_[7],@$_[8],@$_[9],@$_[10],@$_[11],@$_[12],@$_[13],@$_[14],@$_[15],@$_[16],@$_[17],@$_[18],@$_[19]))
                          {
                            $err = new Error(qq(Failed to Add Record for PC_DOC_LOCATOR: $dbh->errstr\n));
                          }
                      }
                  }
              }
          }
      }

    undef($dbh);

    return ($err);
  }

sub update_TX_LEVY_MASTER
  {

    my ($err,$dbh) = connectToSQLServer($PSDSN,$psuser,$pspass);
    $err = delete_from_table($dbh, 'TX_LEVY_MASTER');

    if (defined($err) && $err->hasError())
      {
        $err->push (qq(Failed to delete table TX_LEVY_MASTER\n));
      }
    else
      {
        print "Deleted Table, connecting to Govern\n";
        my ($err,$dbhgov) = connectToSQLServer($GOVDSN,$govuser,$govpass);

        for(my $i=0; $i < 1200000; $i += 10000)
          {
            my $highinterval = $i + 10000;
            my $sql =  "SELECT * FROM TX_LEVY_MASTER WHERE P_ID >= $i AND P_ID < $highinterval\n";
            my $rows = $dbhgov->selectall_arrayref($sql);
            print "Executing: " . $sql . "\n";
            if(!defined($rows))
              {
                $err = new Error(qq(Rows not defined: no rows returned from SELECT query\n));
              }
            else
              {
                    for (@$rows)
                      {
                        my $insert_handle = $dbh->prepare_cached('INSERT INTO TX_LEVY_MASTER VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)');

                        if(!$insert_handle->execute(@$_[0],@$_[1],@$_[2],@$_[3],@$_[4],@$_[5],@$_[6],@$_[7],@$_[8],@$_[9],@$_[10],@$_[11],@$_[12],@$_[13],@$_[14],@$_[15],@$_[16],@$_[17],@$_[18],@$_[19],@$_[20],@$_[21],@$_[22],@$_[23],@$_[24],@$_[25],@$_[26],@$_[27]))
                          {
                            $err = new Error(qq(Failed to Add Record for TX_LEVY_MASTER: $dbh->errstr\n));
                          }
                      }

                  }
          }
            undef($dbh);
            undef($dbhgov);
      }

    return ($err);
  }


#######################################################################################
#  Function: update_PC_ADDRESS
#
#  Description: update the PC_ADDRESS table
#

sub update_PC_ADDRESS
  {
    my ($err,$dbh) = connectToSQLServer($GOVDSN,$govuser,$govpass);

    if (defined($err) && $err->hasError())
      {
        $err->push (qq(Failed GOV Login for PC_ADDRESS update\n));
      }
    else
      {
        my $rows = $dbh->selectall_arrayref('SELECT * FROM PC_ADDRESS');
        if(!defined($rows))
          {
            $err = new Error(qq(Rows not defined: no rows returned from SELECT query\n));
          }
        else
          {
            undef($dbh);
            my ($err,$dbh) = connectToSQLServer($PSDSN,$psuser,$pspass);
            if (defined($err) && $err->hasError())
              {
                $err->push (qq(Failed ProliantGIS login for PC_ADDRESS update\n));
              }
            else
              {
                $err = delete_from_table($dbh, 'PC_ADDRESS');
                if (defined($err) && $err->hasError())
                  {
                    $err->push (qq(Failed to delete table PC_ADDRESS\n));
                  }
                else
                  {
                    for (@$rows)
                      {
                        my $insert_handle = $dbh->prepare_cached('INSERT INTO PC_ADDRESS VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)');

                        if(!$insert_handle->execute(@$_[0],@$_[1],@$_[2],@$_[3],@$_[4],@$_[5],@$_[6],@$_[7],@$_[8],@$_[9],@$_[10],@$_[11],@$_[12],@$_[13],@$_[14],@$_[15],@$_[16],@$_[17],@$_[18],@$_[19],@$_[20],@$_[21]))
                          {
                            $err = new Error(qq(Failed to Add Record for PC_ADDRESS: $dbh->errstr\n));
                          }
                      }
                  }
              }
          }
      }

    undef($dbh);

    return ($err);
  }


#######################################################################################
#  Function: update_PC_AREA
#
#  Description: update the PC_AREA table
#

  sub update_PC_AREA
  {

    my ($err,$dbh) = connectToSQLServer($PSDSN,$psuser,$pspass);
    $err = delete_from_table($dbh, 'PC_AREA');

    if (defined($err) && $err->hasError())
      {
        $err->push (qq(Failed GOV Login for PC_AREA update\n));
      }
    else
      {
        print "Deleted Table, connecting to Govern\n";
        my ($err,$dbhgov) = connectToSQLServer($GOVDSN,$govuser,$govpass);

        for(my $i=0; $i < 1200000; $i += 10000)
          {
            my $highinterval = $i + 10000;
            my $sql =  "SELECT * FROM PC_AREA WHERE P_ID >= $i AND P_ID < $highinterval\n";
            my $rows = $dbhgov->selectall_arrayref($sql);
            print "Executing: " . $sql . "\n";
            if(!defined($rows))
              {
                $err = new Error(qq(Rows not defined: no rows returned from SELECT query\n));
              }
            else
              {
                    for (@$rows)
                      {
                        my $insert_handle = $dbh->prepare_cached('INSERT INTO PC_AREA VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)');

                        if(!$insert_handle->execute(@$_[0],@$_[1],@$_[2],@$_[3],@$_[4],@$_[5],@$_[6],@$_[7],@$_[8],@$_[9],@$_[10],@$_[11],@$_[12],@$_[13],@$_[14],@$_[15],@$_[16],@$_[17],@$_[18],@$_[19],@$_[20],@$_[21],@$_[22],@$_[23],@$_[24],@$_[25],@$_[26],@$_[27],@$_[28],@$_[29],@$_[30],@$_[31],@$_[32],@$_[33],@$_[34],@$_[35],@$_[36],@$_[37],@$_[38],@$_[39],@$_[40],@$_[41],@$_[42],@$_[43],@$_[44],@$_[45],@$_[46],@$_[47],@$_[48],@$_[49],@$_[50],@$_[51],@$_[52],@$_[53],@$_[54],@$_[55],@$_[56],@$_[57],@$_[58],@$_[59]))
                          {
                            $err = new Error(qq(Failed to Add Record for PC_AREA: $dbh->errstr\n));
                         }
                      }
                  }
          }
      }

    undef($dbh);

    return ($err);
  }

#######################################################################################
#  Function: update_PC_LEGAL_INFO
#
#  Description: update the PC_LEGAL_INFO table
#

  sub update_PC_LEGAL_INFO
  {

    my ($err,$dbh) = connectToSQLServer($PSDSN,$psuser,$pspass);
    $err = delete_from_table($dbh, 'PC_LEGAL_INFO');

    if (defined($err) && $err->hasError())
      {
        $err->push (qq(Failed GOV Login for PC_LEGAL_INFO update\n));
      }
    else
      {
        print "Deleted Table, connecting to Govern\n";
        my ($err,$dbhgov) = connectToSQLServer($GOVDSN,$govuser,$govpass);

        for(my $i=0; $i < 1200000; $i += 10000)
          {
            my $highinterval = $i + 10000;
            my $sql =  "SELECT * FROM PC_LEGAL_INFO WHERE P_ID >= $i AND P_ID < $highinterval\n";
            my $rows = $dbhgov->selectall_arrayref($sql);
            print "Executing: " . $sql . "\n";
            if(!defined($rows))
              {
                $err = new Error(qq(Rows not defined: no rows returned from SELECT query\n));
              }
            else
              {
                    for (@$rows)
                      {
                        my $insert_handle = $dbh->prepare_cached('INSERT INTO PC_LEGAL_INFO VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)');
                       if(!$insert_handle->execute(@$_[0],@$_[1],@$_[2],@$_[3],@$_[4],@$_[5],@$_[6],@$_[7],@$_[8],@$_[9],@$_[10],@$_[11],@$_[12],@$_[13],@$_[14],@$_[15],@$_[16],@$_[17],@$_[18],@$_[19],@$_[20],@$_[21],@$_[22],@$_[23],@$_[24],@$_[25],@$_[26],@$_[27],@$_[28],@$_[29],@$_[30],@$_[31],@$_[32],@$_[33],@$_[34],@$_[35],@$_[36],@$_[37],@$_[38],@$_[39],@$_[40],@$_[41],@$_[42],@$_[43],@$_[44],@$_[45],@$_[46],@$_[47],@$_[48],@$_[49],@$_[50],@$_[51],@$_[52]))
                          {
                            $err = new Error(qq(Failed to Add Record for PC_LEGAL_INFO: $dbh->errstr\n));
                          }
                      }
                  }
          }
      }

    undef($dbh);

    return ($err);
  }

#######################################################################################
#  Function: update_NA_NAMES
#
#  Description: update the NA_NAMES table
#

  sub update_NA_NAMES
  {
    my ($err,$dbh) = connectToSQLServer($GOVDSN,$govuser,$govpass);

    if (defined($err) && $err->hasError())
      {
        $err->push (qq(Failed GOV Login for NA_NAMES update\n));
      }
    else
      {
        my $rows = $dbh->selectall_arrayref('SELECT * FROM NA_NAMES');
        if(!defined($rows))
          {
            $err = new Error(qq(Rows not defined: no rows returned from SELECT query\n));
          }
        else
          {
            undef($dbh);
            my ($err,$dbh) = connectToSQLServer($PSDSN,$psuser,$pspass);
            if (defined($err) && $err->hasError())
              {
                $err->push (qq(Failed ProliantGIS login for NA_NAMES update\n));
              }
            else
              {
                $err = delete_from_table($dbh, 'NA_NAMES');
                if (defined($err) && $err->hasError())
                  {
                    $err->push (qq(Failed to delete table NA_NAMES));
                  }
                else
                  {
                    for (@$rows)
                      {
                        my $insert_handle = $dbh->prepare_cached('INSERT INTO NA_NAMES VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)');

                        if(!$insert_handle->execute(@$_[0],@$_[1],@$_[2],@$_[3],@$_[4],@$_[5],@$_[6],@$_[7],@$_[8],@$_[9],@$_[10],@$_[11],@$_[12],@$_[13],@$_[14],@$_[15],@$_[16],@$_[17],@$_[18],@$_[19],@$_[20],@$_[21],@$_[22],@$_[23],@$_[24],@$_[25],@$_[26],@$_[27],@$_[28],@$_[29],@$_[30],@$_[31],@$_[32],@$_[33],@$_[34],@$_[35],@$_[36],@$_[37],@$_[38],@$_[39],@$_[40],@$_[41],@$_[42],@$_[43],@$_[44],@$_[45],@$_[46],@$_[47],@$_[48],@$_[49],@$_[50],@$_[51],@$_[52],@$_[53],@$_[54],@$_[55],@$_[56],@$_[57],@$_[58],@$_[59],@$_[60],@$_[61],@$_[62],@$_[63],@$_[64],@$_[65],@$_[66],@$_[67],@$_[68],@$_[69],@$_[70],@$_[71],@$_[72],@$_[73],@$_[74],@$_[75],@$_[76]))
                          {
                            $err = new Error(qq(Failed to Add Record for NA_NAMES: $dbh->errstr\n));
                          }
                      }
                  }
              }
          }
      }

    undef($dbh);

    return ($err);
  }

#######################################################################################
#  Function: update_NA_MAILING_INDEX
#
#  Description: update the NA_MAILING_INDEX table
#

  sub update_NA_MAILING_INDEX
  {
    my ($err,$dbh) = connectToSQLServer($GOVDSN,$govuser,$govpass);

    if (defined($err) && $err->hasError())
      {
        $err->push (qq(Failed GOV Login for NA_MAILING_INDEX update\n));
      }
    else
      {
        my $rows = $dbh->selectall_arrayref('SELECT * FROM NA_MAILING_INDEX');
        if(!defined($rows))
          {
            $err = new Error(qq(Rows not defined: no rows returned from SELECT query\n));
          }
        else
          {
            undef($dbh);
            my ($err,$dbh) = connectToSQLServer($PSDSN,$psuser,$pspass);
            if (defined($err) && $err->hasError())
              {
                $err->push (qq(Failed ProliantGIS login for NA_MAILING_INDEX update\n));
              }
            else
              {
                $err = delete_from_table($dbh, 'NA_MAILING_INDEX');
                if (defined($err) && $err->hasError())
                  {
                    $err->push (qq(Failed to delete table NA_MAILING_INDEX));
                  }
                else
                  {
                    for (@$rows)
                      {
                        my $insert_handle = $dbh->prepare_cached('INSERT INTO NA_MAILING_INDEX VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)');

                        if(!$insert_handle->execute(@$_[0],@$_[1],@$_[2],@$_[3],@$_[4],@$_[5],@$_[6],@$_[7],@$_[8],@$_[9],@$_[10],@$_[11],@$_[12],@$_[13],@$_[14],@$_[15],@$_[16],@$_[17],@$_[18],@$_[19],@$_[20],@$_[21],@$_[22],@$_[23],@$_[24],@$_[25],@$_[26],@$_[27]))
                          {
                            $err = new Error(qq(Failed to Add Record for NA_MAILING_INDEX: $dbh->errstr\n));
                          }
                      }
                  }
              }
          }
      }

    undef($dbh);

    return ($err);
  }

#######################################################################################
#  Function: update_MA_MASTER
#
#  Description: update the MA_MASTER table
#

  sub update_MA_MASTER
  {

    my ($err,$dbh) = connectToSQLServer($PSDSN,$psuser,$pspass);
    $err = delete_from_table($dbh, 'MA_MASTER');

    if (defined($err) && $err->hasError())
      {
        $err->push (qq(Failed to delete table MA_MASTER\n));
      }
    else
      {
        my ($err,$dbhgov) = connectToSQLServer($GOVDSN,$govuser,$govpass);

        for(my $i=0; $i < 1200000; $i += 10000)
          {
            my $highinterval = $i + 10000;
            my $sql =  "SELECT * FROM MA_MASTER WHERE P_ID >= $i AND P_ID < $highinterval\n";
            my $rows = $dbhgov->selectall_arrayref($sql);
            print "Executing: " . $sql . "\n";
            if(!defined($rows))
              {
                $err = new Error(qq(Rows not defined: no rows returned from SELECT query\n));
              }
            else
              {
                    for (@$rows)
                      {
                        my $insert_handle = $dbh->prepare_cached('INSERT INTO MA_MASTER VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)');

                        if(!$insert_handle->execute(@$_[0],@$_[1],@$_[2],@$_[3],@$_[4],@$_[5],@$_[6],@$_[7],@$_[8],@$_[9],@$_[10],@$_[11],@$_[12],@$_[13],@$_[14],@$_[15],@$_[16],@$_[17],@$_[18],@$_[19],@$_[20],@$_[21],@$_[22],@$_[23],@$_[24],@$_[25],@$_[26],@$_[27],@$_[28],@$_[29],@$_[30],@$_[31],@$_[32],@$_[33],@$_[34],@$_[35],@$_[36],@$_[37],@$_[38],@$_[39],@$_[40],@$_[41],@$_[42],@$_[43],@$_[44],@$_[45],@$_[46],@$_[47],@$_[48],@$_[49],@$_[50],@$_[51],@$_[52],@$_[53],@$_[54],@$_[55],@$_[56],@$_[57],@$_[58],@$_[59],@$_[60],@$_[61],@$_[62],@$_[63],@$_[64],@$_[65],@$_[66],@$_[67],@$_[68],@$_[69],@$_[70],@$_[71],@$_[72],@$_[73],@$_[74],@$_[75],@$_[76],@$_[77],@$_[78],@$_[79],@$_[80],@$_[81],@$_[82],@$_[83],@$_[84],@$_[85],@$_[86],@$_[87],@$_[88],@$_[89],@$_[90],@$_[91],@$_[92],@$_[93],@$_[94],@$_[95],@$_[96],@$_[97],@$_[98],@$_[99],@$_[100],@$_[101],@$_[102],@$_[103],@$_[104],@$_[105],@$_[106],@$_[107],@$_[108],@$_[109],@$_[110],@$_[111]))
                         {
                            $err = new Error(qq(Failed to Add Record for MA_MASTER: $dbh->errstr\n));
                          }
                      }

              }
          }
            undef($dbh);
            undef($dbhgov);
      }

    return ($err);
  }

#######################################################################################
#  Function: update_MA_SALES_SAG
#
#  Description: update the MA_SALES_SAG table
#

  sub update_MA_SALES_SAG
  {
    my ($err,$dbh) = connectToSQLServer($GOVSAGDSN,$govsaguser,$govsagpass);
    if (defined($err) && $err->hasError())
      {
        $err->push (qq(Failed GOV Login for MA_SALES_SAG update));
      }
    else
      {
        my $rows = $dbh->selectall_arrayref('SELECT * FROM MA_SALES');
        if(!defined($rows))
          {
            $err = new Error(qq(Rows not defined: no rows returned from SELECT query\n));
          }
        else
          {
            undef($dbh);
            my ($err,$dbh) = connectToSQLServer($PSDSN,$psuser,$pspass);
            if (defined($err) && $err->hasError())
              {
                $err->push (qq(Failed ProliantGIS login for MA_SALES_SAG update));
              }
            else
              {
                $err = delete_from_table($dbh, 'MA_SALES_SAG');
                if (defined($err) && $err->hasError())
                  {
                    $err->push (qq(Failed to delete table MA_SALES_SAG, $!,\n));
                  }
                else
                  {
                    for (@$rows)
                      {
                        my $insert_handle = $dbh->prepare_cached('INSERT INTO MA_SALES_SAG VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)');

                        if(!$insert_handle->execute(@$_[0],@$_[1],@$_[2],@$_[3],@$_[4],@$_[5],@$_[6],@$_[7],@$_[8],@$_[9],@$_[10],@$_[11],@$_[12],@$_[13],@$_[14],@$_[15],@$_[16],@$_[17],@$_[18],@$_[19],@$_[20],@$_[21],@$_[22],@$_[23],@$_[24],@$_[25],@$_[26],@$_[27],@$_[28],@$_[29],@$_[30],@$_[31],@$_[32],@$_[33],@$_[34],@$_[35],@$_[36],@$_[37],@$_[38],@$_[39],@$_[40],@$_[41],@$_[42],@$_[43],@$_[44],@$_[45],@$_[46],@$_[47],@$_[48],@$_[49],@$_[50],@$_[51],@$_[52],@$_[53],@$_[54],@$_[55],@$_[56],@$_[57],@$_[58],@$_[59],@$_[60],@$_[61],@$_[62],@$_[63],@$_[64],@$_[65]))
                          {
                            $err = new Error(qq(Failed to Add Record for MA_SALES_SAG: $dbh->errstr,\n));
                          }
                      }
                  }
              }
          }
      }

    undef($dbh);
    return ($err);
  }

#######################################################################################
#  Function: update_PC_LK_PARCEL_SALE_SAG
#
#  Description: update the PC_LK_PARCEL_SALE_SAG table
#

  sub update_PC_LK_PARCEL_SALE_SAG
  {

    my ($err,$dbh) = connectToSQLServer($GOVSAGDSN,$govsaguser,$govsagpass);
    if (defined($err) && $err->hasError())
      {
        $err->push (qq(Failed GOV Login for PC_LK_PARCEL_SALE_SAG update));
      }
    else
      {
        my $rows = $dbh->selectall_arrayref('SELECT * FROM PC_LK_PARCEL_SALE');
        if(!defined($rows))
          {
            $err = new Error(qq(Rows not defined: no rows returned from SELECT query\n));
          }
        else
          {
            undef($dbh);
            my ($err,$dbh) = connectToSQLServer($PSDSN,$psuser,$pspass);
            if (defined($err) && $err->hasError())
              {
                $err->push (qq(Failed ProliantGIS login for PC_LK_PARCEL_SALE_SAG update));
              }
            else
              {
                $err = delete_from_table($dbh, 'PC_LK_PARCEL_SALE_SAG');
                if (defined($err) && $err->hasError())
                  {
                    $err->push (qq(Failed to delete table PC_LK_PARCEL_SALE_SAG, $!,\n));
                  }
                else
                  {
                    for (@$rows)
                      {
                        my $insert_handle = $dbh->prepare_cached('INSERT INTO PC_LK_PARCEL_SALE_SAG VALUES(?,?,?,?,?,?)');

                        if(!$insert_handle->execute(@$_[0],@$_[1],@$_[2],@$_[3],@$_[4],@$_[5]))
                          {
                            $err = new Error(qq(Failed to Add Record for PC_LK_PARCEL_SALE_SAG: $dbh->errstr,\n));
                          }
                      }
                  }
              }
          }
      }

    undef($dbh);
    return ($err);
  }

#######################################################################################
#  Function: update_PC_DEEDS_SAG
#
#  Description: update the PC_DEEDS_SAG table
#

  sub update_PC_DEEDS_SAG
  {

    my ($err,$dbh) = connectToSQLServer($GOVSAGDSN,$govsaguser,$govsagpass);
    if (defined($err) && $err->hasError())
      {
        $err->push (qq(Failed GOV Login for PC_DEEDS_SAG update));
      }
    else
      {
        my $rows = $dbh->selectall_arrayref('SELECT * FROM PC_DEEDS');
        if(!defined($rows))
          {
            $err = new Error(qq(Rows not defined: no rows returned from SELECT query\n));
          }
        else
          {
            undef($dbh);
            my ($err,$dbh) = connectToSQLServer($PSDSN,$psuser,$pspass);
            if (defined($err) && $err->hasError())
              {
                $err->push (qq(Failed ProliantGIS login for PC_DEEDS_SAG update));
              }
            else
              {
                $err = delete_from_table($dbh, 'PC_DEEDS_SAG');
                if (defined($err) && $err->hasError())
                  {
                    $err->push (qq(Failed to delete table PC_DEEDS_SAG, $!,\n));
                  }
                else
                  {
                    for (@$rows)
                      {
                        my $insert_handle = $dbh->prepare_cached('INSERT INTO PC_DEEDS_SAG VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)');
                        if(!$insert_handle->execute(@$_[0],@$_[1],@$_[2],@$_[3],@$_[4],@$_[5],@$_[6],@$_[7],@$_[8],@$_[9],@$_[10],@$_[11],@$_[12],@$_[13],@$_[14],@$_[15],@$_[16]))
                          {
                            $err = new Error(qq(Failed to Add Record for PC_DEEDS_SAG: $dbh->errstr,\n));
                          }
                      }
                  }
              }
          }
      }

    undef($dbh);
    return ($err);
  }

#######################################################################################
#  Function: update_MA_SITE
#
#  Description: update the MA_SITE table
#

  sub update_MA_SITE
  {

    my ($err,$dbh) = connectToSQLServer($PSDSN,$psuser,$pspass);
    $err = delete_from_table($dbh, 'MA_SITE');

    if (defined($err) && $err->hasError())
      {
        $err->push (qq(Failed to delete table MA_SITE));
      }
    else
      {
        print "Deleted Table, connecting to Govern\n";
        my ($err,$dbhgov) = connectToSQLServer($GOVDSN,$govuser,$govpass);

        for(my $i=0; $i < 1200000; $i += 10000)
          {
            my $highinterval = $i + 10000;
            my $sql =  "SELECT * FROM MA_SITE WHERE P_ID >= $i AND P_ID < $highinterval\n";
            my $rows = $dbhgov->selectall_arrayref($sql);
            print "Executing: " . $sql . "\n";
            if(!defined($rows))
              {
                $err = new Error(qq(Rows not defined: no rows returned from SELECT query\n));
              }
            else
              {
                    for (@$rows)
                      {
                        my $insert_handle = $dbh->prepare_cached('INSERT INTO MA_SITE VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)');
                        if(!$insert_handle->execute(@$_[0],@$_[1],@$_[2],@$_[3],@$_[4],@$_[5],@$_[6],@$_[7],@$_[8],@$_[9],@$_[10],@$_[11],@$_[12],@$_[13],@$_[14],@$_[15],@$_[16],@$_[17],@$_[18],@$_[19],@$_[20],@$_[21],@$_[22],@$_[23],@$_[24],@$_[25],@$_[26],@$_[27],@$_[28],@$_[29],@$_[30],@$_[31],@$_[32],@$_[33],@$_[34],@$_[35],@$_[36],@$_[37],@$_[38],@$_[39],@$_[40],@$_[41],@$_[42],@$_[43],@$_[44],@$_[45],@$_[46],@$_[47],@$_[48],@$_[49],@$_[50],@$_[51],@$_[52],@$_[53],@$_[54],@$_[55],@$_[56],@$_[57],@$_[58],@$_[59],@$_[60],@$_[61],@$_[62],@$_[63],@$_[64],@$_[65],@$_[66],@$_[67],@$_[68],@$_[69],@$_[70],@$_[71],@$_[72],@$_[73],@$_[74],@$_[75],@$_[76],@$_[77],@$_[78],@$_[79],@$_[80],@$_[81],@$_[82],@$_[83],@$_[84],@$_[85],@$_[86],@$_[87],@$_[88],@$_[89],@$_[90],@$_[91],@$_[92],@$_[93],@$_[94],@$_[95],@$_[96]))

                         {
                            $err = new Error(qq(Failed to Add Record for MA_SITE: $dbh->errstr,\n));
                          }
                      }

              }
          }
            undef($dbh);
            undef($dbhgov);
      }

    return ($err);
  }

#######################################################################################
#  Function: update_MA_LAND
#
#  Description: update the MA_LAND table
#

  sub update_MA_LAND
  {

    my ($err,$dbh) = connectToSQLServer($PSDSN,$psuser,$pspass);
    $err = delete_from_table($dbh, 'MA_LAND');

    if (defined($err) && $err->hasError())
      {
        $err->push (qq(Failed to delete table MA_LAND));
      }
    else
      {
        print "Deleted Table, connecting to Govern\n";
        my ($err,$dbhgov) = connectToSQLServer($GOVDSN,$govuser,$govpass);

        for(my $i=0; $i < 80000; $i += 10000)
          {
            my $highinterval = $i + 10000;
            my $sql =  "SELECT * FROM MA_LAND WHERE P_ID >= $i AND P_ID < $highinterval\n";
            my $rows = $dbhgov->selectall_arrayref($sql);
            print "Executing: " . $sql . "\n";
            if(!defined($rows))
              {
                $err = new Error(qq(Rows not defined: no rows returned from SELECT query\n));
              }
            else
              {
                    for (@$rows)
                      {
                        my $insert_handle = $dbh->prepare_cached('INSERT INTO MA_LAND VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)');
                        if(!$insert_handle->execute(@$_[0],@$_[1],@$_[2],@$_[3],@$_[4],@$_[5],@$_[6],@$_[7],@$_[8],@$_[9],@$_[10],@$_[11],@$_[12],@$_[13],@$_[14],@$_[15],@$_[16],@$_[17],@$_[18],@$_[19],@$_[20],@$_[21],@$_[22],@$_[23],@$_[24],@$_[25],@$_[26],@$_[27],@$_[28],@$_[29],@$_[30],@$_[31],@$_[32],@$_[33],@$_[34],@$_[35],@$_[36],@$_[37],@$_[38],@$_[39],@$_[40],@$_[41],@$_[42],@$_[43],@$_[44],@$_[45],@$_[46],@$_[47],@$_[48],@$_[49],@$_[50],@$_[51],@$_[52],@$_[53],@$_[54],@$_[55],@$_[56],@$_[57],@$_[58],@$_[59],@$_[60],@$_[61],@$_[62],@$_[63],@$_[64],@$_[65],@$_[66],@$_[67],@$_[68],@$_[69],@$_[70],@$_[71],@$_[72],@$_[73],@$_[74],@$_[75],@$_[76],@$_[77],@$_[78],@$_[79],@$_[80],@$_[81],@$_[82],@$_[83],@$_[84],@$_[85],@$_[86],@$_[87],@$_[88],@$_[89],@$_[90],@$_[91],@$_[92],@$_[93],@$_[94],@$_[95],@$_[96],@$_[97],@$_[98],@$_[99],@$_[100],@$_[101],@$_[102],@$_[103],@$_[104],@$_[105],@$_[106],@$_[107],@$_[108],@$_[109],@$_[110]))

                         {
                            $err = new Error(qq(Failed to Add Record for MA_LAND: $dbh->errstr,\n));
                          }
                      }

              }
          }
            undef($dbh);
            undef($dbhgov);
      }

    return ($err);
  }



#######################################################################################
#  Function: update_PC_OWNER
#
#  Description: update the PC_OWNER table
#

  sub update_PC_OWNER
  {

    my ($err,$dbh) = connectToSQLServer($GOVDSN,$govuser,$govpass);

    if (defined($err) && $err->hasError())
      {
        $err->push (qq(Failed GOV Login for PC_OWNER update));
      }
    else
      {
         my $rows = $dbh->selectall_arrayref('SELECT P_ID,NA_ID,STATUS,AS_OF_DATE,LAST_MODIF_UID,LAST_MODIF_DATE,INFO_SOURCE,PCT_OWNERSHIP,OCCUPANT,NO_CORRESPONDENCE,SEQ_PRIORITY,DEV_RIGHTS,NOTES FROM PC_OWNER');
        if(!defined($rows))
          {
            $err = new Error(qq(Rows not defined: no rows returned from SELECT query\n));
          }
        else
          {

            undef($dbh);
            my ($err,$dbh) = connectToSQLServer($PSDSN,$psuser,$pspass);
            if (defined($err) && $err->hasError())
              {
                $err->push (qq(Failed ProliantGIS login for PC_OWNER update));
              }
            else
              {
                $err = delete_from_table($dbh, 'PC_OWNER');
                if (defined($err) && $err->hasError())
                  {
                    $err->push (qq(Failed to delete table PC_OWNER));
                  }
                else
                  {
                    for (@$rows)
                      {
                        my $insert_handle = $dbh->prepare_cached('INSERT INTO PC_OWNER VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)');
                        if(!$insert_handle->execute(@$_[0],@$_[1],@$_[2],@$_[3],@$_[4],@$_[5],@$_[6],@$_[7],@$_[8],@$_[9],@$_[10],@$_[11],@$_[12]))
                          {
                            $err = new Error(qq(Failed to Add Record for PC_OWNER: $dbh->errstr,\n));
                          }
                      }
                  }
              }
          }
      }

    undef($dbh);

    return ($err);
  }

#######################################################################################
#  Function: update_USR_DEPARTMENT
#
#  Description: update the USR_DEPARTMENT table
#

  sub update_USR_DEPARTMENT
  {
    my ($err,$dbh) = connectToSQLServer($GOVDSN,$govuser,$govpass);
    if (defined($err) && $err->hasError())
      {
        $err->push (qq(Failed GOV Login for USR_DEPARTMENT update));
      }
    else
      {
        my $rows = $dbh->selectall_arrayref('SELECT * FROM USR_DEPARTMENT');
        if(!defined($rows))
          {
            $err = new Error(qq(Rows not defined: no rows returned from SELECT query\n));
          }
        else
          {

            undef($dbh);
            my ($err,$dbh) = connectToSQLServer($PSDSN,$psuser,$pspass);
            if (defined($err) && $err->hasError())
              {
                $err->push (qq(Failed ProliantGIS login for USR_DEPARTMENT update));
              }
            else
              {

                $err = delete_from_table($dbh, 'USR_DEPARTMENT');
                if (defined($err) && $err->hasError())
                  {
                    $err->push (qq(Failed to delete table USR_DEPARTMENT, $!,\n));
                  }
                else
                  {

                    for (@$rows)
                      {
                        my $insert_handle = $dbh->prepare_cached('INSERT INTO USR_DEPARTMENT VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)');

                        if(!$insert_handle->execute(@$_[0],@$_[1],@$_[2],@$_[3],@$_[4],@$_[5],@$_[6],@$_[7],@$_[8],@$_[9],@$_[10],@$_[11],@$_[12],@$_[13],@$_[14],@$_[15],@$_[16],@$_[17]))
                          {
                            $err = new Error(qq(Failed to Add Record for USR_DEPARTMENT: $dbh->errstr,\n));
                          }
                      }
                  }
              }
          }
      }

    undef($dbh);
    return ($err);
  }

#######################################################################################
#  Function: update_MA_SALES
#
#  Description: update the MA_SALES table
#

  sub update_MA_SALES
  {
    my ($err,$dbh) = connectToSQLServer($GOVDSN,$govuser,$govpass);
    if (defined($err) && $err->hasError())
      {
        $err->push (qq(Failed GOV Login for MA_SALES update));
      }
    else
      {
        my $rows = $dbh->selectall_arrayref('SELECT * FROM MA_SALES');
        if(!defined($rows))
          {
            $err = new Error(qq(Rows not defined: no rows returned from SELECT query\n));
          }
        else
          {

            undef($dbh);
            my ($err,$dbh) = connectToSQLServer($PSDSN,$psuser,$pspass);
            if (defined($err) && $err->hasError())
              {
                $err->push (qq(Failed ProliantGIS login for MA_SALES update));
              }
            else
              {

                $err = delete_from_table($dbh, 'MA_SALES');
                if (defined($err) && $err->hasError())
                  {
                    $err->push (qq(Failed to delete table MA_SALES, $!,\n));
                  }
                else
                  {

                    for (@$rows)
                      {
                        my $insert_handle = $dbh->prepare_cached('INSERT INTO MA_SALES VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)');

                        if(!$insert_handle->execute(@$_[0],@$_[1],@$_[2],@$_[3],@$_[4],@$_[5],@$_[6],@$_[7],@$_[8],@$_[9],@$_[10],@$_[11],@$_[12],@$_[13],@$_[14],@$_[15],@$_[16],@$_[17],@$_[18],@$_[19],@$_[20],@$_[21],@$_[22],@$_[23],@$_[24],@$_[25],@$_[26],@$_[27],@$_[28],@$_[29],@$_[30],@$_[31],@$_[32],@$_[33],@$_[34],@$_[35],@$_[36],@$_[37],@$_[38],@$_[39],@$_[40],@$_[41],@$_[42],@$_[43],@$_[44],@$_[45],@$_[46],@$_[47],@$_[48],@$_[49],@$_[50],@$_[51],@$_[52],@$_[53],@$_[54],@$_[55],@$_[56],@$_[57],@$_[58],@$_[59],@$_[60],@$_[61],@$_[62],@$_[63],@$_[64],@$_[65],@$_[66],@$_[67],@$_[68],@$_[69],@$_[70],@$_[71],@$_[72],@$_[73],@$_[74],@$_[75],@$_[76],@$_[77],@$_[78],@$_[79],@$_[80],@$_[81],@$_[82]))
                          {
                            $err = new Error(qq(Failed to Add Record for MA_SALES: $dbh->errstr,\n));
                          }
                      }
                  }
              }
          }
      }

    undef($dbh);
    return ($err);
  }

#######################################################################################
#  Function: update_PC_DEEDS
#
#  Description: update the PC_DEEDS table
#

  sub update_PC_DEEDS
  {
    my ($err,$dbh) = connectToSQLServer($GOVDSN,$govuser,$govpass);
    if (defined($err) && $err->hasError())
      {
        $err->push (qq(Failed GOV Login for PC_DEEDS update));
      }
    else
      {
        my $rows = $dbh->selectall_arrayref('SELECT * FROM PC_DEEDS');
        if(!defined($rows))
          {
            $err = new Error(qq(Rows not defined: no rows returned from SELECT query\n));
          }
        else
          {

            undef($dbh);
            my ($err,$dbh) = connectToSQLServer($PSDSN,$psuser,$pspass);
            if (defined($err) && $err->hasError())
              {
                $err->push (qq(Failed ProliantGIS login for PC_DEEDS update));
              }
            else
              {

                $err = delete_from_table($dbh, 'PC_DEEDS');
                if (defined($err) && $err->hasError())
                  {
                    $err->push (qq(Failed to delete table PC_DEEDS, $!,\n));
                  }
                else
                  {

                    for (@$rows)
                      {
                        my $insert_handle = $dbh->prepare_cached('INSERT INTO PC_DEEDS VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)');

                        if(!$insert_handle->execute(@$_[0],@$_[1],@$_[2],@$_[3],@$_[4],@$_[5],@$_[6],@$_[7],@$_[8],@$_[9],@$_[10],@$_[11],@$_[12],@$_[13],@$_[14],@$_[15],@$_[16]))
                          {
                            $err = new Error(qq(Failed to Add Record for PC_DEEDS: $dbh->errstr,\n));
                          }
                      }
                  }
              }
          }
      }

    undef($dbh);
    return ($err);
  }

#######################################################################################
#  Function: update_PC_LK_PARCEL_SALE
#
#  Description: update the PC_LK_PARCEL_SALE table
#

  sub update_PC_LK_PARCEL_SALE
  {
    my ($err,$dbh) = connectToSQLServer($GOVDSN,$govuser,$govpass);
    if (defined($err) && $err->hasError())
      {
        $err->push (qq(Failed GOV Login for PC_LK_PARCEL_SALE update));
      }
    else
      {
        my $rows = $dbh->selectall_arrayref('SELECT * FROM PC_LK_PARCEL_SALE');
        if(!defined($rows))
          {
            $err = new Error(qq(Rows not defined: no rows returned from SELECT query\n));
          }
        else
          {

            undef($dbh);
            my ($err,$dbh) = connectToSQLServer($PSDSN,$psuser,$pspass);
            if (defined($err) && $err->hasError())
              {
                $err->push (qq(Failed ProliantGIS login for PC_LK_PARCEL_SALE update));
              }
            else
              {

                $err = delete_from_table($dbh, 'PC_LK_PARCEL_SALE');
                if (defined($err) && $err->hasError())
                  {
                    $err->push (qq(Failed to delete table PC_LK_PARCEL_SALE, $!,\n));
                  }
                else
                  {

                    for (@$rows)
                      {
                        my $insert_handle = $dbh->prepare_cached('INSERT INTO PC_LK_PARCEL_SALE VALUES(?,?,?,?,?,?)');

                        if(!$insert_handle->execute(@$_[0],@$_[1],@$_[2],@$_[3],@$_[4],@$_[5]))
                          {
                            $err = new Error(qq(Failed to Add Record for PC_LK_PARCEL_SALE: $dbh->errstr,\n));
                          }
                      }
                  }
              }
          }
      }

    undef($dbh);
    return ($err);
  }

#######################################################################################
#  Function: update_USR_WEB_MENU_PARAM
#
#  Description: update the USR_WEB_MENU_PARAM table
#

  sub update_USR_WEB_MENU_PARAM
  {
    my ($err,$dbh) = connectToSQLServer($GOVDSN,$govuser,$govpass);
    if (defined($err) && $err->hasError())
      {
        $err->push (qq(Failed GOV Login for USR_WEB_MENU_PARAM update));
      }
    else
      {
        my $rows = $dbh->selectall_arrayref('SELECT * FROM USR_WEB_MENU_PARAM');
        if(!defined($rows))
          {
            $err = new Error(qq(Rows not defined: no rows returned from SELECT query\n));
          }
        else
          {

            undef($dbh);
            my ($err,$dbh) = connectToSQLServer($PSDSN,$psuser,$pspass);
            if (defined($err) && $err->hasError())
              {
                $err->push (qq(Failed ProliantGIS login for USR_WEB_MENU_PARAM update));
              }
            else
              {

                $err = delete_from_table($dbh, 'USR_WEB_MENU_PARAM');
                if (defined($err) && $err->hasError())
                  {
                    $err->push (qq(Failed to delete table USR_WEB_MENU_PARAM, $!,\n));
                  }
                else
                  {


                    for (@$rows)
                      {
                        my $insert_handle = $dbh->prepare_cached('INSERT INTO USR_WEB_MENU_PARAM VALUES(?,?,?,?)');

                        if(!$insert_handle->execute(@$_[0],@$_[1],@$_[2],@$_[3]))
                          {
                            $err = new Error(qq(Failed to Add Record for USR_WEB_MENU_PARAM: $dbh->errstr,\n));
                          }
                      }
                  }
              }
          }
      }

    undef($dbh);
    return ($err);
  }


#######################################################################################
#  Function: update_PC_DEPT_INFO
#
#  Description: update the PC_DEPT_INFO table
#

sub update_PC_DEPT_INFO
  {

    my ($err,$dbh) = connectToSQLServer($GOVDSN,$govuser,$govpass);
    if (defined($err) && $err->hasError())
      {
        $err->push (qq(Failed to Connect to SQL Server\n));
      }
    else
      {
        my $rows = $dbh->selectall_arrayref('SELECT * FROM PC_DEPT_INFO');
        if(!defined($rows))
          {
            $err = new Error(qq(Rows not defined: no rows returned from SELECT query\n));
          }
        else
          {
            undef($dbh);
            my ($err,$dbh) = connectToSQLServer($PSDSN,$psuser,$pspass);
            if (defined($err) && $err->hasError())
              {
                $err->push (qq(Failed ProliantGIS login for PC_DEPT_INFO update\n));
              }
            else
              {
                $err = delete_from_table($dbh, 'PC_DEPT_INFO');
                if (defined($err) && $err->hasError())
                  {
                    $err->push (qq(Failed to delete table PC_DEPT_INFO\n));
                  }
                else
                  {
                    for (@$rows)
                      {
                        my $insert_handle = $dbh->prepare_cached('INSERT INTO PC_DEPT_INFO VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)');

                        if(!$insert_handle->execute(@$_[0],@$_[1],@$_[2],@$_[3],@$_[4],@$_[5],@$_[6],@$_[7],@$_[8],@$_[9],@$_[10],@$_[11],@$_[12],@$_[13],@$_[14],@$_[15],@$_[16],@$_[17],@$_[18],@$_[19],@$_[20]))
                          {
                            $err = new Error(qq(Failed to Add Record for PC_DEPT_INFO: $dbh->errstr\n));
                          }
                      }
                  }
              }
          }
      }

    undef($dbh);

    return ($err);
  }

#######################################################################################
#  Function: update_OWNER_ALL
#
#  Description: update the _OWNER_ALL View
#

sub update_OWNER_ALL
  {

    my ($err,$dbh) = connectToSQLServer($GOVDSN,$govuser,$govpass);
    if (defined($err) && $err->hasError())
      {
        $err->push (qq(Failed to Connect to SQL Server\n));
      }
    else
      {
        my $rows = $dbh->selectall_arrayref('SELECT * FROM _OWNER_ALL');
        if(!defined($rows))
          {
            $err = new Error(qq(Rows not defined: no rows returned from SELECT query\n));
          }
        else
          {
            undef($dbh);
            my ($err,$dbh) = connectToSQLServer($PSDSN,$psuser,$pspass);
            if (defined($err) && $err->hasError())
              {
                $err->push (qq(Failed ProliantGIS login for _OWNER_ALL update\n));
              }
            else
              {
                $err = delete_from_table($dbh, '_OWNER_ALL');
                if (defined($err) && $err->hasError())
                  {
                    $err->push (qq(Failed to delete table _OWNER_ALL\n));
                  }
                else
                  {
                    for (@$rows)
                      {
                        my $insert_handle = $dbh->prepare_cached('INSERT INTO _OWNER_ALL VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)');

                        if(!$insert_handle->execute(@$_[0],@$_[1],@$_[2],@$_[3],@$_[4],@$_[5],@$_[6],@$_[7],@$_[8],@$_[9],@$_[10],@$_[11],@$_[12],@$_[13],@$_[14],@$_[15],@$_[16],@$_[17],@$_[18],@$_[19],@$_[20],@$_[21],@$_[22],@$_[23],@$_[24],@$_[25],@$_[26],@$_[27],@$_[28],@$_[29],@$_[30],@$_[31]))
                          {
                            $err = new Error(qq(Failed to Add Record for _OWNER_ALL: $dbh->errstr\n));
                          }
                      }
                  }
              }
          }
      }

    undef($dbh);

    return ($err);
  }

#######################################################################################
#  Function: update_PC_LK_PARCEL_INSP()
#
#  Description: update_PC_LK_PARCEL_INSP table
#

sub update_PC_LK_PARCEL_INSP
  {

    my ($err,$dbh) = connectToSQLServer($GOVDSN,$govuser,$govpass);
    if (defined($err) && $err->hasError())
      {
        $err->push (qq(Failed to Connect to SQL Server\n));
      }
    else
      {
        my $rows = $dbh->selectall_arrayref('SELECT * FROM PC_LK_PARCEL_INSP');
        if(!defined($rows))
          {
            $err = new Error(qq(Rows not defined: no rows returned from SELECT query\n));
          }
        else
          {
            undef($dbh);
            my ($err,$dbh) = connectToSQLServer($PSDSN,$psuser,$pspass);
            if (defined($err) && $err->hasError())
              {
                $err->push (qq(Failed ProliantGIS login for PC_LK_PARCEL_INSP update\n));
              }
            else
              {
                $err = delete_from_table($dbh, 'PC_LK_PARCEL_INSP');
                if (defined($err) && $err->hasError())
                  {
                    $err->push (qq(Failed to delete table PC_LK_PARCEL_INSP\n));
                  }
                else
                  {
                    for (@$rows)
                      {
                        my $insert_handle = $dbh->prepare_cached('INSERT INTO PC_LK_PARCEL_INSP VALUES(?,?,?,?,?,?,?,?)');

                        if(!$insert_handle->execute(@$_[0],@$_[1],@$_[2],@$_[3],@$_[4],@$_[5],@$_[6],@$_[7]))
                          {
                            $err = new Error(qq(Failed to Add Record for PC_LK_PARCEL_INSP: $dbh->errstr\n));
                          }
                      }
                  }
              }
          }
      }

    undef($dbh);

    return ($err);
  }


#######################################################################################
#  Function: update_PM_INSPECTIONS()
#
#  Description: update_PM_INSPECTIONS table
#

sub update_PM_INSPECTIONS
  {

    my ($err,$dbh) = connectToSQLServer($GOVDSN,$govuser,$govpass);
    if (defined($err) && $err->hasError())
      {
        $err->push (qq(Failed to Connect to SQL Server\n));
      }
    else
      {
        my $rows = $dbh->selectall_arrayref('SELECT * FROM PM_INSPECTIONS');
        if(!defined($rows))
          {
            $err = new Error(qq(Rows not defined: no rows returned from SELECT query\n));
          }
        else
          {
            undef($dbh);
            my ($err,$dbh) = connectToSQLServer($PSDSN,$psuser,$pspass);
            if (defined($err) && $err->hasError())
              {
                $err->push (qq(Failed ProliantGIS login for PM_INSPECTIONS update\n));
              }
            else
              {
                $err = delete_from_table($dbh, 'PM_INSPECTIONS');
                if (defined($err) && $err->hasError())
                  {
                    $err->push (qq(Failed to delete table PM_INSPECTIONS\n));
                  }
                else
                  {
                    for (@$rows)
                      {
                        my $insert_handle = $dbh->prepare_cached('INSERT INTO PM_INSPECTIONS VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)');

                        if(!$insert_handle->execute(@$_[0],@$_[1],@$_[2],@$_[3],@$_[4],@$_[5],@$_[6],@$_[7],@$_[8],@$_[9],@$_[10],@$_[11],@$_[12],@$_[13],@$_[14],@$_[15],@$_[16],@$_[17],@$_[18],@$_[19],@$_[20],@$_[21],@$_[22],@$_[23],@$_[24],@$_[25],@$_[26],@$_[27],@$_[28],@$_[29]))
                          {
                            $err = new Error(qq(Failed to Add Record for PM_INSPECTIONS: $dbh->errstr\n));
                          }
                      }
                  }
              }
          }
      }

    undef($dbh);

    return ($err);
  }


#######################################################################################
#  Function: update_PM_LK_INSP_TYPE()
#
#  Description: update_PM_LK_INSP_TYPE table
#

sub update_PM_LK_INSP_TYPE
  {

    my ($err,$dbh) = connectToSQLServer($GOVDSN,$govuser,$govpass);
    if (defined($err) && $err->hasError())
      {
        $err->push (qq(Failed to Connect to SQL Server\n));
      }
    else
      {
        my $rows = $dbh->selectall_arrayref('SELECT * FROM PM_LK_INSP_TYPE');
        if(!defined($rows))
          {
            $err = new Error(qq(Rows not defined: no rows returned from SELECT query\n));
          }
        else
          {
            undef($dbh);
            my ($err,$dbh) = connectToSQLServer($PSDSN,$psuser,$pspass);
            if (defined($err) && $err->hasError())
              {
                $err->push (qq(Failed ProliantGIS login for PM_LK_INSP_TYPE update\n));
              }
            else
              {
                $err = delete_from_table($dbh, 'PM_LK_INSP_TYPE');
                if (defined($err) && $err->hasError())
                  {
                    $err->push (qq(Failed to delete table PM_LK_INSP_TYPE\n));
                  }
                else
                  {
                    for (@$rows)
                      {
                        my $insert_handle = $dbh->prepare_cached('INSERT INTO PM_LK_INSP_TYPE VALUES(?,?,?,?,?,?,?,?,?,?,?)');

                        if(!$insert_handle->execute(@$_[0],@$_[1],@$_[2],@$_[3],@$_[4],@$_[5],@$_[6],@$_[7],@$_[8],@$_[9],@$_[10]))
                          {
                            $err = new Error(qq(Failed to Add Record for PM_LK_INSP_TYPE: $dbh->errstr\n));
                          }
                      }
                  }
              }
          }
      }

    undef($dbh);

    return ($err);
  }

######################################################################################
#  Function: updateTables()
#
#  Description: update all the tables on ProliantGIS from the Govern tables.
#

sub updateTables
{
  my ($err,$rows);
  my ($insert_handle);
  my ($pc_parcel,$pc_address,$pc_area,$pc_legal_info);
  my ($na_names,$na_mailing_index);
  my ($usr_department);

  $log->info("Updating  _OWNER_ALL");
  $err = update_OWNER_ALL();
  if (defined($err) && $err->hasError())
    {
      $err->push(qq(Failed to UPDATE _OWNER_ALL\n));
   }
  else
    {
      $log->info("Updating PC_PARCEL");
      $err = update_PC_PARCEL();
      if (defined($err) && $err->hasError())
        {
          $err->push(qq(Failed to UPDATE PC_PARCEL\n));
        }
      else
        {
          $log->info("Updating PC_ADDRESS");
          $err = update_PC_ADDRESS();
          if (defined($err) && $err->hasError())
            {
              $err->push(qq(Failed to UPDATE PC_ADDRESS\n));
            }
          else
            {
              $log->info("Updating PC_AREA");
              $err = update_PC_AREA();
              if (defined($err) && $err->hasError())
                {
                  $err->push(qq(Failed to UPDATE PC_AREA\n));
                }
              else
                {
                  $log->info("Updating PC_LEGAL_INFO");
                  $err = update_PC_LEGAL_INFO();
                  if (defined($err) && $err->hasError())
                    {
                      $err->push(qq(Failed to UPDATE PC_LEGAL_INFO\n));
                    }
                  else
                    {
                      $log->info("Updating NA_NAMES");
                      $err = update_NA_NAMES();
                      if (defined($err) && $err->hasError())
                        {
                          $err->push(qq(Failed to UPDATE NA_NAMES\n));
                        }
                      else
                        {
                          $log->info("Updating NA_MAILING_INDEX");
                          $err = update_NA_MAILING_INDEX();
                          if (defined($err) && $err->hasError())
                            {
                              $err->push(qq(Failed to UPDATE NA_MAILING_INDEX\n));
                            }
                          else
                            {
                              $log->info("Updating USR_DEPARTMENT");
                              $err = update_USR_DEPARTMENT();

                              if (defined($err) && $err->hasError())
                                {
                                  $err->push(qq(Failed to UPDATE USR_DEPARTMENT\n));
                                }
                              else
                                {
                                  $log->info("Updating PC_OWNER");
                                  $err = update_PC_OWNER();
                                  if (defined($err) && $err->hasError())
                                    {
                                      $err->push(qq(Failed to UPDATE PC_OWNER\n));
                                    }
                                  else
                                    {
                                      $log->info("Updating MA_SITE");
                                      $err = update_MA_SITE();
                                      if (defined($err) && $err->hasError())
                                        {
                                          $err->push(qq(Failed to UPDATE MA_SITE\n));
                                        }
                                      else
                                        {
                                          $log->info("Updating MA_LAND");
                                          $err = update_MA_LAND();
                                          if (defined($err) && $err->hasError())
                                            {
                                              $err->push(qq(Failed to UPDATE MA_LAND\n));
                                            }
                                          else
                                            {
                                              $log->info("Updating MA_MASTER");
                                              $err = update_MA_MASTER();
                                              if (defined($err) && $err->hasError())
                                                {
                                                  $err->push(qq(Failed to UPDATE MA_MASTER\n));
                                                }
                                              else
                                                {
                                                  $log->info("Updating MA_SALES");
                                                  $err = update_MA_SALES();
                                                  if (defined($err) && $err->hasError())
                                                    {
                                                      $err->push(qq(Failed to UPDATE MA_SALES\n));
                                                    }
                                                  else
                                                    {
                                                      $log->info("Updating PC_DEEDS");
                                                      $err = update_PC_DEEDS();
                                                      if (defined($err) && $err->hasError())
                                                        {
                                                          $err->push(qq(Failed to UPDATE PC_DEEDS\n));
                                                        }
                                                      else
                                                        {
                                                          $log->info("Updating PC_LK_PARCEL_SALE");
                                                          $err = update_PC_LK_PARCEL_SALE();
                                                          if (defined($err) && $err->hasError())
                                                            {
                                                              $err->push(qq(Failed to UPDATE PC_LK_PARCEL_SALE\n));
                                                            }
                                                          else
                                                            {
                                                              $log->info("Updating USR_WEB_MENU_PARAM");
                                                              $err = update_USR_WEB_MENU_PARAM();
                                                              if (defined($err) && $err->hasError())
                                                                {
                                                                  $err->push(qq(Failed to UPDATE USR_WEB_MENU_PARAM\n));
                                                                }
                                                              else
                                                                {
                                                                  $log->info("Updating PC_LK_PARCEL_SALE_SAG");
                                                                  #$err = update_PC_LK_PARCEL_SALE_SAG();
                                                                  if (defined($err) && $err->hasError())
                                                                    {
                                                                      $err = new Error(qq(Failed to UPDATE PC_LK_PARCEL_SALE_SAG\n));
                                                                    }
                                                                  else
                                                                    {
                                                                      $log->info("Updating MA_SALES_SAG");
                                                                      #$err = update_MA_SALES_SAG();
                                                                      if (defined($err) && $err->hasError())
                                                                        {
                                                                          $err = new Error(qq(Failed to UPDATE MA_SALES_SAG\n));
                                                                        }
                                                                      else
                                                                        {
                                                                          $log->info("Updating PC_DEEDS_SAG");
                                                                          #$err = update_PC_DEEDS_SAG();
                                                                          if (defined($err) && $err->hasError())
                                                                            {
                                                                              $err = new Error(qq(Failed to UPDATE PC_DEEDS_S_SAG\n));
                                                                            }
                                                                          else
                                                                            {
                                                                              $log->info("Updating PC_DOC_LOCATOR");
                                                                              $err = update_PC_DOC_LOCATOR();
                                                                              if (defined($err) && $err->hasError())
                                                                                {
                                                                                  $err = new Error(qq(Failed to UPDATE PC_DOC_LOCATOR\n));
                                                                                }
                                                                              else
                                                                                {
                                                                                  $log->info("Updating PC_DEPT_INFO");
                                                                                  $err = update_PC_DEPT_INFO();
                                                                                  if (defined($err) && $err->hasError())
                                                                                    {
                                                                                      $err = new Error(qq(Failed to UPDATE PC_DEPT_INFO\n));
                                                                                    }
                                                                                  else
                                                                                    {
                                                                                      $log->info("Updating PC_LK_PARCEL_INSP");
                                                                                      $err = update_PC_LK_PARCEL_INSP();
                                                                                      if (defined($err) && $err->hasError())
                                                                                        {
                                                                                          $err->push(qq(Failed to UPDATE PC_LK_PARCEL_INSP\n));
                                                                                        }
                                                                                      else
                                                                                        {
                                                                                          $log->info("Updating  PM_INSPECTIONS");
                                                                                          $err = update_PM_INSPECTIONS();
                                                                                          if (defined($err) && $err->hasError())
                                                                                            {
                                                                                              $err->push(qq(Failed to UPDATE PM_INSPECTIONS\n));
                                                                                            }
                                                                                          else
                                                                                            {
                                                                                              $log->info("Updating  PM_LK_INSP_TYPE");
                                                                                              $err = update_PM_LK_INSP_TYPE();
                                                                                              if (defined($err) && $err->hasError())
                                                                                                {
                                                                                                  $err->push(qq(Failed to UPDATE PM_LK_INSP_TYPE\n));
                                                                                                }
                                                                                              else
                                                                                                {
                                                                                                }
                                                                                            }
                                                                                        }
                                                                                    }
                                                                                }
                                                                            }
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

  return($err,$rows)
}

######################################################################################
#  Function: delete_from_table()
#
#  Description: delete from specified table.
#

sub delete_from_table
  {
    my ($dbh,$table) = @_;
    my ($err);

    if(!$dbh->do("DELETE FROM $table"))
      {
        $err = new Error(qq(Failed to DELETE FROM table: $table\n));
      }


    return($err);
  }

#######################################################################################
#  Function: callExecProgram()
#
#  Description: Call Executable Program.  This routine uses a system call to run the
#  geocode.pl program.
#

sub callExecProgram
  {
    my $err;

    my $result = system($program);

    if($result)
      {
       $err = new Error(qq(Program $program exited with status $result\n));
     }
    return($err);
  }


#######################################################################################
#  Function: print_errs()
#
#  Description: Error printing function for command line debugging and/or cron mailing.              #

sub print_errs
{
    my $err = $_[0];

        my $msg = MIME::Lite->new(
         From    => $from,
         To      => $to,
         Cc      => $cc,
         Subject => $subject,
         Data => $err . "\n\r" . "Run manually on TH-GIS. \n\r\t ex: C:\\>Perl64\\bin\\perl.exe C:\\Perl64\\eg\\updateDB.pl"
    );

    $log->info($err);

   MIME::Lite -> send ('smtp','10.10.1.100' );

   $msg -> send;

}

#######################################################################################
#  Function: main()
#
#  Description: main program to control program flow.
#

sub main
{
  my ($err,$dbh,$rows);

  Log::Log4perl->init("log.conf");
  $log = Log::Log4perl->get_logger("DB");

  ($err,$rows) = updateTables();
#   ($err,$rows) = update_PC_PARCEL();
# ($err,$dbh) = connectToSQLServer($GOVDSN,$govuser,$govpass);

  if (defined($err) && $err->hasError())
    {
      $err->push (qq(pushed after "updateTables()"));
    }
  else
    {
      $err = callExecProgram();
    }

  if (defined($err) && $err->hasError())
    {
       $err->apply(\&print_errs);
     }
  else
    {
        $log->info("Run completed with no errors...");
    }
}

&main();
