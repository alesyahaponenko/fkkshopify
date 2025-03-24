  
  // Constants for configuration
  const TARGET_COLLECTION_ID = "cm3n7xcpo0000ljvbff65bjuu"; // ID of the target collection for models
  const DEFAULT_COLOR = '#808080'; // Default color for materials
  const DEFAULT_METALNESS = 0.5; // Default metalness value for materials
  const DEFAULT_ROUGHNESS = 0.5; // Default roughness value for materials
  const CAMERA = 1; // Camera view from json № element
  const LOCAL_STORAGE_KEY = 'materialSelectionsState';  
  
  const steelTypes = [];
  const steelArr = [];
  const sortedSteel = {};
  const finishSet = [];
    // Global storage for material selections
  const materialSelections = {
    handles: {},
    blades: {},
    activeColors: {} // для хранения активных цветов
  };
    

  // Функция для загрузки состояния из localStorage
function loadMaterialSelectionsState() {
  const savedState = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (savedState) {
    try {
      const parsedState = JSON.parse(savedState);
      Object.assign(materialSelections, parsedState);
    } catch (e) {
      console.error('Error loading state from localStorage:', e);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  }
}

// Функция для сохранения состояния в localStorage
function saveMaterialSelectionsState() {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(materialSelections));
  } catch (e) {
    console.error('Error saving state to localStorage:', e);
  }
}

// Функция для очистки состояния
function resetMaterialSelections() {
  materialSelections.handles = {};
  materialSelections.blades = {};
  materialSelections.activeColors = {};
  localStorage.removeItem(LOCAL_STORAGE_KEY);
  
  // Находим все radio кнопки и выбираем первые в каждой группе
  const handleRadios = document.querySelectorAll('input[name="model-handles"]');
  const bladeRadios = document.querySelectorAll('input[name="model-blades"]');
  const steelRadios = document.querySelectorAll('input[name="model-steel"]');
  
  if (handleRadios[0]) handleRadios[0].checked = true;
  if (bladeRadios[0]) bladeRadios[0].checked = true;
  if (steelRadios[0]) steelRadios[0].checked = true;
  
  // Вызываем событие change на первых radio кнопках
  if (handleRadios[0]) handleRadios[0].dispatchEvent(new Event('change'));
  if (bladeRadios[0]) bladeRadios[0].dispatchEvent(new Event('change'));
  if (steelRadios[0]) steelRadios[0].dispatchEvent(new Event('change'));
}

  function arraysEqual(arr1, arr2) {
    if (!Array.isArray(arr1) || !Array.isArray(arr2)) return false;
    if (arr1.length !== arr2.length) return false;
    return arr1.every((item, index) => item === arr2[index]);
  }
  // Function to update global material selections
  function updateMaterialSelections(modelType, selections, activeColorButtons = null) {
    materialSelections[modelType] = {
      ...materialSelections[modelType],
      ...selections
    };
    
    if (activeColorButtons) {
      const groupId = Object.keys(activeColorButtons)[0];
      if (!materialSelections.activeColors[modelType]) {
        materialSelections.activeColors[modelType] = {};
      }
      materialSelections.activeColors[modelType][groupId] = activeColorButtons[groupId];
    }
    
    // Сохраняем обновленное состояние в localStorage
    saveMaterialSelectionsState();
    
    return materialSelections;
  }

  function addResetButton() {
    const resetButton = document.createElement('button');
    resetButton.className = 'reset-selections-btn';
    resetButton.textContent = 'Reset All Colors';
    resetButton.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      padding: 10px 20px;
      background-color: #ff4444;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      z-index: 1000;
    `;
    
    resetButton.addEventListener('click', () => {
      if (confirm('Are you sure you want to reset all color selections?')) {
        resetMaterialSelections();
      }
    });
    
    document.body.appendChild(resetButton);
  }
  // This code creates an instance of the ModelSettingsUI class. This class is responsible for initializing and managing the user interface for configuring models (handles, blades, etc.)."
  class ModelSettingsUI {
    constructor(container, data, modelType) {
      console.log('ModelSettingsUI constructor called');
      this.data = data;
      this.container = container;
      this.type = modelType;
      this.activeModel = null;
      this.activeGroups = new Map();
      this.isCameraInitialized = false;
  
      // Привязываем методы
      this.init = this.init.bind(this);
      this.selectModel = this.selectModel.bind(this);
      this.updateMaterialTexture = this.updateMaterialTexture.bind(this);
      this.updateSettings = this.updateSettings.bind(this);
  
      this.container.addEventListener('reinitialize', () => {
        this.init();
      });
      this.init();
    }
  
    init() {
      console.log('ModelSettingsUI init called');
      console.log('ShopifyConnect instance:', window.shopifyConnectInstance);
      console.log('window.shopifyConnect:', window.shopifyConnect);
      console.log('document.shopifyConnect:', document.shopifyConnect);
      loadMaterialSelectionsState();
      // Checks if the container element exists
      if (!this.container) {
        console.error('Container element not found'); // Logs an error message if the container is missing
        return; // Exits the function since we can't proceed without a container
      }
  
      // Рендеринг селектору для вибору моделі
      this.renderModelSelector();
  
      // Checks if there are any models available in the data
      if (this.data.items.length > 0) {
        // If there are models:
  
        // Access the first model from the data
        const firstModel = this.data.items[0];
  
        // Create an empty object to store material properties for each node
        const nodeMaterials = {};
  
        // Initialize material properties for individual nodes (without group settings)
        firstModel.nodes.forEach(nodeName => {
          nodeMaterials[nodeName] = {
            color: DEFAULT_COLOR,
            metalness: DEFAULT_METALNESS,
            roughness: DEFAULT_ROUGHNESS
          };
        });
  
        // Loop through each group of nodes within the first model
        firstModel.refGroups.forEach(group => {
          // Find corresponding groupedNodes entry that matches the group ID
          const groupSettings = group.groupedNodes && group.groupedNodes[0];
  
          // Loop through each node name in the current group
          if (groupSettings && groupSettings.settingsData) {
            const { settingsData } = groupSettings;
  
            group.nodes.forEach(nodeName => {
              nodeMaterials[nodeName] = {
                color: settingsData.colors?.[0] || DEFAULT_COLOR,
                metalness: settingsData.metalness || DEFAULT_METALNESS,
                roughness: settingsData.roughness || DEFAULT_ROUGHNESS,
                texture: settingsData.difmaps?.[0]?.textures?.[0] || null
              };
            });
          }
        });
  
        // Check if Shopify Connect integration exists
        if (document.shopifyConnect) {
          // If Shopify Connect is available:
  
          // Trigger the appropriate method based on the model type ('handles' or 'blades')
          if (this.type === 'handles') {
            document.shopifyConnect.triggerModelChange({
              fileName: firstModel.fileName,
              fileUrl: firstModel.fileUrl,
              modelType: firstModel.modelType,
              nodeMaterials: nodeMaterials
            });
          } else if (this.type === 'blades') {
            document.shopifyConnect.triggerBladeModelChange({
              fileName: firstModel.fileName,
              fileUrl: firstModel.fileUrl,
              modelType: firstModel.modelType,
              nodeMaterials: nodeMaterials
            });
          }
        }
  
        // Select the first model in the user interface (assuming a method exists)
        this.selectModel(firstModel.fileName);
        this.initializeCamera();
      }
    }
  
    initializeCamera(force = false) {
      if (this.cameraInitTimeout) {
        clearTimeout(this.cameraInitTimeout);
      }
  
      if (this.isCameraInitialized && !force) {
        console.log('Camera already initialized, skipping...');
        return;
      }
  
      this.cameraInitTimeout = setTimeout(() => {
        if (document.shopifyConnect) {
          console.log('Initializing camera to position:', CAMERA);
          document.shopifyConnect.triggerCameraPositionChange(CAMERA);
          this.isCameraInitialized = true;
        }
      }, 300);
    }
  
    resetCamera() {
      if (document.shopifyConnect) {
        document.shopifyConnect.triggerCameraPositionChange(1);
        this.isCameraInitialized = false;
      }
    }
  
    renderModelSelector() {
      // Creates a container element for the model selector
      const modelSelector = document.createElement('div');
      modelSelector.className = 'model-selector'; // Assigns a CSS class for styling
  
      // Sets the title of the selector based on the model type
      modelSelector.innerHTML = `<h3>${this.type === 'handles' ? 'Logic' : 'Choose one'
        }</h3>`;
  
      // Creates a container element for the geometry/handle options
      const stepItems = document.createElement('div');
      stepItems.className = 'items'; // Assigns a CSS class for styling
  
  
  
      // Creates a container element for the steel selector
      const steelSelector = document.createElement('div');
      steelSelector.className = 'model-selector'; // Assigns a CSS class for styling
  
      // Sets the title of the selector based on the model type
      steelSelector.innerHTML = `<h3>Choose one</h3>`;
  
      // Creates a container element for the steel options
      const steelItems = document.createElement('div');
      steelItems.className = 'steel-items'; // Assigns a CSS class for styling
  
      if (this.type === 'blades') {
  
        this.data.items.forEach((item, index) => {
  
          item.refGroups[0].groupedNodes.forEach(node_item => {
            let finishList = [];
            node_item.settingsData.difmaps.forEach(finish => {
              finishList.push(finish);
            });
  
            const existingObject = finishSet.find(existing => existing.steel === node_item.name);
  
            // Check if an object with the same "steel" value already exists
            if (!existingObject) {
              const finishObject = {
                steel: node_item.name,
                finishes: finishList
              };
              finishSet.push(finishObject);
            }
  
            let steelObject = {
              geometry: item.textFileName,
              steel: node_item.name
            }
            steelArr.push(steelObject);
          });
        });
  
        steelArr.forEach(item => {
          if (!steelTypes.includes(item.steel)) {
            steelTypes.push(item.steel);
          }
  
          if (!sortedSteel[item.steel]) {
            sortedSteel[item.steel] = [];
          }
          sortedSteel[item.steel].push(item.geometry);
        });
  
        steelTypes.forEach((item, index) => {
          const steelName = item.split(' ').join('-').toLowerCase();
  
          const steelItem = document.createElement('div');
          steelItem.className = 'steel-item';
  
          const steelLabel = document.createElement('label');
          steelLabel.style.display = 'block';
          steelLabel.style.marginBottom = '10px';
  
          const steelRadio = document.createElement('input');
          steelRadio.type = 'radio'; // Sets the input type to radio
          steelRadio.name = `model-steel`; // Sets the name attribute for grouping
          steelRadio.value = item; // Sets the value to the model's file name
          steelRadio.checked = index === 0; // Checks the first radio button by default
  
          // Assigns an event listener to handle steel selection on radio change
          //radio.onchange = () => this.selectModel(item.fileName);
          steelRadio.onchange = () => {
            const steelName = item.split(' ').join('-').toLowerCase();
            const selectedFinishes = finishSet.find(finish => finish.steel === item);
  
            const selectedGeometry = sortedSteel[item];
            const geometryElements = document.querySelectorAll('#bladeGeometry .step-item');
  
            if (geometryElements.length > 0) {
              geometryElements.forEach(item => item.style.display = 'none');
            }
            selectedGeometry.forEach(item => {
              document.querySelectorAll('.step-item input[value="'+item+'"]').forEach(input => input.closest('.step-item').style.display = 'block');
            })
            
            // Обновляем контент шага 3
            const step3Content = document.getElementById('bladeFinish');
            if (step3Content && selectedFinishes) {
              step3Content.innerHTML = '';
              
              const finishSelector = document.createElement('div');
              finishSelector.className = 'model-selector';
              finishSelector.innerHTML = `<h3>Select ${item} Finish</h3>`;
              
              const finishItems = document.createElement('div');
              finishItems.className = 'finish-items';
              
              selectedFinishes.finishes.forEach((finish, index) => {
                const finishItem = document.createElement('div');
                finishItem.className = 'finish-item';
                
                const finishLabel = document.createElement('label');
                finishLabel.style.display = 'block';
                finishLabel.style.marginBottom = '10px';
                
                const finishRadio = document.createElement('input');
                finishRadio.type = 'radio';
                finishRadio.name = 'model-finish';
                finishRadio.value = finish.name;
                finishRadio.checked = index === 0;
                
                finishRadio.onchange = () => {
                  if (finishRadio.checked) {
                    this.updateMaterialTexture(finish);
                  }
                };
                
                let finishPreview = '';
                if (finish.textures?.[0]?.url) {
                  finishPreview = `<div class="finish-preview">
                    <img src="${finish.textures[0].url}" alt="${finish.name}" style="width: 50px; height: 50px; object-fit: cover;">
                  </div>`;
                }
                
                finishLabel.appendChild(finishRadio);
                finishLabel.appendChild(document.createTextNode(` ${finish.name}`));
                if (finishPreview) {
                  finishLabel.insertAdjacentHTML('beforeend', finishPreview);
                }
                
                finishItem.appendChild(finishLabel);
                finishItems.appendChild(finishItem);
              });
              
              finishSelector.appendChild(finishItems);
              step3Content.appendChild(finishSelector);
              
              if (selectedFinishes.finishes[0]) {
                this.updateMaterialTexture(selectedFinishes.finishes[0]);
              }
            }
          };
  
          if(index === 0) {
            steelRadio.dispatchEvent(new Event('change'));
          }
  
          steelLabel.appendChild(steelRadio);
          steelLabel.appendChild(document.createTextNode(` ${item}`));
  
          steelItem.appendChild(steelLabel);
          steelItems.appendChild(steelItem);
        });
  
        let finishList = '';
  
        finishSet.forEach((finish, index) => {
          finish.finishes.forEach((finishItem, index) => {
            finishList += '<li data-steel="' + finish.steel.split(' ').join('-').toLowerCase() + '">' + finishItem.name + '</li>';
          });
        });
      }
  
      steelSelector.appendChild(steelItems);
  
      // Iterates over each model in the data
      this.data.items.forEach((item, index) => {
        // Creates an element for each model option
        const stepItem = document.createElement('div');
        stepItem.className = 'step-item'; // Assigns a CSS class for styling
  
        // Creates a label element for the model name
        const label = document.createElement('label');
        label.style.display = 'block'; // Sets the label display to block
        label.style.marginBottom = '10px'; // Adds margin for readability
  
        // Creates a radio button for selecting the model
        const radio = document.createElement('input');
        radio.type = 'radio'; // Sets the input type to radio
        radio.name = `model-${this.type}`; // Sets the name attribute for grouping
        radio.value = item.textFileName; // Sets the value to the model's file name
        radio.checked = index === 0; // Checks the first radio button by default
  
        // Assigns an event listener to handle model selection on radio change
        radio.onchange = () => {
          const currentFileName = this.activeModel?.fileName;
          const newFileName = item.fileName;
          
          // Если модель уже активна, не делаем ничего
          if (currentFileName === newFileName) return;
          
          // Сохраняем текущие активные цвета перед сменой модели
          const currentActiveColors = materialSelections.activeColors[this.type] 
            ? { ...materialSelections.activeColors[this.type] }
            : {};
        
          this.selectModel(newFileName);
        
          // После рендеринга новой модели восстанавливаем активные цвета
          requestAnimationFrame(() => {
            if (Object.keys(currentActiveColors).length > 0) {
              Object.entries(currentActiveColors).forEach(([groupId, colors]) => {
                const colorOptions = document.querySelector(`[data-group-id="${groupId}"] .color-options`);
                if (colorOptions) {
                  const buttons = colorOptions.querySelectorAll('.color-button');
                  const availableColors = Array.from(buttons).map(btn => btn.style.backgroundColor);
                  
                  // Активируем только те цвета, которые доступны в новой модели
                  buttons.forEach(button => {
                    const buttonColor = button.style.backgroundColor;
                    if (colors.includes(buttonColor)) {
                      button.classList.add('active');
                    }
                  });
        
                  // Обновляем настройки с восстановленными цветами
                  const activeButtons = Array.from(colorOptions.querySelectorAll('.color-button.active'))
                    .map(button => button.style.backgroundColor);
        
                  if (activeButtons.length > 0) {
                    updateMaterialSelections(this.type, {}, {
                      [groupId]: activeButtons
                    });
                    this.updateSettings(groupId, 'colors', activeButtons);
                  }
                }
              });
            }
          });
        };
        // Appends the radio button and model name to the label
        label.appendChild(radio);
        label.appendChild(document.createTextNode(` ${item.textFileName}`));
  
        // Adds the label to the model option element
        stepItem.appendChild(label);
  
        // Adds the model option element to the container
        stepItems.appendChild(stepItem);
      });
  
      // Adds the container for model options to the selector
      modelSelector.appendChild(stepItems);
  
      // Appends the model selector to the appropriate container based on type
      if (this.type === 'blades') {
  
        document.getElementById('bladeGeometry').appendChild(modelSelector);
        document.getElementById('bladeSteel').appendChild(steelSelector);
  
        let firstSteel = document.querySelector('#bladeSteel .steel-item:nth-child(1) input').value;
  
        const selectedGeometry = sortedSteel[firstSteel];
        const geometryElements = document.querySelectorAll('#bladeGeometry .step-item');
  
        if (geometryElements.length > 0) {
          geometryElements.forEach(item => item.style.display = 'none');
        }
        selectedGeometry.forEach(item => {
          document.querySelectorAll('.step-item input[value="'+item+'"]').forEach(input => input.closest('.step-item').style.display = 'block');
        })
      } else {
        document.getElementById('handleDesign').appendChild(modelSelector);
      }
    }
  
    updateMaterialTexture(difmap) {
      if (!this.activeModel || !difmap) return;
  
      const currentNodeMaterials = { ...this.activeModel.nodeMaterials };
  
      // Обновляем материалы для всех нод в активной группе
      this.activeModel.refGroups.forEach(group => {
        const groupSettings = group.groupedNodes && group.groupedNodes[0];
  
        if (groupSettings && groupSettings.settingsData) {
          // Создаем новый объект текстуры
          const texture = difmap.textures?.[0] ? {
            url: difmap.textures[0].url,
            name: difmap.name
          } : null;
  
          // Обновляем материалы для каждой ноды в группе
          group.nodes.forEach(nodeName => {
            currentNodeMaterials[nodeName] = {
              ...currentNodeMaterials[nodeName],
              metalness: difmap.metalness || currentNodeMaterials[nodeName].metalness,
              roughness: difmap.roughness || currentNodeMaterials[nodeName].roughness,
              texture: texture
            };
          });
        }
      });
  
      // Обновляем материалы в активной модели
      this.activeModel.nodeMaterials = currentNodeMaterials;
  
      // Отправляем обновленные материалы через ShopifyConnect
      if (document.shopifyConnect) {
        if (this.type === 'handles') {
          document.shopifyConnect.triggerModelChange({
            fileName: this.activeModel.fileName,
            fileUrl: this.activeModel.fileUrl,
            modelType: this.activeModel.modelType,
            nodeMaterials: currentNodeMaterials
          });
        } else if (this.type === 'blades') {
          document.shopifyConnect.triggerBladeModelChange({
            fileName: this.activeModel.fileName,
            fileUrl: this.activeModel.fileUrl,
            modelType: this.activeModel.modelType,
            nodeMaterials: currentNodeMaterials
          });
        }
      }
    }
  
    selectModel(fileName) {
      console.log('selectModel called with:', fileName);
      // Find the model with the specified file name
      this.activeModel = this.data.items.find(item => item.fileName === fileName);
      this.activeGroups.clear();
    
      if (this.activeModel) {
        // Create an object to store material properties
        const nodeMaterials = {};
    
        // Check if we have saved materials for this model
        const savedMaterials = materialSelections[this.type]?.[fileName];
    
        // Set material properties for nodes
        this.activeModel.nodes.forEach(nodeName => {
          nodeMaterials[nodeName] = savedMaterials?.[nodeName] || {
            color: DEFAULT_COLOR,
            metalness: DEFAULT_METALNESS,
            roughness: DEFAULT_ROUGHNESS,
            texture: null
          };
        });
    
        // Process groups and their materials
        this.activeModel.refGroups.forEach(group => {
          const groupSettings = group.groupedNodes && group.groupedNodes[0];
          
          if (groupSettings && groupSettings.settingsData) {
            const { settingsData } = groupSettings;
            const difmap = settingsData.difmaps?.[0];
            
            // Get saved active colors for this group
            const savedActiveColors = materialSelections.activeColors[this.type]?.[group.id] || [];
            
            // If we have saved colors, use them. Otherwise, use the first color as default
            const colorsToUse = savedActiveColors.length > 0 ? 
              savedActiveColors : 
              [difmap?.colors?.[0] || DEFAULT_COLOR];
    
            const texture = difmap?.textures?.[0] ? {
              url: difmap.textures[0].url,
              name: difmap.name
            } : null;
    
            group.nodes.forEach((nodeName, index) => {
              nodeMaterials[nodeName] = savedMaterials?.[nodeName] || {
                color: colorsToUse[index % colorsToUse.length],
                metalness: difmap?.metalness || DEFAULT_METALNESS,
                roughness: difmap?.roughness || DEFAULT_ROUGHNESS,
                texture: texture
              };
            });
          }
        });
    
        // Store materials in the active model
        this.activeModel.nodeMaterials = nodeMaterials;
    
        // Update global material selections
        updateMaterialSelections(this.type, {
          [fileName]: nodeMaterials
        });
    
        // Update ShopifyConnect if available
        if (document.shopifyConnect) {
          const updateMethod = this.type === 'handles' ? 
            document.shopifyConnect.triggerModelChange :
            document.shopifyConnect.triggerBladeModelChange;
    
          updateMethod({
            fileName: this.activeModel.fileName,
            fileUrl: this.activeModel.fileUrl,
            modelType: this.activeModel.modelType,
            nodeMaterials: nodeMaterials
          });
        }
    
        // Render group tabs
        this.renderGroupTabs();
    
        // Restore active color states after rendering
        requestAnimationFrame(() => {
          const savedColors = materialSelections.activeColors[this.type];
          if (savedColors) {
            Object.entries(savedColors).forEach(([groupId, colors]) => {
              const colorOptions = document.querySelector(`[data-group-id="${groupId}"] .color-options`);
              if (colorOptions) {
                const buttons = colorOptions.querySelectorAll('.color-button');
                buttons.forEach(button => {
                  if (colors.includes(button.style.backgroundColor)) {
                    button.classList.add('active');
                  }
                });
              }
            });
          }
        });
      }
    }
  
    renderGroupTabs() {
      // Creates a container element to hold group tabs/sections
      const groupsContainer = document.createElement('div');
      groupsContainer.className = 'groups-container';
  
      // Loops through each group of nodes in the active model
      this.activeModel.refGroups.forEach((group, index) => {
  
        // Create a group section element
        const groupSection = document.createElement('div');
        groupSection.className = 'group-section';
        groupSection.dataset.title = group.name;
  
        // Create a group header element (likely a heading for the group)
        const groupHeader = document.createElement('h3');
        groupHeader.className = 'group-header';
        groupHeader.textContent = group.name; // Set the header text to the group name
        groupSection.appendChild(groupHeader); // Add the header to the group section
  
        // Create a group content element (likely where group-specific settings will be displayed)
        const groupContent = document.createElement('div');
        groupContent.className = 'group-content';
        this.renderGroupContent(group, groupContent); // Render the content specific to this group
        groupSection.appendChild(groupContent); // Add the content to the group section
  
        // Add the group section to the container
        groupsContainer.appendChild(groupSection);
  
        // Initialize settings for the first group only
        if (index === 0) {
          this.initializeGroupSettings(group);
        }
      });
  
      // Remove any existing group container element from the main container
      const existingGroups = this.container.querySelector('.groups-container');
      if (existingGroups) {
        existingGroups.remove();
      }
  
      if (this.type === 'blades') {
  
      } else if (this.type === 'handles') {
        const existingGroupsContainerDesign = document.getElementById('handleDesign').querySelector('.groups-container');
        if (existingGroupsContainerDesign) {
          existingGroupsContainerDesign.remove();
        }
        document.getElementById('handleDesign').appendChild(groupsContainer);
      }
    }
  
    initializeGroupSettings(group) {
      if (!this.activeGroups.has(group.id)) {
        const groupSettings = group.groupedNodes && group.groupedNodes[0];
        const settings = groupSettings?.settingsData || {};
  
        const initialSettings = {};
  
        if (settings.colors && settings.colors.length > 0) {
          if (settings.multiSelect) {
            initialSettings.colors = [settings.colors[0]];
          } else {
            initialSettings.color = settings.colors[0];
          }
        }
  
        if (settings.difmaps && settings.difmaps.length > 0 &&
          settings.difmaps[0].textures &&
          settings.difmaps[0].textures.length > 0) {
          initialSettings.texture = settings.difmaps[0].textures[0].url;
        }
  
        initialSettings.metalness = settings.metalness || DEFAULT_METALNESS;
        initialSettings.roughness = settings.roughness || DEFAULT_ROUGHNESS;
  
        this.activeGroups.set(group.id, initialSettings);
      }
    }
  
    renderGroupContent(group, container) {
      const groupSettings = group.groupedNodes && group.groupedNodes[0];
      const settings = groupSettings?.settingsData;
      const elementColors = [];
    
      if (settings) {
        settings.difmaps.forEach(material => {
          material.colors.forEach(color => {
            if (!elementColors.includes(color)) {
              elementColors.push(color);
            }
          });
        });
    
        if (elementColors && elementColors.length > 0) {
          const colorsDiv = document.createElement('div');
          colorsDiv.className = 'settings-section';
    
          const colorOptions = document.createElement('div');
          colorOptions.className = 'color-options';
          colorOptions.dataset.groupId = group.id;
    
          // Получаем сохраненные активные цвета для этой группы
          const savedActiveColors = materialSelections.activeColors[this.type]?.[group.id] || [];
    
          elementColors.forEach((color, index) => {
            const colorButton = document.createElement('button');
            colorButton.className = 'color-button';
            colorButton.style.backgroundColor = color;
    
            // Устанавливаем активное состояние на основе сохраненных цветов
            if (savedActiveColors.length > 0 && savedActiveColors.includes(color)) {
              colorButton.classList.add('active');
            } else if (savedActiveColors.length === 0 && index === 0) {
              colorButton.classList.add('active');
            }
    
            // Остальной код обработчика клика остается без изменений...
            colorButton.onclick = (e) => {
              const closestGroupSection = colorButton.closest('.group-section');
              const dataTitle = closestGroupSection.getAttribute('data-title');
    
              if (dataTitle === 'Bolster' || dataTitle === 'Pommel') {
                const buttonGroup = colorButton.parentNode;
                Array.from(buttonGroup.children).forEach(child => {
                  child.classList.remove('active');
                });
                colorButton.classList.add('active');
              } else {
                colorButton.classList.toggle('active');
              }
    
              const activeButtons = Array.from(colorOptions.querySelectorAll('.color-button.active'))
                .map(button => button.style.backgroundColor);
    
              updateMaterialSelections(this.type, {}, {
                [group.id]: activeButtons
              });
    
              this.updateSettings(group.id, 'colors', activeButtons);
            };
    
            colorOptions.appendChild(colorButton);
          });
    
          colorsDiv.appendChild(colorOptions);
          container.appendChild(colorsDiv);
    
          // Инициализируем настройки с текущими выбранными цветами
          const currentColors = this.getSelectedColors(colorOptions);
          if (currentColors.length > 0) {
            this.updateSettings(group.id, 'colors', currentColors);
          }
        }
    
        // Create and add hidden settings
        const hiddenSettings = document.createElement('div');
        hiddenSettings.className = 'hidden-settings settings-section';
    
        if (settings.difmaps && settings.difmaps.length > 0) {
          const defaultTexture = settings.difmaps[0].textures[0];
          hiddenSettings.innerHTML = `
            <input type="hidden" name="texture_${group.id}" value="${defaultTexture.url}">
            <input type="hidden" name="textureName_${group.id}" value="${settings.difmaps[0].name}">
            <input type="hidden" name="metalness_${group.id}" value="${settings.metalness || 0}">
            <input type="hidden" name="roughness_${group.id}" value="${settings.roughness || 0}">
          `;
        } else {
          hiddenSettings.innerHTML = `
            <input type="hidden" name="metalness_${group.id}" value="${settings.metalness || 0}">
            <input type="hidden" name="roughness_${group.id}" value="${settings.roughness || 0}">
          `;
        }
    
        container.appendChild(hiddenSettings);
      }
    }
  
    getSelectedColors(colorOptionsContainer) {
      // 1. Find all active color buttons:
      const selectedColors = Array.from(colorOptionsContainer.querySelectorAll('.color-button.active'))
  
        // This line uses the `querySelectorAll` method to find all elements within the
        // `colorOptionsContainer` that match the selector `.color-button.active`.
        // The `.active` class likely indicates a selected color button.
        // The `Array.from` method converts the returned NodeList to a proper array
        // for easier manipulation.
  
        // 2. Extract color values from active buttons:
        .map(button => button.style.backgroundColor);        
      // This line iterates over the array of selected buttons using the `map` method.
      // For each button, it accesses its `style.backgroundColor` property and extracts
      // the color value (likely a hex code or rgba string). The result is a new array
      // containing the color values of all selected buttons.
  
      // 3. Handle the case of no selected colors:
      if (selectedColors.length === 0) {
        const firstButton = colorOptionsContainer.querySelector('.color-button');
        firstButton.classList.add('active');
        return [firstButton.style.backgroundColor];
      }
  
      // If no buttons are currently selected (all inactive), this block ensures at least
      // one color is returned. It finds the first `.color-button` element within the
      // container, activates it by adding the `active` class, and returns an array containing
      // only the color value of that first button.
  
      // 4. Return the selected colors:
      return selectedColors;
  
      // If there are already selected buttons (active), this line simply returns the
      // `selectedColors` array containing the color values of all selected buttons.
    }
    
  
    updateMultiColorSettings(groupId, colorOptionsContainer) {
      // 1. Find all checked checkboxes within the container
      const selectedColors = Array.from(colorOptionsContainer.querySelectorAll('input[type="checkbox"]:checked'))
        .map(input => input.value);
  
      // 2. Check if the group's settings are already being tracked
      if (!this.activeGroups.has(groupId)) {
        // If not, create a new entry for the group in the activeGroups Map
        this.activeGroups.set(groupId, {});
      }
  
      // 3. Get the current settings for the group
      const groupSettings = this.activeGroups.get(groupId);
  
      // 4. Update the 'colors' property of the group settings with the selected colors
      groupSettings.colors = selectedColors;
    }
  
    updateSettings(groupId, type, value) {
      if (!this.activeGroups.has(groupId)) {
        this.activeGroups.set(groupId, {});
      }
  
      const groupSettings = this.activeGroups.get(groupId);
      const group = this.activeModel.refGroups.find(g => g.id === groupId);
      const groupData = group?.groupedNodes?.[0];
  
      if (group && groupData?.settingsData) {
        if (this.rafId) {
          cancelAnimationFrame(this.rafId);
        }
  
        this.rafId = requestAnimationFrame(() => {
          const currentNodeMaterials = { ...this.activeModel.nodeMaterials };
          const selectedColors = type === 'colors' ? value : groupSettings.colors;
  
          const texture = groupData.settingsData.difmaps?.[0]?.textures?.[0] ? {
            url: groupData.settingsData.difmaps[0].textures[0].url,
            name: groupData.settingsData.difmaps[0].name
          } : null;
  
          group.nodes.forEach((nodeName, index) => {
            const difmap = groupData.settingsData?.difmaps?.[0];
            const newMaterial = {
              color: selectedColors[index % selectedColors.length],
              metalness: difmap.metalness || DEFAULT_METALNESS,
              roughness: difmap.roughness || DEFAULT_ROUGHNESS,
              texture: texture
            };
  
            const currentMaterial = currentNodeMaterials[nodeName];
            if (!currentMaterial ||
              currentMaterial.color !== newMaterial.color ||
              currentMaterial.metalness !== newMaterial.metalness ||
              currentMaterial.roughness !== newMaterial.roughness ||
              currentMaterial.texture?.url !== newMaterial.texture?.url) {
              currentNodeMaterials[nodeName] = newMaterial;
            }
          });
  
          // Update active model materials
          this.activeModel.nodeMaterials = currentNodeMaterials;
  
          // Update global material selections
          updateMaterialSelections(this.type, {
            [this.activeModel.fileName]: currentNodeMaterials
          });
  
          if (document.shopifyConnect) {
            const updateMethod = this.type === 'handles' ? 
              document.shopifyConnect.triggerModelChange :
              document.shopifyConnect.triggerBladeModelChange;
  
            updateMethod({
              fileName: this.activeModel.fileName,
              fileUrl: this.activeModel.fileUrl,
              modelType: this.activeModel.modelType,
              nodeMaterials: currentNodeMaterials
            });
          }
        });
      }
    }
  
    getAllSettings() {
      const settings = {
        modelFile: this.activeModel?.fileName,
        modelType: this.activeModel?.modelType,
        groups: {}
      };
  
      this.activeGroups.forEach((groupSettings, groupId) => {
        // Find group from refGroups instead of groupedNodes
        const group = this.activeModel.refGroups.find(g => g.id === groupId);
  
        if (group) {
          settings.groups[groupId] = {
            id: groupId,
            name: group.name,
            nodes: group.nodes,
            ...groupSettings
          };
        }
      });
  
      return settings;
    }
  
  }
  
  function initializeUI() {
    const startUI = () => {
      addResetButton();
    
      // Загружаем сохраненное состояние
      loadMaterialSelectionsState();
      console.log('initializeUI called');
      console.log('ShopifyConnect availability:', !!window.shopifyConnect);
      console.log('document.shopifyConnect availability:', !!document.shopifyConnect);

      const handleContainer = document.getElementById('handleContainer');
      const bladeContainer = document.getElementById('bladeContainer');

      if (!handleContainer || !bladeContainer || !bladeGeometry) {
        console.error('Container elements not found');
        return;
      }

    fetch('{{ "A_all-collections-data.json" | asset_url }}')
      .then(response => response.json())
      .then(data => {
        console.log('Data parsed:', !!data);
        if (data && data.collections) {
          const targetCollection = data.collections.find(c => c.id === TARGET_COLLECTION_ID);
  
          if (targetCollection && targetCollection.items) {
            const handlesModels = targetCollection.items.filter(item => item.modelType === 'handles');
            const bladesModels = targetCollection.items.filter(item => item.modelType === 'blades');
            const logosModels = targetCollection.items.filter(item => item.modelType === 'logos');
  
            if (handlesModels.length === 0) {
              throw new Error('No handles models found in collection');
            }
            if (bladesModels.length === 0) {
              throw new Error('No blades models found in collection');
            }
  
            const handlesCollection = {
              ...targetCollection,
              items: handlesModels
            };
            const bladesCollection = {
              ...targetCollection,
              items: bladesModels
            };
  
            const handleUI = new ModelSettingsUI(handleContainer, handlesCollection, 'handles');
            const bladeUI = new ModelSettingsUI(bladeContainer, bladesCollection, 'blades');
  
            const firstHandle = handlesModels[0];
            const firstBlade = bladesModels[0];
            const firstLogo = logosModels[0];
  
            // Modified this section to use refGroups instead of groupedNodes
            [firstHandle, firstBlade, firstLogo].forEach(model => {
              if (!model) return;
            
              const nodeMaterials = {};
            
              model.nodes.forEach(nodeName => {
                // Сначала ищем к какой группе принадлежит нода
                const group = model.refGroups.find(g => g.nodes.includes(nodeName));
                if (group && group.groupedNodes && group.groupedNodes[0]) {
                  // Берем первый difmap из настроек группы
                  const difmap = group.groupedNodes[0].settingsData?.difmaps?.[0]
                  
                  if (difmap) {
                    nodeMaterials[nodeName] = {
                      color: difmap.colors?.[0] || DEFAULT_COLOR,
                      metalness: difmap.metalness || DEFAULT_METALNESS,
                      roughness: difmap.roughness || DEFAULT_ROUGHNESS,
                      texture: difmap.textures?.[0] || null
                    };
                  } else {
                    // Если нет difmap, используем дефолтные значения
                    nodeMaterials[nodeName] = {
                      color: DEFAULT_COLOR,
                      metalness: DEFAULT_METALNESS,
                      roughness: DEFAULT_ROUGHNESS
                    };
                  }
                  
                } else {
                  // Если нода не принадлежит группе, используем дефолтные значения
                  nodeMaterials[nodeName] = {
                    color: DEFAULT_COLOR,
                    metalness: DEFAULT_METALNESS,
                    roughness: DEFAULT_ROUGHNESS
                  };
                }
              });
            
              model.nodeMaterials = nodeMaterials;
            });
  
            const displayCollection = {
              ...targetCollection,
              items: [
                firstHandle,
                firstBlade,
                ...(firstLogo ? [firstLogo] : [])
              ]
            };
  
            document.shopifyConnect.triggerCollectionChange(displayCollection);
            document.shopifyConnect.triggerGlobalOptionsChange(data.globalOptions);
  
            const allSteps = document.querySelectorAll(".bespoke-step");
            const stepCount = allSteps.length;
            allSteps[0].classList.add('active');
  
            const backButton = document.querySelector(".customizer-header .ch-back");
            const nextButton = document.querySelector(".customizer-footer .cf-next");
  
            nextButton.addEventListener("click", () => {
              const activeStep = document.querySelector(".bespoke-step.active");
              if (activeStep) {
                const activeStepIndex = Array.from(allSteps).indexOf(activeStep);
                allSteps[activeStepIndex].classList.remove('active');
                allSteps[activeStepIndex + 1].classList.add('active');
                document.querySelector('.customizer-header .ch-back .ch-step span').innerText = activeStepIndex + 2;
                if (activeStepIndex + 2 === 7) {
                  nextButton.style.display = 'none';
                }

                document.shopifyConnect.triggerCameraPositionChange(activeStepIndex + 2)
              }
            });
  
            backButton.addEventListener("click", () => {
              const activeStep = document.querySelector(".bespoke-step.active");
              if (activeStep) {
                const activeStepIndex = Array.from(allSteps).indexOf(activeStep);
                if (activeStepIndex > 0) {
                  allSteps[activeStepIndex].classList.remove('active');
                  allSteps[activeStepIndex - 1].classList.add('active');
                  document.querySelector('.customizer-header .ch-back .ch-step span').innerText = activeStepIndex;
                  nextButton.style.display = 'flex';

                  document.shopifyConnect.triggerCameraPositionChange(activeStepIndex - 1)
                }
              }
            });
  
          } else {
            throw new Error(`Collection with ID ${TARGET_COLLECTION_ID} not found`);
          }
        } else {
          throw new Error('No collections available');
        }
      })
      .catch(error => {
        console.error('Error loading model settings:', error);
        handleContainer.innerHTML = bladeContainer.innerHTML = `
          <div style="color: red; padding: 20px;">
            Error loading model settings: ${error.message}
          </div>
        `;
      });
    };

    if (window.shopifyConnect && document.shopifyConnect) {
      startUI();
    } else {
      document.addEventListener('shopifyConnectReady', startUI);
    }
  }
  

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeUI);
} else {
  initializeUI();
}