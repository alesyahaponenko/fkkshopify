import { Suspense, useCallback, useEffect, useMemo, useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import {
  Environment,
  PerspectiveCamera,
  CameraControls,
} from '@react-three/drei';
import { ACESFilmicToneMapping, Vector3 } from 'three';
import ModelLoader from './components/ModelLoader';
import useShopifyConnect from './hooks/useShopifyConnect';

const CAMERA_CONSTANTS = {
  BASE_WIDTH: 800,
  BASE_FOV: 45,
  MIN_DISTANCE: 200,
  MAX_DISTANCE: 500,
  INITIAL_POSITION: [0, 0, 350],
};

const LIGHT_POSITIONS = {
  HEMISPHERE: [10, 10, 10], 
  DIRECTIONAL: [
    [-80, 0, 200],    // directionalLight1
    [-80, 0, -200],   // directionalLight1 * 0.7
    [100, 100, 100],  // directionalLight2
    [-100, -100, -100], // directionalLight2 * 0.3
    [10, 100, 10],    // directionalLight3 * 0.8
    [-10, -100, -10], // directionalLight3 * 0.8
    [100, 100, 100],  // directionalLight1 * 0.4
    [-100, 100, -100], // directionalLight1 * 0.4
    [100, -100, -100], // directionalLight1 * 0.4
    [-100, -100, 100], // directionalLight1 * 0.4
    [-50, 0, 200], // 10 directionalLight1 * 0.7
    [-30, 0, 200],// 11 directionalLight1 
    [0, 0, 200], // 12 directionalLight1 * 0.7
    [-30, 0, -200], // 13 directionalLight1 * 0.7
    [-50, 0, -200], // 14 directionalLight1 * 0.7
    [0, 0, -200], // 15 directionalLight1 * 0.7
  ],
};

const useCameraInitialization = (cameraControlsRef, globalOptions, cameraPosition, updateCameraView) => {
  const lastCameraPosition = useRef(null);
  const isCameraInitialized = useRef(false);
  const isSettingCamera = useRef(false);

  const resetCamera = useCallback(() => {
    if (!document.shopifyConnect || isSettingCamera.current) {
      return Promise.resolve();
    }

    isSettingCamera.current = true;
    isCameraInitialized.current = false;
    lastCameraPosition.current = null;

    const currentSettings = document.shopifyConnect.getCameraSettings(cameraPosition);
    const initialDistance = currentSettings?.defaultDistance || CAMERA_CONSTANTS.INITIAL_POSITION[2];

    if (cameraControlsRef.current) {
      cameraControlsRef.current.reset(true);
      cameraControlsRef.current.setLookAt(0, 0, initialDistance, 0, 0, 0, true);
    }

    document.shopifyConnect.triggerCameraPositionChange(cameraPosition);

    return new Promise(resolve => {
      setTimeout(() => {
        isSettingCamera.current = false;
        resolve();
      }, 150);
    });
  }, [cameraPosition]);

  const initializeCamera = useCallback(async () => {
    if (
      !cameraControlsRef.current ||
      !globalOptions?.camera?.savedPositions ||
      isSettingCamera.current
    ) {
      return false;
    }

    try {
      const { savedPositions } = globalOptions.camera;
      isSettingCamera.current = true;
      await resetCamera();

      const positionObj = savedPositions.find(pos => pos.name === cameraPosition) || savedPositions[0];
      if (!positionObj) return false;

      const currentSettings = document.shopifyConnect.getCameraSettings(cameraPosition);

      if (cameraControlsRef.current) {
        const { position, target } = positionObj;

        if (currentSettings) {
          const direction = new Vector3(
            position.x - target.x,
            position.y - target.y,
            position.z - target.z
          ).normalize();

          const newPosition = new Vector3(
            target.x + direction.x * currentSettings.defaultDistance,
            target.y + direction.y * currentSettings.defaultDistance,
            target.z + direction.z * currentSettings.defaultDistance
          );

          cameraControlsRef.current.setLookAt(
            newPosition.x, newPosition.y, newPosition.z,
            target.x, target.y, target.z,
            true
          );
        } else {
          cameraControlsRef.current.setLookAt(
            position.x, position.y, position.z,
            target.x, target.y, target.z,
            true
          );
        }
      }

      updateCameraView();
      document.shopifyConnect.triggerCameraPositionChange(cameraPosition);
      lastCameraPosition.current = cameraPosition;
      isCameraInitialized.current = true;

      return true;
    } catch (error) {
      console.error('Error initializing camera:', error);
      return false;
    } finally {
      isSettingCamera.current = false;
    }
  }, [cameraPosition, globalOptions?.camera?.savedPositions, resetCamera, updateCameraView]);

  return { initializeCamera };
};

function SceneSetup({ globalOptions }) {
  const envRef = useRef();
  const lights = globalOptions?.lights || {};

  return (
    <>
      <hemisphereLight
        intensity={lights.ambient || 0.5} 
        position={LIGHT_POSITIONS.HEMISPHERE}
        groundColor="#ffffff"
      />
      
      {/* Directional lights group 1 - basic directional lights */}
      {[0, 1, 10, 11, 12, 13, 14, 15].map(index => (
        <directionalLight
          key={`dir-light-${index}`}
          color="white"
          position={LIGHT_POSITIONS.DIRECTIONAL[index]}
          intensity={lights.directionalLight1 * 0.1 || 0.1}
        />
      ))}
      
      {/* Major directional light */}
      <directionalLight
        color="white"
        position={LIGHT_POSITIONS.DIRECTIONAL[2]}
        intensity={lights.directionalLight2 || 0.5}
      />
      
      {/* Secondary directional light with reduced intensity */}
      <directionalLight
        color="white"
        position={LIGHT_POSITIONS.DIRECTIONAL[3]}
        intensity={(lights.directionalLight2 || 0.5) * 0.3}
      />
      
      {/* Third directional light group */}
      {[4, 5].map(index => (
        <directionalLight
          key={`dir-light-${index}`}
          color="white"
          position={LIGHT_POSITIONS.DIRECTIONAL[index]}
          intensity={(lights.directionalLight3 || 0.5) * 0.8}
        />
      ))}
      
      {/* Minor fill lights */}
      {[6, 7, 8, 9].map(index => (
        <directionalLight
          key={`dir-light-${index}`}
          color="white"
          position={LIGHT_POSITIONS.DIRECTIONAL[index]}
          intensity={(lights.directionalLight1 || 0.1) * 0.1}
        />
      ))}
      
      {/* Environment lighting */}
      <Environment
        ref={envRef}
        files="https://cdn.shopify.com/s/files/1/0708/2462/4376/files/startup.hdr?v=1741732314"
        environmentIntensity={lights.exposurelvl || 1}
      />
    </>
  );
}

function CameraSetup({ globalOptions, cameraPosition, cameraSettings, forceReinit }) {
  const cameraControlsRef = useRef();
  const { camera, gl, size } = useThree();
  const initialSetupDone = useRef(false);

  const currentSettings = useMemo(() => ({
    minDistance: cameraSettings?.minDistance || CAMERA_CONSTANTS.MIN_DISTANCE,
    maxDistance: cameraSettings?.maxDistance || CAMERA_CONSTANTS.MAX_DISTANCE,
    defaultDistance: cameraSettings?.defaultDistance || CAMERA_CONSTANTS.INITIAL_POSITION[2],
  }), [cameraSettings]);

  const updateCameraView = useCallback(() => {
    if (!camera || !globalOptions?.camera?.savedPositions) return;

    const canvas = gl.domElement;
    const viewportWidth = parseInt(window.getComputedStyle(canvas).width);
    const viewportHeight = parseInt(window.getComputedStyle(canvas).height);
    const aspectRatio = viewportWidth / viewportHeight;

    camera.fov = CAMERA_CONSTANTS.BASE_FOV;
    camera.aspect = aspectRatio;
    camera.updateProjectionMatrix();

    gl.setSize(viewportWidth, viewportHeight);
  }, [camera, gl, globalOptions]);

  const { initializeCamera } = useCameraInitialization(
    cameraControlsRef,
    globalOptions,
    cameraPosition,
    updateCameraView
  );

  useEffect(() => {
    if (cameraPosition || forceReinit) {
      initializeCamera();
    }
  }, [cameraPosition, initializeCamera, forceReinit]);

  useEffect(() => {
    if (!cameraControlsRef.current || !camera) return;

    const controls = cameraControlsRef.current;
    controls.minDistance = currentSettings.minDistance;
    controls.maxDistance = currentSettings.maxDistance;

    if (currentSettings.defaultDistance && (!initialSetupDone.current || !cameraPosition)) {
      const target = new Vector3();
      controls.getTarget(target);

      const position = new Vector3();
      camera.getWorldPosition(position);

      const direction = position.sub(target).normalize();
      const newPosition = target.clone().add(
        direction.multiplyScalar(currentSettings.defaultDistance)
      );

      controls.setPosition(newPosition.x, newPosition.y, newPosition.z, true);
      initialSetupDone.current = true;
    }
  }, [currentSettings, camera, cameraPosition]);

  useEffect(() => {
    const handleResize = () => updateCameraView();
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [updateCameraView]);

  return (
    <>
      <CameraControls
        ref={cameraControlsRef}
        enabled={true}
        makeDefault
        minDistance={currentSettings.minDistance}
        maxDistance={currentSettings.maxDistance}
        dollyEnabled={false}
        truckEnabled={false}
        panEnabled={false}
        rotateEnabled={true}
        zoomEnabled={true}
        dragToOffset={false}
        smoothTime={0.25}
      />
      <PerspectiveCamera
        makeDefault
        fov={CAMERA_CONSTANTS.BASE_FOV}
        aspect={size.width / size.height}
        position={[0, 0, currentSettings.defaultDistance]}
        near={1} 
        far={1000} 
      />
    </>
  );
}

function App() {
  const { handleModel, bladeModel, globalOptions, cameraPosition, cameraSettings, forceReinit } = useShopifyConnect();

  const modelLoaderProps = {
    handleModel,
    bladeModel,
    cameraPosition,
    timestamp: Date.now(),
  };

  return (
    <Canvas
      antialias={true}
      dpr={[1, 2]}
      gl={{
        alpha: true,
        stencil: false,
        depth: true,
        powerPreference: 'high-performance',
      }}
    >
      <Suspense fallback={null}>
        <SceneSetup globalOptions={globalOptions} />
        <CameraSetup
          globalOptions={globalOptions}
          cameraPosition={cameraPosition}
          cameraSettings={cameraSettings}
          forceReinit={forceReinit}
        />
        <ModelLoader {...modelLoaderProps} />
      </Suspense>
    </Canvas>
  );
}

export default App;