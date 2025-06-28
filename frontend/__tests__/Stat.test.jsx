import React from 'react';
import { render, screen } from '@testing-library/react';
import Stat from '../src/components/Stat';

describe('<Stat />', () => {
  it('affiche correctement le total et le dernier import formaté', () => {
    const total = 10;
    const lastCount = 5;
    const lastDate = '2024-01-14T00:00:00Z';

    render(
      <Stat
        totalDecisions={total}
        lastImportCount={lastCount}
        lastImportDate={lastDate}
      />
    );

    expect(screen.getByText(/Corpus total : 10 décisions/i)).toBeInTheDocument();
    expect(
      screen.getByText((content) =>
        content.includes('Dernier import : 5 décisions') && content.includes('(le 14/01/2024)')
      )
    ).toBeInTheDocument();
  });

  it("n'affiche pas de date si lastImportDate est vide", () => {
    render(
      <Stat
        totalDecisions={1}
        lastImportCount={1}
        lastImportDate=""
      />
    );

    expect(screen.getByText(/Corpus total : 1 décisions/i)).toBeInTheDocument();
    expect(screen.getByText(/Dernier import : 1 décisions/i)).toBeInTheDocument();
    expect(screen.queryByText(/\(le/)).not.toBeInTheDocument();
  });
});
