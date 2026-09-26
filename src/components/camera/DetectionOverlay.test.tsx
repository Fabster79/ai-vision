import { render, screen } from '@testing-library/react';

import type { Detection } from '../../features/vision/detection-types';
import { DetectionOverlay } from './DetectionOverlay';

const detections: Detection[] = [
  {
    id: 'person-1',
    label: 'person',
    score: 0.91,
    boundingBox: { x: 320, y: 180, width: 640, height: 360 },
    color: { hex: '#000000', displayName: 'Noch nicht analysiert', confidence: 'low' },
  },
];

it('uses the same label, score and rank as the result list', () => {
  render(
    <DetectionOverlay
      detections={detections}
      sourceSize={{ width: 1920, height: 1080 }}
      viewportSize={{ width: 960, height: 540 }}
      mirrored={false}
    />,
  );

  expect(screen.getByLabelText('1 erkannte Objekte')).toBeInTheDocument();
  expect(screen.getByText('person')).toBeInTheDocument();
  expect(screen.getByText('91%')).toBeInTheDocument();
  expect(screen.getByText('1')).toBeInTheDocument();
});
