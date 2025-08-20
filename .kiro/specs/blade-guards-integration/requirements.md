# Requirements Document

## Introduction

This feature adds support for Blade Guards (protective sheaths) to the 3D knife customizer. Users will be able to select and customize blade guard models alongside existing handle and blade models. The blade guards will be displayed in the Shopify HTML interface with color customization options and rendered in the React 3D viewer.

## Requirements

### Requirement 1

**User Story:** As a customer, I want to see a Blade Guards selection interface in the customizer, so that I can choose protective sheaths for my knives.

#### Acceptance Criteria

1. WHEN the customizer loads THEN the system SHALL display a "Blade Guards" section in the mainShopifyHtml interface
2. WHEN the Blade Guards section is displayed THEN the system SHALL show a select dropdown with available blade guard models
3. WHEN the Blade Guards section is displayed THEN the system SHALL show color options for the selected blade guard model
4. WHEN no blade guard is selected THEN the system SHALL show a default "Select Blade Guard" option
5. WHEN the interface loads THEN the Blade Guards section SHALL be positioned after the existing blade selection (step 6 in the current flow)

### Requirement 2

**User Story:** As a customer, I want to select different blade guard models from a dropdown, so that I can choose the style that fits my knife.

#### Acceptance Criteria

1. WHEN the user clicks the blade guard dropdown THEN the system SHALL display all available blade guard models from A_all-collections-data.json
2. WHEN the user selects a blade guard model THEN the system SHALL update the UI to show color options for that specific model
3. WHEN the user selects a blade guard model THEN the system SHALL trigger the display of the 3D model in the React viewer
4. WHEN a blade guard model is selected THEN the system SHALL store the selection in the application state
5. WHEN the user changes blade guard selection THEN the system SHALL update both the UI and 3D viewer accordingly

### Requirement 3

**User Story:** As a customer, I want to customize the colors of my selected blade guard, so that I can match it with my knife design.

#### Acceptance Criteria

1. WHEN a blade guard model is selected THEN the system SHALL display available colors from the model's refGroups data
2. WHEN color options are displayed THEN the system SHALL show color swatches similar to existing handle/blade color interfaces
3. WHEN the user clicks a color swatch THEN the system SHALL apply that color to the blade guard model
4. WHEN colors are applied THEN the system SHALL create nodeMaterials object with proper color, metalness, roughness, and texture properties
5. WHEN multiple colors are available THEN the system SHALL distribute colors across the blade guard's mesh nodes

### Requirement 4

**User Story:** As a developer, I want the blade guard data to be properly transmitted to the React 3D viewer, so that the models render correctly with applied materials.

#### Acceptance Criteria

1. WHEN a blade guard is selected THEN the system SHALL create a blade guard model object with fileUrl, nodeMaterials, and metadata
2. WHEN the blade guard object is created THEN the system SHALL pass it through the shopifyConnectClass.js communication layer
3. WHEN the React app receives blade guard data THEN the system SHALL render the 3D model using the existing ModelLoader component
4. WHEN materials are applied THEN the system SHALL use the same material application logic as handles and blades
5. WHEN the blade guard model changes THEN the system SHALL properly dispose of previous models and load new ones

### Requirement 5

**User Story:** As a developer, I want the blade guard integration to follow existing code patterns, so that the system remains maintainable and consistent.

#### Acceptance Criteria

1. WHEN implementing blade guard support THEN the system SHALL extend the existing ShopifyConnect class with blade guard methods
2. WHEN adding React support THEN the system SHALL extend the useShopifyConnect hook with blade guard state
3. WHEN updating the ModelLoader THEN the system SHALL add blade guard rendering without breaking existing handle/blade functionality
4. WHEN adding UI elements THEN the system SHALL follow the existing CSS styling patterns from steps 1-5
5. WHEN handling data THEN the system SHALL use the same JSON parsing and material creation patterns as existing models

### Requirement 6

**User Story:** As a customer, I want the blade guard to be visually integrated with my knife design, so that I can see how the complete product looks.

#### Acceptance Criteria

1. WHEN all models are loaded THEN the system SHALL display handle, blade, and blade guard together in the 3D scene
2. WHEN the camera moves THEN the system SHALL show all three model types (handle, blade, blade guard) in the same view
3. WHEN materials are applied THEN the system SHALL ensure blade guard materials render with the same quality as handle/blade materials
4. WHEN the scene updates THEN the system SHALL maintain proper lighting and shadows for all model types
5. WHEN models are changed THEN the system SHALL smoothly transition between different blade guard models
