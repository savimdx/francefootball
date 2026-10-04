import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  COUNTRY_PRICING,
  FIXED_OFFER_PRICE,
  FIXED_OFFER_PRICE_FORMATTED,
  GeoDetectionResult,
  getInitialGeoState,
  normalizeCountry,
} from '../utils/geolocation';

export interface CurrencyContextProps {
  originalPrice: number;
  convertedPrice: number;
  currencyCode: string;
  currencySymbol: string;
  formattedPrice: string;
  isConverting: boolean;
  rate: number;
  detectedCountry: string;
  countryName: string;
  countryNameFr: string;
  countryFlag: string;
  geoSource: string;
  setCurrency: (code: string) => void;
  setCountry: (countryCode: string) => void;
  convertAndFormat: (value: number) => string;
}

const CurrencyContext = createContext<CurrencyContextProps | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Uniform offer fixed at 5 €
  const initialGeo = getInitialGeoState();
  const [activeGeo, setActiveGeo] = useState<GeoDetectionResult>(initialGeo);

  // Clear any previous geolocation cache on startup
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem('lead_geo_country_data_v2');
      }
    } catch (e) {
      // Ignore storage errors
    }
  }, []);

  // Standard formatter: always formats as Euro (e.g. 420 -> "420 €", 5 -> "5 €")
  const convertAndFormat = useCallback((val: number): string => {
    return `${val} €`;
  }, []);

  // Country setter for flag/locale if needed, keeping price fixed at 5 €
  const setCountry = useCallback((code: string) => {
    const normalized = normalizeCountry(code);
    const config = COUNTRY_PRICING[normalized];
    setActiveGeo({
      countryCode: normalized,
      config,
      source: 'url_param',
      rawCountry: code,
    });
  }, []);

  const setCurrency = useCallback((_code: string) => {
    // Currency is uniformly EUR (€)
  }, []);

  const config = activeGeo.config;

  return (
    <CurrencyContext.Provider
      value={{
        originalPrice: FIXED_OFFER_PRICE,
        convertedPrice: FIXED_OFFER_PRICE,
        currencyCode: 'EUR',
        currencySymbol: '€',
        formattedPrice: FIXED_OFFER_PRICE_FORMATTED,
        isConverting: false,
        rate: 1,
        detectedCountry: config.countryCode,
        countryName: config.countryName,
        countryNameFr: config.countryNameFr,
        countryFlag: config.flag,
        geoSource: activeGeo.source,
        setCurrency,
        setCountry,
        convertAndFormat,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
