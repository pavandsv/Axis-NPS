/** Tokens read off the deployed build: Axis magenta, Apple-family greys, and
 *  the promoter / passive / detractor semantics the NPS model depends on. */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: '#97144D', dark: '#6B0E36', tint: '#FDE8EF' },
        ink: { DEFAULT: '#1D1D1F', soft: '#3C3C43', muted: '#6E6E73', faint: '#8E8E93' },
        surface: { DEFAULT: '#FFFFFF', page: '#F2F2F7', alt: '#F9F9FB', line: '#E5E5EA' },
        promoter: '#10B981',
        passive: '#F59E0B',
        detractor: '#EF4444',
      },
      fontFamily: { sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'] },
      borderRadius: { xl: '12px', '2xl': '16px', '3xl': '20px' },
    },
  },
  plugins: [],
}
