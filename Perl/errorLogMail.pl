#!/usr/bin/perl -w


use MIME::Lite;
use FileHandle;
use warnings;
use Error;

my $from = "";
my $to   = "";
my $cc   = "";
my $subject = 'Updater Error Logs: ';
my @errors = ();


my @files = ("");


#######################################################################################
#  Function: openFiles()
#
#  Description: Open Error Log files

sub openFiles
  {
    my ($err,$fh);
    my (@fileHandles);

    for (@files)
      {
	if(-e $_)
	  {

	    $fh = new FileHandle $_, O_RDONLY;
	    if(!defined($fh))
	      {
		$err = new Error("Filehandle null for filename: $_\n");
	      }
	    else
	      {
		push(@fileHandles, $fh);
	      }
	  }
	else
	  {
  		$err = new Error("File does not exist for filename: $_\n");
          }
      }

    return($err, \@fileHandles);
  }

#######################################################################################
#  Function: getLogs()
#
#  Description: Get contents of File Geodatabase and Tax Parcel Update error logs

sub getLogs
    {
      my $files = $_[0];
      my $err;
      my $report = '';
      my $date = getDate();

      $report .= "Error log report for : " . $date . "\n";
      $report .= "===========================================================================================================" . "\n";

      for(@$files)
	{
	  my @line = grep(/$date/,<$_>);
 	  my @spaces = map{$_ = "  " . $_} @line;
 	  $report .= join("", @spaces);
 	  $report .= "\n\n\n\n";
	  undef($_);
	}
      return($report);
    }

#######################################################################################
#  Function: getDate()
#
#  Description: gets date formatted to error log specificateions (yyyy-mm-dd)

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


	MIME::Lite -> send ('smtp','xx.xx.xx.xx' );

	$msg -> send;

	return($err);
      }

#######################################################################################
#  Function: print_errs()
#
#  Description: Error printing function for command line debugging and/or cron mailing.              #

sub print_errs
{
    my $err = $_[0];
    push (@errors, $err);
    

}


#######################################################################################
#  Function: main()
#
#  Description: main program to control program flow.
#

sub main
{
  my ($err,$dbh,$report);

  ($err,$rows) = openFiles();

  if (defined($err) && $err->hasError())
    {
      $err->push (qq(pushed after "openFiles()"));
    }
  else
    {
      $report = getLogs($rows);
      if (defined($err) && $err->hasError())
	{
	  $err->push (qq(pushed after "getLogs()"));
	}
      else
	{
	  $err = sendLogs($report);
	}
    }

  if (defined($err) && $err->hasError())
    {
        $err->apply(\&print_errs);
	$err = join("",@errors);

        my $msg = MIME::Lite->new(
         From    => $from,
         To      => $to,
         Cc      => $cc,
         Subject => $subject . getDate(),
         Type    => 'TEXT',
         Data => $err
    );


	MIME::Lite -> send ('smtp','xx.xx.xx.xx' );

	$msg->send;
     }

}

&main();
