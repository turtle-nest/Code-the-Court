import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import AddArchiveForm from '../src/components/AddArchiveForm';

describe('AddArchiveForm', () => {
  it('should disable submit button when loading is true', async () => {
    render(<AddArchiveForm />);

    const submitButton = screen.getByRole('button', { name: /Enregistrer la décision/i });

    expect(submitButton).not.toBeDisabled();

    await userEvent.click(submitButton);

    expect(submitButton).toBeDisabled();
  });
});
