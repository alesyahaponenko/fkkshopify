import { useEffect, useState } from "react";

const useShopifyConnect = () => {
  const [handleModel, setHandleModel] = useState(null);
  const [bladeModel, setBladeModel] = useState(null);
  const [bladeGuardModel, setBladeGuardModel] = useState(null);
  const [globalOptions, setGlobalOptions] = useState(null);
  const [cameraPosition, setCameraPosition] = useState(null); // Now a name string
  const [cameraSettings, setCameraSettings] = useState(null);
  const [forceReinit, setForceReinit] = useState(0);

  useEffect(() => {
    if (!document.shopifyConnect) return;

    const handleHandleModelChange = (model) => {
      setHandleModel(model);
    };

    const handleBladeModelChange = (model) => {
      setBladeModel(model);
    };

    const handleBladeGuardModelChange = (model) => {
      setBladeGuardModel(model);
    };

    const handleGlobalOptionsChange = (options) => {
      if (options) {
        setGlobalOptions(options);
      }
    };

    const handleCameraPositionChange = (positionName, settings) => {
      const forceReinit = document.shopifyConnect._forceReinitCamera === true;

      if (document.shopifyConnect) {
        document.shopifyConnect._forceReinitCamera = false;
      }

      setCameraPosition(positionName);
      setCameraSettings(settings);

      if (forceReinit) {
        setForceReinit((prev) => prev + 1);
      }
    };

    document.shopifyConnect.onHandleModelChanged(handleHandleModelChange);
    document.shopifyConnect.onBladeModelChanged(handleBladeModelChange);
    document.shopifyConnect.onBladeGuardModelChanged(
      handleBladeGuardModelChange
    );
    document.shopifyConnect.onGlobalOptionsChanged(handleGlobalOptionsChange);
    document.shopifyConnect.onCameraPositionChanged(handleCameraPositionChange);

    return () => {
      if (document.shopifyConnect) {
        document.shopifyConnect.onHandleModelChanged(null);
        document.shopifyConnect.onBladeModelChanged(null);
        document.shopifyConnect.onBladeGuardModelChanged(null);
        document.shopifyConnect.onGlobalOptionsChanged(null);
        document.shopifyConnect.onCameraPositionChanged(null);
      }
    };
  }, []);

  return {
    handleModel,
    bladeModel,
    bladeGuardModel,
    globalOptions,
    cameraPosition,
    cameraSettings,
    forceReinit,
  };
};

export default useShopifyConnect;
