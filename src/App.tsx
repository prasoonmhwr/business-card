import { Suspense, useRef, useEffect } from "react";
import { Canvas, extend, useThree } from "@react-three/fiber";
import { Html, useGLTF, OrbitControls, ContactShadows, Environment } from "@react-three/drei";
import * as THREE from "three";
import {gsap} from "gsap";

extend({ DirectionalLightHelper: THREE.DirectionalLightHelper });

function Loader() {
  return (
    <Html center>
      <div style={{ color: "white", fontFamily: "Inter, sans-serif" }}>Loading…</div>
    </Html>
  );
}

function CameraRig(_props: any) {
  const { camera } = useThree();
  useEffect(() => {
    camera.position.set(0.9, 1.6, 0.8);
    camera.near = 0.5;
    camera.far = 20;
    camera.updateProjectionMatrix();
  }, [camera]);
  return null;
}

// Separate component for the light with helper
function LightWithHelper() {
  const lightRef = useRef<any>(null);
  // useHelper(lightRef, THREE.SpotLightHelper, 5);

  return (
    <spotLight
      ref={lightRef}
      intensity={150.2}
      angle={0.4}
      penumbra={0.35}
      distance={6}
      position={[1.6, 4, 1]}
      castShadow
      shadow-mapSize-width={1024}
      shadow-mapSize-height={1024}
    />

  )
  {/* <spotLight intensity={0.18} position={[-1.8, 1.3, -2.5]} /> */ }

}

function LuxuryCard({ url = "public/business-card.glb" }: { url?: string }) {
  const group = useRef<any>(null);
  const { scene } = useGLTF(url) as any;

 

  useEffect(() => {
    gsap.to(group.current.postion, {  y: 2, vy: 0, z: 5 ,x:1, duration: 1.5, ease: "power2.out" });
  }, []);

  

  const handleClick = (event:any) => {
    const currentX = group.current.rotation.x;
 
  const tl = gsap.timeline();
    
   
    const initialY = group.current.position.y;
   
    
    tl
      // Toss up phase - card goes up with initial rotation
      .to(group.current.position, {
        y: initialY + 0.5, // Toss height
        duration: 0.1,
        ease: "bounce.in"
      })
      .to(group.current.rotation, {
        x: currentX + Math.PI , // Spin while going up
        // y: initialRotY + 0.2, // Slight forward tilt
        // z: initialRotZ + 0.1, // Slight side rotation
        duration: 0.6,
        ease: "power2.out"
      }, 0) // Start at the same time as position
     
      
      // Fall down phase - card comes down and settles
      .to(group.current.position, {
        y: initialY, // Back to original position
        duration: 0.6,
        ease: "power2.out"
      })
     
      
      // Final settle with slight bounce
      .to(group.current.position, {
        y: initialY + 0.05, // Slight bounce up
        duration: 0.1,
        ease: "bounce.in"
      })
      .to(group.current.position, {
        y: initialY, // Final settle
        duration: 0.15,
        ease: "bounce.out"
      });
    
    console.log("GSAP timeline started");
  };

  return (
    <group ref={group} dispose={null} onClick={handleClick} position={[0, 0.02, 0]} rotation={[0, -Math.PI / 2, 0]} scale={0.5} >
      <primitive castShadow object={scene} position={[0, -0.02, 0]} />
    </group>
  );
}

function Backdrop({ url = "public/untitled.glb" }: { url?: string }) {
  const { nodes, materials } = useGLTF('public/untitled.glb');
  return (
    <group dispose={null}>
      <mesh
        castShadow
        receiveShadow
        geometry={(nodes.backdrop as THREE.Mesh).geometry}
        material={new THREE.MeshStandardMaterial({ color: "#000000", metalness: 0.0, roughness: 1.0 })}
        position={[0, 0.02, -1.5]}
        rotation={[0, -Math.PI / 2, 0]}
        scale={[2, 1, 20]}
      />
    </group>
  );
}

export default function App({ modelUrl = "/business-card.glb" }: { modelUrl?: string }) {
  return (
    <div style={{ width: "100vw", height: "100vh", background: "#000" }}>
      <Canvas shadows>
        <color attach="background" args={["#000"]} />
        <CameraRig />

        <ambientLight intensity={20.0} />

        {/* Light with helper - now properly inside Canvas context */}
        <LightWithHelper />

        <Environment preset="park" environmentRotation={[0, Math.PI / 2, Math.PI / 6]} environmentIntensity={1.0} />

        <ContactShadows position={[0, 0.08, 0]} opacity={0.6} blur={2} far={0.6} />

        <Suspense fallback={<Loader />}>
          <LuxuryCard url={modelUrl} />
          <Backdrop />
        </Suspense>

        <OrbitControls enableZoom={false} enablePan={false} autoRotate={false} enableRotate={false} />
      </Canvas>
    </div>
  );
}

useGLTF.preload("public/business-card.glb");
useGLTF.preload("public/untitled.glb");