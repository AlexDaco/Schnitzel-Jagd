import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'Schnitzel-Jagd',
  webDir: 'www',
  server: {
    url: 'http://10.10.16.180:8100',
    cleartext: true,
  },
};

export default config;


