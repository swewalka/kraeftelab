---
name: Precision Engineering Aesthetic
colors:
  surface: '#f8f9fb'
  surface-dim: '#d9dadc'
  surface-bright: '#f8f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f6'
  surface-container: '#edeef0'
  surface-container-high: '#e7e8ea'
  surface-container-highest: '#e1e2e4'
  on-surface: '#191c1e'
  on-surface-variant: '#444748'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#f0f1f3'
  outline: '#747878'
  outline-variant: '#c4c7c7'
  surface-tint: '#5f5e5e'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#1c1b1b'
  on-primary-container: '#858383'
  inverse-primary: '#c8c6c5'
  secondary: '#006a61'
  on-secondary: '#ffffff'
  secondary-container: '#86f2e4'
  on-secondary-container: '#006f66'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#370e00'
  on-tertiary-container: '#e45405'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e5e2e1'
  primary-fixed-dim: '#c8c6c5'
  on-primary-fixed: '#1c1b1b'
  on-primary-fixed-variant: '#474746'
  secondary-fixed: '#89f5e7'
  secondary-fixed-dim: '#6bd8cb'
  on-secondary-fixed: '#00201d'
  on-secondary-fixed-variant: '#005049'
  tertiary-fixed: '#ffdbce'
  tertiary-fixed-dim: '#ffb599'
  on-tertiary-fixed: '#370e00'
  on-tertiary-fixed-variant: '#7f2b00'
  background: '#f8f9fb'
  on-background: '#191c1e'
  surface-variant: '#e1e2e4'
typography:
  h1:
    fontFamily: Hanken Grotesk
    fontSize: 40px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  h2:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  h3:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '500'
    lineHeight: '1.3'
    letterSpacing: 0em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: 0em
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: 0em
  label-caps:
    fontFamily: Hanken Grotesk
    fontSize: 12px
    fontWeight: '700'
    lineHeight: '1.0'
    letterSpacing: 0.1em
  math-block:
    fontFamily: JetBrains Mono
    fontSize: 18px
    fontWeight: '500'
    lineHeight: '1.5'
    letterSpacing: -0.02em
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
  lg: 40px
  xl: 64px
  gutter: 24px
  margin: 32px
---

## Brand & Style

This design system is built upon the visual language of the modern engineering lab—a space where intellectual rigor meets tactile precision. It avoids the saturated colors and rounded "bubbly" forms of traditional ed-tech in favor of a sophisticated, high-utility aesthetic.

The personality is **scholarly, methodical, and premium**. It draws inspiration from two distinct sources: the classic mechanics' field notebook and the digital drafting board. The style is a blend of **Minimalism** and **Tactile Precision**, using whitespace as a functional tool to reduce cognitive load during complex problem-solving. Every element serves a structural purpose, evoking the feeling of a professional tool rather than a toy.

## Colors

The palette is designed to mimic professional engineering documentation. 

- **Structure & Text:** "Dark Ink" (#1A1A1A) provides the highest contrast for diagrams and core navigation.
- **The Canvas:** "Warm Paper" (#F9F8F6) acts as the primary workspace background, reducing eye strain during long study sessions.
- **UI Surfaces:** Pure White (#FFFFFF) and Soft Gray (#F3F4F6) are used for floating panels and interface overlays to separate "tools" from the "work."
- **Accents:** 
    - **Technical Teal:** Used for "Success" states and active interactions.
    - **Safety Orange:** Used for critical warnings and incorrect states. This color is intentionally muted to maintain a professional tone.
    - **Diagram Forces:** Canvas force colors follow mechanics roles: external forces use green, support reactions and future internal forces use red, and angle/dimension construction marks use neutral ink/gray. Component arrows may use a thinner or dashed green variant to distinguish decomposition aids from the original applied force.

## Typography

Typography in this design system prioritizes legibility and technical clarity.

- **Headings (Hanken Grotesk):** Chosen for its sharp, contemporary geometry. Letter spacing is tightened slightly in larger sizes to feel "engineered."
- **Body (Inter):** The workhorse font. Used for all descriptive text, providing a neutral and highly readable foundation.
- **Math & Logic (JetBrains Mono):** Used for all equations, variables, and block-level math. The monospaced nature ensures that vertical alignment in multi-line equations remains perfect.
- **Labels:** Small caps with increased letter spacing are used for metadata and technical specs to differentiate them from prose.

## Layout & Spacing

The layout utilizes a **Fixed Grid** for UI components and a **Fluid Canvas** for the learning environment.

1.  **The Interactive Canvas:** This area uses a subtle 24px dot grid (using #E5E7EB) to provide a sense of scale and alignment for drawing mechanics and vectors.
2.  **UI Overlays:** Navigation and controls are anchored to the edges with a 32px safety margin. 
3.  **Content Column:** For "Solve" modes, content is centered in a maximum 800px column to maintain optimal reading line lengths.
4.  **Rhythm:** An 8px base unit governs all padding and margins, ensuring that technical diagrams and UI elements feel mathematically aligned.

## Elevation & Depth

This design system uses **Tonal Layering** and **Low-Contrast Outlines** rather than heavy shadows to indicate depth.

- **Level 0 (The Canvas):** The "Warm Paper" base layer.
- **Level 1 (Cards/Containers):** Pure white background with a 1px border (#E5E7EB). Shadows are avoided here to keep the "flat notebook" feel.
- **Level 2 (Floating Controls):** Used for pan/zoom tools and mode selectors. These feature a very soft, diffused shadow (0px 4px 20px rgba(0,0,0,0.05)) to suggest they are "tools" resting on top of the paper.
- **Active State:** Elements being dragged or interacted with gain a slightly sharper border using the Technical Teal accent.
- **Canvas Focus:** Diagram focus should be expressed through binary visibility, not by recoloring or dimming mechanics objects. Authored Solve and Practice canvas objects are either visible at normal opacity or not rendered.

## Shapes

The shape language is **Soft (0.25rem)**. This subtle rounding suggests the precision of machined parts or high-quality drafting tools.

- **Small Components:** Checkboxes and small buttons use a 4px (0.25rem) radius.
- **Containers:** Large interaction cards and math blocks use an 8px (0.5rem) radius.
- **Icons:** Use a 1.5px or 2px stroke weight to match the "ink on paper" aesthetic. Avoid filled icons unless indicating an active toggle state.

## Components

### Mode Tabs
Located at the top-center. Minimalist text labels with a 2px bottom indicator in Technical Teal for the active state. No background fills.

### Step Indicators
Thin, 4px tall horizontal bars. Inactive steps are Soft Gray (#F3F4F6); completed and current steps are Technical Teal. These should be integrated into the top of the interaction cards.

### Interaction Cards
Containers for problem statements. Use a white background, 1px border, and 24px internal padding. Title text should always be in Hanken Grotesk.

### Math Blocks
Equations are housed in containers with a subtle #F8FAFC background. The monospaced font should be centered, with ample vertical breathing room (16px top/bottom).

Final result formulas, such as final support reactions, use a distinct result math block treatment with a teal accent and subtle success-tinted background. This treatment should be reserved for final answers, not ordinary derivation steps.

### Buttons
- **Primary ('Check'):** Solid #1A1A1A background with white text. High-contrast and authoritative.
- **Secondary:** Outlined 1px #1A1A1A. Transparent background.
- **Tertiary:** Text-only, using Hanken Grotesk Bold, with a small arrow or icon.

### Feedback States
- **Correct:** A thin teal banner (#F0FDFA) at the bottom of the card with teal text.
- **Incorrect:** A thin orange banner (#FFF7ED) with orange text. The tone is informative (e.g., "Check the direction of Force A") rather than punitive.

### Canvas Controls
Circular, floating icon buttons (32px diameter). White background, 1px light gray border, using thin-line icons. Placed in the bottom-right of the viewport.
