import type { Testimonial } from '@/firebase/services/testimonialService';

const normalize = (value: string | undefined) => (value ?? '').trim().toLocaleLowerCase('cs');

/** Отзывы к конкретному товару: совпадение по названию товара в отзыве. */
export function reviewsForProduct(testimonials: Testimonial[], productName: string): Testimonial[] {
  const name = normalize(productName);
  if (!name) return [];
  return testimonials.filter(review => normalize(review.productName) === name);
}

export function averageRating(reviews: Pick<Testimonial, 'rating'>[]): number {
  if (reviews.length === 0) return 0;
  return reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
}

/** 1 recenze · 2–4 recenze · 5+ recenzí */
export function reviewsLabel(count: number): string {
  if (count === 1) return '1 recenze';
  if (count >= 2 && count <= 4) return `${count} recenze`;
  return `${count} recenzí`;
}
