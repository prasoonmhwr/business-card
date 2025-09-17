import React, { Suspense, useRef, useState, useEffect } from "react";
import { Canvas, extend, useFrame, useThree } from "@react-three/fiber";
import { Html, useGLTF, OrbitControls, ContactShadows, Environment, useHelper } from "@react-three/drei";
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

  const [phase, setPhase] = useState<"idle" | "toss" | "settle">("toss");
  const [flipped, setFlipped] = useState(false);

  const pos = useRef({ y: 2, vy: 0, z: 5 ,x:1});
  const rot = useRef({ x: -Math.PI * 0.6, vx: 0, y: -Math.PI / 2, z: 0 });
  const scale = useRef(0.5);

  useEffect(() => {
    const t = setTimeout(() => setPhase("toss"), 300);
    gsap.to(group.current.postion, {  y: 2, vy: 0, z: 5 ,x:1, duration: 1.5, ease: "power2.out" });
    return () => clearTimeout(t);
  }, []);

  // useFrame((_, dt) => {
  //   if (!group.current) return;

  //   if (phase === "toss") {
  //     pos.current.vy -= 9.8 * dt * 0.7;
  //     pos.current.y += pos.current.vy * dt;

  //     const targetRx = 0;
  //     const ax = (targetRx - rot.current.x) * 15;
  //     rot.current.vx += ax * dt;
  //     rot.current.vx *= Math.pow(0.2, dt * 60);
  //     rot.current.x += rot.current.vx * dt;

  //     if (pos.current.y <= 0.12) {
  //       pos.current.y = 0.12;
  //       pos.current.vy *= -0.18;
  //       if (Math.abs(pos.current.vy) < 0.05) {
  //         pos.current.vy = 0;
  //         setPhase("settle");
  //       }
  //     }
      
  //   } else if (phase === "settle") {
  //     const targetRx = flipped ? Math.PI : 0;
  //     const rotationDiff = Math.abs(targetRx - rot.current.x);
  //     rot.current.x += (targetRx - rot.current.x) * Math.min(1, dt * 8);

  //     // Smooth flip rotation animation toward flipped state
  //     console.log("Flipped state in settle phase:", flipped);
  //     const targetY = -Math.PI / 2;
      
  //     const flipDiff = Math.abs(targetY - rot.current.y);
  //     rot.current.y += (targetY - rot.current.y) * Math.min(1, dt * 6);

  //     // Check if both rotations have settled, then set to idle
  //     if (rotationDiff < 0.01 && flipDiff < 0.01) {
  //       setPhase("idle");
  //     }
  //   }

  //   group.current.position.y = pos.current.y;
  //   group.current.rotation.x = rot.current.x;
  //   group.current.rotation.y = rot.current.y;
  //   group.current.scale.setScalar(scale.current);
  // });

  const handleClick = (event:any) => {
    const currentX = group.current.rotation.x;
  const targetX = currentX >= Math.PI / 2 ? 0 : Math.PI;
  const tl = gsap.timeline();
    
    // Store initial positions
    const initialY = group.current.position.y;
    const initialRotY = group.current.rotation.Y;
    const initialRotZ = group.current.rotation.z;
    
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
      
      // Peak moment - brief pause with maximum rotation
      // .to(group.current.rotation, {
      //   x: currentX + Math.PI * 2, // Additional spin at peak
      //   duration: 0.2,
      //   ease: "power2.out"
      // })
      
      // Fall down phase - card comes down and settles
      .to(group.current.position, {
        y: initialY, // Back to original position
        duration: 0.6,
        ease: "power2.out"
      })
      // .to(group.current.rotation, {
      //   y: initialRotY, // Final flip position
      //   x: targetX, // Back to original X rotation
      //   z: initialRotZ, // Back to original Z rotation
      //   duration: 0.6,
      //   ease: "back.out(1.7)" // Bouncy settle effect
      // }, "-=0.6") // Start 0.6 seconds before the end of previous animation
      
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