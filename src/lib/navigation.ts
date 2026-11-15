/** Menu principal. Les futures rubriques (Groupes, Merch) viendront s'ajouter ici. */
export const mainNav = [
  { href: '/', label: 'Accueil' },
  { href: '/actualites/', label: 'Actualités' },
  { href: '/adhesion/', label: 'Adhésion' },
  { href: '/contact/', label: 'Contact' },
] as const;

export const legalNav = [
  { href: '/mentions-legales/', label: 'Mentions légales' },
  { href: '/confidentialite/', label: 'Confidentialité' },
] as const;

/** Lien actif : correspondance exacte pour l'accueil, par préfixe pour les rubriques. */
export function isCurrent(href: string, pathname: string): boolean {
  const path = pathname.endsWith('/') ? pathname : `${pathname}/`;
  return href === '/' ? path === '/' : path.startsWith(href);
}
