import { useState, Suspense } from 'react'
import './App.css'
import { Canvas } from '@react-three/fiber'
import { Environment, ContactShadows, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { Model1 } from './model1'
import { Model2 } from './model2'
import useShopifyConnect from './hooks/useShopifyConnect'

function App() {
  const { param, bladeColor } = useShopifyConnect()

  const [selectModel, setSelectModel] = useState('model1')
  const [bladesColor, setBladesColor] = useState('#cacccd')
  const [discColor1, setDiscColor1] = useState('#d81818')
  const [discColor2, setDiscColor2] = useState('#e2dd65')
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
          <Model1
            scale={[0.01, 0.01, 0.01]}
            visible={selectModel === 'model1'}
            bladesColor={bladeColor}
            discColor1={discColor1}
            discColor2={discColor2}
          />
          <Model2
            scale={[0.014, 0.014, 0.014]}
            position-y={-0.5}
            visible={selectModel === 'model2'}
            bladesColor={bladeColor}
            discColor1={discColor1}
            discColor2={discColor2}
          />
        </Suspense>
        <ContactShadows position={[0, -0.8, 0]} color='#ffffff' />
        <OrbitControls />
      </Canvas>
    </div>
  )
}

export default App
