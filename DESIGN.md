# Design System - AiParking

This document details the design system specifications derived from the **Kinetic Grid Motion** project on Stitch.

## Visual Archetype & Branding
- **Theme**: Futuristic Cyberpunk / Sleek Corporate Hybrid
- **Aesthetic**: Deep space-themed dark mode dashboards combined with light, professional infrastructure interfaces.
- **Typography**: 
  - Structural headings/UI: **Geist**
  - Body copy/paragraphs: **Inter**
  - Data telemetry: Monospaced values

## Colors

### Dark Mode (Dashboards & Map)
- **Background / Surface**: `#051424` (Deep Space Blue)
- **Primary Accent**: `#00f0ff` (Neon Cyan)
- **Secondary Accent**: `#c0c1ff` (Light Indigo)
- **Surface Container Lowest**: `#010f1f`
- **Surface Container Low**: `#0d1c2d`
- **Surface Container**: `#122131`
- **Surface Container High**: `#1c2b3c`
- **Surface Container Highest**: `#273647`
- **On Surface**: `#d4e4fa`
- **On Surface Variant**: `#b9cacb`
- **Outline**: `#849495`
- **Outline Variant**: `#3b494b`
- **Error**: `#ffb4ab`
- **On Error**: `#690005`

### Light Mode (Marketing & Booking)
- **Background / Surface**: `#f7f9fb` (Ice White)
- **Primary**: `#000000` (Pure Black)
- **Secondary / CTA**: `#0058be` (Enterprise Blue)
- **Surface Container Low**: `#f2f4f6`
- **Surface Container**: `#eceef0`
- **Surface Container High**: `#e6e8ea`
- **Surface Container Highest**: `#e0e3e5`
- **On Surface**: `#191c1e`
- **On Surface Variant**: `#45464d`
- **Outline**: `#76777d`
- **Outline Variant**: `#c6c6cd`

## Layout & Spacing
- **Grid System**: 12-column layout on desktop, centering content within `1440px`.
- **Spacing Scale**: 8px baseline (`xs: 4px`, `sm: 12px`, `md: 24px`, `lg: 48px`, `xl: 80px`).
- **Rounding / Border Radius**: 
  - Standard buttons / tags: `8px` (`0.5rem`)
  - Dashboard cards / bento panels: `12px` (`0.75rem`)
  - Layout structures: `16px` (`1rem`)
  - Full pill: `9999px`

## Component Guidelines
- **Sidebar**: Sticky left panel with blur filter (`backdrop-blur-xl`).
- **Header**: Top sticky status bar with search filter proxy.
- **Bento Panel**: Elevated containers utilizing `rgba(18, 33, 49, 0.4)` background, `1px solid rgba(255, 255, 255, 0.05)` border, and glow effects on hover.
