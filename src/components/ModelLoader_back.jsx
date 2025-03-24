import React, { useRef, useEffect, useMemo } from "react";
import { useLoader } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import * as THREE from "three";

const DEFAULT_COLOR = "#808080";
const DEFAULT_METALNESS = 0.5;
const DEFAULT_ROUGHNESS = 0.5;

function recalculateUVs(geometry, scaleU = 1, scaleV = 1, rotate90 = false) {
  if (!geometry || !geometry.isBufferGeometry) return geometry;

  geometry.computeBoundingBox();

  const min = geometry.boundingBox.min;
  const max = geometry.boundingBox.max;
  const range = {
    x: max.x - min.x,
    y: max.y - min.y,
  };

  const positions = geometry.attributes.position.array;
  const uvs = [];

  // Calculate UVs for each vertex
  for (let i = 0; i < positions.length; i += 3) {
    // Get normalized coordinates
    const x = (positions[i] - min.x) / range.x;
    const y = (positions[i + 1] - min.y) / range.y;

    // Add UV coordinates
    uvs.push(x, y);
  }

  // Set new UV attribute
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  return geometry;
}

function Model({ path, nodeMaterials = {} }) {
  const gltf = useLoader(GLTFLoader, path, (loader) => {
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath(
      "https://www.gstatic.com/draco/versioned/decoders/1.5.6/"
    );
    loader.setDRACOLoader(dracoLoader);
  });

  const model = useMemo(() => gltf.scene.clone(true), [gltf]);
  const modelRef = useRef(model);

  const materialsCache = useRef(new Map());
  const texturesCache = useRef(new Map());
  const geometriesCache = useRef(new Map());

  useEffect(() => {
    if (!model) return;

    materialsCache.current.clear();
    texturesCache.current.clear();
    geometriesCache.current.clear();

    model.traverse((node) => {
      if (node.isMesh) {
        // Только UV маппинг без дополнительного сглаживания
        if (!geometriesCache.current.has(node.name)) {
          const geometry = node.geometry.clone();
          const finalGeometry = recalculateUVs(geometry);
          geometriesCache.current.set(node.name, finalGeometry);
        }
        node.geometry = geometriesCache.current.get(node.name);

        const material = nodeMaterials[node.name];

        if (!material) {
          if (!materialsCache.current.has(node.name)) {
            const defaultMaterial = new THREE.MeshStandardMaterial({
              color: new THREE.Color(DEFAULT_COLOR),
              metalness: DEFAULT_METALNESS,
              roughness: DEFAULT_ROUGHNESS,
              side: THREE.DoubleSide,
              flatShading: false,
            });
            materialsCache.current.set(node.name, defaultMaterial);
          }
          node.material = materialsCache.current.get(node.name);
          return;
        }

        // Обработка текстур
        let texture;
        if (
          material.texture &&
          typeof material.texture === "string" &&
          material.texture.startsWith("http")
        ) {
          if (!texturesCache.current.has(material.texture)) {
            const textureLoader = new THREE.TextureLoader();
            texture = textureLoader.load(
              material.texture,
              // Success callback
              (loadedTexture) => {
                loadedTexture.needsUpdate = true;
              },
              // Progress callback
              undefined,
              // Error callback
              (error) => {
                console.error("Error loading texture:", error);
              }
            );
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            texture.minFilter = THREE.LinearFilter;
            texture.generateMipmaps = true;
            texturesCache.current.set(material.texture, texture);
          }
          texture = texturesCache.current.get(material.texture);
        }

        if (!materialsCache.current.has(node.name)) {
          const meshMaterial = new THREE.MeshStandardMaterial({
            color: new THREE.Color(material.color),
            metalness: material.metalness ?? DEFAULT_METALNESS,
            roughness: material.roughness ?? DEFAULT_ROUGHNESS,
            map: texture || null, // Используем null если текстура не загрузилась
            side: THREE.DoubleSide,
            flatShading: false,
          });
          materialsCache.current.set(node.name, meshMaterial);
        }

        node.material = materialsCache.current.get(node.name);
        node.castShadow = true;
        node.receiveShadow = true;
      }
    });

    return () => {
      texturesCache.current.forEach((texture) => {
        texture.dispose();
      });
      texturesCache.current.clear();

      materialsCache.current.forEach((material) => {
        if (material.map) material.map.dispose();
        material.dispose();
      });
      materialsCache.current.clear();

      geometriesCache.current.forEach((geometry) => {
        geometry.dispose();
      });
      geometriesCache.current.clear();
    };
  }, [model, nodeMaterials]);

  return <primitive object={modelRef.current} />;
}

function ModelLoader({ handleModel, bladeModel, timestamp }) {
  useEffect(() => {
    console.log("ModelLoader received new props:", {
      handleModel,
      bladeModel,
      timestamp,
      hasHandle: Boolean(handleModel),
      hasBlade: Boolean(bladeModel),
    });
  }, [handleModel, bladeModel, timestamp]);

  return (
    <>
      {handleModel && (
        <Model
          key={`handle-${handleModel.fileUrl}`}
          path={handleModel.fileUrl}
          nodeMaterials={handleModel.nodeMaterials}
        />
      )}
      {bladeModel && (
        <Model
          key={`blade-${bladeModel.fileUrl}`}
          path={bladeModel.fileUrl}
          nodeMaterials={bladeModel.nodeMaterials}
        />
      )}
    </>
  );
}

export default ModelLoader;
