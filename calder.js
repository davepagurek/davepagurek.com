var world = document.getElementById("world");
var MAX_DEPTH=12;

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

function makeLeaf(depth, side, size) {
  var leaf = document.createElement("div");
  leaf.className = "leaf";
  var angle = Math.random()*120-60;
  //leaf.style.transform = "scale(" + (Math.random()*2+1) + ") rotate3d(" + (Math.random()>0.5?1:0) + "," + (Math.random()>0.5?1:0) + "," + (Math.random()>0.5?1:0) + "," + angle + "deg)";
  size = size || (Math.random()*4+4)*(0.3+(MAX_DEPTH-depth+1)/MAX_DEPTH);
  leaf.style.width = size + "em";
  leaf.style.height = size + "em";
  leaf.style.marginBottom = "-" + size/2 + "em";
  leaf.style.marginLeft = -size + "em";
  var bg = lerpColor("#C993CF", "#1D9CE0", Math.random());
  var bgStr = "rgba(" + Math.round(bg.r) + "," + Math.round(bg.g) + "," + Math.round(bg.b) + ",0.8)";
  leaf.style.backgroundColor = bgStr;
  if (side === 0) {
    leaf.className += " flipped";
  }
  return leaf;
}

function makeAntenna(depth) {
  var height = (Math.random()*2+2)*(0.2+(MAX_DEPTH-depth+1)/MAX_DEPTH);
  var antenna = document.createElement("div");
  antenna.className = "branch";
  antenna.style.height = height + "em";
  //antenna.style.marginBottom = height + "em";
  var top = makeLeaf(depth+1, null, 3);
  top.style.marginLeft = -parseFloat(top.style.width)/2 + "em";
  top.style.marginBottom = height + "em";
  top.className += " ball";
  antenna.appendChild(top);
  return antenna;
}

function makeBranch(depth, prevAngle) {
  depth = depth || 0;
  prevAngle = prevAngle || 0;
  var branch = document.createElement("div");
  branch.className = "branch";
  
  var length;
  var angle;
  if (depth % 2 == 0) {
    length = depth == 2 ? 12 : (Math.random()*5+4)*(0.15+(MAX_DEPTH-depth+1)/MAX_DEPTH);
    branch.style.height = length + "em";
    var angleRange = ((MAX_DEPTH-depth)/MAX_DEPTH)*30+20;
    angle = Math.random()*angleRange;
    branch.style.transform = "rotateZ(" + (0-prevAngle) + "deg) rotateY(" + angle + "deg)";
    branch.style.marginBottom = -length + "em";

    if (depth === 0 || depth >= MAX_DEPTH) {
      var leaf = makeLeaf(depth+1, null, depth === 0 ? 10 : null);
      leaf.style.marginBottom = parseFloat(leaf.style.marginLeft) + "em";
      leaf.style.marginLeft = parseFloat(leaf.style.marginLeft)/2 + "em";
      leaf.className += " ball";
      if (depth === 0) {
        leaf.className += " dave";
      }
      leaf.style.transform += " rotateY(" + (-angle) + "deg)";
      branch.appendChild(leaf);
    }
    if (depth < MAX_DEPTH) {
      branch.appendChild(makeBranch(depth+1, 0));
      if (depth > 0 && Math.random()>0.7) {
        var antenna = makeAntenna(depth);
        antenna.style.marginBottom = length + "em";
        branch.appendChild(antenna);
      }
    }
  } else {
    branch.className += " beam";
    length = (Math.random()*15+8)*(0.3+(MAX_DEPTH-depth)/MAX_DEPTH);
    var angleRange = ((MAX_DEPTH-depth)/MAX_DEPTH)*30+20;
    angle = Math.random()*angleRange - angleRange/2;
    branch.style.width = length + "em";
    branch.style.marginLeft = -length/2 + "em";
    branch.style.transform = "rotate(" + (angle - prevAngle) + "deg)";
    if (depth < MAX_DEPTH) {
      var side = Math.random()>0.5 ? 1 : 0;
      var lhs = makeBranch(depth+1, angle);
      var rhs = makeLeaf(depth+1, side);
      
      (side == 0 ? lhs : rhs).style.marginLeft = (length-0.2) + "em";

      branch.appendChild(lhs);
      branch.appendChild(rhs);
    }
  }
  
  return branch;
}

var tree = makeBranch();
console.log(world);
console.log(world.appendChild);
console.log(tree);
world.appendChild(tree);

var center = {};
(window.onresize = function () {
	center = {
		x: window.innerWidth / 2,
		y: window.innerHeight / 2
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
    //if (r == "ry") m[r] += 60;
	});
  if (window.requestAnimationFrame) {
    window.requestAnimationFrame(function() {
      world.style.transform = "rotateX("+m.rx+"deg) rotateY("+m.ry+"deg)";
    });
  }
});
