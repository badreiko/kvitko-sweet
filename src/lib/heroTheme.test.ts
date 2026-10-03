import { describe, expect, it } from 'vitest';
import { currentSeason, heroRatio, holidayTheme, nearestHeroRatio, parseDayMonth, resolveHeroTheme } from './heroTheme';

const image = 'https://example.test/hero.webp';

describe('hero theme selection', () => {
  it('uses Prague dates at season boundaries', () => {
    expect(currentSeason(new Date('2026-02-28T22:30:00Z'))).toBe('winter');
    expect(currentSeason(new Date('2026-02-28T23:30:00Z'))).toBe('spring');
    expect(currentSeason(new Date('2026-08-31T22:30:00Z'))).toBe('autumn');
  });

  it('uses configured holiday images only inside their date windows', () => {
    const settings = {
      mode: 'auto' as const,
      holidaysEnabled: true,
      selectedTheme: 'default' as const,
      themes: { autumn: { desktopImage: image }, halloween: { desktopImage: 'halloween.webp' } },
    };
    expect(holidayTheme(new Date('2026-10-20T12:00:00Z'))).toBe('halloween');
    expect(resolveHeroTheme(settings, {}, new Date('2026-10-19T12:00:00Z')).themeId).toBe('autumn');
    expect(resolveHeroTheme(settings, {}, new Date('2026-10-20T12:00:00Z')).themeId).toBe('halloween');
    expect(resolveHeroTheme(settings, {}, new Date('2026-11-02T12:00:00Z')).themeId).toBe('autumn');
    expect(holidayTheme(new Date('2026-12-26T12:00:00Z'))).toBe('christmas');
    expect(holidayTheme(new Date('2026-12-27T12:00:00Z'))).toBeNull();
  });

  it('falls back to configured season and then legacy hero image', () => {
    const settings = {
      mode: 'auto' as const,
      holidaysEnabled: true,
      selectedTheme: 'default' as const,
      themes: { autumn: { mobileImage: image } },
    };
    expect(resolveHeroTheme(settings, {}, new Date('2026-10-31T12:00:00Z')).content.desktopImage).toBe(image);
    expect(resolveHeroTheme(settings, {}, new Date('2026-10-31T12:00:00Z')).themeId).toBe('autumn');
    expect(resolveHeroTheme(undefined, { heroSection: ['legacy.webp'] }).content.desktopImage).toBe('legacy.webp');
  });

  it('applies holidays on top of a manually selected theme', () => {
    const settings = {
      mode: 'manual' as const,
      holidaysEnabled: true,
      selectedTheme: 'autumn' as const,
      themes: { autumn: { desktopImage: image }, christmas: { desktopImage: 'xmas.webp' } },
    };
    expect(resolveHeroTheme(settings, {}, new Date('2026-11-15T12:00:00Z')).themeId).toBe('autumn');
    expect(resolveHeroTheme(settings, {}, new Date('2026-12-05T12:00:00Z')).themeId).toBe('christmas');
    expect(resolveHeroTheme({ ...settings, holidaysEnabled: false }, {}, new Date('2026-12-05T12:00:00Z')).themeId).toBe('autumn');
  });

  it('respects custom, disabled and year-crossing holiday periods', () => {
    const holidays = {
      halloween: { enabled: false, start: '10-20', end: '11-01' },
      christmas: { enabled: true, start: '12-20', end: '01-06' },
    };
    expect(holidayTheme(new Date('2026-10-25T12:00:00Z'), holidays)).toBeNull();
    expect(holidayTheme(new Date('2026-12-19T12:00:00Z'), holidays)).toBeNull();
    expect(holidayTheme(new Date('2026-12-31T12:00:00Z'), holidays)).toBe('christmas');
    expect(holidayTheme(new Date('2027-01-06T12:00:00Z'), holidays)).toBe('christmas');
    expect(holidayTheme(new Date('2027-01-07T12:00:00Z'), holidays)).toBeNull();
  });

  it('parses day.month input', () => {
    expect(parseDayMonth('20.10')).toBe('10-20');
    expect(parseDayMonth(' 1.11. ')).toBe('11-01');
    expect(parseDayMonth('29.02')).toBe('02-29');
    expect(parseDayMonth('31.11')).toBeNull();
    expect(parseDayMonth('октябрь')).toBeNull();
  });

  it('resolves image ratios', () => {
    expect(heroRatio({ imageRatio: 'auto' })).toBeNull();
    expect(heroRatio({ imageRatio: '4:5' })).toBe(0.8);
    expect(heroRatio({ imageRatio: '16:9' })).toBeCloseTo(1.778, 3);
    expect(nearestHeroRatio(1199 / 1312)).toBe('1:1');
    expect(nearestHeroRatio(868 / 1100)).toBe('4:5');
    expect(nearestHeroRatio(1920 / 1080)).toBe('16:9');
  });

  it('puts Valentine first only in its season', async () => {
    const { orderOccasions } = await import('@/components/OccasionNav');
    expect(orderOccasions(new Date('2026-10-03T12:00:00Z'))[0].key).toBe('birthday');
    expect(orderOccasions(new Date('2027-02-10T12:00:00Z'))[0].key).toBe('valentine');
    expect(orderOccasions(new Date('2027-02-15T12:00:00Z'))[0].key).toBe('birthday');
  });
});
