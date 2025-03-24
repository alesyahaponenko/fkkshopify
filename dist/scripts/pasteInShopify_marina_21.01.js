<!doctype html>
<html class="js" lang="{{ request.locale.iso_code }}">
<head>
  <meta charset="utf-8">
  <meta ver="1">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="theme-color" content="">
  <link rel="canonical" href="{{ canonical_url }}">

  {%- if settings.favicon != blank -%}
  <link rel="icon" type="image/png" href="{{ settings.favicon | image_url: width: 32, height: 32 }}">
  {%- endif -%}

  {%- unless settings.type_header_font.system? and settings.type_body_font.system? -%}
  <link rel="preconnect" href="https://fonts.shopifycdn.com" crossorigin>
  {%- endunless -%}

  <title>
    {{ page_title }}
    {%- if current_tags %} &ndash; tagged "{{ current_tags | join: ', ' }}"{% endif -%}
    {%- if current_page != 1 %} &ndash; Page {{ current_page }}{% endif -%}
    {%- unless page_title contains shop.name %} &ndash; {{ shop.name }}{% endunless -%}
  </title>

  {% if page_description %}
  <meta name="description" content="{{ page_description | escape }}">
  {% endif %}

  {% render 'meta-tags' %}

  <script src="{{ 'connectToReact.js' | asset_url }}"  ></script>
  <script src="{{ 'reactApp.js' | asset_url }}" defer="defer"></script>

  <script src="{{ 'constants.js' | asset_url }}" defer="defer"></script>
  <script src="{{ 'pubsub.js' | asset_url }}" defer="defer"></script>
  <script src="{{ 'global.js' | asset_url }}" defer="defer"></script>
  {%- if settings.animations_reveal_on_scroll -%}
  <script src="{{ 'animations.js' | asset_url }}" defer="defer"></script>
  {%- endif -%}
  <script src="{{ 'jquery-3.7.1.js' | asset_url }}" defer="defer"></script>
  <script src="{{ 'swiper-bundle.min.js' | asset_url }}" defer="defer"></script>
  <script src="{{ 'custom.js' | asset_url }}" defer="defer"></script>

  {{ content_for_header }}

  {%- liquid
  assign body_font_bold = settings.type_body_font | font_modify: 'weight', 'bold'
  assign body_font_italic = settings.type_body_font | font_modify: 'style', 'italic'
  assign body_font_bold_italic = body_font_bold | font_modify: 'style', 'italic'
  %}

  {% style %}
  {{ settings.type_body_font | font_face: font_display: 'swap' }}
  {{ body_font_bold | font_face: font_display: 'swap' }}
  {{ body_font_italic | font_face: font_display: 'swap' }}
  {{ body_font_bold_italic | font_face: font_display: 'swap' }}
  {{ settings.type_header_font | font_face: font_display: 'swap' }}

  {% for scheme in settings.color_schemes -%}
  {% assign scheme_classes = scheme_classes | append: ', .color-' | append: scheme.id %}
  {% if forloop.index == 1 -%}
  :root,
  {%- endif %}
  .color-{{ scheme.id }} {
  --color-background: {{ scheme.settings.background.red }},{{ scheme.settings.background.green }},{{ scheme.settings.background.blue }};
  {% if scheme.settings.background_gradient != empty %}
  --gradient-background: {{ scheme.settings.background_gradient }};
  {% else %}
  --gradient-background: {{ scheme.settings.background }};
  {% endif %}

  {% liquid
  assign background_color = scheme.settings.background
  assign background_color_brightness = background_color | color_brightness
  if background_color_brightness <= 26
  assign background_color_contrast = background_color | color_lighten: 50
  elsif background_color_brightness <= 65
  assign background_color_contrast = background_color | color_lighten: 5
  else
  assign background_color_contrast = background_color | color_darken: 25
  endif
  %}

  --color-foreground: {{ scheme.settings.text.red }},{{ scheme.settings.text.green }},{{ scheme.settings.text.blue }};
  --color-background-contrast: {{ background_color_contrast.red }},{{ background_color_contrast.green }},{{ background_color_contrast.blue }};
  --color-shadow: {{ scheme.settings.shadow.red }},{{ scheme.settings.shadow.green }},{{ scheme.settings.shadow.blue }};
  --color-button: {{ scheme.settings.button.red }},{{ scheme.settings.button.green }},{{ scheme.settings.button.blue }};
  --color-button-text: {{ scheme.settings.button_label.red }},{{ scheme.settings.button_label.green }},{{ scheme.settings.button_label.blue }};
  --color-secondary-button: {{ scheme.settings.background.red }},{{ scheme.settings.background.green }},{{ scheme.settings.background.blue }};
  --color-secondary-button-text: {{ scheme.settings.secondary_button_label.red }},{{ scheme.settings.secondary_button_label.green }},{{ scheme.settings.secondary_button_label.blue }};
  --color-link: {{ scheme.settings.secondary_button_label.red }},{{ scheme.settings.secondary_button_label.green }},{{ scheme.settings.secondary_button_label.blue }};
  --color-badge-foreground: {{ scheme.settings.text.red }},{{ scheme.settings.text.green }},{{ scheme.settings.text.blue }};
  --color-badge-background: {{ scheme.settings.background.red }},{{ scheme.settings.background.green }},{{ scheme.settings.background.blue }};
  --color-badge-border: {{ scheme.settings.text.red }},{{ scheme.settings.text.green }},{{ scheme.settings.text.blue }};
  --payment-terms-background-color: rgb({{ scheme.settings.background.rgb }});
  }
  {% endfor %}

  {{ scheme_classes | prepend: 'body' }} {
  color: rgba(var(--color-foreground), 0.75);
  background-color: rgb(var(--color-background));
  }

  :root {
  --font-body-family: {{ settings.type_body_font.family }}, {{ settings.type_body_font.fallback_families }};
  --font-body-style: {{ settings.type_body_font.style }};
  --font-body-weight: {{ settings.type_body_font.weight }};
  --font-body-weight-bold: {{ settings.type_body_font.weight | plus: 300 | at_most: 1000 }};

  --font-heading-family: {{ settings.type_header_font.family }}, {{ settings.type_header_font.fallback_families }};
  --font-heading-style: {{ settings.type_header_font.style }};
  --font-heading-weight: {{ settings.type_header_font.weight }};

  --font-body-scale: {{ settings.body_scale | divided_by: 100.0 }};
  --font-heading-scale: {{ settings.heading_scale | times: 1.0 | divided_by: settings.body_scale }};

  --media-padding: {{ settings.media_padding }}px;
  --media-border-opacity: {{ settings.media_border_opacity | divided_by: 100.0 }};
  --media-border-width: {{ settings.media_border_thickness }}px;
  --media-radius: {{ settings.media_radius }}px;
  --media-shadow-opacity: {{ settings.media_shadow_opacity | divided_by: 100.0 }};
  --media-shadow-horizontal-offset: {{ settings.media_shadow_horizontal_offset }}px;
  --media-shadow-vertical-offset: {{ settings.media_shadow_vertical_offset }}px;
  --media-shadow-blur-radius: {{ settings.media_shadow_blur }}px;
  --media-shadow-visible: {% if settings.media_shadow_opacity > 0 %}1{% else %}0{% endif %};

  --page-width: {{ settings.page_width | divided_by: 10 }}rem;
  --page-width-margin: {% if settings.page_width == '1600' %}2{% else %}0{% endif %}rem;

  --product-card-image-padding: {{ settings.card_image_padding | divided_by: 10.0 }}rem;
  --product-card-corner-radius: {{ settings.card_corner_radius | divided_by: 10.0 }}rem;
  --product-card-text-alignment: {{ settings.card_text_alignment }};
  --product-card-border-width: {{ settings.card_border_thickness | divided_by: 10.0 }}rem;
  --product-card-border-opacity: {{ settings.card_border_opacity | divided_by: 100.0 }};
  --product-card-shadow-opacity: {{ settings.card_shadow_opacity | divided_by: 100.0 }};
  --product-card-shadow-visible: {% if settings.card_shadow_opacity > 0 %}1{% else %}0{% endif %};
  --product-card-shadow-horizontal-offset: {{ settings.card_shadow_horizontal_offset | divided_by: 10.0 }}rem;
  --product-card-shadow-vertical-offset: {{ settings.card_shadow_vertical_offset | divided_by: 10.0 }}rem;
  --product-card-shadow-blur-radius: {{ settings.card_shadow_blur | divided_by: 10.0 }}rem;

  --collection-card-image-padding: {{ settings.collection_card_image_padding | divided_by: 10.0 }}rem;
  --collection-card-corner-radius: {{ settings.collection_card_corner_radius | divided_by: 10.0 }}rem;
  --collection-card-text-alignment: {{ settings.collection_card_text_alignment }};
  --collection-card-border-width: {{ settings.collection_card_border_thickness | divided_by: 10.0 }}rem;
  --collection-card-border-opacity: {{ settings.collection_card_border_opacity | divided_by: 100.0 }};
  --collection-card-shadow-opacity: {{ settings.collection_card_shadow_opacity | divided_by: 100.0 }};
  --collection-card-shadow-visible: {% if settings.collection_card_shadow_opacity > 0 %}1{% else %}0{% endif %};
  --collection-card-shadow-horizontal-offset: {{ settings.collection_card_shadow_horizontal_offset | divided_by: 10.0 }}rem;
  --collection-card-shadow-vertical-offset: {{ settings.collection_card_shadow_vertical_offset | divided_by: 10.0 }}rem;
  --collection-card-shadow-blur-radius: {{ settings.collection_card_shadow_blur | divided_by: 10.0 }}rem;

  --blog-card-image-padding: {{ settings.blog_card_image_padding | divided_by: 10.0 }}rem;
  --blog-card-corner-radius: {{ settings.blog_card_corner_radius | divided_by: 10.0 }}rem;
  --blog-card-text-alignment: {{ settings.blog_card_text_alignment }};
  --blog-card-border-width: {{ settings.blog_card_border_thickness | divided_by: 10.0 }}rem;
  --blog-card-border-opacity: {{ settings.blog_card_border_opacity | divided_by: 100.0 }};
  --blog-card-shadow-opacity: {{ settings.blog_card_shadow_opacity | divided_by: 100.0 }};
  --blog-card-shadow-visible: {% if settings.blog_card_shadow_opacity > 0 %}1{% else %}0{% endif %};
  --blog-card-shadow-horizontal-offset: {{ settings.blog_card_shadow_horizontal_offset | divided_by: 10.0 }}rem;
  --blog-card-shadow-vertical-offset: {{ settings.blog_card_shadow_vertical_offset | divided_by: 10.0 }}rem;
  --blog-card-shadow-blur-radius: {{ settings.blog_card_shadow_blur | divided_by: 10.0 }}rem;

  --badge-corner-radius: {{ settings.badge_corner_radius | divided_by: 10.0 }}rem;

  --popup-border-width: {{ settings.popup_border_thickness }}px;
  --popup-border-opacity: {{ settings.popup_border_opacity | divided_by: 100.0 }};
  --popup-corner-radius: {{ settings.popup_corner_radius }}px;
  --popup-shadow-opacity: {{ settings.popup_shadow_opacity | divided_by: 100.0 }};
  --popup-shadow-horizontal-offset: {{ settings.popup_shadow_horizontal_offset }}px;
  --popup-shadow-vertical-offset: {{ settings.popup_shadow_vertical_offset }}px;
  --popup-shadow-blur-radius: {{ settings.popup_shadow_blur }}px;

  --drawer-border-width: {{ settings.drawer_border_thickness }}px;
  --drawer-border-opacity: {{ settings.drawer_border_opacity | divided_by: 100.0 }};
  --drawer-shadow-opacity: {{ settings.drawer_shadow_opacity | divided_by: 100.0 }};
  --drawer-shadow-horizontal-offset: {{ settings.drawer_shadow_horizontal_offset }}px;
  --drawer-shadow-vertical-offset: {{ settings.drawer_shadow_vertical_offset }}px;
  --drawer-shadow-blur-radius: {{ settings.drawer_shadow_blur }}px;

  --spacing-sections-desktop: {{ settings.spacing_sections }}px;
  --spacing-sections-mobile: {% if settings.spacing_sections < 24 %}{{ settings.spacing_sections }}{% else %}{{ settings.spacing_sections | times: 0.7 | round | at_least: 20 }}{% endif %}px;

  --grid-desktop-vertical-spacing: {{ settings.spacing_grid_vertical }}px;
  --grid-desktop-horizontal-spacing: {{ settings.spacing_grid_horizontal }}px;
  --grid-mobile-vertical-spacing: {{ settings.spacing_grid_vertical | divided_by: 2 }}px;
  --grid-mobile-horizontal-spacing: {{ settings.spacing_grid_horizontal | divided_by: 2 }}px;

  --text-boxes-border-opacity: {{ settings.text_boxes_border_opacity | divided_by: 100.0 }};
  --text-boxes-border-width: {{ settings.text_boxes_border_thickness }}px;
  --text-boxes-radius: {{ settings.text_boxes_radius }}px;
  --text-boxes-shadow-opacity: {{ settings.text_boxes_shadow_opacity | divided_by: 100.0 }};
  --text-boxes-shadow-visible: {% if settings.text_boxes_shadow_opacity > 0 %}1{% else %}0{% endif %};
  --text-boxes-shadow-horizontal-offset: {{ settings.text_boxes_shadow_horizontal_offset }}px;
  --text-boxes-shadow-vertical-offset: {{ settings.text_boxes_shadow_vertical_offset }}px;
  --text-boxes-shadow-blur-radius: {{ settings.text_boxes_shadow_blur }}px;

  --buttons-radius: {{ settings.buttons_radius }}px;
  --buttons-radius-outset: {% if settings.buttons_radius > 0 %}{{ settings.buttons_radius | plus: settings.buttons_border_thickness }}{% else %}0{% endif %}px;
  --buttons-border-width: {% if settings.buttons_border_opacity > 0 %}{{ settings.buttons_border_thickness }}{% else %}0{% endif %}px;
  --buttons-border-opacity: {{ settings.buttons_border_opacity | divided_by: 100.0 }};
  --buttons-shadow-opacity: {{ settings.buttons_shadow_opacity | divided_by: 100.0 }};
  --buttons-shadow-visible: {% if settings.buttons_shadow_opacity > 0 %}1{% else %}0{% endif %};
  --buttons-shadow-horizontal-offset: {{ settings.buttons_shadow_horizontal_offset }}px;
  --buttons-shadow-vertical-offset: {{ settings.buttons_shadow_vertical_offset }}px;
  --buttons-shadow-blur-radius: {{ settings.buttons_shadow_blur }}px;
  --buttons-border-offset: {% if settings.buttons_radius > 0 or settings.buttons_shadow_opacity > 0 %}0.3{% else %}0{% endif %}px;

  --inputs-radius: {{ settings.inputs_radius }}px;
  --inputs-border-width: {{ settings.inputs_border_thickness }}px;
  --inputs-border-opacity: {{ settings.inputs_border_opacity | divided_by: 100.0 }};
  --inputs-shadow-opacity: {{ settings.inputs_shadow_opacity | divided_by: 100.0 }};
  --inputs-shadow-horizontal-offset: {{ settings.inputs_shadow_horizontal_offset }}px;
  --inputs-margin-offset: {% if settings.inputs_shadow_vertical_offset != 0 and settings.inputs_shadow_opacity > 0 %}{{ settings.inputs_shadow_vertical_offset | abs }}{% else %}0{% endif %}px;
  --inputs-shadow-vertical-offset: {{ settings.inputs_shadow_vertical_offset }}px;
  --inputs-shadow-blur-radius: {{ settings.inputs_shadow_blur }}px;
  --inputs-radius-outset: {% if settings.inputs_radius > 0 %}{{ settings.inputs_radius | plus: settings.inputs_border_thickness }}{% else %}0{% endif %}px;

  --variant-pills-radius: {{ settings.variant_pills_radius }}px;
  --variant-pills-border-width: {{ settings.variant_pills_border_thickness }}px;
  --variant-pills-border-opacity: {{ settings.variant_pills_border_opacity | divided_by: 100.0 }};
  --variant-pills-shadow-opacity: {{ settings.variant_pills_shadow_opacity | divided_by: 100.0 }};
  --variant-pills-shadow-horizontal-offset: {{ settings.variant_pills_shadow_horizontal_offset }}px;
  --variant-pills-shadow-vertical-offset: {{ settings.variant_pills_shadow_vertical_offset }}px;
  --variant-pills-shadow-blur-radius: {{ settings.variant_pills_shadow_blur }}px;
  }

  *,
  *::before,
  *::after {
  box-sizing: inherit;
  }

  html {
  box-sizing: border-box;
  font-size: calc(var(--font-body-scale) * 62.5%);
  height: 100%;
  }

  body {
  display: grid;
  grid-template-rows: auto auto 1fr auto;
  grid-template-columns: 100%;
  min-height: 100%;
  margin: 0;
  font-size: 1.5rem;
  letter-spacing: 0.06rem;
  line-height: calc(1 + 0.8 / var(--font-body-scale));
  font-family: var(--font-body-family);
  font-style: var(--font-body-style);
  font-weight: var(--font-body-weight);
  }

  @media screen and (min-width: 750px) {
  body {
  font-size: 1.6rem;
  }
  }
  {% endstyle %}

  {{ 'base.css' | asset_url | stylesheet_tag }}

  {%- unless settings.type_body_font.system? -%}
  {% comment %}theme-check-disable AssetPreload{% endcomment %}
  <link rel="preload" as="font" href="{{ settings.type_body_font | font_url }}" type="font/woff2" crossorigin>
  {% comment %}theme-check-enable AssetPreload{% endcomment %}
  {%- endunless -%}
  {%- unless settings.type_header_font.system? -%}
  {% comment %}theme-check-disable AssetPreload{% endcomment %}
  <link rel="preload" as="font" href="{{ settings.type_header_font | font_url }}" type="font/woff2" crossorigin>
  {% comment %}theme-check-enable AssetPreload{% endcomment %}
  {%- endunless -%}

  {%- if localization.available_countries.size > 1 or localization.available_languages.size > 1 -%}
  {{ 'component-localization-form.css' | asset_url | stylesheet_tag: preload: true }}
  <script src="{{ 'localization-form.js' | asset_url }}" defer="defer"></script>
  {%- endif -%}

  {%- if settings.predictive_search_enabled -%}
  <link
          rel="stylesheet"
          href="{{ 'component-predictive-search.css' | asset_url }}"
          media="print"
          onload="this.media='all'"
  >
  {%- endif -%}

  <link rel="stylesheet" href="https://use.typekit.net/sgy2zuz.css">
  <link rel="stylesheet" href="{{ 'swiper-bundle.min.css' | asset_url }}">
  <link rel="stylesheet" href="{{ 'custom.css' | asset_url }}">
  <link rel="stylesheet" href="{{ 'custom-responsive.css' | asset_url }}">
  <link rel="stylesheet" href="{{ 'canvas.css' | asset_url }}">

  <script>
    if (Shopify.designMode) {
      document.documentElement.classList.add('shopify-design-mode');
    }
  </script>
  <style>
    body.bespoke-intro #MainContent .bespoke-customizer {
      padding-right: 22px;
    }

    .customizer-header, .customizer-header-mobile {
      margin-right: 1.04vw;

      display: flex;
      justify-content: space-between;
      align-items: flex-end;

      padding: .83vw 0 .52vw;
      border-top: 1px solid #381409;
      border-bottom: 1px solid #381409;
      color: #381409;

      font-family: "akzidenz-grotesk", sans-serif;
    }
    .customizer-header .ch-back,
    .customizer-header-mobile .ch-back,
    .customizer-header .ch-right,
    .customizer-header-mobile .ch-right {
      display: flex;
      justify-content: flex-start;
      align-items: center;
    }
    .customizer-header .ch-back,
    .customizer-header-mobile .ch-back {
      column-gap: 14px;
      cursor: pointer;

      font-family: "sutro", serif;
      font-size: .94vw;
      line-height: 1.04vw;
    }
    .customizer-header .ch-back svg,
    .customizer-header-mobile .ch-back svg {
      display: block;
      width: .26vw;
      height: .47vw;
    }
    .customizer-header .ch-right,
    .customizer-header-mobile .ch-right {
      column-gap: .16vw;
      padding-top: .1vw;
      box-sizing: border-box;

      font-size: .68vw;
      line-height: .83vw;
      text-transform: uppercase;
    }
    .customizer-header .ch-right div,
    .customizer-header-mobile .ch-right div {
      cursor: pointer;
    }
    .customizer-header .ch-right > span:nth-child(6),
    .customizer-header .ch-right > div:nth-child(7),
    .customizer-header-mobile .ch-right > span:nth-child(6),
    .customizer-header-mobile .ch-right > div:nth-child(7) {
      display: none;
    }

    .customizer-header .ch-right .ch-share span:nth-child(2),
    .customizer-header .ch-right .ch-share span:nth-child(3),
    .customizer-header-mobile .ch-right .ch-share span:nth-child(2),
    .customizer-header-mobile .ch-right .ch-share span:nth-child(3) {
      display: none;
    }
    .customizer-header .ch-right .ch-share:hover span:nth-child(1),
    .customizer-header-mobile .ch-right .ch-share:hover span:nth-child(1) {
      display: none;
    }
    .customizer-header .ch-right .ch-share:hover span:nth-child(2),
    .customizer-header-mobile .ch-right .ch-share:hover span:nth-child(2) {
      display: block;
    }
    .customizer-header .ch-right .ch-share.copied span:nth-child(1),
    .customizer-header .ch-right .ch-share.copied span:nth-child(2),
    .customizer-header-mobile .ch-right .ch-share.copied span:nth-child(1),
    .customizer-header-mobile .ch-right .ch-share.copied span:nth-child(2) {
      display: none;
    }
    .customizer-header .ch-right .ch-share.copied span:nth-child(3),
    .customizer-header-mobile .ch-right .ch-share.copied span:nth-child(3) {
      display: block;
    }


    .customizer-footer {
      position: absolute;
      left: 0;
      right: 1.15vw;
      bottom: 1.56vw;
    }
    .customizer-footer .cf-subtotal {
      /*margin-left: 5px;*/
      padding: .63vw .16vw .83vw;

      border-top: 1px solid #381409;

      display: flex;
      justify-content: space-between;
      align-items: baseline;

      font-family: "akzidenz-grotesk", sans-serif;
      font-weight: 400;
      font-size: .94vw;
      line-height: 1.04vw;
      color: #381409;
    }
    .customizer-footer .cf-subtotal .subtotal-price {
      font-family: "sutro", sans-serif;
      font-size: .94vw;
      line-height: 1.04vw;
    }
    .customizer-footer .cf-next,
    .customizer-footer .cf-add-to-cart {
      display: flex;
      align-items: center;
      height: 1.88vw;
      background: #381409;
      border-radius: .78vw;

      padding: 0 1.15vw;

      font-family: "akzidenz-grotesk", sans-serif;
      font-weight: 400;
      font-size: .94vw;
      line-height: 1.04vw;
      color: #F4F4F4;

      cursor: pointer;
    }


    .bespoke-steps {
      padding-right: 1.04vw;
    }
    .bespoke-step {
      flex-direction: column;
      display: none;
    }
    .bespoke-step.active {
      display: flex;
    }

    .bespoke-step#handleDesign {
      position: relative;
    }
    .bespoke-step#handleDesign .generate {
      position: absolute;
      top: 2.08vw;
      right: 0;
      z-index: 2;

      font-family: 'Akzidenz-Grotesk BQ', sans-serif;
      font-size: .68vw;
      line-height: 16px;
      color: #381409;

      padding: 5px;

      cursor: pointer;

      display: flex;
      justify-content: flex-start;
      align-items: center;
      column-gap: 5px;
    }
    .bespoke-step#handleDesign .generate svg {
      width: .68vw;
      height: auto;
    }

    .bespoke-step .section-title {
      display: block;
      width: 100%;
      padding-top: 2.08vw;
      padding-bottom: .36vw;
      border-bottom: 1px solid #381409;

      font-size: 1.35vw;
      line-height: 1.67vw;
      letter-spacing: -.015em;
    }
    .bespoke-step .model-selector {
      display: flex;
      justify-content: flex-start;
      align-items: flex-start;

      padding-top: .83vw;
    }
    .bespoke-step .model-selector > h3 {
      font-family: "akzidenz-grotesk", sans-serif;
      font-size: .78vw;
      line-height: .82vw;

      width: 7.7vw;
      min-width: 7.7vw;
    }

    .bespoke-step .laser-selector {
      display: flex;
      justify-content: flex-start;
      align-items: flex-start;

      padding-top: .83vw;
    }
    .bespoke-step .laser-selector > h3 {
      font-family: "akzidenz-grotesk", sans-serif;
      font-size: .78vw;
      line-height: .82vw;

      width: 7.7vw;
      min-width: 7.7vw;
    }

    .bespoke-step .steel-items,
    .bespoke-step .model-selector .items,
    .bespoke-step .model-selector .finish-items,
    .bespoke-step .laser-selector > ul {
      display: flex;
      flex-direction: column;
      row-gap: 1.15vw;

      width: 100%;
    }
    .bespoke-step#handleDesign .model-selector .items {
      row-gap: .42vw;
    }
    .bespoke-step .steel-item[data-comingsoon="true"],
    .bespoke-step .step-item[data-comingsoon="true"],
    .bespoke-step .finish-item[data-comingsoon="true"]{
      pointer-events: none;
      opacity: .5;
    }
    .bespoke-step .steel-item label,
    .bespoke-step .step-item label,
    .bespoke-step .finish-item label,
    .bespoke-step .laser-selector > ul li label {
      display: block;
      position: relative;
      padding-left: .94vw;
      margin-bottom: 0 !important;

      font-size: .89vw;
      line-height: 1.04vw;
      color: #381409;

      cursor: pointer;
    }
    .bespoke-step .steel-item label:before,
    .bespoke-step .step-item label:before,
    .bespoke-step .finish-item label:before,
    .bespoke-step .laser-selector > ul li label:before {
      content: '';

      position: absolute;
      top: .21vw;
      left: 0;

      display: block;
      width: .57vw;
      height: .57vw;
      border-radius: 50%;
      border: 1px solid #381409;
    }
    .bespoke-step .steel-item input:checked + label:before,
    .bespoke-step .step-item input:checked + label:before,
    .bespoke-step .finish-item input:checked + label:before,
    .bespoke-step .laser-selector > ul li input:checked + label:before {
      background: #381409;
    }
    .bespoke-step .steel-item input,
    .bespoke-step .step-item input,
    .bespoke-step .finish-item input,
    .bespoke-step .laser-selector > ul li input {
      display: none;
    }
    .bespoke-step .steel-item[data-comingsoon="true"] label p:after,
    .bespoke-step .step-item[data-comingsoon="true"] span:after,
    .bespoke-step .finish-item[data-comingsoon="true"] p:after {
      content: ' — Coming soon';
    }
    .bespoke-step .steel-item label .el-description,
    .bespoke-step .step-item label .el-description,
    .bespoke-step .finish-item label .el-description {
      width: 70%;
      margin-top: .42vw;

      font-size: .73vw;
      line-height: .83vw;

      pointer-events: none;
    }
    .bespoke-step .steel-item label .el-price,
    .bespoke-step .step-item label .el-price,
    .bespoke-step .finish-item label .el-price {
      position: absolute;
      top: 0;
      right: 0;

      font-family: "sutro", sans-serif;
      font-size: .89vw;
      line-height: 1.04vw;

      pointer-events: none;
    }

    .bespoke-step .laser-selector > ul {
      row-gap: .42vw;
    }
    .bespoke-step .laser-selector > ul li label {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .bespoke-step .laser-selector > ul li label > input[type="text"] {
      font-size: .89vw;
      line-height: 1.04vw;
      color: #381409;

      background: none;
    }
    .bespoke-step .laser-selector > ul li label > input[type="text"]::placeholder {
      color: #9A9A9A;
    }

    .bespoke-step .steel-item label:hover:before,
    .bespoke-step .finish-item label:hover:before,
    .bespoke-step .step-item label:hover:before,
    .bespoke-step .laser-selector > ul li label:hover:before {
      background: #381409;
    }
    .bespoke-step .laser-selector > ul li:last-child label:hover > span:first-child {
      display: none;
    }
    .bespoke-step .laser-selector > ul li:last-child label:hover > input[type="text"] {
      display: block !important;
    }

    /*.bespoke-step .laser-selector > ul li label:hover span:first-child {*/
    /*  color: #9A9A9A;*/
    /*}*/
    .bespoke-step .laser-selector > ul li:last-child input:checked + label span:first-child {
      display: none;
    }
    .bespoke-step .laser-selector > ul li:last-child input:checked + label input[type="text"] {
      display: block !important;
    }
    .bespoke-step .laser-selector > ul li .price {
      font-family: "sutro", sans-serif;
      font-size: .89vw;
      line-height: 1.04vw;
    }
    .bespoke-step .laser-selector > ul li label[for="no-engraving"] .price {
      display: none;
    }


    #orderNotes textarea {
      display: block;
      height: 13.02vw;
      background: none;
      border-bottom: 1px solid #381409;
      resize: none;

      margin-top: 1.2vw;

      font-size: .99vw;
      line-height: 1.04vw;
      color: #381409;
    }
    #orderNotes textarea::placeholder {
      color: #9A9A9A;
    }






    #buttonContainer {
      width: 100% !important;
    }

    .groups-container {
      margin: 20px 0;
    }

    .group-section {
      margin-bottom: 20px;
      padding: 10px;
    }

    .group-header {
      width: 7.82vw;
      padding-right: 1.04vw;
      box-sizing: border-box;

      position: relative;
    }
    .group-header h3 {
      font-family: "akzidenz-grotesk", sans-serif;
      font-size: .78vw;
      line-height: .99vw;
      letter-spacing: -.01em;
      color: #381409;
    }
    .group-header span {
      display: block;
      font-family: "sutro", sans-serif;
      font-size: .78vw;
      line-height: .99vw;
      letter-spacing: -.015em;
      color: #381409;
    }
    [data-type="Discs"] .group-header span {
      position: absolute;
    }

    .color-options {
      display: flex;
      gap: .83vw;
      align-items: center;
    }

    .color-button {
      width: .47vw;
      height: 1.04vw;
      border: none;
      cursor: pointer;
      position: relative;
      border-radius: .1vw;
      margin: 0;
      padding: 0;
    }

    .color-button.active::before {
      content: "";

      display: block;
      width: .78vw;
      height: 1.3vw;
      box-sizing: border-box;

      border-radius: .16vw;
      border: 1px solid #381409;

      position: absolute;
      top: 50%;
      left: 50%;

      -webkit-transform: translate(-50%, -50%);
      transform: translate(-50%, -50%);
    }
    .color-button:hover::before {
      content: "";

      display: block;
      width: .78vw;
      height: 1.3vw;
      box-sizing: border-box;

      border-radius: .16vw;
      border: 1px solid #9A9A9A;

      position: absolute;
      top: 50%;
      left: 50%;

      -webkit-transform: translate(-50%, -50%);
      transform: translate(-50%, -50%);
    }
    .color-button.active:hover::before {
      border: 1px solid #381409;
    }

    .color-button.active::after {
      display: none;
    }

    .settings-section {
      margin-bottom: 15px;
    }

    .settings-section h4 {
      font-size: 14px;
      color: #666;
      margin: 0 0 10px 0;
    }

    .hidden-settings {
      display: none;
    }

    .settings-section + .settings-section {
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #eee;
    }

    .settings-section:nth-child(1) h4 {
      content: "Logic";
    }

    .settings-section:nth-child(2) h4 {
      content: "Leather Spacers";
    }

    .settings-section:nth-child(3) h4 {
      content: "Discs";
    }

    .color-button:hover {
      opacity: 0.9;
    }


    #handleDesign .model-selector {
      padding-bottom: 40px;
    }

    #handleDesign .groups-container {
      display: flex;
      flex-direction: column;
    }
    #handleDesign .group-info {
      border-top: 1px solid #381409;
      padding: .73vw 0 2.08vw;
      margin: 0;

      display: flex;
    }
    #handleDesign .groups-container .group-section h3 {
      font-family: "akzidenz-grotesk", sans-serif;
      font-size: .78vw;
      line-height: .82vw;
      color: #381409;

      width: 7.7vw;
      min-width: 7.7vw;
    }
    #handleDesign .groups-container .group-section .settings-section {
      margin-bottom: 0;
    }
    #handleDesign .groups-container [data-title="Leather Spacers"] {
      order: 0;
    }

    #handleDesign .groups-container [data-title="Discs"] {
      order: 1;
    }

    #handleDesign .groups-container [data-title="Pommel"] {
      order: 2;
      position: relative;
    }

    #handleDesign .groups-container [data-title="Bolster"] {
      order: 3;
      position: relative;
    }

    #handleDesign .groups-container [data-title="Rivet"] {
      display: none;
    }

    #handleDesign [data-type="Pommel"] .section-price,
    #handleDesign [data-type="Bolster"] .section-price {
      position: absolute;
      top: .73vw;
      right: 0;

      font-family: "sutro", sans-serif;
      font-size: .89vw;
      line-height: .99vw;
      color: #381409;
    }

    #handleDesign [data-type="Pommel"] .section-price.hidden,
    #handleDesign [data-type="Bolster"] .section-price.hidden {
      visibility: hidden;
    }

    #optionalAddons h3 {
      font-family: "akzidenz-grotesk", sans-serif;
      font-size: .78vw;
      line-height: .82vw;
      color: #381409;

      width: 7.7vw;
      min-width: 7.7vw;
      padding-right: .52vw;
      box-sizing: border-box;
    }
    #optionalAddons .section-content {
      margin-top: .83vw;

      display: flex;
      justify-content: flex-start;
      align-items: flex-start;
    }
    #optionalAddons .section-content .addons-list {
      display: flex;
      flex-direction: column;
      row-gap: .42vw;

      width: 100%;
    }
    #optionalAddons .section-content .addons-list .addon {
      position: relative;
      width: 100%;
    }
    #optionalAddons .section-content .addons-list .addon input[type="checkbox"] {
      display: none;
    }
    #optionalAddons .section-content .addons-list .addon label {
      display: block;
      position: relative;
      padding-left: .94vw;
      margin-bottom: 0 !important;

      font-size: .89vw;
      line-height: 1.04vw;
      color: #381409;

      cursor: pointer;
    }
    #optionalAddons .section-content .addons-list .addon label span {
      pointer-events: none;
    }
    #optionalAddons .section-content .addons-list .addon label:before {
      content: '';

      position: absolute;
      top: .23vw;
      left: 0;

      display: block;
      width: .57vw;
      height: .57vw;
      border-radius: 50%;
      border: 1px solid #381409;
    }
    #optionalAddons .section-content .addons-list .addon label:hover:before,
    #optionalAddons .section-content .addons-list .addon input:checked + label:before {
      background: #381409;
    }
    #optionalAddons .section-content .addons-list .addon label .addon-title {
      font-size: .89vw;
      line-height: 1.04vw;
      color: #381409;

      pointer-events: none;
    }
    #optionalAddons .section-content .addons-list .addon label .addon-description {
      display: none;
      max-width: 70%;
      margin-top: .42vw;

      font-size: .73vw;
      line-height: .83vw;
    }
    #optionalAddons .section-content .addons-list .addon label .addon-price {
      position: absolute;
      top: 0;
      right: 0;

      font-family: "sutro", sans-serif;
      font-size: .89vw;
      line-height: 1.04vw;

      pointer-events: none;
    }

    #optionalAddons .section-content .addons-list .addon input[data-inventory="0"] + label {
      opacity: .5;
      pointer-events: none;
    }
    #optionalAddons .section-content .addons-list .addon input[data-inventory="0"] + label .out-of-stock {
      display: block !important;

      margin-top: 4px;
      padding-left: .94vw;
      font-size: .89vw;
      line-height: 1.04vw;
      color: #381409;
    }


    .reset-selections-btn {
      display: none;
    }

    /* NEW STYLES */


    .group-info[data-type="Rivet"] {
      display: none;
    }
    .colors-container {
      display: flex;
      gap: .83vw;
      flex-wrap: wrap;
      margin-top: .31vw;
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

    #handleDesign .model-info {
      display: flex;
      flex-direction: column;
    }

    #handleDesign .group-info {
      position: relative;
      border-top: 1px solid #381409;

      display: flex;
      justify-content: flex-start;
      align-items: flex-start;
    }
    #handleDesign .group-info h3 {
      width: 7.8vw;
      padding-right: 1.04vw;
      box-sizing: border-box;
    }
    #handleDesign .group-info button.color-sample {
      width: .52vw;
      height: 1.04vw;
      border-radius: 2px;
      cursor: pointer;

      position: relative;
    }
    #handleDesign .group-info button.color-sample-active {
      border: none;
    }
    #handleDesign .group-info button.color-sample-active:after {
      content: '';
      display: block;
      width: .84vw;
      height: 1.35vw;

      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);

      box-sizing: border-box;
      border: 1px solid #381409;
      border-radius: 3px;
    }
    #handleDesign .group-info .colors-container {
      column-gap: .89vw;
    }
    #handleDesign .group-info[data-type="Rivet"] {
      display: none !important;
    }
    #handleDesign .group-info[data-type="Leather Spacers"] {
      order: 0;
    }
    #handleDesign .group-info[data-type="Discs"] {
      order: 1;
    }
    #handleDesign .group-info[data-type="Pommel"] {
      order: 2;
    }
    #handleDesign .group-info[data-type="Bolster"] {
      order: 3;
    }


    @media only screen and (min-width: 1025px) {
      #canvas {
        margin-top: 20px;
        width: calc(66.667% - 50px);
        height: calc(100vh - 117px);

        border-radius: 5px;
        overflow: hidden;

        opacity: 0;
        visibility: hidden;
        position: relative;
      }
      #canvas:after {
        content: '';

        display: none;
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
      }
      #canvas.nomove:after {
        display: block;
      }
      #canvas canvas {
        background: #EDEBE9;
      }
      body.bespoke-intro.bespoke-chosen #canvas {
        opacity: 1;
        visibility: visible;

        -webkit-transition: opacity .15s linear .2s;
        transition: opacity .15s linear .2s;
      }
    }
    @media only screen and (max-width: 1024px) {
      #canvas {
        /*width: 100%;*/
        /*height: auto;*/

        border-radius: 10px;
        overflow: hidden;

        opacity: 0;
        visibility: hidden;

        position: relative;
      }
      #canvas:after {
        content: '';

        display: none;
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
      }
      #canvas.nomove:after {
        display: block;
      }
      #canvas canvas {
        background: #EDEBE9;
        height: 50vw !important;
      }
      body.bespoke-intro.bespoke-chosen #canvas {
        opacity: 1;
        visibility: visible;

        -webkit-transition: opacity .15s linear .2s;
        transition: opacity .15s linear .2s;
      }
    }
    @media only screen and (max-width: 500px) {
      #canvas canvas {
        height: 250px !important;
      }
    }

  </style>
</head>

<body class="bespoke-intro gradient{% if settings.animations_hover_elements != 'none' %} animate--hover-{{ settings.animations_hover_elements }}{% endif %} {% if template == 'index' %}homepage{% endif %}">
<a class="skip-to-content-link button visually-hidden" href="#MainContent">
  {{ 'accessibility.skip_to_text' | t }}
</a>

<div class="fkk-grid">
  <span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span>
</div>

{%- if settings.cart_type == 'drawer' -%}
{%- render 'cart-drawer' -%}
{%- endif -%}

<main id="MainContent" class="content-for-layout focus-none" role="main" tabindex="-1">
  <div class="menu-overlay"></div>
  {% sections 'header-group' %}
  <div class="bespoke-brown">
    {{ content_for_layout }}
  </div>
  <div class="bespoke-feature">
    <div class="bespoke-change-view">
      <svg xmlns="http://www.w3.org/2000/svg" width="17.941" height="18.6" viewBox="0 0 17.941 18.6">
        <g id="Group_4007" data-name="Group 4007" transform="translate(-9274.809 17696.361)">
          <path id="Path_38877" data-name="Path 38877" d="M9275.309-17697.865l8.471-3.453,8.471,3.453-8.471,3.451Z" transform="translate(0 5.457)" fill="none" stroke="#381409" stroke-linejoin="round" stroke-width="1"/>
          <path id="Path_38878" data-name="Path 38878" d="M9275.309-17673.5v8.432l8.471,5.715,8.471-5.715v-8.432" transform="translate(0 -18.913)" fill="none" stroke="#381409" stroke-linejoin="round" stroke-width="1"/>
          <line id="Line_2690" data-name="Line 2690" y2="11.225" transform="translate(9283.779 -17689.488)" fill="none" stroke="#381409" stroke-width="1"/>
        </g>
      </svg>
    </div>
    <div class="customizer-header-mobile" style="display:none;">
      <div class="ch-back">
        <svg xmlns="http://www.w3.org/2000/svg" width="5.378" height="9.556" viewBox="0 0 5.378 9.556">
          <g id="Group_3667" data-name="Group 3667" transform="translate(12.903 9.131) rotate(180)">
            <g id="Arrow" transform="translate(0 0)">
              <path id="Path_3097" data-name="Path 3097" d="M1130.293,3725.366l4.354,4.354-4.354,4.354" transform="translate(-1122.344 -3725.366)" fill="none" stroke="#381409" stroke-linejoin="round" stroke-width="1.2"/>
            </g>
          </g>
        </svg>
        <div class="ch-step">Step <span>1</span>/7</div>
      </div>
      <div class="ch-right">
        <div class="ch-change">Change knife</div>
        <span class="divider">/</span>
        <div class="ch-save">Save</div>
        <span class="divider">/</span>
        <div class="ch-share">
          <span>Share</span>
          <span>Copy link</span>
          <span>Link copied</span>
        </div>
        <span class="divider">/</span>
        <div class="ch-close">
          <span>Close</span>
        </div>
      </div>
    </div>
    <div id="canvas">
      {{ content_for_layout }}
    </div>
    <div class="canvas-engraving"></div>
    <div class="bespoke-customizer">
      <div class="customizer-header">
        <div class="ch-back">
          <svg xmlns="http://www.w3.org/2000/svg" width="5.378" height="9.556" viewBox="0 0 5.378 9.556">
            <g id="Group_3667" data-name="Group 3667" transform="translate(12.903 9.131) rotate(180)">
              <g id="Arrow" transform="translate(0 0)">
                <path id="Path_3097" data-name="Path 3097" d="M1130.293,3725.366l4.354,4.354-4.354,4.354" transform="translate(-1122.344 -3725.366)" fill="none" stroke="#381409" stroke-linejoin="round" stroke-width="1.2"/>
              </g>
            </g>
          </svg>
          <div class="ch-step">Step <span>1</span>/7</div>
        </div>
        <div class="ch-right">
          <div class="ch-change">Change knife</div>
          <span class="divider">/</span>
          <div class="ch-save">Save</div>
          <span class="divider">/</span>
          <div class="ch-share">
            <span>Share</span>
            <span>Copy link</span>
            <span>Link copied</span>
          </div>
          <span class="divider">/</span>
          <div class="ch-close">
            <span>Close</span>
          </div>
        </div>
      </div>
      <div class="bespoke-steps">
        <div id="bladeSteel" class="bespoke-step"></div>
        <div id="bladeGeometry" class="bespoke-step"></div>
        <div id="bladeFinish" class="bespoke-step"></div>
        <div id="handleDesign" class="bespoke-step"></div>
        <div id="laserEngraving" class="bespoke-step">
          <h2 class="section-title">Laser Engraving</h2>
        </div>
        <div id="optionalAddons" class="bespoke-step">
          <h2 class="section-title">Optional add-on’s</h2>
          <div class="section-content"></div>
        </div>
        <div id="orderNotes" class="bespoke-step">
          <h2 class="section-title">Add Notes to Order</h2>
          <textarea name="notes" id="notes" placeholder="Type in any notes relating to your order"></textarea>
        </div>

        <div id="bladeContainer"></div>
        <div id="handleContainer"></div>
        <script>
          let TARGET_COLLECTION_ID = "cm3n7xcpo0000ljvbff65bjuu";

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

          let activeKnife;
          let chosenSteel;
          let chosenProductVariants;
          let firstVariant;
          let newVariant;
          let stepInit;

          let initialize = 0;
          let windowLocationUsed = true;

          async function fetchCollectionsData() {
            try {
              const response = await fetch('{{ "A_all-collections-data.json" | asset_url }}');
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

            if(materialName === 'Pommel' || materialName === 'Bolster') {
              if (colorIndex === -1) {
                currentColors.splice(0,currentColors.length);
                currentColors.push(color);
              } else {
                currentColors.splice(0,currentColors.length);

                if (currentColors.length === 0) {
                  const groups = getModelGroups(appData.currentModels.handle);
                  const group = groups.find((g) => g.name === materialName);
                  if (group) {
                    const firstColor =
                            group.groupedNodes[0]?.settingsData?.difmaps[0]?.colors[0].color;
                    if (firstColor) {
                      currentColors.push(firstColor);
                    }
                  }
                }
              }
            }else{
              if (colorIndex === -1) {
                currentColors.push(color);
              } else {
                currentColors.splice(colorIndex, 1);

                if (currentColors.length === 0) {
                  const groups = getModelGroups(appData.currentModels.handle);
                  const group = groups.find((g) => g.name === materialName);
                  if (group) {
                    const firstColor =
                            group.groupedNodes[0]?.settingsData?.difmaps[0]?.colors[0].color;
                    if (firstColor) {
                      currentColors.push(firstColor);
                    }
                  }
                }
              }
            }
          }

          function createNodeMaterials(model, shuffleNeighbors = false) {
            const nodeMaterials = {};
            const groups = getModelGroups(model);

            // Retrieve previous colors from localStorage if needed
            let savedColors = localStorage.getItem('savedColors') === 'yes' ? JSON.parse(localStorage.getItem('nodeMaterials')) || {} : {};

            groups.forEach((group) => {
              // Marina
              if (group.name === "Blade") {
                const bladeNodes = group.groupedNodes;
                const steelOptions = document.querySelectorAll('input[name="model-steel"]');

                if (steelOptions.length > 0) {
                  const selectedSteel = document.querySelector('input[name="model-steel"]:checked');
                  const selectedFinish = document.querySelector('input[name="model-finish"]:checked');

                  if (selectedSteel) {
                    bladeNodes.forEach(({ name, settingsData }) => {
                      if (name !== selectedSteel.value) return;

                      settingsData?.difmaps.forEach(({ name: finishName, colors, metalness, roughness, textures }) => {
                        if (finishName !== selectedFinish?.value) return;

                        nodeMaterials[group.nodes[0]] = {
                          color: colors[0].color,
                          metalness,
                          roughness,
                          texture: textures?.[0]?.url || null,
                        };
                      });
                    });
                  } else {
                    const firstAvailableFinish = bladeNodes[0]?.settingsData?.difmaps[0];

                    nodeMaterials[group.nodes[0]] = {
                      color: firstAvailableFinish?.colors[0].color,
                      metalness: firstAvailableFinish?.metalness,
                      roughness: firstAvailableFinish?.roughness,
                      texture: firstAvailableFinish?.textures?.[0]?.url || null,
                    };
                  }
                }

                return nodeMaterials;
              }
              // Marina

              const activeColors = appData.materialSettings.activeSettings[group.name] || [];
              let material = group.groupedNodes[0]?.settingsData?.difmaps[0];

              const checkedInput = document.querySelector('input[name="handles-model"]:checked');
              shuffleNeighbors = checkedInput && checkedInput.id === 'random';

              if (!material || !activeColors.length) return;

              const totalNodes = group.nodes.length;
              let colors = [];

              // If localStorage savedColors is "yes", keep existing colors for non-Pommel & non-Bolster groups
              if (localStorage.getItem('savedColors') === 'yes' && !["Pommel", "Bolster"].includes(group.name)) {
                group.nodes.forEach((nodeName) => {
                  if (savedColors[nodeName]) {
                    nodeMaterials[nodeName] = savedColors[nodeName]; // Keep previous color
                  }
                });
                return; // Skip further processing for this group
              }

              // Рівномірно розподіляємо кольори
              let fullCycles = Math.floor(totalNodes / activeColors.length);
              let remainder = totalNodes % activeColors.length;

              for (let i = 0; i < fullCycles; i++) {
                colors = colors.concat(activeColors);
              }

              for (let i = 0; i < remainder; i++) {
                colors.push(activeColors[i]);
              }

              let shuffledColors = [...colors];

              // Міняємо місцями сусідні кольори (максимум 5 змін) — тільки якщо shuffleNeighbors == true
              if (shuffleNeighbors) {
                for (let i = 0; i < shuffledColors.length - 1; i++) {
                  if (Math.random() < 0.2) {
                    [shuffledColors[i], shuffledColors[i + 1]] = [shuffledColors[i + 1], shuffledColors[i]];
                    i++;
                  }
                }
              }

              // Призначаємо кольори вузлам з урахуванням спеціальних груп
              group.nodes.forEach((nodeName, index) => {
                // Отримуємо колір із shuffledColors
                const nodeColor = shuffledColors[index];
                let selectedMaterial = material;

                // Перевіряємо, чи вузол належить до групи спеціальних елементів
                if (["Pommel", "Bolster", "Discs"].includes(group.groupedNodes[0]?.name)) {
                  let materials = group.groupedNodes[0]?.settingsData?.difmaps;

                  // Знаходимо матеріал, що містить потрібний колір
                  const selectedIndexes = materials
                          .map((mat, idx) =>
                                  mat.colors.some(colorObj => colorObj.color === nodeColor) ? idx : -1
                          )
                          .filter(idx => idx !== -1);

                  if (selectedIndexes.length > 0) {
                    selectedMaterial = materials[selectedIndexes[0]];
                  }
                }

                // Призначаємо правильний матеріал вузлу
                nodeMaterials[nodeName] = {
                  color: nodeColor, // Використовуємо колір із shuffledColors
                  metalness: selectedMaterial.metalness,
                  roughness: selectedMaterial.roughness,
                  texture: selectedMaterial.textures?.[0]?.url || null
                };
              });
            });

            // Save generated colors to localStorage for future reference
            localStorage.setItem('nodeMaterials', JSON.stringify(nodeMaterials));
            localStorage.removeItem('savedColors'); // Remove flag after applying

            return nodeMaterials;
          }

          function createColorButton(color, material, onClick) {
            const colorEl = document.createElement("button");
            colorEl.classList.add("color-sample");

            let justColor = color.split(' - ')[0];
            let justMaterial = color.split(' - ')[1];
            let justName = color.split(' - ')[2];

            const activeSettings = getMaterialForGroup();
            const activeColors = activeSettings[material.name] || [];
            const isActive = activeColors.includes(justColor);

            if (isActive) {
              colorEl.classList.add("color-sample-active");
            }

            colorEl.style.backgroundColor = justColor;
            colorEl.title = `${material.name} - ${justColor}`;
            colorEl.setAttribute("data-material", justMaterial);
            if(justName !== undefined) {
              colorEl.setAttribute("data-name", justName);
            }
            colorEl.addEventListener("click", () => {
              if(material.name === 'Pommel' || material.name === 'Bolster') {
                localStorage.setItem('savedColors', 'yes');
              }

              onClick(material.name, justColor);
              setTimeout(function(){
                if(chosenProductVariants) {
                  getNewPrice(getBespokeVariant());
                }
              }, 100)
            });
            colorEl.addEventListener("mouseenter", () => {
              if(material.name === 'Discs') {
                document.querySelector('div[data-type="Discs"] .group-header > span').innerText = '('+justName+')';
              }else{
                document.querySelector('div[data-type="'+material.name+'"] .group-header > span:nth-child(2)').style.display = 'none';
                document.querySelector('div[data-type="'+material.name+'"] .group-header > span').insertAdjacentHTML('afterend', '<span class="on-hover">('+justName+')</span>');
              }

              let activeKnife = document.querySelector('.bespoke-product.active')?.getAttribute('data-title')?.toLowerCase() || '';
              function addPriceTag(materialType, selectorClass) {
                if (material.name === materialType && colorEl.getAttribute('data-material').toLowerCase() === 'brass' && activeKnife !== '') {
                  let element = document.querySelector(`.bespoke-knife[data-knife="${activeKnife}"] div.${selectorClass}[data-title="brass"]`);
                  let price = element?.getAttribute('data-price') || '';

                  if (price) {
                    let section = document.querySelector(`.group-info[data-type="${materialType}"]`);
                    if (!section.querySelector('.section-price')) {
                      let priceDiv = document.createElement('div');
                      priceDiv.className = 'section-price section-price-hover';
                      priceDiv.textContent = `+${window.currency_symbol}${price}`;
                      section.appendChild(priceDiv);
                    }
                  }
                }
              }

              // Apply function for both 'Pommel' and 'Bolster'
              addPriceTag('Pommel', 'pommel');
              addPriceTag('Bolster', 'bolster');
            });
            colorEl.addEventListener("mouseleave", () => {
              if(material.name === 'Discs') {
                document.querySelector('div[data-type="Discs"] .group-header > span').innerText = '';
              }else{
                document.querySelector('div[data-type="'+material.name+'"] .group-header > span:nth-child(2)').style.display = 'block';
                document.querySelector('div[data-type="'+material.name+'"] .group-header span.on-hover').remove();
                document.querySelector('.group-info[data-type="'+material.name+'"] .section-price-hover').remove();
              }
            });

            return colorEl;
          }

          function createModelInfo(model) {
            const container = document.createElement("div");
            container.classList.add("model-info");

            const groups = getModelGroups(model);

            groups.forEach((group) => {
              const groupEl = document.createElement("div");
              groupEl.classList.add("group-info");
              groupEl.setAttribute('data-type', group.name);

              const groupHeader = document.createElement("div");
              groupHeader.classList.add("group-header");

              const groupName = document.createElement("h3");
              groupName.textContent = group.name; // Берем имя группы из refGroups
              const groupLabel = document.createElement("span");
              groupHeader.appendChild(groupName);
              groupHeader.appendChild(groupLabel);
              groupEl.appendChild(groupHeader);

              const colorsEl = document.createElement("div");
              colorsEl.classList.add("colors-container");

              const materials = group.groupedNodes[0]?.settingsData?.difmaps || [];
              const allMaterialsWithColors = materials.reduce((acc, material) => {
                material.colors.forEach(color => {
                  if(group.name === 'Rivet') {
                    acc.push(color+' - '+material.name);
                  }else{
                    acc.push(color.color+' - '+material.name+' - '+color.name);
                  }
                });
                return acc;
              }, []);

              // if(group.name === 'Pommel' || group.name === 'Bolster') {
              //   console.log('MATERIALS', materials);
              // }else{
              //
              // }

              // // Собираем все цвета из всех материалов группы
              // const allColors = materials.reduce((colors, material) => {
              //   colors.push(...material.colors);
              //   return colors;
              // }, []);
              // console.log(allColors);

              allMaterialsWithColors.forEach((color) => {
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

            const containerItems = document.createElement("div");
            containerItems.classList.add("items");

            const title = document.createElement("h3");
            title.textContent =
                    modelType === "handles" ? "Logic" : "Choose one";
            container.appendChild(title);

            models.forEach((model) => {
              const label = document.createElement("label");
              label.setAttribute('for', model.textFileName.split(' ').join('-').toLowerCase());

              const labelOuter = document.createElement("div");
              labelOuter.classList.add("step-item");

              const radio = document.createElement("input");
              radio.id = model.textFileName.split(' ').join('-').toLowerCase();
              radio.type = "radio";
              radio.name = `${modelType}-model`;
              radio.value = model.textFileName;

              // Проверяем активную модель используя appData
              const currentModel =
                      modelType === "handles"
                              ? appData.currentModels.handle
                              : appData.currentModels.blade;

              radio.checked = currentModel?.fileName === model.fileName;

              radio.addEventListener("change", () => {
                // console.log('geometry & logic change');

                const getCheckedValue = () => {
                  const checkedRadio = document.querySelector('input[name="model-steel"]:checked');
                  return checkedRadio ? checkedRadio.value : null;
                };
                chosenSteel = getCheckedValue();

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

                setTimeout(function(){
                  if(chosenProductVariants) {
                    getNewPrice(getBespokeVariant());
                  }
                }, 100)
              });

              const text = document.createElement("span");
              text.textContent = model.textFileName;

              label.appendChild(text);
              labelOuter.appendChild(radio);
              labelOuter.appendChild(label);
              containerItems.appendChild(labelOuter);
            });
            container.appendChild(containerItems);

            return container;
          }

          // Render Steel and Finish (Marina)
          function createModelSteelFinish(models) {
            const steelTypes = [];
            const steelArr = [];
            const sortedSteel = {};
            const finishSet = [];

            const steelModelSelector = document.createElement('div');
            steelModelSelector.className = 'model-selector';
            steelModelSelector.innerHTML = `<h3>Choose one</h3>`;

            const steelItems = document.createElement('div');
            steelItems.className = 'steel-items';

            models.forEach((model) => {
              const { refGroups } = model;
              const [firstGroup] = refGroups;  // Extracting first group directly
              const { groupedNodes } = firstGroup;

              groupedNodes.forEach(node => {
                // Collect finishes for the current node
                const finishList = node.settingsData.difmaps.slice();  // Clone the array

                // Check if the steel already exists in the finishSet
                const existingObject = finishSet.find(existing => existing.steel === node.name);
                if (!existingObject) {
                  finishSet.push({ steel: node.name, finishes: finishList });
                }

                // Push the steel object
                steelArr.push({ geometry: model.textFileName, steel: node.name });
              });
            });

            steelArr.forEach(({ steel, geometry }) => {
              if (!steelTypes.includes(steel)) steelTypes.push(steel);

              if (!sortedSteel[steel]) sortedSteel[steel] = [];
              sortedSteel[steel].push(geometry);
            });

            const grouped = steelArr.reduce((acc, { geometry, steel }) => {
              acc[steel] = acc[steel] || [];
              if (!acc[steel].includes(geometry)) acc[steel].push(geometry);
              return acc;
            }, {});

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

              steelRadio.onchange = () => {
                let steelGeometries = grouped[steelRadio.value];
                const steelName = item.split(' ').join('-').toLowerCase();

                const selectedFinishes = finishSet.find(finish => finish.steel === item);
                const selectedGeometry = sortedSteel[item];
                const geometryElements = document.querySelectorAll('#bladeGeometry .step-item');

                if (geometryElements.length > 0) {
                  geometryElements.forEach(item => item.style.display = 'none');
                }

                selectedGeometry.forEach(item => {
                  document.querySelectorAll('input[value="'+item+'"]').forEach(input => input.closest('.step-item').style.display = 'block');
                })

                const geometryInputs = document.querySelectorAll('#bladeGeometry input');
                const activeGeometry = document.querySelector('#bladeGeometry input:checked');

                let activeStepItem = activeGeometry?.closest('.step-item');
                if (activeStepItem?.style.display === 'none') {
                  const firstInput = geometryInputs[0];
                  firstInput.checked = true;
                  firstInput.dispatchEvent(new Event('change'));
                }

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
                      if (!finishRadio.checked) return;
                      allBlades.forEach(blade => {
                        if (blade.textFileName === textFileName) {
                          handleBladeFinish(blade);
                        }
                      });

                      setTimeout(function(){
                        if(chosenProductVariants) {
                          getNewPrice(getBespokeVariant());
                        }
                      }, 100)
                    };


                    finishItem.appendChild(finishRadio);
                    finishItem.appendChild(finishLabel);
                    let p = document.createElement("p");
                    p.appendChild(document.createTextNode(`${finish.name}`));
                    finishLabel.appendChild(p);

                    finishItems.appendChild(finishItem);
                  });

                  finishSelector.appendChild(finishItems);
                  step3Content.appendChild(finishSelector);

                  const allBlades = getModelsByType(appData.currentCollection, "blades");
                  const currentBlade = appData.currentModels.blade;
                  const { textFileName } = currentBlade;

                  allBlades.forEach(blade => {
                    if (blade.textFileName === textFileName) {
                      handleBladeFinish(blade);
                    }
                  });

                  function handleBladeFinish(blade) {
                    blade.refGroups[0]?.groupedNodes.forEach(finish => {
                      if (steelRadio.value === finish.name) {
                        updateBladeModel();
                      }
                    });
                  }
                  function updateBladeModel() {
                    const updatedBladeModel = {
                      ...currentBlade,
                      nodeMaterials: createNodeMaterials(currentBlade),
                    };

                    appData.currentModels.blade = updatedBladeModel;
                    document.shopifyConnect.triggerBladeModelChange(updatedBladeModel);
                  }
                }

                getElementInfo('#bladeGeometry','.step-item', 'geometry');
                getElementInfo('#bladeFinish','.finish-item', 'finish');

                setTimeout(function(){
                  if(chosenProductVariants) {
                    getNewPrice(getBespokeVariant());
                  }
                }, 100)
              };

              if(chosenSteel && chosenSteel === steelRadio.value) {
                steelRadio.checked = true;
                steelRadio.dispatchEvent(new Event('change'));
              }else{
                steelRadio.checked = index === 0;
              }

              if(index === 0) {
                steelRadio.dispatchEvent(new Event('change'));
              }

              steelItem.appendChild(steelRadio);
              steelItem.appendChild(steelLabel);
              let p = document.createElement("p");
              p.appendChild(document.createTextNode(`${item}`));
              steelLabel.appendChild(p);
              steelItems.appendChild(steelItem);
            });

            let finishList = '';
            finishSet.forEach((finish, index) => {
              finish.finishes.forEach((finishItem, index) => {
                finishList += '<li data-steel="' + finish.steel.split(' ').join('-').toLowerCase() + '">' + finishItem.name + '</li>';
              });
            });
            steelModelSelector.appendChild(steelItems);

            return steelModelSelector;
          }

          function displayModelInfo(handleModel, bladeModel) {
            const container = document.createElement("div");
            const step1Content = document.getElementById('bladeSteel');
            const step2Content = document.getElementById('bladeGeometry');
            const step4Content = document.getElementById('handleDesign');
            container.id = "models-display";


            const steelContainer = document.createElement('div');
            const geometryContainer = document.createElement('div');
            const handleContainer = document.createElement('div');

            if (appData.currentCollection) {
              const handleModels = getModelsByType(appData.currentCollection, "handles");
              const bladeModels = getModelsByType(appData.currentCollection, "blades");

              const handleSelector = createModelSelector(handleModels, "handles");
              const bladeSelector = createModelSelector(bladeModels, "blades");

              let currentStep = document.querySelector('.bespoke-step.active').getAttribute('id');

              const excludedSteps = ['logic', 'leather', 'colors', 'pommel', 'bolster'];
              if (currentStep !== 'handleDesign' && !excludedSteps.includes(stepInit)) {
                let steelSelector = createModelSteelFinish(bladeModels);
                step1Content.innerHTML = '<h2 class="section-title">Select Steel</h2>';

                steelContainer.classList.add('section-container');
                steelContainer.appendChild(steelSelector);
                step1Content.appendChild(steelContainer);
              }

              if(step2Content.innerHTML === '') {
                step2Content.innerHTML = '<h2 class="section-title">Select Geometry</h2>';

                geometryContainer.classList.add('section-container');
                geometryContainer.appendChild(bladeSelector);
                step2Content.appendChild(geometryContainer);
              }

              step4Content.innerHTML = '<h2 class="section-title">Design Handle</h2><span class="generate"><svg xmlns="http://www.w3.org/2000/svg" width="13.502" height="13.647" viewBox="0 0 13.502 13.647"><g id="noun-generate-6501311" transform="translate(-8.928 -2.674)"><path id="Path_38301" data-name="Path 38301" d="M56.608,23.792l.447.15a.5.5,0,0,1,.333.376l.258,1.3v.014l.014.018a.584.584,0,0,0,.519.319.576.576,0,0,0,.512-.319l.011-.021v-.011l.2-1.178a.733.733,0,0,1,.53-.537l1.149-.211H60.6l.014-.011a.563.563,0,0,0,.3-.476.546.546,0,0,0-.276-.49l-.025-.014h-.007l-.018-.011-1.16-.208a.739.739,0,0,1-.533-.533l-.208-1.16v-.011l-.011-.018a.547.547,0,0,0-.981,0l-.007.018v.011l-.211,1.16a.739.739,0,0,1-.533.533l-1.031.2h-.011L55.9,22.7l-.014.007a.574.574,0,0,0-.268.276.5.5,0,0,0-.011.379c.093.236.7.319,1.024.437Z" transform="translate(-38.488 -9.651)" fill="#381409"/><path id="Path_38303" data-name="Path 38303" d="M56.608,23.792l.447.15a.5.5,0,0,1,.333.376l.258,1.3v.014l.014.018a.584.584,0,0,0,.519.319.576.576,0,0,0,.512-.319l.011-.021v-.011l.2-1.178a.733.733,0,0,1,.53-.537l1.149-.211H60.6l.014-.011a.563.563,0,0,0,.3-.476.546.546,0,0,0-.276-.49l-.025-.014h-.007l-.018-.011-1.16-.208a.739.739,0,0,1-.533-.533l-.208-1.16v-.011l-.011-.018a.547.547,0,0,0-.981,0l-.007.018v.011l-.211,1.16a.739.739,0,0,1-.533.533l-1.031.2h-.011L55.9,22.7l-.014.007a.574.574,0,0,0-.268.276.5.5,0,0,0-.011.379c.093.236.7.319,1.024.437Z" transform="translate(-38.488 -17.786)" fill="#381409"/><path id="Path_38302" data-name="Path 38302" d="M34.846,9.853l.079.029.429,1.7.007.018.011.025a.787.787,0,0,0,.709.433.8.8,0,0,0,.7-.437l.014-.029v-.014l.422-1.722,1.7-.44.018-.007.018-.011a.754.754,0,0,0,.036-1.328l-.036-.021-.011-.007-.025-.007L37.2,7.6l-.433-1.718V5.866l-.014-.021a.753.753,0,0,0-1.346,0l-.011.021v.014L34.964,7.6l-1.7.429-.014.007-.014.007-.021.011a.77.77,0,0,0-.365.379.688.688,0,0,0-.014.519c.129.322,1.578.744,2.022.905Z" transform="translate(-23.859 0)" fill="#381409"/></g></svg>\nGenerate Design</span>';
              handleContainer.classList.add('section-container');
              handleContainer.appendChild(handleSelector);

              if (document.querySelector('.bespoke-product.active')){
                activeKnife = document.querySelector('.bespoke-product.active').getAttribute('data-title').toLowerCase();
              }else{
                activeKnife = document.querySelectorAll('.bespoke-product')[0].getAttribute('data-title').toLowerCase();
              }
              getElementInfo('#bladeSteel','.steel-item', 'steel');
            }
            if (handleModel) {
              const handleInfo = createModelInfo(handleModel);
              handleContainer.appendChild(handleInfo);
              step4Content.appendChild(handleContainer);
              getKnifeInfo();

              firstVariant = getBespokeVariant();
              if (window.location.search && window.location.search.indexOf('&') > -1 && initialize === 0) {
                windowLocationUsed = false;
                let search = window.location.search.split('?')[1].split('&');

                let knife = search[0].split('=')[1];
                document.querySelector('.bespoke-product[data-handle="' + knife + '"]')?.click();

                setTimeout(function(){
                  for(let i = 1; i < search.length; i++) {
                    let knifeEl = search[i].split('=');

                    if(knifeEl[0] === 'steel') {
                      stepInit = 'steel';
                      document.querySelector('#bladeSteel label[for="'+knifeEl[1]+'"]').click();
                    }
                    if(knifeEl[0] === 'geometry') {
                      stepInit = 'geometry';
                      document.querySelector('#bladeGeometry label[for="'+knifeEl[1]+'"]').click();
                    }
                    if(knifeEl[0] === 'finish') {
                      stepInit = 'finish';
                      document.querySelector('#bladeFinish label[for="'+knifeEl[1]+'"]').click();
                    }
                    if(knifeEl[0] === 'logic') {
                      stepInit = 'logic';
                      document.querySelector('#handleDesign label[for="'+knifeEl[1]+'"]').click();
                    }

                    if (knifeEl[0] === 'leather') {
                      document
                              .querySelector('.group-info[data-type="Leather Spacers"] .color-sample-active')
                              ?.classList.remove('active');

                      let leatherList = knifeEl[1].split('_');

                      leatherList.forEach(label => {
                        stepInit = 'leather';
                        let button = document.querySelector(`.group-info[data-type="Leather Spacers"] button[data-name="${label}"]:not(.color-sample-active)`);
                        button?.click();
                      });
                    }
                    if (knifeEl[0] === 'colors') {
                      document
                              .querySelector('.group-info[data-type="Discs"] .color-sample-active')
                              ?.classList.remove('active');

                      let colorsList = knifeEl[1].split('_');

                      colorsList.forEach(color => {
                        stepInit = 'colors';
                        let formattedColor = color.split('%20').join(' '); // Replace '%20' with spaces
                        let button = document.querySelector(`.group-info[data-type="Discs"] button[data-name="${formattedColor}"]:not(.color-sample-active)`);
                        button?.click();
                      });
                    }
                    if(knifeEl[0] === 'pommel') {
                      stepInit = 'pommel';
                      $('.group-info[data-type="Pommel"] button[data-name="'+knifeEl[1]+'"]:not(.color-sample-active)').trigger('click');
                    }
                    if(knifeEl[0] === 'bolster') {
                      stepInit = 'bolster';
                      $('.group-info[data-type="Bolster"] button[data-name="'+knifeEl[1]+'"]:not(.color-sample-active)').trigger('click');
                    }
                    if (knifeEl[0] === 'laser') {
                      if (knifeEl[1] !== 'no-engraving') {
                        let label = document.querySelector('#laserEngraving label[for="laser-engraving"]');
                        let input = document.querySelector('#laserEngraving label[for="laser-engraving"] input');

                        label?.click();
                        if (input) input.value = knifeEl[1];
                      }
                    }

                    if (knifeEl[0] === 'addons') {
                      let addonsItems = knifeEl[1].split('_');

                      addonsItems.forEach(addon => {
                        document.querySelector(`#optionalAddons .addons-list label[for="${addon}"]`)?.click();
                      });
                    }
                  }
                  setTimeout(function(){
                    if(chosenProductVariants) {
                      getNewPrice(getBespokeVariant());
                    }
                  }, 100)

                  document.querySelector('.bcf-cat')?.click();
                  windowLocationUsed = true;
                },500)
                initialize = 1;
              }
              if (window.location.search && window.location.search.indexOf('&') === -1 && initialize === 0) {
                let searchKnife = window.location.search.split('=')[1];
                document.querySelector('.bespoke-product[data-handle="' + searchKnife + '"]')?.click();
                initialize = 1;
              }
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

          function customizerSteps(){
            const allSteps = document.querySelectorAll(".bespoke-step");
            const stepCount = allSteps.length;
            const backButton = document.querySelector(".customizer-header .ch-back");
            const backButtonMobile = document.querySelector(".customizer-header-mobile .ch-back");
            const nextButton = document.querySelector(".customizer-footer .cf-next");
            const addToCart = document.querySelector(".customizer-footer .cf-add-to-cart");
            const changeButton = document.querySelector(".customizer-header .ch-change");
            const changeButtonMobile = document.querySelector(".customizer-header-mobile .ch-change");
            const shareButton = document.querySelector(".customizer-header .ch-share");
            const shareButtonMobile = document.querySelector(".customizer-header-mobile .ch-share");
            const changeViewButton = document.querySelector('.bespoke-change-view');

            allSteps[0].classList.add('active');
            laserStep();

            nextButton.addEventListener("click", () => {
              const activeStep = document.querySelector(".bespoke-step.active");
              if (activeStep) {
                getKnifeInfo();

                const activeStepIndex = Array.from(allSteps).indexOf(activeStep);
                allSteps[activeStepIndex].classList.remove('active');
                allSteps[activeStepIndex + 1].classList.add('active');
                if(allSteps[activeStepIndex + 1].getAttribute('id') === 'optionalAddons') {
                  document.querySelector('.bespoke-customizer').classList.add('optionalAddons');
                }else{
                  document.querySelector('.bespoke-customizer').classList.remove('optionalAddons');
                }

                document.querySelector('.customizer-header .ch-back .ch-step span').innerText = activeStepIndex + 2;
                document.querySelector('.customizer-header-mobile .ch-back .ch-step span').innerText = activeStepIndex + 2;
                if (activeStepIndex + 2 === 7) {
                  nextButton.style.display = 'none';
                  addToCart.style.display = 'flex';
                }

                const step = activeStepIndex + 3;
                setPosition(step);

                if(activeStepIndex + 2 === 5) {
                  document.querySelector('#canvas').classList.add('nomove');
                  setTimeout(function(){
                    document.querySelector('.canvas-engraving').classList.add('shown');
                  }, 900)
                }else{
                  document.querySelector('#canvas').classList.remove('nomove');
                  document.querySelector('.canvas-engraving').classList.remove('shown');
                }
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

                  const step = activeStepIndex + 1;
                  setPosition(step);
                  // const [x, y, z] = getCameraSettings(window.innerWidth, step);
                  // setCameraPosition(step, x, y, z);
                }else{
                  changeButton.click();
                }


                if(activeStepIndex === 5) {
                  document.querySelector('#canvas').classList.add('nomove');
                  setTimeout(function(){
                    document.querySelector('.canvas-engraving').classList.add('shown');
                  }, 900)
                }else{
                  document.querySelector('#canvas').classList.remove('nomove');
                  document.querySelector('.canvas-engraving').classList.remove('shown');
                }
              }
            });
            backButtonMobile.addEventListener("click", () => {
              const activeStep = document.querySelector(".bespoke-step.active");
              if (activeStep) {
                const activeStepIndex = Array.from(allSteps).indexOf(activeStep);
                if (activeStepIndex > 0) {
                  allSteps[activeStepIndex].classList.remove('active');
                  allSteps[activeStepIndex - 1].classList.add('active');
                  if(allSteps[activeStepIndex - 1].getAttribute('id') === 'optionalAddons') {
                    document.querySelector('.bespoke-customizer').classList.add('optionalAddons');
                  }else{
                    document.querySelector('.bespoke-customizer').classList.remove('optionalAddons');
                  }

                  document.querySelector('.customizer-header-mobile .ch-back .ch-step span').innerText = activeStepIndex;
                  nextButton.style.display = 'flex';
                  addToCart.style.display = 'none';

                  const step = activeStepIndex + 1;
                  setPosition(step);
                  // const [x, y, z] = getCameraSettings(window.innerWidth, step);
                  // setCameraPosition(step, x, y, z);
                }else{
                  changeButtonMobile.click();
                }
              }
            });
            changeButton.addEventListener("click", () => {
              document.querySelector('.canvas-engraving').classList.remove('shown');
              saveBespokeKnife($('.bespoke-product.active').attr('data-handle'));

              document.querySelector('body.bespoke-intro .bespoke-customizer').classList.remove('show');
              allSteps.forEach(step => step.classList.remove('active'));
              allSteps[0].classList.add('active');
              laserStep();
              document.querySelector('.customizer-header .ch-back .ch-step span').innerText = '1';

              setPosition(1);
              document.querySelector('body.bespoke-intro .bespoke-choice').classList.remove('non-visible');
            });
            changeButtonMobile.addEventListener("click", () => {
              document.querySelector('.canvas-engraving').classList.remove('shown');
              saveBespokeKnife($('.bespoke-product.active').attr('data-handle'));

              document.querySelector('body.bespoke-intro .bespoke-list .swiper-wrapper').classList.remove('chosen');
              document.querySelector('body.bespoke-intro .bespoke-list .swiper-wrapper .swiper-slide.active').classList.remove('active');
              document.querySelector('body.bespoke-intro #MainContent .bespoke-choice .bespoke-choice-footer.show').classList.add('inactive');

              document.querySelector('.bespoke-customizer').classList.remove('show');
              allSteps.forEach(step => step.classList.remove('active'));
              allSteps[0].classList.add('active');
              laserStep();
              document.querySelector('.customizer-header-mobile .ch-back .ch-step span').innerText = '1';

              setPosition(1);
              document.querySelector('body.bespoke-intro .bespoke-choice').classList.remove('non-visible');
              document.querySelector('body.bespoke-intro').classList.remove('bespoke-chosen');
              document.querySelector('.bespoke-customizer').classList.remove('optionalAddons');
              document.querySelector('.bespoke-addons-images .img').classList.remove('show');
            });
            shareButton.addEventListener("click",() => {
              shareButton.classList.add('copied');
              copyToClipboard(window.location.href.split('?')[0]+'?'+buildUrl());

              setTimeout(function(name) {
                shareButton.classList.remove('copied');
              }, 1000);
            });
            shareButtonMobile.addEventListener("click",() => {
              shareButtonMobile.classList.add('copied');
              copyToClipboard(window.location.href.split('?')[0]+'?'+buildUrl());

              setTimeout(function(name) {
                shareButtonMobile.classList.remove('copied');
              }, 1000);
            });
            addToCart.addEventListener("click", () => {
              const foundVariant = chosenProductVariants.find(
                      (variant) => {
                        return variant.title.toLowerCase() === getBespokeVariant().toLowerCase();
                      }
              );

              let customCartInfo = [];
              let customName = document.querySelector('.bespoke-product.active .bp-title').textContent;
              let customVariant = foundVariant.id;
              let customModel = document.querySelector('.bespoke-product.active').getAttribute('data-handle');
              let customSteel = document.querySelector('#bladeSteel input:checked')?.value;
              let customGeometry = document.querySelector('#bladeGeometry input:checked')?.value;
              let customFinish = document.querySelector('#bladeFinish input:checked')?.value;
              let customPommel = document.querySelector('.group-info[data-type="Pommel"] .color-sample-active').getAttribute('data-name');
              let customBolster = document.querySelector('.group-info[data-type="Bolster"] .color-sample-active').getAttribute('data-name');
              let customLogic = document.querySelector('#handleDesign .model-selector input:checked').value;
              let customNotes = document.querySelector('#orderNotes textarea').value;
              let customQuantity = 1;

              let checkedInputs = document.querySelectorAll('#optionalAddons input:checked');
              let customAddons = Array.from(checkedInputs).map(input => input.id);

              let customAddonsQuantity = Array.from(document.querySelectorAll('#optionalAddons input:checked')).map(input => input.getAttribute('data-inventory') || null);

              let allLeather = document.querySelectorAll('.group-info[data-type="Leather Spacers"] .color-sample-active');
              let leatherArr = [];
              allLeather.forEach(button => {
                leatherArr.push(button.getAttribute('data-name'));
              });
              let customLeather = leatherArr.join(', ');

              let allColors = document.querySelectorAll('.group-info[data-type="Discs"] .color-sample-active');
              let colorsArr = [];
              allColors.forEach(button => {
                colorsArr.push(button.getAttribute('data-name'));
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

            changeViewButton.addEventListener('click', function () {
              const customizer = document.querySelector('.bespoke-customizer');
              if (!customizer.classList.contains('show')) {
                setPosition(1);
                return;
              }

              let currentStep;
              if(window.innerWidth > 1024) {
                currentStep = parseInt(document.querySelector('.customizer-header .ch-step span').innerText);
              }else{
                currentStep = parseInt(document.querySelector('.customizer-header-mobile .ch-step span').innerText);
              }
              let positionStep = currentStep + 1;
              setPosition(positionStep);

              // const [x, y, z] = getCameraSettings(window.innerWidth, positionStep);
              // setCameraPosition(positionStep, x, y, z);
            });
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
                            '<input type="text" maxlength="18" placeholder="Type your engraving here" style="display:none;"/>'+
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
            $('.bespoke-step .laser-selector > ul li label > input[type="text"]').on('input', function() {
              $('.canvas-engraving').text($(this).val());
            });



            // Add an event listener to each input element
            engravingInputs.forEach(input => {
              input.addEventListener('change', function() {
                if(input.getAttribute('id') === 'no-engraving') {
                  document.querySelector('.canvas-engraving').classList.add('gone');
                }else{
                  document.querySelector('.canvas-engraving').classList.remove('gone');
                }
                setTimeout(function(){
                  if(chosenProductVariants) {
                    getNewPrice(getBespokeVariant());
                  }
                },100)
              });
            });
          }

          function getElementInfo(element, item, type){
            $(element).find(item).each(function(){
              let itemTitle = $(this).find('input').val().toLowerCase();
              let itemDiv = $('.bespoke-knife[data-knife="'+activeKnife+'"] div.'+type+'[data-title="'+itemTitle+'"]');

              let itemComingSoon = itemDiv.attr('data-comingsoon');
              let itemDescription = itemDiv.find('.description').html();
              let itemPrice = parseInt(itemDiv.attr('data-price'));

              if($(this).find('.el-description').length) {
                $(this).find('.el-description').remove();
              }
              if($(this).find('.el-price').length) {
                $(this).find('.el-price').remove();
              }

              if(itemDiv.length) {
                $(this).attr('data-comingsoon',itemComingSoon);
                $(this).find('label').append('<div class="el-description">'+itemDescription+'</div>');
                if(itemPrice > 0){
                  $(this).find('label').append('<div class="el-price">+'+window.currency_symbol+itemPrice+'</div>');
                }
              }
            })
          }

          function setCameraPosition(positionName, minD, maxD, defaultD) {
          if (document.shopifyConnect) {
              document.shopifyConnect.setCameraSettings(positionName, {
                  minDistance: minD,
                  maxDistance: maxD,
                  defaultDistance: defaultD
              });

              document.shopifyConnect._forceReinitCamera = true;

              setTimeout(() => {
                  document.shopifyConnect.triggerCameraPositionChange(positionName);
              }, 50);
          }
          }

          function setPosition(type) {
            // Определение имен позиций для разных типов обзора
            const positionNames = {
              large: {
                1: "Large—Select",
                2: "Large—Steel",
                3: "Large—Geometry",
                4: "Large—Finish",
                5: "Large—Handle",
                6: "Large—Engraving—Flipped",
                7: "Large—Addons/Notes",
                8: "Large—Addons/Notes"
              },
              medium: {
                1: "Medium—Select",
                2: "Medium—Steel",
                3: "Medium—Geometry",
                4: "Medium—Finish",
                5: "Medium—Handle",
                6: "Medium—Engraving—Flipped",
                7: "Medium—Addons/Notes",
                8: "Medium—Addons/Notes"
              },
              small: {
                1: "Small—Select",
                2: "Small—Steel",
                3: "Small—Geometry",
                4: "Small—Finish",
                5: "Small—Handle",
                6: "Small—Engraving—Flipped",
                7: "Small—Addons/Notes",
                8: "Small—Addons/Notes"
              }
            };

            let knifeActive = document.querySelector('.bespoke-product.active');
            let knifeSize;
            if(knifeActive) {
              let knifeActiveHandle = knifeActive.getAttribute('data-handle');
              knifeSize = document.querySelector('.bespoke-knife[data-knife='+knifeActiveHandle+']').getAttribute('data-size');
            }else{
              knifeSize = 'large';
            }
            let positionName = positionNames[knifeSize]?.[type] || `${knifeSize.charAt(0).toUpperCase() + knifeSize.slice(1)}—Select`;

            const longShot = [
              { max: 500, position: [100, 300, 300] },
              { max: 820, position: [100, 400, 250] },
              { max: 1024, position: [100, 500, 300] },
              { max: 1440, position: [200, 600, 350] },
              { max: 1750, position: [200, 600, 400] },
              { max: 1920, position: [200, 600, 400] },
              { max: Infinity, position: [200, 600, 400] }
            ];
            const closeUp = [
              { max: 500, position: [100, 200, 200] },
              { max: 820, position: [100, 300, 180] },
              { max: 1024, position: [100, 340, 220] },
              { max: 1440, position: [200, 400, 220] },
              { max: 1750, position: [200, 400, 260] },
              { max: 1920, position: [200, 600, 300] },
              { max: Infinity, position: [200, 600, 300] }
            ];
            const dutchAngle = [
              { max: 500, position: [100, 250, 220] },
              { max: 1024, position: [100, 340, 220] },
              { max: 1440, position: [200, 500, 250] },
              { max: 1750, position: [200, 500, 270] },
              { max: 1920, position: [200, 500, 300] },
              { max: Infinity, position: [200, 600, 350] }
            ];
            const closeUpHandle = [
              { max: 500, position: [100, 250, 200] },
              { max: 1024, position: [100, 300, 220] },
              { max: 1440, position: [150, 500, 190] },
              { max: 1750, position: [200, 500, 235] },
              { max: 1920, position: [150, 500, 195] },
              { max: Infinity, position: [200, 600, 205] }
            ];
            const backShot = [
              { max: 500, position: [100, 250, 200] },
              { max: 1024, position: [100, 300, 220] },
              { max: 1750, position: [200, 500, 270] },
              { max: 1920, position: [200, 500, 320] },
              { max: Infinity, position: [200, 600, 320] }
            ];

            const longShotSmall = [
              { max: 500, position: [100, 300, 270] },
              { max: 820, position: [100, 400, 220] },
              { max: 1024, position: [100, 500, 220] },
              { max: 1440, position: [200, 600, 320] },
              { max: 1750, position: [200, 600, 340] },
              { max: 1920, position: [200, 600, 330] },
              { max: Infinity, position: [200, 600, 350] }
            ];
            const closeUpSmall = [
              { max: 500, position: [100, 200, 180] },
              { max: 820, position: [100, 300, 150] },
              { max: 1024, position: [100, 340, 150] },
              { max: 1440, position: [200, 400, 220] },
              { max: 1750, position: [200, 400, 260] },
              { max: 1920, position: [200, 600, 230] },
              { max: Infinity, position: [200, 600, 240] }
            ];
            const dutchAngleSmall = [
              { max: 500, position: [100, 250, 200] },
              { max: 1024, position: [100, 340, 200] },
              { max: 1440, position: [200, 500, 250] },
              { max: 1750, position: [200, 500, 230] },
              { max: 1920, position: [200, 500, 250] },
              { max: Infinity, position: [200, 600, 250] }
            ];
            const closeUpHandleSmall = [
              { max: 500, position: [100, 250, 165] },
              { max: 1024, position: [100, 300, 140] },
              { max: 1440, position: [150, 500, 190] },
              { max: 1750, position: [200, 500, 235] },
              { max: 1920, position: [150, 500, 195] },
              { max: Infinity, position: [200, 600, 205] }
            ];
            const backShotSmall = [
              { max: 500, position: [100, 250, 160] },
              { max: 1024, position: [100, 300, 140] },
              { max: 1440, position: [150, 500, 190] },
              { max: 1750, position: [150, 500, 200] },
              { max: 1920, position: [200, 500, 220] },
              { max: Infinity, position: [200, 600, 230] }
            ];
          
            const baseBreakpoints = {
              1: longShot,
              2: closeUp,
              3: dutchAngle,
              4: closeUp,
              5: closeUpHandle,
              6: backShot,
              7: longShot,
              8: longShot
            };
            const smallBreakpoints = {
              1: longShotSmall,
              2: closeUpSmall,
              3: dutchAngleSmall,
              4: closeUpSmall,
              5: closeUpHandleSmall,
              6: backShotSmall,
              7: longShotSmall,
              8: longShotSmall
            };

            let breakpoints = { ...baseBreakpoints };
            if(knifeSize === 'large') {
              document.querySelector('body').classList.remove('bespoke-medium', 'bespoke-small');
            }else if(knifeSize === 'medium') {
              document.querySelector('body').classList.remove('bespoke-small');
              document.querySelector('body').classList.add('bespoke-medium');
            }else{
              breakpoints = { ...smallBreakpoints };
              document.querySelector('body').classList.remove('bespoke-medium');
              document.querySelector('body').classList.add('bespoke-small');
            }

            // Определяем, какой набор контрольных точек использовать
            const selectedBreakpoints = breakpoints[type] || longShot;

            console.log(selectedBreakpoints);
          
            // Перебираем контрольные точки и находим подходящую на основе ширины окна
            for (let i = 0; i < selectedBreakpoints.length; i++) {
              if (window.innerWidth <= selectedBreakpoints[i].max) {
                const [minD, maxD, defaultD] = selectedBreakpoints[i].position;
                setCameraPosition(positionName, minD, maxD, defaultD);
                break;
              }
            }
          }

          function getCameraSettings(width, step) {
            const sizeSettings = [
              { max: 500,
                settings: {
                  3: [100, 250, 180],
                  7: [100, 250, 250],
                  8: [100, 250, 250],
                  default: [100, 250, 180] } },
              { max: 1024,
                settings: {
                  3: [100, 300, 220],
                  7: [100, 300, 300],
                  8: [100, 300, 300],
                  default: [100, 300, 220] } },
              { max: 1750,
                settings: {
                  3: [200, 500, 270],
                  7: [200, 500, 400],
                  8: [200, 500, 400],
                  default: [200, 500, 270] } },
              { max: 1920,
                settings: {
                  3: [200, 500, 300],
                  7: [200, 600, 400],
                  8: [200, 600, 400],
                  default: [200, 500, 320] } },
              { max: Infinity,
                settings: {
                  3: [200, 600, 350],
                  7: [300, 850, 750],
                  8: [300, 850, 750],
                  default: [200, 600, 320] } }
            ];

            for (const { max, settings } of sizeSettings) {
              if (width <= max) {
                return settings[step] || settings.default;
              }
            }
          }


          function getKnifeInfo(){
            const activeElement = document.querySelector('.bespoke-product.active')?.getAttribute('data-title')?.toLowerCase();
            let knifeArray = [];

            document.querySelectorAll('.bespoke-knife').forEach(thisElement => {
              if(thisElement.getAttribute('data-knife').toLowerCase() === activeKnife) {
                Array.from(thisElement.children).forEach(child => {
                  if (child.getAttribute('data-title') !== null) {
                    knifeArray.push({
                      type: child.className,
                      title: child.getAttribute('data-title').toLowerCase(),
                      description: child.querySelector('.description')?.textContent.trim() || '',
                      price: child.getAttribute('data-price') || ''
                    });
                  }
                })

                getElementInfo('#bladeSteel','.steel-item', 'steel');
                getElementInfo('#bladeGeometry','.step-item', 'geometry');
                getElementInfo('#bladeFinish','.finish-item', 'finish');


                let activeLsLabels = Array.from(document.querySelectorAll('.group-info[data-type="Leather Spacers"] .color-sample-active'))
                        .map(el => el.getAttribute('data-name'))
                        .join(', ');

                // Get active labels
                let activePommelLabel = document.querySelector('.group-info[data-type="Pommel"] .color-sample-active')?.getAttribute('data-name') || '';
                let activeBolsterLabel = document.querySelector('.group-info[data-type="Bolster"] .color-sample-active')?.getAttribute('data-name') || '';

                // Get materials
                let pommelMaterial = document.querySelector('.group-info[data-type="Pommel"] .color-sample-active')?.getAttribute('data-material') || '';
                let bolsterMaterial = document.querySelector('.group-info[data-type="Bolster"] .color-sample-active')?.getAttribute('data-material') || '';

                // Get active knife
                let activeKnife = document.querySelector('.bespoke-product.active')?.getAttribute('data-title')?.toLowerCase() || '';

                if (pommelMaterial === 'Brass' && activeKnife !== '') {
                  let pommelElement = document.querySelector(`.bespoke-knife[data-knife="${activeKnife}"] div.pommel[data-title="brass"]`);
                  let pommelPrice = pommelElement?.getAttribute('data-price') || '';
                  if (pommelPrice) {
                    let pommelSection = document.querySelector('.group-info[data-type="Pommel"]');
                    let priceDiv = document.createElement('div');
                    priceDiv.className = 'section-price';
                    priceDiv.textContent = `+${window.currency_symbol}${pommelPrice}`;
                    pommelSection.appendChild(priceDiv);
                  }
                }
                if (bolsterMaterial === 'Brass' && activeKnife !== '') {
                  let bolsterElement = document.querySelector(`.bespoke-knife[data-knife="${activeKnife}"] div.bolster[data-title="brass"]`);
                  let bolsterPrice = bolsterElement?.getAttribute('data-price') || '';
                  if (bolsterPrice) {
                    let bolsterSection = document.querySelector('.group-info[data-type="Bolster"]');
                    let priceDiv = document.createElement('div');
                    priceDiv.className = 'section-price';
                    priceDiv.textContent = `+${window.currency_symbol}${bolsterPrice}`;
                    bolsterSection.appendChild(priceDiv);
                  }
                }

                document.querySelector('.group-info[data-type="Leather Spacers"] .group-header span').textContent = `(${activeLsLabels})`;
                document.querySelector('.group-info[data-type="Pommel"] .group-header span').textContent = `(${activePommelLabel})`;
                document.querySelector('.group-info[data-type="Bolster"] .group-header span').textContent = `(${activeBolsterLabel})`;

              }
            })
          }

          function getBespokeVariant() {
            const bladeSteel = document.querySelector('#bladeSteel input:checked')?.value;
            const bladeFinish = document.querySelector('#bladeFinish input:checked')?.value;
            const bladeGeometry = document.querySelector('#bladeGeometry input:checked')?.value;

            const pommelMaterial = document.querySelector('.group-info[data-type="Pommel"] .color-sample-active')?.getAttribute('data-material');
            const bolsterMaterial = document.querySelector('.group-info[data-type="Bolster"] .color-sample-active')?.getAttribute('data-material');

            let bespokeChosenMaterial = 'Unknown';

            if (pommelMaterial && bolsterMaterial) {
              bespokeChosenMaterial = (pommelMaterial === bolsterMaterial) ? pommelMaterial : `Micarta | Brass`;
            }

            return (bladeSteel && bladeFinish && bladeGeometry)
                    ? `${bladeSteel} | ${bladeFinish} / ${bladeGeometry} / ${bespokeChosenMaterial}`
                    : null;
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
            const optionalAddons = document.querySelector('#optionalAddons');
            const addons = optionalAddons.querySelectorAll('.addon');

            if (addons.length > 0) {
              addons.forEach(addon => {
                const checkbox = addon.querySelector('input[type="checkbox"]');
                if (checkbox && checkbox.checked) {
                  const price = parseInt(addon.getAttribute('data-price'), 10);
                  addonsPrice += price;
                }
              });
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

          function buildUrl(){
            let bespokeUrl = '';
            if(document.querySelector('.bespoke-product.active')) {
              let knife = document.querySelector('.bespoke-product.active').getAttribute('data-handle');
              let steel = document.querySelector('#bladeSteel input:checked').getAttribute('id');
              let geometry = document.querySelector('#bladeGeometry input:checked').getAttribute('id');
              let finish = document.querySelector('#bladeFinish input:checked').getAttribute('id');
              let logic = document.querySelector('#handleDesign .model-selector input:checked').getAttribute('id');

              let allLeather = document.querySelectorAll('.group-info[data-type="Leather Spacers"] .color-sample-active');
              let leatherArr = [];
              allLeather.forEach(button => {
                leatherArr.push(button.getAttribute('data-name'));
              });
              let leather = leatherArr.join('_');

              let allColors = document.querySelectorAll('.group-info[data-type="Discs"] .color-sample-active');
              let colorsArr = [];
              allColors.forEach(button => {
                colorsArr.push(button.getAttribute('data-name'));
              });
              let colors = colorsArr.join('_');

              let pommel = document.querySelector('.group-info[data-type="Pommel"] .color-sample-active').getAttribute('data-name');
              let bolster = document.querySelector('.group-info[data-type="Bolster"] .color-sample-active').getAttribute('data-name');
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

            return bespokeUrl;
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

                  cartHtml += '<div class="cartItem" data-product-id="'+cartItem.product_id+'" data-id="'+cartItem.id+'">' +
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
                    const cartItem = target.closest('.cartItem');
                    const cartItemId = cartItem?.getAttribute('data-id');

                    if (target.classList.contains('remove')) {
                      updateCartQuantity(cartItemId, 0);
                    } else if (target.matches('button[name="minus"], button[name="plus"]')) {
                      const inputField = target.parentElement.querySelector('input[type="number"]');
                      let currentQuantity = parseInt(inputField.value, 10);

                      if (target.name === "minus" && currentQuantity > 1) {
                        updateCartQuantity(cartItemId, currentQuantity - 1);
                      } else if (target.name === "plus") {
                        updateCartQuantity(cartItemId, currentQuantity + 1);
                      }
                    }

                    function updateCartQuantity(cartItemId, newQuantity) {
                      $.ajax({
                        url: `/cart/change.js`,
                        method: "POST",
                        data: { quantity: newQuantity, id: cartItemId },
                        success: function(cart) {
                          buildCart();
                        },
                        error: function(xhr, status, error) {
                          console.error("Error updating cart:", error);
                        }
                      });
                    }
                  });
                }
              }
            });
          }

          function saveBespokeKnife(knife){
            sessionStorage.setItem(knife, buildUrl());
            console.log(window.sessionStorage);
          }

          async function copyToClipboard(text) {
            try {
              await navigator.clipboard.writeText(text);
            } catch (err) {
              console.error('Failed to copy:', err);
            }
          }
          async function initializeApp() {
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
                  setMaterialForGroup(group.name, firstMaterial.colors[0].color);
                }
              });

              selectModels(initialHandle, initialBlade);



              if (appData.globalOptions) {
                document.shopifyConnect.triggerGlobalOptionsChange(appData.globalOptions);
              }
            }
          }

          document.addEventListener('click', function(event) {
            if (event.target.closest('.bespoke-step .generate')) {


              function generateKnifeHandle() {
                // Get all available parts
                const leatherSpacers = document.querySelectorAll('.group-info[data-type="Leather Spacers"] button.color-sample');
                const discs = document.querySelectorAll('.group-info[data-type="Discs"] button.color-sample');
                const pommels = document.querySelectorAll('.group-info[data-type="Pommel"] button.color-sample');
                const bolsters = document.querySelectorAll('.group-info[data-type="Bolster"] button.color-sample');

                // Count available elements
                const numLeatherSpacers = leatherSpacers.length;
                const numDiscs = discs.length;

                // Ensure at least one of each
                if (numLeatherSpacers === 0 || numDiscs === 0 || pommels.length === 0 || bolsters.length === 0) {
                  console.error("Not enough parts to generate a handle.");
                  return;
                }

                // Randomly select 1 Pommel and 1 Bolster
                const selectedPommel = pommels[Math.floor(Math.random() * pommels.length)];
                const selectedBolster = bolsters[Math.floor(Math.random() * bolsters.length)];

                // Randomly select Leather Spacers (at least 1)
                const numSelectedLeatherSpacers = Math.max(1, Math.floor(Math.random() * numLeatherSpacers) + 1);
                const selectedLeatherSpacers = Array.from(leatherSpacers).sort(() => 0.5 - Math.random()).slice(0, numSelectedLeatherSpacers);

                // Randomly select Discs (at least 1)
                const numSelectedDiscs = Math.max(1, Math.floor(Math.random() * numDiscs) + 1);
                const selectedDiscs = Array.from(discs).sort(() => 0.5 - Math.random()).slice(0, numSelectedDiscs);


                updateLeatherSpacersStatus(selectedLeatherSpacers);
                updateDiscsStatus(selectedDiscs);

                if(!selectedPommel.classList.contains("color-sample-active")){
                  selectedPommel.click();
                }
                if(!selectedBolster.classList.contains("color-sample-active")){
                  selectedBolster.click();
                }
              }
              function updateLeatherSpacersStatus(selectedLeatherSpacers) {
                // Loop through all selected leather spacers
                selectedLeatherSpacers.forEach(spacer => {
                  // If it's not already active, click on it
                  if (!spacer.classList.contains('color-sample-active')) {
                    spacer.click();
                  }
                });

                // Loop through all other leather spacers that are NOT in selectedLeatherSpacers
                document.querySelectorAll('.group-info[data-type="Leather Spacers"] button.color-sample').forEach(spacer => {
                  if (!selectedLeatherSpacers.includes(spacer)) {
                    // If they have the active class, remove it
                    spacer.click();
                  }
                });
              }
              function updateDiscsStatus(selectedDiscs) {
                // Loop through all selected leather spacers
                selectedDiscs.forEach(disc => {
                  // If it's not already active, click on it
                  if (!disc.classList.contains('color-sample-active')) {
                    disc.click();
                  }
                });

                // Loop through all other leather spacers that are NOT in selectedLeatherSpacers
                document.querySelectorAll('.group-info[data-type="Discs"] button.color-sample').forEach(disc => {
                  if (!selectedDiscs.includes(disc)) {
                    // If they have the active class, remove it
                    disc.click();
                  }
                });
              }

              // Example usage
              generateKnifeHandle();

            }
          });

          document.addEventListener("DOMContentLoaded", initializeApp);
          document.addEventListener('DOMContentLoaded', customizerSteps);
        </script>
      </div>
      <div class="customizer-footer">
        <div class="cf-subtotal">Subtotal<span class="subtotal-price">From 200</span></div>
        <div class="cf-next">Next step</div>
        <div class="cf-add-to-cart" style="display:none;">Add to cart</div>
      </div>
    </div>
    <div class="bespoke-addons-images"></div>
  </div>
  <div class="bespoke-choice">
    <div class="bespoke-time">
      <span>Current lead time: <span>2-4 weeks</span></span>
      <span class="close">Close</span>
    </div>
    <div class="bespoke-list swiper">
      {% render 'bespoke-collection' %}
    </div>
    <div class="bespoke-choice-footer">
      <div class="bcf-subtotal">Subtotal<span>From <span></span></span></div>
      <div class="bcf-cat">Start customising</div>
    </div>
  </div>
  <button class="bespoke-start" style="display:none;">Start customising</button>
</main>

<ul hidden>
  <li id="a11y-refresh-page-message">{{ 'accessibility.refresh_page' | t }}</li>
  <li id="a11y-new-window-message">{{ 'accessibility.link_messages.new_window' | t }}</li>
</ul>

<script>
  var currency;
  window.currency = '{{ cart.currency.iso_code }}';
  window.currency_symbol = '{{ cart.currency.symbol }}';

  window.shopUrl = '{{ request.origin }}';
  window.routes = {
    cart_add_url: '{{ routes.cart_add_url }}',
    cart_change_url: '{{ routes.cart_change_url }}',
    cart_update_url: '{{ routes.cart_update_url }}',
    cart_url: '{{ routes.cart_url }}',
    predictive_search_url: '{{ routes.predictive_search_url }}',
  };

  window.cartStrings = {
    error: `{{ 'sections.cart.cart_error' | t }}`,
    quantityError: `{{ 'sections.cart.cart_quantity_error_html' | t: quantity: '[quantity]' }}`,
  };

  window.variantStrings = {
    addToCart: `{{ 'products.product.add_to_cart' | t }}`,
    soldOut: `{{ 'products.product.sold_out' | t }}`,
    unavailable: `{{ 'products.product.unavailable' | t }}`,
    unavailable_with_option: `{{ 'products.product.value_unavailable' | t: option_value: '[value]' }}`,
  };

  window.quickOrderListStrings = {
    itemsAdded: `{{ 'sections.quick_order_list.items_added.other' | t: quantity: '[quantity]' }}`,
    itemAdded: `{{ 'sections.quick_order_list.items_added.one' | t: quantity: '[quantity]' }}`,
    itemsRemoved: `{{ 'sections.quick_order_list.items_removed.other' | t: quantity: '[quantity]' }}`,
    itemRemoved: `{{ 'sections.quick_order_list.items_removed.one' | t: quantity: '[quantity]' }}`,
    viewCart: `{{- 'sections.quick_order_list.view_cart' | t -}}`,
    each: `{{- 'sections.quick_order_list.each' | t: money: '[money]' }}`,
    min_error: `{{- 'sections.quick_order_list.min_error' | t: min: '[min]' }}`,
    max_error: `{{- 'sections.quick_order_list.max_error' | t: max: '[max]' }}`,
    step_error: `{{- 'sections.quick_order_list.step_error' | t: step: '[step]' }}`,
  };

  window.accessibilityStrings = {
    imageAvailable: `{{ 'products.product.media.image_available' | t: index: '[index]' }}`,
    shareSuccess: `{{ 'general.share.success_message' | t }}`,
    pauseSlideshow: `{{ 'sections.slideshow.pause_slideshow' | t }}`,
    playSlideshow: `{{ 'sections.slideshow.play_slideshow' | t }}`,
    recipientFormExpanded: `{{ 'recipient.form.expanded' | t }}`,
    recipientFormCollapsed: `{{ 'recipient.form.collapsed' | t }}`,
    countrySelectorSearchCount: `{{ 'localization.country_results_count' | t: count: '[count]' }}`,
  };
</script>

{%- if settings.predictive_search_enabled -%}
<script src="{{ 'predictive-search.js' | asset_url }}" defer="defer"></script>
{%- endif -%}
</body>
</html>