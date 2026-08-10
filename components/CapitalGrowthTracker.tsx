'use client';

import { useMemo, useState } from 'react';
import { Flex, Text } from '@godaddy/antares';
import { useIntl } from 'react-intl';
import { aggregateProjections } from '../lib/aggregate';
import { computeProjections } from '../lib/calc';
import type { Granularity } from '../lib/types';
import { Charts } from './Charts';
import { ControlPanel } from './ControlPanel';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ProjectionTable } from './ProjectionTable';

export default function CapitalGrowthTracker() {
  const { formatMessage } = useIntl();
  const [principal, setPrincipal] = useState(1000);
  const [dailyRatePercent, setDailyRatePercent] = useState(5);
  const [tradingDays, setTradingDays] = useState(252);
  const [granularity, setGranularity] = useState<Granularity>('months');

  const rows = useMemo(
    () => computeProjections({ principal, dailyRatePercent, tradingDays }),
    [principal, dailyRatePercent, tradingDays]
  );
  const summarizedRows = useMemo(
    () => aggregateProjections(rows, granularity),
    [rows, granularity]
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
        dailyRatePercent={dailyRatePercent}
        tradingDays={tradingDays}
        granularity={granularity}
        onPrincipalChange={setPrincipal}
        onDailyRateChange={setDailyRatePercent}
        onTradingDaysChange={setTradingDays}
        onGranularityChange={setGranularity}
      />
      <Charts rows={rows} />
      <ProjectionTable rows={summarizedRows} granularity={granularity} />
    </Flex>
  );
}
