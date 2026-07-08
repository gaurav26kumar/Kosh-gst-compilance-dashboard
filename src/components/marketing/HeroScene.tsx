'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import styles from './Landing.module.css'

type CardDef = {
  pos: [number, number, number]
  rot: [number, number, number]
  size: [number, number]
  lines: string[]
  accent: boolean
}

const CARD_DEFS: CardDef[] = [
  { pos: [-1.35, 0.55, 0.2], rot: [0.05, 0.35, -0.06], size: [2.5, 1.55], accent: true,
    lines: ['INVOICE · GST-0192', '₹ 1,24,559', 'CGST 9% · SGST 9%', 'GSTIN 07AAAPL1234C1Z5'] },
  { pos: [1.15, -0.25, -0.4], rot: [-0.06, -0.3, 0.05], size: [2.3, 1.45], accent: false,
    lines: ['RETURNS TRACKER', '98.2%', 'GSTR-3B · on track', 'Row-level security'] },
  { pos: [-0.55, -1.05, 0.55], rot: [0.1, 0.15, 0.04], size: [1.9, 1.15], accent: false,
    lines: ['ANALYTICS', '+12.4%', 'Monthly filings', ''] },
]

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

export default function HeroScene({ theme }: { theme: 'light' | 'dark' }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const updateColorsRef = useRef<() => void>(() => {})

  // Build the scene once on mount.
  useEffect(() => {
    const canvasEl = canvasRef.current
    if (!canvasEl) return
    const canvas: HTMLCanvasElement = canvasEl
    const heroElRaw = canvas.parentElement
    if (!heroElRaw) return
    const heroEl: HTMLElement = heroElRaw

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100)
    camera.position.set(0, 0, 7)

    scene.add(new THREE.AmbientLight(0xffffff, 0.55))
    const key = new THREE.DirectionalLight(0xffffff, 0.9)
    key.position.set(3, 4, 5)
    scene.add(key)
    const rim = new THREE.PointLight(0xe0b25c, 1.1, 20)
    rim.position.set(-3, -2, 4)
    scene.add(rim)

    function cssVar(name: string) {
      const v = getComputedStyle(canvas).getPropertyValue(name).trim()
      return new THREE.Color(v || '#888888')
    }

    function makeCardTexture(lines: string[], accent: boolean) {
      const c = document.createElement('canvas')
      c.width = 512
      c.height = 320
      const ctx = c.getContext('2d')
      if (!ctx) return new THREE.Texture()
      ctx.fillStyle = '#' + cssVar('--surface').getHexString()
      roundRect(ctx, 0, 0, 512, 320, 28)
      ctx.fill()
      ctx.fillStyle = '#' + cssVar('--inkFaint').getHexString()
      ctx.font = '500 20px monospace'
      ctx.fillText(lines[0] || '', 34, 56)
      ctx.fillStyle = '#' + (accent ? cssVar('--brass').getHexString() : cssVar('--ink').getHexString())
      ctx.font = '600 40px sans-serif'
      ctx.fillText(lines[1] || '', 34, 130)
      ctx.fillStyle = '#' + cssVar('--inkSoft').getHexString()
      ctx.font = '400 18px monospace'
      ctx.fillText(lines[2] || '', 34, 180)
      ctx.fillText(lines[3] || '', 34, 212)
      const tex = new THREE.CanvasTexture(c)
      tex.needsUpdate = true
      return tex
    }

    const group = new THREE.Group()
    scene.add(group)

    const cardMeshes = CARD_DEFS.map((def, i) => {
      const geo = new THREE.BoxGeometry(def.size[0], def.size[1], 0.05)
      const mat = new THREE.MeshStandardMaterial({ map: makeCardTexture(def.lines, def.accent), roughness: 0.55, metalness: 0.12 })
      const mesh = new THREE.Mesh(geo, mat)
      mesh.position.set(...def.pos)
      mesh.rotation.set(...def.rot)
      mesh.userData = { baseY: def.pos[1], phase: i * 1.7, def }
      group.add(mesh)
      return mesh
    })

    const seal = new THREE.Mesh(
      new THREE.TorusGeometry(0.42, 0.045, 16, 60),
      new THREE.MeshStandardMaterial({ color: cssVar('--brass'), emissive: cssVar('--brass'), emissiveIntensity: 0.35, roughness: 0.35, metalness: 0.4 })
    )
    seal.position.set(1.55, 1.05, 0.5)
    seal.rotation.x = 0.4
    group.add(seal)

    function updateColors() {
      cardMeshes.forEach((mesh) => {
        const mat = mesh.material as THREE.MeshStandardMaterial
        mat.map?.dispose()
        mat.map = makeCardTexture(mesh.userData.def.lines, mesh.userData.def.accent)
        mat.needsUpdate = true
      })
      const brass = cssVar('--brass')
      const sealMat = seal.material as THREE.MeshStandardMaterial
      sealMat.color = brass
      sealMat.emissive = brass
    }
    updateColorsRef.current = updateColors

    function resize() {
      const w = heroEl.clientWidth
      const h = heroEl.clientHeight
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }
    resize()

    let heroH = heroEl.clientHeight
    function onResize() {
      resize()
      heroH = heroEl.clientHeight
    }
    window.addEventListener('resize', onResize)

    let mouseX = 0
    let mouseY = 0
    function onMouseMove(e: MouseEvent) {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1
      mouseY = (e.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('mousemove', onMouseMove)

    const clock = new THREE.Clock()
    let raf = 0
    function frame() {
      const t = clock.getElapsedTime()
      const scrollProgress = Math.min(window.scrollY / (heroH * 0.9), 1)

      if (!reduceMotion) {
        group.rotation.y = t * 0.06 + mouseX * 0.25 + scrollProgress * 0.5
        group.rotation.x = mouseY * 0.12 - scrollProgress * 0.15
        cardMeshes.forEach((m) => {
          m.position.y = m.userData.baseY + Math.sin(t * 0.5 + m.userData.phase) * 0.08
        })
        seal.rotation.z = t * 0.3
      } else {
        group.rotation.y = mouseX * 0.15
      }
      group.position.y = -scrollProgress * 0.6
      canvas.style.opacity = String(1 - scrollProgress * 0.9)

      renderer.render(scene, camera)
      raf = requestAnimationFrame(frame)
    }
    frame()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('mousemove', onMouseMove)
      cardMeshes.forEach((m) => {
        m.geometry.dispose()
        const mat = m.material as THREE.MeshStandardMaterial
        mat.map?.dispose()
        mat.dispose()
      })
      seal.geometry.dispose()
      ;(seal.material as THREE.Material).dispose()
      renderer.dispose()
    }
  }, [])

  // Recolor the scene whenever the theme changes.
  useEffect(() => {
    updateColorsRef.current()
  }, [theme])

  return <canvas ref={canvasRef} className={styles.heroCanvas} />
}
