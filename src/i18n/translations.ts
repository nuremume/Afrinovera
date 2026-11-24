import type { Locale, LocalizedList, LocalizedText } from '../types';

export const UI_COPY: Record<Locale, Record<string, string>> = {
  en: {
    'nav.services': 'Services',
    'nav.portfolio': 'Portfolio',
    'nav.insights': 'Insights',
    'nav.about': 'About',
    'nav.portal': 'Portal',
    'nav.quote': 'Request Quote',
    'hero.tagline': 'Innovation Beyond Boundaries.',
    'hero.headline': 'Technology That Moves Your Business Forward.',
    'hero.subcopy':
      'We build digital experiences, develop intelligent software, strengthen cybersecurity, and deliver reliable technology solutions.',
    'hero.ctaPrimary': 'Explore Our Services',
    'hero.ctaSecondary': 'Request a Consultation',
    'section.capabilities': 'Core Technology Services',
    'section.capabilitiesSub':
      'Six integrated engineering and IT practices built for individuals, growing businesses, and institutions.',
    'section.proof': 'Verified Case Studies',
    'section.process': 'Eight-Step Delivery Process',
    'section.insights': 'Technology Insights',
    'cta.bannerTitle': 'Ready to Build a Dependable Digital System?',
    'cta.bannerSub':
      'Submit your project scope online to receive a tracking reference number and structured quotation.',
  },
  om: {
    'nav.services': 'Tajaajiloota',
    'nav.portfolio': 'Pirojektoota',
    'nav.insights': 'Barruulee',
    'nav.about': 'Waa’ee Keenya',
    'nav.portal': 'Poortaalii',
    'nav.quote': 'Tilmaama Gaafadhu',
    'hero.tagline': 'Kalaqa Daangaa Hin Qabne.',
    'hero.headline': 'Teeknoloojii Daldala Keessan Fuulduratti Tarkaanfachiisu.',
    'hero.subcopy':
      'Muuxannoo dijitaalaa ijaarra, sooftiweerii ammayyaa hojjenna, nageenya saayibarii cimsina, furmaata teeknoloojii amanamaa ni kennina.',
    'hero.ctaPrimary': 'Tajaajiloota Keenya Ilaalaa',
    'hero.ctaSecondary': 'Gorsa Gaafadhaa',
    'section.capabilities': 'Tajaajiloota Teeknoloojii Ijoo',
    'section.capabilitiesSub':
      'Tajaajiloota ijaarsa weebii, sooftiweerii, nageenya saayibarii fi deeggarsa IT dhaabbilee fi namoota dhuunfaaf.',
    'section.proof': 'Pirojektoota Mirkanaa’an',
    'section.process': 'Adeemsa Hojii Sadarkaa 8',
    'section.insights': 'Barruulee Teeknoloojii',
    'cta.bannerTitle': 'Sirna Dijitaalaa Amanamaa Ijaaruuf Qophiidhaa?',
    'cta.bannerSub':
      'Tarreeffama hojii keessanii ergee lakkoofsa hordoffii fi tilmaama gatii argadhaa.',
  },
  am: {
    'nav.services': 'አገልግሎቶች',
    'nav.portfolio': 'ፕሮጀክቶች',
    'nav.insights': 'ጽሑፎች',
    'nav.about': 'ስለ እኛ',
    'nav.portal': 'ፖርታል',
    'nav.quote': 'ዋጋ ይጠይቁ',
    'hero.tagline': 'ከድንበር ያለፈ ፈጠራ።',
    'hero.headline': 'ንግድዎን ወደፊት የሚያራምድ ቴክኖሎጂ።',
    'hero.subcopy':
      'ዘመናዊ ዲጂታል መፍትሄዎችን እንገነባለን፣ ብልህ ሶፍትዌሮችን እናዘጋጃለን፣ የሳይበር ደህንነትን እናጠናክራለን፣ አስተማማኝ የቴክኖሎጂ አገልግሎት እንሰጣለን።',
    'hero.ctaPrimary': 'አገልግሎቶቻችንን ይመልከቱ',
    'hero.ctaSecondary': 'ምክር ይጠይቁ',
    'section.capabilities': 'ዋና የቴክኖሎጂ አገልግሎቶች',
    'section.capabilitiesSub':
      'ለግለሰቦች፣ ለንግድ ድርጅቶች እና ለተቋማት የተገነቡ ስድስት የተቀናጁ የቴክኖሎጂ መፍትሄዎች።',
    'section.proof': 'የተረጋገጡ ፕሮጀክቶች',
    'section.process': 'የስምንት ደረጃ አሰራር ሂደት',
    'section.insights': 'የቴክኖሎጂ ጽሑፎች',
    'cta.bannerTitle': 'አስተማማኝ ዲጂታል ስርዓት ለመገንባት ዝግጁ ነዎት?',
    'cta.bannerSub':
      'የፕሮጀክት ዝርዝርዎን በመስመር ላይ በማስገባት የመከታተያ ቁጥር እና ዝርዝር የዋጋ ግምት ያግኙ።',
  },
};

export function t(locale: Locale, key: string): string {
  return UI_COPY[locale]?.[key] ?? UI_COPY.en[key] ?? key;
}

export function pickText(value: LocalizedText | string | undefined | null, locale: Locale): string {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return value[locale]?.trim() || value.en || '';
}

export function pickList(value: LocalizedList | undefined | null, locale: Locale): string[] {
  if (!value) return [];
  const items = value[locale];
  return items && items.length > 0 ? items : value.en || [];
}
