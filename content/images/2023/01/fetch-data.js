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
    "title": "Genuary 31: &Agrave;&#821;&#810;M&#823;&#851;&#843;&#7724;&#822;&#780;N&#824;&#826;&#838;O&#820;&#812;&#864;R&#823;&#796;&#771;P&#824;&#801;&#787;H&#820;&#805;&#843;S&#820;&#798;&#859;",
    "thumbURL": "https://openprocessing-usercontent.s3.amazonaws.com/thumbnails/visualThumbnail1816687@2x.jpg?hash=20230131065638",
    "url": "/sketch/1816687",
    "match": [
      "Genuary 31",
      "31"
    ],
    "id": 1816687,
    prompt: 'deliberately break one of your previous images',
    subtitle: 'A much more jank version of the previous Animorphs sketch',
    text: `So this is the code from <a href="%root%/content/programming/genuary-23-19">the previous Animorphs sketch</a>, but with random alignment of points on the contour of one image with the other to produce some much more jank morphs.`
  },
  {
    "title": "Genuary 30: Minimalism",
    "thumbURL": "https://openprocessing-usercontent.s3.amazonaws.com/thumbnails/visualThumbnail1815004@2x.jpg?hash=20230130070410",
    "url": "/sketch/1815004",
    "match": [
      "Genuary 30",
      "30"
    ],
    "id": 1815004,
    prompt: 'minimalism',
    subtitle: 'Just drawing a circle.',
    text: 'I made some code to just draw some circles, using a slightly interesting brush style.'
  },
  {
    "title": "Genuary 29: Maximalism",
    "thumbURL": "https://openprocessing-usercontent.s3.amazonaws.com/thumbnails/visualThumbnail1813839@2x.jpg?hash=20230129071218",
    "url": "/sketch/1813839",
    "match": [
      "Genuary 29",
      "29"
    ],
    "id": 1813839,
    prompt: 'maximalism',
    subtitle: 'All the moving parts of a video of Yonge-Dundas square overlaid on top of each other.',
    text: `I wanted something really busy and dense, so I started with a CC0 video of Yonge/Dundas, one of the busiest pedestrian spots in Toronto, and kept layering the moving parts of the video on top of itself again and again.`
  },
  {
    "title": "Genuary 28: Poetry",
    "thumbURL": "https://openprocessing-usercontent.s3.amazonaws.com/thumbnails/visualThumbnail1813315@2x.jpg?hash=20230128082141",
    "url": "/sketch/1813315",
    "match": [
      "Genuary 28",
      "28"
    ],
    "id": 1813315,
    prompt: 'generative poetry',
    subtitle: 'Markov chained Romeo and Juliet lines',
    text: 'I tried Markov chaining some lines from Romeo and Juliet to make some new lines.'
  },
  {
    "title": "Genuary 27: Klint",
    "thumbURL": "https://openprocessing-usercontent.s3.amazonaws.com/thumbnails/visualThumbnail1811939@2x.jpg?hash=20230127071122",
    "url": "/sketch/1811939",
    "match": [
      "Genuary 27",
      "27"
    ],
    "id": 1811939,
    prompt: 'in the style of Hilma Af Klint',
    subtitle: 'Hilma Af Klint inspired black-and-white shapes, animated',
    text: 'Klint has a recurring motif of black and white, which is a spiritual metaphor. I chose to animate one of these abstract forms.'
  },
  {
    "title": "Genuary 26: Kid Simulator",
    "thumbURL": "https://openprocessing-usercontent.s3.amazonaws.com/thumbnails/visualThumbnail1810396@2x.jpg?hash=20230126070645",
    "url": "/sketch/1810396",
    "match": [
      "Genuary 26",
      "26"
    ],
    "id": 1810396,
    prompt: 'my kid could have made that',
    subtitle: 'A simulation of what I used to do in mspaint as a kid.',
    text: `I kind of made a whole little mspaint-inspired app, but instead of being used by you, it's used by a generative kid """AI""" that selects a tool, a colour, and then scribbles. I think this is a fairly truthful recreation of what I used to do on the computer when I was small.`
  },
  {
    "title": "Genuary 25: Circles",
    "thumbURL": "https://openprocessing-usercontent.s3.amazonaws.com/thumbnails/visualThumbnail1808572@2x.jpg?hash=20230125070211",
    "url": "/sketch/1808572",
    "match": [
      "Genuary 25",
      "25"
    ],
    "id": 1808572,
    prompt: 'Yayoi Kusama',
    subtitle: 'I started thinking about her circle motif and ended up making cheese.',
    text: `I started thinking about her circle motif and ended up making cheese. This is using Evan Wallace's <a href="https://github.com/evanw/csg.js/">csg.js</a> library to poke holes in the cheese.`
  },
  {
    "title": "Genuary 24: Textile",
    "thumbURL": "https://openprocessing-usercontent.s3.amazonaws.com/thumbnails/visualThumbnail1806540@2x.jpg?hash=20230124073041",
    "url": "/sketch/1806540",
    "match": [
      "Genuary 24",
      "24"
    ],
    "id": 1806540,
    prompt: 'textile',
    subtitle: 'Animated weaving patterns.',
    text: `I've chosen to reuse some code that detects curve-curve intersections and calculates over-under weaving patterns to make an animated woven grid.`
  },
  {
    "title": "Genuary 23: Moire",
    "thumbURL": "https://openprocessing-usercontent.s3.amazonaws.com/thumbnails/visualThumbnail1804992@2x.jpg?hash=20230123071521",
    "url": "/sketch/1804992",
    "match": [
      "Genuary 23",
      "23"
    ],
    "id": 1804992,
    prompt: 'more Moir&eacute;',
    subtitle: `Another album art recreation, this time for Hot Chip's Why Make Sense?`,
    text: `This one is another album art recreation, this time for Hot Chip's <em>Why Make Sense?</em>, but animated.`
  },
  {
    "title": "Genuary 22: Dapple",
    "thumbURL": "https://openprocessing-usercontent.s3.amazonaws.com/thumbnails/visualThumbnail1804193@2x.jpg?hash=20230122085158",
    "url": "/sketch/1804193",
    "match": [
      "Genuary 22",
      "22"
    ],
    "id": 1804193,
    prompt: 'shadows',
    subtitle: 'An attempt at making a dappled light shader.',
    text: `I <a href="%root%/content/blog/dappled-light">made a blog post about how dappled light comes from pinhole cameras</a> a while ago. I thought I'd try making a shader simulation of this, using a convolution of a circle over a pixel grid of light between tree branches.`
  },
  {
    "title": "Genuary 21: Persian",
    "thumbURL": "https://openprocessing-usercontent.s3.amazonaws.com/thumbnails/visualThumbnail1803673@2x.jpg?hash=20230121071146",
    "url": "/sketch/1803673",
    "match": [
      "Genuary 21",
      "21"
    ],
    "id": 1803673,
    prompt: 'Persian Rug',
    subtitle: 'I may have forgotten about the "rug" part.',
    text: `I may have playfully forgotten abou the "rug" part of the prompt and instead made a Persian cat. Look at him go, though!`
  },
  {
    "title": "Genuary 20: Deco Goose",
    "thumbURL": "https://openprocessing-usercontent.s3.amazonaws.com/thumbnails/visualThumbnail1802361@2x.jpg?hash=20230120065846",
    "url": "/sketch/1802361",
    "match": [
      "Genuary 20",
      "20"
    ],
    "id": 1802361,
    prompt: 'art deco',
    subtitle: 'Alternate title: The Great Goosby',
    text: `An Art Deco inspired design of a goose. The gold shader took way less time than trying to type out Bezier curve points for this design (for some reason I thought it might be faster to do that with code than in Figma.)`
  },
  {
    "title": "Genuary 19: Animorphs",
    "thumbURL": "https://openprocessing-usercontent.s3.amazonaws.com/thumbnails/visualThumbnail1800875@2x.jpg?hash=20230119071404",
    "url": "/sketch/1800875",
    "match": [
      "Genuary 19",
      "19"
    ],
    "id": 1800875,
    prompt: 'black and white',
    subtitle: 'This was based on the prompt "black and white" if you can believe it. I can explain.',
    text: `So I should explain how this relates to the prompt. My brain broken-telephoned the prompt into "black <em>or</em> white," which is the name of a Michael Jackson song. <a href="https://www.youtube.com/watch?v=F2AitTPI5U0">The music video</a> for the song famously includes a bunch of morphs between people, as the technology for this had just been made recently, and this video is arguably the best use of it to date. So I wanted to do some morphs of my own. I thought an Animorphs book cover would be a good vehicle for this. I saw those in the library a lot as a kid, but I must admit that I never read any of them and just checked them out for the morph flipbook in the page margins (is it any surprise I ended up wanting to be an animator?) I have this great photo of Zlatko the cat sniffing the morning air, so I tried to replicate the pose.`
  },
  {
    "title": "Genuary 18: Not A Grid",
    "thumbURL": "https://openprocessing-usercontent.s3.amazonaws.com/thumbnails/visualThumbnail1799412@2x.jpg?hash=20230118072540",
    "url": "/sketch/1799412",
    "match": [
      "Genuary 18",
      "18"
    ],
    "id": 1799412,
    prompt: 'definitely not a grid',
    subtitle: 'A random arrangement of birds on wires',
    text: 'When thinking about something based on real life that has a fun, kind of random pattern, I thought birds on wires would make for a good sketch.'
  },
  {
    "title": "Genuary 17: AutoMondrian",
    "thumbURL": "https://openprocessing-usercontent.s3.amazonaws.com/thumbnails/visualThumbnail1797489@2x.jpg?hash=20230117072442",
    "url": "/sketch/1797489",
    "match": [
      "Genuary 17",
      "17"
    ],
    "id": 1797489,
    prompt: 'a grid inside a grid inside a grid',
    subtitle: `A generative version of everyone's favourite grid art.`,
    text: `There's a running joke in the creative coding community that the Mondrian colour scheme is overused, and because of that, we try to slip it in everywhere. Anyway, this whole sketch is just a thing to make more Mondrians.`
  },
  {
    "title": "Genuary 16: Fun House",
    "thumbURL": "https://openprocessing-usercontent.s3.amazonaws.com/thumbnails/visualThumbnail1796250@2x.jpg?hash=20230116050721",
    "url": "/sketch/1796250",
    "match": [
      "Genuary 16",
      "16"
    ],
    "id": 1796250,
    prompt: 'reflection of a reflection',
    subtitle: 'This sketch is just a bad joke.',
    text: 'So this sketch is basically a setup for a bad Shel Silverstein-eque joke. It turned out ok.'
  },
  {
    "title": "Genuary 15: Poisson Dansant",
    "thumbURL": "https://openprocessing-usercontent.s3.amazonaws.com/thumbnails/visualThumbnail1795560@2x.jpg?hash=20230115090917",
    "url": "/sketch/1795560",
    "match": [
      "Genuary 15",
      "15"
    ],
    "id": 1795560,
    prompt: 'sine waves',
    subtitle: 'I 3D scanned a cat toy and made it flop.',
    text: 'For Christmas Zlatko the cat got this fish toy that jumps when he touches it. I 3D scanned it and made it flop around using some sine waves in a shader.'
  },
  {
    "title": "Genuary 14: Writing",
    "thumbURL": "https://openprocessing-usercontent.s3.amazonaws.com/thumbnails/visualThumbnail1794821@2x.jpg?hash=20230114081306",
    "url": "/sketch/1794821",
    "match": [
      "Genuary 14",
      "14"
    ],
    "id": 1794821,
    prompt: 'aesemic',
    subtitle: 'Some English-like characters.',
    text: `I planned out some generative grammars for this while stuck on an airplane for hours while a short flight to Toronto got diverted to Sudbury for a while. All that to say, I didn't actually test this design much while I was planning it. It turned out ok, but looks like it'd make some funny noises.`
  },
  {
    "title": "Genuary 13: Calligraphy",
    "thumbURL": "https://openprocessing-usercontent.s3.amazonaws.com/thumbnails/visualThumbnail1793720@2x.jpg?hash=20230113071513",
    "url": "/sketch/1793720",
    "match": [
      "Genuary 13",
      "13"
    ],
    "id": 1793720,
    prompt: 'something you’ve always wanted to learn',
    subtitle: 'An experiment applying varying thickness to text',
    text: `A while ago I saw the <a href="https://github.com/LingDong-/p5-hershey-js">p5.hershey</a> library, which draws text made out of lines as opposed to outlines (the way the font this text is set in is rendered.) I wanted to use it to vary the thickness of the line to see what would happen, like having calligraphy with changing pen pressure.`
  },
  {
    "title": "Genuary 12: Subdivided",
    "thumbURL": "https://openprocessing-usercontent.s3.amazonaws.com/thumbnails/visualThumbnail1792345@2x.jpg?hash=20230112062803",
    "url": "/sketch/1792345",
    "match": [
      "Genuary 12",
      "12"
    ],
    "id": 1792345,
    prompt: 'tessellation',
    subtitle: 'Tessellated tetrahedrons, rectangularly projected.',
    text: 'I had some code from an earlier project to take vertices of a sphere (in this case, a tesselated subdivided tetrahedron) and use an equirectangular projection to map them to 2D. This makes for some interesting designs on its own.'
  },
  {
    "title": "Genuary 11: Rectangles",
    "thumbURL": "https://openprocessing-usercontent.s3.amazonaws.com/thumbnails/visualThumbnail1790693@2x.jpg?hash=20230111072347",
    "url": "/sketch/1790693",
    "match": [
      "Genuary 11",
      "11"
    ],
    "id": 1790693,
    prompt: 'suprematism',
    subtitle: 'This one is about shapes.',
    text: 'I chose to extract one small theme from this interesting art movement in order to iterate on: a focus on shapes and their composition.'
  },
  {
    "title": "Genuary 10: In C",
    "thumbURL": "https://openprocessing-usercontent.s3.amazonaws.com/thumbnails/visualThumbnail1788919@2x.jpg?hash=20230110072228",
    "url": "/sketch/1788919",
    "match": [
      "Genuary 10",
      "10"
    ],
    "id": 1788919,
    prompt: 'generative music',
    subtitle: `A music generator using some rules inspuired by Terry Riley's In C.`,
    text: `<a href="https://www.youtube.com/watch?v=DpYBhX0UH04">Terry Riley's piece <em>In C</em></a> consists of a bunch of small passages, and each instrument in the orchestra plays through them in sequence, but can repeat each passage as many times as they like before continuing on. The result is an ever shifting series of chords and textures. I tried to make something similar, on a much smaller scale, with some Tone.js instruments playing through a series of much simpler patterns.`
  },
  {
    "title": "Genuary 9: Friendship Plant",
    "thumbURL": "https://openprocessing-usercontent.s3.amazonaws.com/thumbnails/visualThumbnail1787913@2x.jpg?hash=20230109071604",
    "url": "/sketch/1787913",
    "match": [
      "Genuary 9",
      "9"
    ],
    "id": 1787913,
    prompt: 'plants',
    subtitle: `Generative 3D models of this plant I've got.`,
    text: 'Last year I was given one of these plants, and it just keeps making more of itself. In that spirit, I made a generator to keep making more.'
  },
  {
    "title": "Genuary 8: Gooey",
    "thumbURL": "https://openprocessing-usercontent.s3.amazonaws.com/thumbnails/visualThumbnail1787145@2x.jpg?hash=20230108091748",
    "url": "/sketch/1787145",
    "match": [
      "Genuary 8",
      "8"
    ],
    "id": 1787145,
    prompt: 'signed distance functions',
    subtitle: 'Some stringy, goopy rectangles.',
    text: `I've used some of <a href="https://iquilezles.org/articles/distfunctions2d/">Inogo Quilez's 2D signed distance functions</a> to make some Beziers and smooth union them together to get a stringy, goopy look.`
  }
]

const getData = () => {
  for (const s of data) {
    const n = s.match[1]
    const pn = n.length === 1 ? '0'+n : n
    //execSync(`curl '${s.thumbURL}' > genuary${n}.jpg`)
    const src = `<!--
{
  "title": "${s.title}",
  "category": "programming",
  "date": "2023-01-${pn}",
  "excerpt": "${s.subtitle.replace(/"/g, "\\\"")}",
  "thumbnail": "%root%/content/images/2023/01/genuary${n}.jpg",
  "languages": [
    "Javascript",
    "p5.js"
  ]
}
-->

This a sketch for Genuary, day ${n}: "${s.prompt}."

<iframe class="sketch" src="https://openprocessing.org/sketch/${s.id}/embed/" width="700" height="700"></iframe>

${s.text}
`
    writeFileSync(`../../../programming/genuary-23-${pn}.html`, src)
  }
}

getData()
