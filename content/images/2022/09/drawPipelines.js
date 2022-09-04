[...document.querySelectorAll('.pipeline')].forEach((pipeline) => drawPipeline(pipeline))

function drawPipeline(pipeline) {
  const parentElt = pipeline.parentNode
  const canvas = document.createElement('canvas')
  parentElt.insertBefore(canvas, pipeline)
  parentElt.removeChild(pipeline)
  const ctx = canvas.getContext('2d')
  const nodes = {}
  const rows = []
  let loading = []

  const w = 150
  const h = 150

  const makeNode = (selector, parent) => {
    if (nodes[selector]) return nodes[selector]
    const elt = pipeline.querySelector(selector)

    const row = parent ? parent.row + 1 : 0
    const node = {
      row,
      lefts: 0,
      rights: 0,
      idx: Object.keys(nodes).length,
    }
    if (elt.getAttribute('src')) {
      if (!elt.complete) {
        loading.push(new Promise((resolve) => elt.addEventListener('load', resolve)))
      }
      node.draw = (ctx) => {
        ctx.drawImage(elt, 0, 0, w, h)
      }
    } else if (elt.getAttribute('data-color')) {
      node.draw = (ctx) => {
        ctx.save()
        ctx.fillStyle = elt.getAttribute('data-color')
        ctx.fillRect(0, 0, w, h)
        ctx.restore()
      }
    } else {
      node.src = makeNode(elt.getAttribute('data-src'), node)
      node.dst = makeNode(elt.getAttribute('data-dst'), node)
      node.src.lefts++
      node.src.rights++
      node.src.row = Math.max(node.src.row, node.row + 1)
      node.dst.row = Math.max(node.dst.row, node.row + 1)
      const mode = elt.getAttribute('data-mode')
      node.mode = mode
      node.draw = (ctx) => {
        const tmp = document.createElement('canvas')
        const tmp2 = document.createElement('canvas')
        tmp.width = w
        tmp.height = h
        tmp2.width = w
        tmp2.height = h
        const ctx2 = tmp.getContext('2d')
        const ctx3 = tmp2.getContext('2d')
        node.src.draw(ctx2)
        ctx3.drawImage(tmp, 0, 0, w, h)
        ctx2.clearRect(0, 0, w, h)
        node.dst.draw(ctx2)
        ctx3.globalCompositeOperation = mode
        ctx3.drawImage(tmp, 0, 0, w, h)
        ctx.drawImage(tmp2, 0, 0, w, h)
      }
    }

    nodes[selector] = node
    return node
  }

  makeNode('.output')
  
  for (const key in nodes) {
    const node = nodes[key]
    const row = node.row
    if (!rows[row]) {
      rows[row] = []
    }
    rows[row].push(node)
  }
  for (const row of rows) {
    row.sort((a, b) =>
      a.idx - b.idx
    )
    for (let i = 0; i < row.length; i++) {
      row[i].col = i
    }
  }

  const nodePosition = (node) => {
    const y = padding + (rows.length - 1 - node.row) * (h + paddingY)
    const x = padding + node.col * (w + padding)
    return [x, y]
  }

  const padding = 40
  const paddingY = 100
  const totalHeight = 2 * padding + (rows.length - 1) * paddingY + rows.length * h
  const totalWidth = Math.max(...rows.map((row) => row.length)) * (w + padding) + padding
  canvas.height = totalHeight
  canvas.width = totalWidth

  const checkerSize = 15
  ctx.save()
  ctx.fillStyle = '#222'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#555'
  for (let y = 0; y < canvas.height; y += checkerSize) {
    for (let x = (y % 30 === 0 ? 0 : checkerSize); x < canvas.width; x += 2 * checkerSize) {
      ctx.fillRect(x, y, checkerSize, checkerSize)
    }
  }
  ctx.restore()

  const drawArrow = (srcX, srcY, dstX, dstY) => {
    const arrowY = dstY - 10
    const bezierDist = Math.min(100, Math.abs(arrowY - srcY))
    ctx.save()
    ctx.strokeStyle = '#FFF'
    ctx.beginPath()
    ctx.moveTo(srcX, srcY)
    ctx.bezierCurveTo(srcX, srcY + bezierDist, dstX, arrowY - bezierDist, dstX, arrowY)
    ctx.stroke()

    ctx.fillStyle = '#FFF'
    ctx.beginPath()
    ctx.moveTo(dstX, dstY)
    ctx.lineTo(dstX - 5, arrowY)
    ctx.lineTo(dstX + 5, arrowY)
    ctx.closePath()
    ctx.fill()
    ctx.restore()
  }

  const drawConnector = (from, to, offset) => {
    let [srcX, srcY] = nodePosition(from)
    let [dstX, dstY] = nodePosition(to)

    srcY += h
    srcX += w / 2

    dstY -= 55
    dstX += w / 2 + offset
    drawArrow(srcX, srcY, dstX, dstY)
  }

  Promise.all(loading).then(() => {
    for (const key in nodes) {
      const node = nodes[key]
      ctx.save()
      ctx.translate(...nodePosition(node))

      if (node.mode) {
        ctx.save()
        ctx.fillStyle = '#cfecfa'
        ctx.strokeStyle = '#b4ccd9'
        const rect = [10, -55, w - 20, 30]
        ctx.fillRect(...rect)
        ctx.strokeRect(...rect)

        ctx.strokeStyle = undefined
        ctx.fillStyle = '#305569'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.font = '13px sans-serif'
        ctx.fillText(node.mode.toUpperCase(), w/2, -38)
        ctx.restore()

        drawArrow(w/2, -25, w/2, 0)
      }

      node.draw(ctx)
      ctx.restore()

      if (node.src) drawConnector(node.src, node, -20)
      if (node.dst) drawConnector(node.dst, node, 20)
    }
  })
}
