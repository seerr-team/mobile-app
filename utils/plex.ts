import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import * as Crypto from 'expo-crypto';
import * as Device from 'expo-device';
import * as WebBrowser from 'expo-web-browser';
import { Dimensions } from 'react-native';

interface PlexHeaders extends Record<string, string> {
  Accept: string;
  'X-Plex-Product': string;
  'X-Plex-Version': string;
  'X-Plex-Client-Identifier': string;
  'X-Plex-Model': string;
  'X-Plex-Platform': string;
  'X-Plex-Platform-Version': string;
  'X-Plex-Device': string;
  'X-Plex-Device-Name': string;
  'X-Plex-Device-Screen-Resolution': string;
  'X-Plex-Language': string;
}

export interface PlexPin {
  id: number;
  code: string;
}

const uuidv4 = async (): Promise<string> => {
  const randomBytes = await Crypto.getRandomBytesAsync(16);
  return [...randomBytes]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, '$1-$2-$3-$4-$5');
};

class PlexOAuth {
  private plexHeaders?: PlexHeaders;
  private pin?: PlexPin;
  private authToken?: string;

  public async initializeHeaders(plexClientIdentifier?: string): Promise<void> {
    // Use the Seerr instance client identifier so the auth token matches the
    // one used by the server. Servers older than v3.2.0 don't expose it.
    let clientId =
      plexClientIdentifier || (await AsyncStorage.getItem('plex-client-id'));
    if (!clientId) {
      clientId = await uuidv4();
      await AsyncStorage.setItem('plex-client-id', clientId);
    }

    const { width, height } = Dimensions.get('window');

    this.plexHeaders = {
      Accept: 'application/json',
      'X-Plex-Product': 'Seerr',
      'X-Plex-Version': 'Plex OAuth',
      'X-Plex-Client-Identifier': clientId,
      'X-Plex-Model': 'Plex OAuth',
      'X-Plex-Platform': Device.osName || 'Unknown',
      'X-Plex-Platform-Version': Device.osVersion || 'Unknown',
      'X-Plex-Device': Device.brand || 'Unknown',
      'X-Plex-Device-Name': `${Device.deviceName || 'ReactNative'} (Seerr)`,
      'X-Plex-Device-Screen-Resolution': `${width}x${height}`,
      'X-Plex-Language': 'en',
    };
  }

  public async getPin(): Promise<PlexPin> {
    if (!this.plexHeaders) {
      throw new Error('You must initialize the plex headers before login.');
    }
    const response = await axios.post(
      'https://plex.tv/api/v2/pins?strong=true',
      undefined,
      { headers: this.plexHeaders }
    );

    this.pin = { id: response.data.id, code: response.data.code };
    return this.pin;
  }

  public async login(plexClientIdentifier?: string): Promise<string> {
    await this.initializeHeaders(plexClientIdentifier);
    await this.getPin();

    if (!this.plexHeaders || !this.pin) {
      throw new Error('Unable to login — headers or pin missing.');
    }

    const params = {
      clientID: this.plexHeaders['X-Plex-Client-Identifier'],
      'context[device][product]': this.plexHeaders['X-Plex-Product'],
      'context[device][version]': this.plexHeaders['X-Plex-Version'],
      'context[device][platform]': this.plexHeaders['X-Plex-Platform'],
      'context[device][platformVersion]':
        this.plexHeaders['X-Plex-Platform-Version'],
      'context[device][device]': this.plexHeaders['X-Plex-Device'],
      'context[device][deviceName]': this.plexHeaders['X-Plex-Device-Name'],
      'context[device][model]': this.plexHeaders['X-Plex-Model'],
      'context[device][screenResolution]':
        this.plexHeaders['X-Plex-Device-Screen-Resolution'],
      'context[device][layout]': 'mobile',
      code: this.pin.code,
    };

    const url = `https://app.plex.tv/auth/#!?${this.encodeData(params)}`;

    // Open Plex login in system browser
    await WebBrowser.openBrowserAsync(url);

    // Start polling
    return this.pinPoll();
  }

  private async pinPoll(): Promise<string> {
    // Bound polling by the PIN expiresAt with a 15m hard fallback.
    const deadline = Date.now() + 15 * 60 * 1000;
    return new Promise((resolve, reject) => {
      const poll = async () => {
        try {
          if (!this.pin) {
            return reject(new Error('Pin is not initialized.'));
          }
          const response = await axios.get(
            `https://plex.tv/api/v2/pins/${this.pin.id}`,
            { headers: this.plexHeaders }
          );

          if (response.data?.authToken) {
            this.authToken = response.data.authToken as string;
            resolve(this.authToken);
          } else {
            const expiresAt = response.data?.expiresAt
              ? Date.parse(response.data.expiresAt)
              : deadline;
            if (Date.now() >= Math.min(expiresAt, deadline)) {
              reject(new Error('Plex PIN expired before login completed.'));
              return;
            }
            setTimeout(poll, 1000);
          }
        } catch (e) {
          reject(e);
        }
      };
      poll();
    });
  }

  private encodeData(data: Record<string, string>): string {
    return Object.keys(data)
      .map((key) => [key, data[key]].map(encodeURIComponent).join('='))
      .join('&');
  }
}

export default PlexOAuth;
