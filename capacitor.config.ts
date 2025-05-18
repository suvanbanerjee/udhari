import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.suvanbanerjee.udhari',
  appName: 'Udhari',
  webDir: 'out',
  plugins: {
    SplashScreen: {
      launchShowDuration: 0
    }
  }
};

export default config;
