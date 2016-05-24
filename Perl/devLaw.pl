use strict;
use warnings;
use warnings;
use URI;
use LWP;
use FileHandle;
use HTML::TreeBuilder 3;
use Error;
use DBI;
use DBD::ODBC;
use Data::Dumper;
use Switch;
use JSON qw(decode_json);
use Spreadsheet::ParseXLSX;


my $key = "iJ7dxSlc99uCPL8RilQHJJDU1H3JYdxB";
my $file = "C:\\Temp\\penal.json";
my $xlsx = "C:\\Development\\Archonix\\work\\ABC_Stage2.xlsx";

#######################################################################################
#  Function: openExcelSpreadsheet()
#
#  Description: Opens the Excel spreadsheet pointed to by $xlsx 


sub openExcelSpreadsheet
  {
    my ($err,$xls);
    my $xlsx = $_[0];

    my $parser   = Spreadsheet::ParseXLSX->new;

    my $workbook = $parser->parse($xlsx);

    if(!defined($workbook))
      {
        $err = new Error(qq(Could not connect to Excel Spreadsheet file: $xlsx\n));
      } 

    return($err,$workbook);
  }

#######################################################################################
#  Function: openFile
#
#  Description: Open file on file system
# 


sub openFile()
  {
    my ($err);
    my $fh = new FileHandle($file,"r");

    if(!defined($fh))
      {

	$err = new Error (qq(Can not open filehandle for: $file));
      }

    return($err,$fh);
  }


#######################################################################################

#  Function: createDBStruct()     
#
#  Description: Create hash struct by looping through XSL file.


sub readSpreadsheet
  {
    my ($err,$db,$line);
    my $workbook = $_[0];


    for my $worksheet ( $workbook->worksheets() ) {

    my ( $row_min, $row_max ) = $worksheet->row_range();
    my ( $col_min, $col_max ) = $worksheet->col_range();

    my $count = 0;
    my $text;

    for my $row ( $row_min .. $row_max ) {
      my @colVals = ();
      for my $col ( $col_min .. $col_max ) {
	my $cell = $worksheet->get_cell( $row, $col );

	next unless $cell;
	push (@colVals, $cell->value());
      }

      $text = $colVals[11];
      my @subsections = ();
      
      if($text =~ m/\\n\s{2}[1-9]/g)  {
	$text =~ s/\\n  \(/   (/g;
	@subsections = split("\\\\n\\s{2}", $text);
#	if($colVals[2] eq "163")   { print Dumper(@subsections) . "pre\n\n"};
	$subsections[0] = $1 if($subsections[0] =~ m/[1-9]+\.\s+.*([1-9]+(.*))/);
        @subsections = map {m/(^[1-9]+.*)/g } @subsections;
#	if($colVals[2] eq "163")   { print Dumper(@subsections) . "post\n\n"};
      }
      else  {
#	  $text =~ s/^\s+//;
#	  $text =~ s/[^!-~\s]\s+//g;
#	  $text = $1 if $text =~ m/^[1-9]+\.\s+(.*)/;
	  push(@subsections, $text);
      }

      if ($colVals[9] !~ m/([a-z]|-)/g)  {
	$colVals[9] = sprintf("%.2f", $colVals[9]);
      }

      foreach(@subsections)  {
	$_ =~ s/\\n/ /g;

	if( $_ =~ m/([1-9]+)\.\s+(.*)/g)
	  {
	    my ($num,$statute) = ($1,$2);
	    $colVals[11] = $statute;
	    $line = join("|", @colVals, $num);
	    $line =~ s/\|"/\| "/g;
	  }
	else
	  {
	    $colVals[11] = $_;
	    $line = join("|", @colVals, 1);	  
	  }
	print $line . "\n";
      }
      $count++;
    }
  }

    return($err,$db);
  }

#######################################################################################
#  Function: stringify
#
#  Description: Convert file into string
# 

sub stringify
  {
    my $fh = $_[0];
    my @strArray;
    my $err;
    
    my @strArr = <$fh>;
    my $jstring = join('', @strArr);

    return($err,$jstring);
  }



#######################################################################################
#  Function: decodeJSON()
#
#  Description: Turn JSON into PERL data structure
#

sub decodeJSON
  {
    my $json = $_[0];
    my $err;

    my $decoded = decode_json($json);

    recurseData($decoded,[],\&print_keys_and_value);

    return($err, $json);
  }

#######################################################################################
#  Function: print_keys_and_value
#
#  Description: Print keys and value
#

sub print_keys_and_value {
    my ($k, $v, $key_list) = @_;
#    for(@$key_list)  {
#      print $_, "\n";
#    }

#    printf "k = %-8s  v = %-4s  key_list = [%s]\n", $k, $v, "@$key_list";
}



#######################################################################################()
#  Function: recurseData()
#
#  Description: Recursive structure to descend through data 

#

sub recurseData
    {
         my ($obj, $key_list, $callback) = @_;
	 my @list;

	 if (ref($obj) =~ m/(HASH|ARRAY)/)
	   {

	     my @line = ();
	     @list = @$obj if ref($obj) eq 'ARRAY';
	     @list = values %$obj if ref($obj) eq 'HASH';

	     foreach (@list)  {
	       if(defined($obj)) 
		 {
		   my $attr = $_;
		   
		   $attr =  "N\\A" if $attr eq "undef";
		   $attr = "false" if $attr eq 0;
		   $attr = "true" if $attr eq 1;
		   push(@line, $attr) if not ref($attr);
		   recurseData($attr, [], {});
		 }
	     }

	     my $line = join('::', @line);
	     next if $line =~ m/^$/;
	     print $line, "\n";
	   }

#	 while (my ($k, $v) = each %$hash) {
#	   print "$k\n";
#	   push @$key_list, $k;

#	   if (ref($v) eq 'HASH') {
#	     recurseData($v, $key_list, $callback);
#	   }
#	   else {
#	     $callback->($k, $v, $key_list);
#	   }

#	   pop @$key_list;

#	 }
       }

#######################################################################################
#  Function: getJSON()	      
#
#  Description: Get the JSON structure via GET request
#

sub getJSON()
  {
    my $err;

    my $url = "http://openleg-dev.nysenate.gov/api/3/laws/PEN?full=true&key=" . $key;


    my ($json,$status,$successful,$obj) = do_GET($url);
    
    if( not ($successful))
      {
	$err = new Error(qq(GET REQUEST for URL: $url not successful\n));
      }


    return($err, $json);
  }




#######################################################################################
#  Function: do_GET()
#
#  Description: Creates browser object and returns document, unless error

sub do_GET
{
    my ($err);
    my $browser = LWP::UserAgent->new();
    my $resp = $browser->get(@_);
    return ($resp->content, $resp->status_line, $resp->is_success, $resp) if wantarray;
    return unless $resp->is_success;

    return ($resp->content);
}

#######################################################################################
#  Function: get_tree()
#
#  Description: Performs text substitutions on the retrieved document and returns a
#  a tree object on the string.
#

sub get_tree
{
    my ($doc) = $_[0];

    $doc =~ s/\n//g;
    $doc =~ s/&nbsp;/ /g;

    my $root  = HTML::TreeBuilder->new_from_content($doc);

    return($root);
}



#######################################################################################
#  Function: getNowDateTime()
#
#  Description: Get the date and time for now and format into a string compatible
#  with SQL Server
#

sub getNowDateTime
  {
    my ($nsec,$nmin,$nhour,$nmday,$nmon,$nyear,$nwday,$nyday,$misdst) = localtime(time);
    my $insertdate = ($nyear + 1900) . '-' . ($nmon + 1)  . '-' . $nmday;
    my $date  = join('-',$nyear+1900,$nmon+1,$nmday);
    my $time  = join(':',$nhour,$nmin,$nsec);
    my $datetime = $date . ' ' . $time;

    return($datetime);
  }



#######################################################################################
#  Function: print_errs()
#
#  Description: Error printing function for command line debugging and/or cron mailing.              #

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
  my ($err,$db,$fh,$json,$urls,$dbh,$workbook);


 ($err,$json) = getJSON();
  if (defined($err) && $err->hasError())
    {
      $err->push (qq(pushed after "getJSON()"));
    }
  else
   {
      ($err,$json) = decodeJSON($json);
    }



  if (defined($err) && $err->hasError())
    {
      $err->apply(\&print_errs);
    }
}

&main();