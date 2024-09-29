import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { MeshStandardMaterial } from 'three';
import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';

function useDynamicModelLoader(modelPath) {
  const [Model, setModel] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadModel = async () => {
      try {
        const module = await import(`./models/${modelPath}`);
        if (isMounted) {
          setModel(() => module.default);
        }
      } catch (error) {
        console.error(`Error loading model ${modelPath}:`, error);
      }
    };

    loadModel();

    return () => {
      isMounted = false;
    };
  }, [modelPath]);

  return Model;
}

function ModelComponent({ modelPath, material, ...props }) {
  const Model = useDynamicModelLoader(modelPath);

  if (!Model) {
    return null;
  }

  return <Model material={material} {...props} />;
}

function DynamicModelViewer() {
  const configState = useSelector((state) => state.configState);
  const currentCollection = useSelector((state) => state.collectionsState.currentCollection);

  const material = useMemo(
    () =>
      new MeshStandardMaterial({
        color: configState?.selectedColor || '#ff0000',
        roughness: 0.5,
        metalness: 0.9,
      }),
    [configState?.selectedColor]
  );

  return (
    <Canvas>
      <Suspense fallback={null}>
        <group position={[0, 0, 0]} rotation={[0, 0, 0]}>
          {currentCollection.handles?.fileName && (
            <ModelComponent
              modelPath={`HandleCollections/${currentCollection.handles.fileName}`}
              material={material}
              collectionId={currentCollection.id}
              hoveredNode={currentCollection.handles?.hoveredNode}
            />
          )}
          {currentCollection.blades?.fileName && (
            <ModelComponent
              modelPath={`BladeCollections/${currentCollection.blades.fileName}`}
              material={material}
              collectionId={currentCollection.id}
              hoveredNode={currentCollection.blades?.hoveredNode}
            />
          )}
          {currentCollection.logos?.fileName && (
            <ModelComponent
              modelPath={`LogoCollections/${currentCollection.logos.fileName}`}
              material={material}
              collectionId={currentCollection.id}
              hoveredNode={currentCollection.logos?.hoveredNode}
            />
          )}
        </group>
      </Suspense>
    </Canvas>
  );
}

export default DynamicModelViewer;