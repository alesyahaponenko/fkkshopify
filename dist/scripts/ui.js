const TARGET_COLLECTION_ID = "cm3n7xcpo0000ljvbff65bjuu";

// Data storage
let appData = {  collections: null,
  globalOptions: null,
  currentCollection: null,
  currentModels: {
    handle: null,
    blade: null,
  },
  materialSettings: {
    activeSettings: {
    },
  },
};

async function fetchCollectionsData() {
  try {
    const response = await fetch("A_all-collections-data.json");
    const data = await response.json();

    appData.collections = data.collections;
    appData.globalOptions = data.globalOptions;
    return data;
  } catch (error) {
    console.error("Error fetching collections:", error);
    return null;
  }
}

function findCollectionById(collectionId) {
  return appData.collections.find(
    (collection) => collection.id === collectionId
  );
}

function getModelsByType(collection, modelType) {
  return collection?.items.filter((item) => item.modelType === modelType) || [];
}

function getModelGroups(model) {
  return model.refGroups || [];
}

function getMaterialColors(group) {
  const materials = group.groupedNodes[0]?.settingsData?.difmaps || [];
  return materials.map((material) => ({
    name: material.name,
    colors: material.colors,
    metalness: material.metalness,
    roughness: material.roughness,
    textures: material.textures,
  }));
}

function getMaterialForGroup() {
  return appData.materialSettings.activeSettings || {};
}

function setMaterialForGroup(materialName, color) {
  if (!appData.materialSettings.activeSettings[materialName]) {
    appData.materialSettings.activeSettings[materialName] = [];
  }

  const currentColors = appData.materialSettings.activeSettings[materialName];
  const colorIndex = currentColors.indexOf(color);

  if (colorIndex === -1) {
    currentColors.push(color);
  } else {
    currentColors.splice(colorIndex, 1);

    if (currentColors.length === 0) {
      const groups = getModelGroups(appData.currentModels.handle);
      const group = groups.find((g) => g.name === materialName);
      if (group) {
        const firstColor =
          group.groupedNodes[0]?.settingsData?.difmaps[0]?.colors[0];
        if (firstColor) {
          currentColors.push(firstColor);
        }
      }
    }
  }
}


function createNodeMaterials(model) {
  const nodeMaterials = {};
  const groups = getModelGroups(model);

  groups.forEach((group) => {
    const activeColors = appData.materialSettings.activeSettings[group.name] || [];
    const material = group.groupedNodes[0]?.settingsData?.difmaps[0];

    if (!material || !activeColors.length) return;

    group.nodes.forEach((nodeName, index) => {
      // Циклическое распределение цветов
      const colorIndex = index % activeColors.length;
      nodeMaterials[nodeName] = {
        color: activeColors[colorIndex],
        metalness: material.metalness,
        roughness: material.roughness,
        texture: material.textures?.[0]?.url || null
      };
    });
  });

  return nodeMaterials;
}

// Распределение по группам (N мешей одного цвета)
// function createNodeMaterials(model) {
//   const nodeMaterials = {};
//   const groups = getModelGroups(model);

//   groups.forEach((group) => {
//     const activeColors = appData.materialSettings.activeSettings[group.name] || [];
//     const material = group.groupedNodes[0]?.settingsData?.difmaps[0];

//     if (!material || !activeColors.length) return;

//     const meshesPerColor = Math.ceil(group.nodes.length / activeColors.length);
    
//     group.nodes.forEach((nodeName, index) => {
//       const colorIndex = Math.floor(index / meshesPerColor) % activeColors.length;
//       nodeMaterials[nodeName] = {
//         color: activeColors[colorIndex],
//         metalness: material.metalness,
//         roughness: material.roughness,
//         texture: material.textures?.[0]?.url || null
//       };
//     });
//   });

//   return nodeMaterials;
// }


function createColorButton(color, material, onClick) {
  const colorEl = document.createElement("button");
  colorEl.classList.add("color-sample");

  const activeSettings = getMaterialForGroup();
  const activeColors = activeSettings[material.name] || [];
  const isActive = activeColors.includes(color);

  if (isActive) {
    colorEl.classList.add("color-sample-active");
  }

  colorEl.style.backgroundColor = color;
  colorEl.title = `${material.name} - ${color}`;
  colorEl.addEventListener("click", () => onClick(material.name, color));

  return colorEl;
}

function createModelInfo(model) {
  const container = document.createElement("div");
  container.classList.add("model-info");

  const groups = getModelGroups(model);

  groups.forEach((group) => {
    const groupEl = document.createElement("div");
    groupEl.classList.add("group-info");

    const groupName = document.createElement("h3");
    groupName.textContent = group.name; // Берем имя группы из refGroups
    groupEl.appendChild(groupName);

    const colorsEl = document.createElement("div");
    colorsEl.classList.add("colors-container");

    const materials = group.groupedNodes[0]?.settingsData?.difmaps || [];

    // Собираем все цвета из всех материалов группы
    const allColors = materials.reduce((colors, material) => {
      colors.push(...material.colors);
      return colors;
    }, []);

    allColors.forEach((color) => {
      const colorBtn = createColorButton(
        color,
        { name: group.name }, 
        (materialName, selectedColor) => {
          setMaterialForGroup(materialName, selectedColor);
          updateModelWithMaterials(model);
        }
      );
      colorsEl.appendChild(colorBtn);
    });

    groupEl.appendChild(colorsEl);
    container.appendChild(groupEl);
  });

  return container;
}

function updateModelWithMaterials(model) {
  const modelWithMaterials = {
    ...model,
    nodeMaterials: createNodeMaterials(model),
  };

  if (model.modelType === "handles") {
    document.shopifyConnect.triggerHandleModelChange(modelWithMaterials);
    appData.currentModels.handle = modelWithMaterials;
  } else {
    document.shopifyConnect.triggerBladeModelChange(modelWithMaterials);
    appData.currentModels.blade = modelWithMaterials;
  }

  displayModelInfo(appData.currentModels.handle, appData.currentModels.blade);
}

function createModelSelector(models, modelType) {
  const container = document.createElement("div");
  container.classList.add("model-selector");

  const title = document.createElement("h2");
  title.textContent =
    modelType === "handles" ? "Handle Models" : "Blade Models";
  container.appendChild(title);

  models.forEach((model) => {
    const label = document.createElement("label");
    label.classList.add("model-radio");

    const radio = document.createElement("input");
    radio.type = "radio";
    radio.name = `${modelType}-model`;
    radio.value = model.fileName;

    // Проверяем активную модель используя appData
    const currentModel =
      modelType === "handles"
        ? appData.currentModels.handle
        : appData.currentModels.blade;

    radio.checked = currentModel?.fileName === model.fileName;

    radio.addEventListener("change", () => {
      if (radio.checked) {
        if (modelType === "handles") {
          const modelWithMaterials = {
            ...model,
            nodeMaterials: createNodeMaterials(model),
          };
          appData.currentModels.handle = modelWithMaterials;
          document.shopifyConnect.triggerHandleModelChange(modelWithMaterials);
        } else {
          const modelWithMaterials = {
            ...model,
            nodeMaterials: createNodeMaterials(model),
          };
          appData.currentModels.blade = modelWithMaterials;
          document.shopifyConnect.triggerBladeModelChange(modelWithMaterials);
        }

        displayModelInfo(
          appData.currentModels.handle,
          appData.currentModels.blade
        );
      }
    });

    const text = document.createElement("span");
    text.textContent = model.textFileName;

    label.appendChild(radio);
    label.appendChild(text);
    container.appendChild(label);
  });

  return container;
}

function displayModelInfo(handleModel, bladeModel) {
  const container = document.createElement("div");
  container.id = "models-display";

  if (appData.currentCollection) {
    const handleModels = getModelsByType(appData.currentCollection, "handles");
    const bladeModels = getModelsByType(appData.currentCollection, "blades");

    const handleSelector = createModelSelector(handleModels, "handles");
    const bladeSelector = createModelSelector(bladeModels, "blades");

    container.appendChild(handleSelector);
    container.appendChild(bladeSelector);
  }

  if (handleModel) {
    const handleInfo = createModelInfo(handleModel);
    container.appendChild(handleInfo);
  }

  if (bladeModel) {
    const bladeInfo = createModelInfo(bladeModel);
    container.appendChild(bladeInfo);
  }

  const existing = document.getElementById("models-display");
  if (existing) {
    existing.replaceWith(container);
  } else {
    document.body.appendChild(container);
  }
}

function selectModels(handleModel, bladeModel) {
  let handleWithMaterials, bladeWithMaterials;

  if (handleModel) {
    handleWithMaterials = {
      ...handleModel,
      nodeMaterials: createNodeMaterials(handleModel),
    };
    appData.currentModels.handle = handleWithMaterials;
    document.shopifyConnect.triggerHandleModelChange(handleWithMaterials);
  }
  if (bladeModel) {
    bladeWithMaterials = {
      ...bladeModel,
      nodeMaterials: createNodeMaterials(bladeModel),
    };
    appData.currentModels.blade = bladeWithMaterials;
    document.shopifyConnect.triggerBladeModelChange(bladeWithMaterials);
  }

  displayModelInfo(
    handleWithMaterials || appData.currentModels.handle,
    bladeWithMaterials || appData.currentModels.blade
  );
}

async function initializeApp() {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);

  const data = await fetchCollectionsData();
  if (!data) return;

  appData.currentCollection = findCollectionById(TARGET_COLLECTION_ID);

  if (appData.currentCollection) {
    const initialHandle = getModelsByType(
      appData.currentCollection,
      "handles"
    )[0];
    const initialBlade = getModelsByType(
      appData.currentCollection,
      "blades"
    )[0];

    appData.materialSettings.activeSettings = {};

    getModelGroups(initialHandle).forEach((group) => {
      const firstMaterial = group.groupedNodes[0]?.settingsData?.difmaps[0];
      if (firstMaterial && firstMaterial.colors.length > 0) {
        setMaterialForGroup(group.name, firstMaterial.colors[0]);
      }
    });

    selectModels(initialHandle, initialBlade);

    if (appData.globalOptions) {
      document.shopifyConnect.triggerGlobalOptionsChange(appData.globalOptions);
    }
  }
}

document.addEventListener("DOMContentLoaded", initializeApp);

const styles = `
   .model-selector {
        margin-bottom: 20px;
        padding: 15px;
        background: white;
        border-radius: 4px;
    }
    .model-radio {
        display: block;
        margin: 10px 0;
        cursor: pointer;
    }
    .model-radio input {
        margin-right: 10px;
    }
    .model-radio span {
        vertical-align: middle;
    }
    .model-info {
        padding: 15px;
        background: white;
        margin-bottom: 20px;
    }
    .group-info {
        margin: 15px 0;
    }
    .colors-container {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        margin-top: 10px;
    }
    .color-sample {
        width: 32px;
        height: 32px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        transition: transform 0.2s;
    }
    .color-sample:hover {
        transform: scale(1.1);
    }
    h2 {
        font-size: 18px;
        margin-bottom: 15px;
    }
    h3 {
        font-size: 16px;
        color: #444;
    }
         .material-section {
        margin: 10px 0;
    }
    .color-sample-active {
        border: 2px solid #000;
        transform: scale(1.1);
    }
    .material-section h4 {
        font-size: 14px;
        margin: 5px 0;
        color: #666;
    }
`;

//***************************камера */

function setCameraPosition(position) {
  if (document.shopifyConnect) {
      document.shopifyConnect.triggerCameraPositionChange(position);
  }
}


//-----------------
// Храним индекс текущего материала
let currentMaterialIndex = 0;

// Функция для установки материала лезвия
function setBladeMaterial() {
  console.log('setBladeMaterial - начало выполнения');
  
  const bladeModel = appData.currentCollection.items.find(
    item => item.modelType === 'blades' && item.textFileName === 'Convex'
  );

  if (!bladeModel) {
    console.log('Модель лезвия не найдена');
    return null;
  }

  const bladeGroup = bladeModel.refGroups.find(group => group.name === 'Blade');
  
  if (bladeGroup) {
    const carbonMaterial = bladeGroup.groupedNodes.find(node => node.name === 'Carbon');
    
    if (carbonMaterial && carbonMaterial.settingsData.difmaps) {
      // Получаем все доступные материалы
      const materials = carbonMaterial.settingsData.difmaps;
      
      // Получаем текущий материал по индексу
      const currentMaterial = materials[currentMaterialIndex];
      console.log('Применяем материал:', currentMaterial.name);

      // Создаем объект для материалов
      const nodeMaterials = {};

      // Применяем материал ко всем нодам в группе
      bladeGroup.nodes.forEach(nodeName => {
        nodeMaterials[nodeName] = {
          color: currentMaterial.colors[0],
          metalness: currentMaterial.metalness,
          roughness: currentMaterial.roughness,
          texture: currentMaterial.textures[0]?.url || null
        };
      });

      // Создаем обновленную модель
      const modelWithMaterials = {
        ...bladeModel,
        nodeMaterials
      };

      // Обновляем текущую модель лезвия
      appData.currentModels.blade = modelWithMaterials;

      // Отправляем обновление через ShopifyConnect
      document.shopifyConnect.triggerBladeModelChange(modelWithMaterials);

      // Увеличиваем индекс для следующего материала
      currentMaterialIndex = (currentMaterialIndex + 1) % materials.length;
      
      console.log('Модель успешно обновлена, следующий индекс:', currentMaterialIndex);
      return modelWithMaterials;
    }
  }

  console.log('Не удалось создать материалы');
  return null;
}

// Функция для циклической смены материалов
function cycleMaterials(interval = 3000) {
  setInterval(() => {
    console.log('Меняем материал...');
    const updatedModel = setBladeMaterial();
    
    if (updatedModel) {
      console.log('Материал успешно обновлен:', updatedModel.nodeMaterials);
    } else {
      console.log('Не удалось обновить материал');
    }
  }, interval);
}

// Функция для ожидания инициализации данных
function waitForData(callback, maxAttempts = 10) {
  let attempts = 0;

  function checkData() {
    console.log('Проверка данных, попытка:', attempts + 1);
    
    if (appData.collections && appData.currentCollection) {
      console.log('Данные готовы, вызываем callback');
      callback();
    } else if (attempts < maxAttempts) {
      attempts++;
      setTimeout(checkData, 500);
    } else {
      console.log('Превышено максимальное количество попыток');
    }
  }

  checkData();
}

// Инициализация с циклической сменой материалов
function initializeBladeMaterialCycler() {
  console.log('Запуск initializeBladeMaterialCycler');
  
  waitForData(() => {
    console.log('Данные инициализированы, запускаем циклическую смену материалов');
    cycleMaterials(3000); // Меняем каждые 3 секунды
  });
}

// Запускаем после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM загружен, запускаем инициализацию...');
  initializeBladeMaterialCycler();
});
/*
{
  ...bladeModel,  // все существующие свойства модели
  nodeMaterials: {
    "CHEF_convex_2": {
      color: "#9c9c9c",
      metalness: 0.2,
      roughness: 0.4,
      texture: "https://cdn.shopify.com/s/files/1/0739/0206/3938/t/4/assets/A_textures_null_Carbon_satin_forced.jpg"
    }
  }
}
  */