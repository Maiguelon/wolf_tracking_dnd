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
    src: '/avatars/wolf_gray.png',
    description: 'Fotografía realista de un lobo salvaje de mirada penetrante en su hábitat natural.',
  },
  {
    id: 'wolf_white',
    name: 'Fantasma del Norte (Lobo Ártico)',
    category: 'real',
    categoryLabel: 'Fotografía Real',
    src: '/avatars/wolf_white.png',
    description: 'Imponente lobo de pelaje blanco ártico puro en la tundra nevada.',
  },
  {
    id: 'wolf_timber',
    name: 'Sombra de Bosque (Timber Wolf)',
    category: 'real',
    categoryLabel: 'Fotografía Real',
    src: '/avatars/wolf_timber.png',
    description: 'Depredador sigiloso de pelaje oscuro en un bosque de coníferas.',
  },
  {
    id: 'wolf_howl',
    name: 'Aullador de las Cumbres',
    category: 'real',
    categoryLabel: 'Fotografía Real',
    src: '/avatars/wolf_howl.png',
    description: 'Lobo aullando en la cresta de la montaña al crepúsculo.',
  },
  {
    id: 'wolf_fantasy_oil',
    name: 'Guardián Arcano (Óleo Fantasía)',
    category: 'art',
    categoryLabel: 'Estilo Artístico',
    src: '/avatars/wolf_fantasy_oil.png',
    description: 'Pintura al óleo de un lobo espectral de ojos dorados brillantes y aura mística.',
  },
  {
    id: 'wolf_watercolor',
    name: 'Espíritu Feérico (Acuarela)',
    category: 'art',
    categoryLabel: 'Estilo Artístico',
    src: '/avatars/wolf_watercolor.png',
    description: 'Acuarela colorida y mágica con constelaciones celestiales y polvo de estrellas.',
  },
  {
    id: 'wolf_anime',
    name: 'Camarada Heroico (Anime / Cómic)',
    category: 'art',
    categoryLabel: 'Estilo Artístico',
    src: '/avatars/wolf_anime.png',
    description: 'Ilustración dinámica con trazos estilizados, ojos luminosos y collar rúnico.',
  },
  {
    id: 'wolf_furry_joke',
    name: 'Mascota Furra con d20 (Broma)',
    category: 'joke',
    categoryLabel: 'Easter Egg / Broma',
    src: '/avatars/wolf_furry_joke.png',
    description: 'Un traje completo de mascota furra con cabeza de lobo sosteniendo un d20 en crítico 20.',
  },
];
