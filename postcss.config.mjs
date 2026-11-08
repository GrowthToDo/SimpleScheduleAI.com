import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

// Replaces the retired @astrojs/tailwind integration (Astro 5 only). It ran exactly
// these two PostCSS plugins; Tailwind stays on v3 with tailwind.config.js unchanged.
export default {
  plugins: [tailwindcss(), autoprefixer()],
};
