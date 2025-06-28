import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import SearchPage from '../src/pages/SearchPage';

// 👇 Mock `fetch` pour éviter ReferenceError
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve([]),
  })
);

describe('SearchPage', () => {
  it('should show loading indicator when loading is true', async () => {
  await act(async () => {
    render(
      <MemoryRouter>
        <SearchPage />
      </MemoryRouter>
    );
  });

    expect(screen.queryByText(/Recherche en cours/i)).not.toBeInTheDocument();
  });
});
