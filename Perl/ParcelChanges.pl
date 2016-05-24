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
use utf8;

my $GOVDSN  = "ProfessionalServices";
my $govuser = "SDEadmin";
my $govpass = "SDEadmin";

my $VECTORDSN  = "VECTOR";
my $vectoruser = "SDEadmin";
my $vectorpass = "SDEadmin";

my $from = 'reporter@southamptontownny.gov';
my $to   = 'mbaldwin@southamptontownny.gov';
#my $to   = 'jdaly@southamptontownny.gov';
my $cc   = 'jdaly@southamptontownny.gov';
my $subject = 'Tax Parcel Geometry Changes: ';


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
#  Function: Get Parcel Changes
#
#  Description: Compare Vector and Gov_DB Tax Parcels table
#
#

sub GetParcelChanges
{
  my $rows = $_[0];

  my ($err, $dbh);
  my $count = 1;
  my $flines = '';
  my $changed = 0;
  my $updated = 0;
  my @changes = ();
  my @additions = ();
  my $trows;

  ($err,$dbh) = connectToSQLServer($GOVDSN,$govuser,$govpass);
  if(!defined($dbh))
    {
      $err = new Error(qq(SQL Connect: $DBI::errstr\n));  
    }
  else
    {
      $trows = $dbh->selectall_hashref("SELECT  PARCEL_ID, TAXMAP, DSBL, X_COORD, Y_COORD, AREA FROM TAX_PARCEL_CHANGES WHERE DSBL NOT LIKE '302%'",'PARCEL_ID'); 

      if(!defined($trows))
	{
	  $err = new Error(qq(Rows not defined: no rows returned from SELECT query\n));
	}
      else
	{
	  while(my($k,$v) = each %$rows)
	    {
	      my $temp = '';
	      if(defined($trows->{$k}))
		{
		 if(($trows->{$k}->{'X_COORD'} != $rows->{$k}->{'X_COORD'} || $trows->{$k}->{'Y_COORD'} != $rows->{$k}->{'Y_COORD'}) || $trows->{$k}->{'AREA'} != $rows->{$k}->{'AREA'})
		   {
		     if(defined($trows->{$k}->{'AREA'}))
		       {
			 my $sql = "UPDATE TAX_PARCEL_CHANGES SET TAXMAP = ?, DSBL = ?, X_COORD = ?, Y_COORD = ?, AREA = ? WHERE PARCEL_ID = ?";
			 my $rv = $dbh->do($sql, undef, $rows->{$k}->{'TAXMAP'}, $rows->{$k}->{'DSBL'},$rows->{$k}->{'X_COORD'},$rows->{$k}->{'Y_COORD'},$rows->{$k}->{'AREA'},$rows->{$k}->{'PARCEL_ID'});

			 if($rv == 1)
			   {
			     $temp .= "The following record was updated in the TAX_PARCEL_CHANGES table:\r\n";
			   }
			 else
			   {
			     $temp .= "No changes were enetered in the TAX_PARCEL_CHANGES table\n";
			   }

			 $temp .=  "PID: $rows->{$k}->{'PARCEL_ID'} => $trows->{$k}->{'PARCEL_ID'} \n";
			 $temp .=  "TAXMAP: $rows->{$k}->{'TAXMAP'} => $trows->{$k}->{'TAXMAP'} \n";
			 $temp .=  "DSBL: $rows->{$k}->{'DSBL'} => $trows->{$k}->{'DSBL'} \n";
			 $temp .=  "X_COORD: $rows->{$k}->{'X_COORD'} => $trows->{$k}->{'X_COORD'} \n";
			 $temp .=  "Y_COORD: $rows->{$k}->{'Y_COORD'} => $trows->{$k}->{'Y_COORD'} \n";
			 $temp .=  "AREA: $rows->{$k}->{'AREA'} => $trows->{$k}->{'AREA'} \n";
			 $temp .=  "\n";
			 push (@changes,$temp);


			 $changed++;
			 #print $temp . "\n";
		       }
		   }
	       }
	      else
		{
		  #if PID is not defined in the parcel changes hash, then a new record has to be inserted into that table
		  my $insert_handle = $dbh->prepare_cached('INSERT INTO TAX_PARCEL_CHANGES VALUES(?,?,?,?,?,?)');
		  my $result = $insert_handle->execute($rows->{$k}->{'PARCEL_ID'}, $rows->{$k}->{'TAXMAP'},$rows->{$k}->{'DSBL'},$rows->{$k}->{'X_COORD'},$rows->{$k}->{'X_COORD'},$rows->{$k}->{'AREA'});
		  if ($result == 1)
		    {
		      $temp .=  "Record Added for VECTOR.SdeAdmin Parcel ID: " . $rows->{$k}->{'PARCEL_ID'};
		      $temp .= "\n";
		      push (@additions,$temp);
		   }
		}
	    }
	}
    }

  my $status = "[$changed] parcel boundaries were updated\n";

  if ($changed != 0)
    {
      push(@changes, @additions);
      $flines = join("\n",sort(@changes));
    }
  else
    {
      $flines = "No parcels were updated since last run\n\n";
    }
   undef($dbh);

   return($err,$status,$flines);
}


#######################################################################################
#  Function: createExportStruct
#
#  Description: Creates a data structure for the EXPORT table  
#

sub createTaxParcelStruct
{
  my ($dbh) = $_[0];
  my ($err,$rows);
  my ($insert_handle);

  $rows = $dbh->selectall_hashref("SELECT PARCEL_ID, TAXMAP, DSBL, X_COORD, Y_COORD, AREA, SHAPE.STAsText() AS SHAPE FROM SDEadmin.Tax_Parcels_VW WHERE DSBL NOT LIKE '302%'",'PARCEL_ID'); 

  if(!defined($rows))
    {
      $err = new Error(qq(Rows not defined: no rows returned from SELECT query\n));
    }

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
#  Function: mailResults()
#
#  Description: sends contents of report to recipient(s).

sub mailResults
  {     
	my ($report,$results) = @_;
	my $err;

	$report .= "\nResults of updating Tax Parcels shown below:\n============================================\n" . $results;

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
  my ($err,$dbh,$rows,$status,$results);
  my ($start,$end);

  $start = get_local_time();

  if (defined($err) && $err->hasError())
    {
      $err->push (qq(pushed after "connectToSQLServer()"));
    }
  else
    {
      ($err,$dbh) = connectToSQLServer($VECTORDSN,$vectoruser,$vectorpass);
      if (defined($err) && $err->hasError())
	{
	  $err->push (qq(pushed after "connectToSQLServer()"));
	}
      else
	{
	  ($err,$rows) = createTaxParcelStruct($dbh);
	  if (defined($err) && $err->hasError())
	    {
	      $err->push (qq(pushed after "createTaxParcelStruct()"));
	    }
	  else
	    {
	      ($err,$status,$results) = GetParcelChanges($rows);
	      $end = get_local_time();

	      $status .= "Start: $start => Finish: $end\n";
	      if (defined($err) && $err->hasError())
		{
		  $err->push (qq(pushed after "updateTaxParcels"));
		}
	      else
		{
		  ($err) = mailResults($status,$results)
		}
	    }
        }
    }

  if (defined($err) && $err->hasError())
    {
      my @errors = (@{$err->{'errors'}});
      my $errs = join(', ',@errors);
      mailResults($status,$errs)
#      $err->apply(\&print_errs);
    }
  
}

&main();
