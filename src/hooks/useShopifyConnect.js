import { useEffect, useState } from "react";

const useShopifyConnect = () => {
  const [param, setParam] = useState(null);
  const [selectedDiscColors, setSelectedDiscColors] = useState([]);

  useEffect(() => {
    if (document.shopifyConnect) {
      document.shopifyConnect.onParamChanged((newParam) => {
        setParam(newParam);
      });

      document.shopifyConnect.onDiscColorsChanged(({ colors }) => {
        console.log("onDiscColorsChanged in React:", colors);
        setSelectedDiscColors(colors);
      });
    }
  }, []);

  return { param, selectedDiscColors };
};

export default useShopifyConnect;