let img, samples, spread
const positions = [{ x: 0, y: 0 }]
function preload() {
  img = loadImage('apple.png')
}

function setup() {
  const canvas = createCanvas(200, 200);
  canvas.parent('canvasContainer');
  
  samples = document.getElementById('samples')
  spread = document.getElementById('spread')
  
  for (const el of [samples, spread]) {
    el.addEventListener('input', () => draw())
  }
  
  for (let i = 0; i < 200; i++) {
    positions.push({
      x: randomGaussian(0, 1 / 3),
      y: randomGaussian(0, 1 / 3),
    })
  }
  
  noLoop();
}

function draw() {
  background(255)
  imageMode(CENTER)
  push()
  translate(width / 2, height / 2)
  
  const numSamples = parseFloat(samples.value)
  const radius = parseFloat(spread.value)
  
  drawingContext.globalAlpha = 1 - pow(1 - 1 / numSamples, 1.8)
  
  for (let i = 0; i < numSamples; i++) {
    const { x, y } = positions[i % positions.length]
    push()
    translate(x * radius, y * radius)
    image(img, 0, 0)
    pop()
  }
  
  pop()
}