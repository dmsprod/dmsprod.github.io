/**
 * Schémas du contenu éditable.
 *
 * Règle de conception : des en-têtes PLATS et SIMPLES (chaînes, dates, booléens, listes de chaînes),
 * pour rester éditables à la main sur GitHub et décrits sans effort par un CMS Git
 * (Pages CMS, Sveltia CMS, Decap CMS). Toute faute de frappe fait échouer le build.
 */
import { defineCollection, reference } from 'astro:content';
import { glob, file } from 'astro/loaders';
import { z } from 'astro/zod';

/** Les formations accompagnées par l'association : src/data/groups.json. */
const groups = defineCollection({
  loader: file('src/data/groups.json'),
  schema: z.object({
    id: z.string().regex(/^[a-z0-9-]+$/, 'identifiant en minuscules, chiffres et tirets'),
    name: z.string(),
    style: z.string(),
    summary: z.string(),
    logo: z.string().startsWith('/uploads/'),
    website: z.url().optional(),
    instagram: z.url().optional(),
    facebook: z.url().optional(),
    youtube: z.url().optional(),
    bandcamp: z.url().optional(),
    // Contact direct avec le groupe (discret, en pied de carte) : "mailto:..." ou une URL.
    contact: z.string().regex(/^(mailto:|https?:\/\/)/, 'mailto:… ou https://…').optional(),
  }),
});

/** Les actualités : un fichier Markdown par article dans src/content/news/, nommé AAAA-MM-JJ-titre-court.md. */
const news = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/news' }),
  schema: z.object({
    title: z.string().max(100),
    date: z.coerce.date(),
    summary: z.string().max(220),
    // Tags libres, en minuscules (accents acceptés) : "concert", "vie-associative"…
    tags: z.array(z.string().regex(/^[\p{Ll}\p{N}-]+$/u, 'tag en minuscules, sans espace')).default([]),
    // Identifiants de src/data/groups.json : "stoneheart", "distorted-memory".
    groups: z.array(reference('groups')).default([]),
    // Image dans public/uploads/ (dossier média unique, attendu par les CMS Git).
    cover: z.string().startsWith('/uploads/').optional(),
    coverAlt: z.string().optional(),
    // true : visible en local (npm run dev) mais exclu du site généré.
    draft: z.boolean().default(false),
  }),
});

export const collections = { groups, news };
