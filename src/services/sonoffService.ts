/**
 * Sonoff NSPanel Pro integration service
 * Controls indoor court lights via REST API
 */

const SONOFF_BASE_URL = process.env.SONOFF_BASE_URL;
const SONOFF_TOKEN = process.env.SONOFF_TOKEN;

export interface LightStatus {
  courtId: string;
  courtName: string;
  isOn: boolean;
  lastUpdated: Date;
}

class SonoffService {
  private mockMode = !SONOFF_BASE_URL || !SONOFF_TOKEN;

  async toggleLight(courtId: string): Promise<{ success: boolean; isOn: boolean; message?: string }> {
    if (this.mockMode) {
      // Mock implementation for development
      console.log(`Mock: Toggling light for court ${courtId}`);
      const isOn = Math.random() > 0.5; // Random state for demo
      return {
        success: true,
        isOn,
        message: 'Ovládání není nakonfigurováno (demo režim)'
      };
    }

    try {
      const response = await fetch(`${SONOFF_BASE_URL}/api/lights/${courtId}/toggle`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SONOFF_TOKEN}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        isOn: data.isOn,
      };
    } catch (error) {
      console.error('Error toggling light:', error);
      return {
        success: false,
        isOn: false,
        message: 'Chyba při ovládání osvětlení'
      };
    }
  }

  async getLightStatus(courtId: string): Promise<LightStatus | null> {
    if (this.mockMode) {
      // Mock implementation
      return {
        courtId,
        courtName: courtId === 'hala-1' ? 'Hala 1' : 'Hala 2',
        isOn: Math.random() > 0.5,
        lastUpdated: new Date(),
      };
    }

    try {
      const response = await fetch(`${SONOFF_BASE_URL}/api/lights/${courtId}/status`, {
        headers: {
          'Authorization': `Bearer ${SONOFF_TOKEN}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        courtId,
        courtName: data.name,
        isOn: data.isOn,
        lastUpdated: new Date(),
      };
    } catch (error) {
      console.error('Error getting light status:', error);
      return null;
    }
  }

  async getAllLightsStatus(): Promise<LightStatus[]> {
    const indoorCourts = ['hala-1', 'hala-2'];
    const statuses = await Promise.all(
      indoorCourts.map(courtId => this.getLightStatus(courtId))
    );

    return statuses.filter(status => status !== null) as LightStatus[];
  }

  isConfigured(): boolean {
    return !this.mockMode;
  }

  getConfigurationMessage(): string {
    if (this.mockMode) {
      return 'Ovládání osvětlení není nakonfigurováno. Nastavte SONOFF_BASE_URL a SONOFF_TOKEN v prostředí.';
    }
    return 'Ovládání osvětlení je nakonfigurováno a připraveno k použití.';
  }
}

export const sonoffService = new SonoffService();