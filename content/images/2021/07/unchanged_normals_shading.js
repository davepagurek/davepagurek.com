const vert = `
attribute vec3 aPosition;
attribute vec3 aNormal;
attribute vec2 aTexCoord;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat3 uNormalMatrix;

uniform float time;
uniform int realNormal;

varying vec2 vTexCoord;
varying vec3 vNormal;
varying vec3 vPosition;

mat4 axisAngleRotation(vec3 axis, float angle) {
    axis = normalize(axis);
    float s = sin(angle);
    float c = cos(angle);
    float oc = 1.0 - c;
    
    return mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
                oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
                oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
                0.0,                                0.0,                                0.0,                                1.0);
}

vec3 adjustNormal(
  vec3 origNormal,
  vec3 displacementNormal,
  vec3 noDisplacementNormal
) {
  // Find the rotation induced by the displacement
  float angle = acos(dot(noDisplacementNormal, displacementNormal));
  vec3 axis = normalize(cross(noDisplacementNormal, displacementNormal));
  mat4 rotation = axisAngleRotation(axis, -angle);

  // Apply the rotation to the original normal
  vec3 normal = (rotation * vec4(origNormal, 0.)).xyz;
  return normal;
}

void main(void) {
  vec4 objSpacePosition = vec4(aPosition, 1.0);
  float origZ = objSpacePosition.z;
  float x = objSpacePosition.x;
  float y = objSpacePosition.y;
  ${AutoDiff.gen((ad) => {
    const position = ad.vec3Param('objSpacePosition.xyz')
    const x = position.x()
    const y = position.y()
    const z = position.z()
    const time = ad.param('time')
    const speedX = 1.5
    const speedY = 2.8

    const offset = ad.vec3(
      ad.sin(z.mult(3).add(time.mult(0.003))).mult(0.025),
      ad.sin(x.mult(8).add(time.mult(0.002)).add(10)).mult(0.025),
      ad.sin(y.mult(6).add(time.mult(0.001)).add(100).add(x.mult(2))).mult(0.15),
    )
    offset.output('offset')
    offset.outputDeriv('dodx', x)
    offset.outputDeriv('dody', y)
    offset.outputDeriv('dodz', z)
  })}
  objSpacePosition.xyz += offset;
  vec3 normal = aNormal;
  if (realNormal == 1) {
    vec3 slopeX = dodx + vec3(1.0, 0.0, 0.0);
    vec3 slopeYZ = dody + dodz + vec3(0.0, 1.0, 1.0);
    vec3 displacementNormal = normalize(cross(slopeX, slopeYZ));
    vec3 noDisplacementNormal = normalize(vec3(0.,-1.,1.));
    normal = adjustNormal(
      aNormal,
      displacementNormal,
      noDisplacementNormal
    );
  }
  //normal = displacementNormal;

  vec4 worldSpacePosition = uModelViewMatrix * objSpacePosition;
  gl_Position = uProjectionMatrix * worldSpacePosition;
  vTexCoord = aTexCoord;
  vPosition = worldSpacePosition.xyz;
  vNormal = uNormalMatrix * normal;
}
`

const frag = `
precision mediump float;
varying vec2 vTexCoord;
varying vec3 vNormal;
varying vec3 vPosition;
uniform sampler2D sphereMap;
uniform sampler2D roughSphereMap;
uniform sampler2D texture;

const float PI = ${Math.PI.toFixed(10)};

float map(float val, float inA, float inB, float outA, float outB) {
  return (val - inA) / (inB - inA) * (outB - outA) + outA;
}

vec4 sampleBackground(vec3 normal, sampler2D bg) {
  // x = rho sin(phi) cos(theta)
  // y = rho cos(phi)
  // z = rho sin(phi) sin(theta)
  // rho = 1 after normalization
  float phi = acos(normal.y);
  float sinPhi = sin(phi);
  float theta =
    abs(sinPhi) > 0.0001
      ? acos(normal.x / sinPhi)
      : 0.;
  vec2 coord = vec2(
    map(theta, 0., PI, 0., 1.),
    map(phi, 0., PI, 1., 0.)
  );
  return texture2D(bg, coord);
}

vec4 remapShadows(vec4 color) {
  float factor = 10.;
  return vec4(
    pow(color.x, factor),
    pow(color.y, factor),
    pow(color.z, factor),
    color.w
  );
}

float fresnel(vec3 direction, vec3 normal, bool invert) {
    vec3 halfDirection = normalize( normal + direction );
    float cosine = dot( halfDirection, direction );
    float product = max( cosine, 0.0 );
    float factor = invert ? 1.0 - pow( product, 5.0 ) : pow( product, 5.0 );
    return factor;
}

void main() {
  vec3 normal = normalize(vNormal);

  vec3 toSurface = normalize(vPosition);
  vec3 reflectedDir = normalize(reflect(toSurface, normal));

  vec4 baseColor = texture2D(texture, vTexCoord);
  vec4 diffuseColor = sampleBackground(normal, roughSphereMap);
  vec4 reflectionColor = remapShadows(sampleBackground(reflectedDir, sphereMap));

  float fresnelStrength = 1.;
  float reflectionStrength = 0.05;
  float reflectionAmount = reflectionStrength + fresnelStrength * fresnel(toSurface, normal, false);
  vec4 mixedColor = baseColor * 1.2 * diffuseColor + reflectionAmount * reflectionColor;
  gl_FragColor = vec4(mixedColor.rgb, 1.);
}
`

let reflection
let sphereMap
let irradianceMap
let texture1, texture2
function preload() {
  sphereMap = loadImage('office_spheremap.jpg')
  irradianceMap = loadImage('office_irradiance.png')
}

function setup() {
  createCanvas(window.innerWidth || 400, window.innerHeight || 400, WEBGL);
  pixelDensity(1)
  
  texture1 = createGraphics(500, 500);
  texture2 = createGraphics(500, 500);
  [texture1, texture2].forEach((texture, i) => {
    texture.background(150, 150, 170)
    texture.fill(255)
    texture.noStroke()
    texture.textSize(25)
    texture.textAlign(CENTER, CENTER)
    const content = i == 0 ? 'unchanged\nnormals' : 'proper\nnormals'
    texture.text(content, texture.width / 2, texture.height / 2)
  })
  
  reflection = createShader(vert, frag)
}

function draw() {
  background(255)
  orbitControl(1.2, 1.2, 0.05)
  
  shader(reflection)
  reflection.setUniform('sphereMap', sphereMap)
  reflection.setUniform('roughSphereMap', irradianceMap)
  reflection.setUniform('time', millis())
  
  noStroke()
  const r = 100
  scale(r)

  push()
  translate(-1.2, 0, 0)
  rotateY(PI)
  reflection.setUniform('texture', texture1)
  reflection.setUniform('realNormal', false)
  sphere(1, 30, 30)
  //plane(1, 1, 50, 50)
  pop()

  push()
  translate(1.2, 0, 0)
  rotateY(PI)
  reflection.setUniform('texture', texture2)
  reflection.setUniform('realNormal', true)
  sphere(1, 30, 30)
  //plane(1, 1, 50, 50)
  pop()
  //sphere(1, 50, 50)
}