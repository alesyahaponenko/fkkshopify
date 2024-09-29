import { useEffect, useState } from "react";

const useShopifyConnect = () => {
  const [param, setParam] = useState(null);
  const [bladeColor, setBladeColor] = useState('orange');
  useEffect(() => {
    document.shopifyConnect?.onParamChanged((newParam) => {
      setParam(newParam);
    });
    document.shopifyConnect?.onBladeColorChanged(({ color }) => {
      setBladeColor(color);
    })
  }, []);
  return { param, bladeColor };
};

export default useShopifyConnect;
