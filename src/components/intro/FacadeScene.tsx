/**
 * FacadeScene — terracotta arch facade with physically-based materials.
 * Terracotta: meshPhysicalMaterial + sheen for fired-clay look.
 * Steel/aluminium: tuned metalness/roughness PBR values.
 */
import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Edges } from '@react-three/drei'
import * as THREE from 'three'

// ─── Palette ──────────────────────────────────────────────────────────────────
const P = {
  steelDk:  '#28251F',  // raw dark steel
  steel:    '#3E3B36',  // hot-rolled steel
  alumDk:   '#5C5956',  // anodised aluminium dark
  alum:     '#8E8C88',  // anodised aluminium mid
  // Weathered reclaimed terracotta — each panel has its own history
  terra: [
    '#C26442', // warm standard
    '#A84E2C', // dark burnt
    '#D4906A', // faded & pale
    '#B84830', // deep brick
    '#CC7850', // amber-orange
    '#9E4028', // very deep/aged
    '#D08868', // light, sun-bleached
    '#B85C3C', // mid warm
    '#C07248', // classic terracotta
  ] as const,
  // Per-panel roughness variation — reclaimed tiles aren't uniform
  terraRough: [0.88, 0.92, 0.80, 0.90, 0.85, 0.94, 0.78, 0.86, 0.90] as const,
}

// ─── Facade layout ────────────────────────────────────────────────────────────
const BAY_W   = 1.8
const BAYS    = [-BAY_W, 0, BAY_W] as const
const TR_Y    = [-3.45, -1.15, 1.15, 3.45] as const
const FLOOR_H = 2.30
const PANEL_W = 1.56
const MUL_W   = 0.10
const MULLION_X = [-2.7, -0.9, 0.9, 2.7] as const
const FLOOR_Y = [0, 1, 2].map(fi => (TR_Y[fi] + TR_Y[fi + 1]) / 2) as [number, number, number]

// ─── Arch panel geometry ──────────────────────────────────────────────────────
const _AR     = PANEL_W / 2
const _AH     = FLOOR_H / 2
const _SPRING = _AH - _AR
const _DEPTH  = 0.12

const _shape = new THREE.Shape()
_shape.moveTo(-_AR, -_AH)
_shape.lineTo(-_AR,  _SPRING)
_shape.absarc(0, _SPRING, _AR, Math.PI, 0, false)
_shape.lineTo( _AR, -_AH)
_shape.closePath()

export const ARCH_PANEL_GEOM = new THREE.ExtrudeGeometry(_shape, { depth: _DEPTH, bevelEnabled: false })
ARCH_PANEL_GEOM.translate(0, 0, -_DEPTH / 2)

// ─── Easing ───────────────────────────────────────────────────────────────────
function easeOutBack(t: number, s = 0.16): number {
  if (t <= 0) return 0; if (t >= 1) return 1
  const c1 = 1 + s, c3 = c1 + s
  return 1 + c3 * (t - 1) ** 3 + c1 * (t - 1) ** 2
}
function easeInOutCubic(t: number) { return t < 0.5 ? 4*t*t*t : 1-(-2*t+2)**3/2 }
function c01(v: number) { return v < 0 ? 0 : v > 1 ? 1 : v }
function prog(t: number, t0: number, t1: number) { return c01((t - t0) / (t1 - t0)) }

// ─── Phase timing ─────────────────────────────────────────────────────────────
const PH = { explodeEnd: 3.2, assembleEnd: 8.2, buildingEnd: 10.8, fadeStart: 10.8, total: 12.2 }

// ─── Camera (module-level, no per-frame allocation) ───────────────────────────
const ORBIT_R = 14, ORBIT_H = 8, ORBIT_SPEED = 0.09, ORBIT_START = Math.PI * 0.18
const _camA       = new THREE.Vector3()
const CAM_ASM_END  = new THREE.Vector3(5, 3, 11)
const CAM_BLDG_END = new THREE.Vector3(0, 1.5, 16)

// ─── Piece definitions ────────────────────────────────────────────────────────
type MatType = 'terra' | 'steel' | 'alum'

export interface Piece {
  key: string
  px: number; py: number; pz: number
  ox: number; oy: number; oz: number
  sx: number; sy: number; sz: number
  color: string; opacity: number; roughness: number; metalness: number
  matType: MatType
  edges?: boolean; isArch?: boolean
  t0: number; t1: number
}

function buildPieces(): Piece[] {
  const ps: Piece[] = []

  ps.push({
    key: 'back', px: 0, py: 0, pz: -0.38,
    ox: 0, oy: 0, oz: -24,
    sx: 6.5, sy: 7.6, sz: 0.06,
    color: P.steelDk, opacity: 1, roughness: 0.60, metalness: 0.82,
    matType: 'steel', edges: true, t0: 0, t1: 0.18,
  })

  ;[-1.15, 1.15].forEach((y, i) => {
    ps.push({
      key: `beam-${i}`, px: 0, py: y, pz: -0.22,
      ox: 0, oy: 0, oz: -20,
      sx: 6.3, sy: 0.22, sz: 0.40,
      color: P.steel, opacity: 1, roughness: 0.58, metalness: 0.85,
      matType: 'steel', t0: 0.05, t1: 0.23,
    })
  })

  MULLION_X.forEach((x, i) => {
    ps.push({
      key: `mul-${i}`, px: x, py: 0, pz: 0,
      ox: -18, oy: 0, oz: 0,
      sx: MUL_W, sy: 7.4, sz: 0.20,
      color: P.alum, opacity: 1, roughness: 0.14, metalness: 0.92,
      matType: 'alum', t0: 0.18 + i * 0.025, t1: 0.38 + i * 0.025,
    })
  })

  // 9 terracotta arch panels — cascade top-right → bottom-left
  const order = [2, 1, 0].flatMap(fi => [2, 1, 0].map(bi => ({ fi, bi })))
  order.forEach(({ fi, bi }, idx) => {
    const panelIdx = fi * 3 + bi
    ps.push({
      key: `arch-${fi}-${bi}`,
      px: BAYS[bi], py: FLOOR_Y[fi], pz: 0.09,
      ox: (bi - 1) * 3, oy: 0, oz: 14 + bi * 1.5,
      sx: PANEL_W, sy: FLOOR_H, sz: _DEPTH,
      color: P.terra[panelIdx % 9],
      opacity: 1,
      roughness: P.terraRough[panelIdx % 9],
      metalness: 0,
      matType: 'terra',
      edges: true, isArch: true,
      t0: 0.34 + idx * 0.028, t1: 0.58 + idx * 0.028,
    })
  })

  const outerDefs = [
    { key: 'out-top',   px: 0,     py: 3.58,  pz: 0.07, ox: 0,   oy: 14,  oz: 0,  sx: 6.6, sy: 0.14, sz: 0.24, t0: 0.80 },
    { key: 'out-bot',   px: 0,     py: -3.58, pz: 0.07, ox: 0,   oy: -14, oz: 0,  sx: 6.6, sy: 0.14, sz: 0.24, t0: 0.82 },
    { key: 'out-left',  px: -2.90, py: 0,     pz: 0.07, ox: -14, oy: 0,   oz: 0,  sx: 0.14, sy: 7.1, sz: 0.24, t0: 0.84 },
    { key: 'out-right', px: 2.90,  py: 0,     pz: 0.07, ox: 14,  oy: 0,   oz: 0,  sx: 0.14, sy: 7.1, sz: 0.24, t0: 0.86 },
  ]
  outerDefs.forEach(o => {
    ps.push({ ...o, color: P.alumDk, opacity: 1, roughness: 0.12, metalness: 0.94, matType: 'alum', t1: o.t0 + 0.16 })
  })

  ps.push({
    key: 'cap',
    px: 0, py: 3.82, pz: -0.06,
    ox: -10, oy: 18, oz: -6,
    sx: 6.7, sy: 0.32, sz: 0.45,
    color: P.steelDk, opacity: 1, roughness: 0.55, metalness: 0.88,
    matType: 'steel', edges: true, t0: 0.90, t1: 1.0,
  })

  return ps
}

export const PIECES = buildPieces()

// ─── Material component ───────────────────────────────────────────────────────
function PieceMat({ p, opacity = p.opacity }: { p: Piece; opacity?: number }) {
  if (p.matType === 'terra') {
    return (
      <meshPhysicalMaterial
        color={p.color}
        roughness={p.roughness}
        metalness={0}
        sheen={0.35}
        sheenRoughness={0.85}
        sheenColor="#4A1C08"
        emissive={p.color}
        emissiveIntensity={0.04}
        opacity={opacity}
        transparent={opacity < 1}
      />
    )
  }
  if (p.matType === 'alum') {
    return (
      <meshStandardMaterial
        color={p.color}
        roughness={p.roughness}
        metalness={p.metalness}
        envMapIntensity={1.2}
        opacity={opacity}
        transparent={opacity < 1}
      />
    )
  }
  // steel
  return (
    <meshStandardMaterial
      color={p.color}
      roughness={p.roughness}
      metalness={p.metalness}
      envMapIntensity={0.8}
      opacity={opacity}
      transparent={opacity < 1}
    />
  )
}

// ─── Static assembled facade (home page) ─────────────────────────────────────
export function AssembledFacade() {
  return (
    <group>
      {PIECES.map(p =>
        p.isArch ? (
          <mesh key={p.key} position={[p.px, p.py, p.pz]} geometry={ARCH_PANEL_GEOM} castShadow receiveShadow>
            <PieceMat p={p} />
            <Edges color={P.steelDk} threshold={15} />
          </mesh>
        ) : (
          <mesh key={p.key} position={[p.px, p.py, p.pz]} castShadow receiveShadow>
            <boxGeometry args={[p.sx, p.sy, p.sz]} />
            <PieceMat p={p} />
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
  const elapsed   = useRef(0)
  const firedFade = useRef(false)
  const firedDone = useRef(false)
  const meshMap   = useRef<Map<string, THREE.Mesh>>(new Map())
  const bldgRef   = useRef<THREE.Group>(null)
  const { camera } = useThree()

  const setRef = (key: string) => (el: THREE.Mesh | null) => {
    if (el) meshMap.current.set(key, el)
  }

  useFrame((_, delta) => {
    elapsed.current = Math.min(elapsed.current + delta, PH.total + 0.5)
    const t = elapsed.current
    const asmP = prog(t, PH.explodeEnd, PH.assembleEnd)

    for (const p of PIECES) {
      const mesh = meshMap.current.get(p.key)
      if (!mesh) continue
      const e = easeOutBack(c01((asmP - p.t0) / (p.t1 - p.t0)))
      mesh.position.x = p.px + p.ox * (1 - e)
      mesh.position.y = p.py + p.oy * (1 - e)
      mesh.position.z = p.pz + p.oz * (1 - e)
    }

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

    if (bldgRef.current) {
      const op = easeInOutCubic(prog(t, PH.assembleEnd + 0.5, PH.buildingEnd - 0.5))
      bldgRef.current.children.forEach(child => {
        const m = (child as THREE.Mesh).material as THREE.MeshStandardMaterial | null
        if (m) m.opacity = op
      })
    }

    if (t >= PH.fadeStart && !firedFade.current) { firedFade.current = true; onFadeStart() }
    if (t >= PH.total     && !firedDone.current) { firedDone.current = true; onComplete()  }
  })

  return (
    <>
      {/* ── Lighting: 3-point + warm bounce ─────────────────────────────── */}
      {/* Key light: strong warm sun from upper-right */}
      <directionalLight
        position={[7, 12, 9]} intensity={1.8} color="#FFF5E8"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-10} shadow-camera-right={10}
        shadow-camera-top={10}  shadow-camera-bottom={-10}
        shadow-camera-near={1}  shadow-camera-far={70}
        shadow-bias={-0.001}
      />
      {/* Fill light: cool sky from upper-left */}
      <directionalLight position={[-6, 6, 4]} intensity={0.45} color="#C8D8E8" />
      {/* Back-rim: separates panels from background */}
      <directionalLight position={[-2, -2, -8]} intensity={0.25} color="#E0D0C0" />
      {/* Warm ground bounce */}
      <pointLight position={[0, -5, 6]} intensity={0.55} color="#D4805040" distance={20} decay={2} />
      {/* Ambient fill — low, let the directionals do the work */}
      <ambientLight intensity={0.28} color="#EDE4D8" />

      {/* ── Shadow-receiving ground plane ───────────────────────────────── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3.75, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <shadowMaterial opacity={0.18} />
      </mesh>

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
            <PieceMat p={p} />
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
            <PieceMat p={p} />
            {p.edges && <Edges color={P.steelDk} threshold={18} />}
          </mesh>
        )
      )}

      {/* ── Building context (fades in post-assembly) ────────────────────── */}
      <group ref={bldgRef}>
        <mesh position={[-6.5, 0.5, -2.5]}>
          <boxGeometry args={[6.5, 8.5, 0.4]} />
          <meshStandardMaterial color="#BEB5A8" roughness={0.95} metalness={0} opacity={0} transparent />
        </mesh>
        <mesh position={[6.5, 0.5, -2.5]}>
          <boxGeometry args={[6.5, 8.5, 0.4]} />
          <meshStandardMaterial color="#BEB5A8" roughness={0.95} metalness={0} opacity={0} transparent />
        </mesh>
        <mesh position={[0, -3.72, -1.5]}>
          <boxGeometry args={[16, 0.24, 4]} />
          <meshStandardMaterial color="#A8A098" roughness={0.95} metalness={0} opacity={0} transparent />
        </mesh>
        <mesh position={[0, 4.02, -1.5]}>
          <boxGeometry args={[16, 0.24, 4]} />
          <meshStandardMaterial color="#A8A098" roughness={0.95} metalness={0} opacity={0} transparent />
        </mesh>
      </group>
    </>
  )
}
