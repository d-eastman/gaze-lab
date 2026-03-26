import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

const BASE_URL = 'https://raw.githubusercontent.com/vladmandic/face-api/master/model'
const OUT_DIR = path.resolve('public/models')

const FILES = [
  // Primary: SSD MobilenetV1 (more robust, better with glasses)
  'ssd_mobilenetv1_model.bin',
  'ssd_mobilenetv1_model-weights_manifest.json',
  // Full 68-point landmarks (better precision than tiny variant)
  'face_landmark_68_model.bin',
  'face_landmark_68_model-weights_manifest.json',
  // Expressions
  'face_expression_model.bin',
  'face_expression_model-weights_manifest.json',
  // Fallback: tiny models (faster but less accurate)
  'tiny_face_detector_model.bin',
  'tiny_face_detector_model-weights_manifest.json',
  'face_landmark_68_tiny_model.bin',
  'face_landmark_68_tiny_model-weights_manifest.json',
]

async function download() {
  if (!existsSync(OUT_DIR)) await mkdir(OUT_DIR, { recursive: true })

  for (const file of FILES) {
    const url = `${BASE_URL}/${file}`
    console.log(`Downloading ${file}...`)
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`)
    const buf = Buffer.from(await res.arrayBuffer())
    await writeFile(path.join(OUT_DIR, file), buf)
  }
  console.log('All models downloaded to public/models/')
}

download().catch((err) => {
  console.error(err)
  process.exit(1)
})
