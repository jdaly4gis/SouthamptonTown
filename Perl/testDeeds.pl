#!/usr/bin/perl -w

use strict;
use URI::Escape; 
use Data::Dumper; 
use DBI; 
use DBD::ODBC; 
use Error; 
use Time::Piece;
use warnings; 
use MIME::Lite; 
use Spreadsheet::ParseXLSX;
use feature qw/switch/;
use List::Util 'max';


my $from = 'reporter@southamptontownny.gov';
my $to   = 'jdaly@southamptontownny.gov';
my $cc   = 'jdaly@southamptontownny.gov';
#my $cc   = 'mbaldwin@southamptontownny.gov,ppobat@southamptontownny.gov';
my $subject = 'Record Update Report: ';
my $apath = 'C:\Temp\AccelaChanges.accdb';
my $xlsPath = 'C:\Temp\Deeds.xlsx';

my $DSN  = "Govern_64";
my $user = "webdb";
my $pass = "wgov021";

my $GOV = "GOV_DB";

my @colnames = ('DATE','LIBER','PAGE','TAXMAP','GRANTOR','GRANTOR_COMPANY','GRANTEE','GRANTEE_COMPANY','PROPERTYADDRESS','DEEDTYPE','CONSIDERATIONAMOUNT','TRANSAMOUNT','PROPCIVIC','PRO_PPRE_DIR','PROP_STREET','PROP_SUFFIX','PROP_POST_DIR','PROP_CITY','PROP_VILLAGE','PROP_ZIP','TXBILL_NAME','TXBILL_STR_CIVIC','TXBILL_STREET','TXBILL_STR_SUFFIX','TXBILL_CITY','TXBILL_STATE','TXBLL_ZIP','TXBLL_POSTAL_CODE','TXBLL_COUNTRY','NO_PRCLS','PRTL_PRC_CDE','PRT_4A','PRT_4B','PRT_4C','FRONT_FEET','DEPTH','H_FRONTAGE','H_DEPTH','PROP_USE','CONDOMINIUM','NEW_CONSTRUCTION','AGRICULTURAL','DISCLOSURE_NOTICE','SALE_CONTRACT_DATE','DATE_OF_SALE','FULL_SALE_PRICE','PER_PROP_VALUE','CONDITION_CODE','ASSESSMENT_YR','TOT_ASSMNT_VALUE','PROP_CLASS','S_DESCRIPTION','PROPERTY_CLASS','LAND_USE2','BUYER_ATTRNY_NAME','BUYER_ATTRNY_PHN','BUYER_NAME','BUYER_CIVIC','BUYER_ST_PRE_DIRECTION','BUYER_STR_NAME','BUYER_STR_SUFFIX','BUYER_STR_POST_DIR','BUYER_STR_UNIT','BUYER_TOWN','BUYER_VILLAGE','BUYER_STATE','BUYER_ZIP','BUYER_POSTAL_CODE','BUYER_COUNTRY');
my $duplicates = {};


#######################################################################################
#  Function: openExcelSpreadsheet()
#
#  Description: Opens the Excel spreadsheet pointed to by $xlsPath


sub openExcelSpreadsheet
  {
    my ($err,$xls);
    my $xlspath = $_[0];

    my $parser   = Spreadsheet::ParseXLSX->new;
    my $workbook = $parser->parse($xlspath);

    if(!defined($workbook))
      {
        $err = new Error(qq(Could not connect to Excel Spreadsheet file: $xlsPath\n));
      } 

    return($err,$workbook);
  }

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
#  Function: reformatTaxMap()
#
#  Description: Take the Tax Map # from county file and reformat it for a match in the
#  Govern database
#

sub reformatTaxMap
  {

    my $taxmap = $_[0];
    $taxmap = '0000-000.00-00.00-000.000' if $taxmap !~ /^\d{3}.*/;

    my $govdist = '';
    my($scdist, $sect, $block, $lot) = split('-', $taxmap);
    

    if($scdist eq "0302") {$govdist = "472403"}
    elsif ($scdist eq "0900") {$govdist = "473689"}
    elsif ($scdist eq "0901") {$govdist = "473601"}
    elsif ($scdist eq "0902") {$govdist = "473603"}
    elsif ($scdist eq "0903") {$govdist = "473609"}
    elsif ($scdist eq "0904") {$govdist = "473605"}
    elsif ($scdist eq "0905") {$govdist = "473607"}
    elsif ($scdist eq "0907") {$govdist = "473613"}
    elsif ($scdist eq "0908") {$govdist = "473615"}
    elsif ($scdist eq "0908") {$govdist = "473615"}
    else  {$govdist = "99999"}

    my ($lsect,$rsect) = split('\.', $sect);
    $rsect = sprintf("%03d", $rsect);
    $sect = join('.', $lsect,$rsect);

    $block = sprintf("%04d", $block);

    my $sbl = join("-", $sect, $block,$lot);
    my $formattedTaxMap = join(" ", $govdist,$sbl);

    return($formattedTaxMap);
  }




#######################################################################################
#  Function: createDBStruct()
#
#  Description: Create hash struct by looping through XSL file.


sub createDBStruct
  {
    my ($err,$db);
    my $workbook = $_[0];

    $db = {};
	
    for my $worksheet ( $workbook->worksheets() ) {

    my ( $row_min, $row_max ) = $worksheet->row_range();
    my ( $col_min, $col_max ) = $worksheet->col_range();

    for my $row ( $row_min .. $row_max ) {
      for my $col ( $col_min .. $col_max ) {

            my $cell = $worksheet->get_cell( $row, $col );
            next unless $cell;

	    if(!defined($db->{$row}->{'cols'}))
	      {
		$db->{$row}->{'cols'} = [];
	      }
	    push($db->{$row}->{'cols'}, $cell->value());
	  }

      $db->{$row}->{'transfer'} = 'Y';
      $db->{$row}->{'transferError'} = [];
      $db->{$row}->{'reformattedTaxMap'} = reformatTaxMap($db->{$row}->{'cols'}->[3]);


      my $liberPage = join('',$db->{$row}->{'cols'}->[1],$db->{$row}->{'cols'}->[2]);
      
      if(!defined($duplicates->{$liberPage}))
	{
	  $duplicates->{$liberPage} = {};
	  if(!defined($duplicates->{$liberPage}->{'isDuplicate'}))
	    {
	      $duplicates->{$liberPage}->{'isDuplicate'} = 'N';
	      $duplicates->{$liberPage}->{$db->{$row}->{'reformattedTaxMap'}} = '';
	    }
	}
      else
	{
	  my $temp = $db->{$row}->{'reformattedTaxMap'};

	  if(not exists $duplicates->{$liberPage}->{$temp})
	    {
	      $duplicates->{$liberPage}->{'isDuplicate'} = 'Y';
	    }
	}
    }
  }
    #print Dumper($db);
    return($err,$db);
  }

#######################################################################################
#  Function: doFunctions()
#
#  Description: Loop through $db hash and do functions


sub showReport
  {
    my $db = $_[0];
    my (@recordsPass,@recordsFail);
    my ($err,$dbh);
    my $report;
    my $fieldlist;

    ($err,$dbh) = connectToSQLServer($GOV,"","");

    while (my ($key, $value) = each($db)) 
      {
	next if $db->{$key}->{'reformattedTaxMap'} =~ /^9{4}.*/;

        $fieldlist = join(", ", @colnames);
	my $field_placeholders = join(", ", map {'?'} @{$db->{$key}->{'cols'}});
	#my $field_placeholders = join(", ", map {'?'} @{$db->{$key}->{'cols'}});
        my $insert_query = qq{INSERT INTO DEED_INTEGRATION ( $fieldlist )VALUES ( $field_placeholders )};
	#print $insert_query; exit;
        my $sth= $dbh->prepare( $insert_query );
	$sth->execute(@{$db->{$key}->{'cols'}});

	if ($db->{$key}->{'transfer'} eq 'Y')
	    {
	      push(@recordsPass, $db->{$key}->{'cols'}->[3] . "[" . $db->{$key}->{'cols'}->[10] . "]: met all conditions and is good to transfer");
	    }
	  else
	    {
	      push(@recordsFail, $db->{$key}->{'cols'}->[3] . "[" . $db->{$key}->{'cols'}->[10]  . "]: " . pop($db->{$key}->{'transferError'}));
	    }
      }


#   my $heading = "\n\nReport for Suffolk County Deeds file" .
#      "\n__________________________________________________________________________________________________________\n\n";
#    my $block = $heading . join("\n", @recordsPass) . "\n\n" . join("\n",@recordsFail);
    
#    $report .= $block;

      return($err,$report);
  }



#######################################################################################
#  Function: doFunctions()
#
#  Description: Loop through $db hash and do functions


sub doFunctions
  {
    my $db = $_[0];
    my ($transfer,$match,$tError);

    my ($err,$dbh) = connectToSQLServer($DSN,$user,$pass);

      if (defined($err) && $err->hasError())
	{
	  $err->push (qq(Unable to connect to SQL Server));
	}
      else
	{
	  my $p_id;
	  my $row = 0;
	  while (my ($key, $value) = each($db)) 
	    {
	     next if ($db->{$key}->{'reformattedTaxMap'} =~ /^9{4}.*/ );  # clear the sentinel

	     ############################################################################	     
	     #  Checking if file exists in Govern
	     ############################################################################	     
	     my $result = existsInGovern($dbh,$db->{$key}->{'reformattedTaxMap'});
	     if (scalar(@$result) == 0)
	       {
		 $db->{$key}->{'transfer'} = "N" ;
		 push($db->{$key}->{'transferError'},"File does not exist in Govern");
		 next;
	       }
	     else
	       {
		 $p_id = $result->[0]->[0];
	       }

	     ############################################################################	     
	     #  Checking for Greater Liber
	     ############################################################################	     
	     ($transfer,$tError) = greaterLiber($dbh,$p_id,$db->{$key}->{'cols'}->[1]);
	     if ($transfer == 2)
	       {
		 print "Transfer is 2\n";
		 $db->{$key}->{'transfer'} = "PT" ;
		 push($db->{$key}->{'transferError'},"File does not exist in Govern");
		 next;
	       }


	     ############################################################################	     
	     #  Checking if Deed from county is equal or Govern is more recent
	     ############################################################################	     
     	     ($transfer,$tError) = existingDeed($dbh,$db->{$key}->{'cols'}->[0],$db->{$key}->{'cols'}->[1]);
	     if ($transfer == 0)
	       {
		 $db->{$key}->{'transfer'} = "N";
		 push($db->{$key}->{'transferError'},$tError);
		 next;
	       }

	     ############################################################################	     	     
	     #  Check if Consideration Amount (Sale Price) equal to 0
	     ############################################################################	     
	     if ($db->{$key}->{'cols'}->[10] == 0)
	       {
		     print $db->{$key}->{'cols'}->[10] . "\n";
 		     $db->{$key}->{'transfer'} = "PT";
		     push($db->{$key}->{'transferError'}, "Consideration Amount is 0");
		     next;
	       }

	     $row++;

	    }

	  ############################################################################
	  undef($dbh);
	}

    return ($err,$db);
  }

#######################################################################################
#  Function: existsInGovern()
#
#  Function checks to see if parcel record from Suffolk County deeds file exists in Govern
#  match Tax_Map field in PC_Parcel (govern).

sub existsInGovern
    {
      my $status = 0;
      my ($dbh, $taxmap) = @_;

      my $sql = "SELECT * FROM dbo.PC_PARCEL  WHERE TAX_MAP = '$taxmap'";
      my $rows = $dbh->selectall_arrayref($sql);

      return($rows);
    }

#######################################################################################
#  Function: greaterLiber()
#
#  Function checks to see if Liber in Govern is later than provided by Suff co file
#  

sub greaterLiber
    {
      my $status = 0;
      my $message;
      my ($dbh, $p_id, $lpage) = @_;

      $lpage =~ m/(\d{5})$/;
      my $temp = $1;

       my $sql = "SELECT MAX(DEED_BOOK) 
                       FROM [govern].[dbo].[PC_LK_PARCEL_SALE], [govern].[dbo].[PC_DEEDS]
                 WHERE PC_LK_PARCEL_SALE.SALE_ID = PC_DEEDS.SALE_ID 
                 AND PC_LK_PARCEL_SALE.P_ID = $p_id";

      my $rows = $dbh->selectall_arrayref($sql);	

      for my $val (@$rows)
	{
	  next if not defined($val->[0]);
	  if ($val->[0] > $temp)
	    {
	      print $val->[0] . "\t" . $temp . "\n";
	      $message = "Liber and Page in Govern is greater [" . $val->[0] . "] than the value in County File [" . $temp . "]";
	      $status = 2;
	      last;
	    }
	}
      
      
      return($status,$message);
   } 

#######################################################################################
#  Function: locationVerification()
#
#  Description: gets date formatted to error log specifications (yyyy-mm-dd)
#

sub locationVerification
      {
	my ($dbh,$p_id,$strNum,$strPreDir,$strName,$strType,$strPostDir,$strCity,$strVillage) = @_;

	if ($strVillage !~ /^$/)
	  {
	    $strCity = $strVillage;
	  }

	# $fullStreetName is concatenation of fields from Suffolk County deeds file.

	my $fullStreetName = join(" ", $strNum,$strName,$strCity);
	$fullStreetName =~ s/  / /g;
	$fullStreetName =~ s/\s$//g;

	my $govAddress;

	my $sql = "SELECT UPPER(FORMATED_ADDRESS) FROM dbo.PC_ADDRESS  WHERE P_ID = $p_id";
	my $rows = $dbh->selectall_arrayref($sql);	

	for my $val (@$rows)
	  {
	    $govAddress = $val->[0];
	    $govAddress =~ s/\s(TPKE|LN|TRL|RD|HWY|ST|CT|AVE|DR|PATH|PL|LNDG)$//i;
	    $govAddress .= " " . $strCity;
	    last;
	  }

	my $transfer = 0;

	if ($govAddress =~ m/\Q$fullStreetName/) {$transfer = 1};

	return ($transfer);
      }


#######################################################################################
#  Function: existingDeed()
#
#  Description: Checks to see if deed matches both DEED_BOOK and exact deed date
#

sub existingDeed
	{
	  my ($dbh,$scDate,$scLiber) = @_;
	  my $rows;
	  my $tError;


	  my $transfer = 1;

	  $scLiber =~ m/(\d{5}$)/;
	  my $liberNum = $1;

	  my $sql = "SELECT DEED_BOOK, CONVERT(char(10),DEED_DATE,126) FROM dbo.PC_DEEDS  WHERE DEED_BOOK = '$liberNum'";

	  $rows = $dbh->selectall_arrayref($sql);	

	  for my $val (@$rows)
	  {
	    my $gtime = Time::Piece->strptime($val->[1], "%Y-%m-%d");
	    my $sctime = Time::Piece->strptime($scDate, "%m/%d/%Y");
	    my $diff = $sctime - $gtime;

	    if ($diff == 0)
	      {
		$tError = "Deed [$liberNum] exists with same Govern Date: " . $val->[1];
		$transfer = 0;
		last;
	      }
	    if ($diff < 0)
	      {
		$tError = "Deed [$liberNum] exists with later Govern Date: " . $val->[1] . " than Suffolk County date: " . $scDate;
		$transfer = 0;
		last;
	      }	    
	  }
	  
	  return ($transfer,$tError);
	}


#######################################################################################
#  Function: checkPropertyClass()
#
#  Description: Checks for status of Property Class between Suff co and Govern
#

sub checkPropertyClass
	{
	  my ($dbh,$p_id,$scPropClass) = @_;
	  my ($govClass,$roll_sect);
	  my ($transfer,$tError);

	  my $sql = "SELECT CLASS,ROLL_SECTION FROM dbo.PC_LEGAL_INFO  WHERE P_ID = $p_id";
	  my $rows = $dbh->selectall_arrayref($sql);	
	  for my $val (@$rows)
	  {
	    $govClass = $val->[0];
	    $roll_sect = $val->[1];
	    last;
	  }
	  
	  if ($roll_sect eq '8')
	    {
	      $tError = "Roll Section in Govern is 8";
	    }
	  elsif ($scPropClass =~ /^3.*/ && $govClass =~ /^2.*/)
	    {
      	      $tError = "Gov Class has property type (2xx) $govClass and SC file type is (3xx)$scPropClass";
	    }
	  elsif ($scPropClass =~ /^2.*/ && $govClass =~ /^3.*/)
	    {
      	      $tError = "Gov Class has property type (3xx) $govClass and SC file type is (2xx) $scPropClass";
	    }

	  return($transfer,$tError);
	}

#######################################################################################
#  Function: checkGrantorOwner()
#
#  Description: Checks for Grantor name match with owner names in Govern
#

sub checkGrantorOwner
	  {
	    my ($dbh,$p_id,$scGrantor) = @_;
	    my ($scSwapName);
	    my $sql ="SELECT dbo.PC_OWNER.P_ID, 
                            dbo.PC_OWNER.NA_ID, 
                            dbo.PC_OWNER.STATUS, 
                            dbo.NA_NAMES.NA_ID AS Expr1, 
                            UPPER(dbo.NA_NAMES.FIRST_NAME), 
                            UPPER(dbo.NA_NAMES.MID_INITIAL), 
                            UPPER(dbo.NA_NAMES.LAST_NAME), 
                            UPPER(dbo.NA_NAMES.COMPANY)
                    FROM dbo.PC_OWNER CROSS JOIN dbo.NA_NAMES
                    WHERE dbo.PC_OWNER.P_ID = $p_id
                           AND dbo.PC_OWNER.STATUS = 'o'
                           AND dbo.PC_OWNER.NA_ID = dbo.NA_NAMES.NA_ID";

	    my $rows = $dbh->selectall_arrayref($sql);

	    if ($scGrantor !~ m/^$/)
	      {
		$scGrantor =~ m/([A-Za-z]+)\s+([A-Za-z]+)(\s([A-Za-z]+))?/;
		$scSwapName = join(" ", $2,$1);
	      }
	    else
	      {
		$scSwapName = "";
	      }

	    my $match = 0;
	    for my $val (@$rows)
	      {	    
		my $company = defined($val->[7])?$val->[7]:""; 
		my $govName = defined($val->[4])?$val->[4]:"";
		$govName .= " " . $val->[6] if defined($val->[6]);
		if ($govName =~ m/\Q$scSwapName/) 
		  {
		    $match = 1;
		 }
		elsif ($govName =~ /^\d+/)
		  {
		    if ($govName =~ m/\Q$company/) 
		      {
			$match = 1;
		      }
		  }
	      }		
	    
	    return($match);
	  }

#######################################################################################
#  Function: checkMailingIndex()
#
#  Description: Checks mailing index in Govern has been updated with new Grantee/Owner,
#  and, if so, transfer is set to N.
#

sub checkMailingIndex
	  {
	    my ($dbh,$p_id,$grantee) = @_;
	    my ($tError);

	    my $sql = "SELECT dbo.PC_OWNER.P_ID,
                              dbo.PC_OWNER.NA_ID,
                              dbo.NA_NAMES.NA_ID AS Expr1,
                              dbo.NA_MAILING_INDEX.NA_ID AS Expr2,
                              UPPER(dbo.NA_NAMES.LAST_NAME),
                              UPPER(dbo.NA_NAMES.FIRST_NAME),
                              UPPER(dbo.NA_NAMES.MID_INITIAL),
                              UPPER(dbo.NA_NAMES.COMPANY),
                              dbo.NA_MAILING_INDEX.EMAIL_ADDRESS,
                              dbo.NA_MAILING_INDEX.SUB_SYSTEM,
                              dbo.NA_MAILING_INDEX.PRIMARY_INDEX,
                              dbo.NA_MAILING_INDEX.MAIL_TYPE
                        FROM
                              dbo.PC_OWNER CROSS JOIN
                              dbo.NA_NAMES CROSS JOIN
                              dbo.NA_MAILING_INDEX
                        WHERE  NA_MAILING_INDEX.SUB_SYSTEM ='RE'
                        AND    NA_MAILING_INDEX.PRIMARY_INDEX =-1
                        AND    NA_MAILING_INDEX.MAIL_TYPE = 'o'
                        AND    PC_OWNER.NA_ID = NA_NAMES.NA_ID
                        AND    NA_NAMES.NA_ID = NA_MAILING_INDEX.NA_ID
                        AND    PC_OWNER.P_ID =" . $p_id;


	    my $rows = $dbh->selectall_arrayref($sql);

	    $grantee =~ m/^(\w+).*/;
	    
	    my $scLast = defined($1)?$1:'';
	    my $found = 0;
	    for my $val(@$rows)
	      {
		my $govLast = defined($val->[4])?$val->[4]:'';
		my $company = defined($val->[7])?$val->[7]:'';

   	        if ($company =~ m/\Q$scLast/ && $scLast !~ /^$/) 				
		  {
		    $tError = "***Last Name is company name.  Flag for manual update***";
		  }
		if ($govLast =~ m/\Q$scLast/ && $scLast !~ /^$/) 		
		  {
		    $tError = "Last name match in Govern and Suff Co files. No Update";

		  }
	      }

	    $found = 1 if defined($tError);

	    return($found,$tError);
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
    my $err = $_[0];
    print $_;
}




#######################################################################################
#  Function: main()
#
#  Description: Contains program flow control
#  

sub main
{
  my ($records,$db);

  my ($err,$workbook) = openExcelSpreadsheet($xlsPath);
  if (defined($err) && $err->hasError())
    {
      $err->push (qq(Pushed after openExcelSpreadsheet()));
    }
  else
    {
      my ($err,$db) = createDBStruct($workbook);
      if (defined($err) && $err->hasError())
	{
	  $err->push (qq(Pushed after createDBStruct()));
	}
      else
	{
	  my ($err,$db) = doFunctions($db);
	  if (defined($err) && $err->hasError())
	    {
	      $err->push (qq(Pushed after createDBStruct()));
	    }
	  else
	    {
	      my ($err,$report) = showReport($db);
	      if (defined($err) && $err->hasError())
		{ 
		  $err->push (qq(Unable to retrieve record set));
		}
	      else
		{
		  ($err, $report) = sendLogs($report);
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
