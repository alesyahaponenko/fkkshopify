import { useState, Suspense, useEffect } from 'react'
import './App.css'
import { Canvas } from '@react-three/fiber'
import { Environment, ContactShadows, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import useShopifyConnect from './hooks/useShopifyConnect'
import ModelLoader from './components/ModelLoader'

function App() {
  const { param, bladeColor, selectedDiscColors } = useShopifyConnect()

  useEffect(() => {
    console.log('selectedDiscColors from react', selectedDiscColors)
  }, [])

  return (
    <div className='absolute w-full h-full left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2'>
      <Canvas
        shadows={true}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          preserveDrawingBuffer: true,
        }}
        camera={{
          fov: 40,
          position: [0, 0.5, 18],
        }}
      >
        <Environment files='https://cdn.shopify.com/s/files/1/0739/0206/3938/files/forest_slope_1k.hdr' />
        <Suspense fallback={null}>
          <ModelLoader modelPath='https://cdn.shopify.com/s/files/1/0739/0206/3938/files/model1.glb?v=1703582209' />
        </Suspense>
        <ContactShadows position={[0, -0.8, 0]} color='#ffffff' />
        <OrbitControls />
      </Canvas>
    </div>
  )
}

export default App
