import { projectCoverBox } from './geometry';

describe('projectCoverBox', () => {
  const box = { x: 320, y: 180, width: 640, height: 360 };

  it.each([
    ['16:9 without cropping', { width: 1920, height: 1080 }, { width: 960, height: 540 }],
    ['4:3 with horizontal cropping', { width: 1920, height: 1080 }, { width: 800, height: 600 }],
    [
      'smartphone portrait with horizontal cropping',
      { width: 1920, height: 1080 },
      { width: 360, height: 640 },
    ],
  ])('snapshots %s geometry', (_name, source, viewport) => {
    expect(projectCoverBox(box, source, viewport)).toMatchSnapshot();
  });

  it('mirrors the horizontal position for the front camera', () => {
    expect(
      projectCoverBox(
        { x: 100, y: 100, width: 200, height: 200 },
        { width: 1000, height: 500 },
        { width: 1000, height: 500 },
        true,
      ),
    ).toEqual({ x: 700, y: 100, width: 200, height: 200 });
  });

  it('does not project before dimensions are known', () => {
    expect(projectCoverBox(box, { width: 0, height: 0 }, { width: 360, height: 640 })).toBeNull();
  });
});
