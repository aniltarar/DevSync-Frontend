import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
import "vuetify/styles";
import { aliases, mdi } from "vuetify/iconsets/mdi";
import "@mdi/font/css/materialdesignicons.css";

export default createVuetify({
  components,
  directives,
  icons: {
    defaultSet: "mdi",
    aliases,
    sets: { mdi },
  },
  theme: {
    defaultTheme: "dark",
    themes: {
      light: {
        dark: false,
        colors: {
          primary: "#6C63FF",
          secondary: "#10B981",
          accent: "#43C6AC",
          background: "#F5F5F5",
          backgroundOverlay: "#E0E0E0",
          surface: "#FFFFFF",
          error: "#FF5252",
          warning: "#FFC107",
          info: "#2196F3",
          success: "#4CAF50",
        },
        variables: {
          "auth-panel-bg": "linear-gradient(135deg, #6C63FF 0%, #10B981 100%)",
        },
      },
      dark: {
        dark: true,
        colors: {
          primary: "#7C73FF",
          secondary: "#10B981",
          accent: "#43C6AC",
          background: "#121212",
          backgroundOverlay: "#1E1E1E",
          surface: "#1E1E1E",
          error: "#FF5252",
          warning: "#FFC107",
          info: "#2196F3",
          success: "#4CAF50",
        },
        variables: {
          "auth-panel-bg": "linear-gradient(135deg, #7C73FF 0%, #10B981 100%)",
        }, 
      },
    },
  },
});
