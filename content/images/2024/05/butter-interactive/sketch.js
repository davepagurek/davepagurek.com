p5.disableFriendlyErrors = true;
let font
let butterModel;
let butterMaterial;
let corkscrew;
function preload() {
  butterModel = loadModel("butter-small.obj", true);
  // Raleway 700
  font = loadFont('https://fonts.gstatic.com/s/raleway/v28/1Ptxg8zYS_SKggPN4iEgvnHyvveLxVs9pYCPNLA3JC9c.ttf');
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  
  mouseX = width / 2
  mouseY = height / 2

  // https://github.com/davepagurek/p5.warp
  butterMaterial = createWarp(({ glsl, millis, position, mouse, size }) => {
    const localMouse = mouse.div(size).mult(2).sub(glsl.vec2(1, 1)).mult(100);
    const fromMouse = position.xz().sub(localMouse);
    const offset2D = fromMouse.scale(0.1);
    const offsetScale = offset2D.x().pow(2).add(offset2D.y().pow(2)).pow(0.5);
    const scaleFactor = glsl.val(1).sub(offsetScale.div(50)).pow(10);
    const factor = glsl.val(1).div(offsetScale).mult(scaleFactor).mult(80);
    const offsetXZ = glsl.vec3(
      offset2D.x().mult(factor),
      0,
      offset2D.y().mult(factor)
    );
    const offsetY = glsl.vec3(0, scaleFactor.mult(50), 0);
    const mouseOffset = offsetY
      .mult(scaleFactor)
      .add(offsetXZ.mult(glsl.val(1).sub(scaleFactor)));
    return mouseOffset.add(
      glsl.vec3(
        millis.mult(0.003).add(position.z().mult(0.01)).sin().mult(5),
        0,
        millis.mult(0.002).add(position.x().mult(0.03)).sin().mult(5)
      )
    );
  });

  const points = [];
  const r = 20;
  for (let theta = 0; theta < 6 * 2 * PI; theta += 0.1) {
    const x = r * cos(theta);
    const z = r * sin(theta);
    const y = map(theta, 0, 6 * 2 * PI, -75, 75);
    points.push(createVector(x, y, z));
  }
  corkscrew = pointsToPipeGeom(points, 10);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  const t = millis();

  clear();
  background(0);
  push();
  rotateY(map(mouseX, 0, width, -1, 1) * 0.35 * PI)
  rotateX(map(mouseY, 0, height, -1, 1) * 0.35 * PI)

  scale(min(width, height) / 600);
  directionalLight(200, 200, 200, -0.1, 0.2, -1);
  // directionalLight(200, 200, 200, -0.8, 0.1, -0.1);
  directionalLight(100, 100, 100, 0, 0.4, -0.1);

  push();
  butterMaterial();
  ambientLight("#e8d0c5");
  // ambientMaterial(122, 56, 5);
  ambientMaterial('#b85e1a');
  // fill(240, 229, 105);
  fill('#f5f1cb')
  specularMaterial(100);
  noStroke();

  rotateX(-PI / 2);
  scale(2.5);
  shininess(200);
  model(butterModel);
  pop();

  push();
  translate(-200, sin(t * 0.002) * 20 - 200, -200);
  rotateZ(sin(t * 0.0035) * PI * 0.1)
  noStroke()
  ambientLight(100)
  fill("#325aa8");
  ambientMaterial('#1b4547')
  specularMaterial(100)
  shininess(300)
  model(corkscrew);
  pop();
  
  push();
  translate(150, sin(t * 0.0025) * 20 + 150, 100);
  rotateZ(sin(t * 0.0025 - 0.5) * PI * 0.1)
  noStroke()
  ambientLight(100)
  fill("#bd2a2a");
  specularMaterial(255)
  shininess(300)
  sphere(50)
  pop();

  pop();
}

const pointsToPipeGeom = function (centers, pipeR) {
  return new p5.Geometry(1, 1, function () {
    this.gid = "pipe";
    const numPoints = centers.length;
    const numCirclePoints = 12;

    const tangents = [];
    const normals = [];
    const biNormals = [];
    for (let i = 0; i < numPoints - 1; i++) {
      tangents.push(centers[i + 1].copy().sub(centers[i]).normalize());
    }
    tangents.push(tangents[tangents.length - 1]);

    const up = createVector(0, 1, 0);
    for (let i = 0; i < numPoints; i++) {
      const tangent = tangents[i];
      const normal = up.cross(tangent).normalize();
      normals.push(normal);
    }

    normals.forEach((normal, i) => {
      const biNormalVec = tangents[i].cross(normal).normalize();
      biNormals.push(biNormalVec);
      const biBiNormal = biNormalVec.cross(tangents[i]).normalize();
      normal.set(biBiNormal.x, biBiNormal.y, biBiNormal.z);
    });

    for (let i = 0; i < numPoints; i++) {
      const frac = i / (numPoints - 1);
      const u = frac;
      const ringStartIdx = this.vertices.length;
      const prevRingStartIdx = ringStartIdx - numCirclePoints;

      const centerVec = centers[i];
      const normalVec = normals[i];
      const biNormalVec = biNormals[i];

      for (let j = 0; j < numCirclePoints; j++) {
        const angle = (j / numCirclePoints) * TWO_PI;
        const v = j / (numCirclePoints - 1);
        const pt = centerVec
          .copy()
          .add(normalVec.copy().mult(pipeR * sin(angle)))
          .add(biNormalVec.copy().mult(pipeR * cos(angle)));
        this.vertices.push(pt);
        this.vertexNormals.push(pt.copy().sub(centerVec).normalize());
        this.uvs.push([u, v]);

        if (i > 0) {
          this.faces.push([
            prevRingStartIdx + j,
            ringStartIdx + j,
            ringStartIdx + ((j + 1) % numCirclePoints),
          ]);
          this.faces.push([
            ringStartIdx + ((j + 1) % numCirclePoints),
            prevRingStartIdx + ((j + 1) % numCirclePoints),
            prevRingStartIdx + j,
          ]);
        }
      }
    }
  });
};
