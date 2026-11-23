import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.kinetic.app",
  appName: "Kinetic",
  webDir: "dist",
  server: {
    androidScheme: "https",
    cleartext: false,
  },
  plugins: {
    CapacitorUpdater: {
      autoUpdate: false,
      statsUrl: "",
      appReadyTimeout: 1000,
      autoSplashscreen: false,
    },
    StatusBar: {
      overlaysWebView: true,
      style: "DARK",
      backgroundColor: "#00000000",
    },
    Keyboard: {
      resize: "body",
      style: "DARK",
    },
  },
};

export default config;
