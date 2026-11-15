// @ts-check
import { defineConfig } from 'astro/config';

// Maquette V0.1 : site 100 % statique, aucune intégration externe.
export default defineConfig({
  // À remplacer par le vrai domaine le jour de la mise en ligne (sert au RSS et aux URL canoniques).
  site: 'https://dmsprod.github.io',
  trailingSlash: 'ignore',
  build: {
    // "/contact" => "contact/index.html" : servi tel quel par GitHub Pages et Cloudflare Pages.
    format: 'directory',
  },
  devToolbar: { enabled: false },
});
