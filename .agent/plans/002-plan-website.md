# Plan 002: Landing Page GovTech Redesign

The objective of this plan is to overhaul `LandingPage.tsx` to remove its heavily "AI-generated" aesthetic (neon glows, excessive scroll animations, fake JSON streams) and replace it with a professional, trustworthy "GovTech / Enterprise" design.

## 1. Visual Style Overhaul (Bloomberg Terminal / Command Center Aesthetic)
- **Action:** Replace the current Cyberpunk/SaaS theme (dark backgrounds with neon cyan/purple glows and heavy glassmorphism) with a crisp, utilitarian aesthetic.
- **Details:** Use matte black or deep slate backgrounds (`#0A0E17`), remove drop shadows that simulate glowing (`shadow-[0_0_15px_rgba(...)]`), and use high-contrast solid colors (white text, subtle steel-blue borders, standard traffic light colors for alerts).
- **Reasoning:** A municipal software product shouldn't look like a crypto dashboard. It needs to look sturdy and professional.

## 2. Eliminate "Movie Hacker" Data Streams
- **Action:** Completely remove the animated pipeline section that cycles through stages and prints a fake, live-updating JSON payload.
- **Reasoning:** Fake, scrolling code blocks are a massive "AI-generated" tell. They offer no real value and distract from the actual product.

## 3. Hero Section Refactor
- **Action:** Remove the `bg-clip-text text-transparent bg-gradient-to-r` gradient styling from the main `<h1>`. Remove the abstract DBSCAN CSS scatter plot animation.
- **Details:** Use a solid white headline (e.g., "Clear Curbs. Flowing Traffic."). Instead of abstract dots, the hero section should be supported by a high-fidelity static image or a clean, stylized representation of the actual `ControlCenter` dashboard.

## 4. Implement a "Bento Box" Architecture Layout
- **Action:** Replace the generic grid of 3 icon cards with a structured "Bento Box" layout.
- **Details:** Create a clean, visually distinct grid showing:
  1. Input (Citizen mobile reports + RTO Sensors)
  2. Processing (ParkSense Spatial Engine)
  3. Output (Enforcement Dispatch Dashboard)
- **Reasoning:** This is a standard, modern way to explain complex software architecture visually without relying on paragraphs of text.

## 5. Ground the Copywriting
- **Action:** Rewrite the text to strip out AI buzzwords ("Empowering", "Bleeding-edge", "Actionable Intelligence", "Unlocking").
- **Details:** Use direct, engineering-focused language. Example: Instead of "Harnessing spatial clustering to unlock transit telemetry," use "ParkSense aggregates citizen reports to map illegal parking hotspots and dispatch enforcement units."

## 6. Remove Excessive Scroll Animations
- **Action:** Remove or drastically reduce the use of `<ScrollReveal>` wrappers around every single component.
- **Reasoning:** Having every div slide and fade in as the user scrolls makes the page feel sluggish and cheap, a common artifact of AI-generated templates trying to look "dynamic."