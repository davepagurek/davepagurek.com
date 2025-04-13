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
}).filter(s => s.match && s.id > 2248463), null, 2))
 */
const genuaries = ["Vertical or horizontal lines only.","Layers upon layers upon layers.","Exactly 42 lines of code.","Black on black.","Isometric Art (No vanishing points).","Make a landscape using only primitive shapes.","Use software that is not intended to create art or images.","Draw one million of something.","The textile design patterns of public transport seating.","You can only use TAU in your code, no other number allowed.","Impossible day - Try to do something that feels impossible for you to do. Maybe it is impossible. Maybe it’s too ambitious. Maybe it’s something you know nothing about how to accomplish.","Subdivision.","Triangles and nothing else.","Pure black and white. No gray.","Design a rug.","Generative palette.","What happens if pi=4?","What does wind look like?","Op Art.","Generative Architecture.","Create a collision detection system (no libraries allowed).","Gradients only.","Inspired by brutalism.","Geometric art - pick either a circle, rectangle, or triangle and use only that geometric shape.","One line that may or may not intersect itself","Symmetry.","Make something interesting with no randomness or noise or trig.","Infinite Scroll.","Grid-based graphic design.","Abstract map.","Pixel sorting."]
const data = [
  {
    slug: 'snek',
    subtitle: 'A wiggly snake.',
    "title": "snek",
    prompt: 'SNAKE',
    "thumbURL": "https://kyoko.openprocessing.org/thumbnails/visualThumbnail2529270@2x.jpg?hash=20250201214546",
    "url": "/sketch/2529270",
    "match": null,
    "id": 2529270
  },
  {
    slug: 'genuary31-camera-depth',
    subtitle: 'A webcam feed + an ML-generated depth buffer. Leave 3D trails in space!',
    "title": "Genuary 31: Camera Depth",
    "thumbURL": "https://kyoko.openprocessing.org/thumbnails/visualThumbnail2528177@2x.jpg?hash=20250131130704",
    "url": "/sketch/2528177",
    "match": [
      "Genuary 31",
      "31"
    ],
    "id": 2528177
  },
  {
    slug: 'genuary30-abstract-map',
    subtitle: 'Generative maps drawn by a computer that can\'t quite remember the shape of the world.',
    "title": "Genuary 30: Abstract Map",
    "thumbURL": "https://kyoko.openprocessing.org/thumbnails/visualThumbnail2526793@2x.jpg?hash=20250130124248",
    "url": "/sketch/2526793",
    "match": [
      "Genuary 30",
      "30"
    ],
    "id": 2526793
  },
  {
    slug: 'genuary29-grid',
    subtitle: 'An arrangement inspired by the recent Brian Eno documentary.',
    "title": "Genuary 29: Grid",
    "thumbURL": "https://kyoko.openprocessing.org/thumbnails/visualThumbnail2525702@2x.jpg?hash=20250129150906",
    "url": "/sketch/2525702",
    "match": [
      "Genuary 29",
      "29"
    ],
    "id": 2525702
  },
  {
    slug: 'genuary28-evolution',
    subtitle: 'The Evolution of Man illustration, but where it just keeps going forward in time.',
    "title": "Genuary 28: Evolution Scroll",
    "thumbURL": "https://kyoko.openprocessing.org/thumbnails/visualThumbnail2524528@2x.jpg?hash=20250128131726",
    "url": "/sketch/2524528",
    "match": [
      "Genuary 28",
      "28"
    ],
    "id": 2524528
  },
  {
    slug: 'genuary27-curvature',
    subtitle: 'Visualizing the curvature around text in different fonts.',
    "title": "Genuary 27: Curvature",
    "thumbURL": "https://kyoko.openprocessing.org/thumbnails/visualThumbnail2523015@2x.jpg?hash=20250127131636",
    "url": "/sketch/2523015",
    "match": [
      "Genuary 27",
      "27"
    ],
    "id": 2523015
  },
  {
    slug: 'genuary26-symmetry',
    subtitle: 'Another Origin of Symmetry cover art recreation. This time, it\'s the 20th anniversary edition.',
    "title": "Genuary 26: Symmetry",
    "thumbURL": "https://kyoko.openprocessing.org/thumbnails/visualThumbnail2522238@2x.jpg?hash=20250126145346",
    "url": "/sketch/2522238",
    "match": [
      "Genuary 26",
      "26"
    ],
    "id": 2522238
  },
  {
    slug: 'genuary25-webcam-line',
    subtitle: '"We have Traveling Salesman Problem at home." A greedy approximation of TSP drawing a line through all the points.',
    "title": "Genuary 25: Webcam line",
    "thumbURL": "https://kyoko.openprocessing.org/thumbnails/visualThumbnail2521711@2x.jpg?hash=20250125131038",
    "url": "/sketch/2521711",
    "match": [
      "Genuary 25",
      "25"
    ],
    "id": 2521711
  },
  {
    slug: 'genuary24-circles',
    subtitle: 'A version of the classic default p5.js sketch, but using a 2.0 prerelease.',
    "title": "Genuary 24: Circles",
    "thumbURL": "https://kyoko.openprocessing.org/thumbnails/visualThumbnail2520846@2x.jpg?hash=20250124130928",
    "url": "/sketch/2520846",
    "match": [
      "Genuary 24",
      "24"
    ],
    "id": 2520846
  },
  {
    slug: 'genuary23-brutalism',
    subtitle: 'Generative concrete structures.',
    "title": "Genuary 23: Brutalism",
    "thumbURL": "https://kyoko.openprocessing.org/thumbnails/visualThumbnail2519828@2x.jpg?hash=20250123125055",
    "url": "/sketch/2519828",
    "match": [
      "Genuary 23",
      "23"
    ],
    "id": 2519828
  },
  {
    slug: 'genuary22-gradients',
    subtitle: 'A Shader Hooks test: generative word art!',
    "title": "Genuary 22: Gradients",
    "thumbURL": "https://kyoko.openprocessing.org/thumbnails/visualThumbnail2518681@2x.jpg?hash=20250122125240",
    "url": "/sketch/2518681",
    "match": [
      "Genuary 22",
      "22"
    ],
    "id": 2518681
  },
  {
    slug: 'genuary21-loop-picker',
    subtitle: "An implementation of the oldschool object picking algorithm, where you render an image using per-object color IDs.",
    "title": "Genuary 21: Loop Picker",
    "thumbURL": "https://kyoko.openprocessing.org/thumbnails/visualThumbnail2517578@2x.jpg?hash=20250121134631",
    "url": "/sketch/2517578",
    "match": [
      "Genuary 21",
      "21"
    ],
    "id": 2517578
  },
  {
    slug: 'genuary20-cat-architecture',
    subtitle: "We've all generated buildings before. What about structures for cats?",
    "title": "Genuary 20: Cat Architecture",
    "thumbURL": "https://kyoko.openprocessing.org/thumbnails/visualThumbnail2516605@2x.jpg?hash=20250120130943",
    "url": "/sketch/2516605",
    "match": [
      "Genuary 20",
      "20"
    ],
    "id": 2516605
  },
  {
    slug: 'genuary19-op-art',
    subtitle: 'Diving through some posterized shapes.',
    "title": "Genuary 19: Op Art",
    "thumbURL": "https://kyoko.openprocessing.org/thumbnails/visualThumbnail2515954@2x.jpg?hash=20250119141709",
    "url": "/sketch/2515954",
    "match": [
      "Genuary 19",
      "19"
    ],
    "id": 2515954
  },
  {
    slug: 'genuary18-wind',
    subtitle: 'Abstract snow blowing across a road',
    "title": "Genuary 18: Wind",
    "thumbURL": "https://kyoko.openprocessing.org/thumbnails/visualThumbnail2515501@2x.jpg?hash=20250118155350",
    "url": "/sketch/2515501",
    "match": [
      "Genuary 18",
      "18"
    ],
    "id": 2515501
  },
  {
    slug: 'genuary17-redefine-pi',
    subtitle: 'What happens to a physics simulation when you change the value of pi to something else mid-simulation?',
    "title": "Genuary 17: Redefine Pi",
    "thumbURL": "https://kyoko.openprocessing.org/thumbnails/visualThumbnail2514131@2x.jpg?hash=20250117130917",
    "url": "/sketch/2514131",
    "match": [
      "Genuary 17",
      "17"
    ],
    "id": 2514131
  },
  {
    slug: 'genuary16-color-schemes',
    subtitle: '"We have Rothko at home"',
    "title": "Genuary 16: Color Schemes",
    "thumbURL": "https://kyoko.openprocessing.org/thumbnails/visualThumbnail2512760@2x.jpg?hash=20250116134852",
    "url": "/sketch/2512760",
    "match": [
      "Genuary 16",
      "16"
    ],
    "id": 2512760
  },
  {
    slug: 'genuary15-rugs',
    subtitle: 'Generative rug patterns. I would put these in my home!',
    "title": "Genuary 15: Rugs",
    "thumbURL": "https://kyoko.openprocessing.org/thumbnails/visualThumbnail2511138@2x.jpg?hash=20250115135023",
    "url": "/sketch/2511138",
    "match": [
      "Genuary 15",
      "15"
    ],
    "id": 2511138
  },
  {
    slug: 'genuary14-bw',
    subtitle: 'An animated fork of some earlier generative root forms.',
    "title": "Genuary 14: B/W",
    "thumbURL": "https://kyoko.openprocessing.org/thumbnails/visualThumbnail2509678@2x.jpg?hash=20250114131426",
    "url": "/sketch/2509678",
    "match": [
      "Genuary 14",
      "14"
    ],
    "id": 2509678
  },
  {
    slug: 'genuary13-triangles',
    subtitle: 'The treachery of 3D images.',
    "title": "Genuary 13: Just Triangles",
    "thumbURL": "https://kyoko.openprocessing.org/thumbnails/visualThumbnail2508143@2x.jpg?hash=20250113125552",
    "url": "/sketch/2508143",
    "match": [
      "Genuary 13",
      "13"
    ],
    "id": 2508143
  },
  {
    slug: 'genuary12-subdivision',
    subtitle: 'Butterfly subdivision on CSG shapes.',
    "title": "Genuary 12: Subdivision",
    "thumbURL": "https://kyoko.openprocessing.org/thumbnails/visualThumbnail2507238@2x.jpg?hash=20250112132620",
    "url": "/sketch/2507238",
    "match": [
      "Genuary 12",
      "12"
    ],
    "id": 2507238
  },
  {
    slug: 'genuary11-self-drawing',
    subtitle: 'I wanted to be able to have text in arbitrary fonts draw in as if it were drawn by a pen. I did not quite succeed.',
    "title": "Genuary 11: Attempt at self-drawing text",
    "thumbURL": "https://kyoko.openprocessing.org/thumbnails/visualThumbnail2506674@2x.jpg?hash=20250111135818",
    "url": "/sketch/2506674",
    "match": [
      "Genuary 11",
      "11"
    ],
    "id": 2506674
  },
  {
    slug: 'genuary10-tau',
    subtitle: 'A pigeon drawn using no number constants except tau. This was a lot harder than expected.',
    "title": "Genuary 10: Tau",
    "thumbURL": "https://kyoko.openprocessing.org/thumbnails/visualThumbnail2505816@2x.jpg?hash=20250110125356",
    "url": "/sketch/2505816",
    "match": [
      "Genuary 10",
      "10"
    ],
    "id": 2505816
  },
  {
    slug: 'genuary9-transit-seats',
    subtitle: 'A fork of an earlier subway sketch, with shader patterns on the seats this time.',
    "title": "Genuary 9: Transit Seats",
    "thumbURL": "https://kyoko.openprocessing.org/thumbnails/visualThumbnail2504748@2x.jpg?hash=20250109130651",
    "url": "/sketch/2504748",
    "match": [
      "Genuary 9",
      "9"
    ],
    "id": 2504748
  },
  {
    slug: 'genuary8-1000000',
    subtitle: 'Swirly galaxy shapes drawn via 1,000,000 points.',
    "title": "Genuary 8: 1,000,000",
    "thumbURL": "https://kyoko.openprocessing.org/thumbnails/visualThumbnail2503414@2x.jpg?hash=20250108140219",
    "url": "/sketch/2503414",
    "match": [
      "Genuary 8",
      "8"
    ],
    "id": 2503414
  },
  {
    slug: 'genuary7-not-made-for-images',
    subtitle: 'Quickselect, done per row on an image.',
    "title": "Genuary 7: Not Made for Images",
    "thumbURL": "https://kyoko.openprocessing.org/thumbnails/visualThumbnail2502181@2x.jpg?hash=20250107122109",
    "url": "/sketch/2502181",
    "match": [
      "Genuary 7",
      "7"
    ],
    "id": 2502181
  },
  {
    slug: 'genuary6-landscape',
    subtitle: 'A forest made only of box() primitives.',
    "title": "Genuary 6: Landscape",
    "thumbURL": "https://kyoko.openprocessing.org/thumbnails/visualThumbnail2501198@2x.jpg?hash=20250106125726",
    "url": "/sketch/2501198",
    "match": [
      "Genuary 6",
      "6"
    ],
    "id": 2501198
  },
  {
    slug: 'genuary5-isometric',
    subtitle: 'I have accidentally made generative lasagna.',
    "title": "Genuary 5: Isometric",
    "thumbURL": "https://kyoko.openprocessing.org/thumbnails/visualThumbnail2500552@2x.jpg?hash=20250105131649",
    "url": "/sketch/2500552",
    "match": [
      "Genuary 5",
      "5"
    ],
    "id": 2500552
  },
  {
    slug: 'genuary4-black-on-black',
    subtitle: 'Making use of specular reflections to tell shapes apart.',
    "title": "Genuary 4: Black on Black",
    "thumbURL": "https://kyoko.openprocessing.org/thumbnails/visualThumbnail2500100@2x.jpg?hash=20250104140523",
    "url": "/sketch/2500100",
    "match": [
      "Genuary 4",
      "4"
    ],
    "id": 2500100
  },
  {
    slug: 'genuary3-42',
    subtitle: 'The number 42, rendered with 42 lines of code.',
    "title": "Genuary 3: 42",
    "thumbURL": "https://kyoko.openprocessing.org/thumbnails/visualThumbnail2499605@2x.jpg?hash=20250103140832",
    "url": "/sketch/2499605",
    "match": [
      "Genuary 3",
      "3"
    ],
    "id": 2499605
  },
  {
    slug: 'genuary2-layers',
    subtitle: 'A messy Mac desktop simulator.',
    "title": "Genuary 2: Layers",
    "thumbURL": "https://kyoko.openprocessing.org/thumbnails/visualThumbnail2499160@2x.jpg?hash=20250102135124",
    "url": "/sketch/2499160",
    "match": [
      "Genuary 2",
      "2"
    ],
    "id": 2499160
  },
  {
    slug: 'genuary1-vertical-lines',
    subtitle: 'Op art, using line thickness to visualize shapes.',
    "title": "Genuary 1: Vertical Lines",
    "thumbURL": "https://kyoko.openprocessing.org/thumbnails/visualThumbnail2498686@2x.jpg?hash=20250101151134",
    "url": "/sketch/2498686",
    "match": [
      "Genuary 1",
      "1"
    ],
    "id": 2498686
  },
  {
    slug: 'raphcicle',
    subtitle: 'Using shader hooks to make an icy Raph.',
    "title": "Raphcicle",
    prompt: 'winter',
    "thumbURL": "https://kyoko.openprocessing.org/thumbnails/visualThumbnail2488452@2x.jpg?hash=20241216002932",
    "url": "/sketch/2488452",
    "match": null,
    "id": 2488452
  },
  {
    slug: 'leafy-boys',
    subtitle: 'An experiment generating trees with smooth joints between branches.',
    "title": "Leafy boys",
    prompt: 'branching',
    "thumbURL": "https://kyoko.openprocessing.org/thumbnails/visualThumbnail2404539@2x.jpg?hash=20241020001253",
    "url": "/sketch/2404539",
    "match": null,
    "id": 2404539
  },
  {
    slug: 'blue',
    subtitle: 'Joni Mitchell album art, made with default p5.js shapes.',
    "title": "Blue",
    prompt: 'blue',
    "thumbURL": "https://kyoko.openprocessing.org/thumbnails/visualThumbnail2394593@2x.jpg?hash=20241012183913",
    "url": "/sketch/2394593",
    "match": null,
    "id": 2394593
  },
  {
    slug: 'photobooth-1845',
    subtitle: 'A simulation of taking an old photo. Hold still! It takes time to expose!',
    "title": "Photobooth 1845",
    prompt: 'rewind',
    "thumbURL": "https://kyoko.openprocessing.org/thumbnails/visualThumbnail2333072@2x.jpg?hash=20240824182555",
    "url": "/sketch/2333072",
    "match": null,
    "id": 2333072
  },
  {
    slug: 'gallop',
    subtitle: 'A totally normal horse, walking the way all horses walk.',
    "title": "Ğ̸͉̰̀A̸̛̭L̴̡̒̀L̴̝̈́̎O̵̜̓͠P̶͔̈́̑",
    prompt: 'horse',
    "thumbURL": "https://kyoko.openprocessing.org/thumbnails/visualThumbnail2327729@2x.jpg?hash=20240814010227",
    "url": "/sketch/2327729",
    "match": null,
    "id": 2327729
  },
  {
    slug: 'who-you-calling-zebra',
    subtitle: 'A zebra-striped webcam filter.',
    "title": "Who are you calling zebra?",
    prompt: 'pattern',
    "thumbURL": "https://kyoko.openprocessing.org/thumbnails/visualThumbnail2325217@2x.jpg?hash=20240806221310",
    "url": "/sketch/2325217",
    "match": null,
    "id": 2325217
  },
  {
    slug: 'olympus',
    subtitle: 'Generative mountains with a temple.',
    "title": "Olympus",
    prompt: 'Greek mythology',
    "thumbURL": "https://kyoko.openprocessing.org/thumbnails/visualThumbnail2323968@2x.jpg?hash=20240803183057",
    "url": "/sketch/2323968",
    "match": null,
    "id": 2323968
  },
  {
    slug: 'just-a-normal-form',
    subtitle: 'Just fill it out, what could go wrong?',
    "title": "Just a normal form",
    prompt: 'my personal hell',
    "thumbURL": "https://kyoko.openprocessing.org/thumbnails/visualThumbnail2288271@2x.jpg?hash=20240531001618",
    "url": "/sketch/2288271",
    "match": null,
    "id": 2288271
  },
  {
    slug: 'dank-chess',
    subtitle: 'Draw a chess piece and watch it come to life in 3D!',
    "title": "Make your own dank chess",
    prompt: 'chess',
    "thumbURL": "https://kyoko.openprocessing.org/thumbnails/visualThumbnail2282544@2x.jpg?hash=20240525112209",
    "url": "/sketch/2282544",
    "match": null,
    "id": 2282544
  }
]


const getData = async () => {
  for (const s of data) {
    const info = await fetch(`https://openprocessing.org/api/sketch/${s.id}`).then((res) => res.json())
    const date = new Date(info.createdOn);
    execSync(`curl '${s.thumbURL}' -H 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7' -H 'Accept-Language: en-US,en;q=0.9' -H 'Cache-Control: no-cache' -H 'Pragma: no-cache' -H 'Sec-Fetch-Dest: document' -H 'Sec-Fetch-Mode: navigate' -H 'Sec-Fetch-Site: none' -H 'Sec-Fetch-User: ?1' -H 'Upgrade-Insecure-Requests: 1' -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36' -H 'sec-ch-ua: "Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"' -H 'sec-ch-ua-mobile: ?0' -H 'sec-ch-ua-platform: "macOS"' > ${s.slug}.jpg`)
    const src = `<!--
{
  "title": "${s.title}",
  "category": "programming",
  "date": "${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}",
  "excerpt": "${s.subtitle.replace(/"/g, "\\\"")}",
  "thumbnail": "%root%/content/images/2025/04/${s.slug}.jpg",
  "languages": [
    "Javascript",
    "p5.js"
  ]
}
-->

${s.prompt
? `This a sketch for <a href="https://twitter.com/sableRaph">@sableRaph</a>'s weekly creative coding challenge. The theme this week was "${s.prompt}."`
: `This is a sketch for Genuary day ${s.match[1]}: "${genuaries[parseInt(s.match[1])-1]}"`}

<iframe class="sketch" src="https://openprocessing.org/sketch/${s.id}/embed/" width="700" height="700"></iframe>

${s.text || s.subtitle || ''}
`
    writeFileSync(`../../../programming/${s.slug}.html`, src)
  }
}

getData()
