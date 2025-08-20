# Design Document

## Overview

The Blade Guards integration extends the existing 3D knife customizer to support additional model types using a universal approach. Instead of hardcoding blade guards specifically, the design creates a flexible system that can handle any new model type (bladeGuards, sheaths, accessories, etc.) by following the same patterns as the existing blade and handle models. This ensures scalability and maintainability.

## Architecture

### High-Level Architecture

```
[Shopify HTML UI] ↔ [shopifyConnectClass.js] ↔ [React 3D Viewer]
       ↓                        ↓                      ↓
[Universal Model UI]  [Generic Model Events]  [Dynamic ModelLoader]
```

### Universal Data Flow

1. **Data Loading**: A_all-collections-data.json contains models with any `modelType` (handles, blades, bladeGuards, etc.)
2. **UI Generation**: System dynamically creates UI sections for each modelType found in JSON data
3. **Communication**: shopifyConnectClass.js uses generic model change events with modelType parameter
4. **Rendering**: React ModelLoader dynamically renders any number of model types using the same logic

## Components and Interfaces

### 1. Universal HTML UI System (mainShopifyHtml.html)

#### Dynamic Model Section Generation

```javascript
// Universal function to create model sections
function createModelSection(modelType, models) {
  const sectionId = `${modelType}Selection`;
  const displayName = modelType.charAt(0).toUpperCase() + modelType.slice(1);

  return `
    <div class="bespoke-step" id="${sectionId}">
      <h2 class="section-title">${displayName}</h2>
      
      <div class="model-selector">
        <h3>${displayName} Type</h3>
        <div class="items">
          ${generateModelOptions(models, modelType)}
        </div>
      </div>
      
      <div class="groups-container" id="${modelType}Groups">
        <!-- Color groups populated dynamically -->
      </div>
    </div>
  `;
}

// Universal model option generation
function generateModelOptions(models, modelType) {
  return models
    .map(
      (model) => `
    <div class="step-item">
      <input type="radio" name="${modelType}-model" value="${model.fileName}" id="${model.fileName}">
      <label for="${model.fileName}">
        <span>${model.textFileName}</span>
      </label>
    </div>
  `
    )
    .join("");
}
```

### 2. Universal JavaScript Communication Layer (shopifyConnectClass.js)

#### Generic ShopifyConnect Class

```javascript
class ShopifyConnect {
  constructor() {
    // Existing properties...
    this.modelCallbacks = new Map(); // Universal model callbacks
    this.currentModels = new Map(); // Store current models by type
    this.availableModelTypes = new Set(); // Track available model types
  }

  // Universal methods for any model type
  onModelChanged(modelType, callback) {
    if (typeof callback === "function") {
      this.modelCallbacks.set(modelType, callback);
      this.availableModelTypes.add(modelType);
    }
  }

  triggerModelChange(modelType, model) {
    const callback = this.modelCallbacks.get(modelType);
    if (typeof callback === "function") {
      this.currentModels.set(modelType, model);
      callback(modelType, model);
    }
  }

  getCurrentModel(modelType) {
    return this.currentModels.get(modelType);
  }

  getAllCurrentModels() {
    return Object.fromEntries(this.currentModels);
  }

  getAvailableModelTypes() {
    return Array.from(this.availableModelTypes);
  }

  // Backward compatibility methods
  onHandleModelChanged(callback) {
    this.onModelChanged("handles", (type, model) => callback(model));
  }
  onBladeModelChanged(callback) {
    this.onModelChanged("blades", (type, model) => callback(model));
  }
  triggerHandleModelChange(model) {
    this.triggerModelChange("handles", model);
  }
  triggerBladeModelChange(model) {
    this.triggerModelChange("blades", model);
  }
}
```

### 3. Universal React Integration (useShopifyConnect.js)

#### Dynamic Hook State Management

```javascript
const useShopifyConnect = () => {
  const [models, setModels] = useState(new Map());
  const [globalOptions, setGlobalOptions] = useState(null);
  const [cameraPosition, setCameraPosition] = useState(null);
  const [cameraSettings, setCameraSettings] = useState(null);
  const [forceReinit, setForceReinit] = useState(0);

  useEffect(() => {
    if (!document.shopifyConnect) return;

    const handleModelChange = (modelType, model) => {
      setModels((prev) => new Map(prev.set(modelType, model)));
    };

    // Register universal model change handler
    document.shopifyConnect.onModelChanged("*", handleModelChange);

    // Backward compatibility
    document.shopifyConnect.onHandleModelChanged((model) =>
      handleModelChange("handles", model)
    );
    document.shopifyConnect.onBladeModelChanged((model) =>
      handleModelChange("blades", model)
    );

    return () => {
      if (document.shopifyConnect) {
        document.shopifyConnect.modelCallbacks.clear();
      }
    };
  }, []);

  // Convert Map to individual model properties for backward compatibility
  const handleModel = models.get("handles");
  const bladeModel = models.get("blades");
  const bladeGuardModel = models.get("bladeGuards");

  return {
    models: Object.fromEntries(models), // All models as object
    handleModel,
    bladeModel,
    bladeGuardModel,
    globalOptions,
    cameraPosition,
    cameraSettings,
    forceReinit,
  };
};
```

### 4. Universal 3D Rendering (ModelLoader.jsx)

#### Dynamic ModelLoader Component

```javascript
function ModelLoader({ models, timestamp }) {
  const [modelIds, setModelIds] = useState(new Map());

  // Universal model ID management
  useEffect(() => {
    const newModelIds = new Map();

    Object.entries(models || {}).forEach(([modelType, model]) => {
      if (model?.fileUrl) {
        const newId = `${modelType}-${model.fileUrl}-${
          model.textFileName || ""
        }`;
        newModelIds.set(modelType, newId);
      }
    });

    setModelIds(newModelIds);
  }, [models]);

  // Render all model types dynamically
  return (
    <>
      {Object.entries(models || {}).map(([modelType, model]) => {
        const modelId = modelIds.get(modelType);

        if (!model?.fileUrl || !modelId) return null;

        return (
          <Model
            key={modelId}
            modelId={modelId}
            modelType={modelType}
            path={model.fileUrl}
            nodeMaterials={model.nodeMaterials || {}}
          />
        );
      })}
    </>
  );
}

// Enhanced Model component with type awareness
function Model({ path, nodeMaterials = {}, modelId, modelType }) {
  // Same implementation as before, but with modelType for debugging/logging
  // ... existing Model component code
}
```

## Data Models

### Universal Model Structure

```javascript
// Any model type follows this structure
{
  fileName: "AC_[collectionId]_[modelType]_[modelName].glb",
  textFileName: "Display Name",
  fileUrl: "https://cdn.shopify.com/...",
  modelType: "handles|blades|bladeGuards|accessories|...", // Any type
  nodes: ["Node1", "Node2", ...],
  refGroups: [{
    name: "Material Group Name",
    nodes: [...],
    groupedNodes: [{
      settingsData: {
        difmaps: [{
          name: "Material Name",
          metalness: 0.5,
          roughness: 0.5,
          colors: [
            { name: "Color Name", color: "#hex" },
            // or simple format: "#hex"
          ],
          textures: [{ url: "..." }]
        }]
      }
    }]
  }],
  nodeMaterials: {
    "NodeName": {
      color: "#hex",
      metalness: 0.5,
      roughness: 0.5,
      texture: "https://..."
    }
  }
}
```

### Universal Material Application

```javascript
// Generic function for any model type
function createNodeMaterials(model) {
  const nodeMaterials = {};
  const groups = model.refGroups || [];

  groups.forEach((group) => {
    const activeColors = getActiveColorsForGroup(group.name);
    const material = group.groupedNodes[0]?.settingsData?.difmaps[0];

    if (!material || !activeColors.length) return;

    group.nodes.forEach((nodeName, index) => {
      const colorIndex = index % activeColors.length;
      nodeMaterials[nodeName] = {
        color: activeColors[colorIndex],
        metalness: material.metalness,
        roughness: material.roughness,
        texture: material.textures?.[0]?.url || null,
      };
    });
  });

  return nodeMaterials;
}
```

## Error Handling

### Universal Error Handling

- **Model Type Validation**: Validate any modelType against available data
- **Dynamic UI Generation**: Handle missing or invalid model types gracefully
- **Generic Error Messages**: Provide consistent error handling across all model types

## Testing Strategy

### Universal Testing Approach

- **Generic Test Functions**: Create reusable tests that work with any model type
- **Model Type Parameterization**: Run same tests against handles, blades, bladeGuards, etc.
- **Backward Compatibility**: Ensure existing handle/blade functionality remains intact

## Implementation Phases

### Phase 1: Universal Foundation

1. Refactor shopifyConnectClass.js to use generic model handling
2. Update useShopifyConnect hook for universal model state
3. Create universal model data parsing functions

### Phase 2: Dynamic UI System

1. Create universal HTML section generation
2. Implement dynamic model type detection from JSON
3. Add universal color selection interface

### Phase 3: Universal 3D Rendering

1. Update ModelLoader for dynamic model type handling
2. Test rendering with multiple model types simultaneously
3. Ensure material application works universally

### Phase 4: Blade Guards Implementation

1. Add bladeGuards data to JSON (already exists)
2. Generate blade guards UI using universal system
3. Test complete flow with blade guards

### Phase 5: Testing & Validation

1. Test with existing handles and blades (backward compatibility)
2. Test with new bladeGuards model type
3. Verify system can handle future model types without code changes
