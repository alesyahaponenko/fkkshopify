<script>
  /* let fetchData;
  let initialize = 0;
  let bespokeUrl;
  let firstVariant;
  let newVariant;
  let productNewPrice;
  let target_collection_name = 'Chef';
  const TARGET_COLLECTION_ID = "cm3n7xcpo0000ljvbff65bjuu";
  const DEFAULT_COLOR = '#808080';
  const DEFAULT_METALNESS = 0.5;
  const DEFAULT_ROUGHNESS = 0.5;
  const CAMERA = 1;
  const LOCAL_STORAGE_KEY = 'materialSelectionsState';

  const steelTypes = [];
  const steelArr = [];
  const sortedSteel = {};
  const finishSet = [];

  let modelChangeLeather = '';
  let modelChangeColors = '';
  let modelChangePommel = '';
  let modelChangeBolster = '';

  let chosenProductVariants;

  const materialSelections = {
    handles: {},
    blades: {},
    activeColors: {}
  };

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


  function saveModelColors(model) {
    console.log('Сохранение цветов для модели:', model.fileName);
    const activeColors = {};

    // Проходим по всем группам модели
    model.refGroups.forEach(group => {
      const groupName = group.name;
      console.log('Обработка группы:', groupName);

      // Получаем настройки группы
      const groupSettings = group.groupedNodes?.[0]?.settingsData;

      if (groupSettings?.difmaps) {
        // Находим все активные кнопки для этой группы
        const activeButtons = document.querySelectorAll(
          `.group-section[data-title="${groupName}"] .color-button.active`
        );

        if (activeButtons.length) {
          // Сохраняем информацию о каждой активной кнопке
          activeColors[groupName] = Array.from(activeButtons).map(button => {
            const material = button.getAttribute('data-material');
            const difmap = groupSettings.difmaps.find(d =>
              d.name.toLowerCase() === material
            );

            console.log(`Сохранен цвет для ${groupName}:`, {
              color: button.style.backgroundColor,
              material,
              difmap: difmap ? {
                name: difmap.name,
                metalness: difmap.metalness,
                roughness: difmap.roughness
              } : null
            });

            return {
              color: button.style.backgroundColor,
              material,
              difmap
            };
          });
        }
      }
    });

    console.log('Итоговый объект сохраненных цветов:', activeColors);
    return activeColors;
  }

  function restoreModelColors(model, savedColors) {
    console.log('Восстановление цветов для модели:', model.fileName);
    console.log('Сохраненные цвета:', savedColors);

    model.refGroups.forEach(group => {
      const groupName = group.name;
      const savedGroupColors = savedColors[groupName];

      if (savedGroupColors) {
        console.log(`Восстановление цветов для группы ${groupName}:`, savedGroupColors);

        savedGroupColors.forEach(saved => {
          // Находим кнопку с соответствующим материалом
          const button = document.querySelector(
            `.group-section[data-title="${groupName}"] .color-button[data-material="${saved.material}"]`
          );

          if (button) {
            // Снимаем активное состояние со всех кнопок в группе если это Pommel или Bolster
            if (groupName === 'Pommel' || groupName === 'Bolster') {
              const allButtons = document.querySelectorAll(
                `.group-section[data-title="${groupName}"] .color-button`
              );
              allButtons.forEach(btn => btn.classList.remove('active'));
            }

            // Активируем кнопку
            button.classList.add('active');

            // Если есть метка, обновляем текст в заголовке
            const groupHeader = button.closest('.group-section')?.querySelector('.group-header span');
            if (groupHeader && button.getAttribute('data-label')) {
              groupHeader.textContent = '(' + button.getAttribute('data-label') + ')';
            }

            console.log(`Активирована кнопка в группе ${groupName}:`, {
              material: saved.material,
              color: saved.color
            });
          }
        });

        // Обновляем отображение цен для brass материалов
        if (savedGroupColors.some(color => color.material === 'brass')) {
          const section = document.querySelector(`.group-section[data-title="${groupName}"]`);
          const activeKnife = document.querySelector('.bespoke-product.active')?.getAttribute('data-title')?.toLowerCase();

          if (section && activeKnife) {
            const priceElement = section.querySelector('.section-price');
            if (!priceElement) {
              const priceValue = document.querySelector(`.bespoke-knife[data-knife="${activeKnife}"] div.pommel[data-title=brass]`)?.getAttribute('data-price');
              if (priceValue) {
                section.append(`<div class="section-price">+${window.currency_symbol}${priceValue}</div>`);
              }
            }
          }
        }
      }
    });
  }

  function applyModelColors(model, savedColors) {
    console.log('Применение цветов к материалам модели:', model.fileName);

    const nodeMaterials = { ...model.nodeMaterials };

    model.refGroups.forEach(group => {
      const groupName = group.name;
      const savedGroupColors = savedColors[groupName];

      if (savedGroupColors && group.nodes) {
        console.log(`Применение материалов для группы ${groupName}:`, savedGroupColors);

        // Применяем цвета к каждой ноде в группе
        group.nodes.forEach((nodeName, index) => {
          const savedColor = savedGroupColors[index % savedGroupColors.length];
          if (savedColor?.difmap) {
            nodeMaterials[nodeName] = {
              color: savedColor.color,
              metalness: savedColor.difmap.metalness || DEFAULT_METALNESS,
              roughness: savedColor.difmap.roughness || DEFAULT_ROUGHNESS,
              texture: savedColor.difmap.textures?.[0] || null
            };

            console.log(`Обновлен материал для ноды ${nodeName}:`, nodeMaterials[nodeName]);
          }
        });
      }
    });

    return nodeMaterials;
  }

  function updateReactComponent(model, nodeMaterials) {
    console.log('Обновление React компонента');

    if (document.shopifyConnect) {
      const updateMethod = model.modelType === 'handles'
        ? document.shopifyConnect.triggerModelChange
        : document.shopifyConnect.triggerBladeModelChange;

      const updateData = {
        fileName: model.fileName,
        fileUrl: model.fileUrl,
        modelType: model.modelType,
        nodeMaterials: nodeMaterials
      };

      console.log('Отправка данных в React:', updateData);
      updateMethod(updateData);
    }
  }

  // This code creates an instance of the ModelSettingsUI class. This class is responsible for initializing and managing the user interface for configuring models (handles, blades, etc.)."
  class ModelSettingsUI {
    constructor(container, data, modelType) {
      console.log('Шаг 7: Создание экземпляра ModelSettingsUI', {
        container: container?.id,
        modelType,
        dataItems: data?.items?.length
      });
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
        console.log('Шаг 6: Событие reinitialize вызвано');
        this.init();
      });
      this.init();
      console.log('---this',this)
    }

    init() {
      console.log('Шаг 8: Инициализация ModelSettingsUI');
      console.log('=== ПЕРЕДАЧА ДАННЫХ В REACT: Инициализация ===');
      console.log('ShopifyConnect статус:', {
        window: !!window.shopifyConnectInstance,
        document: !!document.shopifyConnect
      });

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

        console.log('Сформированный объект для передачи:', {
          fileName: firstModel.fileName,
          fileUrl: firstModel.fileUrl,
          modelType: firstModel.modelType,
          nodeMaterials: nodeMaterials
        });

        // Отправка в React через ShopifyConnect
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
          // console.log('Initializing camera to position:', CAMERA);
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
      modelSelector.className = 'model-selector';
      modelSelector.innerHTML = `<h3>${this.type === 'handles' ? 'Logic' : 'Choose one'}</h3>`;

      // Creates a container element for the geometry/handle options
      const stepItems = document.createElement('div');
      stepItems.className = 'items';

      // Iterates over each model in the data
      this.data.items.forEach((item, index) => {
        // Creates an element for each model option
        const stepItem = document.createElement('div');
        stepItem.className = 'step-item';

        // Creates a label element for the model name
        const label = document.createElement('label');
        label.style.display = 'block';
        label.style.marginBottom = '10px';
        label.setAttribute('for', item.textFileName.split(' ').join('-').toLowerCase());

        // Creates a radio button for selecting the model
        const radio = document.createElement('input');
        radio.id = item.textFileName.split(' ').join('-').toLowerCase();
        radio.type = 'radio';
        radio.name = `model-${this.type}`;
        radio.value = item.textFileName;
        radio.checked = index === 0;

        // Assigns an event listener to handle model selection on radio change
        radio.onchange = () => {
          const currentFileName = this.activeModel?.fileName;
          const newFileName = item.fileName;

          // Если модель уже активна, не делаем ничего
          if (currentFileName === newFileName) return;

          // Сохраняем состояние всех групп перед сменой модели
          const savedState = {
            pommel: {
              label: document.querySelector('.group-section[data-title="Pommel"] .color-button.active')?.getAttribute('data-label'),
              material: document.querySelector('.group-section[data-title="Pommel"] .color-button.active')?.getAttribute('data-material'),
              color: document.querySelector('.group-section[data-title="Pommel"] .color-button.active')?.style.backgroundColor
            },
            bolster: {
              label: document.querySelector('.group-section[data-title="Bolster"] .color-button.active')?.getAttribute('data-label'),
              material: document.querySelector('.group-section[data-title="Bolster"] .color-button.active')?.getAttribute('data-material'),
              color: document.querySelector('.group-section[data-title="Bolster"] .color-button.active')?.style.backgroundColor
            },
            leatherSpacers: Array.from(document.querySelectorAll('.group-section[data-title="Leather Spacers"] .color-button.active')).map(button => ({
              label: button.getAttribute('data-label'),
              material: button.getAttribute('data-material'),
              color: button.style.backgroundColor
            })),
            discs: Array.from(document.querySelectorAll('.group-section[data-title="Discs"] .color-button.active')).map(button => ({
              label: button.getAttribute('data-label'),
              material: button.getAttribute('data-material'),
              color: button.style.backgroundColor
            }))
          };

          // Сохраняем текущие активные цвета
          const currentActiveColors = materialSelections.activeColors[this.type]
            ? { ...materialSelections.activeColors[this.type] }
            : {};

          // Меняем модель
          this.selectModel(newFileName);

          // После рендеринга восстанавливаем состояние
          requestAnimationFrame(() => {
            // Восстанавливаем Pommel
            if (savedState.pommel.label) {
              const pommelButton = document.querySelector(`.group-section[data-title="Pommel"] .color-button[data-label="${savedState.pommel.label}"][data-material="${savedState.pommel.material}"]`);
              if (pommelButton) {
                document.querySelectorAll('.group-section[data-title="Pommel"] .color-button').forEach(btn => btn.classList.remove('active'));
                pommelButton.classList.add('active');
                const groupHeader = pommelButton.closest('.group-section').querySelector('.group-header span');
                if (groupHeader) {
                  groupHeader.textContent = `(${savedState.pommel.label})`;
                }
              }
            }

            // Восстанавливаем Bolster
            if (savedState.bolster.label) {
              const bolsterButton = document.querySelector(`.group-section[data-title="Bolster"] .color-button[data-label="${savedState.bolster.label}"][data-material="${savedState.bolster.material}"]`);
              if (bolsterButton) {
                document.querySelectorAll('.group-section[data-title="Bolster"] .color-button').forEach(btn => btn.classList.remove('active'));
                bolsterButton.classList.add('active');
                const groupHeader = bolsterButton.closest('.group-section').querySelector('.group-header span');
                if (groupHeader) {
                  groupHeader.textContent = `(${savedState.bolster.label})`;
                }
              }
            }

            // Восстанавливаем Leather Spacers
            document.querySelectorAll('.group-section[data-title="Leather Spacers"] .color-button').forEach(button => {
              button.classList.remove('active');
            });
            savedState.leatherSpacers.forEach(saved => {
              const button = document.querySelector(`.group-section[data-title="Leather Spacers"] .color-button[data-label="${saved.label}"]`);
              if (button) button.classList.add('active');
            });
            const leatherLabels = savedState.leatherSpacers.map(s => s.label).join(', ');
            const leatherHeader = document.querySelector('.group-section[data-title="Leather Spacers"] .group-header span');
            if (leatherHeader) {
              leatherHeader.textContent = `(${leatherLabels})`;
            }

            // Восстанавливаем Discs
            document.querySelectorAll('.group-section[data-title="Discs"] .color-button').forEach(button => {
              button.classList.remove('active');
            });
            savedState.discs.forEach(saved => {
              const button = document.querySelector(`.group-section[data-title="Discs"] .color-button[data-label="${saved.label}"]`);
              if (button) button.classList.add('active');
            });
            const discsLabels = savedState.discs.map(s => s.label).join(', ');
            const discsHeader = document.querySelector('.group-section[data-title="Discs"] .group-header span');
            if (discsHeader) {
              discsHeader.textContent = `(${discsLabels})`;
            }

            // Восстанавливаем настройки материалов для React
            Object.entries(currentActiveColors).forEach(([groupId, colors]) => {
              const colorOptions = document.querySelector(`[data-group-id="${groupId}"] .color-options`);
              if (colorOptions) {
                const activeButtons = Array.from(colorOptions.querySelectorAll('.color-button.active'))
                  .map(button => ({
                    color: button.style.backgroundColor,
                    material: button.getAttribute('data-material')
                  }));

                if (activeButtons.length > 0) {
                  updateMaterialSelections(this.type, {}, {
                    [groupId]: activeButtons.map(b => b.color)
                  });
                  this.updateSettings(groupId, 'colors', activeButtons.map(b => b.color));
                }
              }
            });

            // Обновляем цены и состояние для brass материалов
            ['Pommel', 'Bolster'].forEach(section => {
              const sectionElement = document.querySelector(`.group-section[data-title="${section}"]`);
              const activeButton = sectionElement?.querySelector('.color-button.active');
              if (activeButton?.getAttribute('data-material') === 'brass') {
                const activeKnife = document.querySelector('.bespoke-product.active')?.getAttribute('data-title')?.toLowerCase();
                if (activeKnife) {
                  const priceValue = document.querySelector(`.bespoke-knife[data-knife="${activeKnife}"] div.pommel[data-title=brass]`)?.getAttribute('data-price');
                  if (priceValue) {
                    sectionElement.querySelector('.section-price')?.remove();
                    sectionElement.insertAdjacentHTML('beforeend', `<div class="section-price">+${window.currency_symbol}${priceValue}</div>`);
                  }
                }
              }
            });
          });

          // Обновляем цены и URL если нужно
          if (chosenProductVariants) {
            let bladeSteel = document.querySelector('#bladeSteel input:checked');
            let bladeFinish = document.querySelector('#bladeFinish input:checked');
            let bladeGeometry = document.querySelector('#bladeGeometry input:checked');

            let pommelMaterial = document.querySelector('.group-section[data-title="Pommel"] button.active').getAttribute('data-material');
            let bolsterMaterial = document.querySelector('.group-section[data-title="Bolster"] button.active').getAttribute('data-material');

            let bespokeChosenMaterial;
            if (pommelMaterial === 'metal' && bolsterMaterial === 'metal') {
              bespokeChosenMaterial = 'Metal';
            } else if (pommelMaterial === 'brass' && bolsterMaterial === 'brass') {
              bespokeChosenMaterial = 'Brass';
            } else if ((pommelMaterial === 'metal' && bolsterMaterial === 'brass') ||
                       (pommelMaterial === 'brass' && bolsterMaterial === 'metal')) {
              bespokeChosenMaterial = 'Metal | Brass';
            }

            if (bladeSteel && bladeFinish && bladeGeometry) {
              newVariant = bladeSteel.value + ' | ' + bladeFinish.value +
                ' / ' + bladeGeometry.value +
                ' / ' + bespokeChosenMaterial;
            }
            getNewPrice(newVariant);
            buildUrl();
          }
        };

        // Appends the radio button and model name to the label
        stepItem.appendChild(radio);
        stepItem.appendChild(label);
        label.appendChild(document.createTextNode(` ${item.textFileName}`));
        stepItems.appendChild(stepItem);
      });

      // Adds the container for model options to the selector
      modelSelector.appendChild(stepItems);

      // Appends the model selector to the appropriate container based on type
      if (this.type === 'blades') {
        document.getElementById('bladeGeometry').innerHTML = '<h2 class="section-title">Select Blade Geometry</h2>';
        document.getElementById('bladeGeometry').appendChild(modelSelector);
      } else {
        document.getElementById('handleDesign').innerHTML = '<h2 class="section-title">Design Handle</h2>';
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
      console.log('Выбор модели:', fileName);

      // Текущая модель
      const currentFileName = this.activeModel?.fileName;
      const newFileName = fileName;

      // Если модель уже активна, не делаем ничего
      if (currentFileName === newFileName) return;

      const groupSections = document.querySelectorAll('#handleDesign .groups-container .group-section');
      const groupSectionsArray = Array.from(groupSections);
      const filteredSections = groupSectionsArray.filter(section => section.getAttribute('data-title') !== "Rivet");

      let sectionData = filteredSections.map(section => {
        let sectionTitle = section.getAttribute('data-title');
        let activeButtons = Array.from(section.querySelectorAll('.color-button.active'));
        let activeButtonStyles = activeButtons.map(button => getComputedStyle(button));
        return {
          name: sectionTitle,
          activeButtonStyles: activeButtonStyles
        };
      });

      console.log('SECTION DATA',sectionData);

      function getComputedStyle(element) {
        // Get the computed style of the element
        const style = window.getComputedStyle(element);
        // Extract relevant style properties (you can customize this)
        return {
          backgroundColor: style.backgroundColor
          // Add other relevant properties like border, font-size, etc.
        };
      }

      // Сохраняем текущие активные цвета
      const currentActiveColors = materialSelections.activeColors[this.type]
        ? { ...materialSelections.activeColors[this.type] }
        : {};

      console.log('Сохраненные активные цвета:', currentActiveColors);

      // Находим и устанавливаем новую модель
      this.activeModel = this.data.items.find(item => item.fileName === fileName);
      if (!this.activeModel) return;

      // Рендерим UI для новой модели
      this.renderGroupTabs();

      // После рендеринга восстанавливаем активные цвета
      requestAnimationFrame(() => {
        function rgbToHex(r, g, b) {
          return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b);
        }
        function componentToHex(c) {
          const hex = c.toString(16);
          return hex.length == 1 ? "0" + hex : hex;
        }

        if (sectionData.length > 0) {
          // console.log('NEW ACTIVE', sectionData);

          let currentLogic = document.querySelector('#handleDesign .model-selector input:checked').getAttribute('id');

          sectionData.forEach(section => {
            const sectionColors = section.activeButtonStyles;
            sectionColors.forEach(colors => {
              // Extract RGB values from the string
              const rgbValues = colors.backgroundColor.match(/\d+/g).map(Number);
              const hexColor = rgbToHex(rgbValues[0], rgbValues[1], rgbValues[2]);

              colors.color = hexColor;

              // Remove backgroundColor property
              delete colors.backgroundColor;
            });
          });

          if(fetchData) {
            let targetCollection = fetchData.find(c => c.name === target_collection_name);

            if (targetCollection && targetCollection.items) {
              let handlesModels = targetCollection.items.filter(item => item.modelType === 'handles');

              if (handlesModels.length === 0) {
                throw new Error('No handles models found in collection');
              }else{
                handlesModels.forEach(handle => {
                  if(currentLogic === handle.textFileName.toLowerCase()) {
                    const matchingRefGroups = [];

                    sectionData.forEach(section => {
                      const sectionName = section.name;
                      const matchingRefGroup = handle.refGroups.find(refGroup => refGroup.name === sectionName);

                      section.activeButtonStyles.forEach(item => {
                        function findMatchingMaterial(materialArray, targetColor) {
                          const matchingMaterial = materialArray.find(material => material.colors.includes(targetColor));
                          return matchingMaterial;
                        }
                        const chosenMaterial = findMatchingMaterial(matchingRefGroup.groupedNodes[0].settingsData.difmaps, item.color);
                        // console.log(matchingRefGroup.groupedNodes[0].settingsData.difmaps);

                        if (chosenMaterial) {
                          let activeColorObject = {
                            color: item.color,
                            metalness: chosenMaterial.metalness,
                            roughness: chosenMaterial.roughness,
                            texture: chosenMaterial.textures
                          }
                          console.log(sectionName, activeColorObject);
                        } else {
                          console.log("No material found with color", targetColor);
                        }
                      })
                    });
                  }
                });
              }
            } else {
              throw new Error(`Collection with ID ${TARGET_COLLECTION_ID} not found`);
            }
          } else {
            throw new Error('No collections available');
          }
        }

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
                console.log(`Обновляем настройки для группы ${groupId}:`, activeButtons);

                // Обновляем materialSelections
                updateMaterialSelections(this.type, {}, {
                  [groupId]: activeButtons
                });

                // Обновляем настройки и отправляем в React
                this.updateSettings(groupId, 'colors', activeButtons);
              }
            }
          });
        }
      });
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
        groupHeader.innerHTML = group.name+'<span></span>';
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
              elementColors.push(color+'/'+material.name.toLowerCase());
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
            colorButton.style.backgroundColor = color.split('/')[0];
            colorButton.dataset.material = color.split('/')[1];

            // Устанавливаем активное состояние на основе сохраненных цветов
            if (savedActiveColors.length > 0 && savedActiveColors.includes(color.split('/')[0])) {
              colorButton.classList.add('active');
            } else if (savedActiveColors.length === 0 && index === 0) {
              colorButton.classList.add('active');
            }

            $(colorButton).on('mouseenter', function() {
              const $closestGroupSection = $(this).closest('.group-section');
              const dataTitle = $closestGroupSection.data('title');

              if(dataTitle === 'Discs') {
                $closestGroupSection.find('.group-header span').text('('+$(this).attr('data-label')+')');
              }

              let activeKnife = $('.bespoke-product.active').attr('data-title').toLowerCase();
              if (dataTitle === 'Pommel' && $(this).attr('data-material') === 'brass') {
                let pommelPrice = $('.bespoke-knife[data-knife="'+activeKnife+'"] div.pommel[data-title=brass]').attr('data-price');

                if ($closestGroupSection.find('.section-price').length === 0) {
                  $closestGroupSection.append('<div class="section-price">+'+window.currency_symbol+pommelPrice+'</div>');
                }
              }else if (dataTitle === 'Bolster' && $(this).attr('data-material') === 'brass') {
                let bolsterPrice = $('.bespoke-knife[data-knife="'+activeKnife+'"] div.pommel[data-title=brass]').attr('data-price');
                if ($closestGroupSection.find('.section-price').length === 0) {
                  $closestGroupSection.append('<div class="section-price">+'+window.currency_symbol+bolsterPrice+'</div>');
                }
              }
            });
            $(colorButton).on('mouseleave', function() {
              const $closestGroupSection = $(this).closest('.group-section');
              const dataTitle = $closestGroupSection.data('title');

              if(dataTitle === 'Discs') {
                $closestGroupSection.find('.group-header span').text('');
              }

              if(!$(this).hasClass('active') && $(this).attr('data-material') === 'brass') {
                $closestGroupSection.find('.section-price').remove();
              }
            });


            // Остальной код обработчика клика остается без изменений...
            colorButton.onclick = (e) => {
              const closestGroupSection = colorButton.closest('.group-section');
              const dataTitle = closestGroupSection.getAttribute('data-title');
              if (dataTitle === 'Bolster' || dataTitle === 'Pommel') {
                closestGroupSection.querySelector('.group-header span').textContent = '('+colorButton.getAttribute('data-label')+')';

                const buttonGroup = colorButton.parentNode;
                Array.from(buttonGroup.children).forEach(child => {
                  child.classList.remove('active');
                });
                colorButton.classList.add('active');

                if($(colorButton).attr('data-material') !== 'brass') {
                  $(closestGroupSection).find('.section-price').remove();
                }
              } else {
                colorButton.classList.toggle('active');
              }

              const activeButtons = Array.from(colorOptions.querySelectorAll('.color-button.active'))
                      .map(button => button.style.backgroundColor);

              updateMaterialSelections(this.type, {}, {
                [group.id]: activeButtons
              });

              this.updateSettings(group.id, 'colors', activeButtons);

              if (dataTitle === 'Leather Spacers') {
                let activeButtons = closestGroupSection.querySelectorAll('.color-button.active');
                let activeLS = []
                activeButtons.forEach(button => {
                  const dataLabel = button.getAttribute('data-label');
                  activeLS.push(dataLabel);
                });
                closestGroupSection.querySelector('.group-header span').textContent = '('+activeLS.join(', ')+')';
              }

              if (chosenProductVariants) {
                let bladeSteel = document.querySelector('#bladeSteel input:checked');
                let bladeFinish = document.querySelector('#bladeFinish input:checked');
                let bladeGeometry = document.querySelector('#bladeGeometry input:checked');

                let pommelMaterial = document.querySelector('.group-section[data-title="Pommel"] button.active').getAttribute('data-material');
                let bolsterMaterial = document.querySelector('.group-section[data-title="Bolster"] button.active').getAttribute('data-material');

                let bespokeChosenMaterial;
                if (pommelMaterial === 'metal' && bolsterMaterial === 'metal') {
                  bespokeChosenMaterial = 'Metal';
                } else if (pommelMaterial === 'brass' && bolsterMaterial === 'brass') {
                  bespokeChosenMaterial = 'Brass';
                } else if ((pommelMaterial === 'metal' && bolsterMaterial === 'brass') || (pommelMaterial === 'brass' && bolsterMaterial === 'metal')) {
                  bespokeChosenMaterial = 'Metal | Brass';
                }

                if (bladeSteel && bladeFinish && bladeGeometry) {
                  newVariant = bladeSteel.value + ' | ' + bladeFinish.value +
                          ' / ' + bladeGeometry.value +
                          ' / ' + bespokeChosenMaterial;
                }
                getNewPrice(newVariant);
              }
              buildUrl();
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
      console.log('=== ПЕРЕДАЧА ДАННЫХ В REACT: Обновление настроек ===');

      if (!this.activeGroups.has(groupId)) {
        this.activeGroups.set(groupId, {});
      }
      console.log('this.activeGroups', this.activeGroups);

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
            if(index === 0) {

            }
            const difmap = groupData.settingsData?.difmaps?.[0];
            const newMaterial = {
              color: selectedColors[index % selectedColors.length],
              metalness: difmap.metalness || DEFAULT_METALNESS,
              roughness: difmap.roughness || DEFAULT_ROUGHNESS,
              texture: texture
            };

            console.log('CURRENT NODE MATERIALS', currentNodeMaterials);

            console.log('Обновленный объект для передачи:', {
              fileName: this.activeModel.fileName,
              fileUrl: this.activeModel.fileUrl,
              modelType: this.activeModel.modelType,
              nodeMaterials: currentNodeMaterials
            });

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

          // Отправка обновленных данных в React
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
  function getNewPrice(chosenVariant) {

    const foundVariant = chosenVariant && chosenProductVariants.find(
            (variant) => variant.title.toLowerCase() === chosenVariant.toLowerCase()
    );

    let bladeEngraving = document.querySelector('#laserEngraving input:checked').id;
    let engravingPrice = 0;

    if(bladeEngraving === 'laser-engraving') {
      engravingPrice = parseInt($('.bespoke-laser').attr('data-price'))/100;
    }

    let addonsPrice = 0;
    if($('#optionalAddons').find('.addon').length > 0) {
      $('#optionalAddons').find('.addon').each(function(){
        if($(this).find('input[type="checkbox"]').is(':checked')){
          addonsPrice += parseInt($(this).attr('data-price'));
        }
      })
    }

    if (foundVariant) {
      const productPrices = foundVariant.presentmentPrices.nodes;
      const priceInCurrency = productPrices.find(
              (price) => price.price.currencyCode === window.currency
      );


      if (priceInCurrency) {
        const productNewPrice =
                window.currency_symbol + (parseInt(priceInCurrency.price.amount)+engravingPrice+addonsPrice);
        const subtotalElement = document.querySelector('.cf-subtotal span.subtotal-price');
        subtotalElement.textContent = productNewPrice;
      }
    }
  }

  // В initializeUI происходит загрузка коллекции и глобальных настроек
  function initializeUI() {

    console.log('Шаг 5: Начало инициализации UI');

    const startUI = () => {
      addResetButton();

      // Загружаем сохраненное состояние
      loadMaterialSelectionsState();


      const handleContainer = document.getElementById('handleContainer');
      const bladeContainer = document.getElementById('bladeContainer');

      if (!handleContainer || !bladeContainer || !bladeGeometry) {
        console.error('Container elements not found');
        return;
      }

      fetch('{{ "A_all-collections-data.json" | asset_url }}')
              .then(response => response.json())
              .then(data => {
                console.log('=== ПЕРЕДАЧА ДАННЫХ В REACT: Загрузка коллекции ===', data);
                if (data && data.collections) {
                  fetchData = data.collections;

                  const targetCollection = data.collections.find(c => c.name === target_collection_name);

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

                    laserStep();

                    let pommelMaterial = document.querySelector('.group-section[data-title="Pommel"] button.active').getAttribute('data-material');
                    let bolsterMaterial = document.querySelector('.group-section[data-title="Bolster"] button.active').getAttribute('data-material');

                    let bespokeChosenMaterial;
                    if (pommelMaterial === 'metal' && bolsterMaterial === 'metal') {
                      bespokeChosenMaterial = 'Metal';
                    } else if (pommelMaterial === 'brass' && bolsterMaterial === 'brass') {
                      bespokeChosenMaterial = 'Brass';
                    } else if ((pommelMaterial === 'metal' && bolsterMaterial === 'brass') || (pommelMaterial === 'brass' && bolsterMaterial === 'metal')) {
                      bespokeChosenMaterial = 'Metal | Brass';
                    }

                    firstVariant = $('#bladeSteel input:checked').val()+' | '+$('#bladeFinish input:checked').val()+' / '+$('#bladeGeometry input:checked').val() + ' / ' + bespokeChosenMaterial;

                    if (window.location.search && initialize === 0) {
                      let search = window.location.search.split('?')[1].split('&');

                      let knife = search[0].split('=')[1];
                      $('.bespoke-product[data-handle="'+knife+'"]').trigger('click');

                      setTimeout(function(){
                        for(let i = 1; i < search.length; i++) {
                          let knifeEl = search[i].split('=');

                          if(knifeEl[0] === 'steel') {
                            $('#bladeSteel label[for="'+knifeEl[1]+'"]').trigger('click');
                          }
                          if(knifeEl[0] === 'geometry') {
                            $('#bladeGeometry label[for="'+knifeEl[1]+'"]').trigger('click');
                          }
                          if(knifeEl[0] === 'finish') {
                            $('#bladeFinish label[for="'+knifeEl[1]+'"]').trigger('click');
                          }
                          if(knifeEl[0] === 'logic') {
                            $('#handleDesign label[for="'+knifeEl[1]+'"]').trigger('click');
                          }
                          if(knifeEl[0] === 'leather') {
                            $('.group-section[data-title="Leather Spacers"] button.active').removeClass('active');
                            let leatherList = knifeEl[1].split('_');
                            for( let j = 0; j < leatherList.length; j++) {
                              $('.group-section[data-title="Leather Spacers"] button[data-label="'+leatherList[j]+'"]:not(.active)').trigger('click');
                            }
                          }
                          if(knifeEl[0] === 'colors') {
                            $('.group-section[data-title="Discs"] button.active').removeClass('active');
                            let colorsList = knifeEl[1].split('_');
                            for( let j = 0; j < colorsList.length; j++) {
                              $('.group-section[data-title="Discs"] button[data-label="'+colorsList[j].split('%20').join(' ')+'"]:not(.active)').trigger('click');
                            }
                          }
                          if(knifeEl[0] === 'pommel') {
                            $('.group-section[data-title="Pommel"] button[data-label="'+knifeEl[1]+'"]:not(.active)').trigger('click');
                          }
                          if(knifeEl[0] === 'bolster') {
                            $('.group-section[data-title="Bolster"] button[data-label="'+knifeEl[1]+'"]:not(.active)').trigger('click');
                          }
                          if(knifeEl[0] === 'laser') {
                            if(knifeEl[1] !== 'no-engraving') {
                              $('#laserEngraving label[for="laser-engraving"]').trigger('click');
                              $('#laserEngraving label[for="laser-engraving"] input').val(knifeEl[1]);
                            }
                          }
                          if(knifeEl[0] === 'addons') {
                            let addonsItems = knifeEl[1].split('_');
                            for( let j = 0; j < addonsItems.length; j++) {
                              $('#optionalAddons .addons-list label[for="'+addonsItems[j]+'"]').trigger('click');
                            }
                          }
                        }
                        if (chosenProductVariants) {
                          let bladeSteel = document.querySelector('#bladeSteel input:checked');
                          let bladeFinish = document.querySelector('#bladeFinish input:checked');
                          let bladeGeometry = document.querySelector('#bladeGeometry input:checked');

                          let pommelMaterial = document.querySelector('.group-section[data-title="Pommel"] button.active').getAttribute('data-material');
                          let bolsterMaterial = document.querySelector('.group-section[data-title="Bolster"] button.active').getAttribute('data-material');

                          let bespokeChosenMaterial;
                          if (pommelMaterial === 'metal' && bolsterMaterial === 'metal') {
                            bespokeChosenMaterial = 'Metal';
                          } else if (pommelMaterial === 'brass' && bolsterMaterial === 'brass') {
                            bespokeChosenMaterial = 'Brass';
                          } else if ((pommelMaterial === 'metal' && bolsterMaterial === 'brass') || (pommelMaterial === 'brass' && bolsterMaterial === 'metal')) {
                            bespokeChosenMaterial = 'Metal | Brass';
                          }

                          if (bladeSteel && bladeFinish && bladeGeometry) {
                            newVariant = bladeSteel.value + ' | ' + bladeFinish.value +
                                    ' / ' + bladeGeometry.value +
                                    ' / ' + bespokeChosenMaterial;
                          }
                          getNewPrice(newVariant);
                        }

                        $('.bcf-cat')[0].click();
                      },500)
                      initialize = 1;
                    }
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

  function customizerSteps(){
    const allSteps = document.querySelectorAll(".bespoke-step");
    const stepCount = allSteps.length;
    const backButton = document.querySelector(".customizer-header .ch-back");
    const nextButton = document.querySelector(".customizer-footer .cf-next");
    const addToCart = document.querySelector(".customizer-footer .cf-add-to-cart");
    const changeButton = document.querySelector(".customizer-header .ch-change");
    const shareButton = document.querySelector(".customizer-header .ch-share");

    allSteps[0].classList.add('active');
    laserStep();

    nextButton.addEventListener("click", () => {
      const activeStep = document.querySelector(".bespoke-step.active");
      if (activeStep) {
        getKnifeInfo();
        const activeStepIndex = Array.from(allSteps).indexOf(activeStep);
        allSteps[activeStepIndex].classList.remove('active');
        allSteps[activeStepIndex + 1].classList.add('active');
        document.querySelector('.customizer-header .ch-back .ch-step span').innerText = activeStepIndex + 2;
        if (activeStepIndex + 2 === 7) {
          nextButton.style.display = 'none';
          addToCart.style.display = 'flex';
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
          addToCart.style.display = 'none';

          document.shopifyConnect.triggerCameraPositionChange(activeStepIndex);
        }
      }
    });
    changeButton.addEventListener("click", () => {
      document.querySelector('body.bespoke-intro .bespoke-customizer').classList.remove('show');
      allSteps.forEach(step => step.classList.remove('active'));
      allSteps[0].classList.add('active');
      laserStep();
      document.querySelector('.customizer-header .ch-back .ch-step span').innerText = '1';
      document.shopifyConnect.triggerCameraPositionChange(1);
      document.querySelector('body.bespoke-intro .bespoke-choice').classList.remove('non-visible');
    });
    shareButton.addEventListener("click", () => {
      shareButton.classList.add('copied');
      copyToClipboard(window.location.href+'?'+bespokeUrl);

      setTimeout(function(name) {
        shareButton.classList.remove('copied');
      }, 1000);
    });
    addToCart.addEventListener("click", () => {
      let bladeSteel = document.querySelector('#bladeSteel input:checked');
      let bladeGeometry = document.querySelector('#bladeGeometry input:checked');
      let bladeFinish = document.querySelector('#bladeFinish input:checked');

      let pommelMaterial = document.querySelector('.group-section[data-title="Pommel"] button.active').getAttribute('data-material');
      let bolsterMaterial = document.querySelector('.group-section[data-title="Bolster"] button.active').getAttribute('data-material');

      let bespokeChosenMaterial;
      if (pommelMaterial === 'metal' && bolsterMaterial === 'metal') {
        bespokeChosenMaterial = 'Metal';
      } else if (pommelMaterial === 'brass' && bolsterMaterial === 'brass') {
        bespokeChosenMaterial = 'Brass';
      } else if ((pommelMaterial === 'metal' && bolsterMaterial === 'brass') || (pommelMaterial === 'brass' && bolsterMaterial === 'metal')) {
        bespokeChosenMaterial = 'Metal | Brass';
      }

      if (bladeSteel && bladeFinish && bladeGeometry) {
        newVariant = bladeSteel.value + ' | ' + bladeFinish.value +
                ' / ' + bladeGeometry.value +
                ' / ' + bespokeChosenMaterial;
      }
      const foundVariant = chosenProductVariants.find(
              (variant) => {
                return variant.title.toLowerCase() === newVariant.toLowerCase();
              }
      );

      let customCartInfo = [];
      let customName = document.querySelector('.bespoke-product.active .bp-title').textContent;
      let customVariant = foundVariant.id;
      let customModel = document.querySelector('.bespoke-product.active').getAttribute('data-handle');
      let customSteel = bladeSteel.value;
      let customGeometry = bladeGeometry.value;
      let customFinish = bladeFinish.value;
      let customPommel = document.querySelector('.group-section[data-title="Pommel"] .color-button.active').getAttribute('data-label');
      let customBolster = document.querySelector('.group-section[data-title="Bolster"] .color-button.active').getAttribute('data-label');
      let customLogic = document.querySelector('#handleDesign .model-selector input:checked').value;
      let customNotes = document.querySelector('#orderNotes textarea').value;
      let customQuantity = 1;

      let checkedInputs = document.querySelectorAll('#optionalAddons input:checked');
      let customAddons = Array.from(checkedInputs).map(input => input.id);

      let customAddonsQuantity = Array.from(document.querySelectorAll('#optionalAddons input:checked')).map(input => input.getAttribute('data-inventory') || null);

      let allLeather = document.querySelectorAll('.group-section[data-title="Leather Spacers"] .color-button.active');
      let leatherArr = [];
      allLeather.forEach(button => {
        leatherArr.push(button.getAttribute('data-label'));
      });
      let customLeather = leatherArr.join(', ');

      let allColors = document.querySelectorAll('.group-section[data-title="Discs"] .color-button.active');
      let colorsArr = [];
      allColors.forEach(button => {
        colorsArr.push(button.getAttribute('data-label'));
      });
      let customColours = colorsArr.join(', ');

      let customLaserEtching = document.querySelector('#laserEngraving input:checked').getAttribute('id');
      let laserProduct = '';
      let formData = {items: []};

      if(customLaserEtching === 'no-engraving') {
        customLaserEtching = 'None';
      }else{
        customLaserEtching = document.querySelector('#laserEngraving label[for="laser-engraving"] input').value;

        let laserId = document.querySelector('.bespoke-list .bespoke-laser').getAttribute('data-id');
        laserProduct = {
          quantity: 1,
          id: laserId
        }
        formData.items.push(laserProduct);
      }
      let customProductItem = {
        quantity: customQuantity,
        id: customVariant.split('/')[4],
        properties: {
          'Name': customName,
          'Model': customModel,
          'Steel': customSteel,
          'Geometry': customGeometry,
          'Finish': customFinish,
          'Leather': customLeather,
          'Pommel': customPommel,
          'Bolster': customBolster,
          'Colours': customColours,
          'Logic': customLogic,
          'Laser Etching': customLaserEtching,
          'Notes': customNotes,
          'Quantity': customQuantity,
        }
      };
      formData.items.push(customProductItem);

      if(customAddons.length > 0) {
        for(let i = 0; i < customAddons.length; i++) {
          formData.items.push({
            quantity: 1,
            id: customAddons[i],
            properties: {
              'Quantity': customAddonsQuantity[i],
            }
          });
        }
      }

      jQuery.ajax({
        type: 'POST',
        url: '/cart/add.js',
        data: formData,
        dataType: 'json',
        success: function() {
          buildCart();
        },
        error: function(response) {
          console.log(response);
        }
      });
    });
  }


  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeUI);
    document.addEventListener('DOMContentLoaded', customizerSteps);
  } else {
    initializeUI();
  }

  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      console.log('Text copied to clipboard:', text);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }
  function buildCart(){
    $.ajax({
      type: 'GET',
      url: '/cart.js',
      cache: false,
      dataType: 'json',
      success: function(cart) {
        console.log('cart is building');
        let cartSubtotal = cart.total_price / 100;
        let cartCount = cart.item_count;

        let cartItems = cart.items;
        let cartHtml = '';
        for(let i = 0; i < cartItems.length; i++) {
          let cartItem = cartItems[i];

          let cartItemProperties = '';
          let cartItemTitle = cartItem.title;
          let cartImage = cartItem.image;
          let cartImageHtml = '';
          if(cartImage !== null) {
            cartImageHtml = '<div class="cartImage"><img src="'+cartItem.image+'" alt="'+cartItem.properties.Name+'"></div>';
          }

          if(Object.keys(cartItem.properties).length > 1) {
            cartItemTitle = cartItem.properties.Name;
            cartItemProperties = '<div class="cartItemProperties">' +
                    '<div class="cartItemModel">Model: '+cartItem.properties.Model+'</div>' +
                    '<div class="cartItemSteel">Steel: '+cartItem.properties.Steel+'</div>' +
                    '<div class="cartItemGeometry">Blade Geometry: '+cartItem.properties.Geometry+'</div>' +
                    '<div class="cartItemFinish">Blade Finish: '+cartItem.properties.Finish+'</div>' +
                    '<div class="cartItemLeather">Handle Leather: '+cartItem.properties.Leather+'</div>' +
                    '<div class="cartItemBolster">Bolster: '+cartItem.properties.Bolster+'</div>' +
                    '<div class="cartItemPommel">Pommel: '+cartItem.properties.Pommel+'</div>' +
                    '<div class="cartItemColours">Handle Colours: '+cartItem.properties.Colours+'</div>' +
                    '<div class="cartItemLaserEtching">Laser Etching: '+cartItem.properties["Laser Etching"]+'</div>' +
                    '<div class="cartItemNotes">Notes: '+cartItem.properties.Notes+'</div>' +
                    '</div>';
          }

          cartHtml += '<div class="cartItem" data-id="'+cartItem.id+'">' +
                  '<div class="cartInfo">' +
                  '<div class="cartItemTitle">'+cartItemTitle+'</div>' +
                  '<div class="cartItemPrice">'+window.currency_symbol+(cartItem.final_line_price / 100)+'</div>' +
                  cartItemProperties +
                  '<div class="cartItemFooter">' +
                  '<div class="cartItemQuantity"><button name="minus"></button><input type="number" value="'+cartItem.quantity+'"><button name="plus"></button></div>' +
                  '<div class="cartItemRemove">/ <button class="remove">Remove</button></div>' +
                  '</div>' +
                  '</div>' +
                  cartImageHtml +
                  '</div>';
        }
        const cartDrawer = document.querySelector('cart-drawer');

        if (cartDrawer) {
          const cartItemsContainer = cartDrawer.querySelector('cart-drawer-items #CartDrawer-CartItems');
          if (cartItemsContainer) {
            cartItemsContainer.innerHTML = `<div class="cart-items">${cartHtml}</div>`;
          }

          cartDrawer.querySelector('.drawer__inner-empty')?.remove();
          cartDrawer.querySelector('cart-drawer-items')?.classList.remove('is-empty');
          cartDrawer.classList.remove('is-empty');

          const cartIcon = document.querySelector('header.header .header__icons a.header__icon.header__icon--cart');
          if (cartIcon) {
            cartIcon.click();
          }

          const cartSubtotalElement = cartDrawer.querySelector('div.cart-drawer .drawer__inner .drawer__footer .totals > p');
          if (cartSubtotalElement) {
            cartSubtotalElement.innerHTML = `${window.currency_symbol}${cartSubtotal}`;
          }
          const checkoutButton = cartDrawer.querySelector('#CartDrawer-Checkout');
          if (checkoutButton) {
            checkoutButton.removeAttribute('disabled');
          }

          document.querySelector('div.cart-drawer .drawer__inner .drawer__header h2.drawer__heading').textContent = 'Cart ('+cartCount+')';
          document.querySelector('header.header .header__icons a.header__icon.header__icon--cart > .cart-count-bubble span:first-child').textContent = cartCount;

          document.querySelector('#CartDrawer .cart-items').addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();

            const target = e.target;
            const cartItemId = target.closest('.cartItem').getAttribute('data-id');

            if (target.classList.contains('remove')) {
              $.ajax({
                url: `/cart/change.js`,
                method: "POST",
                data: { quantity: 0, id: cartItemId },
                success: function(cart) {
                  buildCart();
                }
              });
            } else if (target.matches('button[name="minus"]')) {
              const inputField = target.parentElement.querySelector('input[type="number"]');
              let currentQuantity = parseInt(inputField.value);

              if (currentQuantity > 1) {
                $.ajax({
                  url: `/cart/change.js`,
                  method: "POST",
                  data: { quantity: currentQuantity - 1, id: cartItemId },
                  success: function(cart) {
                    buildCart();
                  }
                });
              }
            } else if (target.matches('button[name="plus"]')) {
              const inputField = target.parentElement.querySelector('input[type="number"]');
              let currentQuantity = parseInt(inputField.value);

              $.ajax({
                url: `/cart/change.js`,
                method: "POST",
                data: { quantity: currentQuantity + 1, id: cartItemId },
                success: function(cart) {
                  buildCart();
                }
              });
            }
          });
        }
      }
    });
  }

  function getKnifeInfo(){
    let activeKnife = $('.bespoke-product.active').attr('data-title').toLowerCase();
    let knifeArray = [];

    $('.bespoke-knife').each(function(){
      let $this = $(this);
      if($this.attr('data-knife').toLowerCase() === activeKnife) {
        $this.children().each(function(){
          if($(this).attr('data-title') !== undefined) {
            knifeArray.push({
              type: $(this).attr('class'),
              title: $(this).attr('data-title').toLowerCase(),
              description: $(this).find('.description').text(),
              price: $(this).attr('data-price')
            });
          }
        })

        getElementInfo('#bladeSteel','.steel-item', 'steel');
        getElementInfo('#bladeGeometry','.step-item', 'geometry');
        getElementInfo('#bladeFinish','.finish-item', 'finish');

        addLabels('.leatherSpacers .color','Leather Spacers');
        addLabels('.discs .color','Discs');
        addLabels('.pommelColors .color','Pommel');
        addLabels('.bolsterColors .color','Bolster');

        function addLabels(colorItems,elType) {
          $this.find(colorItems).each(function(){
            $('.group-section[data-title="'+elType+'"] .color-button').eq($(this).index()).attr('data-label', $(this).text());
          })
        }

        let activeLsLabel = $('.group-section[data-title="Leather Spacers"] .color-button.active').attr('data-label');
        let activePommelLabel = $('.group-section[data-title="Pommel"] .color-button.active').attr('data-label');
        let activeBolsterLabel = $('.group-section[data-title="Bolster"] .color-button.active').attr('data-label');

        let pommelMaterial = $('.group-section[data-title="Pommel"] .color-button.active').attr('data-material');
        let bolsterMaterial = $('.group-section[data-title="Bolster"] .color-button.active').attr('data-material');

        let activeKnife = $('.bespoke-product.active').attr('data-title').toLowerCase();
        if (pommelMaterial === 'brass') {
          let pommelPrice = $('.bespoke-knife[data-knife="'+activeKnife+'"] div.pommel[data-title=brass]').attr('data-price');
          $('.group-section[data-title="Pommel"]').append('<div class="section-price">+'+window.currency_symbol+pommelPrice+'</div>');
        }
        if (bolsterMaterial === 'brass') {
          let bolsterPrice = $('.bespoke-knife[data-knife="'+activeKnife+'"] div.pommel[data-title=brass]').attr('data-price');
          $('.group-section[data-title="Bolster"]').append('<div class="section-price">+'+window.currency_symbol+bolsterPrice+'</div>');
        }

        $('.group-section[data-title="Leather Spacers"] .group-header span').text('('+activeLsLabel+')');
        $('.group-section[data-title="Pommel"] .group-header span').text('('+activePommelLabel+')');
        $('.group-section[data-title="Bolster"] .group-header span').text('('+activeBolsterLabel+')');
      }
    })
    function getElementInfo(element, item, type){
      $(element).find(item).each(function(){
        let itemTitle = $(this).find('input').val().toLowerCase();
        let itemDiv = $('.bespoke-knife[data-knife="'+activeKnife+'"] div.'+type+'[data-title="'+itemTitle+'"]');

        let itemDescription = itemDiv.find('.description').html();
        let itemPrice = parseInt(itemDiv.attr('data-price'));

        if($(this).find('.el-description').length) {
          $(this).find('.el-description').remove();
        }
        if($(this).find('.el-price').length) {
          $(this).find('.el-price').remove();
        }

        $(this).find('label').append('<div class="el-description">'+itemDescription+'</div>');
        if(itemPrice > 0){
          $(this).find('label').append('<div class="el-price">+'+window.currency_symbol+itemPrice+'</div>');
        }
      })
    }
  }

  function buildUrl(){
    if(document.querySelector('.bespoke-product.active')) {
      let knife = document.querySelector('.bespoke-product.active').getAttribute('data-handle');
      let steel = document.querySelector('#bladeSteel input:checked').getAttribute('id');
      let geometry = document.querySelector('#bladeGeometry input:checked').getAttribute('id');
      let finish = document.querySelector('#bladeFinish input:checked').getAttribute('id');
      let logic = document.querySelector('#handleDesign .model-selector input:checked').getAttribute('id');

      let allLeather = document.querySelectorAll('.group-section[data-title="Leather Spacers"] .color-button.active');
      let leatherArr = [];
      allLeather.forEach(button => {
        leatherArr.push(button.getAttribute('data-label'));
      });
      let leather = leatherArr.join('_');

      let allColors = document.querySelectorAll('.group-section[data-title="Discs"] .color-button.active');
      let colorsArr = [];
      allColors.forEach(button => {
        colorsArr.push(button.getAttribute('data-label'));
      });
      let colors = colorsArr.join('_');

      let pommel = document.querySelector('.group-section[data-title="Pommel"] .color-button.active').getAttribute('data-label');
      let bolster = document.querySelector('.group-section[data-title="Bolster"] .color-button.active').getAttribute('data-label');
      let laser = document.querySelector('#laserEngraving input:checked').getAttribute('id');
      if(laser === 'laser-engraving') {
        laser = document.querySelector('#laserEngraving label[for="laser-engraving"] input').value;
      }

      let allAddons = document.querySelectorAll('#optionalAddons input:checked');
      let addonsArr = Array.from(allAddons).map(input => input.id);
      let addons = addonsArr.join('_');
      let addonsPart = ''
      if(addons.length > 0) {
        addonsPart = '&addons='+addons;
      }

      // console.log('chosen LEATHER', leather);

      bespokeUrl = 'knife='+knife+
              '&steel='+steel+
              '&geometry='+geometry+
              '&finish='+finish+
              '&logic='+logic+
              '&leather='+leather+
              '&colors='+colors+
              '&pommel='+pommel+
              '&bolster='+bolster+
              '&laser='+laser+
              addonsPart;
    }
  }
  function laserStep(){
    let laserEngravingProduct = document.querySelector('.bespoke-list .bespoke-laser');
    let laserEngravingPrice = parseInt(laserEngravingProduct.dataset.price)/100;
    let laserEngravingId = laserEngravingProduct.dataset.id;
    let laserEngravingHandle = laserEngravingProduct.dataset.handle;

    let laserHtml =

            document.querySelector('#laserEngraving').innerHTML = '<h2 class="section-title">Laser Engraving</h2>'+
                    '<div class="laser-selector">' +
                    '<h3>Choose one</h3>'+
                    '<ul>' +
                    '<li>' +
                    '<input type="radio" name="engraving" id="no-engraving" checked>' +
                    '<label for="no-engraving">' +
                    '<span>Keep it clean</span>' +
                    '<span class="price">+'+window.currency_symbol+'0</span>' +
                    '</label>' +
                    '</li>'+
                    '<li data-id="'+laserEngravingId+'" data-handle="'+laserEngravingHandle+'">' +
                    '<input type="radio" name="engraving" id="laser-engraving">' +
                    '<label for="laser-engraving">' +
                    '<span>Laser engraving</span>' +
                    '<input type="text" placeholder="Type your engraving here" style="display:none;"/>'+
                    '<span class="price">+'+window.currency_symbol+laserEngravingPrice+'</span>' +
                    '</label>' +
                    '</li>'+
                    '</ul>' +
                    '</div>';

    // Get all input elements with the name "engraving"
    const engravingInputs = document.querySelectorAll('input[name="engraving"]');

    $('.bespoke-step .laser-selector > ul li label > input[type="text"]').on('click', function(){
      $(this).parent().trigger('click');
    });

    // Add an event listener to each input element
    engravingInputs.forEach(input => {
      input.addEventListener('change', function() {
        if (chosenProductVariants) {
          let bladeSteel = document.querySelector('#bladeSteel input:checked');
          let bladeFinish = document.querySelector('#bladeFinish input:checked');
          let bladeGeometry = document.querySelector('#bladeGeometry input:checked');

          let pommelMaterial = document.querySelector('.group-section[data-title="Pommel"] button.active').getAttribute('data-material');
          let bolsterMaterial = document.querySelector('.group-section[data-title="Bolster"] button.active').getAttribute('data-material');

          let bespokeChosenMaterial;
          if (pommelMaterial === 'metal' && bolsterMaterial === 'metal') {
            bespokeChosenMaterial = 'Metal';
          } else if (pommelMaterial === 'brass' && bolsterMaterial === 'brass') {
            bespokeChosenMaterial = 'Brass';
          } else if ((pommelMaterial === 'metal' && bolsterMaterial === 'brass') || (pommelMaterial === 'brass' && bolsterMaterial === 'metal')) {
            bespokeChosenMaterial = 'Metal | Brass';
          }

          if (bladeSteel && bladeFinish && bladeGeometry) {
            newVariant = bladeSteel.value + ' | ' + bladeFinish.value +
                    ' / ' + bladeGeometry.value +
                    ' / ' + bespokeChosenMaterial;
          }
          getNewPrice(newVariant);
          buildUrl();
        }
      });
    });
    document.querySelector('label[for="laser-engraving"] input').onchange = function() {
      buildUrl();
    };
  } */
</script>
<script>
  console.log('Шаг 1: Начало инициализации UI');

  // Constants for configuration
  let fetchData;
  let sectionData;
  let initialize = 0;
  let bespokeUrl;
  let firstVariant;
  let newVariant;
  let productNewPrice;
  let target_collection_name = 'Chef';
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

  const modelColorStates = {
    handles: {},
    blades: {}
  };


  // MARINA 20/01/2025

  function getSectionData(){
    const groupSections = document.querySelectorAll('#handleDesign .groups-container .group-section');
    const groupSectionsArray = Array.from(groupSections);
    const filteredSections = groupSectionsArray.filter(section => section.getAttribute('data-title') !== "Rivet");

    sectionData = filteredSections.map(section => {
      let sectionTitle = section.getAttribute('data-title');
      let activeButtons = Array.from(section.querySelectorAll('.color-button.active'));
      console.log('ACTIVE BUTTONS', activeButtons);
      let activeButtonBackground= activeButtons.map(button => getComputedStyle(button).backgroundColor);

      return {
        name: sectionTitle,
        activeButtonBackground: activeButtonBackground
      };
    });
    console.log('SECTION DATA', sectionData);
  }
  function processSectionData(data) {
    console.log('processSectionData function init');

    if (data.length > 0) {
      let currentLogic = document.querySelector('#handleDesign .model-selector input:checked').getAttribute('id');
      // console.log('current logic',currentLogic);
      // console.log('data', data);

      data.forEach(section => {
        if (section.activeButtonBackground && Array.isArray(section.activeButtonBackground)) {
          section.activeButtonBackground.forEach((color) => {
            // Extract RGB values and convert them to hex
            const rgbValues = color.match(/\d+/g).map(Number);
            const hexColor = rgbToHex(rgbValues[0], rgbValues[1], rgbValues[2]);

            // Assign hex color to section or perform other operations
            section.hex = section.hex || [];
            if (!section.hex.includes(hexColor)) {
              section.hex.push(hexColor);
            }
          });
        }

        // const sectionColors = section.activeButtonBackground;
        // sectionColors.forEach(colors => {
        //   console.log('COLORS', colors);
        //   // Extract RGB values from the string
        //   const rgbValues = colors.backgroundColor.match(/\d+/g).map(Number);
        //   const hexColor = rgbToHex(rgbValues[0], rgbValues[1], rgbValues[2]);
        //   // console.log('HEX',hexColor);
        //   // console.log('colors',colors);
        //   // console.log('background',colors.backgroundColor);
        //
        //   // colors.color = hexColor;
        //   colors.hex = hexColor;
        //
        //   // Remove backgroundColor property
        //   delete colors.backgroundColor;
        // });
      });

      if (fetchData) {
        let targetCollection = fetchData.find(c => c.name === target_collection_name);

        if (targetCollection && targetCollection.items) {
          let handlesModels = targetCollection.items.filter(item => item.modelType === 'handles');

          if (handlesModels.length === 0) {
            throw new Error('No handles models found in collection');
          } else {
            handlesModels.forEach(handle => {
              if (currentLogic === handle.textFileName.toLowerCase()) {
                const matchingRefGroups = [];

                data.forEach(section => {
                  const sectionName = section.name;
                  const matchingRefGroup = handle.refGroups.find(refGroup => refGroup.name === sectionName);

                  // console.log('CHOSEN section', section);
                  // console.log('CHOSEN HEX', section.hex);

                  function findMatchingMaterial(materialArray, targetColor) {
                    const matchingMaterial = materialArray.find(material => material.colors.includes(targetColor));
                    return matchingMaterial;
                  }

                  section.hex.forEach((hexColor) => {
                    const chosenMaterial = findMatchingMaterial(matchingRefGroup.groupedNodes[0].settingsData.difmaps, hexColor);
                    if (chosenMaterial) {
                      let activeColorObject = {
                        color: hexColor,
                        metalness: chosenMaterial.metalness,
                        roughness: chosenMaterial.roughness,
                        texture: chosenMaterial.textures
                      }
                      console.log(sectionName, activeColorObject);
                    } else {
                      console.log("No material found with color", hexColor);
                    }
                  });
                });
              }
            });
          }
        } else {
          throw new Error(`Collection with ID ${target_collection_name} not found`);
        }
      } else {
        throw new Error('No collections available');
      }
    }
  }
  function rgbToHex(r, g, b) {
    return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b);
  }
  function componentToHex(c) {
    const hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
  }

  // MARINA 20/01/2025



  console.log('Шаг 2: Инициализация массивов', {
    steelTypes,
    steelArr,
    sortedSteel,
    finishSet
  });

  let modelChangeLeather = '';
  let modelChangeColors = '';
  let modelChangePommel = '';
  let modelChangeBolster = '';

  console.log('Шаг 3: Инициализация переменных для отслеживания изменений модели', {
    modelChangeLeather,
    modelChangeColors,
    modelChangePommel,
    modelChangeBolster
  });

  let chosenProductVariants;

  const materialSelections = {
    handles: {},
    blades: {},
    activeColors: {}
  };

  console.log('Шаг 4: Создание объекта materialSelections', materialSelections);


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
      console.log('Шаг 5: Создание экземпляра ModelSettingsUI', {
        container: container?.id,
        modelType,
        dataItems: data?.items?.length
      });
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
        console.log('Шаг 6: Событие reinitialize вызвано');
        this.init();
      });
      this.init();
    }

    init() {
      console.log('Шаг 7: Инициализация ModelSettingsUI');
      console.log('=== ПЕРЕДАЧА ДАННЫХ В REACT: Инициализация ===');
      console.log('ShopifyConnect статус:', {
        window: !!window.shopifyConnectInstance,
        document: !!document.shopifyConnect
      });

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

        console.log('Сформированный объект для передачи:', {
          fileName: firstModel.fileName,
          fileUrl: firstModel.fileUrl,
          modelType: firstModel.modelType,
          nodeMaterials: nodeMaterials
        });

        // Отправка в React через ShopifyConnect
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
          // console.log('Initializing camera to position:', CAMERA);
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
          steelLabel.setAttribute('for', item.split(' ').join('-').toLowerCase());

          const steelRadio = document.createElement('input');
          steelRadio.id = item.split(' ').join('-').toLowerCase();
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
              step3Content.innerHTML = '<h2 class="section-title">Select Blade Finish</h2>';

              const finishSelector = document.createElement('div');
              finishSelector.className = 'model-selector';
              finishSelector.innerHTML = `<h3>Choose one</h3>`;

              const finishItems = document.createElement('div');
              finishItems.className = 'finish-items';

              selectedFinishes.finishes.forEach((finish, index) => {
                const finishItem = document.createElement('div');
                finishItem.className = 'finish-item';

                const finishLabel = document.createElement('label');
                finishLabel.style.display = 'block';
                finishLabel.style.marginBottom = '10px';
                finishLabel.setAttribute('for', finish.name.split(' ').join('-').toLowerCase());

                const finishRadio = document.createElement('input');
                finishRadio.id = finish.name.split(' ').join('-').toLowerCase();
                finishRadio.type = 'radio';
                finishRadio.name = 'model-finish';
                finishRadio.value = finish.name;
                finishRadio.checked = index === 0;

                finishRadio.onchange = () => {
                  if (finishRadio.checked) {
                    this.updateMaterialTexture(finish);
                  }

                  if (chosenProductVariants) {
                    let bladeSteel = document.querySelector('#bladeSteel input:checked');
                    let bladeFinish = document.querySelector('#bladeFinish input:checked');
                    let bladeGeometry = document.querySelector('#bladeGeometry input:checked');

                    let pommelMaterial = document.querySelector('.group-section[data-title="Pommel"] button.active').getAttribute('data-material');
                    let bolsterMaterial = document.querySelector('.group-section[data-title="Bolster"] button.active').getAttribute('data-material');

                    let bespokeChosenMaterial;
                    if (pommelMaterial === 'metal' && bolsterMaterial === 'metal') {
                      bespokeChosenMaterial = 'Metal';
                    } else if (pommelMaterial === 'brass' && bolsterMaterial === 'brass') {
                      bespokeChosenMaterial = 'Brass';
                    } else if ((pommelMaterial === 'metal' && bolsterMaterial === 'brass') || (pommelMaterial === 'brass' && bolsterMaterial === 'metal')) {
                      bespokeChosenMaterial = 'Metal | Brass';
                    }

                    if (bladeSteel && bladeFinish && bladeGeometry) {
                      newVariant = bladeSteel.value + ' | ' + bladeFinish.value +
                              ' / ' + bladeGeometry.value +
                              ' / ' + bespokeChosenMaterial;
                    }
                    getNewPrice(newVariant);
                    buildUrl();
                  }
                };

                // let finishPreview = '';
                // if (finish.textures?.[0]?.url) {
                //   finishPreview = `<div class="finish-preview">
                //     <img src="${finish.textures[0].url}" alt="${finish.name}" style="width: 50px; height: 50px; object-fit: cover;">
                //   </div>`;
                // }

                finishItem.appendChild(finishRadio);
                finishItem.appendChild(finishLabel);
                finishLabel.appendChild(document.createTextNode(` ${finish.name}`));
                // if (finishPreview) {
                //   finishLabel.insertAdjacentHTML('beforeend', finishPreview);
                // }
                finishItems.appendChild(finishItem);
              });

              finishSelector.appendChild(finishItems);
              step3Content.appendChild(finishSelector);

              if (selectedFinishes.finishes[0]) {
                this.updateMaterialTexture(selectedFinishes.finishes[0]);
              }
            }

            if (chosenProductVariants) {
              let bladeSteel = document.querySelector('#bladeSteel input:checked');
              let bladeFinish = document.querySelector('#bladeFinish input:checked');
              let bladeGeometry = document.querySelector('#bladeGeometry input:checked');

              let pommelMaterial = document.querySelector('.group-section[data-title="Pommel"] button.active').getAttribute('data-material');
              let bolsterMaterial = document.querySelector('.group-section[data-title="Bolster"] button.active').getAttribute('data-material');

              let bespokeChosenMaterial;
              if (pommelMaterial === 'metal' && bolsterMaterial === 'metal') {
                bespokeChosenMaterial = 'Metal';
              } else if (pommelMaterial === 'brass' && bolsterMaterial === 'brass') {
                bespokeChosenMaterial = 'Brass';
              } else if ((pommelMaterial === 'metal' && bolsterMaterial === 'brass') || (pommelMaterial === 'brass' && bolsterMaterial === 'metal')) {
                bespokeChosenMaterial = 'Metal | Brass';
              }

              if (bladeSteel && bladeFinish && bladeGeometry) {
                newVariant = bladeSteel.value + ' | ' + bladeFinish.value +
                        ' / ' + bladeGeometry.value +
                        ' / ' + bespokeChosenMaterial;
              }
              getNewPrice(newVariant);
            }

            buildUrl();
          };

          if(index === 0) {
            steelRadio.dispatchEvent(new Event('change'));
          }

          steelItem.appendChild(steelRadio);
          steelItem.appendChild(steelLabel);
          steelLabel.appendChild(document.createTextNode(` ${item}`));
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
        label.setAttribute('for', item.textFileName.split(' ').join('-').toLowerCase());

        // Creates a radio button for selecting the model
        const radio = document.createElement('input');
        radio.id = item.textFileName.split(' ').join('-').toLowerCase();
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

          modelChangePommel = document.querySelector('.group-section[data-title="Pommel"] .color-button.active').getAttribute('data-label');
          modelChangeBolster = document.querySelector('.group-section[data-title="Bolster"] .color-button.active').getAttribute('data-label');

          let allModelLeather = document.querySelectorAll('.group-section[data-title="Leather Spacers"] .color-button.active');
          let leatherModelArr = [];
          allModelLeather.forEach(button => {
            leatherModelArr.push(button.getAttribute('data-label'));
          });
          modelChangeLeather = leatherModelArr.join(', ');

          let allModelColors = document.querySelectorAll('.group-section[data-title="Discs"] .color-button.active');
          let colorsModelArr = [];
          allModelColors.forEach(button => {
            colorsModelArr.push(button.getAttribute('data-label'));
          });
          modelChangeColors = colorsModelArr.join(', ');

          // Сохраняем текущие активные цвета перед сменой модели
          const currentActiveColors = materialSelections.activeColors[this.type]
                  ? { ...materialSelections.activeColors[this.type] }
                  : {};

          this.selectModel(newFileName);

          // После рендеринга новой модели восстанавливаем активные цвета
          requestAnimationFrame(() => {
            // console.log('ANIMATION FRAME 1');

            processSectionData(sectionData);

            // if (Object.keys(currentActiveColors).length > 0) {
            //   Object.entries(currentActiveColors).forEach(([groupId, colors]) => {
            //     const colorOptions = document.querySelector(`[data-group-id="${groupId}"] .color-options`);
            //     if (colorOptions) {
            //
            //       const buttons = colorOptions.querySelectorAll('.color-button');
            //       const availableColors = Array.from(buttons).map(btn => btn.style.backgroundColor);
            //
            //       // Активируем только те цвета, которые доступны в новой модели
            //       buttons.forEach(button => {
            //         const buttonColor = button.style.backgroundColor;
            //         if (colors.includes(buttonColor)) {
            //           button.classList.add('active');
            //         }
            //       });
            //
            //       // Обновляем настройки с восстановленными цветами
            //       const activeButtons = Array.from(colorOptions.querySelectorAll('.color-button.active'))
            //         .map(button => button.style.backgroundColor);
            //
            //       if (activeButtons.length > 0) {
            //         updateMaterialSelections(this.type, {}, {
            //           [groupId]: activeButtons
            //         });
            //         this.updateSettings(groupId, 'colors', activeButtons);
            //       }
            //     }
            //   });
            // }

            // document.querySelectorAll('.group-section[data-title="Leather Spacers"] .color-button').forEach(button => {
            //   button.classList.remove('active');
            // });
            // document.querySelector('.group-section[data-title="Leather Spacers"] .color-button[data-label="'+modelLeather+'"]').click();

            // console.log('MODEL CHANGE POMMEL 2', modelChangePommel);
            // console.log('MODEL CHANGE BOLSTER 2', modelChangeBolster);

            document.querySelectorAll('.group-section[data-title="Pommel"] .color-button').forEach(button => {
              button.classList.remove('active');
            });
            document.querySelector('.group-section[data-title="Pommel"] .color-button[data-label="'+modelChangePommel+'"]').click();

            document.querySelectorAll('.group-section[data-title="Bolster"] .color-button').forEach(button => {
              button.classList.remove('active');
            });
            document.querySelector('.group-section[data-title="Bolster"] .color-button[data-label="'+modelChangeBolster+'"]').click();

          });

          if (chosenProductVariants) {
            let bladeSteel = document.querySelector('#bladeSteel input:checked');
            let bladeFinish = document.querySelector('#bladeFinish input:checked');
            let bladeGeometry = document.querySelector('#bladeGeometry input:checked');

            let pommelMaterial = document.querySelector('.group-section[data-title="Pommel"] button.active').getAttribute('data-material');
            let bolsterMaterial = document.querySelector('.group-section[data-title="Bolster"] button.active').getAttribute('data-material');

            let bespokeChosenMaterial;
            if (pommelMaterial === 'metal' && bolsterMaterial === 'metal') {
              bespokeChosenMaterial = 'Metal';
            } else if (pommelMaterial === 'brass' && bolsterMaterial === 'brass') {
              bespokeChosenMaterial = 'Brass';
            } else if ((pommelMaterial === 'metal' && bolsterMaterial === 'brass') || (pommelMaterial === 'brass' && bolsterMaterial === 'metal')) {
              bespokeChosenMaterial = 'Metal | Brass';
            }

            if (bladeSteel && bladeFinish && bladeGeometry) {
              newVariant = bladeSteel.value + ' | ' + bladeFinish.value +
                      ' / ' + bladeGeometry.value +
                      ' / ' + bespokeChosenMaterial;
            }
            getNewPrice(newVariant);
            buildUrl();
          }
        };

        // Appends the radio button and model name to the label
        stepItem.appendChild(radio);
        // Adds the label to the model option element
        stepItem.appendChild(label);
        label.appendChild(document.createTextNode(` ${item.textFileName}`));

        // Adds the model option element to the container
        stepItems.appendChild(stepItem);
      });

      // Adds the container for model options to the selector
      modelSelector.appendChild(stepItems);

      // Appends the model selector to the appropriate container based on type
      if (this.type === 'blades') {
        document.getElementById('bladeSteel').innerHTML = '<h2 class="section-title">Select Steel</h2>';
        document.getElementById('bladeGeometry').innerHTML = '<h2 class="section-title">Select Blade Geometry</h2>';
        document.getElementById('bladeSteel').appendChild(steelSelector);
        document.getElementById('bladeGeometry').appendChild(modelSelector);

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
        document.getElementById('handleDesign').innerHTML = '<h2 class="section-title">Design Handle</h2>';
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
      getSectionData();

      // console.log('selectModel called with:', fileName);
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
          // console.log('ANIMATION FRAME 2');

          processSectionData(sectionData);

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

      if($('.bespoke-product.active').length) {
        let activeKnife = $('.bespoke-product.active').attr('data-title').toLowerCase();
        $('.bespoke-knife').each(function(){
          let $this = $(this);
          if($this.attr('data-knife').toLowerCase() === activeKnife) {
            addLabels('.leatherSpacers .color','Leather Spacers');
            addLabels('.discs .color','Discs');
            addLabels('.pommelColors .color','Pommel');
            addLabels('.bolsterColors .color','Bolster');

            function addLabels(colorItems,elType) {
              $this.find(colorItems).each(function(){
                $('.group-section[data-title="'+elType+'"] .color-button').eq($(this).index()).attr('data-label', $(this).text());
              })
            }

            let activeLsLabel = $('.group-section[data-title="Leather Spacers"] .color-button.active').attr('data-label');
            let activePommelLabel = $('.group-section[data-title="Pommel"] .color-button.active').attr('data-label');
            let activeBolsterLabel = $('.group-section[data-title="Bolster"] .color-button.active').attr('data-label');

            $('.group-section[data-title="Leather Spacers"] .group-header span').text('('+activeLsLabel+')');
            $('.group-section[data-title="Pommel"] .group-header span').text('('+activePommelLabel+')');
            $('.group-section[data-title="Bolster"] .group-header span').text('('+activeBolsterLabel+')');
          }
        })
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
        groupHeader.innerHTML = group.name+'<span></span>';
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
              elementColors.push(color+'/'+material.name.toLowerCase());
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
            colorButton.style.backgroundColor = color.split('/')[0];
            colorButton.dataset.material = color.split('/')[1];

            // Устанавливаем активное состояние на основе сохраненных цветов
            if (savedActiveColors.length > 0 && savedActiveColors.includes(color.split('/')[0])) {
              colorButton.classList.add('active');
            } else if (savedActiveColors.length === 0 && index === 0) {
              colorButton.classList.add('active');
            }

            $(colorButton).on('mouseenter', function() {
              const $closestGroupSection = $(this).closest('.group-section');
              const dataTitle = $closestGroupSection.data('title');

              if(dataTitle === 'Discs') {
                $closestGroupSection.find('.group-header span').text('('+$(this).attr('data-label')+')');
              }

              let activeKnife = $('.bespoke-product.active').attr('data-title').toLowerCase();
              if (dataTitle === 'Pommel' && $(this).attr('data-material') === 'brass') {
                let pommelPrice = $('.bespoke-knife[data-knife="'+activeKnife+'"] div.pommel[data-title=brass]').attr('data-price');

                if ($closestGroupSection.find('.section-price').length === 0) {
                  $closestGroupSection.append('<div class="section-price">+'+window.currency_symbol+pommelPrice+'</div>');
                }
              }else if (dataTitle === 'Bolster' && $(this).attr('data-material') === 'brass') {
                let bolsterPrice = $('.bespoke-knife[data-knife="'+activeKnife+'"] div.pommel[data-title=brass]').attr('data-price');
                if ($closestGroupSection.find('.section-price').length === 0) {
                  $closestGroupSection.append('<div class="section-price">+'+window.currency_symbol+bolsterPrice+'</div>');
                }
              }
            });
            $(colorButton).on('mouseleave', function() {
              const $closestGroupSection = $(this).closest('.group-section');
              const dataTitle = $closestGroupSection.data('title');

              if(dataTitle === 'Discs') {
                $closestGroupSection.find('.group-header span').text('');
              }

              if(!$(this).hasClass('active') && $(this).attr('data-material') === 'brass') {
                $closestGroupSection.find('.section-price').remove();
              }
            });


            // Остальной код обработчика клика остается без изменений...
            colorButton.onclick = (e) => {
              const closestGroupSection = colorButton.closest('.group-section');
              const dataTitle = closestGroupSection.getAttribute('data-title');
              if (dataTitle === 'Bolster' || dataTitle === 'Pommel') {
                closestGroupSection.querySelector('.group-header span').textContent = '('+colorButton.getAttribute('data-label')+')';

                const buttonGroup = colorButton.parentNode;
                Array.from(buttonGroup.children).forEach(child => {
                  child.classList.remove('active');
                });
                colorButton.classList.add('active');

                if($(colorButton).attr('data-material') !== 'brass') {
                  $(closestGroupSection).find('.section-price').remove();
                }
              } else {
                colorButton.classList.toggle('active');
              }

              const activeButtons = Array.from(colorOptions.querySelectorAll('.color-button.active'))
                      .map(button => button.style.backgroundColor);

              updateMaterialSelections(this.type, {}, {
                [group.id]: activeButtons
              });

              this.updateSettings(group.id, 'colors', activeButtons);

              if (dataTitle === 'Leather Spacers') {
                let activeButtons = closestGroupSection.querySelectorAll('.color-button.active');
                let activeLS = []
                activeButtons.forEach(button => {
                  const dataLabel = button.getAttribute('data-label');
                  activeLS.push(dataLabel);
                });
                closestGroupSection.querySelector('.group-header span').textContent = '('+activeLS.join(', ')+')';
              }

              if (chosenProductVariants) {
                let bladeSteel = document.querySelector('#bladeSteel input:checked');
                let bladeFinish = document.querySelector('#bladeFinish input:checked');
                let bladeGeometry = document.querySelector('#bladeGeometry input:checked');

                let pommelMaterial = document.querySelector('.group-section[data-title="Pommel"] button.active').getAttribute('data-material');
                let bolsterMaterial = document.querySelector('.group-section[data-title="Bolster"] button.active').getAttribute('data-material');

                let bespokeChosenMaterial;
                if (pommelMaterial === 'metal' && bolsterMaterial === 'metal') {
                  bespokeChosenMaterial = 'Metal';
                } else if (pommelMaterial === 'brass' && bolsterMaterial === 'brass') {
                  bespokeChosenMaterial = 'Brass';
                } else if ((pommelMaterial === 'metal' && bolsterMaterial === 'brass') || (pommelMaterial === 'brass' && bolsterMaterial === 'metal')) {
                  bespokeChosenMaterial = 'Metal | Brass';
                }

                if (bladeSteel && bladeFinish && bladeGeometry) {
                  newVariant = bladeSteel.value + ' | ' + bladeFinish.value +
                          ' / ' + bladeGeometry.value +
                          ' / ' + bespokeChosenMaterial;
                }
                getNewPrice(newVariant);
              }
              buildUrl();
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
      console.log('=== ПЕРЕДАЧА ДАННЫХ В REACT: Обновление настроек ===');

      if (!this.activeGroups.has(groupId)) {
        this.activeGroups.set(groupId, {});
      }
      // console.log('this.activeGroups', this.activeGroups);
      const groupSettings = this.activeGroups.get(groupId);
      const group = this.activeModel.refGroups.find(g => g.id === groupId);
      const groupData = group?.groupedNodes?.[0];

      if (group && groupData?.settingsData) {
        if (this.rafId) {
          cancelAnimationFrame(this.rafId);
        }

        this.rafId = requestAnimationFrame(() => {
          // console.log('ANIMATION FRAME 3');

          processSectionData(sectionData);

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

            console.log('Обновленный объект для передачи:', {
              fileName: this.activeModel.fileName,
              fileUrl: this.activeModel.fileUrl,
              modelType: this.activeModel.modelType,
              nodeMaterials: currentNodeMaterials
            });

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

          // Отправка обновленных данных в React
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
  function getNewPrice(chosenVariant) {

    const foundVariant = chosenProductVariants.find(
            (variant) => {
              return variant.title.toLowerCase() === chosenVariant.toLowerCase();
            }
    );

    let bladeEngraving = document.querySelector('#laserEngraving input:checked').id;
    let engravingPrice = 0;

    if(bladeEngraving === 'laser-engraving') {
      engravingPrice = parseInt($('.bespoke-laser').attr('data-price'))/100;
    }

    let addonsPrice = 0;
    if($('#optionalAddons').find('.addon').length > 0) {
      $('#optionalAddons').find('.addon').each(function(){
        if($(this).find('input[type="checkbox"]').is(':checked')){
          addonsPrice += parseInt($(this).attr('data-price'));
        }
      })
    }

    if (foundVariant) {
      const productPrices = foundVariant.presentmentPrices.nodes;
      const priceInCurrency = productPrices.find(
              (price) => price.price.currencyCode === window.currency
      );


      if (priceInCurrency) {
        const productNewPrice =
                window.currency_symbol + (parseInt(priceInCurrency.price.amount)+engravingPrice+addonsPrice);
        const subtotalElement = document.querySelector('.cf-subtotal span.subtotal-price');
        subtotalElement.textContent = productNewPrice;
      }
    }
  }

  // В initializeUI происходит загрузка коллекции и глобальных настроек
  function initializeUI() {

    console.log('Шаг 8: Начало инициализации UI');

    const startUI = () => {
      addResetButton();

      // Загружаем сохраненное состояние
      loadMaterialSelectionsState();


      const handleContainer = document.getElementById('handleContainer');
      const bladeContainer = document.getElementById('bladeContainer');

      console.log('Шаг 9: Получение контейнеров', {
        handleContainer: !!handleContainer,
        bladeContainer: !!bladeContainer
      });

      if (!handleContainer || !bladeContainer || !bladeGeometry) {
        console.error('Container elements not found');
        return;
      }

      fetch('{{ "A_all-collections-data.json" | asset_url }}')
              .then(response => response.json())
              .then(data => {
                console.log('=== ПЕРЕДАЧА ДАННЫХ В REACT: Загрузка коллекции ===', data);
                if (data && data.collections) {
                  fetchData = data.collections;

                  const targetCollection = data.collections.find(c => c.name === target_collection_name);

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

                    laserStep();

                    let pommelMaterial = document.querySelector('.group-section[data-title="Pommel"] button.active').getAttribute('data-material');
                    let bolsterMaterial = document.querySelector('.group-section[data-title="Bolster"] button.active').getAttribute('data-material');

                    let bespokeChosenMaterial;
                    if (pommelMaterial === 'metal' && bolsterMaterial === 'metal') {
                      bespokeChosenMaterial = 'Metal';
                    } else if (pommelMaterial === 'brass' && bolsterMaterial === 'brass') {
                      bespokeChosenMaterial = 'Brass';
                    } else if ((pommelMaterial === 'metal' && bolsterMaterial === 'brass') || (pommelMaterial === 'brass' && bolsterMaterial === 'metal')) {
                      bespokeChosenMaterial = 'Metal | Brass';
                    }

                    firstVariant = $('#bladeSteel input:checked').val()+' | '+$('#bladeFinish input:checked').val()+' / '+$('#bladeGeometry input:checked').val() + ' / ' + bespokeChosenMaterial;

                    if (window.location.search && initialize === 0) {
                      let search = window.location.search.split('?')[1].split('&');

                      let knife = search[0].split('=')[1];
                      $('.bespoke-product[data-handle="'+knife+'"]').trigger('click');

                      setTimeout(function(){
                        for(let i = 1; i < search.length; i++) {
                          let knifeEl = search[i].split('=');

                          if(knifeEl[0] === 'steel') {
                            $('#bladeSteel label[for="'+knifeEl[1]+'"]').trigger('click');
                          }
                          if(knifeEl[0] === 'geometry') {
                            $('#bladeGeometry label[for="'+knifeEl[1]+'"]').trigger('click');
                          }
                          if(knifeEl[0] === 'finish') {
                            $('#bladeFinish label[for="'+knifeEl[1]+'"]').trigger('click');
                          }
                          if(knifeEl[0] === 'logic') {
                            $('#handleDesign label[for="'+knifeEl[1]+'"]').trigger('click');
                          }
                          if(knifeEl[0] === 'leather') {
                            $('.group-section[data-title="Leather Spacers"] button.active').removeClass('active');
                            let leatherList = knifeEl[1].split('_');
                            for( let j = 0; j < leatherList.length; j++) {
                              $('.group-section[data-title="Leather Spacers"] button[data-label="'+leatherList[j]+'"]:not(.active)').trigger('click');
                            }
                          }
                          if(knifeEl[0] === 'colors') {
                            $('.group-section[data-title="Discs"] button.active').removeClass('active');
                            let colorsList = knifeEl[1].split('_');
                            for( let j = 0; j < colorsList.length; j++) {
                              $('.group-section[data-title="Discs"] button[data-label="'+colorsList[j].split('%20').join(' ')+'"]:not(.active)').trigger('click');
                            }
                          }
                          if(knifeEl[0] === 'pommel') {
                            $('.group-section[data-title="Pommel"] button[data-label="'+knifeEl[1]+'"]:not(.active)').trigger('click');
                          }
                          if(knifeEl[0] === 'bolster') {
                            $('.group-section[data-title="Bolster"] button[data-label="'+knifeEl[1]+'"]:not(.active)').trigger('click');
                          }
                          if(knifeEl[0] === 'laser') {
                            if(knifeEl[1] !== 'no-engraving') {
                              $('#laserEngraving label[for="laser-engraving"]').trigger('click');
                              $('#laserEngraving label[for="laser-engraving"] input').val(knifeEl[1]);
                            }
                          }
                          if(knifeEl[0] === 'addons') {
                            let addonsItems = knifeEl[1].split('_');
                            for( let j = 0; j < addonsItems.length; j++) {
                              $('#optionalAddons .addons-list label[for="'+addonsItems[j]+'"]').trigger('click');
                            }
                          }
                        }
                        if (chosenProductVariants) {
                          let bladeSteel = document.querySelector('#bladeSteel input:checked');
                          let bladeFinish = document.querySelector('#bladeFinish input:checked');
                          let bladeGeometry = document.querySelector('#bladeGeometry input:checked');

                          let pommelMaterial = document.querySelector('.group-section[data-title="Pommel"] button.active').getAttribute('data-material');
                          let bolsterMaterial = document.querySelector('.group-section[data-title="Bolster"] button.active').getAttribute('data-material');

                          let bespokeChosenMaterial;
                          if (pommelMaterial === 'metal' && bolsterMaterial === 'metal') {
                            bespokeChosenMaterial = 'Metal';
                          } else if (pommelMaterial === 'brass' && bolsterMaterial === 'brass') {
                            bespokeChosenMaterial = 'Brass';
                          } else if ((pommelMaterial === 'metal' && bolsterMaterial === 'brass') || (pommelMaterial === 'brass' && bolsterMaterial === 'metal')) {
                            bespokeChosenMaterial = 'Metal | Brass';
                          }

                          if (bladeSteel && bladeFinish && bladeGeometry) {
                            newVariant = bladeSteel.value + ' | ' + bladeFinish.value +
                                    ' / ' + bladeGeometry.value +
                                    ' / ' + bespokeChosenMaterial;
                          }
                          getNewPrice(newVariant);
                        }

                        $('.bcf-cat')[0].click();
                      },500)
                      initialize = 1;
                    }
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

  function customizerSteps(){
    const allSteps = document.querySelectorAll(".bespoke-step");
    const stepCount = allSteps.length;
    const backButton = document.querySelector(".customizer-header .ch-back");
    const nextButton = document.querySelector(".customizer-footer .cf-next");
    const addToCart = document.querySelector(".customizer-footer .cf-add-to-cart");
    const changeButton = document.querySelector(".customizer-header .ch-change");
    const shareButton = document.querySelector(".customizer-header .ch-share");

    allSteps[0].classList.add('active');
    laserStep();

    nextButton.addEventListener("click", () => {
      const activeStep = document.querySelector(".bespoke-step.active");
      if (activeStep) {
        getKnifeInfo();
        const activeStepIndex = Array.from(allSteps).indexOf(activeStep);
        allSteps[activeStepIndex].classList.remove('active');
        allSteps[activeStepIndex + 1].classList.add('active');
        document.querySelector('.customizer-header .ch-back .ch-step span').innerText = activeStepIndex + 2;
        if (activeStepIndex + 2 === 7) {
          nextButton.style.display = 'none';
          addToCart.style.display = 'flex';
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
          addToCart.style.display = 'none';

          document.shopifyConnect.triggerCameraPositionChange(activeStepIndex);
        }
      }
    });
    changeButton.addEventListener("click", () => {
      document.querySelector('body.bespoke-intro .bespoke-customizer').classList.remove('show');
      allSteps.forEach(step => step.classList.remove('active'));
      allSteps[0].classList.add('active');
      laserStep();
      document.querySelector('.customizer-header .ch-back .ch-step span').innerText = '1';
      document.shopifyConnect.triggerCameraPositionChange(1);
      document.querySelector('body.bespoke-intro .bespoke-choice').classList.remove('non-visible');
    });
    shareButton.addEventListener("click", () => {
      shareButton.classList.add('copied');
      copyToClipboard(window.location.href+'?'+bespokeUrl);

      setTimeout(function(name) {
        shareButton.classList.remove('copied');
      }, 1000);
    });
    addToCart.addEventListener("click", () => {
      let bladeSteel = document.querySelector('#bladeSteel input:checked');
      let bladeGeometry = document.querySelector('#bladeGeometry input:checked');
      let bladeFinish = document.querySelector('#bladeFinish input:checked');

      let pommelMaterial = document.querySelector('.group-section[data-title="Pommel"] button.active').getAttribute('data-material');
      let bolsterMaterial = document.querySelector('.group-section[data-title="Bolster"] button.active').getAttribute('data-material');

      let bespokeChosenMaterial;
      if (pommelMaterial === 'metal' && bolsterMaterial === 'metal') {
        bespokeChosenMaterial = 'Metal';
      } else if (pommelMaterial === 'brass' && bolsterMaterial === 'brass') {
        bespokeChosenMaterial = 'Brass';
      } else if ((pommelMaterial === 'metal' && bolsterMaterial === 'brass') || (pommelMaterial === 'brass' && bolsterMaterial === 'metal')) {
        bespokeChosenMaterial = 'Metal | Brass';
      }

      if (bladeSteel && bladeFinish && bladeGeometry) {
        newVariant = bladeSteel.value + ' | ' + bladeFinish.value +
                ' / ' + bladeGeometry.value +
                ' / ' + bespokeChosenMaterial;
      }
      const foundVariant = chosenProductVariants.find(
              (variant) => {
                return variant.title.toLowerCase() === newVariant.toLowerCase();
              }
      );

      let customCartInfo = [];
      let customName = document.querySelector('.bespoke-product.active .bp-title').textContent;
      let customVariant = foundVariant.id;
      let customModel = document.querySelector('.bespoke-product.active').getAttribute('data-handle');
      let customSteel = bladeSteel.value;
      let customGeometry = bladeGeometry.value;
      let customFinish = bladeFinish.value;
      let customPommel = document.querySelector('.group-section[data-title="Pommel"] .color-button.active').getAttribute('data-label');
      let customBolster = document.querySelector('.group-section[data-title="Bolster"] .color-button.active').getAttribute('data-label');
      let customLogic = document.querySelector('#handleDesign .model-selector input:checked').value;
      let customNotes = document.querySelector('#orderNotes textarea').value;
      let customQuantity = 1;

      let checkedInputs = document.querySelectorAll('#optionalAddons input:checked');
      let customAddons = Array.from(checkedInputs).map(input => input.id);

      let customAddonsQuantity = Array.from(document.querySelectorAll('#optionalAddons input:checked')).map(input => input.getAttribute('data-inventory') || null);

      let allLeather = document.querySelectorAll('.group-section[data-title="Leather Spacers"] .color-button.active');
      let leatherArr = [];
      allLeather.forEach(button => {
        leatherArr.push(button.getAttribute('data-label'));
      });
      let customLeather = leatherArr.join(', ');

      let allColors = document.querySelectorAll('.group-section[data-title="Discs"] .color-button.active');
      let colorsArr = [];
      allColors.forEach(button => {
        colorsArr.push(button.getAttribute('data-label'));
      });
      let customColours = colorsArr.join(', ');

      let customLaserEtching = document.querySelector('#laserEngraving input:checked').getAttribute('id');
      let laserProduct = '';
      let formData = {items: []};

      if(customLaserEtching === 'no-engraving') {
        customLaserEtching = 'None';
      }else{
        customLaserEtching = document.querySelector('#laserEngraving label[for="laser-engraving"] input').value;

        let laserId = document.querySelector('.bespoke-list .bespoke-laser').getAttribute('data-id');
        laserProduct = {
          quantity: 1,
          id: laserId
        }
        formData.items.push(laserProduct);
      }
      let customProductItem = {
        quantity: customQuantity,
        id: customVariant.split('/')[4],
        properties: {
          'Name': customName,
          'Model': customModel,
          'Steel': customSteel,
          'Geometry': customGeometry,
          'Finish': customFinish,
          'Leather': customLeather,
          'Pommel': customPommel,
          'Bolster': customBolster,
          'Colours': customColours,
          'Logic': customLogic,
          'Laser Etching': customLaserEtching,
          'Notes': customNotes,
          'Quantity': customQuantity,
        }
      };
      formData.items.push(customProductItem);

      if(customAddons.length > 0) {
        for(let i = 0; i < customAddons.length; i++) {
          formData.items.push({
            quantity: 1,
            id: customAddons[i],
            properties: {
              'Quantity': customAddonsQuantity[i],
            }
          });
        }
      }

      jQuery.ajax({
        type: 'POST',
        url: '/cart/add.js',
        data: formData,
        dataType: 'json',
        success: function() {
          buildCart();
        },
        error: function(response) {
          console.log(response);
        }
      });
    });
  }


  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeUI);
    document.addEventListener('DOMContentLoaded', customizerSteps);
  } else {
    initializeUI();
  }

  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      console.log('Text copied to clipboard:', text);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }
  function buildCart(){
    $.ajax({
      type: 'GET',
      url: '/cart.js',
      cache: false,
      dataType: 'json',
      success: function(cart) {
        console.log('cart is building');
        let cartSubtotal = cart.total_price / 100;
        let cartCount = cart.item_count;

        let cartItems = cart.items;
        let cartHtml = '';
        for(let i = 0; i < cartItems.length; i++) {
          let cartItem = cartItems[i];

          let cartItemProperties = '';
          let cartItemTitle = cartItem.title;
          let cartImage = cartItem.image;
          let cartImageHtml = '';
          if(cartImage !== null) {
            cartImageHtml = '<div class="cartImage"><img src="'+cartItem.image+'" alt="'+cartItem.properties.Name+'"></div>';
          }

          if(Object.keys(cartItem.properties).length > 1) {
            cartItemTitle = cartItem.properties.Name;
            cartItemProperties = '<div class="cartItemProperties">' +
                    '<div class="cartItemModel">Model: '+cartItem.properties.Model+'</div>' +
                    '<div class="cartItemSteel">Steel: '+cartItem.properties.Steel+'</div>' +
                    '<div class="cartItemGeometry">Blade Geometry: '+cartItem.properties.Geometry+'</div>' +
                    '<div class="cartItemFinish">Blade Finish: '+cartItem.properties.Finish+'</div>' +
                    '<div class="cartItemLeather">Handle Leather: '+cartItem.properties.Leather+'</div>' +
                    '<div class="cartItemBolster">Bolster: '+cartItem.properties.Bolster+'</div>' +
                    '<div class="cartItemPommel">Pommel: '+cartItem.properties.Pommel+'</div>' +
                    '<div class="cartItemColours">Handle Colours: '+cartItem.properties.Colours+'</div>' +
                    '<div class="cartItemLaserEtching">Laser Etching: '+cartItem.properties["Laser Etching"]+'</div>' +
                    '<div class="cartItemNotes">Notes: '+cartItem.properties.Notes+'</div>' +
                    '</div>';
          }

          cartHtml += '<div class="cartItem" data-id="'+cartItem.id+'">' +
                  '<div class="cartInfo">' +
                  '<div class="cartItemTitle">'+cartItemTitle+'</div>' +
                  '<div class="cartItemPrice">'+window.currency_symbol+(cartItem.final_line_price / 100)+'</div>' +
                  cartItemProperties +
                  '<div class="cartItemFooter">' +
                  '<div class="cartItemQuantity"><button name="minus"></button><input type="number" value="'+cartItem.quantity+'"><button name="plus"></button></div>' +
                  '<div class="cartItemRemove">/ <button class="remove">Remove</button></div>' +
                  '</div>' +
                  '</div>' +
                  cartImageHtml +
                  '</div>';
        }
        const cartDrawer = document.querySelector('cart-drawer');

        if (cartDrawer) {
          const cartItemsContainer = cartDrawer.querySelector('cart-drawer-items #CartDrawer-CartItems');
          if (cartItemsContainer) {
            cartItemsContainer.innerHTML = `<div class="cart-items">${cartHtml}</div>`;
          }

          cartDrawer.querySelector('.drawer__inner-empty')?.remove();
          cartDrawer.querySelector('cart-drawer-items')?.classList.remove('is-empty');
          cartDrawer.classList.remove('is-empty');

          const cartIcon = document.querySelector('header.header .header__icons a.header__icon.header__icon--cart');
          if (cartIcon) {
            cartIcon.click();
          }

          const cartSubtotalElement = cartDrawer.querySelector('div.cart-drawer .drawer__inner .drawer__footer .totals > p');
          if (cartSubtotalElement) {
            cartSubtotalElement.innerHTML = `${window.currency_symbol}${cartSubtotal}`;
          }
          const checkoutButton = cartDrawer.querySelector('#CartDrawer-Checkout');
          if (checkoutButton) {
            checkoutButton.removeAttribute('disabled');
          }

          document.querySelector('div.cart-drawer .drawer__inner .drawer__header h2.drawer__heading').textContent = 'Cart ('+cartCount+')';
          document.querySelector('header.header .header__icons a.header__icon.header__icon--cart > .cart-count-bubble span:first-child').textContent = cartCount;

          document.querySelector('#CartDrawer .cart-items').addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();

            const target = e.target;
            const cartItemId = target.closest('.cartItem').getAttribute('data-id');

            if (target.classList.contains('remove')) {
              $.ajax({
                url: `/cart/change.js`,
                method: "POST",
                data: { quantity: 0, id: cartItemId },
                success: function(cart) {
                  buildCart();
                }
              });
            } else if (target.matches('button[name="minus"]')) {
              const inputField = target.parentElement.querySelector('input[type="number"]');
              let currentQuantity = parseInt(inputField.value);

              if (currentQuantity > 1) {
                $.ajax({
                  url: `/cart/change.js`,
                  method: "POST",
                  data: { quantity: currentQuantity - 1, id: cartItemId },
                  success: function(cart) {
                    buildCart();
                  }
                });
              }
            } else if (target.matches('button[name="plus"]')) {
              const inputField = target.parentElement.querySelector('input[type="number"]');
              let currentQuantity = parseInt(inputField.value);

              $.ajax({
                url: `/cart/change.js`,
                method: "POST",
                data: { quantity: currentQuantity + 1, id: cartItemId },
                success: function(cart) {
                  buildCart();
                }
              });
            }
          });
        }
      }
    });
  }

  function getKnifeInfo(){
    let activeKnife = $('.bespoke-product.active').attr('data-title').toLowerCase();
    let knifeArray = [];

    $('.bespoke-knife').each(function(){
      let $this = $(this);
      if($this.attr('data-knife').toLowerCase() === activeKnife) {
        $this.children().each(function(){
          if($(this).attr('data-title') !== undefined) {
            knifeArray.push({
              type: $(this).attr('class'),
              title: $(this).attr('data-title').toLowerCase(),
              description: $(this).find('.description').text(),
              price: $(this).attr('data-price')
            });
          }
        })

        getElementInfo('#bladeSteel','.steel-item', 'steel');
        getElementInfo('#bladeGeometry','.step-item', 'geometry');
        getElementInfo('#bladeFinish','.finish-item', 'finish');

        addLabels('.leatherSpacers .color','Leather Spacers');
        addLabels('.discs .color','Discs');
        addLabels('.pommelColors .color','Pommel');
        addLabels('.bolsterColors .color','Bolster');

        function addLabels(colorItems,elType) {
          $this.find(colorItems).each(function(){
            $('.group-section[data-title="'+elType+'"] .color-button').eq($(this).index()).attr('data-label', $(this).text());
          })
        }

        let activeLsLabel = $('.group-section[data-title="Leather Spacers"] .color-button.active').attr('data-label');
        let activePommelLabel = $('.group-section[data-title="Pommel"] .color-button.active').attr('data-label');
        let activeBolsterLabel = $('.group-section[data-title="Bolster"] .color-button.active').attr('data-label');

        let pommelMaterial = $('.group-section[data-title="Pommel"] .color-button.active').attr('data-material');
        let bolsterMaterial = $('.group-section[data-title="Bolster"] .color-button.active').attr('data-material');

        let activeKnife = $('.bespoke-product.active').attr('data-title').toLowerCase();
        if (pommelMaterial === 'brass') {
          let pommelPrice = $('.bespoke-knife[data-knife="'+activeKnife+'"] div.pommel[data-title=brass]').attr('data-price');
          $('.group-section[data-title="Pommel"]').append('<div class="section-price">+'+window.currency_symbol+pommelPrice+'</div>');
        }
        if (bolsterMaterial === 'brass') {
          let bolsterPrice = $('.bespoke-knife[data-knife="'+activeKnife+'"] div.pommel[data-title=brass]').attr('data-price');
          $('.group-section[data-title="Bolster"]').append('<div class="section-price">+'+window.currency_symbol+bolsterPrice+'</div>');
        }

        $('.group-section[data-title="Leather Spacers"] .group-header span').text('('+activeLsLabel+')');
        $('.group-section[data-title="Pommel"] .group-header span').text('('+activePommelLabel+')');
        $('.group-section[data-title="Bolster"] .group-header span').text('('+activeBolsterLabel+')');
      }
    })
    function getElementInfo(element, item, type){
      $(element).find(item).each(function(){
        let itemTitle = $(this).find('input').val().toLowerCase();
        let itemDiv = $('.bespoke-knife[data-knife="'+activeKnife+'"] div.'+type+'[data-title="'+itemTitle+'"]');

        let itemDescription = itemDiv.find('.description').html();
        let itemPrice = parseInt(itemDiv.attr('data-price'));

        if($(this).find('.el-description').length) {
          $(this).find('.el-description').remove();
        }
        if($(this).find('.el-price').length) {
          $(this).find('.el-price').remove();
        }

        $(this).find('label').append('<div class="el-description">'+itemDescription+'</div>');
        if(itemPrice > 0){
          $(this).find('label').append('<div class="el-price">+'+window.currency_symbol+itemPrice+'</div>');
        }
      })
    }
  }

  function buildUrl(){
    if(document.querySelector('.bespoke-product.active')) {
      let knife = document.querySelector('.bespoke-product.active').getAttribute('data-handle');
      let steel = document.querySelector('#bladeSteel input:checked').getAttribute('id');
      let geometry = document.querySelector('#bladeGeometry input:checked').getAttribute('id');
      let finish = document.querySelector('#bladeFinish input:checked').getAttribute('id');
      let logic = document.querySelector('#handleDesign .model-selector input:checked').getAttribute('id');

      let allLeather = document.querySelectorAll('.group-section[data-title="Leather Spacers"] .color-button.active');
      let leatherArr = [];
      allLeather.forEach(button => {
        leatherArr.push(button.getAttribute('data-label'));
      });
      let leather = leatherArr.join('_');

      let allColors = document.querySelectorAll('.group-section[data-title="Discs"] .color-button.active');
      let colorsArr = [];
      allColors.forEach(button => {
        colorsArr.push(button.getAttribute('data-label'));
      });
      let colors = colorsArr.join('_');

      let pommel = document.querySelector('.group-section[data-title="Pommel"] .color-button.active').getAttribute('data-label');
      let bolster = document.querySelector('.group-section[data-title="Bolster"] .color-button.active').getAttribute('data-label');
      let laser = document.querySelector('#laserEngraving input:checked').getAttribute('id');
      if(laser === 'laser-engraving') {
        laser = document.querySelector('#laserEngraving label[for="laser-engraving"] input').value;
      }

      let allAddons = document.querySelectorAll('#optionalAddons input:checked');
      let addonsArr = Array.from(allAddons).map(input => input.id);
      let addons = addonsArr.join('_');
      let addonsPart = ''
      if(addons.length > 0) {
        addonsPart = '&addons='+addons;
      }

      // console.log('chosen LEATHER', leather);

      bespokeUrl = 'knife='+knife+
              '&steel='+steel+
              '&geometry='+geometry+
              '&finish='+finish+
              '&logic='+logic+
              '&leather='+leather+
              '&colors='+colors+
              '&pommel='+pommel+
              '&bolster='+bolster+
              '&laser='+laser+
              addonsPart;
    }
  }
  function laserStep(){
    let laserEngravingProduct = document.querySelector('.bespoke-list .bespoke-laser');
    let laserEngravingPrice = parseInt(laserEngravingProduct.dataset.price)/100;
    let laserEngravingId = laserEngravingProduct.dataset.id;
    let laserEngravingHandle = laserEngravingProduct.dataset.handle;

    let laserHtml =

            document.querySelector('#laserEngraving').innerHTML = '<h2 class="section-title">Laser Engraving</h2>'+
                    '<div class="laser-selector">' +
                    '<h3>Choose one</h3>'+
                    '<ul>' +
                    '<li>' +
                    '<input type="radio" name="engraving" id="no-engraving" checked>' +
                    '<label for="no-engraving">' +
                    '<span>Keep it clean</span>' +
                    '<span class="price">+'+window.currency_symbol+'0</span>' +
                    '</label>' +
                    '</li>'+
                    '<li data-id="'+laserEngravingId+'" data-handle="'+laserEngravingHandle+'">' +
                    '<input type="radio" name="engraving" id="laser-engraving">' +
                    '<label for="laser-engraving">' +
                    '<span>Laser engraving</span>' +
                    '<input type="text" placeholder="Type your engraving here" style="display:none;"/>'+
                    '<span class="price">+'+window.currency_symbol+laserEngravingPrice+'</span>' +
                    '</label>' +
                    '</li>'+
                    '</ul>' +
                    '</div>';

    // Get all input elements with the name "engraving"
    const engravingInputs = document.querySelectorAll('input[name="engraving"]');

    $('.bespoke-step .laser-selector > ul li label > input[type="text"]').on('click', function(){
      $(this).parent().trigger('click');
    });

    // Add an event listener to each input element
    engravingInputs.forEach(input => {
      input.addEventListener('change', function() {
        if (chosenProductVariants) {
          let bladeSteel = document.querySelector('#bladeSteel input:checked');
          let bladeFinish = document.querySelector('#bladeFinish input:checked');
          let bladeGeometry = document.querySelector('#bladeGeometry input:checked');

          let pommelMaterial = document.querySelector('.group-section[data-title="Pommel"] button.active').getAttribute('data-material');
          let bolsterMaterial = document.querySelector('.group-section[data-title="Bolster"] button.active').getAttribute('data-material');

          let bespokeChosenMaterial;
          if (pommelMaterial === 'metal' && bolsterMaterial === 'metal') {
            bespokeChosenMaterial = 'Metal';
          } else if (pommelMaterial === 'brass' && bolsterMaterial === 'brass') {
            bespokeChosenMaterial = 'Brass';
          } else if ((pommelMaterial === 'metal' && bolsterMaterial === 'brass') || (pommelMaterial === 'brass' && bolsterMaterial === 'metal')) {
            bespokeChosenMaterial = 'Metal | Brass';
          }

          if (bladeSteel && bladeFinish && bladeGeometry) {
            newVariant = bladeSteel.value + ' | ' + bladeFinish.value +
                    ' / ' + bladeGeometry.value +
                    ' / ' + bespokeChosenMaterial;
          }
          getNewPrice(newVariant);
          buildUrl();
        }
      });
    });
    document.querySelector('label[for="laser-engraving"] input').onchange = function() {
      buildUrl();
    };
  }
 </script>