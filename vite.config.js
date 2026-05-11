import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: {
      external: ["gsap", "gsap/ScrollTrigger", "gsap/ScrollToPlugin"],
    },
  },
});
