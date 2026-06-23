import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'
import * as THREE from 'three'
import { AssembledFacade } from './FacadeScene'

export function HomeFacade() {
  return (
    <div className="relative h-full w-full">
      <Canvas
        shadows
        camera={{ position: [0, 0, 9], fov: 38, near: 0.1, far: 100 }}
        gl={{
          antialias: true,
          alpha: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.1,
        }}
        style={{ background: 'transparent' }}
      >
        <Environment preset="warehouse" background={false} />
        <directionalLight position={[5, 9, 12]} intensity={1.6} color="#FFF4E8" castShadow />
        <directionalLight position={[-5, 4, 9]} intensity={0.55} color="#DDE8F4" />
        <pointLight position={[0, -3, 7]} intensity={0.5} color="#C86030" distance={20} decay={2} />
        <ambientLight intensity={0.10} color="#F0E8E0" />
        <AssembledFacade />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.6}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 1.8}
        />
      </Canvas>
      <p className="pointer-events-none absolute bottom-3 right-4 font-mono text-[10px] uppercase tracking-widest text-stone/50">
        Drag to rotate
      </p>
    </div>
  )
}
