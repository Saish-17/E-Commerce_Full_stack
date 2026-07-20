---
name: High-End Retail Design System
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#454652'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#767683'
  outline-variant: '#c6c5d4'
  surface-tint: '#4c56af'
  primary: '#000666'
  on-primary: '#ffffff'
  primary-container: '#1a237e'
  on-primary-container: '#8690ee'
  inverse-primary: '#bdc2ff'
  secondary: '#505f76'
  on-secondary: '#ffffff'
  secondary-container: '#d0e1fb'
  on-secondary-container: '#54647a'
  tertiary: '#380b00'
  on-tertiary: '#ffffff'
  tertiary-container: '#5c1800'
  on-tertiary-container: '#e17c5a'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e0e0ff'
  primary-fixed-dim: '#bdc2ff'
  on-primary-fixed: '#000767'
  on-primary-fixed-variant: '#343d96'
  secondary-fixed: '#d3e4fe'
  secondary-fixed-dim: '#b7c8e1'
  on-secondary-fixed: '#0b1c30'
  on-secondary-fixed-variant: '#38485d'
  tertiary-fixed: '#ffdbd0'
  tertiary-fixed-dim: '#ffb59d'
  on-tertiary-fixed: '#390c00'
  on-tertiary-fixed-variant: '#7b2e12'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  display-lg:
    fontFamily: Hanken Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 48px
  xl: 80px
  container-max: 1280px
  gutter: 24px
  margin-desktop: 64px
---

## Brand & Style
The design system is rooted in a **Corporate/Modern** aesthetic with strong influences from **Minimalism**. It aims to evoke a sense of reliability and quiet luxury, catering to a professional audience that values efficiency and clarity. The visual language prioritizes high-end retail sensibilities: expansive whitespace, generous margins, and a strict adherence to a systematic grid. By stripping away unnecessary ornamentation, the product focuses the user's attention entirely on the photography and the streamlined path to purchase. The emotional response should be one of "effortless sophistication."

## Colors
The palette is dominated by a Deep Navy (`#1A237E`) that establishes authority and trust. This is balanced by Soft Slate (`#64748B`) for secondary information and iconography. A warm Amber/Gold (`#D4AF37`) is reserved strictly for high-priority calls to action and navigational cues, providing a sophisticated contrast that guides the eye without overwhelming the layout. Surfaces use a very light Off-white (`#F1F5F9`) to subtly separate content sections from the primary White background, maintaining a layered but flat aesthetic.

## Typography
The typography system uses a pair of contemporary sans-serifs. **Hanken Grotesk** is utilized for all headlines and display elements; its sharp, clean geometry conveys modern professionalism. **Inter** is employed for body copy and labels due to its exceptional legibility at small sizes and its neutral, systematic feel. 

For high-end retail impact, large headlines use tight tracking (-0.02em) to appear more cohesive, while small labels use slightly increased tracking to ensure clarity. Hierarchy is maintained through distinct weight shifts rather than excessive color changes.

## Layout & Spacing
This design system employs a **Fixed Grid** model for desktop, centered on the screen with a maximum width of 1280px. The layout is built on a 12-column grid with 24px gutters. 

Vertical rhythm is strictly managed through an 8px base unit. Section-level padding is generous (`xl` - 80px) to provide the "breathing room" characteristic of luxury brands. Smaller components use `md` (24px) for internal padding to ensure elements do not feel cramped.

## Elevation & Depth
Depth is communicated through **Tonal Layers** and **Low-contrast Outlines** rather than heavy shadows. 
- **Level 0 (Base):** Pure white background.
- **Level 1 (Sections):** Light Gray (`#F1F5F9`) surfaces used to group related products or content blocks.
- **Level 2 (Modals/Toasts):** These use a highly diffused, soft shadow (15% opacity of the primary Navy) to create a subtle lift, paired with a 1px border in a lighter slate.
- **Dividers:** Use a subtle 1px border (`#E2E8F0`) to define boundaries without interrupting the visual flow.

## Shapes
The design system utilizes **Soft** roundedness (4px/0.25rem). This choice maintains the professional, "engineered" feel of the interface while removing the harshness of sharp corners. Large components like product cards or modals may scale up to `rounded-lg` (8px) to feel more approachable, but the core interaction elements—buttons and inputs—remain at the 4px standard to preserve a crisp, technical look.

## Components
- **Buttons:** Primary buttons are solid Deep Navy with White text. Accent buttons (CTA) use the Amber/Gold background. All buttons have a fixed height of 48px for a substantial, tactile feel and use the `label-lg` typography style.
- **Product Cards:** Minimalist approach with no outer borders; use a light surface background on hover. The image occupies 75% of the card area, with typography left-aligned below.
- **Forms:** Input fields use a 1px Slate border that transitions to Deep Navy on focus. Labels are positioned above the field using `label-sm`.
- **Navbar:** Sticky at the top of the viewport with a white background and a subtle bottom border. It utilizes a 3nd-level hierarchy: Logo (Left), Navigation Links (Center), Utilities/Cart (Right).
- **Toasts & Modals:** Centralized notification system. Toasts appear in the bottom-right corner with a soft shadow and a colored accent bar on the left to indicate status (Success = Navy, Warning = Amber).
- **Footer:** A multi-column layout using the `surface_color` background to clearly demarcate the end of the page content, using `body-md` for link lists.