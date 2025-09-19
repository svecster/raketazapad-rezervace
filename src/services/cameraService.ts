/**
 * Camera service for indoor court monitoring
 * Supports RTSP/HTTP streams and snapshots
 */

const CAM1_URL = process.env.CAM1_URL;
const CAM2_URL = process.env.CAM2_URL;

export interface CameraStream {
  id: string;
  name: string;
  streamUrl?: string;
  snapshotUrl?: string;
  isAvailable: boolean;
  lastUpdated: Date;
}

class CameraService {
  private mockMode = !CAM1_URL || !CAM2_URL;

  getStreams(): CameraStream[] {
    if (this.mockMode) {
      return [
        {
          id: 'cam1',
          name: 'Hala 1 - Kamera',
          isAvailable: false,
          lastUpdated: new Date(),
        },
        {
          id: 'cam2',
          name: 'Hala 2 - Kamera', 
          isAvailable: false,
          lastUpdated: new Date(),
        }
      ];
    }

    return [
      {
        id: 'cam1',
        name: 'Hala 1 - Kamera',
        streamUrl: CAM1_URL,
        snapshotUrl: CAM1_URL?.replace('/stream', '/snapshot'),
        isAvailable: true,
        lastUpdated: new Date(),
      },
      {
        id: 'cam2',
        name: 'Hala 2 - Kamera',
        streamUrl: CAM2_URL,
        snapshotUrl: CAM2_URL?.replace('/stream', '/snapshot'),
        isAvailable: true,
        lastUpdated: new Date(),
      }
    ];
  }

  async getSnapshot(cameraId: string): Promise<string | null> {
    const streams = this.getStreams();
    const camera = streams.find(stream => stream.id === cameraId);

    if (!camera || !camera.snapshotUrl) {
      return null;
    }

    try {
      const response = await fetch(camera.snapshotUrl);
      if (response.ok) {
        const blob = await response.blob();
        return URL.createObjectURL(blob);
      }
    } catch (error) {
      console.error(`Error getting snapshot for ${cameraId}:`, error);
    }

    return null;
  }

  isConfigured(): boolean {
    return !this.mockMode;
  }

  getConfigurationMessage(): string {
    if (this.mockMode) {
      return 'Kamery nejsou nakonfigurovány. Nastavte CAM1_URL a CAM2_URL v prostředí.';
    }
    return 'Kamery jsou nakonfigurovány a připraveny k použití.';
  }

  // Check if stream URL is embeddable (not blocked by CORS/X-Frame-Options)
  async isStreamEmbeddable(streamUrl: string): Promise<boolean> {
    try {
      const response = await fetch(streamUrl, { method: 'HEAD' });
      const xFrameOptions = response.headers.get('X-Frame-Options');
      
      // If X-Frame-Options is DENY or SAMEORIGIN, embedding might be blocked
      if (xFrameOptions && (xFrameOptions.toLowerCase() === 'deny' || xFrameOptions.toLowerCase() === 'sameorigin')) {
        return false;
      }
      
      return response.ok;
    } catch (error) {
      console.error('Error checking stream embeddability:', error);
      return false;
    }
  }
}

export const cameraService = new CameraService();