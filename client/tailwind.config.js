/** @type {import('tailwindcss').Config} */
import daisyui from "daisyui"
import withMT from "@material-tailwind/react/utils/withMT";


export default withMT({
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",    
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
     fontFamily : {
      sans: ["Roboto", "sans-serif"],
      serif: ["Roboto Slab", "serif"],
      body: ["Roboto", "sans-serif"],
    }
  },
  plugins: [
    daisyui,
  ],
  daisyui: {
    themes: ["light", "dark", "cupcake","nord","fantasy"],
  },

})