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
use String::Util 'trim';


my $from = 'reporter@southamptontownny.gov';
my $to   = 'jdaly@southamptontownny.gov';
my $cc   = 'jdaly@southamptontownny.gov';
#my $cc   = 'mbaldwin@southamptontownny.gov,ppobat@southamptontownny.gov';
my $subject = 'Record Update Report: ';
my $apath = 'C:\Temp\AccelaChanges.accdb';
my $xlsPath = 'C:\Temp\Deeds\July2.xlsx';

my $DSN  = "Govern_64";
my $user = "webdb";
my $pass = "wgov021";

my $GOV = "GOV_DB";


my @colnames = ('DATE','LIBER','PAGE','TAX_MAP','GRANTOR_FIRST','GRANTOR_MIDDLE','GRANTOR_LAST','GRANTOR_SUFFIX','GRANTOR_CORP','GRANTEE_FIRST','GRANTEE_MIDDLE','GRANTEE_LAST','GRANTEE_SUFFIX','GRANTEE_CORP','PROPERTY_ADDRESS','DEED_TYPE','CONS_AMOUNT','TRANS_AMOUNT','PROP_STR_NUM','PROP_STR_PRE_DIRECTION','PROP_STR_NAME','PROP_STR_TYPE','PROP_STR_POST_DIRECTION','PROP_TOWN','PROP_VILLAGE','PROP_ZIP','TXBLL_NAME','TXBLL_STR_NUM','TXBLL_STR','TXBLL_STR_TYPE','TXBLL_TOWN','TXBLL_STATE','TXBLL_ZIP','TXBLL_POSTAL_CODE','TXBLL_COUNTRY','NO_PRCLS','PRTL_PRC_CDE','PRT_4A','PRT_4B','PRT_4C','FRONT_FEET','DEPTH','H_FRONTAGE','H_DEPTH','PROP_USE','CONDOMINIUM','NEW_CONSTRUCTION','AGRICULTURAL','DISCLOSURE_NOTICE','SALE_CONTRACT_DATE','DATE_OF_SALE','FULL_SALE_PRICE','PER_PROP_VALUE','T_DESCRIPTION','ASSESSMENT_YR','TOT_ASSMNT_VALUE','PROP_CLASS','S_DESCRIPTION','LAND_USE1','LAND_USE2','BUYER_ATTRNY_NAME','BUYER_ATTRNY_PHN','BUYER_NAME','BUYER_STR_NUM','BUYER_STR_PRE_DIRECTION','BUYER_STR_NAME','BUYER_STR_TYPE','BUYER_STR_POST_DIRECTION','BUYER_STR_UNIT','BUYER_TOWN','BUYER_VILLAGE','BUYER_STATE','BUYER_ZIP','BUYER_POSTAL_CODE','BUYER_COUNTRY','GOV_TAX_MAP','STATUS','T_MESSAGE','ALL_GRANTEES','ALL_GRANTORS','GOV_OWNER', 'PARCEL_ID', 'IS_COMPANY');

my $duplicates = {};
my @tables = ('DEED_INTEGRATION');

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
#  Govern database Tax Map
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
    my $count = 0;

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
      $db->{$row}->{'isDuplicate'} = 'N';
      $db->{$row}->{'transferMessage'} = [];
      $db->{$row}->{'govOwner'} = "[Not Supplied]";
      $db->{$row}->{'reformattedTaxMap'} = reformatTaxMap($db->{$row}->{'cols'}->[3]);

      my $ukey = join('',$db->{$row}->{'cols'}->[1],$db->{$row}->{'cols'}->[2],$db->{$row}->{'cols'}->[3]);

      my ($grantor,$grantee) = getConcatHashData($db->{$row});

      $grantee= trim($grantee);
      $grantor= trim($grantor);

      if(!defined($duplicates->{$ukey}))
	{
	  $duplicates->{$ukey}->{'grantors'} = [];
	  push(@{$duplicates->{$ukey}->{'grantors'}},$grantor);

	  $duplicates->{$ukey}->{'grantees'} = [];
	  push(@{$duplicates->{$ukey}->{'grantees'}},$grantee);
	}
      else
	{
	  $db->{$row}->{'isDuplicate'} = 'Y';
	  push(@{$duplicates->{$ukey}->{'grantors'}},$grantor);
	  push(@{$duplicates->{$ukey}->{'grantees'}},$grantee);
	}

      push ($db->{$row}->{'cols'},$db->{$row}->{'reformattedTaxMap'});

      $count++;

#      last if $count > 3;

    }
#      print Dumper($db);exit;

  }
    return($err,$db);
  }


#######################################################################################
#  Function: getConcatHashData
#
#  Description: Get the concatenated values that serve as a key for duplicates, and 
#  the Grantee name in a full format for a hash value.

sub getConcatHashData
    {
      my $row = $_[0];
      
      my $grantor = join(' ',trim($row->{'cols'}->[4]),
			     trim($row->{'cols'}->[5]),
                             trim($row->{'cols'}->[6]),
                             trim($row->{'cols'}->[7]),
                         );

      my $grantee = join(' ', trim($row->{'cols'}->[9]),
			      trim($row->{'cols'}->[10]),
			      trim($row->{'cols'}->[11]),
			      trim($row->{'cols'}->[12])
   	                );   

      return($grantor, $grantee);
    }


#######################################################################################
#  Function: filterGranteeList()
#
#  Description: Filter the Grantee array of duplicates and empty strings

sub filterGranteeList
      {

	my $granteeList = $_[0];
	my @filtered = ();
	my %list = map{$_,1}@$granteeList;
	
	my @unique = keys %list;

	for my $grantee(@unique)
	  {
	    next if $grantee =~ m/^$/;
	    push(@filtered,$grantee);
	  }
	
	my $grantees = join(',<br>',@filtered);

	return($grantees);
      }

#######################################################################################
#  Function: doFunctions()
#
#  Description: Loop through $db hash and do functions


sub showReport
  {
    my ($db,$dbh)  = @_;
    my (@recordsPass,@recordsFail, @recordsPT);
    my ($err);
    my $report;
    my $fieldlist;
    my $msg = '';


    while (my ($key, $value) = each($db)) 
      {

	next if $db->{$key}->{'isDuplicate'} eq  'Y';
	next if $db->{$key}->{'reformattedTaxMap'} =~ /^9{4}.*/;     

	if ($db->{$key}->{'transfer'} eq 'Y')
	  {
	     $msg = "met all conditions and is good to transfer";
	  }
	else
	  {
	    $msg = join ("<br />",@{$db->{$key}->{'transferMessage'}});
	  }
        $fieldlist = join(", ", @colnames);
	push($db->{$key}->{'cols'},$db->{$key}->{'transfer'});
	push($db->{$key}->{'cols'},$msg);

	my $ukey = join('',$db->{$key}->{'cols'}->[1],$db->{$key}->{'cols'}->[2],$db->{$key}->{'cols'}->[3]);

	my $grantees = filterGranteeList($duplicates->{$ukey}->{'grantees'});
	my $grantors = filterGranteeList($duplicates->{$ukey}->{'grantors'});
	
	push($db->{$key}->{'cols'},$grantees);
	push($db->{$key}->{'cols'},$grantors);
	push($db->{$key}->{'cols'},$db->{$key}->{'govOwner'});
	push($db->{$key}->{'cols'},$db->{$key}->{'parcelID'});
	push($db->{$key}->{'cols'},$db->{$key}->{'isCompany'});

	my $field_placeholders = join(", ", map {'?'} @{$db->{$key}->{'cols'}});    

        my $insert_query = qq{INSERT INTO DEED_INTEGRATION ( $fieldlist )VALUES ( $field_placeholders )};

        my $sth= $dbh->prepare( $insert_query );
	$sth->execute(@{$db->{$key}->{'cols'}});

	if ($db->{$key}->{'transfer'} eq 'Y')
	    {
	      push(@recordsPass, $db->{$key}->{'cols'}->[3] . ": " . $msg);
	    }
	elsif ($db->{$key}->{'transfer'} eq 'PT')
	  { 
	    push(@recordsPT, $db->{$key}->{'cols'}->[3] . ":" . $msg);
	  }
	else
	  {
	    push(@recordsFail, $db->{$key}->{'cols'}->[3] . ":" . $msg);
	  }
      }     


    my $heading = "\n\nReport for Suffolk County Deeds file" .
      "\n__________________________________________________________________________________________________________\n\n";
    my $block = $heading . "\n\nSuccessful Transfers\n\n" . join("\n", @recordsPass) . "\n\nPartial Transfers\n\n" . join("\n",@recordsPT) . "\n\nFailed Transfers\n\n" . join("\n",@recordsFail);
    
    $report .= $block;

      return($err,$report);
  }



#######################################################################################
#  Function: doFunctions()
#
#  Description: Loop through $db hash and do functions


sub doFunctions
  {
    my $db = $_[0];
    my ($transfer,$govOwner,$match,$isCompany,$tError);

    my ($err,$dbh) = connectToSQLServer($DSN,$user,$pass);

      if (defined($err) && $err->hasError())
	{
	  $err->push (qq(Unable to connect to SQL Server\n));
	}
      else
	{
	  ###########################Start of else clause####################################
	  my $p_id;
	  my $row = 0;

	  while (my ($key, $value) = each($db)) 
	    {

	     next if ($db->{$key}->{'reformattedTaxMap'} =~ /^9{4}.*/ );  # clear the sentinel

	     ############################################################################	     
	     #  Checking if duplicate Tax Map numbers exist for Unique Liber/Page
	     ###########################################################################    

	     if($db->{$key}->{'isDuplicate'} eq 'Y')
	       {
 		 $db->{$key}->{'transfer'} = "PT";
		 push($db->{$key}->{'transferMessage'},"Duplicates removed");
		# next;
	       }

	     ############################################################################	     
	     #  Checking if record exists in Govern
	     ############################################################################	     
	     my $result = existsInGovern($dbh,$db->{$key}->{'reformattedTaxMap'},$db->{$key}->{'cols'}->[1],$db->{$key}->{'cols'}->[2]);

	     $p_id = getParcelID($dbh,$db->{$key}->{'reformattedTaxMap'});
	     $db->{$key}->{'parcelID'} = $p_id;

	     if (scalar(@$result) != 0)  
	       {
		 $db->{$key}->{'transfer'} = "N";
		 push($db->{$key}->{'transferMessage'},"Record exists in Govern");
		# next;
	       }

	     ############################################################################	     
	     #  Checking for Greater Liber  
	     ############################################################################	     
	     ($transfer,$tError) = greaterLiber($dbh,$p_id,$db->{$key}->{'cols'}->[1]);
	     if ($transfer == 2)
	       {
		 $db->{$key}->{'transfer'} = "PT" ;
		 push($db->{$key}->{'transferMessage'},$tError);
		# next;
	       }

	     ############################################################################	     
	     #  Checking for location verification
	     ############################################################################	     
	     ($transfer,$tError) = locationVerification($dbh,$p_id,
							$db->{$key}->{'cols'}->[18],
							$db->{$key}->{'cols'}->[19],
							$db->{$key}->{'cols'}->[20],
							$db->{$key}->{'cols'}->[21],
							$db->{$key}->{'cols'}->[22],
							$db->{$key}->{'cols'}->[23],
							$db->{$key}->{'cols'}->[24]
						       );  

	     if ($transfer == 0)
	       {
		 $db->{$key}->{'transfer'} = "N" ;
		 push($db->{$key}->{'transferMessage'},"Location Verification Failed<br>" . $tError);
		 #next;
	       }

	     ############################################################################	     
	     #  Checking if Deed from county is equal or Govern is more recent
	     ############################################################################	     
	     ($transfer,$tError) = existingDeed($dbh,$db->{$key}->{'cols'}->[0],$db->{$key}->{'cols'}->[1]);
	     if ($transfer == 0)
	       {
		 $db->{$key}->{'transfer'} = "N";   
		 push($db->{$key}->{'transferMessage'},$tError);
		 #next;
	       }

	     ############################################################################	     
	     #  Checking for Property Class inconsistencies
	     ############################################################################	     
	     ($transfer,$tError) = checkPropertyClass($dbh,$p_id,$db->{$key}->{'cols'}->[56]);
	     if(defined($tError))
	       {
		 if ($transfer == 2)
		   { 
		     $db->{$key}->{'transfer'} = "PT";
		   }
		 else
		   {
		     $db->{$key}->{'transfer'} = "N";
		   }

		 push($db->{$key}->{'transferMessage'},$tError);
		 #next;
	       }   

	     ############################################################################	  
	     #  Checking for matching Grantor/Owner names
	     ############################################################################	     
	     ($transfer, $govOwner, $isCompany) = checkGrantorOwner($dbh,$p_id,$db->{$key}->{'cols'}->[4],$db->{$key}->{'cols'}->[6]);

	     my $grantor = join(" ", $db->{$key}->{'cols'}->[4],$db->{$key}->{'cols'}->[6]);

	     $db->{$key}->{'govOwner'} = $govOwner;  #set the gov owner here
	     $db->{$key}->{'isCompany'} = $isCompany;


	     if($transfer == 0)
	       {
		 $db->{$key}->{'transfer'} = "PT";
		 push($db->{$key}->{'transferMessage'},"No match between Grantor [$grantor] and Govern owner [$govOwner]");
		 #next;
	       }		 

	     ############################################################################	     	     
	     #  Check if mailing index in Govern has been updated with new Grantee/Owner
	     ############################################################################	     
	     ($match,$tError) = checkMailingIndex($dbh, $p_id,$db->{$key}->{'cols'}->[4],$db->{$key}->{'cols'}->[6]);

	     if($match == 1)
	       {
		 $db->{$key}->{'transfer'} = "N";
		 push($db->{$key}->{'transferMessage'},$tError);      
		 #next;
	       }

	     ############################################################################	     
	     #  Check Grantee name for Trust    
	     ############################################################################	     

	     if ($db->{$key}->{'cols'}->[8] =~ m/trust/i)
	       {
		 $db->{$key}->{'transfer'} = "PT";
		 push($db->{$key}->{'transferMessage'},"Grantee/Grantee Company  name is a Trust");
		 #next;
	       }


	     ############################################################################	     
	     #  Check for Deed with Life Estate in County file      
	     ############################################################################	     

	     if ($db->{$key}->{'cols'}->[15] =~ m/deed with life estate/i || $db->{$key}->{'cols'}->[15] =~ m/correction/i )
	       {
		 $db->{$key}->{'transfer'} = "PT";
		 push($db->{$key}->{'transferMessage'},"Deed type is 'Deed with Life Estate or Correction/Deed'");
		 #next;
	       }

	     ############################################################################	     
	     #  Check Condition Code for Fractional or Less than Fee
	     ############################################################################	     
	     if($db->{$key}->{'cols'}->[53] =~ m/fractional/i || $db->{$key}->{'cols'}->[53] =~ m/unusual/i)
	       {
		 $db->{$key}->{'transfer'} = "PT";

		 push($db->{$key}->{'transferMessage'},"Condition Code is Sale of Fractional of Less than Fee or Unusual factors ");
		 #next;
	       }

	     ############################################################################	     
	     #  Check for existence of Buyer Address "OR" Taxbill Address
	     ############################################################################	     

	     if ($db->{$key}->{'cols'}->[28] =~ /^$/ && $db->{$key}->{'cols'}->[65] =~ /^$/)      
	       {
		 $db->{$key}->{'transfer'} = "PT";
		 push($db->{$key}->{'transferMessage'},"There is no buyer or taxbill address for this deed");
		 #next;
	       }



	     ############################################################################	     	     
	     #  Check if Tax Bill or Buyer Address is Sag,Bridge,Wain,Quogue,,Remsenburg
	     ############################################################################	     
	     if ($db->{$key}->{'cols'}->[30] =~ /Sagaponack|BridgeHampton|Wainscott|Quogue|Remsenburg/i)
	       {
		 if ($db->{$key}->{'cols'}->[28] !~ /PO BOX.*/i)
		   {
		     $db->{$key}->{'transfer'} = "N";      
		     push($db->{$key}->{'transferMessage'}, "Hamlet requiring PO Box [Sag,Bridge,Wain,Quogue,Rem] does not meet criterion");
		     #next;
		   }
	       }

	     ############################################################################	     	     
	     #  Check if NO PRCLS field in Suff County files is > 1
	     ############################################################################	     
	     if ($db->{$key}->{'cols'}->[35] ne "" && $db->{$key}->{'cols'}->[35] > 1)
	       {
 		     $db->{$key}->{'transfer'} = "PT";
		     push($db->{$key}->{'transferMessage'}, "Value in NO PRCLS is > 1");      
		    # next;
	       }

	     ############################################################################	     	     
	     #  Check if Consideration Amount (Sale Price) equal to 0
	     ############################################################################	     
	     if ($db->{$key}->{'cols'}->[16] ne "" && $db->{$key}->{'cols'}->[16] == 0)
	       {      
 		     $db->{$key}->{'transfer'} = "PT";
		     push($db->{$key}->{'transferMessage'}, "Consideration Amount is 0");
		     #next;
	       }


	     ########## Don't touch #############
	     $row++;
	     ########## Don't touch #############
	    }

	  ############################################################################

	  undef($dbh);
	}

    return ($err,$db);
  }

#######################################################################################      
#  Function: getParcelID()
#
#  Function retrieves the Parcel ID in case no records were in the Deeds db
#  

sub getParcelID
    {
      my $status = 0;
      my ($dbh, $taxmap) = @_;

      my $sql = "SELECT * FROM dbo.PC_PARCEL  WHERE TAX_MAP = '$taxmap'";
      my $rows = $dbh->selectall_arrayref($sql);

      return($rows->[0]->[0]);
    }


#######################################################################################      
#  Function: existsInGovern()
#
#  Function checks to see if parcel record from Suffolk County deeds file exists in Govern
#  

sub existsInGovern
    {
      my $status = 0;
      my ($dbh, $taxmap,$liber,$page) = @_;
      

      $liber =~ s/^D000//;

      my $sql = "SELECT PC_PARCEL.P_ID,TAX_MAP, DEED_BOOK, DEED_PAGE 
                     FROM dbo.PC_PARCEL, dbo.PC_LK_PARCEL_SALE, dbo.PC_DEEDS
                  WHERE dbo.PC_PARCEL.P_ID = dbo.PC_LK_PARCEL_SALE.P_ID
                     AND PC_LK_PARCEL_SALE.SALE_ID = PC_DEEDS.SALE_ID
                     AND TAX_MAP = '$taxmap'
                     AND DEED_BOOK = '$liber'
                     AND DEED_PAGE = '$page'";

      my $rows = $dbh->selectall_arrayref($sql);
      
      return($rows);
    }

#######################################################################################
#  Function: locationVerification()
#
#  Function checks to see if location from Suff Co files matches Govern
#

sub locationVerification
      {
	my ($dbh,$p_id,$strNum,$strPreDir,$strName,$strType,$strPostDir,$strCity,$strVillage) = @_;
	my $failMessage;
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

	if ($govAddress =~ m/\Q$fullStreetName/) 
	  {
	    $transfer = 1
	  }
	else
	  {
	    $failMessage = join("<br> ", "Govern Address: " . $govAddress, "Suff Co Address: " . $fullStreetName);
	  }
	
	return ($transfer,$failMessage);
      }


#######################################################################################
#  Function: existingDeed()
#
#  Description: Checks to see if deed matches both DEED_BOOK and eact deed date
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
	    next if not defined($val->[1]);
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
#  Function: greaterLiber()
#
#  Function checks to see if Liber in Govern is later than provided by Suff co file
#  

sub greaterLiber
    {
      my ($dbh, $p_id, $lpage) = @_;
      my $status = 0;
      my $message;

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
	      $message = "Liber and Page in Govern is greater [" . $val->[0] . "] than the value in County File [" . $temp . "]";
	      $status = 2;
	      last;
	    }
	}
      
      
      return($status,$message);
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

	  $transfer = 0;

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
	      $transfer = 2;
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
	    my ($dbh,$p_id,$scFirst, $scLast) = @_;
	    my ($scFullName,$govName);
	    my $isCompany = 0;

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

	    if ($scFirst !~ m/^$/ && $scLast !~ m/^$/)
	      {
		$scFullName = join(" ", $scFirst,$scLast);
	      }
	    else
	      {
		$scFullName = "";
	      }

	    my $match = 0;
	    for my $val (@$rows)
	      {	    
		my $company = defined($val->[7])?$val->[7]:""; 
		$govName = defined($val->[4])?$val->[4]:"";
		$govName .= " " . $val->[6] if defined($val->[6]);

		if(defined($company) && $company ne "")
		  {
		    $isCompany = 1;
		  }

		if ($govName =~ m/\Q$scFullName/) 
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
		else
		  {
		    $govName = $company;
		  }
	      }		

	    return($match,$govName,$isCompany);
	  }

#######################################################################################
#  Function: checkMailingIndex()
#
#  Description: Checks mailing index in Govern has been updated with new Grantee/Owner,
#  and, if so, transfer is set to N.
#

sub checkMailingIndex
	  {
	    my ($dbh,$p_id,$scGranteeFirst,$scGranteeLast) = @_;
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

	    
	    my $found = 0;
	    for my $val(@$rows)
	      {
		my $govLast = defined($val->[4])?$val->[4]:'';
		my $company = defined($val->[7])?$val->[7]:'';

   	        if ($company =~ m/\Q$scGranteeLast/ && $scGranteeLast !~ /^$/) 				
		  {
		    $tError = "***Last Name is company name.  Flag for manual update***";
		  }
		if ($govLast =~ m/\Q$scGranteeLast/ && $scGranteeLast !~ /^$/) 		
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
#  Function: delete_from_tables()
#
#  Description: Delete all data from all database tables, except town, in order to
#  repopulate data on daily program run.
#

sub delete_from_tables
  {
    my ($err,$dbh);

    ($err,$dbh) = connectToSQLServer($GOV,'','');
    if (defined($err) && $err->hasError())
      {
	$err->push (qq(pushed in delete_from_tables() (cannot connect to Sql Server)"));
      }
    else
      {
	for my $table (@tables)
	  {
	    if(!$dbh->do("DELETE FROM $table"))
	      {
		$err = new Error(qq(Failed to DELETE FROM table: $table\n));
		last;
	      }
	  }
      }

    return($err,$dbh);
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

  my ($err,$records,$db,$workbook,$report,$dbh);
  ($err,$workbook) = openExcelSpreadsheet($xlsPath);
  if (defined($err) && $err->hasError())
    {
      $err->push (qq(Pushed after openExcelSpreadsheet()));
    }
  else
    {
      ($err,$db) = createDBStruct($workbook);
      if (defined($err) && $err->hasError())
	{
	  $err->push (qq(Pushed after createDBStruct()));
	}
      else
	{
	  ($err,$db) = doFunctions($db);
	  if (defined($err) && $err->hasError())
	    {
	      $err->push (qq(Pushed after createDBStruct()));
	    }
	  else
	    {
	      ($err,$dbh) = delete_from_tables();
	      if (defined($err) && $err->hasError())
		{
		  $err->push (qq(pushed after "delete_from_tables()"));
		}
	      else
		{
		  ($err,$report) = showReport($db,$dbh);
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
    }


  if (defined($err) && $err->hasError())
    {
      $err->apply(\&print_errs);
    }
}

&main();
