/**
 * Fixed Offer Pricing Configuration
 *
 * Offer price is fixed at 7 € across all regions.
 * Localization pricing algorithms and dynamic IP lookups have been removed.
 */

export interface CountryPricingConfig {
  countryCode: 'FR' | 'CH' | 'BE' | 'DEFAULT';
  countryName: string;
  countryNameFr: string;
  price: number;
  formattedPrice: string;
  currencyCode: 'EUR';
  currencySymbol: '€';
  crossedPriceFormatted: string;
  flag: string;
}

export const FIXED_OFFER_PRICE = 7;
export const FIXED_OFFER_PRICE_FORMATTED = '7 €';
export const FIXED_CROSSED_PRICE_FORMATTED = '420 €';

export const COUNTRY_PRICING: Record<'FR' | 'CH' | 'BE' | 'DEFAULT', CountryPricingConfig> = {
  FR: {
    countryCode: 'FR',
    countryName: 'France',
    countryNameFr: 'France',
    price: FIXED_OFFER_PRICE,
    formattedPrice: FIXED_OFFER_PRICE_FORMATTED,
    currencyCode: 'EUR',
    currencySymbol: '€',
    crossedPriceFormatted: FIXED_CROSSED_PRICE_FORMATTED,
    flag: '🇫🇷',
  },
  CH: {
    countryCode: 'CH',
    countryName: 'Suisse',
    countryNameFr: 'Suisse',
    price: FIXED_OFFER_PRICE,
    formattedPrice: FIXED_OFFER_PRICE_FORMATTED,
    currencyCode: 'EUR',
    currencySymbol: '€',
    crossedPriceFormatted: FIXED_CROSSED_PRICE_FORMATTED,
    flag: '🇨🇭',
  },
  BE: {
    countryCode: 'BE',
    countryName: 'Belgique',
    countryNameFr: 'Belgique',
    price: FIXED_OFFER_PRICE,
    formattedPrice: FIXED_OFFER_PRICE_FORMATTED,
    currencyCode: 'EUR',
    currencySymbol: '€',
    crossedPriceFormatted: FIXED_CROSSED_PRICE_FORMATTED,
    flag: '🇧🇪',
  },
  DEFAULT: {
    countryCode: 'DEFAULT',
    countryName: 'Europe / International',
    countryNameFr: 'Europe / International',
    price: FIXED_OFFER_PRICE,
    formattedPrice: FIXED_OFFER_PRICE_FORMATTED,
    currencyCode: 'EUR',
    currencySymbol: '€',
    crossedPriceFormatted: FIXED_CROSSED_PRICE_FORMATTED,
    flag: '🇪🇺',
  },
};

export interface GeoDetectionResult {
  countryCode: 'FR' | 'CH' | 'BE' | 'DEFAULT';
  config: CountryPricingConfig;
  source: 'default' | 'url_param' | 'local_cache';
  rawCountry?: string;
}

/**
 * Normalizes any detected country string to our supported target set.
 */
export function normalizeCountry(code?: string | null): 'FR' | 'CH' | 'BE' | 'DEFAULT' {
  if (!code) return 'DEFAULT';
  const upper = code.trim().toUpperCase();
  if (upper === 'FR' || upper === 'FRA' || upper === 'FRANCE') return 'FR';
  if (upper === 'CH' || upper === 'CHE' || upper === 'SWITZERLAND' || upper === 'SUISSE' || upper === 'SUICA') return 'CH';
  if (upper === 'BE' || upper === 'BEL' || upper === 'BELGIUM' || upper === 'BELGIQUE' || upper === 'BELGICA') return 'BE';
  return 'DEFAULT';
}

/**
 * Optional URL param check for language/flag preferences without altering the fixed 7€ price.
 */
export function detectFromUrlParams(): GeoDetectionResult | null {
  if (typeof window === 'undefined') return null;
  try {
    const params = new URLSearchParams(window.location.search);
    const candidate = params.get('country') || params.get('geo') || params.get('pays') || params.get('location');
    if (candidate) {
      const normalized = normalizeCountry(candidate);
      return {
        countryCode: normalized,
        config: COUNTRY_PRICING[normalized],
        source: 'url_param',
        rawCountry: candidate,
      };
    }
  } catch (e) {
    // Ignore URL parsing errors
  }
  return null;
}

export function detectFromCache(): GeoDetectionResult | null {
  return null;
}

export function saveToCache(_countryCode: string, _rawCountry?: string): void {
  // Localization caching removed to enforce uniform 7€ pricing
}

export function detectFromBrowserHeuristics(): GeoDetectionResult {
  return {
    countryCode: 'FR',
    config: COUNTRY_PRICING.FR,
    source: 'default',
    rawCountry: 'standard',
  };
}

/**
 * Network detection removed as requested.
 * Returns null immediately without making any external network requests.
 */
export async function detectFromNetwork(): Promise<{ countryCode: 'FR' | 'CH' | 'BE' | 'DEFAULT'; source: GeoDetectionResult['source']; rawCountry: string } | null> {
  return null;
}

/**
 * Returns fixed 7€ offer configuration.
 */
export function getInitialGeoState(): GeoDetectionResult {
  const urlParam = detectFromUrlParams();
  if (urlParam) {
    return urlParam;
  }
  return {
    countryCode: 'FR',
    config: COUNTRY_PRICING.FR,
    source: 'default',
    rawCountry: 'standard',
  };
}
