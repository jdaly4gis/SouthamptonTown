use strict;
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

my $DSN  = "";
my $user = "";
my $pass = "";
my $count = 0;

my %towns = (
             11901 => "Riverhead",
             11931 => "Aquebogue (PO Box)",
             11932 => "Bridgehampton (PO Box)",
             11933 => "Calverton",
             11941 => "Eastport",
             11942 => "East Quogue",
             11946 => "Hampton Bays",
             11947 => "Jamesport (PO Box)",
             11949 => "Manorville",
             11959 => "Quogue (PO Box)",
             11960 => "Remsenberg (PO Box)",
             11962 => "Sagaponack (PO Box)",
             11963 => "Sag Harbor",
             11968 => "Southampton",
	     11969 => "Southampton (PO Box)",
             11970 => "South Jamesport (PO Box)",
             11972 => "Speonk (PO Box)",
             11976 => "Water Mill",
             11937 => "East Hampton",
             11977 => "Westhampton",
             11978 => "Westhampton Beach",
             11940 => "East Moriches"
            );


my $URL = "http://criminaljustice.ny.gov/SomsSUBDirectory/search_index.jsp?offenderSubmit=true&LastName=&County=&Zip=__ZIPCODE__&Submit=Search";

my @tables = ('Offender','TownOffender','OffenderType','Address','Conviction',
              'ConvictionCharge','Sentence','PhysicalIdentifier','Alias','College',
              'Employer','Vehicle','SpecialCondition','ModusOperandi','Location');

my $base_url = "http://criminaljustice.ny.gov";
my $program = "C://Perl64/bin/perl.exe C://Perl/eg/geocode.pl";

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
       $err = new Error(qq(Program $program exited with status $result\n));
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
#  Function: getLinks()
#
#  Description: Get all offender links for every active zipcode in the towns hash
#

sub getLinks()
  {
    my ($err,$tempURL);
    my (@atags,@nodes);
    my ($count) = 1;
    my ($links,$root);

    while(my($key,$value) = each(%towns))
      {
        $tempURL = $URL;
        $tempURL =~ s/__ZIPCODE__/$key/;

        my ($doc,$status,$successful,$obj) = do_GET($tempURL);
        if ($successful)
          {
            $root = get_tree($doc);
            if(defined($root))
              {
                my @atags = $root->find_by_attribute('rel','nofollow');
                for my $node(@atags)
                  {
                    my $link_text= $node->as_text();
                    push(@nodes,$node);
                  }
              }
          }
        else
          {
            $err = new Error(qq(GET REQUEST for URL: $URL not successful\n));
            last;
          }
      }

    map  { $links->{$count++} = $_; $_}@nodes;

    return($err,$links);
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
#  Function: insert_into_db
#
#  Description: Loop through the hash and execute SQL according to the hash key value.
#

sub insert_into_db
  {

    $count++;
    my ($parse_vars,$dbh) = @_;
    my ($insert_handle);
    my ($err);

    my @keys = sort{$a<=>$b}(keys %$parse_vars);

    if($dbh->do("INSERT INTO TownOffender VALUES($parse_vars->{1}->{'zip'}->[0],$parse_vars->{0}->{'offender_id'})"))
      {

         foreach my $key(@keys)
           {

             switch($key)
               {
                 case 0
                   {
                     $insert_handle = $dbh->prepare_cached('INSERT INTO Offender VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)');

                     if(!$insert_handle->execute
                        (
                         $count,
                         $parse_vars->{$key}->{'offender_id'},
                         $parse_vars->{$key}->{'last_name'},
                         $parse_vars->{$key}->{'first_name'},
                         $parse_vars->{$key}->{'middle_name'},
                         $parse_vars->{$key}->{'dob'},
                         $parse_vars->{$key}->{'sex'},
                         $parse_vars->{$key}->{'risk_level'},
                         $parse_vars->{$key}->{'race'},
                         $parse_vars->{$key}->{'ethnicity'},
                         $parse_vars->{$key}->{'height'},
                         $parse_vars->{$key}->{'weight'},
                         $parse_vars->{$key}->{'hair'},
                         $parse_vars->{$key}->{'eyes'},
                         $parse_vars->{$key}->{'corr_lens'},
                         $parse_vars->{$key}->{'designation'}
                        ))
                       {
                         $err = new Error(qq(Failed to Add to Offender: $dbh->errstr,\n));
                       }
                   }
                case 1
                   {
                     $insert_handle = $dbh->prepare_cached('INSERT INTO Address VALUES(?,?,?,?,?,?,?)');

                     if(!$insert_handle->execute
                        (
                         $count,
                         $parse_vars->{0}->{'offender_id'},
                         $parse_vars->{1}->{'location_name_and_street_address'}->[0],
                         $parse_vars->{1}->{'city'}->[0],
                         $parse_vars->{1}->{'state'}->[0],
                         $parse_vars->{1}->{'zip'}->[0],
                         $parse_vars->{1}->{'category'}->[0]
                        ))
                       {
                         $err = new Error(qq(Failed to Add to Reported Address: $dbh->errstr,\n));
                       }
                   }

                case 3
                   {
                     $insert_handle = $dbh->prepare_cached('INSERT INTO Conviction VALUES(?,?,?,?,?,?)');
                     if(!$insert_handle->execute
                        (
                         $count,
                         $parse_vars->{0}->{'offender_id'},
                         $parse_vars->{3}->{'date'}->[0],
                         $parse_vars->{3}->{'arresting_agency'}->[0],
                         $parse_vars->{2}->{'agency_name'}->[0],
                         $parse_vars->{3}->{'victim_sex_age'}->[0]
                        )
                       )
                        {
                          $err = new Error(qq(Failed to Add to Conviction: $dbh->errstr,\n));
                          last;
                        }
                   }

                 case 4
                   {
                     $insert_handle = $dbh->prepare_cached('INSERT INTO ConvictionCharge VALUES(?,?,?,?,?,?,?,?,?)');
                     if(!$insert_handle->execute
                        (
                         $count,
                         $parse_vars->{0}->{'offender_id'},
                         $parse_vars->{4}->{'title'}->[0],
                         $parse_vars->{4}->{'section'}->[0],
                         $parse_vars->{4}->{'subsection'}->[0],
                         $parse_vars->{4}->{'class'}->[0],
                         $parse_vars->{4}->{'category'}->[0],
                         $parse_vars->{4}->{'degree'}->[0],
                         $parse_vars->{4}->{'description'}->[0]
                        )
                      )
                       {
                         $err = new Error(qq(Failed to Add to Conviction Charges: $dbh->errstr,\n));
                         last;
                       }
                   }

                case 6
                  {
                     $insert_handle = $dbh->prepare_cached('INSERT INTO Alias VALUES(?,?,?,?,?)');
                     my $i = 0;
                     foreach(@{$parse_vars->{6}->{'first_name'}})
                       {
                        if(!$insert_handle->execute
                           (
                            $count,
                            $parse_vars->{0}->{'offender_id'},
                            $parse_vars->{6}->{'first_name'}->[$i],
                            $parse_vars->{6}->{'middle_name'}->[$i],
                            $parse_vars->{6}->{'last_name'}->[$i]

                           )
                          )
                          {
                            $err = new Error(qq(Failed to Add to Alias: $dbh->errstr,\n));
                            last;
                          }
                      }
                   }
                }
           }
       }
    else
      {
        $err = new Error(qq(Unable to Enter Town Offender Mapping for: $parse_vars->{0}->{'offender_id'}\n));
      }

         return($err);
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
#  Function: geoCodeAddress()
#
#  Description: Send input string to geocoding services
#

sub geoCodeAddress()
  {
    my $geostring = $_[0];

    my $result = XMLRPC::Lite
      -> proxy('http://geocoder.us/service/xmlrpc')
      -> geocode($geostring)
      -> result;

    return($result);
  }

#######################################################################################
#  Function: doGrandfathering()
#
#  Description: Check to see if offender address information exists in the Grandfather
#  table.  If not, add it and a non grandfathered status. If so, check to see if the
#  address of the offender data matches the one currently in the database.  If it does
#  not, and the current date is after the one in the Grandfather table, set the status
#  of grandfathering to 0, or false
#
#

sub doGrandfathering
  {
    my ($offender,$index,$dbh) = @_;
    my ($err,$isGrandfathered);
    my $off_id = $offender->{'detail'}->{'1'}->{'offender_id'};
    $off_id =~ s/\s+//g;
    my @row = $dbh->selectrow_array(qq{SELECT Address,City FROM Address WHERE Offender_ID = ?},undef,$off_id);
    my $dbaddress = $row[0];
    my $dbtown = $row[1];
    my $lwpaddress = $offender->{'detail'}->{'2'}->{'reported_address'};
    my $lwptown = $offender->{'detail'}->{'2'}->{'city'};

    $isGrandfathered = 0;

    if(scalar(@row) != 0)
      {
        if (($dbaddress eq $lwpaddress) && ($dbtown eq $lwptown))
          {
            $isGrandfathered = 1;
          }
      }
    else
      {
        $isGrandfathered = 0;
      }

    return($isGrandfathered);
  }

#######################################################################################
#  Function: get_offender_detail()
#
#  Description: Iterate through the list of URLs and return each detail page for
#  for individual parsing.
#

sub get_offender_detail
{
   my ($links,$dbh) = @_;
   my ($offenders,$detail) = ({},{});
   my ($err);

   while (my($index,$node) = each %$links)
     {
       my $link_text = $node->as_text();
       $link_text =~ /(\w+),\s+(\w+)\s+(.*)?/;

       my $href = URI->new_abs($node->attr('href'),$base_url);

       my ($doc,$status,$successful,$obj) = do_GET($href);

       if($successful)
         {
	   print $doc;exit;
          ($err,$detail) = parse_offender_detail($doc);
          $offenders->{$index}->{'detail'} = $detail;
        }
       else
         {
           $err = new Error(qq(GET REQUEST for URL: '$href' not successful\n));
         }
     }
   return($err,$offenders);
}

#######################################################################################
#  Function: delouse_key()
#
#  Description: Get the information from the identification info table.
#
#

sub delouse_key
{
    my $key = $_[0];

    $key =~ s/\s/_/g;
    $key =~ s/://g;
    $key =~ s/\.//g;
    $key =~ s/\//_/g;
    $key = lc($key);

    if ($key =~ m/(.*)_$/){$key = $1}
    if ($key =~ m/^_(.*)/){$key = $1}

    return($key);

    return($key);
}


#######################################################################################
#  Function: get_info_simple()
#
#  Description: Get the information from the identification info table.
#

sub get_info_simple
{
    my ($node, $parse_vars, $node_num) = @_;
    my ($key,$val);

    my @kids = $node->content_list();

    for my $child(@kids)
      {
        my @childlist = $child->content_list;
        for my $grandchild (@childlist)
          {
            if ($grandchild->tag eq 'th')
              {
                $key = $grandchild->as_text();

                if ($key =~ /^(\w+\s+\w+\s+\w+)/)
                  {
                    $key = $1;
                  }
                $key = delouse_key($key);

              }

            if ($grandchild->tag eq 'td')
              {
                $val = $grandchild->as_text();

                if (!defined($parse_vars->{$node_num}->{$key}))
                  {
                    $parse_vars->{$node_num}->{$key} = $val;
                  }
              }
          }
      }

}




#######################################################################################
#  Function: parse_offender_detail()
#
#  Description: Break up Parse Tree into table nodes, and parse them according to type
#
#


sub parse_offender_detail
{
    my ($doc) = $_[0];

    my ($err,$root);
    my ($key,$val);
    my $parse_vars = {};
    my $node_num = 0;
    $root = get_tree($doc);

    my @tabletags = $root->find_by_tag_name('table');
    my @childlist;

    for my $node(@tabletags)
      {
        my @kids = $node->content_list();

        switch($node_num)
          {
            case 0
              {
                for my $child(@kids)
                  {
                    my @elements = $child->content_list;
                    map
                      {
                        if($_->tag eq 'th')
                          {
                            $key = delouse_key($_->as_text());
                          }
                        else
                          {
                            if (!defined($parse_vars->{$node_num}->{$key}) && $_->as_text())
                              {
                                $parse_vars->{$node_num}->{$key} = $_->as_text();
                              }
                          }
                      } @elements;
                  }
              }
            case [1,2,3,4,6,7]
             {
              my @headers = $node->look_down('_tag', 'th');
              my @infos   = $node->look_down('_tag', 'tr',
                                              sub
                                              {
                                                not $_[0]->look_down('_tag','th')
                                              }
                                             );

               @headers = map {delouse_key($_->as_text)}@headers;
               my $index = 0;
               map
                 {
                   my $key = $_;
                   map
                     {
                       my @els = $_->look_down('_tag','td');
                       my $val = $els[$index]->as_text;
                       push (@{$parse_vars->{$node_num}->{$key}},$val);

                     }@infos;
                   $index++;
                 }@headers;
             }
           case [5]
             {
               for my $child(@kids)
                 {
                   my @elements = $child->content_list;
                    map
                      {
                        if($_->tag eq 'th')
                          {
                            $key = delouse_key($_->as_text());
                          }
                        else
                          {
                            push (@{$parse_vars->{$node_num}->{$key}}, $_->as_text)
                          }
                      } @elements;
                 }
             }
           }
        $node_num++;
      }

    #print "Table tags: " . scalar(@tabletags) . "\n";
    $root->eof();
    $root->delete;

    return ($err,$parse_vars);
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
    my ($err,$urls,$dbh,$offenders,$links);

    ($err,$dbh) = connectToSQLServer();

    if (defined($err) && $err->hasError())
      {
        $err->push (qq(pushed after "connectToSQLServer()"));
      }
    else
      {
        ($err,$links) = getLinks();

        if (defined($err) && $err->hasError())
          {
            $err->push (qq(pushed after "getLinks()"));
          }
        else
          {
            ($err,$offenders) = get_offender_detail($links,$dbh);
            if (defined($err) && $err->hasError())
              {
                $err->push (qq(pushed after "get_offender_detail()"));
              }
            else
              {
                ($err) = delete_from_tables($dbh);
                if (defined($err) && $err->hasError())
                  {
                    $err->push (qq(pushed after "delete_from_tables()"));
                  }
                else
                  {
                    my @keys = sort{$a<=>$b}(keys %$offenders);
                    foreach my $key(@keys)
                      {
                        ($err) = insert_into_db($offenders->{$key}->{'detail'},$dbh);
                        last if $err;
                      }
                    if (defined($err) && $err->hasError())
                      {
                        $err->push (qq(pushed after "insert_into_db()"));
                      }
                    else
                      {
                        ($err) = callExecProgram();
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
