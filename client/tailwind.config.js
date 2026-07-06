/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#09090B",
        primary: "#2563EB",
        accent: "#7C3AED",
        panel: "rgba(24, 24, 27, 0.72)"
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      boxShadow: {
        glow: "0 24px 80px rgba(37, 99, 235, 0.2)",
        violet: "0 18px 70px rgba(124, 58, 237, 0.24)"
      },
      backgroundImage: {
        mesh:
          "radial-gradient(circle at 10% 20%, rgba(37,99,235,.22), transparent 30%), radial-gradient(circle at 80% 0%, rgba(124,58,237,.22), transparent 28%), linear-gradient(135deg, #09090B 0%, #111827 45%, #18181B 100%)"
      }
    }
  },
  plugins: []
};
