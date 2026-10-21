export interface AvatarOption {
  id: string;
  name: string;
  category: 'real' | 'art' | 'joke';
  categoryLabel: string;
  src: string;
  description: string;
}

export const AVATAR_OPTIONS: AvatarOption[] = [
  {
    id: 'wolf_gray',
    name: 'Colmillo Gris (Lobo Silvestre)',
    category: 'real',
    categoryLabel: 'Fotografía Real',
    src: '/avatars/wolf_gray.jpg',
    description: 'Lobo salvaje clásico de pelaje grisáceo y mirada penetrante.',
  },
  {
    id: 'wolf_white',
    name: 'Fantasma del Norte (Lobo Ártico)',
    category: 'real',
    categoryLabel: 'Fotografía Real',
    src: '/avatars/wolf_white.jpg',
    description: 'Imponente lobo de pelaje blanco como la nieve de las cumbres.',
  },
  {
    id: 'wolf_timber',
    name: 'Sombra de Bosque (Timber Wolf)',
    category: 'real',
    categoryLabel: 'Fotografía Real',
    src: '/avatars/wolf_timber.jpg',
    description: 'Depredador sigiloso de los bosques profundos.',
  },
  {
    id: 'wolf_howl',
    name: 'Aullador Nocturno',
    category: 'real',
    categoryLabel: 'Fotografía Real',
    src: '/avatars/wolf_howl.jpg',
    description: 'Lobo alzando su aullido en sintonía con la manada.',
  },
  {
    id: 'wolf_fantasy_oil',
    name: 'Guardián Arcano (Óleo Fantasía)',
    category: 'art',
    categoryLabel: 'Estilo Artístico',
    src: '/avatars/wolf_fantasy_oil.png',
    description: 'Pintura al óleo de un lobo espectral de ojos brillantes y aura mística.',
  },
  {
    id: 'wolf_watercolor',
    name: 'Espíritu Feérico (Acuarela)',
    category: 'art',
    categoryLabel: 'Estilo Artístico',
    src: '/avatars/wolf_watercolor.png',
    description: 'Estilo etéreo en acuarela con tonos astrales y naturaleza salvaje.',
  },
  {
    id: 'wolf_anime',
    name: 'Camarada Bestial (Anime / Cómic)',
    category: 'art',
    categoryLabel: 'Estilo Artístico',
    src: '/avatars/wolf_anime.png',
    description: 'Ilustración dinámica con trazos heroicos y estilizados.',
  },
  {
    id: 'wolf_furry_joke',
    name: '¿"Lobo"? (Totalmente legítimo)',
    category: 'joke',
    categoryLabel: 'Easter Egg / Broma',
    src: '/avatars/wolf_furry_joke.png',
    description: 'Un tipo disfrazado con pijama de lobo y orejas postizas sosteniendo la ficha.',
  },
];
