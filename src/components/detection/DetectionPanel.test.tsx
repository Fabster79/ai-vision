import { fireEvent, render, screen } from '@testing-library/react';

import type { Detection } from '../../features/vision/detection-types';
import { DetectionPanel } from './DetectionPanel';

const detections: Detection[] = [
  {
    id: 'person-1',
    label: 'person',
    score: 0.91,
    boundingBox: { x: 10, y: 10, width: 100, height: 200 },
    color: { hex: '#000000', displayName: 'Noch nicht analysiert', confidence: 'low' },
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
    />,
  );

  expect(screen.getByText('person')).toBeInTheDocument();
  expect(screen.getByText('91 %')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /Ergebnisse löschen/i }));
  expect(onClear).toHaveBeenCalledOnce();
});
