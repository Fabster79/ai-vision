import type { BoundingBox } from '../features/vision/detection-types';

export type Size = {
  width: number;
  height: number;
};

/**
 * Projects source-image coordinates into an object-fit: cover viewport.
 * Values deliberately remain outside the viewport when the source is cropped;
 * the stage clips them in exactly the same way as the video element.
 */
export function projectCoverBox(
  box: BoundingBox,
  source: Size,
  viewport: Size,
  mirrored = false,
): BoundingBox | null {
  if (source.width <= 0 || source.height <= 0 || viewport.width <= 0 || viewport.height <= 0) {
    return null;
  }

  const scale = Math.max(viewport.width / source.width, viewport.height / source.height);
  const renderedWidth = source.width * scale;
  const renderedHeight = source.height * scale;
  const offsetX = (viewport.width - renderedWidth) / 2;
  const offsetY = (viewport.height - renderedHeight) / 2;
  const sourceX = mirrored ? source.width - box.x - box.width : box.x;

  return {
    x: offsetX + sourceX * scale,
    y: offsetY + box.y * scale,
    width: box.width * scale,
    height: box.height * scale,
  };
}
