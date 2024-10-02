import React, { useRef, useEffect } from 'react'
import { useLoader, useFrame } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import * as THREE from 'three'

function Model({ path }) {
  const gltf = useLoader(GLTFLoader, path)
  const modelRef = useRef()

  useEffect(() => {
    if (gltf) {
      gltf.scene.position.set(0, 0, 0)
      gltf.scene.scale.set(0.1, 0.1, 0.1)

      // Create a new material
      const newMaterial = new THREE.MeshStandardMaterial({
        color: 0xff0000, // Red color, you can change this
        metalness: 0.5,
        roughness: 0.5,
      })

      // Traverse the scene and apply the material to specified nodes
      gltf.scene.traverse((node) => {
        if (node.isMesh) {
          // node.material = newMaterial
        }
      })

      // Log all node names
      console.log('All node names:', getAllNodeNames(gltf.scene))
    }
  }, [gltf, materialNodes])

  const getAllNodeNames = (object) => {
    let names = []
    object.traverse((node) => {
      names.push(node.name)
    })
    return names
  }

  return <primitive object={gltf.scene} ref={modelRef} />
}

export default function ModelLoader({ modelPath, materialNodes = [] }) {
  return (
    <React.Suspense fallback={null}>
      <Model path={modelPath} materialNodes={materialNodes} />
    </React.Suspense>
  )
}
