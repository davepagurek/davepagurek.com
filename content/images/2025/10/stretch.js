p5.disableFriendlyErrors = true
let font
let charInfo = {}
let shape
let renderSampleFactor = 0.5
let sampleFactor = 0.5

let fontOptions = ['Bodoni Moda', 'Playfair Display', 'Montserrat', 'Lexend']

let content = "STReTCH"
// OPC.text('content', 'STReTCH', 'Text')
let fontName = 'Playfair Display'
// OPC.select({
	// name: 'fontName',
	// label: 'Font',
	// options: fontOptions,
	// value: 'Montserrat',
// })
let baseSize = 100
// OPC.slider({
// 	name: 'baseSize',
// 	label: 'Base Size',
// 	min: 10,
// 	max: 200,
// 	step: 0.1,
// 	value: 100
// })
let shapeW = 90
// OPC.slider({
	// name: 'shapeW',
	// label: 'Width',
	// min: 10,
	// max: 100,
	// step: 0.1,
	// value: 50
// })
let shapeH = 90
// OPC.slider({
	// name: 'shapeH',
	// label: 'Height',
	// min: 10,
	// max: 100,
	// step: 0.1,
	// value: 50
// })
let algorithm = 'Alignment'
// OPC.select({
	// name: 'algorithm',
	// label: 'Alghorithm',
	// options: ['Simple', 'Alignment'],
	// value: 'Alignment',
// })
// OPC.select({
// 	name: 'pool',
// 	label: 'Pooling',
// 	options: ['Average', 'Min', 'Max'],
// 	value: 'Min',
// })
const pool = 'Min'
let weight = 100
// OPC.slider({
	// name: 'weight',
	// label: 'Weight',
	// min: 0,
	// max: 100,
	// step: 0.1,
	// value: 100
// })
let debug = false
// OPC.toggle({
	// name: 'debug',
	// label: 'Debug weights',
	// value: false,
// })

const fonts = {}

function getCharInfo(char) {
	const factor = pow(2, map(weight, 0, 100, -6, 6))
	// const factor = 1
	const threshold = map(weight, 0, 100, 0, 0.001)
	push()
	textAlign(CENTER, CENTER)
	textFont(fonts[fontName])
	textSize(baseSize)
	let bounds, contours
	let rowScales = {}
	let colScales = {}
	if (char === ' ') {
		const w = fontWidth(' ')
		const h = 1
		contours = []
		bounds = {
			min: {
				x: -w / 2,
				y: -h / 2,
			},
			max: {
				x: w / 2,
				y: h / 2,
			},
		}
	} else {
		contours = fonts[fontName].textToContours(char, 0, 0, { sampleFactor: renderSampleFactor })
		bounds = contours.flat().reduce((acc, next) => {
			return {
				min: {
					x: min(acc.min.x, next.x),
					y: min(acc.min.y, next.y),
				},
				max: {
					x: max(acc.max.x, next.x),
					y: max(acc.max.y, next.y),
				},
			}
		}, { min: { x: 0, y: 0 }, max: { x: 0, y: 0 }})
		const rows = {}
		const cols = {}
		for (let x = floor(bounds.min.x * sampleFactor); x <= ceil(bounds.max.x * sampleFactor); x++) {
			cols[x] = new Set()
		}
		for (let y = floor(bounds.min.y * sampleFactor); y <= ceil(bounds.max.y * sampleFactor); y++) {
			rows[y] = new Set()
		}
		const contourTangents = []
		for (const contour of contours) {
			let tangents = contour.map((prev, i) => {
				const next = contour[(i + 1) % contour.length]
				return createVector(next.x - prev.x, next.y - prev.y).normalize()
			})
			for (let it = 0; it < 5; it++) {
				tangents = tangents.map(
					(tangent, i) =>
						tangent.copy()
							.add(tangents[(i-1+tangents.length)%tangents.length])
							.add(tangents[(i+1)%tangents.length])
							.normalize()
							// .mult(1/3)
				)
			}
			contourTangents.push(tangents)
			
			for (const [i, prev] of contour.entries()) {
				const next = contour[(i + 1) % contour.length]

				const minX = min(floor(prev.x * sampleFactor), floor(next.x * sampleFactor))
				const maxX = max(ceil(prev.x * sampleFactor), ceil(next.x * sampleFactor))
				const minY = min(floor(prev.y * sampleFactor), floor(next.y * sampleFactor))
				const maxY = max(ceil(prev.y * sampleFactor), ceil(next.y * sampleFactor))

				const xs = [min(prev.x, next.x) * sampleFactor, max(prev.x, next.x) * sampleFactor]
				const ys = [min(prev.y, next.y) * sampleFactor, max(prev.y, next.y) * sampleFactor]
				for (let x = minX; x <= maxX; x++) {
					if (xs[0] <= x && xs[1] >= x) {
						const m = (xs[1] - xs[0]) / (ys[1] - ys[0])
						const intersection = ys[0] + (x - xs[0]) / m
						cols[x].add(intersection)
					}
				}
				for (let y = minY; y <= maxY; y++) {
					if (ys[0] <= y && ys[1] >= y) {
						const m = (ys[1] - ys[0]) / (xs[1] - xs[0])
						const intersection = xs[0] + (y - ys[0]) / m
						rows[y].add(intersection)
					}
				}
			}
		}
		
		const nodes = []
		for (const [i, contour] of contours.entries()) {
			const tangents = contourTangents[i]
			for (let j = 0; j < contour.length; j++) {
				const pt = contour[j]
				const tan = tangents[j]
				nodes.push({ x: pt.x, y: pt.y, tan })
			}
		}
		const tree = makeKDTree(nodes)
		
		const initialAlignments = {
			Min: 1,
			Max: 0,
			Average: 0,
		}
		const epsilon = 1e-5
		const minCol = floor(bounds.min.x * sampleFactor)
		const maxCol = ceil(bounds.max.x * sampleFactor)
		const minRow = floor(bounds.min.y * sampleFactor)
		const maxRow = ceil(bounds.max.y * sampleFactor)
		for (const rawX in cols) {
			const x = parseInt(rawX)
			let total = 0
			let alignment = initialAlignments[pool]
			let inside = false
			const intersections = [...cols[x].values()].sort((a, b) => a - b)
			for (let y = minRow; y <= maxRow; y++) {
				while (intersections.length > 0 && y >= intersections[0]) {
					inside = !inside
					intersections.shift()
				}
				if (inside) {
					total++
					// debugger
					const vec = tree.closestPoint({ x: x / sampleFactor, y: y / sampleFactor }).pt.tan
					const curAlignment = algorithm === 'Simple'
						? 1
						: map(pow(abs(vec.x), factor), threshold, 1, 0, 1, true)  // .dot(1, 0)
					if (pool === 'Average') {
						alignment += curAlignment
					} else if (pool === 'Min') {
						alignment = min(alignment, curAlignment)
					} else {
						alignment = max(alignment, curAlignment)
					}
				}
			}
			colScales[x] = total === 0 ? -1 : alignment + epsilon // / total
		}
		let firstColScale = minCol
		while (colScales[firstColScale] < 0 && firstColScale <= maxCol) firstColScale++
		let lastColScale = maxCol
		while (colScales[lastColScale] < 0 && lastColScale >= minCol) lastColScale--
		for (let i = minCol; i < firstColScale; i++) {
			colScales[i] = algorithm === 'Simple' ? 1 : 0 // colScales[firstColScale]
		}
		for (let i = firstColScale; i < lastColScale; i++) {
			if (colScales[i] < 0) colScales[i] = initialAlignments[pool]
		}
		for (let i = maxCol; i > lastColScale; i--) {
			colScales[i] = algorithm === 'Simple' ? 1 : 0 // colScales[lastColScale]
		}
		
		for (const rawY in rows) {
			const y = parseInt(rawY)
			let total = 0
			let alignment = initialAlignments[pool]
			let inside = false
			const intersections = [...rows[y].values()].sort((a, b) => a - b)
			for (let x = minCol; x <= maxCol; x++) {
				while (intersections.length > 0 && x >= intersections[0]) {
					inside = !inside
					intersections.shift()
				}
				if (inside) {
					total++
					const vec = tree.closestPoint({ x: x / sampleFactor, y: y / sampleFactor }).pt.tan
					const curAlignment = algorithm === 'Simple'
						? 1
						: map(pow(abs(vec.y), factor), threshold, 1, 0, 1, true)  // .dot(0, 1)
					if (pool === 'Average') {
						alignment += curAlignment
					} else if (pool === 'Min') {
						alignment = min(alignment, curAlignment)
					} else {
						alignment = max(alignment, curAlignment)
					}
				}
			}
			rowScales[y] = total === 0 ? -1 : alignment + epsilon // / total
		}
		let firstRowScale = minRow
		while (rowScales[firstRowScale] < 0 && firstRowScale <= maxRow) firstRowScale++
		let lastRowScale = maxRow
		while (rowScales[lastRowScale] < 0 && lastRowScale >= minRow) lastRowScale--
		for (let i = minRow; i < firstRowScale; i++) {
			rowScales[i] = algorithm === 'Simple' ? 1 : 0 //rowScales[firstRowScale]
		}
		for (let i = firstRowScale; i < lastRowScale; i++) {
			if (rowScales[i] < 0) rowScales[i] = initialAlignments[pool]
		}
		for (let i = maxRow; i > lastRowScale; i--) {
			rowScales[i] = algorithm === 'Simple' ? 1 : 0 // rowScales[lastRowScale]
		}
	}
	pop()
	return { contours, bounds, char, rowScales, colScales }
}

let lastFontState
function computeCharInfo() {
	const fontState = { fontName, algorithm, weight, baseSize, pool }
	if (!lastFontState || Object.keys(fontState).some(k => fontState[k] !== lastFontState[k])) {
		charInfo = {}
		lastFontState = fontState
	}
	for (const char of content.split('')) {
		charInfo[char] = charInfo[char] || getCharInfo(char)
	}
	lastFontName = fontName
}

let lastShapeState
function computeShape() {
	const w = shapeW / 100 * width
	const h = shapeH / 100 * height
	const shapeState = { w, h, content, fontName, algorithm, weight, baseSize, pool }
	if (!lastShapeState || Object.keys(shapeState).some(k => shapeState[k] !== lastShapeState[k])) {
		push()
		textAlign(CENTER, CENTER)
		textFont(fonts[fontName])
		textSize(baseSize)
		const letters = content.split('').map(l => charInfo[l])
		const totalW = fontWidth(content)
		const totalKerning = totalW - content.split('').reduce((acc, next) => acc + fontWidth(next), 0)
		let x = -w / 2
		let contours = []
		for (const [i, letter] of letters.entries()) {
			const letterW = letter.bounds.max.x - letter.bounds.min.x
			const letterH = letter.bounds.max.y - letter.bounds.min.y
			const newW = letterW / totalW * w
			const newH = h
			
			const extraX = newW - letterW
			const extraY = newH - letterH
			
			let rowTotal = 0
			for (const y in letter.rowScales) {
				rowTotal += letter.rowScales[y]
			}
			let colTotal = 0
			for (const x in letter.colScales) {
				colTotal += letter.colScales[x]
			}
			
			const remappedX = {}
			let offX = -newW / 2
			for (let x = floor(letter.bounds.min.x * sampleFactor); x <= ceil(letter.bounds.max.x * sampleFactor); x++) {
				remappedX[x] = offX
				offX += (1 / sampleFactor) + (letter.colScales[x] / colTotal) * extraX
			}
			
			const remappedY = {}
			let offY = -newH / 2
			for (let y = floor(letter.bounds.min.y * sampleFactor); y <= ceil(letter.bounds.max.y * sampleFactor); y++) {
				remappedY[y] = offY
				offY += (1 / sampleFactor) + (letter.rowScales[y] / rowTotal) * extraY
			}
			
			const offsetX = x + newW / 2
			const offsetY = 0
			contours.push(...letter.contours.map((contour) => {
				return contour.map((pt) => {
					const minX = floor(pt.x * sampleFactor)
					const maxX = ceil(pt.x * sampleFactor)
					const newX = minX === maxX
						? remappedX[minX]
						: map(pt.x * sampleFactor, minX, maxX, remappedX[minX], remappedX[maxX])
					
					const minY = floor(pt.y * sampleFactor)
					const maxY = ceil(pt.y * sampleFactor)
					const newY = minY === maxY
						? remappedY[minY]
						: map(pt.y * sampleFactor, minY, maxY, remappedY[minY], remappedY[maxY])
					
					return { x: newX + offsetX, y: newY + offsetY }
				})
			}))
			let kerning = 0
			if (i + 1 < letters.length) {
				const nextLetter = letters[i + 1]
				kerning = fontWidth(letter.char + nextLetter.char) - (fontWidth(letter.char) + fontWidth(nextLetter.char))
			}
			x += (fontWidth(letter.char) + kerning) * (w / totalW)
		}
		shape = { contours }
		pop()
		lastShapeState = shapeState
	}
}

function drawText() {
	computeCharInfo()
	computeShape()
	
	push()
	noStroke()
	if (debug) {
		const letters = content.split('').map(l => charInfo[l])
		const totalW = letters.reduce((acc, next) => acc + next.bounds.max.x - next.bounds.min.x, 0)
		scale(min(width * 0.8 / totalW, height * 0.8 / baseSize))
		translate(-totalW / 2, 0)
		for (const letter of letters) {
			const letterW = letter.bounds.max.x - letter.bounds.min.x
			translate(letterW / 2, 0)
			push()
			noFill()
			stroke(255, 100)
      strokeWeight(2)
			beginShape()
			const offX = (letter.bounds.max.x + letter.bounds.min.x) / 2
			for (const contour of letter.contours) {
				beginContour()
				for (const pt of contour) {
					vertex(pt.x - offX, pt.y)
				}
				endContour()
			}
			endShape()
			pop()
			push()
			blendMode(ADD)
			beginShape(QUAD_STRIP)
			for (let i = floor(letter.bounds.min.y * sampleFactor); i <= ceil(letter.bounds.max.y * sampleFactor); i++) {
				const y = i / sampleFactor
				fill(map(letter.rowScales[i], 0, 1, 0, 255), 0, 0)
				vertex(-letterW / 2, y)
				vertex(letterW / 2, y)
			}
			endShape()
			beginShape(QUAD_STRIP)
			for (let i = floor(letter.bounds.min.x * sampleFactor); i <= ceil(letter.bounds.max.x * sampleFactor); i++) {
				const x = i / sampleFactor
				fill(0, 0, map(letter.colScales[i], 0, 1, 0, 255))
				vertex(x, letter.bounds.min.y)
				vertex(x, letter.bounds.max.y)
			}
			endShape()
			pop()
			translate(letterW / 2, 0)
		}
	} else {
		fill(255)
		beginShape()
		for (const contour of shape.contours) {
			beginContour()
			for (const pt of contour) {
				vertex(pt.x, pt.y)
			}
			endContour()
		}
		endShape()
	}
	pop()
}

class KDTreeNode {
	constructor(nodes, nodeIdx, minIdx, maxIdx, axis) {
		this.node = nodes[nodeIdx]
		this.axis = axis
		this.value = this.node[axis]
		this.left = null
		this.right = null
		const nextAxis = axis === 'x' ? 'y' : 'x'
		const lte = (a, b) => a[nextAxis] - b[nextAxis]
		if (minIdx < nodeIdx) {
			const midIdx = floor((minIdx + nodeIdx - 1) / 2)
			quickselect(nodes, midIdx, minIdx, nodeIdx - 1, lte)
			this.left = new KDTreeNode(nodes, midIdx, minIdx, nodeIdx - 1, nextAxis)
		}
		if (nodeIdx < maxIdx) {
			const midIdx = floor((nodeIdx + 1 + maxIdx) / 2)
			quickselect(nodes, midIdx, nodeIdx + 1, maxIdx, lte)
			this.right = new KDTreeNode(nodes, midIdx, nodeIdx + 1, maxIdx, nextAxis)
		}
	}
	
	closestPoint(pt, currentMin = { pt: null, dist: Infinity }) {
		let newMin = currentMin
		
		const curDist = pow(pt.x - this.node.x, 2) + pow(pt.y - this.node.y, 2)
		if (curDist < newMin.dist) {
			newMin = { pt: this.node, dist: curDist }
		}
		
		const distToPlane = pt[this.axis] - this.value
		
		const closestSubtree = distToPlane < 0 ? this.left : this.right
		const otherSubtree = distToPlane < 0 ? this.right : this.left
		
		if (closestSubtree) {
			const res = closestSubtree.closestPoint(pt, newMin)
			if (res.dist < newMin.dist) {
				newMin = res
			}
		}
		
		if (otherSubtree && distToPlane * distToPlane < newMin.dist) {
			const res = otherSubtree.closestPoint(pt, newMin)
			if (res.dist < newMin.dist) {
				newMin = res
			}
		}
		
		return newMin
	}
}

function makeKDTree(nodes) {
	const midIdx = floor((nodes.length - 1) / 2)
	const lte = (a, b) => a.x - b.x
	// debugger
	quickselect(nodes, midIdx, 0, nodes.length - 1, lte)
	return new KDTreeNode(nodes, midIdx, 0, nodes.length - 1, 'x')
}

// From https://www.npmjs.com/package/quickselect

/**
 * Rearranges items so that all items in the [left, k] are the smallest.
 * The k-th element will have the (k - left + 1)-th smallest value in [left, right].
 *
 * @template T
 * @param {T[]} arr the array to partially sort (in place)
 * @param {number} k middle index for partial sorting (as defined above)
 * @param {number} [left=0] left index of the range to sort
 * @param {number} [right=arr.length-1] right index
 * @param {(a: T, b: T) => number} [compare = (a, b) => a - b] compare function
 */
function quickselect(arr, k, left = 0, right = arr.length - 1, compare = defaultCompare) {

    while (right > left) {
        if (right - left > 600) {
            const n = right - left + 1;
            const m = k - left + 1;
            const z = Math.log(n);
            const s = 0.5 * Math.exp(2 * z / 3);
            const sd = 0.5 * Math.sqrt(z * s * (n - s) / n) * (m - n / 2 < 0 ? -1 : 1);
            const newLeft = Math.max(left, Math.floor(k - m * s / n + sd));
            const newRight = Math.min(right, Math.floor(k + (n - m) * s / n + sd));
            quickselect(arr, k, newLeft, newRight, compare);
        }

        const t = arr[k];
        let i = left;
        /** @type {number} */
        let j = right;

        swap(arr, left, k);
        if (compare(arr[right], t) > 0) swap(arr, left, right);

        while (i < j) {
            swap(arr, i, j);
            i++;
            j--;
            while (compare(arr[i], t) < 0) i++;
            while (compare(arr[j], t) > 0) j--;
        }

        if (compare(arr[left], t) === 0) swap(arr, left, j);
        else {
            j++;
            swap(arr, j, right);
        }

        if (j <= k) left = j + 1;
        if (k <= j) right = j - 1;
    }
}

/**
 * @template T
 * @param {T[]} arr
 * @param {number} i
 * @param {number} j
 */
function swap(arr, i, j) {
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
}

/**
 * @template T
 * @param {T} a
 * @param {T} b
 * @returns {number}
 */
function defaultCompare(a, b) {
    return a < b ? -1 : a > b ? 1 : 0;
}
