/**
 * FacadeScene — terracotta arch facade: 3 bays × 3 floors,
 * every panel is a solid extruded terracotta arch.
 */
import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Edges } from '@react-three/drei'
import * as THREE from 'three'

// ─── Palette ──────────────────────────────────────────────────────────────────
const P = {
  steelDk:  '#2E2B28',
  steel:    '#4A4744',
  alumDk:   '#6A6662',
  alum:     '#9A9692',
  // terracotta range — varied per panel for depth
  terra: [
    '#C8714C', '#BE6340', '#D4885C',
    '#B85C38', '#CC7A50', '#C06848',
    '#D08060', '#BA6040', '#C67248',
  ] as const,
}

// ─── Facade layout ────────────────────────────────────────────────────────────
const BAY_W   = 1.8
const BAYS    = [-BAY_W, 0, BAY_W] as const
const TR_Y    = [-3.45, -1.15, 1.15, 3.45] as const  // 4 transoms
const FLOOR_H = 2.30   // TR_Y[n+1] - TR_Y[n]
const PANEL_W = 1.56   // BAY_W minus mullion insets
const MUL_W   = 0.10
const MULLION_X = [-2.7, -0.9, 0.9, 2.7] as const

// Floor centres (0 = bottom, 2 = top)
const FLOOR_Y = [0, 1, 2].map(fi => (TR_Y[fi] + TR_Y[fi + 1]) / 2) as [number, number, number]
// → [-2.3, 0, 2.3]

// ─── Arch panel geometry (full-height arched terracotta panel) ────────────────
// Each panel occupies exactly one bay×floor cell (PANEL_W × FLOOR_H)
// Arch: semicircle at top, straight sides below.
const _AR      = PANEL_W / 2             // arch radius = 0.78
const _AH      = FLOOR_H / 2             // half height = 1.15
const _SPRING  = _AH - _AR               // spring line local y = 0.37
const _DEPTH   = 0.12                    // panel extrusion depth

const _shape = new THREE.Shape()
_shape.moveTo(-_AR, -_AH)
_shape.lineTo(-_AR,  _SPRING)
_shape.absarc(0, _SPRING, _AR, Math.PI, 0, false)
_shape.lineTo( _AR, -_AH)
_shape.closePath()

export const ARCH_PANEL_GEOM = new THREE.ExtrudeGeometry(_shape, {
  depth: _DEPTH, bevelEnabled: false,
})
ARCH_PANEL_GEOM.translate(0, 0, -_DEPTH / 2)  // centre on z = 0

// ─── Easing ───────────────────────────────────────────────────────────────────
function easeOutBack(t: number, s = 0.16): number {
  if (t <= 0) return 0
  if (t >= 1) return 1
  const c1 = 1 + s, c3 = c1 + s
  return 1 + c3 * (t - 1) ** 3 + c1 * (t - 1) ** 2
}
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2
}
function c01(v: number) { return v < 0 ? 0 : v > 1 ? 1 : v }
function prog(t: number, t0: number, t1: number) { return c01((t - t0) / (t1 - t0)) }

// ─── Phase timing ─────────────────────────────────────────────────────────────
const PH = { explodeEnd: 3.2, assembleEnd: 8.2, buildingEnd: 10.8, fadeStart: 10.8, total: 12.2 }

// ─── Camera (module-level vectors — never reallocated) ────────────────────────
const ORBIT_R      = 14
const ORBIT_H      = 8
const ORBIT_SPEED  = 0.09
const ORBIT_START  = Math.PI * 0.18
const _camA        = new THREE.Vector3()
const CAM_ASM_END  = new THREE.Vector3(5, 3, 11)
const CAM_BLDG_END = new THREE.Vector3(0, 1.5, 16)

// ─── Piece list ───────────────────────────────────────────────────────────────
export interface Piece {
  key: string
  px: number; py: number; pz: number   // assembled position
  ox: number; oy: number; oz: number   // explosion offset
  sx: number; sy: number; sz: number   // box size (ignored for arch panels)
  color: string; opacity: number; roughness: number; metalness: number
  edges?: boolean; isArch?: boolean
  t0: number; t1: number               // animation window 0-1 within assembly phase
}

function buildPieces(): Piece[] {
  const ps: Piece[] = []

  // 1 ── Steel backing slab (slides from deep behind)
  ps.push({
    key: 'back', px: 0, py: 0, pz: -0.38,
    ox: 0, oy: 0, oz: -24,
    sx: 6.5, sy: 7.6, sz: 0.06,
    color: P.steelDk, opacity: 1, roughness: 0.85, metalness: 0.35,
    edges: true, t0: 0, t1: 0.18,
  })

  // 2 ── Steel floor beams (mid-depth horizontal)
  ;[-1.15, 1.15].forEach((y, i) => {
    ps.push({
      key: `beam-${i}`, px: 0, py: y, pz: -0.22,
      ox: 0, oy: 0, oz: -20,
      sx: 6.3, sy: 0.22, sz: 0.40,
      color: P.steel, opacity: 1, roughness: 0.75, metalness: 0.45,
      t0: 0.05, t1: 0.23,
    })
  })

  // 3 ── Aluminium mullions — vertical reveals between bays (from left)
  MULLION_X.forEach((x, i) => {
    ps.push({
      key: `mul-${i}`, px: x, py: 0, pz: 0,
      ox: -18, oy: 0, oz: 0,
      sx: MUL_W, sy: 7.4, sz: 0.20,
      color: P.alum, opacity: 1, roughness: 0.35, metalness: 0.75,
      t0: 0.18 + i * 0.025, t1: 0.38 + i * 0.025,
    })
  })

  // 4 ── Terracotta arch panels — 9 panels (3 bays × 3 floors)
  // Cascade: top-right → bottom-left, staggered by column then row
  const order = [2, 1, 0].flatMap(fi => [2, 1, 0].map(bi => ({ fi, bi })))
  order.forEach(({ fi, bi }, idx) => {
    const bx = BAYS[bi]
    const by = FLOOR_Y[fi]
    // Each column comes from a slightly different angle for visual variety
    const oxVariant = (bi - 1) * 3   // left col tilts left, right col tilts right
    const ozVariant = 14 + bi * 1.5  // each column at slightly different z
    ps.push({
      key: `arch-${fi}-${bi}`,
      px: bx, py: by, pz: 0.09,
      ox: oxVariant, oy: 0, oz: ozVariant,
      sx: PANEL_W, sy: FLOOR_H, sz: _DEPTH,  // not used for geom but kept for explosion
      color: P.terra[(fi * 3 + bi) % 9],
      opacity: 1, roughness: 0.82, metalness: 0.0,
      edges: true, isArch: true,
      t0: 0.34 + idx * 0.028, t1: 0.58 + idx * 0.028,
    })
  })

  // 5 ── Outer aluminium frame — perimeter, closes from edges
  const outerDefs = [
    { key: 'out-top',   px: 0,     py: 3.58,  pz: 0.07, ox: 0,   oy: 14,  oz: 0,  sx: 6.6, sy: 0.14, sz: 0.24, t0: 0.80 },
    { key: 'out-bot',   px: 0,     py: -3.58, pz: 0.07, ox: 0,   oy: -14, oz: 0,  sx: 6.6, sy: 0.14, sz: 0.24, t0: 0.82 },
    { key: 'out-left',  px: -2.90, py: 0,     pz: 0.07, ox: -14, oy: 0,   oz: 0,  sx: 0.14, sy: 7.1, sz: 0.24, t0: 0.84 },
    { key: 'out-right', px: 2.90,  py: 0,     pz: 0.07, ox: 14,  oy: 0,   oz: 0,  sx: 0.14, sy: 7.1, sz: 0.24, t0: 0.86 },
  ]
  outerDefs.forEach(o => {
    ps.push({ ...o, color: P.alumDk, opacity: 1, roughness: 0.45, metalness: 0.65, t1: o.t0 + 0.16 })
  })

  // 6 ── Steel capping beam — lands from above-left-behind last
  ps.push({
    key: 'cap',
    px: 0, py: 3.82, pz: -0.06,
    ox: -10, oy: 18, oz: -6,
    sx: 6.7, sy: 0.32, sz: 0.45,
    color: P.steelDk, opacity: 1, roughness: 0.65, metalness: 0.55,
    edges: true, t0: 0.90, t1: 1.0,
  })

  return ps
}

export const PIECES = buildPieces()

// ─── Static assembled facade (home page hero) ─────────────────────────────────
export function AssembledFacade() {
  return (
    <group>
      {PIECES.map(p =>
        p.isArch ? (
          <mesh
            key={p.key}
            position={[p.px, p.py, p.pz]}
            geometry={ARCH_PANEL_GEOM}
            castShadow receiveShadow
          >
            <meshStandardMaterial
              color={p.color}
              roughness={p.roughness}
              metalness={p.metalness}
            />
            <Edges color={P.steelDk} threshold={15} />
          </mesh>
        ) : (
          <mesh key={p.key} position={[p.px, p.py, p.pz]} castShadow receiveShadow>
            <boxGeometry args={[p.sx, p.sy, p.sz]} />
            <meshStandardMaterial
              color={p.color}
              opacity={p.opacity} transparent={p.opacity < 1}
              roughness={p.roughness} metalness={p.metalness}
            />
            {p.edges && <Edges color={P.steelDk} threshold={18} />}
          </mesh>
        )
      )}
    </group>
  )
}

// ─── Animated intro scene ─────────────────────────────────────────────────────
interface FacadeSceneProps {
  onFadeStart: () => void
  onComplete:  () => void
}

export function FacadeScene({ onFadeStart, onComplete }: FacadeSceneProps) {
  const elapsed      = useRef(0)
  const firedFade    = useRef(false)
  const firedDone    = useRef(false)
  const meshMap      = useRef<Map<string, THREE.Mesh>>(new Map())
  const bldgRef      = useRef<THREE.Group>(null)
  const { camera }   = useThree()

  const setRef = (key: string) => (el: THREE.Mesh | null) => {
    if (el) meshMap.current.set(key, el)
  }

  useFrame((_, delta) => {
    elapsed.current = Math.min(elapsed.current + delta, PH.total + 0.5)
    const t = elapsed.current
    const asmP = prog(t, PH.explodeEnd, PH.assembleEnd)

    // ── Animate every piece ────────────────────────────────────────────────
    for (const p of PIECES) {
      const mesh = meshMap.current.get(p.key)
      if (!mesh) continue
      const lp = c01((asmP - p.t0) / (p.t1 - p.t0))
      const e  = easeOutBack(lp)
      mesh.position.x = p.px + p.ox * (1 - e)
      mesh.position.y = p.py + p.oy * (1 - e)
      mesh.position.z = p.pz + p.oz * (1 - e)
    }

    // ── Camera path ────────────────────────────────────────────────────────
    if (t < PH.explodeEnd) {
      const θ = t * ORBIT_SPEED + ORBIT_START
      camera.position.set(ORBIT_R * Math.sin(θ), ORBIT_H, ORBIT_R * Math.cos(θ))
    } else if (t < PH.assembleEnd) {
      const θEnd = PH.explodeEnd * ORBIT_SPEED + ORBIT_START
      _camA.set(ORBIT_R * Math.sin(θEnd), ORBIT_H, ORBIT_R * Math.cos(θEnd))
      camera.position.lerpVectors(_camA, CAM_ASM_END, easeInOutCubic(prog(t, PH.explodeEnd, PH.assembleEnd)))
    } else if (t < PH.buildingEnd) {
      camera.position.lerpVectors(CAM_ASM_END, CAM_BLDG_END, easeInOutCubic(prog(t, PH.assembleEnd, PH.buildingEnd)))
    }
    camera.lookAt(0, 0.5, 0)

    // ── Building walls opacity ─────────────────────────────────────────────
    if (bldgRef.current) {
      const op = easeInOutCubic(prog(t, PH.assembleEnd + 0.5, PH.buildingEnd - 0.5))
      bldgRef.current.children.forEach(child => {
        const m = (child as THREE.Mesh).material as THREE.MeshStandardMaterial | null
        if (m) m.opacity = op
      })
    }

    // ── Callbacks ──────────────────────────────────────────────────────────
    if (t >= PH.fadeStart && !firedFade.current) { firedFade.current = true; onFadeStart() }
    if (t >= PH.total     && !firedDone.current) { firedDone.current = true; onComplete()  }
  })

  return (
    <>
      {/* ── Lighting ────────────────────────────────────────────────────── */}
      <ambientLight intensity={0.45} color="#F0E8DF" />
      <directionalLight
        position={[6, 10, 9]} intensity={1.5} castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-10} shadow-camera-right={10}
        shadow-camera-top={10}  shadow-camera-bottom={-10}
        shadow-camera-near={1}  shadow-camera-far={60}
      />
      <directionalLight position={[-4, 2, -6]} intensity={0.3} color="#D8C8B8" />
      <pointLight position={[0, 0, 14]} intensity={0.2} color="#F8EEE8" />

      {/* ── Animated facade pieces ──────────────────────────────────────── */}
      {PIECES.map(p =>
        p.isArch ? (
          <mesh
            key={p.key}
            ref={setRef(p.key)}
            position={[p.px + p.ox, p.py + p.oy, p.pz + p.oz]}
            geometry={ARCH_PANEL_GEOM}
            castShadow receiveShadow
          >
            <meshStandardMaterial
              color={p.color}
              roughness={p.roughness}
              metalness={p.metalness}
            />
            <Edges color={P.steelDk} threshold={15} />
          </mesh>
        ) : (
          <mesh
            key={p.key}
            ref={setRef(p.key)}
            position={[p.px + p.ox, p.py + p.oy, p.pz + p.oz]}
            castShadow receiveShadow
          >
            <boxGeometry args={[p.sx, p.sy, p.sz]} />
            <meshStandardMaterial
              color={p.color}
              opacity={p.opacity} transparent={p.opacity < 1}
              roughness={p.roughness} metalness={p.metalness}
            />
            {p.edges && <Edges color={P.steelDk} threshold={18} />}
          </mesh>
        )
      )}

      {/* ── Building context ────────────────────────────────────────────── */}
      <group ref={bldgRef}>
        <mesh position={[-6.5, 0.5, -2.5]}>
          <boxGeometry args={[6.5, 8.5, 0.4]} />
          <meshStandardMaterial color="#C8C0B4" roughness={0.92} metalness={0} opacity={0} transparent />
        </mesh>
        <mesh position={[6.5, 0.5, -2.5]}>
          <boxGeometry args={[6.5, 8.5, 0.4]} />
          <meshStandardMaterial color="#C8C0B4" roughness={0.92} metalness={0} opacity={0} transparent />
        </mesh>
        <mesh position={[0, -3.68, -1.5]}>
          <boxGeometry args={[16, 0.24, 4]} />
          <meshStandardMaterial color="#B0A89C" roughness={0.92} metalness={0} opacity={0} transparent />
        </mesh>
        <mesh position={[0, 4.0, -1.5]}>
          <boxGeometry args={[16, 0.24, 4]} />
          <meshStandardMaterial color="#B0A89C" roughness={0.92} metalness={0} opacity={0} transparent />
        </mesh>
      </group>
    </>
  )
}
