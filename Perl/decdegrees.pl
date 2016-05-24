use XMLRPC::Lite;
use URI::Escape;
use Data::Dumper;
use DBI;
use DBD::ODBC;
use strict;
use Error;
use warnings;
use utf8;
use Getopt::Long;
use FileHandle;
use charnames ':full';

my $DSN  = "Govern_64";
my $user = "webdb";
my $pass = "wgov021";

my $width=440;
my $height=600;
my $logfile = 'E:\\PerlLogs\geocode.log';

#######################################################################################
#  Function: connectToSQLServer()
#
#  Description: Connect to SQL Server.  Note: If Windows Based Authentication is
#  activated, the user and password fields are irrelevant.
#

sub connectToSQLServer
  {
    my ($err);
    my %attr= (
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
#  Function: GetLatLon()
#
#  Description: Get Lat Lon.  Retrieve the Latitutde and Longitude from the command line
#  
#

sub GetLatLon
  {

    my ($lat,$lon);
    if($#ARGV != 1)
      {
	print "usage: project.pl <lat> <lon>\neg: project.pl  40.89076 -73.394388\n";
	exit;
      }

    return($ARGV[0],$ARGV[1]);
  }

#######################################################################################
#  Function: getCoordinates()
#
#  Description: Get Coordinates. Retrieve a coordinate point for lat and lon
#  
#

sub getCoordinates
    {
      my ($lat,$lon) = @_;
      my $err;

      my ($dlat,$mlat,$slat) = getLatDMS($lat);
      my ($dlon,$mlon,$slon) = getLonDMS($lon);



+      # Set up the coordinate system parameters.

      my $A = 6378137;               # major radius of ellipsoid, map units (NAD83)
      my $E = 0.08181922146;         # eccentricity of ellipsoid (NAD83)
      my $AngRad = 0.017453292519943295;    # number of radians in a degree
      my $Pi4 = 3.141592653582 / 4;  # Pi / 4
      my $P1 = 40.6666 * $AngRad;      # latitude of first standard parallel
      my $P2 = 41.0333 * $AngRad;      # latitude of second standard parallel
      my $P0 = 40.1666 * $AngRad;      # latitude of origin
      my $M0 = -74 * $AngRad;        # central meridian
      my $X0 = 300000;               # False easting of central meridian, map units

      # Calculate the coordinate system constants.
      my $m1 = cos($P1) / sqrt(1 - (($E**2) * ((sin($P1))**2)));
      my $m2 = cos($P2) / sqrt(1 - (($E**2) * ((sin($P2))**2)));
      my $t1 = sin($Pi4 - ($P1 / 2)) / cos($Pi4 - ($P1 / 2)) ;
      $t1 = $t1 / (((1 - ($E * (sin($P1)))) / (1 + ($E * (sin($P1)))))**($E/2));
      my $t2 = sin($Pi4 - ($P2 / 2)) / cos($Pi4 - ($P2 / 2));
      $t2 = $t2 / (((1 - ($E * (sin($P2)))) / (1 + ($E * (sin($P2)))))**($E/2));
      my $t0 = sin($Pi4 - ($P0 / 2)) / cos($Pi4 - ($P0 / 2));
      $t0 = $t0 / (((1 - ($E * (sin($P0)))) / (1 + ($E * (sin($P0)))))**($E/2));
      my $n = log($m1 / $m2) / log($t1 / $t2);
      my $F = $m1 / ($n * ($t1**$n));
      my $rho0 = $A * $F * ($t0**$n);

      # Convert the latitude/longitude to a coordinate.
      $lat = $lat * $AngRad;
      $lon = $lon * $AngRad;
      my $t = sin($Pi4 - ($lat / 2)) / cos($Pi4 - ($lat / 2));
      $t = $t / (((1 - ($E * (sin($lat)))) / (1 + ($E * (sin($lat)))))**($E/2));
      my $rho = $A * $F * ($t**$n) ;
      my $theta = $n * ($lon - $M0) ;
      my $x = ($rho * sin($theta)) + $X0 ;
      my $y = $rho0 - ($rho * cos($theta)) ;
      $lat = $lat / $AngRad ;
      $lon = $lon / $AngRad ;

      print "Lat: $lat\n";
      print "Lon: $lon\n";

      print "Y: " . $y * 3.2808 . "\n";
      print "X: " .  $x * 3.2808;

      return($err);
    }

#######################################################################################
#  Function: ConvertToDecDegrees()
#
#  Description: Convert coordinate in DMS to Decimal Degrees
#  
    

sub ConvertToDecDegrees
      {
	my $dbh = $_[0];
	my $err;

	my $sql = "SELECT TOP (5) LAT, LONGIT FROM PC_PARCEL";

	my $rows = $dbh->selectall_arrayref($sql);

	foreach (@$rows)
	  {
	    next if not defined $_->[0] or not defined $_->[1];
                                                                                                                                                                                                                   
	    my $lat = $_->[1];
	    print $lat . "\t";
	    $lat =~ s/\N{DEGREE SIGN}//g;
	    $lat =~ s/'//g;
	    $lat =~ s/"//g;
	    $lat =~ s/N//g;
	    
	    my ($d,$m,$s) = split('\s',$lat);
	    
	    $d=38; $m=53; $s=23;
	    
	    my $dd = $d + ($m / 60) + ($s / 3600);
	    print "$dd\n";

	  }
	
	return($err);
      }


#######################################################################################
#  Function: GetLatDMS()
#
#  Description: GetLatDMS.  Retrieve the Latitutde in Degree, Minutes, Seconds
#  
#

sub getLatDMS
  {

    my $lat = $_[0];
    my ($dlat,$mlat,$slat);

    $dlat = int($lat);
    $mlat = 60 * ($lat - $dlat);
    $slat = 60 * ($mlat - int($mlat));
    $mlat = int($mlat);

    return($dlat,$mlat,$slat);
  }

#######################################################################################
#  Function: GetLonDMS()
#
#  Description: GetLonDMS.  Retrieve the Longitude in Degree, Minutes, Seconds
#  
#

sub getLonDMS
  {

    my $lon = $_[0];
    my ($dlon,$mlon,$slon);

    $lon = 0 - $lon if $lon > 0;
    $dlon = int($lon);
    $mlon = 60 * ($dlon - $lon);  # check this
    $slon = 60 * ($mlon - int($mlon));
    $mlon = int($mlon);

    return($dlon,$mlon,$slon);
  }


#######################################################################################
#  Function: delete_from_tables()
#
#  Description: Delete all data from Location table
#
#
sub delete_from_table
  {
    my ($dbh) = $_[0];
    my ($err);

    if(!$dbh->do("DELETE FROM Location"))
      {
        $err = new Error(qq(Failed to DELETE FROM table: Location\n));
      }

    return($err)
  }


#######################################################################################
#  Function: print_errs()
#
#  Description: Error printing function for command line debugging and/or cron mailing.
#

sub print_errs
{
    my $err = $_[0];
    my $fh = new FileHandle $logfile, O_RDWR|O_CREAT;
    print $fh $_;
}

#######################################################################################
#  Function: main()
#
#  Description: main program to control program flow.
#

sub main
{
  my ($err,$dbh,$locations,$lat,$lon);

  ($err,$dbh) = connectToSQLServer();
  if (defined($err) && $err->hasError())
    {
      $err->push (qq(pushed after "connectToSQLServer()"));
    }
  else
    {
      ($err) = ConvertToDecDegrees($dbh);
      if (defined($err) && $err->hasError())
        {
          $err->push (qq(pushed after "ConvertToDecDegrees()"));
        }
      else
	{
	 # my ($err) = getCoordinates($lat,$lon);
	}
    }

  if (defined($err) && $err->hasError())
    {
      $err->apply(\&print_errs);
    }
}

&main();
