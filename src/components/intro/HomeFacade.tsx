import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { AssembledFacade } from './FacadeScene'

export function HomeFacade() {
  return (
    <div className="relative h-full w-full">
      <Canvas
        shadows
        camera={{ position: [0, 0, 9], fov: 38, near: 0.1, far: 100 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.65} color="#F0EBE4" />
        <directionalLight position={[4, 6, 8]}   intensity={1.3} castShadow />
        <directionalLight position={[-4, 2, -4]} intensity={0.4}  color="#D8C8B8" />
        <pointLight       position={[0, 0, 10]}  intensity={0.25} color="#EEF4F6" />
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
