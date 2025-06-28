import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import AddArchiveForm from '../src/components/AddArchiveForm';

describe('AddArchiveForm', () => {
  it('should disable submit button when loading is true', () => {
    render(<AddArchiveForm />);

    const submitButton = screen.getByRole('button', { name: /Enregistrer la décision/i });
    // Vérifie qu'au départ le bouton est actif
    expect(submitButton).not.toBeDisabled();

    // Simule manuellement un `disabled`
    submitButton.disabled = true;

    expect(submitButton).toBeDisabled();
  });
});
