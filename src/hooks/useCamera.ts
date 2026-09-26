import { useCallback, useEffect, useRef, useState } from 'react';

export type CameraStatus = 'idle' | 'requesting' | 'active' | 'denied' | 'unavailable' | 'error';

type FacingMode = 'environment' | 'user';

const idealVideo = { width: { ideal: 1280 }, height: { ideal: 720 } };

function stopMediaStream(stream: MediaStream | null) {
  stream?.getTracks().forEach((track) => track.stop());
}

function cameraError(error: unknown): Pick<CameraState, 'status' | 'message'> {
  if (error instanceof DOMException) {
    if (error.name === 'NotAllowedError' || error.name === 'SecurityError') {
      return {
        status: 'denied',
        message:
          'Kamerazugriff verweigert. Erlaube ihn in den Browser-Einstellungen und versuche es erneut.',
      };
    }
    if (error.name === 'NotFoundError' || error.name === 'OverconstrainedError') {
      return {
        status: 'unavailable',
        message: 'Auf diesem Gerät wurde keine nutzbare Kamera gefunden.',
      };
    }
    if (error.name === 'NotReadableError' || error.name === 'AbortError') {
      return {
        status: 'error',
        message: 'Die Kamera wird bereits verwendet oder konnte nicht gestartet werden.',
      };
    }
  }
  return {
    status: 'error',
    message: 'Die Kamera konnte nicht gestartet werden. Bitte versuche es erneut.',
  };
}

type CameraState = {
  status: CameraStatus;
  message: string;
};

const initialState: CameraState = {
  status: 'idle',
  message: 'Tippe auf „Kamera starten“, wenn du bereit bist.',
};

export function useCamera() {
  const [state, setState] = useState<CameraState>(initialState);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [facingMode, setFacingMode] = useState<FacingMode>('environment');
  const streamRef = useRef<MediaStream | null>(null);
  const requestRef = useRef(0);
  const selectedDeviceRef = useRef<string | undefined>(undefined);

  const refreshDevices = useCallback(async () => {
    if (!navigator.mediaDevices?.enumerateDevices) return [];
    const cameras = (await navigator.mediaDevices.enumerateDevices()).filter(
      (device) => device.kind === 'videoinput',
    );
    setDevices(cameras);
    return cameras;
  }, []);

  const stop = useCallback((message = initialState.message) => {
    requestRef.current += 1;
    stopMediaStream(streamRef.current);
    streamRef.current = null;
    setStream(null);
    setState({ status: 'idle', message });
  }, []);

  const start = useCallback(
    async (options?: { facingMode?: FacingMode; deviceId?: string }) => {
      const requestId = ++requestRef.current;
      stopMediaStream(streamRef.current);
      streamRef.current = null;
      setStream(null);

      if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
        setState({
          status: 'unavailable',
          message: 'Kamerazugriff benötigt HTTPS oder localhost und einen modernen Browser.',
        });
        return;
      }

      setState({ status: 'requesting', message: 'Kamera wird gestartet …' });
      const nextFacing = options?.facingMode ?? facingMode;
      const isMobile = window.matchMedia?.('(pointer: coarse)').matches ?? false;
      const selectedDevice = options?.deviceId ?? selectedDeviceRef.current;
      const sourceConstraint =
        !isMobile && selectedDevice
          ? { deviceId: { exact: selectedDevice } }
          : { facingMode: { ideal: nextFacing } };

      try {
        const nextStream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: { ...idealVideo, ...sourceConstraint },
        });
        if (requestId !== requestRef.current) {
          stopMediaStream(nextStream);
          return;
        }
        streamRef.current = nextStream;
        setStream(nextStream);
        setFacingMode(nextFacing);
        selectedDeviceRef.current = nextStream.getVideoTracks()[0]?.getSettings().deviceId;
        setState({ status: 'active', message: 'Kamera ist aktiv.' });
        await refreshDevices();
      } catch (error) {
        if (requestId === requestRef.current) setState(cameraError(error));
      }
    },
    [facingMode, refreshDevices],
  );

  const switchCamera = useCallback(async () => {
    const isMobile = window.matchMedia?.('(pointer: coarse)').matches ?? false;
    if (isMobile) {
      const nextFacing = facingMode === 'environment' ? 'user' : 'environment';
      await start({ facingMode: nextFacing });
      return;
    }
    const currentIndex = devices.findIndex(
      (device) => device.deviceId === selectedDeviceRef.current,
    );
    const nextDevice = devices[(currentIndex + 1) % devices.length];
    if (nextDevice) await start({ deviceId: nextDevice.deviceId });
  }, [devices, facingMode, start]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden' && streamRef.current) {
        stop('Kamera pausiert, weil die App nicht sichtbar ist.');
      }
    };
    const handlePageHide = () => stopMediaStream(streamRef.current);
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('pagehide', handlePageHide);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('pagehide', handlePageHide);
      requestRef.current += 1;
      stopMediaStream(streamRef.current);
    };
  }, [stop]);

  return {
    ...state,
    stream,
    devices,
    facingMode,
    start,
    stop,
    switchCamera,
    canSwitch: state.status === 'active' && (devices.length > 1 || devices.length === 0),
  };
}
