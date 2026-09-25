import { render, screen } from '@testing-library/react';

import { App } from './App';

describe('App', () => {
  it('communicates the privacy promise before camera access', () => {
    render(<App />);

    expect(screen.getByText('Bilder bleiben auf diesem Gerät.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Kamera starten/i })).toBeDisabled();
  });

  it('shows M0 as ready and camera work as next', () => {
    render(<App />);

    expect(screen.getByText('Bereit')).toBeInTheDocument();
    expect(screen.getByText('Als Nächstes')).toBeInTheDocument();
  });
});
