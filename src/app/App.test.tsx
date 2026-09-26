import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { App } from './App';

vi.mock('@mediapipe/tasks-vision', () => ({
  FilesetResolver: {
    forVisionTasks: vi.fn().mockRejectedValue(new Error('MediaPipe test load failure')),
  },
  ObjectDetector: { createFromOptions: vi.fn() },
}));

const stop = vi.fn();
const getUserMedia = vi.fn();
const enumerateDevices = vi.fn();
const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);

function cameraStream(): MediaStream {
  return {
    getTracks: () => [{ stop }],
    getVideoTracks: () => [{ getSettings: () => ({ deviceId: 'rear' }) }],
  } as unknown as MediaStream;
}

beforeEach(() => {
  consoleError.mockClear();
  stop.mockReset();
  getUserMedia.mockReset();
  enumerateDevices.mockReset().mockResolvedValue([
    { kind: 'videoinput', deviceId: 'rear', label: 'Back camera', groupId: '1' },
    { kind: 'videoinput', deviceId: 'front', label: 'Front camera', groupId: '1' },
  ]);
  Object.defineProperty(window, 'isSecureContext', { configurable: true, value: true });
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: vi.fn().mockReturnValue({ matches: true }),
  });
  Object.defineProperty(navigator, 'mediaDevices', {
    configurable: true,
    value: { getUserMedia, enumerateDevices },
  });
  Object.defineProperty(HTMLMediaElement.prototype, 'srcObject', {
    configurable: true,
    writable: true,
    value: null,
  });
});

describe('App', () => {
  it('reports model loading failures with their cause in the browser console', async () => {
    render(<App />);

    await screen.findByText(/KI-Modell konnte nicht geladen werden/i);
    expect(consoleError).toHaveBeenCalledWith(
      '[PocketVision] KI-Modell konnte nicht geladen werden.',
      expect.anything(),
    );
  });

  it('communicates privacy before camera access and only starts after a tap', async () => {
    getUserMedia.mockResolvedValue(cameraStream());
    render(<App />);

    expect(screen.getByText(/weder hochgeladen noch gespeichert/i)).toBeInTheDocument();
    expect(getUserMedia).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: /Kamera starten/i }));

    await screen.findByText('Kamera aktiv');
    expect(getUserMedia).toHaveBeenCalledWith({
      audio: false,
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: { ideal: 'environment' },
      },
    });
  });

  it('stops every stream track explicitly', async () => {
    getUserMedia.mockResolvedValue(cameraStream());
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Kamera starten/i }));
    fireEvent.click(await screen.findByRole('button', { name: /Stoppen/i }));

    expect(stop).toHaveBeenCalledOnce();
    expect(screen.getAllByText('Kamera wurde gestoppt.')).toHaveLength(2);
  });

  it('explains a denied camera permission', async () => {
    getUserMedia.mockRejectedValue(new DOMException('Denied', 'NotAllowedError'));
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Kamera starten/i }));

    await waitFor(() => expect(screen.getAllByText(/Browser-Einstellungen/i)).toHaveLength(2));
    expect(screen.getByText('Kamera nicht verfügbar')).toBeInTheDocument();
  });
});
