'use client';

import { useEffect, useMemo, useState } from 'react';
import { Box, Flex, Text } from '@godaddy/antares';
import { getLocalTimeZone, today } from '@internationalized/date';
import { useIntl } from 'react-intl';
import { aggregateProjections } from '../lib/aggregate';
import { computeProjections } from '../lib/calc';
import { buildTradeSchedule, maximumTrades, type ScheduleInput } from '../lib/schedule';
import type { Granularity } from '../lib/types';
import { Charts } from './Charts';
import { ControlPanel } from './ControlPanel';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ProjectionTable } from './ProjectionTable';

export default function CapitalGrowthTracker() {
  const { formatMessage, formatDate } = useIntl();
  const [principal, setPrincipal] = useState(10000);
  const [ratePercent, setRatePercent] = useState(1.25);
  const [schedule, setSchedule] = useState<ScheduleInput | null>(null);
  const [granularity, setGranularity] = useState<Granularity>('months');

  useEffect(() => {
    const start = today(getLocalTimeZone());
    // Resolve the local date after hydration; static exports must not freeze it at build time.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSchedule({ mode: 'dates', startDate: start.toString(), endDate: start.add({ months: 3 }).toString(), tradeCount: 20, tradesPerWeek: 3 });
  }, []);

  const result = useMemo(() => schedule ? buildTradeSchedule(schedule) : { dates: [] }, [schedule]);
  const validCapital = Number.isFinite(principal) && principal >= 1 && principal <= 1_000_000_000
    && Number.isFinite(ratePercent) && ratePercent >= 0 && ratePercent <= 99;
  const rows = useMemo(() => validCapital
    ? computeProjections({ principal, ratePercent, tradeDates: result.dates }) : [],
  [principal, ratePercent, result.dates, validCapital]);
  const summarizedRows = useMemo(() => aggregateProjections(rows, granularity), [rows, granularity]);
  // A chart needs only the closing balance per date, while the table compounds every trade.
  const dailyRows = useMemo(() => [...new Map(rows.map((row) => [row.date, row])).values()], [rows]);
  const error = result.error ? `validation.${result.error}` : !validCapital ? 'validation.capital'
    : result.dates.length > 0 && rows.length === 0 ? 'validation.overflow' : null;
  const dateLabel = (value: string) => formatDate(`${value}T00:00:00Z`, { timeZone: 'UTC', dateStyle: 'medium' });
  const rangeEnd = schedule?.mode === 'dates' ? schedule.endDate : result.dates.at(-1);

  return (
    <Flex direction='column' gap='lg' padding='lg' className='cgt-page'>
      <Flex justifyContent='space-between' alignItems='center' gap='md' className='cgt-header'>
        <Text as='h1'>{formatMessage({ id: 'app.title' })}</Text>
        <LanguageSwitcher />
      </Flex>
      <Text as='p'>{formatMessage({ id: 'app.subtitle' })}</Text>
      {schedule && (
        <ControlPanel principal={principal} ratePercent={ratePercent} schedule={schedule}
          onPrincipalChange={setPrincipal} onRateChange={setRatePercent}
          onScheduleChange={setSchedule} />
      )}
      <Box elevation='card' padding='md' rounding='md' className='cgt-summary' role='status' aria-live='polite' aria-atomic='true'>
        {!schedule ? formatMessage({ id: 'schedule.loading' }) : error ? (
          <Text as='p' className='cgt-error'>{formatMessage({ id: error }, { max: maximumTrades })}</Text>
        ) : (
          <>
            <Text as='h2'>{formatMessage({ id: 'schedule.total' }, { count: result.dates.length })}</Text>
            {rangeEnd && <Text as='p'>{formatMessage({ id: schedule.mode === 'dates' ? 'schedule.range' : 'schedule.calculatedRange' }, {
              start: dateLabel(schedule.startDate), end: dateLabel(rangeEnd)
            })}</Text>}
            {result.dates.length > 0 ? (
              <Text as='p' className='cgt-help'>{formatMessage({ id: 'schedule.sessions' }, {
                first: dateLabel(result.dates[0]), last: dateLabel(result.dates.at(-1))
              })}</Text>
            ) : <Text as='p'>{formatMessage({ id: 'schedule.empty' })}</Text>}
          </>
        )}
      </Box>
      {!error && rows.length > 0 && <Charts rows={dailyRows} principal={principal} />}
      {!error && <ProjectionTable rows={summarizedRows} granularity={granularity} onGranularityChange={setGranularity} />}
    </Flex>
  );
}
