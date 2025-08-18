import React, { useRef, useEffect, useMemo, useState } from "react";
import { useLoader } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import * as BufferGeometryUtils from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { Color, DoubleSide, LinearFilter, MeshStandardMaterial, RepeatWrapping, TextureLoader } from "three";

const DEFAULT_COLOR = "#808080";
const DEFAULT_METALNESS = 0.5;
const DEFAULT_ROUGHNESS = 0.5;

function Model({ path, nodeMaterials = {}, modelId }) {
  const safeUrl = useMemo(() => {
    if (!path || typeof path !== 'string') {
      console.error('Invalid model path:', path);
      return null;
    }
    return path;
  }, [path]);

  if (!safeUrl) {
    return null;
  }

  const gltf = useLoader(GLTFLoader, safeUrl, (loader) => {
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("https://www.gstatic.com/draco/versioned/decoders/1.5.6/");
    loader.setDRACOLoader(dracoLoader);
  });

  const model = useMemo(() => gltf.scene.clone(true), [gltf]);
  const modelRef = useRef(model);

  const materialsCache = useRef(new Map());
  const texturesCache = useRef(new Map());
  const geometryProcessed = useRef(false);
  
  const prevModelIdRef = useRef(modelId);

  useEffect(() => {
    if (!model || geometryProcessed.current) return;

    if (prevModelIdRef.current !== modelId) {
      materialsCache.current.clear();
      texturesCache.current.clear();
      geometryProcessed.current = false;
      prevModelIdRef.current = modelId;
    }

    model.traverse((node) => {
      if (node && node.geometry) {
        const clonedGeometry = node.geometry.clone();
        // const mergedGeometry = BufferGeometryUtils.mergeVertices(clonedGeometry);
        // mergedGeometry.computeVertexNormals();
        node.geometry.dispose();
        node.geometry = clonedGeometry;
      }
    });
    
    geometryProcessed.current = true;
  }, [model, modelId]);

  useEffect(() => {
    if (!model) return;

    const timeout = setTimeout(() => {
      model.traverse((node) => {
      if (node && node.material) {
        node.material.flatShading = false;
        node.material.needsUpdate = true;
      }
      });
    }, 100);

    return () => {
      clearTimeout(timeout);
    }
  }, [model]);

  useEffect(() => {
    if (!model) return;

    model.traverse((node) => {
      if (node.isMesh) {
        const material = nodeMaterials[node.name];

        if (!material) {
          if (!materialsCache.current.has(node.name)) {
            const defaultMaterial = new MeshStandardMaterial({
              color: new Color(DEFAULT_COLOR),
              metalness: DEFAULT_METALNESS,
              roughness: DEFAULT_ROUGHNESS,
              side: DoubleSide,
              flatShading: false,
            });
            materialsCache.current.set(node.name, defaultMaterial);
          }
          node.material = materialsCache.current.get(node.name);
          
          node.castShadow = true;
          node.receiveShadow = true;
          return;
        }

        if (
          material.texture &&
          typeof material.texture === "string" &&
          material.texture.startsWith("http")
        ) {
          if (!texturesCache.current.has(material.texture)) {
            const textureLoader = new TextureLoader();
            const texture = textureLoader.load(
              material.texture,
              (loadedTexture) => {
                loadedTexture.wrapS = loadedTexture.wrapT = RepeatWrapping;
                loadedTexture.minFilter = LinearFilter;
                loadedTexture.needsUpdate = true;
              },
              undefined,
              (error) => {
                console.error("Error loading texture:", error);
              }
            );
            texturesCache.current.set(material.texture, texture);
          }
        }
      }
    });
  }, [model, nodeMaterials]);

  useEffect(() => {
    if (!model) return;

    model.traverse((node) => {
      if (node.isMesh) {
        const material = nodeMaterials[node.name];
        if (!material) {
          node.material = materialsCache.current.get(node.name);
          return;
        }

        const texture = material.texture ? texturesCache.current.get(material.texture) : null;

        if (!materialsCache.current.has(node.name)) {
          const meshMaterial = new MeshStandardMaterial({
            map: texture,
            color: new Color(material.color || DEFAULT_COLOR),
            metalness: material.metalness ?? DEFAULT_METALNESS,
            roughness: material.roughness ?? DEFAULT_ROUGHNESS,
            side: DoubleSide,
            flatShading: false, // Гладкое затенение
          });
          meshMaterial.needsUpdate = true;
          materialsCache.current.set(node.name, meshMaterial);
        } else {
          const existingMaterial = materialsCache.current.get(node.name);
          existingMaterial.map = texture;
          existingMaterial.color.set(material.color || DEFAULT_COLOR);
          existingMaterial.metalness = material.metalness ?? DEFAULT_METALNESS;
          existingMaterial.roughness = material.roughness ?? DEFAULT_ROUGHNESS;
          existingMaterial.flatShading = false; // Гарантируем гладкое затенение
          existingMaterial.needsUpdate = true;
        }

        node.material = materialsCache.current.get(node.name);
        node.castShadow = true;
        node.receiveShadow = true;
      }
    });
  }, [model, nodeMaterials]);

  useEffect(() => {
    return () => {
      materialsCache.current.forEach((material) => {
        if (material.map) material.map.dispose();
        material.dispose();
      });
      materialsCache.current.clear();

      texturesCache.current.forEach((texture) => {
        texture.dispose();
      });
      texturesCache.current.clear();
    };
  }, [path]);

  return <primitive object={modelRef.current} />;
}

function ModelLoader({ handleModel, bladeModel, timestamp }) {
  const [handleModelId, setHandleModelId] = useState(null);
  const [bladeModelId, setBladeModelId] = useState(null);
  
  useEffect(() => {
    if (handleModel) {
      if (handleModel.fileUrl && typeof handleModel.fileUrl === 'string') {
        const newId = `handle-${handleModel.fileUrl}-${handleModel.textFileName || ''}`;
        if (newId !== handleModelId) {
          setHandleModelId(newId);
        }
      } else {
        console.warn('Invalid handleModel.fileUrl:', handleModel.fileUrl);
        setHandleModelId(null);
      }
    } else {
      setHandleModelId(null);
    }
    
    if (bladeModel) {
      if (bladeModel.fileUrl && typeof bladeModel.fileUrl === 'string') {
        const newId = `blade-${bladeModel.fileUrl}-${bladeModel.textFileName || ''}`;
        if (newId !== bladeModelId) {
          setBladeModelId(newId);
        }
      } else {
        console.warn('Invalid bladeModel.fileUrl:', bladeModel.fileUrl);
        setBladeModelId(null);
      }
    } else {
      setBladeModelId(null);
    }
  }, [handleModel, bladeModel, handleModelId, bladeModelId]);

  // useEffect(() => {
  //   console.log("ModelLoader received new props:", {
  //     handleModelId,
  //     bladeModelId,
  //     hasHandle: Boolean(handleModel?.fileUrl),
  //     hasBlade: Boolean(bladeModel?.fileUrl),
  //   });
  // }, [handleModel, bladeModel, handleModelId, bladeModelId]);

  return (
    <>
      {handleModel && handleModel.fileUrl && handleModelId && (
        <Model
          key={handleModelId}
          modelId={handleModelId}
          path={handleModel.fileUrl}
          nodeMaterials={handleModel.nodeMaterials || {}}
        />
      )}
      {bladeModel && bladeModel.fileUrl && bladeModelId && (
        <Model
          key={bladeModelId}
          modelId={bladeModelId}
          path={bladeModel.fileUrl}
          nodeMaterials={bladeModel.nodeMaterials || {}}
        />
      )}
    </>
  );
}

export default ModelLoader;