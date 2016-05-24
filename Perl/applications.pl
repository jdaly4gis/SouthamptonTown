#!/usr/bin/perl -w


use URI::Escape;
use Data::Dumper;
use DBI;
use DBD::ODBC;
use strict;
use Error;
use warnings;
use MIME::Lite;
use List::MoreUtils qw(pairwise);


my $GOVDSN  = "";
my $govuser = "";
my $govpass = "";

my $VECTORDSN  = "";
my $vectoruser = "";
my $vectorpass = "";

my $from = "";
my $to   = "";
my $cc   = "";
my $subject = 'Application Query: ';



my $program = "C:\\UpdateFeatureClass/UpdateFeatureClass.exe";


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

    my $dbh = DBI->connect("dbi:ODBC:$DSN",$govuser,$govpass, \%attr);

    if(!defined($dbh))
      {
        $err = new Error(qq(SQL Connect: $DBI::errstr\n));
      }

    return($err,$dbh);
  }


#######################################################################################
#  Function: createMailingStruct
#
#  Description: Creates a data structure for mailing to recipient
#

sub createMailingStruct
{
  my ($dbh) = $_[0];
  my ($err,$rows);
  my ($insert_handle);

  $rows = $dbh->selectall_arrayref("SELECT  PM_APPLICATION, PM_TYPE, COMPLETION_DATE, TAX_MAP, PC_PARCEL.P_ID from PM_MASTER, PM_ACTIVITY_STATUS, PC_LK_PARCEL_PM, PC_PARCEL
                                     WHERE PM_MASTER.PM_ID = PM_ACTIVITY_STATUS.KEY_ID 
                                     AND PM_MASTER.PM_ID = PC_LK_PARCEL_PM.KEY_ID 
                                     AND PC_LK_PARCEL_PM.P_ID = PC_PARCEL.P_ID
                                     AND PC_LK_PARCEL_PM.DEPT = \'05\' and PM_MASTER.PM_TYPE = \'eCONB\'
                                     AND PM_ACTIVITY_STATUS.DATE_STARTED >= \'1/1/2016\'
                                     AND PM_ACTIVITY_STATUS.STEP_NO = \'20\'
                                     ORDER by COMPLETION_DATE ASC", {Slice =>{}});
  


  my $firstrow = 0;

  my $r2 = [];
  my $header = [];

  foreach (@$rows)
  {
    my $temp = [];    

      foreach my $key(reverse sort keys  %$_)
	{
	  my $val = %$_{$key}; 
	  
	  if($firstrow == 0)  
	    {
	      push(@$header, $key);
	    }

	  push (@$temp, $val);
	}
    push (@$r2, $temp);
    
    $firstrow++;
  }

 if(!defined($rows))
   {
     $err = new Error(qq(Rows not defined: no rows returned from SELECT query\n));
    }

  undef($dbh);

  return($err,$r2,$header);
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



sub create_formatted_line
  {     
    my ($field, $length) = @_;
    my $formatted_line = '';

    $formatted_line = sprintf "%-*s\t\t", $length, $field;

    return($formatted_line);
  }

#######################################################################################
#  Function: sendLogs()
#
#  Description: sends contents of report to recipient(s).

sub sendLogs
  {     

	my $err;
	my ($time,$rows,$header) = @_;
	my $report;
	my @maxrowlengths;
	my $body = '';

	my @fieldlengths     = map{length($_) }@{$rows->[0]};
	my @firstrowlengths  = map{length($_) }@$header; 

	for (my $i = 0; $i < scalar(@fieldlengths); $i++ )  
	  {
	    if ($fieldlengths[$i] >= $firstrowlengths[$i]) 
	      {
		push(@maxrowlengths, $fieldlengths[$i]);
	      }
	    else
	      {
		push(@maxrowlengths, $firstrowlengths[$i]);
	      }
	  }

	unshift(@$rows, $header);


	foreach(@$rows) 
	  {
	    my $fline = '';
	    my $app = 	pairwise{$fline .= create_formatted_line($a,$b)}@$_, @maxrowlengths;
	    $app .= "\n";
	    $body .= $app;
	  }

	$report .= join("\n\n",$time,$body);

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
  my $fstring = sprintf("%02d:%02d:%02d", $hour,$min,$sec);
  
  return($fstring);
}



#######################################################################################
#  Function: main()
#
#  Description: main program to control program flow.
#  

sub main
{
  my ($err,$dbh,$rows,$runtime,$failures);
  my ($start,$end,$header);

  $start = get_local_time();

  if (defined($err) && $err->hasError())
    {
      $err->push (qq(pushed after "callExecProgram()"));
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
	  ($err,$rows,$header) = createMailingStruct($dbh);
	  if (defined($err) && $err->hasError())
	    {
	      $err->push (qq(pushed after "createExportStruct()"));
	    }
	}
    }

  $end = get_local_time();
  $runtime .= "Start: $start => Finish: $end\n";
  $err = sendLogs($runtime,$rows,$header);


  if (defined($err) && $err->hasError())
    {
      my @errors = (@{$err->{'errors'}});  print "End: $end\n";
      my $errs = join(', ',@errors);
      sendLogs($runtime,$errs)
#     $err->apply(\&print_errs);
    }
  
}

&main();
