import type { Category } from '../types';

export const mockCategories: Category[] = [
  {
    id: 'cat-1',
    name: 'Placard',
    description: 'Placards et solutions de rangement : avec ou sans coulisses, meubles TV, dressings, bibliothèques et plus encore.',
    productCount: 14,
    image: 'https://picsum.photos/seed/placard/200/200',
    createdAt: '2024-01-15T08:00:00Z',
    subcategories: [
      { id: 'sub-placard-coulisses', name: 'Placard avec coulisses' },
      { id: 'sub-placard-sans-coulisses', name: 'Placard sans coulisses' },
      { id: 'sub-meuble-tv', name: 'Meuble TV' },
      { id: 'sub-placard-chaussures', name: 'Placard à chaussures' },
      { id: 'sub-dressing', name: 'Dressing' },
      { id: 'sub-bibliotheque', name: 'Bibliothèque' },
      { id: 'sub-buffet', name: 'Buffet' },
      { id: 'sub-vaisselier', name: 'Vaisselier' },
      { id: 'sub-autres', name: 'Autres' },
    ],
  },
  {
    id: 'cat-2',
    name: 'Lit',
    description: 'Lits 1 et 2 places, avec ou sans rangement, pour toutes les chambres.',
    productCount: 12,
    image: 'https://picsum.photos/seed/lit/200/200',
    createdAt: '2024-01-20T09:30:00Z',
    subcategories: [
      {
        id: 'sub-lit-1-place',
        name: 'Lit 1 place',
        options: [
          {
            id: 'opt-rangement',
            label: 'Rangement',
            values: [
              { value: 'avec', label: 'Avec rangement' },
              { value: 'sans', label: 'Sans rangement' },
            ],
          },
        ],
      },
      {
        id: 'sub-lit-2-places',
        name: 'Lit 2 places',
        options: [
          {
            id: 'opt-rangement',
            label: 'Rangement',
            values: [
              { value: 'avec', label: 'Avec rangement' },
              { value: 'sans', label: 'Sans rangement' },
            ],
          },
        ],
      },
    ],
  },
];
