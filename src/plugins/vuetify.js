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
    defaultTheme: localStorage.getItem("theme") || "dark",
    themes: {
      light: {
        dark: false,
        colors: {
          primary: "#4F46E5",        // Modern Indigo (Profesyonel ve güven veren)
          secondary: "#0EA5E9",      // Sky Blue (Yazılım dünyasında çok popüler)
          accent: "#8B5CF6",         // Soft Violet (Vurgular için ideal)
          background: "#F8FAFC",     // Kirli Beyaz (Gözü yormayan açık gri/mavi)
          backgroundOverlay: "#F1F5F9",
          surface: "#FFFFFF",        // Saf Beyaz (Kartlar için)
          reportPreview: "#FFF8EC",  // Soft Amber (Rapor önizleme arka planı)
          error: "#EF4444",
          warning: "#F59E0B",
          info: "#3B82F6",
          success: "#10B981",
        },
        variables: {
          "auth-panel-bg": "linear-gradient(135deg, #4F46E5 0%, #0EA5E9 100%)",
        },
      },
      dark: {
        dark: true,
        colors: {
          primary: "#818CF8",        // Daha yumuşak Indigo (Koyu modda parlamaz)
          secondary: "#38BDF8",      // Parlak Sky Blue (Okunabilirliği yüksek)
          accent: "#A78BFA",         // Lavanta (Kod editörü teması havası verir)
          background: "#0F172A",     // Deep Navy (Yazılımcıların en sevdiği arka plan rengi)
          backgroundOverlay: "#1E293B",
          surface: "#1E293B",        // Slate Blue (Kartlar ve yüzeyler için)
          reportPreview: "#111925",  // Dark Warm Amber (Rapor önizleme arka planı)
          error: "#F87171",
          warning: "#FBBF24",
          info: "#60A5FA",
          success: "#34D399",
        },
        variables: {
          "auth-panel-bg": "linear-gradient(135deg, #4F46E5 0%, #0EA5E9 100%)",
        },
      },
    },
  },
});
