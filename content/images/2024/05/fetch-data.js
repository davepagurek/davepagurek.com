const { execSync } = require('child_process')
const { writeFileSync } = require('fs')
/*
console.log(JSON.stringify([...document.querySelectorAll(".sketchThumbContainer")].map(el => {
  const url = el.getAttribute('href')
  const urlMatch = /sketch\/(\d+)/.exec(url)
  const id = urlMatch && parseInt(urlMatch[1])
  const thumb = el.querySelector('img.sketchThumb')
  const thumbURL = thumb && thumb.getAttribute('src')
  const titleEl = el.querySelector('span.sketchTitle')
  const title = titleEl && titleEl.textContent
  const match = /^Genuary (\d+)/.exec(title)
  return { title, thumbURL, url, match, id }
}).filter(s => s.match && s.id > 1786697), null, 2))
 */
const data = [
  {
    "slug": 'ogres-are-like-onions',
    "title": "Ogres Are Like Onions",
    "thumbURL": "https://openprocessing-usercontent.s3.amazonaws.com/thumbnails/visualThumbnail1992686@2x.jpg?hash=20230903111828",
    "id": 1992686,
    "year": "2023",
    "month": "07",
    "day": "31",
    prompt: 'break it down',
    subtitle: 'An experiment with the SDF onion operator.',
    text: `I wanted to illustrate the layers inside an ogre. To do so, it combines p5 with Shader Park, and SDF generation library, which is now something you can use too!`
  },
  {
    "slug": 'spores',
    "title": "Spores",
    "thumbURL": "https://openprocessing-usercontent.s3.amazonaws.com/thumbnails/visualThumbnail1994537@2x.jpg?hash=20230905221026",
    "id": 1994537,
    "year": "2023",
    "month": "09",
    "day": "04",
    prompt: 'fungi',
    subtitle: 'Using framebuffer feedback to generate spore smoke.',
    text: `Each frame, the previous frame is stretched and distorted using a flow field and is made less opaque. The part that I think really sells it as smoke is that if the flow field stretches pixels apart, they're made even less opaque, and if it compresses pixels together, they become more opaue.`
  },
  {
    "slug": 'whats-this',
    "title": "What's This?",
    "thumbURL": "https://openprocessing-usercontent.s3.amazonaws.com/thumbnails/visualThumbnail2015020@2x.jpg?hash=20230921071121",
    "id": 2015020,
    "year": "2023",
    "month": "09",
    "day": "10",
    prompt: 'refreaction',
    subtitle: 'A curious pigeon investigating a bottle.',
    text: `This is another experiment with Shader Park. The pigeon is a character drawn via a Shader Park SDF, using smooth unions between shapes. The bottle and its refraction shader are done in p5. Some wallpapers were generated from this for the <a href="https://donorbox.org/to-the-power-of-10">Processing Decade of Code fundraiser.</a>`
  },
  {
    "slug": 'ransom-note-generator',
    "title": "Ransom Note Generator",
    "thumbURL": "https://openprocessing-usercontent.s3.amazonaws.com/thumbnails/visualThumbnail2015020@2x.jpg?hash=20230921071121",
    "id": 2015020,
    "year": "2023",
    "month": "09",
    "day": "20",
    prompt: 'cut and paste',
    subtitle: 'If you want to see your sketch again...',
    text: ``
  },
  {
    "slug": 'storm-brewing',
    "title": "Storm Brewing",
    "thumbURL": "https://openprocessing-usercontent.s3.amazonaws.com/thumbnails/visualThumbnail2092579@2x.jpg?hash=20231116185554",
    "id": 2092579,
    "year": "2023",
    "month": "11",
    "day": "16",
    prompt: 'electric growth',
    subtitle: 'A dramatic sky.',
    text: `The sky is some domain-warped Perlin noise, adjusted to have some more perspective.`
  },
  {
    "slug": 'nude-descending-staircase',
    "title": "Nude Descending Staircase",
    "thumbURL": "https://openprocessing-usercontent.s3.amazonaws.com/thumbnails/visualThumbnail2102145@2x.jpg?hash=20231124162421",
    "id": 2102145,
    "year": "2023",
    "month": "11",
    "day": "24",
    prompt: 'cubism',
    subtitle: 'I warned you about stairs, bro!',
    text: `I was intending on doing a more serious parody of Duchamp, but the motion I stumbled upon was just too funny, so my sketch pivoted into what you now see.`
  },
  {
    "slug": 'blocks',
    "title": "Blocks",
    "thumbURL": "https://openprocessing-usercontent.s3.amazonaws.com/thumbnails/visualThumbnail2124786@2x.jpg?hash=20231216101116",
    "id": 2124786,
    "year": "2023",
    "month": "12",
    "day": "13",
    prompt: 'improbable architecture',
    subtitle: 'Generative block structures.',
    text: `I just saw The Boy and the Heron, which includes some precariously
stacked blocks like this, so now I'm recreating it through code!

The stacks are made via a simple generating grammar that does no collision detection.

The blocks themselves are made using Evan Wallace's csg.js, but with a wrapper to be able to do booleans with p5.Geometry inputs. It's barely used in this sketch, but I've wanted to be able to do that for a while, expect more soon!`
  },
  {
    "slug": 'bezier-drawing-tool',
    "title": "Bezier Drawing Tool",
    "thumbURL": "https://openprocessing-usercontent.s3.amazonaws.com/thumbnails/visualThumbnail2177012@2x.jpg?hash=20240213132031",
    "id": 2177012,
    "year": "2024",
    "month": "02",
    "day": "13",
    prompt: 'build a tool',
    subtitle: 'A tool to draw and edit Bezier curves and output corresponding p5.js code.',
    text: `Jordanne challenged the chat to make one of these.`
  },
  {
    "slug": 'he-is-coming',
    "title": "He is coming",
    "thumbURL": "https://openprocessing-usercontent.s3.amazonaws.com/thumbnails/visualThumbnail2194641@2x.jpg?hash=20240301145411",
    "id": 2194641,
    "year": "2024",
    "month": "03",
    "day": "01",
    prompt: 'nope',
    subtitle: 'Run',
    text: `I had the boilerplate for this puppet from a Nude Descending a Staircase parody sketch a while ago, always with the intention of adding IK, but never actually using it. I finally did it though!`
  },
  {
    "slug": 'webcam-feedback',
    "title": "Webcam Feedback",
    "thumbURL": "https://openprocessing-usercontent.s3.amazonaws.com/thumbnails/visualThumbnail2242345@2x.jpg?hash=20240416201512",
    "id": 2242345,
    "year": "2024",
    "month": "04",
    "day": "16",
    prompt: 'feedback',
    subtitle: "It's you! Kind of.",
    text: `This uses some shaders to extract just the difference between frames, and then draws that to the screen with some feedback effects.`
  },
  {
    "slug": 'horse-factory',
    "title": "Horse Factory",
    "thumbURL": "https://openprocessing-usercontent.s3.amazonaws.com/thumbnails/visualThumbnail2248463@2x.jpg?hash=20240424201327",
    "id": 2248463,
    "year": "2024",
    "month": "04",
    "day": "22",
    prompt: 'industrial',
    subtitle: 'Good horses only!',
    text: `This is a continuation of my ongoing thesis that <a href="https://davepagurek.github.io/horse-drawings/">one cannot draw a horse without a reference.</a>`
  },
]

const getData = () => {
  for (const s of data) {
    execSync(`curl '${s.thumbURL}' -H 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7' -H 'Accept-Language: en-US,en;q=0.9' -H 'Cache-Control: no-cache' -H 'Pragma: no-cache' -H 'Sec-Fetch-Dest: document' -H 'Sec-Fetch-Mode: navigate' -H 'Sec-Fetch-Site: none' -H 'Sec-Fetch-User: ?1' -H 'Upgrade-Insecure-Requests: 1' -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36' -H 'sec-ch-ua: "Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"' -H 'sec-ch-ua-mobile: ?0' -H 'sec-ch-ua-platform: "macOS"' > ${s.slug}.jpg`)
    const src = `<!--
{
  "title": "${s.title}",
  "category": "programming",
  "date": "${s.year}-${s.month}-${s.day}",
  "excerpt": "${s.subtitle.replace(/"/g, "\\\"")}",
  "thumbnail": "%root%/content/images/2024/05/${s.slug}.jpg",
  "languages": [
    "Javascript",
    "p5.js"
  ]
}
-->

This a sketch for <a href="https://twitter.com/sableRaph">@sableRaph</a>'s weekly creative coding challenge. The theme this week was "${s.prompt}."

<iframe class="sketch" src="https://openprocessing.org/sketch/${s.id}/embed/" width="700" height="700"></iframe>

${s.text}
`
    writeFileSync(`../../../programming/${s.slug}.html`, src)
  }
}

getData()
