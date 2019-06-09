use v6;
use lib "{$?FILE.IO.dirname}/../Cantilever/lib";
use Cantilever;
use Template::Mojo;

my $header = "{$?FILE.IO.dirname}/templates/header.html.ep".IO.slurp;
my $footer = "{$?FILE.IO.dirname}/templates/footer.html.ep".IO.slurp;
my $home-template = Template::Mojo.new($header ~ "{$?FILE.IO.dirname}/templates/home.html.ep".IO.slurp ~ $footer);
my $page-template = Template::Mojo.new($header ~ "{$?FILE.IO.dirname}/templates/page.html.ep".IO.slurp ~ $footer);
my $category-template = Template::Mojo.new($header ~ "{$?FILE.IO.dirname}/templates/category.html.ep".IO.slurp ~ $footer);
my $archives-template = Template::Mojo.new($header ~ "{$?FILE.IO.dirname}/templates/archives.html.ep".IO.slurp ~ $footer);
my $error-template = Template::Mojo.new($header ~ "{$?FILE.IO.dirname}/templates/error.html.ep".IO.slurp ~ $footer);

my $regenerate-after = 0;
for qw<header footer home page category archives error> -> $page {
  my $file = "{$?FILE.IO.dirname}/templates/{$page}.html.ep".IO;
  if $file.e {
    $regenerate-after = max($regenerate-after, $file.modified.DateTime.posix);
  }
}

my $local = %*ENV<ENV> eq "local";

my $app = Cantilever.new(
  dev => True,
  port => 80,
  export-dir => $local ?? "/Users/dpagurek/Sites" !! "/var/www/html",
  root => $local ?? "http://localhost" !!  "https://www.davepagurek.com",
  mimefile => '/etc/mime.types'.IO.e ?? '/etc/mime.types' !! '/etc/apache2/mime.types', # For OSX
  ignore => [ / 'templates' ['/' .*] $ / ],
  ignore-cats => [ / 'images'$ / ],
  home => -> $c {
    $c<title> = "Dave Pagurek van Mossel - Programmer and Artist";
    $home-template.render($c);
  },
  archives => -> $c {
    $c<title> = "Projects";
    $archives-template.render($c);
  },
  page => -> $p {
    $p<title> = $p<page>.meta<title>;
    $page-template.render($p);
  },
  category => -> $c {
    $c<title> = $c<category>.meta<name>;
    $c<filter> = -> $p {
      if $c<title> eq "Programming" {
        $p.meta<details>;
      } else {
        True;
      }
    };
    $c<small> = $c<category>.meta<small>;
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

        "<div class='img-container'><div class='img'>"
        ~ "<a href='{$t.formatted-attributes<full>}'>"
        ~ "<img src='{$t.formatted-attributes<src>}'"
        ~ ($t.formatted-attributes<width> ?? "width='{$t.formatted-attributes<width>}'" !! "")
        ~ " />"
        ~ "</a>"
        ~ $caption
        ~ "</div></div>";
      },
      block => True
    ),
    Cantilever::Page::CustomTag.new(
      matches-fn => -> $t { $t.type eq "code" },
      render-fn => -> $t, %options {
        "<pre><code class='" ~
          ($t.attributes<lang> || "") ~
          "'>" ~
          $t.children[0].to-html(%options).subst(/^\n*/, '') ~
          "</code></pre>";
      },
      block => True
    ),
    Cantilever::Page::CustomTag.new(
      matches-fn => -> $t { $t.type eq "math" },
      render-fn => -> $t, %options {
        "<span class='math inline'>\\(" ~
        $t.children.map(*.to-html(%options)).join("") ~
        "\\)</span>";
      }
    ),
    Cantilever::Page::CustomTag.new(
      matches-fn => -> $t { $t.type eq "table" },
      render-fn => -> $t, %options {
        "<div class='table-container'><table id=\"{$t.formatted-attributes<id> || ''}\">" ~
        $t.children.map(*.to-html(%options)).join("") ~
        "</table></div>";
      }
    )
  ]
);

$app.generate(
  copy => {
    "content/images" => "content/images",
    "icons" => "icons",
    "style.css" => "style.css",
    ".htaccess.export" => ".htaccess",
    "./generation.js" => "generation.js",
    "./generation.css" => "generation.css"
  },
  custom => {
    "side-projects" => -> $c {
      $c<title> = "Side Projects";
      $c<category> = $c<content>.get-category(["programming"]);
      $c<filter> = -> $p { !$p.meta<details>; };
      $c<small> = True;
      $category-template.render($c);
    }
  },
  regenerate-after => $regenerate-after
);
