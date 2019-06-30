import {cleanup, render, waitForElement} from '@testing-library/react';
import React, {useEffect} from 'react';
import {LocalizeProvider, useLocalize, Localize, staticTranslate} from '../index';

const Mock: React.FC<{shouldFail?: boolean; stayLoading?: boolean}> = ({shouldFail, stayLoading}) => {
  return (
    <LocalizeProvider>
      <MockChild shouldFail={shouldFail} stayLoading={stayLoading} />
    </LocalizeProvider>
  );
};

const MockChild: React.FC<{shouldFail?: boolean; stayLoading?: boolean}> = ({shouldFail, stayLoading}) => {
  const localize = useLocalize();

  const setLanguage = localize.setLanguage;
  useEffect(() => {
    const phrases = shouldFail ? undefined : {by_name: 'By %{name}'};
    if (!stayLoading) setLanguage('en', phrases);
  }, [setLanguage, shouldFail, stayLoading]);

  if (localize.loading) return <p data-testid="loading">loading</p>;
  if (localize.error) return <p data-testid="error">error</p>;
  return (
    <>
      <p data-testid="success-static">{staticTranslate.t('by_name', {name: 'John Doe'})}</p>
      <p data-testid="success-transform">
        <Localize t={'by_name'} options={{name: 'John Doe'}} transformString={s => `transformed - ${s}`} />
      </p>
      <p data-testid="success">
        <Localize t={'by_name'} options={{name: 'John Doe'}} />
      </p>
    </>
  );
};

const ErrorMock: React.FC<{setLanguage?: boolean; isLanguageCached?: boolean; clearCache?: boolean; t?: boolean}> = ({
  setLanguage,
  isLanguageCached,
  clearCache,
  t,
}) => {
  const localize = useLocalize();

  useEffect(() => {
    if (setLanguage) localize.setLanguage('a');
    if (isLanguageCached) localize.isLanguageCached('a');
    if (clearCache) localize.clearCache();
    if (t) localize.t('a');
  });

  return null;
};

describe('Localization', () => {
  // Silence verbose errors.
  const originalError = console.error;
  beforeAll(() => {
    console.error = (...args: string[]) => {
      if (/Error: Uncaught/.test(args[0])) return;
      originalError.call(console, ...args);
    };
  });
  afterAll(() => (console.error = originalError));

  afterEach(cleanup);

  it('succeeds when setLanguage is called with language and phrases', async () => {
    const {getByTestId} = render(<Mock />);
    const success = await waitForElement(() => getByTestId('success'));
    expect(success.innerHTML).toBe('By John Doe');
  });

  it('transforms string if provided a transformString function', async () => {
    const {getByTestId} = render(<Mock />);
    const success = await waitForElement(() => getByTestId('success-transform'));
    expect(success.innerHTML).toBe('transformed - By John Doe');
  });

  it('fails when setLanguage is called with language but no phrases', async () => {
    const {getByTestId} = render(<Mock shouldFail />);
    const error = await waitForElement(() => getByTestId('error'));
    expect(error).toBeTruthy();
  });

  it('remains loading if set language is never called', async () => {
    const {getByTestId} = render(<Mock stayLoading />);
    const loading = await waitForElement(() => getByTestId('loading'));
    expect(loading).toBeTruthy();
  });

  it('staticTranslate translates properly', async () => {
    const {getByTestId} = render(<Mock />);
    const success = await waitForElement(() => getByTestId('success-static'));
    expect(success.innerHTML).toBe('By John Doe');
  });

  it('throws error with no provider', async () => {
    const setLanguage = () => render(<ErrorMock setLanguage />);
    expect(setLanguage).toThrow(Error);

    const isLanguageCached = () => render(<ErrorMock isLanguageCached />);
    expect(isLanguageCached).toThrow(Error);

    const clearCache = () => render(<ErrorMock clearCache />);
    expect(clearCache).toThrow(Error);

    const t = () => render(<ErrorMock t />);
    expect(t).toThrow(Error);
  });
});
