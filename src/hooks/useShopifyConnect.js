import { useEffect, useState } from "react";

const useShopifyConnect = () => {
  const [param, setParam] = useState(null);
  const [bladeColor, setBladeColor] = useState('orange');
  const [selectedDiscColors, setSelectedDiscColors] = useState([]);

  useEffect(() => {
    if (document.shopifyConnect) {
      document.shopifyConnect.onParamChanged((newParam) => {
        setParam(newParam);
      });

      document.shopifyConnect.onBladeColorChanged(({ color }) => {
        setBladeColor(color);
      });

      document.shopifyConnect.onDiscColorsChanged(({ colors }) => {
        setSelectedDiscColors(colors);
      });
    }
  }, []);

  return { param, bladeColor, selectedDiscColors };
};

export default useShopifyConnect;