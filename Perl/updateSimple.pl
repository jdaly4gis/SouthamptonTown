#!/usr/bin/perl -w


use XMLRPC::Lite;
use URI::Escape;
use Data::Dumper;
use DBI;
use DBD::ODBC;
use strict;
use Error;
use warnings;

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
my $program = "C://Perl/bin/perl.exe C://Perl/eg/govtask.pl";

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
               PrintError => 1,
               RaiseError => 1
              );

    my $dbh = DBI->connect("dbi:ODBC:$DSN",$user,$pass, \%attr);

    if(!defined($dbh))
      {
        $err = new Error(qq(SQL Connect: $DBI::errstr\n));
      }

    return($err,$dbh);
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

  print "Updating MA_LAND\n";
#  $err = update_MA_LAND();

  if (defined($err) && $err->hasError())
    {
      $err = new Error(qq(Failed to UPDATE MA_LAND\n));
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
        last;
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

    print $err;
    open(LOG,">>C:\LogFiles\UpdateLog.dat");
    print LOG $_;
}

#######################################################################################
#  Function: main()
#
#  Description: main program to control program flow.
#

sub main
{
  my ($err,$dbh,$rows);

  ($err,$rows) = updateTables();

  if (defined($err) && $err->hasError())
    {
      $err->push (qq(pushed after "updateTables()"));
    }
  else
    {
#      $err = callExecProgram();
    }

  if (defined($err) && $err->hasError())
    {
      $err->apply(\&print_errs);
    }
  else
    {
#      print "Task finished\n";
    }
}

&main();
