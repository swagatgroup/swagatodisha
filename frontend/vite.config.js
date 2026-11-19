import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// Image/asset names are shared by the browser build and the prerender (SSR) build,
// so prerendered HTML points at the same files
const assetFileNames = (assetInfo) => {
  const info = assetInfo.name.split('.');
  const ext = info[info.length - 1];
  if (ext === 'jsx') {
    // Force JSX files to have .js extension
    return `js/[name]-[hash].js`;
  }
  if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
    // Keep images at root level for easier referencing
    return `[name][extname]`;
  }
  if (/css/i.test(ext)) {
    return `[name]-[hash][extname]`;
  }
  return `assets/[name]-[hash][extname]`;
};

// https://vite.dev/config/
// `isSsrBuild` is the build-time prerender (scripts/prerender.mjs): no chunk splitting or minifying there
export default defineConfig(({ isSsrBuild }) => ({
  plugins: [react()],

  // Base path for production builds
  base: '/',

  // Build optimization
  build: {
    // Enable source maps for debugging (disable in production for smaller bundle)
    sourcemap: false,

    // Optimize chunk size
    rollupOptions: {
      output: isSsrBuild ? { assetFileNames } : {
        // Manual chunk splitting for better caching
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom'],
          'framer-motion': ['framer-motion'],
          'react-icons': ['react-icons'],
          'sweetalert': ['sweetalert2'],

          // Separate utilities
          'utils': [
            './src/utils/constants.js'
          ]
        },

        // Optimize chunk naming - Force .js extension for all JS files
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop().replace('.jsx', '').replace('.js', '') : 'chunk';
          return `js/${facadeModuleId}-[hash].js`;
        },
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames
      }
    },

    // Optimize bundle size
    minify: isSsrBuild ? false : 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn']
      }
    },

    // Target modern browsers for smaller bundles
    target: 'es2015',

    // Chunk size warning limit
    chunkSizeWarningLimit: 1000,

    // Ensure assets are copied correctly
    assetsInlineLimit: 0
  },

  // Development server optimization
  server: {
    // Enable HMR
    hmr: {
      port: 3001,
      host: 'localhost'
    },

    // Optimize for development
    host: '127.0.0.1',
    port: 3001,
    cors: true,
    strictPort: true,

    // Add proxy for API calls to avoid CORS issues
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        ws: true
      },
      // Live chat connection in development
      '/socket.io': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        ws: true
      }
    }
  },

  // Resolve aliases for cleaner imports
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@assets': resolve(__dirname, 'src/assets'),
      '@images': resolve(__dirname, 'src/assets/images')
    }
  },

  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'framer-motion',
      'react-icons/fa',
      'react-icons/fa6',
      'react-icons/si',
      'sweetalert2',
      '@emailjs/browser',
      'web-vitals'
    ],
    exclude: ['@emailjs/browser'] // Exclude from pre-bundling as it's used conditionally
  },

  // Define global constants
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
    __PROD__: JSON.stringify(process.env.NODE_ENV === 'production')
  }
}))
