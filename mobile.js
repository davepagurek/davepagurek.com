var world = document.getElementById("world");

var hexToRGB = function(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

var componentToHex = function(c) {
  var hex = int(c).toString(16);
  return hex.length == 1 ? "0" + hex : hex;
};

var rgbToHex = function(r, g, b) {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
};

var lerp = function(a, b, n) {
  return Math.abs((b - a) * n + a);
};

var lerpColor = function(beginning, end, percent) {
  var c1 = hexToRGB(beginning);
  var c2 = hexToRGB(end);
  return {
    r: lerp(c1.r, c2.r, percent),
    g: lerp(c1.g, c2.g, percent),
    b: lerp(c1.b, c2.b, percent)
  };
};

function makeLeaf() {
  var leaf = document.createElement("div");
  leaf.className = "leaf";
  var angle = Math.random()*120-60;
  //leaf.style.transform = "scale(" + (Math.random()*2+1) + ") rotate3d(" + (Math.random()>0.5?1:0) + "," + (Math.random()>0.5?1:0) + "," + (Math.random()>0.5?1:0) + "," + angle + "deg)";
  var size = Math.random()*10+4;
  leaf.style.width = size + "em";
  leaf.style.height = size + "em";
  leaf.style.marginBottom = "-" + size/2 + "em";
  leaf.style.marginLeft = "-" + size/2 + "em";
  var bg = lerpColor("#F5A9A9", "#CC2528", Math.random());
  var bgStr = "rgba(" + Math.round(bg.r) + "," + Math.round(bg.g) + "," + Math.round(bg.b) + ",0.8)";
  leaf.style.backgroundColor = bgStr;
  return leaf;
}

function makeBranch(depth) {
  depth = depth || 0;
  var branch = document.createElement("div");
  branch.className = "branch";
  
  var angle = Math.random()*(60*(depth+1)) - (30*(depth+1));
  var height;
  if (depth % 2 == 0) {
    height = Math.random()*9+1;
    branch.style.marginBottom = -height + "em";
    branch.style.height = height + "em";
  } else {
    height = Math.random()*20+5;
    branch.className +=  " beam";
    branch.style.marginLeft = -height/2 + "em";
    branch.style.width = height + "em";
  }
  branch.style.transform = "rotateY(" + Math.random()*360 +  "deg)";

  //branch.style.transform = 'rotate3d(' + (Math.random()>0.5?1:0) + "," + (Math.random()>0.5?1:0) + "," + 0 + "," + angle + "deg)";

  if (depth < 4) {
    var children;
    if (depth % 2 == 0) {
      children = 1;
    } else {
      children = 2; 
    }
    for (var i=0; i<children; i++) {
      var child = makeBranch(depth+1);
      if (depth % 2 == 1) {
        child.style.marginLeft = (i/(children-1))*(height + 0.5) + "em";
      }
      branch.appendChild(child);
    }
  } else {
    //var leaf = makeLeaf();
    //branch.appendChild(leaf);
  }
  return branch;
}

var tree = makeBranch();
world.appendChild(tree);

var center = {};
(window.onresize = function () {
	center = {
		x: document.body.offsetWidth / 2,
		y: document.body.offsetHeight / 2
	};
})();

document.body.addEventListener("mousemove", function(e) {
	var m = {
		x: e.clientX - center.x,
		y: e.clientY - center.y
	};
	m.rx = 0 - m.y;
	m.ry = m.x;
	["rx", "ry"].forEach(function (r) {
		m[r] *= 0.1;
		m[r] = Math.max(-60, m[r]);
		m[r] = Math.min(60, m[r]);
	});
	world.style.transform = "rotateX("+m.rx+"deg) rotateY("+m.ry+"deg)";
});
