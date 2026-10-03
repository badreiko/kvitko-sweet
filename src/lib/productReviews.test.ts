import { describe, expect, it } from 'vitest';
import type { Testimonial } from '@/firebase/services/testimonialService';
import { averageRating, reviewsForProduct, reviewsLabel } from './productReviews';

const review = (productName: string | undefined, rating: number): Testimonial => ({
  id: `${productName}-${rating}`, name: 'Jana', comment: 'Krásné', rating, productName, isActive: true, createdAt: new Date(),
});

describe('product reviews', () => {
  it('matches reviews by product name, ignoring case and spaces', () => {
    const all = [review('Jarní romance', 5), review(' jarní ROMANCE ', 4), review('Růžový sen', 5), review(undefined, 5)];
    expect(reviewsForProduct(all, 'Jarní romance')).toHaveLength(2);
    expect(reviewsForProduct(all, 'Neexistuje')).toHaveLength(0);
  });

  it('averages ratings and pluralises in Czech', () => {
    expect(averageRating([review('a', 5), review('a', 4)])).toBe(4.5);
    expect(averageRating([])).toBe(0);
    expect(reviewsLabel(1)).toBe('1 recenze');
    expect(reviewsLabel(3)).toBe('3 recenze');
    expect(reviewsLabel(12)).toBe('12 recenzí');
  });
});
