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
        <directionalLight position={[5, 9, 12]} intensity={1.3} color="#F5D9A8" castShadow />
        <directionalLight position={[-5, 4, 9]} intensity={0.50} color="#E8B87A" />
        <pointLight position={[0, -3, 7]} intensity={0.65} color="#C85820" distance={20} decay={2} />
        <ambientLight intensity={0.18} color="#F2D8B0" />
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
