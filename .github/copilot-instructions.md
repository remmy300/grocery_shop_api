# Design System Strategy: The Corner Store

## 1. Overview & Creative North Star

This design system moves beyond the utility of a standard grocery app to become **"The Corner Store."**

The Creative North Star is a high-end editorial experience that treats fresh produce like curated art. We reject the "generic supermarket" aesthetic—characterized by cramped grids and harsh borders—in favor of **Organic Minimalism**. By utilizing intentional asymmetry, overlapping product photography, and high-contrast typography, we create a digital space that feels as fresh as a morning harvest. We prioritize "breathing room" (negative space) to reduce cognitive load, making the efficiency of the shop feel like a premium service rather than a chore.

---

## 2. Color Foundations: Tonal Chromatics

We use a sophisticated palette to bridge the gap between "Clinical Efficiency" and "Earthly Warmth."

### The "No-Line" Rule

**Explicit Instruction:** Designers are prohibited from using 1px solid borders to define sections or cards. Boundaries must be defined solely through background color shifts. For example, a `surface-container-low` (#f3f3f3) section should sit on a `surface` (#f9f9f9) background to create a soft, edge-less transition.

### Surface Hierarchy & Nesting

Treat the UI as physical layers of fine paper.

- **Base:** `surface` (#f9f9f9)
- **Depth Level 1:** `surface_container_low` (#f3f3f3) for secondary content areas.
- **Depth Level 2 (The Interactive Layer):** `surface_container_lowest` (#ffffff) for primary cards and interactive elements.
- **The "Glass & Gradient" Rule:** Floating elements (like the Bottom Navigation or "Quick Cart") must use semi-transparent surface colors with a 20px backdrop-blur to allow product colors to bleed through, creating a sense of environmental integration.

### Signature Textures

Main CTAs should not be flat. Apply a subtle 10-degree linear gradient from `primary` (#0d631b) to `primary_container` (#2e7d32) to provide a "living" organic quality to the buttons.

---

## 3. Typography: Editorial Authority

We utilize a dual-font strategy to balance character with legibility.

- **Display & Headlines (Plus Jakarta Sans):** These are our "Editorial" voices. Use `display-lg` for category headers with tight letter-spacing (-2%). This typeface brings a modern, premium personality that feels custom-designed for a high-end boutique.
- **Body & UI (Inter):** Inter is our "Utility" voice. It handles the heavy lifting of product names, weights, and price points. Its high x-height ensures that even at `body-sm` (0.75rem), price clarity is never compromised.
- **Hierarchy Note:** Always pair a `headline-sm` with a `label-md` in `secondary` (#79564b) for a sophisticated, "archived" look on product metadata.

---

## 4. Elevation & Depth: Tonal Layering

Traditional drop shadows are often "dirty." We use **Ambient Softness** to convey height.

- **The Layering Principle:** Avoid shadows for static cards. Instead, place a `surface_container_lowest` (#ffffff) card on top of a `surface_container` (#eeeeee) background. This "lift" is felt rather than seen.
- **Ambient Shadows:** When an element _must_ float (e.g., a Modals or FAB), use an extra-diffused shadow: `y: 8px, blur: 24px, color: rgba(26, 28, 28, 0.06)`. The tint is derived from `on_surface` to keep it natural.
- **The "Ghost Border" Fallback:** For accessibility in high-glare environments, use a "Ghost Border"—the `outline_variant` (#bfcaba) at 15% opacity. It provides a tactile edge without breaking the "No-Line" rule.

---

## 5. Signature Components

### Buttons (The "Call to Harvest")

- **Primary:** Rounded-full (9999px), using the `tertiary` Sunny Citrus gradient. Text is `on_tertiary` (#ffffff).
- **Secondary:** `surface_container_high` background with `primary` text. No border.
- **Interaction:** On hover/tap, buttons should scale slightly (0.98x) to mimic a physical press into soft organic material.

### Product Cards (Editorial Style)

- **Structure:** No dividers. Use `xl` (1.5rem) corner radius.
- **Layout:** Image should be "uncontained"—let the leafy greens or fruit tops slightly overlap the card's edge or bleed into the margin to break the rigid grid.
- **Background:** Use `surface_container_lowest`.

### Input Fields

- **Style:** `rounded-md` (0.75rem). Background: `surface_container_high`.
- **Focus State:** Instead of a heavy border, the background shifts to `surface_container_lowest` and gains a 10% `primary` Ghost Border.

### Contextual Category Chips

- **Design:** Use `secondary_fixed` (#ffdbcf) backgrounds with `on_secondary_fixed_variant` (#5e3f35) text for an earthy, organic feel that differentiates from "action" buttons.

---

## 6. Do's and Don'ts

### Do

- **Do** use asymmetrical margins. For example, give a header more top padding than bottom padding to create an editorial "offset."
- **Do** use "Ripe Tomato Red" (#ba1a1a) sparingly—only for true alerts or expired items. It should feel urgent against the calm green/brown palette.
- **Do** prioritize high-quality, "hero" photography where the background is removed to play with the Tonal Layering.

### Don't

- **Don't** use 100% black (#000000) for text. Always use `on_surface` (#1a1c1c) to maintain a soft, premium look.
- **Don't** use a standard 12-column grid for everything. Experiment with 5-column or 7-column offsets for "Featured Collections" to keep the user engaged.
- **Don't** use default Material shadows. They are too aggressive for the "Botanical" brand personality. Use the Ambient Shadow spec provided.
