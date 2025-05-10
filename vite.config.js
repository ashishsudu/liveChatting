// tailwind.config.js
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: '#0e0e10',
        neonBlue: '#00FFFF',
        neonPink: '#FF00FF',
        neonPurple: '#8A2BE2',
      },
      boxShadow: {
        neon: '0 0 15px rgba(0,255,255,0.7), 0 0 30px rgba(255,0,255,0.5)',
      },
    },
  },
  plugins: [],
}
