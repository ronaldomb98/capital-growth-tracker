'use client';

import { useMemo, useState } from 'react';
import { Flex, Text } from '@godaddy/antares';
import { useIntl } from 'react-intl';
import { computeProjections } from '../lib/calc';
import type { Frequency } from '../lib/types';
import { Charts } from './Charts';
import { ControlPanel } from './ControlPanel';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ProjectionTable } from './ProjectionTable';

export default function CapitalGrowthTracker() {
  const { formatMessage } = useIntl();
  const [principal, setPrincipal] = useState(1000);
  const [ratePercent, setRatePercent] = useState(5);
  const [periods, setPeriods] = useState(12);
  const [frequency, setFrequency] = useState<Frequency>('months');

  const rows = useMemo(
    () => computeProjections({ principal, ratePercent, periods }),
    [principal, ratePercent, periods]
  );

  return (
    <Flex direction='column' gap='lg' padding='lg' className='cgt-page'>
      <Flex justifyContent='space-between' alignItems='center' gap='md' className='cgt-header'>
        <Text as='h1'>{formatMessage({ id: 'app.title' })}</Text>
        <LanguageSwitcher />
      </Flex>
      <Text as='p'>{formatMessage({ id: 'app.subtitle' })}</Text>
      <ControlPanel
        principal={principal}
        ratePercent={ratePercent}
        periods={periods}
        frequency={frequency}
        onPrincipalChange={setPrincipal}
        onRateChange={setRatePercent}
        onPeriodsChange={setPeriods}
        onFrequencyChange={setFrequency}
      />
      <Charts rows={rows} frequency={frequency} />
      <ProjectionTable rows={rows} frequency={frequency} />
    </Flex>
  );
}
