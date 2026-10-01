import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import * as Aria from 'react-aria-components';
import * as Antares from '@godaddy/antares';
import { NumberParser } from '@internationalized/number';

afterEach(cleanup);

// Characterization of the installed upstream components, deliberately excluding
// the app's Providers, NumericField, DecimalField and custom stepper handlers.
const cases = [
  { locale: 'en-US', input: '1,5', expected: 15 },
  { locale: 'en-US', input: '1.5', expected: 1.5 },
  { locale: 'es-ES', input: '1,5', expected: 1.5 },
  { locale: 'es-ES', input: '1.5', expected: 15 }
];

for (const [name, { NumberField, Label, Input }] of [['React Aria', Aria], ['Antares', Antares]] as const) {
  describe(`${name} upstream decimal interpretation`, () => {
    for (const method of ['type', 'paste'] as const) {
      it.each(cases)(`${method}: $locale parses $input as $expected`, async ({ locale, input, expected }) => {
        const user = userEvent.setup();
        const onChange = vi.fn();
        render(
          <Aria.I18nProvider locale={locale}>
            <NumberField minValue={0} maxValue={99} step={0.1} commitBehavior='validate'
              formatOptions={{ maximumFractionDigits: 2 }} onChange={onChange}>
              <Label>Profit</Label>
              <Input inputMode='decimal' />
            </NumberField>
          </Aria.I18nProvider>
        );
        const field = screen.getByRole('textbox', { name: 'Profit' });
        await user.click(field);
        if (method === 'type') await user.type(field, input);
        else await user.paste(input);
        await user.tab();
        expect(onChange).toHaveBeenLastCalledWith(expected);
        expect((field as HTMLInputElement).value).toBe(new Intl.NumberFormat(locale).format(expected));
      });
    }

    it('useGrouping=false rejects a typed comma rather than treating it as a decimal', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <Aria.I18nProvider locale='en-US'>
          <NumberField minValue={0} maxValue={99} step={0.1} commitBehavior='validate'
            formatOptions={{ maximumFractionDigits: 2, useGrouping: false }} onChange={onChange}>
            <Label>Profit</Label>
            <Input inputMode='decimal' />
          </NumberField>
        </Aria.I18nProvider>
      );
      const field = screen.getByRole('textbox', { name: 'Profit' });
      await user.type(field, '1,');
      expect((field as HTMLInputElement).value).toBe('1');
      await user.type(field, '5');
      await user.tab();
      expect(onChange).toHaveBeenLastCalledWith(15);
    });
  });
}

describe('underlying @internationalized/number parser', () => {
  it.each(cases)('$locale parses $input as $expected without React or Antares', ({ locale, input, expected }) => {
    const parser = new NumberParser(locale, { maximumFractionDigits: 2 });
    expect(parser.isValidPartialNumber(input, 0, 99)).toBe(true);
    expect(parser.parse(input)).toBe(expected);
  });

  it('disabling grouping rejects the alternate separator instead of enabling decimal fallback', () => {
    const parser = new NumberParser('en-US', { maximumFractionDigits: 2, useGrouping: false });
    expect(parser.isValidPartialNumber('1,5', 0, 99)).toBe(false);
    expect(parser.parse('1,5')).toBeNaN();
  });
});
