import fs from 'node:fs'
import path from 'node:path'

const FILE_KEY = 'FHLbpeVmVdQ8DAtXvSeh2S'
const ROOT_NODE_ID = '71:39474'
const token = process.env.FIGMA_TOKEN

if (!token) {
  console.error('Missing FIGMA_TOKEN environment variable.')
  process.exit(1)
}

const outDir = path.resolve('figma')
fs.mkdirSync(outDir, { recursive: true })

const headers = { 'X-Figma-Token': token }

async function fetchJson(url) {
  const res = await fetch(url, { headers })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`HTTP ${res.status} for ${url}\n${text}`)
  }
  return res.json()
}

function rgbaToHex(paint) {
  if (!paint?.color) return null
  const { r, g, b } = paint.color
  const a = paint.opacity ?? 1
  const to255 = (v) => Math.round(v * 255)
  const hex = [to255(r), to255(g), to255(b)].map((n) => n.toString(16).padStart(2, '0')).join('')
  const alpha = Math.round(a * 255).toString(16).padStart(2, '0')
  return `#${hex}${alpha}`.toUpperCase()
}

function keyOfFill(paint) {
  if (!paint || paint.type !== 'SOLID') return null
  return rgbaToHex(paint)
}

function walk(node, visit) {
  visit(node)
  for (const child of node.children ?? []) walk(child, visit)
}

const nodeUrl = `https://api.figma.com/v1/files/${FILE_KEY}/nodes?ids=${encodeURIComponent(ROOT_NODE_ID)}`
const data = await fetchJson(nodeUrl)
fs.writeFileSync(path.join(outDir, 'homepage-node.json'), JSON.stringify(data, null, 2))

const root = data.nodes?.[ROOT_NODE_ID]?.document
if (!root) throw new Error('Homepage node not found in API response.')

const variants = (root.children ?? []).map((child) => ({
  id: child.id,
  name: child.name,
  width: child.absoluteBoundingBox?.width ?? null,
  height: child.absoluteBoundingBox?.height ?? null,
}))

const colorCounts = new Map()
const typography = new Map()
const spacing = new Set()
const radii = new Set()
const effects = new Set()
const imageRefs = new Set()

for (const variant of root.children ?? []) {
  walk(variant, (node) => {
    for (const p of node.fills ?? []) {
      const c = keyOfFill(p)
      if (c) colorCounts.set(c, (colorCounts.get(c) ?? 0) + 1)
      if (p?.type === 'IMAGE' && p.imageRef) imageRefs.add(p.imageRef)
    }
    for (const p of node.strokes ?? []) {
      const c = keyOfFill(p)
      if (c) colorCounts.set(c, (colorCounts.get(c) ?? 0) + 1)
    }
    if (node.style) {
      const k = JSON.stringify({
        fontFamily: node.style.fontFamily,
        fontWeight: node.style.fontWeight,
        fontSize: node.style.fontSize,
        lineHeightPx: node.style.lineHeightPx,
        lineHeightPercent: node.style.lineHeightPercent,
        letterSpacing: node.style.letterSpacing,
        textCase: node.style.textCase,
        textDecoration: node.style.textDecoration,
      })
      typography.set(k, (typography.get(k) ?? 0) + 1)
    }
    if (typeof node.itemSpacing === 'number') spacing.add(node.itemSpacing)
    if (typeof node.paddingTop === 'number') spacing.add(node.paddingTop)
    if (typeof node.paddingRight === 'number') spacing.add(node.paddingRight)
    if (typeof node.paddingBottom === 'number') spacing.add(node.paddingBottom)
    if (typeof node.paddingLeft === 'number') spacing.add(node.paddingLeft)
    if (typeof node.cornerRadius === 'number') radii.add(node.cornerRadius)
    for (const r of node.rectangleCornerRadii ?? []) radii.add(r)
    for (const e of node.effects ?? []) {
      effects.add(
        JSON.stringify({
          type: e.type,
          visible: e.visible,
          radius: e.radius,
          offset: e.offset,
          spread: e.spread,
          color: e.color
            ? { r: e.color.r, g: e.color.g, b: e.color.b, a: e.color.a }
            : null,
        }),
      )
    }
  })
}

const tokens = {
  meta: {
    project: 'Luna Borgo Portfolio',
    fileKey: FILE_KEY,
    nodeId: ROOT_NODE_ID,
    extractedAt: new Date().toISOString(),
  },
  breakpoints: variants,
  colors: [...colorCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([value, count]) => ({ value, count })),
  typography: [...typography.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([value, count]) => ({ ...JSON.parse(value), usageCount: count })),
  spacing: [...spacing].sort((a, b) => a - b),
  radii: [...radii].sort((a, b) => a - b),
  effects: [...effects].map((e) => JSON.parse(e)),
  imageRefCount: imageRefs.size,
}

fs.writeFileSync(path.join(outDir, 'homepage-tokens.json'), JSON.stringify(tokens, null, 2))

const variantIds = variants.map((v) => v.id).join(',')
const imageUrl = `https://api.figma.com/v1/images/${FILE_KEY}?ids=${encodeURIComponent(variantIds)}&format=png&scale=2`
const imageData = await fetchJson(imageUrl)
fs.writeFileSync(path.join(outDir, 'homepage-variant-images.json'), JSON.stringify(imageData, null, 2))

console.log(`Extracted ${variants.length} variants to ${outDir}`)
console.log(`Found ${tokens.colors.length} colors, ${tokens.typography.length} typography styles.`)
