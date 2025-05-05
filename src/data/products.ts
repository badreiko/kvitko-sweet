// src/data/products.ts
import {
  SpringBouquet,
  RosesBouquet,
  SunflowerBouquet,
  WeddingBouquet,
  MonsteraPlant,
  FicusPlant,
  GiftBox,
  GiftBasket
} from '@/assets';

export const products = [
  {
    id: "1",
    name: "Jarní romance",
    description: "Kytice plná jarních květin v pastelových barvách",
    price: 890,
    imageUrl: SpringBouquet,
    category: "bouquets",
    featured: true
  },
  {
    id: "2",
    name: "Růžový sen",
    description: "Elegantní kytice růží v růžových odstínech",
    price: 1290,
    imageUrl: RosesBouquet,
    category: "bouquets",
    featured: true
  },
  {
    id: "3",
    name: "Slunečnice",
    description: "Zářivá kytice slunečnic pro rozjasnění dne",
    price: 790,
    imageUrl: SunflowerBouquet,
    category: "bouquets",
    featured: true
  },
  {
    id: "4",
    name: "Monstera Deliciosa",
    description: "Populární pokojová rostlina s dělenými listy",
    price: 690,
    imageUrl: MonsteraPlant,
    category: "plants",
    featured: true
  },
  {
    id: "5",
    name: "Bílá elegance",
    description: "Čistá bílá kytice pro svatební příležitosti",
    price: 1490,
    imageUrl: WeddingBouquet,
    category: "wedding",
    featured: false
  },
  {
    id: "6",
    name: "Ficus Lyrata",
    description: "Populární pokojová rostlina s velkými listy",
    price: 890,
    imageUrl: FicusPlant,
    category: "plants",
    featured: false
  },
  {
    id: "7",
    name: "Čokoládový box",
    description: "Luxusní čokoládový box jako doplněk ke kytici",
    price: 390,
    imageUrl: GiftBox,
    category: "gifts",
    featured: false
  },
  {
    id: "8",
    name: "Dárkový koš",
    description: "Originální dárkový koš s výběrem dobrot",
    price: 690,
    imageUrl: GiftBasket,
    category: "gifts",
    featured: false
  }
];

export default products;
