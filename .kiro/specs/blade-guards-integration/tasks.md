# Implementation Plan

- [x] 1. Add blade guard support to shopifyConnectClass.js

  - Add onBladeGuardModelChangedCb property to constructor
  - Add onBladeGuardModelChanged method (copy of onBladeModelChanged pattern)
  - Add triggerBladeGuardModelChange method (copy of triggerBladeModelChange pattern)
  - _Requirements: 4.1, 4.2_

- [x] 2. Add blade guard state to useShopifyConnect hook

  - Add bladeGuardModel state variable
  - Add setBladeGuardModel state setter
  - Add handleBladeGuardModelChange function in useEffect
  - Register blade guard callback with document.shopifyConnect.onBladeGuardModelChanged
  - Return bladeGuardModel in hook return object
  - _Requirements: 4.2, 5.2_

- [x] 3. Add blade guard rendering to ModelLoader.jsx

  - Add bladeGuardModel prop to ModelLoader component
  - Add bladeGuardModelId state variable
  - Copy blade model ID management logic for blade guard
  - Add blade guard Model component in JSX return (copy blade pattern)
  - _Requirements: 4.3, 4.4_

- [x] 4. Add blade guard UI section to mainShopifyHtml.html

  - Copy existing blade selection HTML structure
  - Change IDs and classes to bladeGuard variants
  - Add blade guard section after blade selection (step 6)
  - Update section title to "Blade Guards"
  - _Requirements: 1.1, 1.5_

- [x] 5. Add blade guard data handling to existing JavaScript

  - Copy getModelsByType function calls for bladeGuards modelType
  - Copy model selector creation logic for blade guards
  - Copy color selection interface generation for blade guards
  - Copy material application logic for blade guards
  - _Requirements: 2.1, 2.2, 3.1, 3.2_

- [x] 6. Add blade guard model selection functionality

  - Copy radio button change event handler for blade guards
  - Copy model selection logic that triggers 3D model change
  - Copy material creation and application for blade guards
  - Call document.shopifyConnect.triggerBladeGuardModelChange
  - _Requirements: 2.2, 2.4, 3.3_

- [x] 7. Add blade guard color customization

  - Copy color button creation logic for blade guards
  - Copy color selection event handlers for blade guards
  - Copy material update logic when colors change
  - Update 3D model when blade guard colors change
  - _Requirements: 3.1, 3.2, 3.3, 3.5_

- [x] 8. Update App.jsx to pass blade guard model to ModelLoader

  - Add bladeGuardModel to destructured useShopifyConnect return
  - Pass bladeGuardModel as prop to ModelLoader component
  - _Requirements: 4.3_

- [x] 9. Test blade guard integration

  - Verify blade guard models load from JSON data
  - Test blade guard UI appears and functions correctly
  - Test blade guard 3D model renders alongside handle and blade
  - Test blade guard color changes update 3D model
  - _Requirements: 6.1, 6.2, 6.3_

- [ ] 10. Handle blade guard data format differences
  - Check if blade guard colors use object format {name, color} vs string format
  - Add handling for blade guard color format in material creation
  - Ensure blade guard textures load correctly
  - Test blade guard material properties (metalness, roughness)
  - _Requirements: 3.4, 3.5_
