import {cleanup, render, waitForElement} from '@testing-library/react';
import React, {useContext, useEffect} from 'react';
import {LocalizeContext, LocalizeProvider} from '../index';

const Mock: React.FC<{shouldFail?: boolean; stayLoading?: boolean}> = ({shouldFail, stayLoading}) => {
  return (
    <LocalizeProvider>
      <MockChild shouldFail={shouldFail} stayLoading={stayLoading} />
    </LocalizeProvider>
  );
};

const MockChild: React.FC<{shouldFail?: boolean; stayLoading?: boolean}> = ({shouldFail, stayLoading}) => {
  const localize = useContext(LocalizeContext);
  const setLanguage = localize.setLanguage;
  useEffect(() => {
    const phrases = shouldFail ? undefined : {by_name: 'By %{name}'};
    if (!stayLoading) setLanguage('en', phrases);
  }, [setLanguage, shouldFail, stayLoading]);
  if (localize.loading) return <p data-testid="loading">loading</p>;
  if (localize.error) return <p data-testid="error">error</p>;
  return <p data-testid="success">{localize.t('by_name', {name: 'John Doe'})}</p>;
};

describe('Localization', () => {
  afterEach(cleanup);

  it('succeeds when setLanguage is called with language and phrases', async () => {
    const {getByTestId} = render(<Mock />);
    const success = await waitForElement(() => getByTestId('success'));
    expect(success.innerHTML).toBe('By John Doe');
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
});
