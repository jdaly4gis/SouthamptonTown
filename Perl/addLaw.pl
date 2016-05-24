use strict;
use warnings;
use URI;
use LWP;
use FileHandle;
use HTML::TreeBuilder 3;
use HTML::TreeBuilder::XPath;
use Error;
use File::Copy;
use TEXT::CSV;
use DBI;
use DBD::ODBC;
use Data::Dumper;
use Switch;

my $DSN = "GOV_DB";
my $user = '';
my $pass = '';

my $file = "C:\\Temp\\penal.txt";
my @tables = ('tblAttachment');

#######################################################################################
#  Function: openFile()
#
#  Description: Open a text file to build LWP node structure

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
#  Function: stringify()
#
#  Description: convert file to string
#  
#

sub stringify
  {
    my $fh = $_[0];
    my @strArray;
    my $err;
    
    my @strArr = <$fh>;

    return($err,\@strArr);
  }

#######################################################################################
#  Function: delete_from_tables()
#
#  Description: Delete all data from all database tables, except town, in order to
#  repopulate data on daily program run.
#

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
#  Description: Error printing function for command line debugging and/or cron mailing.              #

sub print_errs
{
    my $err = $_[0];
    print $_;
}

#######################################################################################
#  Function: dbInsert()
#
#  Description: Insert into Attachment table

sub dbInsert
{
  my ($conId,$dir,$files,$dbh) = @_;

  my ($err,$sth);
  my $destDir = "Z://temp";

  for(@$files)
    {
      $_ = m/(.*)\.(pdf)$/i;
      my $sourceFile = join('/', $dir, join('.', $1,$2));

      $sth = $dbh->prepare("INSERT INTO tblAttachment(ContractID,AttachmentTitle,FileFormat,IsPublic) VALUES(?,?,?,?);SELECT SCOPE_IDENTITY()");
      $sth->execute($conId,$1,$2,0);

      my $attachID = $sth->fetchrow_array();
      my $destFile = $attachID . $2;
      my $fullPathDest = join ('/', $destDir, join('.',$attachID,$2));
      
      copy($sourceFile, $fullPathDest) or $err = new Error(qq(Error copying $sourceFile => $fullPathDest\n));

      if (defined($err) && $err->hasError())
	{
	  $err->push (qq(pushed after attempting $dir open));
	}

      $sth->finish();
    }

  return($err);
}

#######################################################################################
#  Function: processFiles()
#
#  Description: Read files in the directory specified by $year-$num

sub processFiles
{
    my ($year,$num) = @_;
    my ($err);
    my (@files);

    my $dir = "Z://$year/$num";

    if(-d $dir)
      {
	opendir(DIR, $dir) or $err = new Error(qq(Error on opening [$dir]\n));

	if (defined($err) && $err->hasError())
	  {
	    $err->push (qq(pushed after attempting $dir open));
	  }
	else
	  {
	    while (my $file = readdir(DIR))
	      {
		next if ($file =~ m/^\./);
		push(@files,$file);
	      }
	    closedir(DIR);
	  }
      }

    
    return($err, $dir, \@files);
}


#######################################################################################
#  Function: main()
#
#  Description: main program to control program flow

sub main
  {
     my ($err, $fh) = openFile();

     if (defined($err) && $err->hasError())
     {
         $err->apply(\&print_errs);
     }
  }

&main()
