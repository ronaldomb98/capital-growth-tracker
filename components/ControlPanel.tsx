'use client';

import {
  Box, Button, DatePicker, DatePickerCalendar, DateRangePicker,
  DateRangePickerCalendar, FieldError, Flex, Grid, Group, Input, Label,
  NumberField, Radio, RadioGroup, Text,
  type NumberFieldProps
} from '@godaddy/antares';
import { NumberParser } from '@internationalized/number';
import { parseDate } from '@internationalized/date';
import { useIntl } from 'react-intl';
import { maximumDate, maximumTrades, maximumTradesPerWeek, minimumDate, type ScheduleInput } from '../lib/schedule';

export interface ControlPanelProps {
  principal: number;
  ratePercent: number;
  schedule: ScheduleInput;
  onPrincipalChange: (value: number) => void;
  onRateChange: (value: number) => void;
  onScheduleChange: (value: ScheduleInput) => void;
}

function NumericField({ label, exactStep = false, ...props }: Omit<NumberFieldProps, 'children'> & { label: string; exactStep?: boolean }) {
  const { formatMessage, locale } = useIntl();
  const invalid = !Number.isFinite(props.value) || props.value < props.minValue || props.value > props.maxValue;
  return (
    <NumberField {...props} className='cgt-number-field' commitBehavior={exactStep ? 'validate' : 'snap'}
      isRequired isInvalid={invalid} validationBehavior='aria'>
      {({ state }) => {
        // Antares snaps regular steppers to multiples of step. Preserve entered
        // hundredths for capital and rate instead of rounding away decimals.
        const parsed = new NumberParser(locale, props.formatOptions).parse(state.inputValue);
        const stepBy = (direction: number) => {
          const value = Number.isFinite(parsed) ? parsed : props.minValue;
          state.setNumberValue(Math.min(props.maxValue, Math.max(props.minValue,
            Math.round((value + direction * props.step) * 100) / 100)));
        };
        return (
          <>
            <Label>{label}</Label>
            <Group>
              {exactStep ? (
                <Button slot='control' onPress={() => stepBy(-1)} isDisabled={parsed <= props.minValue}
                  aria-label={`${formatMessage({ id: 'controls.decrease' })} ${label}`}>−</Button>
              ) : <Button slot='decrement' />}
              <Input inputMode={props.formatOptions?.maximumFractionDigits === 0 ? 'numeric' : 'decimal'}
                autoComplete='off' spellCheck={false} onKeyDownCapture={exactStep ? (event) => {
                if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
                  event.preventDefault();
                  event.stopPropagation();
                  stepBy(event.key === 'ArrowUp' ? 1 : -1);
                }
              } : undefined} />
              {exactStep ? (
                <Button slot='control' onPress={() => stepBy(1)} isDisabled={parsed >= props.maxValue}
                  aria-label={`${formatMessage({ id: 'controls.increase' })} ${label}`}>+</Button>
              ) : <Button slot='increment' />}
            </Group>
            <FieldError>{formatMessage({ id: 'validation.number' }, { min: props.minValue, max: props.maxValue })}</FieldError>
          </>
        );
      }}
    </NumberField>
  );
}

export function ControlPanel({
  principal, ratePercent, schedule,
  onPrincipalChange, onRateChange, onScheduleChange
}: ControlPanelProps) {
  const { formatMessage } = useIntl();
  const msg = (id: string) => formatMessage({ id });
  const updateSchedule = (change: Partial<ScheduleInput>) => onScheduleChange({ ...schedule, ...change });
  const dateLimits = { minValue: parseDate(minimumDate), maxValue: parseDate(maximumDate) };

  return (
    <Box elevation='card' padding='md' rounding='md' className='cgt-panel'>
      <Flex direction='column' gap='lg'>
        <Grid columns='repeat(auto-fit, minmax(min(100%, 230px), 1fr))' gap='md'>
          <NumericField label={`${msg('controls.principal')} (USD)`}
            value={principal} onChange={onPrincipalChange} minValue={1} maxValue={1_000_000_000}
            exactStep step={1} formatOptions={{ maximumFractionDigits: 2 }} />
          <NumericField label={msg('controls.rate')}
            value={ratePercent} onChange={onRateChange} minValue={0} maxValue={99}
            exactStep step={0.1} formatOptions={{ maximumFractionDigits: 2 }} />
          <NumericField label={msg('controls.tradesPerWeek')}
            value={schedule.tradesPerWeek} onChange={(tradesPerWeek) => updateSchedule({ tradesPerWeek })}
            minValue={1} maxValue={maximumTradesPerWeek} step={1} formatOptions={{ maximumFractionDigits: 0 }} />
        </Grid>
        <RadioGroup orientation='horizontal' value={schedule.mode} onChange={(mode) => updateSchedule({ mode: mode as ScheduleInput['mode'] })}>
          <Label>{msg('controls.mode')}</Label>
          <Group className='cgt-mode-options'>
            <Radio value='dates'>{msg('controls.mode.dates')}</Radio>
            <Radio value='trades'>{msg('controls.mode.trades')}</Radio>
          </Group>
        </RadioGroup>
        <Grid columns='repeat(auto-fit, minmax(min(100%, 280px), 1fr))' gap='md'>
          {schedule.mode === 'dates' ? (
            <DateRangePicker {...dateLimits} isRequired className='cgt-date-field'
              value={{ start: parseDate(schedule.startDate), end: parseDate(schedule.endDate) }}
              onChange={(range) => range && updateSchedule({ startDate: range.start.toString(), endDate: range.end.toString() })}>
              <Label>{msg('controls.dateRange')}</Label>
              <Button slot='trigger' />
              <DateRangePickerCalendar pageCount={1} popoverProps={{ containerProps: { className: 'cgt-calendar-popover' } }} />
              <FieldError />
            </DateRangePicker>
          ) : (
            <>
              <DatePicker {...dateLimits} isRequired className='cgt-date-field' value={parseDate(schedule.startDate)}
                onChange={(date) => date && updateSchedule({
                  startDate: date.toString(),
                  endDate: schedule.endDate < date.toString() ? date.toString() : schedule.endDate
                })}>
                <Label>{msg('controls.startDate')}</Label>
                <Button slot='trigger' />
                <DatePickerCalendar popoverProps={{ containerProps: { className: 'cgt-calendar-popover' } }} />
                <FieldError />
              </DatePicker>
              <NumericField label={msg('controls.tradeCount')}
                value={schedule.tradeCount} onChange={(tradeCount) => updateSchedule({ tradeCount })}
                minValue={1} maxValue={maximumTrades} step={1} formatOptions={{ maximumFractionDigits: 0 }} />
            </>
          )}
        </Grid>
        <Text as='p' className='cgt-help'>{msg('controls.scheduleHelp')}</Text>
      </Flex>
    </Box>
  );
}
