// src/data/blogPosts.ts
import {
  FlowerCare,
  OccasionFlowers,
  IndoorPlants,
  SeasonalGarden,
  FlowerSymbolism,
  WeddingBouquetBlog
} from '@/assets';

export const blogPosts = [
  {
    id: "1",
    title: "Jak pečovat o řezané květiny",
    excerpt: "Tipy a triky pro prodloužení životnosti vašich květin. Naučte se, jak správně pečovat o řezané květiny, aby vám vydržely co nejdéle.",
    content: "", // Содержимое будет загружаться из blogContent
    imageUrl: FlowerCare,
    author: "Jana Květinová",
    date: "15. 5. 2023",
    tags: ["péče o květiny", "řezané květiny", "tipy"]
  },
  {
    id: "2",
    title: "Květiny pro každou příležitost",
    excerpt: "Průvodce výběrem správných květin pro různé události. Svatby, narozeniny, výročí nebo jen tak pro radost - pro každou příležitost existují ideální květiny.",
    content: "",
    imageUrl: OccasionFlowers,
    author: "Petr Zahradník",
    date: "2. 4. 2023",
    tags: ["příležitosti", "výběr květin", "dárky"]
  },
  {
    id: "3",
    title: "Pěstování pokojových rostlin",
    excerpt: "Základní rady pro začátečníky i pokročilé pěstitele. Dozvíte se, jak vybrat správnou rostlinu pro váš domov a jak o ni pečovat.",
    content: "",
    imageUrl: IndoorPlants,
    author: "Martina Zelená",
    date: "18. 3. 2023",
    tags: ["pokojové rostliny", "pěstování", "začátečníci"]
  },
  {
    id: "4",
    title: "Sezónní květiny pro vaši zahradu",
    excerpt: "Přehled květin, které můžete pěstovat v každém ročním období. Plánujte svou zahradu tak, aby kvetla po celý rok.",
    content: "",
    imageUrl: SeasonalGarden,
    author: "Jana Květinová",
    date: "5. 3. 2023",
    tags: ["zahrada", "sezónní květiny", "plánování"]
  },
  {
    id: "5",
    title: "Symbolika květin v různých kulturách",
    excerpt: "Objevte, co znamenají různé květiny v různých částech světa. Květiny mají bohatou symboliku, která se liší napříč kulturami.",
    content: "",
    imageUrl: FlowerSymbolism,
    author: "Petr Zahradník",
    date: "20. 2. 2023",
    tags: ["symbolika", "kultury", "historie"]
  },
  {
    id: "6",
    title: "Jak vytvořit perfektní svatební kytici",
    excerpt: "Kompletní průvodce výběrem a tvorbou svatební kytice. Inspirujte se různými styly a barvami pro váš velký den.",
    content: "",
    imageUrl: WeddingBouquetBlog, // Используем новое имя
    author: "Martina Zelená",
    date: "10. 2. 2023",
    tags: ["svatba", "svatební kytice", "inspirace"]
  }
];

export default blogPosts;