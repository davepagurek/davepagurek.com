function sketchEmbed(id, code, version) {
  const iframe = document.getElementById(id);

  const wrapSketch = (sketchCode) => {
    if (sketchCode !== "" && !sketchCode.includes("setup")) {
      return `
        function setup() {
          createCanvas(100, 100);
          background(200);
          ${sketchCode}
        }`;
    }
    return sketchCode;
  };

  let mounted = false;

  const rerender = () => {
    if (!mounted) {
      iframe.srcdoc = '';
    } else {
      iframe.srcdoc = `
<!DOCTYPE html>
<meta charset="utf8" />
<style type='text/css'>
html, body {
  margin: 0;
  padding: 0;
}
canvas {
  display: block;
}
</style>
<script type="text/javascript" src="https://cdn.jsdelivr.net/npm/p5@${version}/lib/p5.min.js"></script>
<body>
<script id="code" type="text/javascript">${wrapSketch(code) || ""}</script>
</body>`;
    }
  }

  const { IntersectionObserver } = window;
  if (!IntersectionObserver) {
    mounted = true;
    rerender();
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        mounted = entry.isIntersecting;
        rerender();
      });
    },
    { rootMargin: "20px" },
  );
  observer.observe(iframe);
}
