'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, ThreeEvent, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, useGLTF } from '@react-three/drei';
import { BufferAttribute, BufferGeometry, Color, Group, Mesh, ShaderMaterial } from 'three';
import { applyFitAnchors } from '@/lib/tryon/fitAnchors';
import { buildHeatmapVertexColors } from '@/lib/tryon/heatmapCalculator';
import { pressureLabelFromColor } from '@/lib/tryon/heatmapCalculator';
import { loadGltfModel } from '@/lib/tryon/modelLoader';
import { heatmapFragmentShader, heatmapVertexShader } from './shaders/heatmapShaders';
import type { BodyProfile, Product3DAsset, ProductVariant } from '@/lib/tryon/types';

interface ManiquiSceneProps {
  bodyProfile: BodyProfile;
  clothingAsset: Product3DAsset | null;
  selectedVariant: ProductVariant | null;
  showHeatmap: boolean;
  onCanvasReady?: (canvas: HTMLCanvasElement | null) => void;
  onPressureHover?: (pressure: { label: string; x: number; y: number } | null) => void;
  onLoadStart: () => void;
  onLoadComplete: () => void;
  onLoadError: (error: Error) => void;
}

function getFacePressureLabel(geometry: BufferGeometry, faceIndex: number): string | null {
  const color = geometry.getAttribute('color') as BufferAttribute | undefined;
  if (!color || color.itemSize < 3) return null;

  const index = geometry.getIndex();
  const triangleOffset = faceIndex * 3;

  const readVertexIndex = (offset: number) => {
    if (!index) return triangleOffset + offset;
    return index.getX(triangleOffset + offset);
  };

  const a = readVertexIndex(0);
  const b = readVertexIndex(1);
  const c = readVertexIndex(2);

  const average = new Color(
    (color.getX(a) + color.getX(b) + color.getX(c)) / 3,
    (color.getY(a) + color.getY(b) + color.getY(c)) / 3,
    (color.getZ(a) + color.getZ(b) + color.getZ(c)) / 3,
  );

  return pressureLabelFromColor(average);
}

function AmbientParticles() {
  const points = useRef<Group>(null);
  const reducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const particles = useMemo(() => {
    const values = new Float32Array(200 * 3);
    for (let i = 0; i < 200; i += 1) {
      values[i * 3] = (Math.random() - 0.5) * 10;
      values[i * 3 + 1] = Math.random() * 4;
      values[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return values;
  }, []);

  useFrame(() => {
    if (!points.current || reducedMotion) return;
    points.current.rotation.y += 0.0001;
  });

  if (reducedMotion) return null;

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[particles, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.01} sizeAttenuation color="#F5F0E8" opacity={0.35} transparent depthWrite={false} />
    </points>
  );
}

function ParametricMannequin({ bodyProfile }: { bodyProfile: BodyProfile }) {
  const height = Number(bodyProfile.height_cm ?? 165);
  const shoulders = Number(bodyProfile.shoulder_width_cm ?? 42);

  const torsoHeight = Math.max(0.75, height / 220);
  const torsoRadiusTop = Math.max(0.14, shoulders / 420);

  return (
    <group>
      <mesh position={[0, 1.35, 0]}>
        <sphereGeometry args={[0.16, 24, 24]} />
        <meshStandardMaterial color={new Color(bodyProfile.skin_tone ?? '#D8B08C')} roughness={0.7} metalness={0.05} />
      </mesh>

      <mesh position={[0, 0.72, 0]}>
        <cylinderGeometry args={[torsoRadiusTop * 0.65, torsoRadiusTop, torsoHeight, 20]} />
        <meshStandardMaterial color="#d9cec0" roughness={0.9} metalness={0.02} />
      </mesh>

      <mesh position={[-0.2, 0.2, 0]}>
        <cylinderGeometry args={[0.07, 0.08, 0.9, 16]} />
        <meshStandardMaterial color="#d9cec0" roughness={0.9} metalness={0.02} />
      </mesh>
      <mesh position={[0.2, 0.2, 0]}>
        <cylinderGeometry args={[0.07, 0.08, 0.9, 16]} />
        <meshStandardMaterial color="#d9cec0" roughness={0.9} metalness={0.02} />
      </mesh>
      <mesh position={[-0.34, 0.82, 0]}>
        <cylinderGeometry args={[0.05, 0.06, 0.65, 16]} />
        <meshStandardMaterial color="#d9cec0" roughness={0.9} metalness={0.02} />
      </mesh>
      <mesh position={[0.34, 0.82, 0]}>
        <cylinderGeometry args={[0.05, 0.06, 0.65, 16]} />
        <meshStandardMaterial color="#d9cec0" roughness={0.9} metalness={0.02} />
      </mesh>
    </group>
  );
}

function AvatarModel({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
}

interface ClothingModelProps {
  clothingAsset: Product3DAsset;
  mannequinRef: React.RefObject<Group | null>;
  showHeatmap: boolean;
  onPressureHover?: (pressure: { label: string; x: number; y: number } | null) => void;
  onLoadStart: () => void;
  onLoadComplete: () => void;
  onLoadError: (error: Error) => void;
}

function ClothingModel({
  clothingAsset,
  mannequinRef,
  showHeatmap,
  onPressureHover,
  onLoadStart,
  onLoadComplete,
  onLoadError,
}: ClothingModelProps) {
  const groupRef = useRef<Group>(null);
  const [cloth, setCloth] = useState<Group | null>(null);
  const heatmapMaterial = useRef<ShaderMaterial | null>(null);

  useEffect(() => {
    let cancelled = false;
    onLoadStart();

    void loadGltfModel(clothingAsset.model_url)
      .then((gltf) => {
        if (cancelled) return;
        setCloth(gltf.scene);
        onLoadComplete();
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        onLoadError(error instanceof Error ? error : new Error('No se pudo cargar la prenda.'));
      });

    return () => {
      cancelled = true;
    };
  }, [clothingAsset.model_url, onLoadComplete, onLoadError, onLoadStart]);

  useEffect(() => {
    if (!cloth || !mannequinRef.current) return;

    applyFitAnchors(cloth, mannequinRef.current, clothingAsset.fit_anchors);

    const mannequinMesh = mannequinRef.current.children.find((child) => (child as Mesh).isMesh) as Mesh | undefined;
    if (!mannequinMesh || !(mannequinMesh.geometry instanceof BufferAttribute || mannequinMesh.geometry)) return;

    cloth.traverse((item) => {
      const mesh = item as Mesh;
      if (!mesh.isMesh || !mesh.geometry) return;

      if (mannequinMesh.geometry && 'getAttribute' in mannequinMesh.geometry) {
        const colors = buildHeatmapVertexColors(mesh.geometry, mannequinMesh.geometry);
        mesh.geometry.setAttribute('color', new BufferAttribute(colors, 3));
      }

      if (!heatmapMaterial.current) {
        heatmapMaterial.current = new ShaderMaterial({
          vertexShader: heatmapVertexShader,
          fragmentShader: heatmapFragmentShader,
          uniforms: {
            uMix: { value: 0 },
          },
          vertexColors: true,
        });
      }
    });
  }, [cloth, clothingAsset.fit_anchors, mannequinRef]);

  useFrame((_, delta) => {
    if (!heatmapMaterial.current) return;
    const target = showHeatmap ? 1 : 0;
    const current = Number(heatmapMaterial.current.uniforms.uMix.value);
    heatmapMaterial.current.uniforms.uMix.value = current + (target - current) * Math.min(1, delta * 2);

    if (!groupRef.current) return;
    groupRef.current.traverse((obj) => {
      const mesh = obj as Mesh;
      if (!mesh.isMesh) return;
      if (showHeatmap && heatmapMaterial.current) {
        mesh.material = heatmapMaterial.current;
      }
    });
  });

  if (!cloth) return null;

  return (
    <group
      ref={groupRef}
      onPointerMove={(event: ThreeEvent<PointerEvent>) => {
        if (!showHeatmap || !event.object || !(event.object as Mesh).isMesh) {
          onPressureHover?.(null);
          return;
        }

        const mesh = event.object as Mesh;
        if (!mesh.geometry || event.faceIndex === undefined || event.faceIndex === null) {
          onPressureHover?.(null);
          return;
        }

        const label = getFacePressureLabel(mesh.geometry as BufferGeometry, event.faceIndex);
        if (!label) {
          onPressureHover?.(null);
          return;
        }

        onPressureHover?.({
          label,
          x: event.pointer.x,
          y: event.pointer.y,
        });
      }}
      onPointerOut={() => onPressureHover?.(null)}
    >
      <primitive object={cloth} />
    </group>
  );
}

export function ManiquiScene({
  bodyProfile,
  clothingAsset,
  selectedVariant,
  showHeatmap,
  onCanvasReady,
  onPressureHover,
  onLoadStart,
  onLoadComplete,
  onLoadError,
}: ManiquiSceneProps) {
  const mannequinRef = useRef<Group>(null);

  useEffect(() => {
    return () => {
      onCanvasReady?.(null);
    };
  }, [onCanvasReady]);

  return (
    <div className="h-full w-full bg-[#0D0A08]" role="img" aria-label={`Probador virtual en talle ${selectedVariant?.size ?? 'default'}`}>
      <Canvas
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance', preserveDrawingBuffer: true }}
        dpr={[1, 2]}
        frameloop="demand"
        onCreated={(state) => onCanvasReady?.(state.gl.domElement)}
      >
        <color attach="background" args={['#0D0A08']} />
        <PerspectiveCamera makeDefault fov={45} position={[0, 1, 3]} />
        <OrbitControls
          enablePan={false}
          minDistance={1}
          maxDistance={5}
          minPolarAngle={Math.PI * 0.1}
          maxPolarAngle={Math.PI * 0.9}
          enableDamping
          dampingFactor={0.05}
        />

        <ambientLight intensity={0.3} color="#FFF5E6" />
        <directionalLight intensity={1.2} position={[2, 4, 2]} color="#FFE4C4" />
        <directionalLight intensity={0.4} position={[-2, 2, -1]} color="#E6D5C3" />
        <pointLight intensity={0.3} position={[0, -1, 2]} color="#C9A84C" />

        <AmbientParticles />

        <group ref={mannequinRef}>
          {bodyProfile.avatar_model_url ? (
            <Suspense fallback={null}>
              <AvatarModel url={bodyProfile.avatar_model_url} />
            </Suspense>
          ) : (
            <ParametricMannequin bodyProfile={bodyProfile} />
          )}
        </group>

        {clothingAsset ? (
          <ClothingModel
            clothingAsset={clothingAsset}
            mannequinRef={mannequinRef}
            showHeatmap={showHeatmap}
            onPressureHover={onPressureHover}
            onLoadStart={onLoadStart}
            onLoadComplete={onLoadComplete}
            onLoadError={onLoadError}
          />
        ) : null}
      </Canvas>
    </div>
  );
}
