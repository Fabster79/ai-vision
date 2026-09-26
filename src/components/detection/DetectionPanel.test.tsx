import { fireEvent, render, screen } from '@testing-library/react';

import type { Detection } from '../../features/vision/detection-types';
import { DetectionPanel } from './DetectionPanel';

const detections: Detection[] = [
  {
    id: 'person-1',
    label: 'person',
    score: 0.91,
    boundingBox: { x: 10, y: 10, width: 100, height: 200 },
    color: { hex: '#d22f2f', displayName: 'Rot', confidence: 'high' },
  },
];

it('shows detection details and clears results on request', () => {
  const onClear = vi.fn();
  render(
    <DetectionPanel
      status="ready"
      message="KI bereit"
      cameraActive
      isDetecting={false}
      detections={detections}
      onAnalyze={vi.fn()}
      onRetry={vi.fn()}
      onClear={onClear}
      isLive={false}
      batterySaver
      lastUpdated={new Date('2026-09-26T12:34:56Z')}
      performanceMetrics={null}
      onToggleBatterySaver={vi.fn()}
    />,
  );

  expect(screen.getByText('person')).toBeInTheDocument();
  expect(screen.getByText('91 %')).toBeInTheDocument();
  expect(screen.getByText('Geschätzte Hauptfarbe: Rot')).toBeInTheDocument();
  expect(screen.getByText('#D22F2F · Sicherheit hoch')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /Ergebnisse löschen/i }));
  expect(onClear).toHaveBeenCalledOnce();
});
