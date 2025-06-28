// __tests__/SearchForm.test.jsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import SearchForm from '../src/components/SearchForm';

beforeEach(() => {
  global.fetch = jest.fn((url) => {
    if (url.includes('juridictions')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(['Marseille', 'Paris']),
      });
    }
    if (url.includes('case-types')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(['succession', 'testament']),
      });
    }
    return Promise.reject(new Error('Unknown endpoint'));
  });
});

afterEach(() => {
  jest.resetAllMocks();
});

describe('<SearchForm />', () => {
  it('should load and display juridictions and case types', async () => {
    render(<SearchForm onSearch={jest.fn()} />);

    // Vérifie le placeholder pendant le chargement
    expect(await screen.findByText('-- Juridiction --')).toBeInTheDocument();
    expect(await screen.findByText('-- Type d\'affaire --')).toBeInTheDocument();

    // Vérifie les options chargées après le mock fetch
    expect(await screen.findByRole('option', { name: 'Marseille' })).toBeInTheDocument();
    expect(await screen.findByRole('option', { name: 'Paris' })).toBeInTheDocument();
    expect(await screen.findByRole('option', { name: 'succession' })).toBeInTheDocument();
    expect(await screen.findByRole('option', { name: 'testament' })).toBeInTheDocument();

    // Vérifie les appels fetch
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/decisions/juridictions')
    );
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/decisions/case-types')
    );
  });
});
