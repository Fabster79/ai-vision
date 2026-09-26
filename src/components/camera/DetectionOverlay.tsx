import type { CSSProperties } from 'react';

import type { Detection } from '../../features/vision/detection-types';
import { projectCoverBox, type Size } from '../../lib/geometry';

type DetectionOverlayProps = {
  detections: Detection[];
  sourceSize: Size;
  viewportSize: Size;
  mirrored: boolean;
};

function labelColor(label: string) {
  let hash = 0;
  for (const character of label) hash = (hash * 31 + character.charCodeAt(0)) % 360;
  return `hsl(${hash} 78% 62%)`;
}

export function DetectionOverlay({
  detections,
  sourceSize,
  viewportSize,
  mirrored,
}: DetectionOverlayProps) {
  return (
    <div className="detection-overlay" aria-label={`${detections.length} erkannte Objekte`}>
      {detections.map((detection, index) => {
        const box = projectCoverBox(detection.boundingBox, sourceSize, viewportSize, mirrored);
        if (!box) return null;
        const color = labelColor(detection.label);
        const style = {
          '--box-color': color,
          left: box.x,
          top: box.y,
          width: box.width,
          height: box.height,
        } as CSSProperties;

        return (
          <div className="detection-box" style={style} key={detection.id}>
            <span className="detection-box__label">
              <b>{index + 1}</b>
              <span>{detection.label}</span>
              <strong>{Math.round(detection.score * 100)}%</strong>
            </span>
          </div>
        );
      })}
    </div>
  );
}
