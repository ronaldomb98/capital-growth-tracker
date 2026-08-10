'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { I18nProvider } from 'react-aria-components';
import { IntlProvider } from 'react-intl';
import enMessages from '../locales/en.json';
import esMessages from '../locales/es.json';

export type Locale = 'en' | 'es';

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

const LocaleContext = createContext<LocaleContextValue | undefined>(undefined);
const messages = { en: enMessages, es: esMessages } as const;
const reactAriaLocales = { en: 'en-US', es: 'es-ES' } as const;
const storageKey = 'cgt-locale';

export function Providers({
  children,
  initialLocale = 'en'
}: {
  children: React.ReactNode;
  initialLocale?: Locale;
}) {
  const [locale, setLocale] = useState<Locale>(initialLocale);

  useEffect(() => {
    const storedLocale = window.localStorage.getItem(storageKey);
    if (storedLocale === 'en' || storedLocale === 'es') {
      // Sync after hydration so the server-rendered default locale stays stable.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLocale(storedLocale);
    }
  }, []);

  const value = useMemo(
    () => ({
      locale,
      setLocale: (nextLocale: Locale) => {
        window.localStorage.setItem(storageKey, nextLocale);
        setLocale(nextLocale);
      }
    }),
    [locale]
  );

  return (
    <LocaleContext.Provider value={value}>
      <IntlProvider
        locale={locale}
        defaultLocale='en'
        messages={messages[locale]}
      >
        <I18nProvider locale={reactAriaLocales[locale]}>
          {children}
        </I18nProvider>
      </IntlProvider>
    </LocaleContext.Provider>
  );
}

export function useLocaleContext(): LocaleContextValue {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocaleContext must be used within Providers');
  }
  return context;
}
