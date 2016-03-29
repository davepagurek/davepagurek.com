use v6;
use lib '../Cantilever/lib';
use lib '../perl6-web/lib';
use Cantilever;
use Template::Mojo;

my $header = "templates/header.html.ep".IO.slurp;
my $footer = "templates/footer.html.ep".IO.slurp;
my $home-template = Template::Mojo.new($header ~ "templates/home.html.ep".IO.slurp ~ $footer);
my $page-template = Template::Mojo.new($header ~ "templates/page.html.ep".IO.slurp ~ $footer);
my $category-template = Template::Mojo.new($header ~ "templates/category.html.ep".IO.slurp ~ $footer);
my $error-template = Template::Mojo.new($header ~ "templates/error.html.ep".IO.slurp ~ $footer);

my $app = Cantilever.new(
  dev => True,
  port => 3000,
  root => "http://localhost:3000",
  mimefile => '/etc/mime.types'.IO.e ?? '/etc/mime.types' !! '/etc/apache2/mime.types', # For OSX
  ignore => [ / 'templates'$ / ],
  home => -> $c {
    $home-template.render($c);
  },
  page => -> $p {
    $page-template.render($p);
  },
  category => -> $c {
    $category-template.render($c);
  },
  error => -> $e {
    $error-template.render($e);
  }
);

$app.run;
