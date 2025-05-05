// src/data/blogPosts.ts
import {
  FlowerCare,
  SeasonalFlowers,
  FlowerSymbolism
} from '@/assets';

export const blogPosts = [
  {
    id: "1",
    title: "Jak pečovat o řezané květiny",
    excerpt: "Tipy a triky pro prodloužení životnosti vašich květin. Naučte se, jak správně pečovat o řezané květiny, aby vám vydržely co nejdéle.",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl vel ultricies lacinia, nisl nisl aliquam nisl, eu aliquam nisl nisl eu nisl. Sed euismod, nisl vel ultricies lacinia, nisl nisl aliquam nisl, eu aliquam nisl nisl eu nisl.",
    imageUrl: FlowerCare,
    author: "Jana Květinová",
    date: "15. 5. 2023",
    tags: ["péče o květiny", "řezané květiny", "tipy"]
  },
  {
    id: "2",
    title: "Květiny pro každou příležitost",
    excerpt: "Průvodce výběrem správných květin pro různé události. Svatby, narozeniny, výročí nebo jen tak pro radost - pro každou příležitost existují ideální květiny.",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl vel ultricies lacinia, nisl nisl aliquam nisl, eu aliquam nisl nisl eu nisl. Sed euismod, nisl vel ultricies lacinia, nisl nisl aliquam nisl, eu aliquam nisl nisl eu nisl.",
    imageUrl: SeasonalFlowers,
    author: "Petr Zahradník",
    date: "2. 4. 2023",
    tags: ["příležitosti", "výběr květin", "dárky"]
  },
  {
    id: "3",
    title: "Symbolika květin v různých kulturách",
    excerpt: "Objevte, co znamenají různé květiny v různých částech světa. Květiny mají bohatou symboliku, která se liší napříč kulturami.",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl vel ultricies lacinia, nisl nisl aliquam nisl, eu aliquam nisl nisl eu nisl. Sed euismod, nisl vel ultricies lacinia, nisl nisl aliquam nisl, eu aliquam nisl nisl eu nisl.",
    imageUrl: FlowerSymbolism,
    author: "Martina Zelená",
    date: "18. 3. 2023",
    tags: ["symbolika", "kultury", "historie"]
  }
];

export default blogPosts;
