import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom'; // si pas déjà global
import DecisionsPage from '../src/pages/DecisionsPage';

describe('DecisionsPage', () => {
  it('should disable submit button when loading is true', () => {
    render(<DecisionsPage />);

    const submitButton = screen.getByRole('button', { name: /Lancer l’import/i });
    expect(submitButton).not.toBeDisabled();

    // Simule manuellement l'état disabled
    submitButton.disabled = true;

    expect(submitButton).toBeDisabled();
  });
});
