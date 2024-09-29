class ShopifyConnect {
  constructor(props) {
    this.onParamChangedCb
  }

  triggerParamChange(data) {
    if (typeof this.onParamChangedCb === "function") {
      this.onParamChangedCb(data)
    }
  }

  triggerBladeColorChange(data) {
    if (typeof this.onBladeColorChangedCb === "function") {
      this.onBladeColorChangedCb(data)
    }
  }

  onParamChanged(_cb) {
    if (typeof _cb === "function") {
      this.onParamChangedCb = _cb
    }
  }

  onBladeColorChanged(_cb) {
    if (typeof _cb === "function") {
      this.onBladeColorChangedCb = _cb
    }
  }
}

document.shopifyConnect = new ShopifyConnect()
