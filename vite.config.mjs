import { defineConfig } from 'vite';
import react from "@vitejs/plugin-react";


export default defineConfig({
  // Specify your entry file
  cssCodeSplit: false,
  imageAssets: true,
  build: {
    // Set the output directory to "/static/js"
    outDir: './static/',
    // Name the output file "index-bundle.js"
    rollupOptions: {
      input: {
        main: './assets/index.jsx',
        base: './assets/base.js',
      },
      output: {
        chunkFileNames: 'js/[name].js',
        entryFileNames: 'js/[name].js',
        
        assetFileNames: ({name}) => {
          if (/\.(gif|jpe?g|png|svg|webp)$/.test(name ?? '')){
            return 'images/[name]-[hash][extname]';
          }
          
          if (/\.css$/.test(name ?? '')) {
            return 'css/styles[extname]';   
          }
 
          // default value
          // ref: https://rollupjs.org/guide/en/#outputassetfilenames
          return '[name]-img[extname]';
        },
      },
      plugins: [
        react()
      ],
    },
  },  
});