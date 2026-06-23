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
        <ambientLight intensity={0.20} color="#EBE4DA" />
        <directionalLight position={[6, 10, 12]} intensity={2.2} color="#FFF6EE" castShadow />
        <directionalLight position={[-7, 5, 10]} intensity={0.9} color="#EEF3F8" />
        <directionalLight position={[-3, 8, -10]} intensity={0.55} color="#D0E4F0" />
        <pointLight position={[0, -3.5, 7]} intensity={0.8} color="#C87038" distance={22} decay={2} />
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
