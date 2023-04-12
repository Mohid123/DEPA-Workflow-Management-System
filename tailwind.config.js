/** @type {import('tailwindcss').Config} */
const primaryColors = {
  light: '#93C5FD',
  DEFAULT: '#0081E9',
  dark: '#0081E9',
};

const extendedSize = {
  unset: 'unset',
  4.5: '1.125rem',
  11: '2.75rem',
  14: '3.5rem',
  15: '3.75rem',
  16: '4rem',
  18: '4.5rem',
  22: '5.5rem',
  26: '6.375rem',
  29: '7.25rem',
  32.5: '8.12rem',
  36: '9rem',
  40: '10rem',
  43: '10.75rem',
  44: '11rem',
  48: '12rem',
  50: '12.5rem',
  54: '13.5rem',
  60: '15rem',
  64: '16rem',
  65: '16.5rem',
  68: '17rem',
  70: '17.5rem',
  72: '18rem',
  80: '20rem',
  84: '21rem',
  88: '22rem',
  100: '25rem',
  102: '28.25rem',
  104: '27.688rem',
  116: '29rem',
  104: '28.75rem',
  108: '27.82rem',
  124: '31rem',
  128: '32rem',
  132: '33rem',
  135: '33.75rem',
  136: '34rem',
  140: '35.2rem',
  150: '37.5rem',
  160: '41.25rem',
  180: '45rem',
  190: '47.75rem',
  204: '51rem',
  216: '54rem',
  240: '60rem',


  '10/3':'30%',
  '38p': '38%',
};

module.exports = {
  important: true,
  prefix: '',
  content: {
    enabled: process.env.TAILWIND_MODE === 'build',
    content: ['./src/**/*.{html,ts}', './projects/**/*.{html,ts}'],
  },
  darkMode: 'class',
  theme: {
    extend: {
      screens: {
        'xs': '500px',
        '1.5sm': '760px',
        'xl': '1280px',
        '1.5xl': '1440px',
        '1.7xl': '1536px',
        '2xl': '1600px',
        '3xl': '1920px',
      },
      colors: {
        'primary-light': '#E2F1FC',
        'primary-50': '#C4E3FC',
        'primary-100': '#93C5FD',
        'primary-400': '#0081E9',
        'primary-500': '#0081E9',
        'custom-black' : {
          '100': '#4e5970b3',
          '600': '#4E5970',
          '900': '#191919',
        },
        'font-gray' : {
          '600': '#9399B2',
          '800': '#787F9F',
        }
      },
      margin: {
        '20.5': '5.313rem',
        '30': '7.375rem'
      },
      width: extendedSize,
      maxWidth: extendedSize,
      minWidth: extendedSize,
      height: extendedSize,
      maxHeight: extendedSize,
      minHeight: extendedSize,
      padding: {
        4.5: '1.125rem',
        15: '9.625rem',
        25: '6.25rem'
      },
      fontSize: {
        'xxs': '0.625rem',
        'xs2': '0.688rem',
        'sm2': '0.938rem',
        'xxl': '1.375rem',
        '4.5xl': '2.5rem',
        '45px': '45px',
        '2xxl': '1.625rem',
        '3lg': '1.75rem',
      },
      flexGrow: {
        '2': 2,
        '3': 3,
        '4': 4,
        '5': 5,
        '6': 6,
        '7': 7,
        '8': 8,
        '9': 9,
        '10': 10,
      }
    },
    fontFamily: {
      display: ['roboto', 'sans-serif'],
      body: ['roboto', 'sans-serif'],
    },
    container: {
      center: true,
      padding: '1.5rem',
    },
    extends: {
      color: {
        inherit: 'inherit',
        transparent: 'transparent',
        current: 'currentColor',
      },
    },
    linearBorderGradients: {
      directions: {
        // defaults to these values
        dp: '109deg',
        t: 'to top',
        tr: 'to top right',
        r: 'to right',
        br: 'to bottom right',
        b: 'to bottom',
        bl: 'to bottom left',
        l: 'to left',
        tl: 'to top left',
      },
      colors: {
        p: ['#59C8D1 0%', '#75F16D 100%'],
      },
      background: {
        'bg': primaryColors.DEFAULT,
        'bg-light': primaryColors.light,
        'bg-dark': primaryColors.dark,
      },
      border: {
        // defaults to these values (optional)
        1: '1px',
        2: '2px',
        4: '4px',
      },
    },
  },
  variants: {
    linearBorderGradients: ['responsive', 'hover', 'dark'], // defaults to ['responsive']
    extend: {
      display: ["group-hover"],
  }
  },
  plugins: [],
};
