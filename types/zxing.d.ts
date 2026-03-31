declare module '@zxing/library' {
  export class BrowserMultiFormatReader {
    constructor(...args: any[]);
    listVideoInputDevices(): Promise<MediaDeviceInfo[]>;
    decodeFromVideoDevice(
      deviceId: string | undefined,
      previewElem: HTMLVideoElement | string | undefined,
      callbackFn: (result: any, error?: Error) => void
    ): void;
    reset(): void;
  }

  export class NotFoundException extends Error {
    constructor(...args: any[]);
  }
}
