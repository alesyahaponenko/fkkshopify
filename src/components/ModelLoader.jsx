import React, { useRef, useEffect } from 'react'
import { useLoader, useFrame } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

function Model({ path }) {
  const gltf = useLoader(GLTFLoader, path)
  const modelRef = useRef()

  useEffect(() => {
    if (gltf) {
      gltf.scene.position.set(0, 0, 0)

      gltf.scene.scale.set(0.1, 0.1, 0.1)
    }
  }, [gltf])

  return <primitive object={gltf.scene} ref={modelRef} />
}

export default function ModelLoader({ modelPath }) {
  return (
    <React.Suspense fallback={null}>
      <Model path={modelPath} />
    </React.Suspense>
  )
}
