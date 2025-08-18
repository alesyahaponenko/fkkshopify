window.initShopifyConnect = () => {
  if (window.shopifyConnectInstance) {
    return window.shopifyConnectInstance;
  }

  class ShopifyConnect {
    constructor() {
      this.onHandleModelChangedCb = null;
      this.onBladeModelChangedCb = null;
      this.onGlobalOptionsChangedCb = null;
      this.onCameraPositionChangedCb = null;
      this.currentCameraPosition = null;

      this.cameraSettings = new Map();

      this.triggerHandleModelChange = this.triggerHandleModelChange.bind(this);
      this.triggerBladeModelChange = this.triggerBladeModelChange.bind(this);
      this.triggerGlobalOptionsChange =
        this.triggerGlobalOptionsChange.bind(this);
      this.triggerCameraPositionChange =
        this.triggerCameraPositionChange.bind(this);
      this.setCameraSettings = this.setCameraSettings.bind(this);
      this.getCameraSettings = this.getCameraSettings.bind(this);
    }

    onHandleModelChanged(callback) {
      if (typeof callback === "function") {
        this.onHandleModelChangedCb = callback;
      }
    }

    onBladeModelChanged(callback) {
      if (typeof callback === "function") {
        this.onBladeModelChangedCb = callback;
      }
    }

    onGlobalOptionsChanged(callback) {
      if (typeof callback === "function") {
        this.onGlobalOptionsChangedCb = callback;
      }
    }

    onCameraPositionChanged(callback) {
      if (typeof callback === "function") {
        this.onCameraPositionChangedCb = callback;
      }
    }

    triggerHandleModelChange(handleModel) {
      if (typeof this.onHandleModelChangedCb === "function") {
        this.onHandleModelChangedCb(handleModel);
      }
    }

    triggerBladeModelChange(bladeModel) {
      if (typeof this.onBladeModelChangedCb === "function") {
        this.onBladeModelChangedCb(bladeModel);
      }
    }

    triggerGlobalOptionsChange(data) {
      if (typeof this.onGlobalOptionsChangedCb === "function") {
        this.onGlobalOptionsChangedCb(data);
      }
    }

    triggerCameraPositionChange(positionName) {
      if (typeof this.onCameraPositionChangedCb === "function") {
        const settings = this.getCameraSettings(positionName);
        this.currentCameraPosition = positionName;
        this.onCameraPositionChangedCb(positionName, settings);
      }
    }

    // Updated methods for working with camera settings using position name
    setCameraSettings(positionName, settings) {
      this.cameraSettings.set(positionName, {
        minDistance: settings.minDistance || 200,
        maxDistance: settings.maxDistance || 500,
        defaultDistance: settings.defaultDistance || 350,
      });
    }

    getCameraSettings(positionName) {
      return (
        this.cameraSettings.get(positionName) || {
          minDistance: 200,
          maxDistance: 500,
          defaultDistance: 350,
        }
      );
    }
  }

  const instance = new ShopifyConnect();
  window.shopifyConnectInstance = instance;
  window.shopifyConnect = instance;
  document.shopifyConnect = instance;

  return instance;
};

window.shopifyConnect = window.initShopifyConnect();
