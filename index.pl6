use v6;
use lib "{$?FILE.IO.dirname}/../Cantilever/lib";
use Cantilever;
use Template::Mojo;
use Shell::Command;

my $header = "{$?FILE.IO.dirname}/templates/header.html.ep".IO.slurp;
my $footer = "{$?FILE.IO.dirname}/templates/footer.html.ep".IO.slurp;
my $home-template = Template::Mojo.new($header ~ "{$?FILE.IO.dirname}/templates/home.html.ep".IO.slurp ~ $footer);
my $page-template = Template::Mojo.new($header ~ "{$?FILE.IO.dirname}/templates/page.html.ep".IO.slurp ~ $footer);
my $category-template = Template::Mojo.new($header ~ "{$?FILE.IO.dirname}/templates/category.html.ep".IO.slurp ~ $footer);
my $archives-template = Template::Mojo.new($header ~ "{$?FILE.IO.dirname}/templates/archives.html.ep".IO.slurp ~ $footer);
my $error-template = Template::Mojo.new($header ~ "{$?FILE.IO.dirname}/templates/error.html.ep".IO.slurp ~ $footer);
my $links-template = Template::Mojo.new($header ~ "{$?FILE.IO.dirname}/templates/links.html.ep".IO.slurp ~ $footer);
my $rss-template = Template::Mojo.new("{$?FILE.IO.dirname}/templates/rss.xml.ep".IO.slurp);

my $regenerate-after = 0;
for qw<header footer home page category archives error> -> $page {
  my $file = "{$?FILE.IO.dirname}/templates/{$page}.html.ep".IO;
  if $file.e {
    $regenerate-after = max($regenerate-after, $file.modified.DateTime.posix);
  }
}

my $local = %*ENV<ENV> && %*ENV<ENV> eq "local";

my $export-dir = $local ?? "/sites" !! "/var/www/html";
my $sketchId = 0;
my $app = Cantilever.new(
  dev => True,
  port => 80,
  export-dir => $export-dir,
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
    ),
    Cantilever::Page::CustomTag.new(
      matches-fn => -> $t { $t.type eq "sketch" },
      render-fn => -> $t, %options {
        my $code = "<script src='/sketchEmbed.js'></script>" ~
          "<iframe class='inlineSketch' border='0' width='" ~ $t.attributes<width> ~ "' height='" ~ $t.attributes<height> ~ "' id='sketch" ~ $sketchId ~ "'></iframe>" ~
          "<script>sketchEmbed('sketch" ~ $sketchId ~ "', `" ~
          $t.children[0].children[0].src.subst(/\`/, '\\`', :g).subst(/\$\{/, '\\${', :g) ~
          "`, '" ~
          $t.attributes<version> ~
          "')</script>";
        $sketchId++;

        if $t.attributes<code> {
          $code = $t.children[0].to-html(%options) ~ $code;
        }

        $code = "<div class='row full flush'><div class='sketchContainer'>" ~ $code ~ "</div></div>";

        $code;
      },
      block => True
    )
  ]
);

my %copy-paths := {
  "scripts" => "scripts",
  "icons" => "icons",
  "style.css" => "style.css",
  ".htaccess.export" => ".htaccess",
  "./bundle.js" => "bundle.js",
  "./sketchEmbed.js" => "sketchEmbed.js",
};
if $local {
  my @entries = "./content/images".IO;
  while @entries {
    my $folder = @entries.pop;
    my $exported-folder = $folder.Str.subst("./", $export-dir ~ "/").IO;

    # Create exported folder if it doesn't exist
    unless $exported-folder.e {
      say "Creating {$exported-folder.Str}";
      $exported-folder.mkdir;
    }

    # Remove old files that have been deleted
    for $exported-folder.dir -> $path {
      my $orig = $path.Str.subst($export-dir ~ "/", "./").IO;
      unless $orig.e {
        say "Removing {$path.Str}";
        $orig.unlink;
      }
    }

    # Copy all new or updated files
    for $folder.dir -> $path {
      if ($path.d) {
        @entries.push($path);
      } else {
        my $exported = $path.Str.subst("./", $export-dir ~ "/").IO;
        if !$exported.e || $exported.modified < $path.modified {
          say "Copying {$path.Str}";
          $path.copy($exported);
        }
      }
    }
  }
} else {
  %copy-paths{"content/images"} = "content/images";
}

$app.generate(
  copy => %copy-paths,
  custom => {
    "side-projects" => -> $c {
      $c<title> = "Side Projects";
      $c<category> = $c<content>.get-category(["programming"]);
      $c<filter> = -> $p { !$p.meta<details>; };
      $c<small> = True;
      $category-template.render($c);
    },
    "links" => -> $c {
      $c<title> = "Links";
      $c<type> = "links";
      $links-template.render($c);
    },
    "rss" => -> $c {
      $rss-template.render($c);
    },
  },
  regenerate-after => $regenerate-after
);

say $app.export-dir;
# Convert rss html from Cantilever into an xml file
cp("{$app.export-dir}/rss/index.html", "{$app.export-dir}/rss.xml");
#rmdir("{$app.export-dir}/rss")
