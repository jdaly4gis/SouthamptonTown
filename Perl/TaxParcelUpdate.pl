#!/usr/bin/perl -w


use XMLRPC::Lite;
use URI::Escape;
use Data::Dumper;
use DBI;
use DBD::ODBC;
use strict;
use Error;
use warnings;
use MIME::Lite;
use Switch;

my $GOVDSN  = "";
my $govuser = "";
my $govpass = "";

my $VECTORDSN  = "";
my $vectoruser = "";
my $vectorpass = "";

my $from = "";
my $to   = "";
my $cc   = "";
my $subject = 'SDE Tax Parcel Update Status: ';

my $program = "";


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
       $err = new Error(qq(Program $program exited with status: $result));
     }
    return($err);
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
               RaiseError => 0
              );

    my $dbh = DBI->connect("dbi:ODBC:$DSN",$user,$pass, \%attr);

    if(!defined($dbh))
      {
        $err = new Error(qq(SQL Connect: $DBI::errstr\n));
      }

    return($err,$dbh);
  }

#######################################################################################
#  Function: updateTaxParcels   
#
#  Description: Update the Tax Parcel table in the VECTOR SDE
#
#

sub updateTaxParcels
{
  my ($rows) = @_;
  my ($err, $dbh);


  my $count = 1;
  my $updated = 0;
  my @failures = ();

  ($err,$dbh) = connectToSQLServer($VECTORDSN,$vectoruser,$vectorpass);
  if(!defined($dbh))
    {
      $err = new Error(qq(SQL Connect: $DBI::errstr\n));
    }
  else
    {
      for (@$rows)
	{
	  my $p_id = $_->[0];
	  my $taxmap = $_->[1];
	  my $taxmap_ufmt  = $_->[2];
	  my $dsbl  = $_->[3];
	  my $inactive_year  = $_->[4];
	  my $first_name  = defined($_->[5])? $_->[5] : "";
	  my $mid_initial  = defined($_->[6])? $_->[6] : "";
	  my $last_name  = defined($_->[7])? $_->[7] : "";
	  my $company  = defined($_->[8])? $_->[8] : "";
	  my $class  = defined($_->[9])? $_->[9] : "";
	  my $roll_section  = defined($_->[10])? $_->[10] : "";
	  my $formatted_address  = defined($_->[11])? $_->[11] : "";
	  my $city  = defined($_->[12])? $_->[12] : "";

	  my $sql = "UPDATE SDEadmin.TAX_PARCELS SET TAXMAP = ?, GV_TAXMAP = ?, DSBL = ?, FLAG = ?, FIRST_NAME= ?, M_INITIAL = ?, LAST_NAME = ?, COMPANY = ?, PROP_TYPE = ?, ROLL_SECT = ?, ADDRESS = ?, HAMLET = ? WHERE PARCEL_ID = ?";
	  my $rv = $dbh->do($sql, undef, $taxmap_ufmt, $taxmap, $dsbl, $inactive_year, $first_name, $mid_initial, $last_name, $company, $class,  $roll_section, $formatted_address, $city, $p_id);

	  if ($count %1000 == 0)
	    {
	      print "Records processed: $count\n";
	    }

	  if($rv == 1)
	    {
	      $updated++;
	    }
	  else
	    {
	      my $outrec = join(' => ' , $dsbl, $p_id);
	      push(@failures, $outrec);
	    }
	  $count++;	    
	}


    }

   my $status = "$updated of [$count] records were updated\n";

   my $flines = join("\n",sort(@failures));
     
   undef($dbh);

   return($err,$status,$flines);
}


#######################################################################################
#  Function: createExportStruct
#
#  Description: Creates a data structure for the EXPORT table
#

sub createExportStruct
{
  my ($dbh) = $_[0];
  my ($err,$rows);
  my ($insert_handle);

  $rows = $dbh->selectall_arrayref('SELECT P_ID,TAX_MAP,TAX_MAP_UFMT,DSBL,INACTIVE_YEAR,FIRST_NAME,MID_INITIAL,LAST_NAME,COMPANY,CLASS,ROLL_SECTION,FORMATED_ADDRESS,CITY FROM EXPORT'); 


  if(!defined($rows))
    {
      $err = new Error(qq(Rows not defined: no rows returned from SELECT query\n));
    }

  #print Dumper($rows);exit;
  undef($dbh);

  return($err,$rows)
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
	my ($report,$failures) = @_;

	$report .= "\nResults of updating Tax Parcels shown below:\n============================================\n" . $failures;

        my $msg = MIME::Lite->new(
         From    => $from,
         To      => $to,
         Cc      => $cc,	  
         Subject => $subject . getDate(),
         Data => $report
	 );


	MIME::Lite -> send ('smtp','xx.xx.xx.xx');
	$msg -> send;

	return($err);
  }

#######################################################################################
#  Function: print_errs()
#
#  Description: Error printing function for command line debugging and/or cron mailing.              

sub print_errs
{
    my $err = $_[0];
    print $_;
}

#######################################################################################
#  Function: get_local_time()
#
#  Description: Returns local time as formatted string of H:M:S

sub get_local_time
{
  my ($sec,$min,$hour,$mday,$mon,$year,$wday,$yday,$isdst) = localtime();
  my $fstring = join(':', $hour,$min,$sec);

  return($fstring);
}



#######################################################################################
#  Function: main()
#
#  Description: main program to control program flow.
#  

sub main
{
  my ($err,$dbh,$rows,$status,$failures);
  my ($start,$end);

  $start = get_local_time();

  ($err,$dbh) = callExecProgram();
  if (defined($err) && $err->hasError())
    {
      $err->push (qq(pushed after "connectToSQLServer()"));
    }
  else
    {
      ($err,$dbh) = connectToSQLServer($GOVDSN,$govuser,$govpass);
      if (defined($err) && $err->hasError())
	{
	  $err->push (qq(pushed after "connectToSQLServer()"));
	}
      else
	{
	  ($err,$rows) = createExportStruct($dbh);
	  if (defined($err) && $err->hasError())
	    {
	      $err->push (qq(pushed after "createExportStruct()"));
	    }
	  else
	    {
	      ($err,$status,$failures) = updateTaxParcels($rows);
	      
	      $end = get_local_time();
	      $status .= "Start: $start => Finish: $end\n";
	      
	      if (defined($err) && $err->hasError())
		{
		  $err->push (qq(pushed after "updateTaxParcels"));
		}
	      else
		{
		  ($err) = sendLogs($status,$failures)
		}
	    }
        }
    }

  if (defined($err) && $err->hasError())
    {
      my @errors = (@{$err->{'errors'}});
      my $errs = join(', ',@errors);
      sendLogs($status,$errs)
#      $err->apply(\&print_errs);
    }
  
}

&main();
