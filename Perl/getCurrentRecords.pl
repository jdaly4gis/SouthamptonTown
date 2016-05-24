#!/usr/bin/perl -w

use strict;
use URI::Escape; 
use Data::Dumper; 
use DBI; 
use DBD::ODBC; 
use Error; 
use warnings; 
use MIME::Lite; 
use feature qw(switch); 
use List::Util 'max';


my $from = 'reporter@southamptontownny.gov';
my $to   = 'tcoady@southamptontownny.gov';
my $cc   = 'jdaly@southamptontownny.gov';
my $subject = 'Record Update Report: ';
my $apath = 'C:\Temp\AccelaChanges.accdb';

my $DSN  = "Govern_64";
my $user = "webdb";
my $pass = "wgov021";


#######################################################################################
#  Function: connectToAccessDB()
#
#  Description: Connect to AccessDB.  


sub connectToAccessDB
  {
    my ($err);
    my $path = $_[0];

    my $dbh = DBI->connect('dbi:ODBC:driver=Microsoft Access Driver (*.mdb, *.accdb);dbq=' . $apath);

    if(!defined($dbh))
      {
        $err = new Error(qq(SQL Connect: $DBI::errstr\n));
      }

    return($err,$dbh);
  }



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
#  Function: getDate()
#
#  Description: gets date formatted to error log specifications (yyyy-mm-dd)

sub getDate
      {
	 my ($sec,$min,$hour,$mday,$mon,$year,$wday,$yday,$isdst) = localtime(time);
	 $year += 1900;
	 $mon = sprintf("%02d", $mon + 1);
	 $mday = sprintf("%02d", $mday);

	 my $date = join('-', $year, $mon, $mday);

	 return ($date);
     }


#######################################################################################
#  Function: sendLogs()
#
#  Description: sends contents of report to recipient(s).

sub sendLogs
  {     
	my $err;

	my $report = $_[0];     

        my $msg = MIME::Lite->new(
         From    => $from,
         To      => $to,
         Cc      => $cc,	  
         Subject => $subject . getDate(),
         Data => $report
	 );


	MIME::Lite -> send ('smtp','10.10.1.100');
	$msg -> send;

	return($err);
  }

#######################################################################################
#  Function: print_errs()
#
#  Description: Error printing function for command line debugging and/or cron mailing.              

sub print_errs
{
}

#######################################################################################
#  Function: insertAccessDB()
#
#  Description: insert records into Access Database

sub insertAccessDB
  {
    my ($err);
    my ($rows,$table,$accdb) = @_;
    my @fields;
    my $fieldlist;
    my $field_placeholders;
    my $insert_query;      
    my $sth;

    $table = 'dbo_' . $table;  #Access requires the dbo_ prefix
    
   foreach my $key (sort(keys %$rows)) 
     {
       my $v = [];
       my $k = [];

	while(my ($ikey,$val) = each ($rows->{$key}))
	  {
	    push($v, $val);
	    push($k, $ikey);
	  }

       $fieldlist = join(", ", @$k);

       $field_placeholders = join(", ", map {'?'} @$k);
       $insert_query = qq{INSERT INTO $table ( $fieldlist )VALUES ( $field_placeholders )};

       $sth= $accdb->prepare( $insert_query );
       $sth->execute(@$v);
    }

    return($err);
  }

#######################################################################################
#  Function: getNewRecords()
#
#  Description: Retrieves records from PC_PARCEL which are date stamped greater thatn
#  the previous day

sub getNewRecords
    {
      my ($err,$dbh,$accdb) = @_;
      my (@records);
      my $report = '';

      my %htables = ('NA_NAMES' => 'NA_ID','PC_PARCEL' => 'P_ID','PC_OWNER' => 'P_ID','PC_AREA' =>'P_ID','PC_ADDRESS' => 'P_ID','PC_MESSAGE' => 'P_ID');

      while(my ($table, $pkey) = each(%htables))
	{
	  @records = ();

	  my $sql =  "SELECT * FROM $table  WHERE LAST_MODIF_DATE > CURRENT_TIMESTAMP -1";
	  #Following case for PC_AREA only
	  $sql = "SELECT * FROM $table  WHERE LAST_MODIF_DATE > CURRENT_TIMESTAMP -1 AND YEAR_ID = YEAR(GETDATE()) + 1 AND  FROZEN_ID = 1" if $table eq "PC_AREA";

	  my $rows = $dbh->selectall_hashref($sql,$pkey);

	  if(scalar(keys $rows))
	    {
	      ($err) = insertAccessDB($rows,$table,$accdb);

	      foreach my $key (sort(keys %$rows)) {
		my $i = 0;
		my @keyvals = ();
		my $inline = '';

		while(my ($ikey,$val) = each ($rows->{$key}))
		  {
		    next if not defined($val);
		    next if $ikey eq 'MS_SQL_TS';
		    next if $ikey eq 'NOTES';
		    next if $ikey eq 'PCT_OWNERSHIP';

		    push(@keyvals, "$ikey => $val");
		    last if $i > 1;
                    $i++
		  }
		$inline = join(",",@keyvals);		
		push(@records,"$key: $inline");
	      }
	    }
	  else
	    {
	      push(@records, "No new records have been added for table $table");
	    }
	  my $heading = "\n\nReport for table '" . $table . "'" . 
	    "\n__________________________________________________________________________________________________________\n\n";
	  my $block = $heading . join("\n", @records);

	  $report .= $block
	    
	}
      return($err, $report);
    }

#######################################################################################
#  Function: main()
#
#  Description: Contains program flow control
#  

sub main
{
  my ($records,$report);

  my ($err,$accdb) = connectToAccessDB($apath);
  if (defined($err) && $err->hasError())
    {
      $err->push (qq(Unable to connect to Access Database));
    }
  else
    {
      my ($err,$dbh) = connectToSQLServer($DSN,$user,$pass);

      if (defined($err) && $err->hasError())
	{
	  $err->push (qq(Unable to connect to SQL Server));
	}
      else
	{
	  ($err, $records) = getNewRecords($err, $dbh, $accdb);
	  if (defined($err) && $err->hasError())
	    { 
	      $err->push (qq(Unable to retrieve record set));
	    }
	  else
	    {
	      ($err, $report) = sendLogs($records);
	    }
	}
    }

  if (defined($err) && $err->hasError())
    {
      $err->apply(\&print_errs);
    }
}

&main();
