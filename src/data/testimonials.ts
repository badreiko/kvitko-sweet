// src/data/testimonials.ts
import {
  ClientFemale,
  ClientMale,
  ClientFamily
} from '@/assets';

export const testimonials = [
  {
    id: "1",
    name: "Jana Nováková",
    comment: "Nádherné květiny a skvělý servis! Kytice dorazila včas a vypadala přesně jako na fotografii. Určitě budu objednávat znovu.",
    rating: 5,
    imageUrl: ClientFemale
  },
  {
    id: "2",
    name: "Petr Svoboda",
    comment: "Objednal jsem kytici pro manželku k výročí. Byla nadšená! Květiny byly čerstvé a krásně zabalené. Děkuji za profesionální přístup.",
    rating: 5,
    imageUrl: ClientMale
  },
  {
    id: "3",
    name: "Rodina Dvořákova",
    comment: "Pravidelně nakupujeme květiny pro naše rodinné oslavy a vždy jsme spokojeni. Rostliny jsou zdravé a personál ochotně poradí s výběrem.",
    rating: 4,
    imageUrl: ClientFamily
  }
];

export default testimonials;
