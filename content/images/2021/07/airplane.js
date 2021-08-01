const vert = `
attribute vec3 aPosition;
attribute vec3 aNormal;
attribute vec2 aTexCoord;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat3 uNormalMatrix;

uniform float time;

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
  float angle = acos(dot(displacementNormal, noDisplacementNormal));
  vec3 axis = normalize(cross(displacementNormal, noDisplacementNormal));
  mat4 rotation = axisAngleRotation(axis, angle);

  // Apply the rotation to the original normal
  vec3 normal = (rotation * vec4(origNormal, 0.)).xyz;
  return normal;
}

void main(void) {
  vec4 objSpacePosition = vec4(aPosition, 1.0);
  ${AutoDiff.gen((ad) => {
    const position = ad.vec2Param('objSpacePosition.xy')
    const origX = position.x()
    const origY = position.y()
    const origZ = ad.param('objSpacePosition.z');
    const x = origX.div(100)
    const y = origY.div(100)
    const position3 = ad.vec3(origX, origY, origZ);
    const time = ad.param('time')
    
    const map = (val, fromA, fromB, toA, toB, clamp) => {
      const mapped =
        val
          .sub(fromA)
          .div(fromB.sub(fromA))
          .mult(toA.sub(toB))
          .add(toB)
      return clamp ? val.clamp(toA, toB) : val
    }
    
    const rotateX = (pos, angle) => {
        const sa = ad.sin(angle)
        const ca = ad.cos(angle)
        return ad.vec3(
          pos.x(),
          pos.y().mult(ca).sub(pos.z().mult(sa)),
          pos.y().mult(sa).add(pos.z().mult(ca)),
        )
      }

    const timeJitter = ad.sin(time.mult(0.0001)).add(1).mult(0.5)
    const offset = ad.vec3(
      ad.sin(x.mult(6).add(time.mult(0.003))).mult(5),
      ad.sin(
        x
          .mult(2)
          .add(
            time.add(timeJitter).mult(0.005)
          )
          .add(100)
      ).mult(10).mult(timeJitter.sub(1).div(10).clamp(0, 0.5).add(0.5)),
      ad.sin(x.mult(8).add(time.mult(0.006)).add(10)).mult(0.5),
      //.add(ad.sin(y.mult(5).add(time.mult(0.005))).mult(5)),
    ).add(
      rotateX(
        position3,
        ad.sin(time.mult(0.001).sub(x)).add(ad.sin(time.mult(0.00025))).mult(0.5),
      ).sub(position3)
    ).add(
      rotateX(
        position3,
        map(ad.sin(time.mult(0.001).sub(x)), ad.val(0.99), ad.val(1), ad.val(0), ad.val(1), true).mult(Math.PI).mult(ad.sin(time.mult(0.001)))
      ).sub(position3)
    )
    offset.output('offset')
    offset.outputDeriv('dodx', origX)
    offset.outputDeriv('dody', origY)
  })}
  objSpacePosition.xyz += offset;
  vec3 slopeX = dodx + vec3(1.0, 0.0, 0.0);
  vec3 slopeYZ = dody + vec3(0.0, 1.0, 0.0);
  vec3 displacementNormal = normalize(cross(slopeX, slopeYZ));
  vec3 noDisplacementNormal = normalize(vec3(0.,-1.,1.));
  vec3 normal = adjustNormal(
    aNormal,
    displacementNormal,
    noDisplacementNormal
  );
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
  float reflectionStrength = 0.15;
  float reflectionAmount = reflectionStrength + fresnelStrength * fresnel(toSurface, normal, false);
  vec4 mixedColor = baseColor * diffuseColor + reflectionAmount * reflectionColor;
  gl_FragColor = vec4(mixedColor.rgb, 1.);
}
`

let reflection
let sphereMap
let irradianceMap
let tex
let airplane
function preload() {
  sphereMap = loadImage('outdoor_spheremap.jpg')
  irradianceMap = loadImage('outdoor_irradiance.png')
  airplane = loadModel('plane.obj')
}

let fromBG, toBG
function setup() {
  createCanvas(600, 600, WEBGL);
  pixelDensity(1);
  frameRate(30)

  fromBG = color('#ffa3ba')
  toBG = color('#fcff99')
  
  airplane.normalize()
  
  tex = createGraphics(500, 500)
  tex.background(220, 220, 240)
  tex.fill(255)
  tex.noStroke()
  tex.textSize(70)
  tex.textAlign(CENTER, CENTER)
  //texture.text('hello, world', texture.width / 2, texture.height / 2)
  
  reflection = createShader(vert, frag)
}

function draw() {
  background(lerpColor(fromBG, toBG, map(sin(frameCount / 30), -1, 1, 0, 1)))
  
  orbitControl(1.2, 1.2, 0.05)
  rotateY(PI*0.15)
  
  shader(reflection)
  reflection.setUniform('sphereMap', sphereMap)
  reflection.setUniform('roughSphereMap', irradianceMap)
  reflection.setUniform('texture', tex)
  reflection.setUniform('time', frameCount / 30 * 1000)
  
  noStroke()
  scale(2)
  scale(1, -1, 1)
  //translate(-14, 5, 18)
  //sphere(1, 50, 50)
  model(airplane)
}
