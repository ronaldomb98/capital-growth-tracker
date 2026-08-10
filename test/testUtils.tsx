import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { Providers, type Locale } from '../app/providers';

export function renderWithIntl(ui: ReactElement, locale: Locale = 'en') {
  return render(<Providers initialLocale={locale}>{ui}</Providers>);
}
