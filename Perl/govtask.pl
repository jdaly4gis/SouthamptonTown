
#!/usr/bin/perl -w


use XMLRPC::Lite;
use URI::Escape;
use Data::Dumper;
use DBI;
use DBD::ODBC;
use strict;
use Error;
use warnings;
use Switch;


my $PSDSN  = "";
my $psuser = "";
my $pspass = "";

my @tables = ('');

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
#  Function: insert_EXPORT
#
#  Description: Insert all rows into the EXPORT table.
#
#

sub insert_EXPORT
{
  my ($dbh,$rows) = @_;
  my ($err, $temp);

  for (@$rows)
    {
      my $inline = '';
      foreach my $col(@$_)
        {
          defined($col)? $inline .= $col: $inline .= "";
          $inline .= ",";
        }
      chop ($inline);

      #print $inline . "\n";

      my $insert_handle = $dbh->prepare_cached('INSERT INTO EXPORT VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)');


      if (!defined(@$_[1]))
        {
          $temp = "000000 000.000-00000-000.000";
        }
      else
        {
          $temp = @$_[1];
        }

      my $dsbl = generateDSBL($temp);


      if(!$insert_handle->execute(@$_[0],@$_[1],@$_[2],$dsbl,@$_[3],@$_[4],@$_[5],@$_[6],@$_[7],@$_[8],@$_[9],@$_[10],@$_[11]))
        {
	  if(defined($err) && $err->hasError())
	    {
	      $err->push (qq(Duplicate Parcel: @$_[0]));
	    }
	  else
	    {
	      $err = new Error(qq(Duplicate Parcel ID: @$_[0]));
	    }
        }
    }
      return($err);
}


#######################################################################################
#  Function: generateDSBL()
#
#  Description: Generate a DSBL number from the Tax Map
#

sub generateDSBL
  {
    my $taxmap = $_[0];

    my $distpart = '';


    my ($district,$remainder, $ext) = split('\s+', $taxmap);

    switch($district)
      {
        case "472403" {$distpart = '0302'}
        case "473689" {$distpart = '0900'}
        case "473601" {$distpart = '0901'}
        case "473603" {$distpart = '0902'}
        case "473609" {$distpart = '0903'}
        case "473605" {$distpart = '0904'}
        case "473607" {$distpart = '0905'}
        case "473613" {$distpart = '0907'}
        case "473615" {$distpart = '0908'}
        case "000000" {$distpart = '0000'}
      }

    my($section,$block,$lot) = split('-', $remainder);
    $block = $block % 10000;
    $section = splitSection($section);
    $lot = splitLot($lot);

    my $dsbl = join(' - ', $distpart, $section, $block, $lot);
    if (defined($ext))
      {
        $dsbl .= " " . $ext;
      }

    return($dsbl);
  }

#######################################################################################
#  Function: splitLot
#
#  Description: Split the lot portions of the Tax Map number and convert
#  into DSBL format

sub splitLot
    {

      my $temp = $_[0];
      my $retarg = "";


      my ($left, $right) = split('\.',$temp);

      eval
        {
          $left  = $left  % 1000;
          $right = $right % 1000;
         };

       if ($@)
         {
           print "Error thrown while splitting lot number.\nLeft:$left\tRight:$right\n";
        }
      else
        {
          $retarg = $left . "." . $right;

          if ($right == 0)
            {
              $retarg = $left;
            }
        }
     return($retarg);
    }

#######################################################################################
#  Function: splitSection
#
#  Description: Split the section portion of the Tax Map number and convert
#  into DSBL format

sub splitSection
  {
    my $temp = $_[0];

    my ($left, $right) = split('\.',$temp);

    $left  = $left  % 1000;
    $right  = $right  % 1000;

    my $retarg  = $left;

    if ($right > 0)
      {
        while($right =~ m/^(.*)0$/)
              {
                $right = $1;
              }

        $retarg .= "." . $right;
      }

    return($retarg);

  }

#######################################################################################
#  Function: select_GOV_DB
#
#  Description: Select from different Govern tables in the Proliant DB, using joins.
#

sub select_GOV_DB
{
  my ($dbh) = $_[0];
  my ($err,$rows);
  my ($insert_handle);

  $rows = $dbh->selectall_arrayref('SELECT     TOP (100) PERCENT dbo.PC_PARCEL.P_ID, dbo.PC_PARCEL.TAX_MAP, dbo.PC_PARCEL.TAX_MAP_UFMT, dbo.PC_PARCEL.INACTIVE_YEAR, 
                      MAX(dbo.NA_NAMES.FIRST_NAME) AS FIRST, MAX(dbo.NA_NAMES.MID_INITIAL) AS MID, MAX(dbo.NA_NAMES.LAST_NAME) AS LAST, 
                      MAX(dbo.NA_NAMES.COMPANY) AS COMPANY, dbo.PC_LEGAL_INFO.CLASS, dbo.PC_LEGAL_INFO.ROLL_SECTION, dbo.PC_ADDRESS.FORMATED_ADDRESS, 
                      dbo.PC_ADDRESS.CITY, dbo.PC_OWNER.SEQ_PRIORITY
FROM         dbo.PC_OWNER LEFT OUTER JOIN
                      dbo.NA_NAMES ON dbo.PC_OWNER.NA_ID = dbo.NA_NAMES.NA_ID RIGHT OUTER JOIN
                      dbo.PC_PARCEL LEFT OUTER JOIN
                      dbo.PC_ADDRESS ON dbo.PC_PARCEL.P_ID = dbo.PC_ADDRESS.P_ID LEFT OUTER JOIN
                      dbo._YEAR_PC INNER JOIN
                      dbo.PC_LEGAL_INFO ON dbo._YEAR_PC.CURRENT_FY = dbo.PC_LEGAL_INFO.YEAR_ID ON dbo.PC_PARCEL.P_ID = dbo.PC_LEGAL_INFO.P_ID ON 
                      dbo.PC_OWNER.P_ID = dbo.PC_PARCEL.P_ID
WHERE     (NOT (dbo.PC_PARCEL.TAX_MAP LIKE \'472403%\')) AND (dbo.PC_PARCEL.INACTIVE_YEAR = 9999) AND (dbo.PC_OWNER.STATUS = \'o\') AND 
                      (dbo.PC_OWNER.SEQ_PRIORITY IS NULL) OR
                      (dbo.PC_OWNER.SEQ_PRIORITY = 1)
GROUP BY dbo.PC_PARCEL.P_ID, dbo.PC_PARCEL.TAX_MAP, dbo.PC_ADDRESS.FORMATED_ADDRESS, dbo.PC_ADDRESS.CITY, dbo.PC_LEGAL_INFO.CLASS, 
                      dbo.PC_PARCEL.INACTIVE_YEAR, dbo.PC_LEGAL_INFO.ROLL_SECTION, dbo.PC_OWNER.SEQ_PRIORITY, dbo.PC_PARCEL.TAX_MAP_UFMT, 
                      dbo._YEAR_PC.CURRENT_FY, dbo.PC_LEGAL_INFO.FROZEN_ID
HAVING      (dbo.PC_LEGAL_INFO.FROZEN_ID = 0)
ORDER BY dbo.PC_PARCEL.P_ID');


  if(!defined($rows))
    {
      $err = new Error(qq(Rows not defined: no rows returned from SELECT query\n));
    }

#print Dumper($rows);exit;
  undef($dbh);

  return($err,$rows)
}

sub delete_from_tables
  {
    my ($dbh) = $_[0];
    my ($err);

    for my $table (@tables)
      {
        if(!$dbh->do("DELETE FROM $table"))
          {
              $err = new Error(qq(Failed to DELETE FROM table: $table\n));
              last;
          }
      }

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
#  Function: main()
#
#  Description: main program to control program flow.
#  

sub main
{
  my ($err,$dbh,$rows);

  ($err,$dbh) = connectToSQLServer($PSDSN,$psuser,$pspass);

  if (defined($err) && $err->hasError())
    {
      $err->push (qq(pushed after "connectToSQLServer()"));
    }
  else
    {
      ($err,$rows) = select_GOV_DB($dbh);
      if (defined($err) && $err->hasError())
        {
          $err->push (qq(pushed after "select_GOV_DB()"));
        }
      else
        {

          ($err) = delete_from_tables($dbh);
          if (defined($err) && $err->hasError())
            {
              $err->push (qq(Unable to Delete From tables on TH-GIS));
            }
          else
            {
              ($err) = insert_EXPORT($dbh,$rows);
              if (defined($err) && $err->hasError())
                {
                  $err->push (qq(pushed after "insert_EXPORT"));
                }
            }
        }
    }
     if (defined($err) && $err->hasError())
     {
         $err->apply(\&print_errs);
     }
}

&main();
