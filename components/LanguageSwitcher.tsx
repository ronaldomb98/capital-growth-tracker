'use client';

import {
  SegmentedController,
  SegmentedControllerItem
} from '@godaddy/antares';
import { useIntl } from 'react-intl';
import { type Locale, useLocaleContext } from '../app/providers';

export function LanguageSwitcher() {
  const { locale, setLocale } = useLocaleContext();
  const { formatMessage } = useIntl();

  return (
    <SegmentedController
      aria-label={formatMessage({ id: 'lang.label' })}
      value={locale}
      onSelectionChange={(value) => setLocale(value as Locale)}
    >
      <SegmentedControllerItem value='en'>EN</SegmentedControllerItem>
      <SegmentedControllerItem value='es'>ES</SegmentedControllerItem>
    </SegmentedController>
  );
}
