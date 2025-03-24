// ShopifyConnect class
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
            
            this.defaultCameraSettings = {
                minDistance: 200,
                maxDistance: 500,
                defaultDistance: 350
            };
            
            this.cameraPositionSettings = new Map();
  
            this.triggerHandleModelChange = this.triggerHandleModelChange.bind(this);
            this.triggerBladeModelChange = this.triggerBladeModelChange.bind(this);
            this.triggerGlobalOptionsChange = this.triggerGlobalOptionsChange.bind(this);
            this.triggerCameraPositionChange = this.triggerCameraPositionChange.bind(this);
        }
  
        setCameraSettings(positionIndex, settings) {
            const updatedSettings = {
                ...this.defaultCameraSettings,
                ...settings
            };
            this.cameraPositionSettings.set(positionIndex, updatedSettings);
        }
  
        getCameraSettings(positionIndex) {
            return this.cameraPositionSettings.get(positionIndex) || this.defaultCameraSettings;
        }
  
        onCameraPositionChanged(callback) {
            if (typeof callback === "function") {
                this.onCameraPositionChangedCb = callback;
            }
        }
  
        triggerCameraPositionChange(cameraIndex) {
            if (typeof this.onCameraPositionChangedCb === "function") {
                const settings = this.getCameraSettings(cameraIndex);
                this.currentCameraPosition = cameraIndex;
                this.onCameraPositionChangedCb(cameraIndex, settings);
            }
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
    }
  
    const instance = new ShopifyConnect();
    window.shopifyConnectInstance = instance;
    window.shopifyConnect = instance;
    document.shopifyConnect = instance;
  
    return instance;
  };