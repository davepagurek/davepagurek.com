use v6;
use lib '../Cantilever/lib';
use lib '../perl6-web/lib';
use lib '../perl6-psgi/lib';
use lib '../perl6-http-easy/lib';
use Cantilever;
use Template::Mojo;

my $header = "templates/header.html.ep".IO.slurp;
my $footer = "templates/footer.html.ep".IO.slurp;
my $home-template = Template::Mojo.new($header ~ "templates/home.html.ep".IO.slurp ~ $footer);
my $page-template = Template::Mojo.new($header ~ "templates/page.html.ep".IO.slurp ~ $footer);
my $category-template = Template::Mojo.new($header ~ "templates/category.html.ep".IO.slurp ~ $footer);
my $archives-template = Template::Mojo.new($header ~ "templates/archives.html.ep".IO.slurp ~ $footer);
my $error-template = Template::Mojo.new($header ~ "templates/error.html.ep".IO.slurp ~ $footer);

my $app = Cantilever.new(
  dev => True,
  port => 80,
  export-dir => "/Users/dpagurek/Sites/export",
  #export-dir => "/Users/dpagurek/Sites",
  root => "http://www.davepagurek.com",
  #root => "http://localhost",
  mimefile => '/etc/mime.types'.IO.e ?? '/etc/mime.types' !! '/etc/apache2/mime.types', # For OSX
  ignore => [ / 'templates' ['/' .*] $ / ],
  ignore-cats => [ / 'images'$ / ],
  home => -> $c {
    $c<title> = "Dave Pagurek van Mossel - Programmer and Artist";
    $home-template.render($c);
  },
  archives => -> $c {
    $c<title> = "Portfolio";
    $archives-template.render($c);
  },
  page => -> $p {
    $p<title> = $p<page>.meta<title>;
    $page-template.render($p);
  },
  category => -> $c {
    $c<title> = $c<category>.meta<name>;
    $category-template.render($c);
  },
  error => -> $e {
    $e<title> = "Houston, we have a problem";
    $error-template.render($e);
  },
  custom-tags => [
    Cantilever::Page::CustomTag.new(
      matches-fn => -> $t { $t.type eq "img" && $t.attributes<full> },
      render-fn => -> $t, %options {
        my $caption = "";
        if $t.formatted-attributes<caption> {
          $caption = "<p class='caption'>" ~
            $t.formatted-attributes<caption>.subst(
              /'`'$<code>=(.+?)'`'/,
              -> $/ {'<span class=\'code\'>' ~ $<code> ~ '</span>'}
            ) ~
            "</p>";
        }

        "<div class='img'>"
        ~ "<a href='{$t.formatted-attributes<full>}'>"
        ~ "<img src='{$t.formatted-attributes<src>}' />"
        ~ "</a>"
        ~ $caption
        ~ "</div>";
      },
      block => True
    ),
    Cantilever::Page::CustomTag.new(
      matches-fn => -> $t { $t.type eq "code" },
      render-fn => -> $t, %options {
        "<pre><code class='hljs " ~
          ($t.attributes<lang> || "") ~
          "'>" ~
          $t.children[0].to-html(%options).subst(/^\n*/, '') ~
          "</code></pre>";
      },
      block => True
    )
  ]
);

$app.generate(copy => {
  "content/images" => "content/images",
  "style.css" => "style.css",
  "./calder.js" => "calder.js",
  "./calder.css" => "calder.css"
});