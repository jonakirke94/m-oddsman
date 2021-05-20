const colors = require('tailwindcss/colors')

module.exports = {
  
  purge: {
	enabled: true,
	content: [
		'./views/**',
	],
  },
  darkMode: false, // or 'media' or 'class'
  theme: {
    colors: {
		gray: colors.coolGray,
		black: colors.black,
		white: colors.white,
		green: colors.emerald,
		blue: colors.blue,
		red: colors.rose,
	}
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
