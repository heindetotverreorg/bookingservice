import path from 'path'
import vue from '@vitejs/plugin-vue'

export default {
  plugins: [vue()],
  test: {
    environment: 'happy-dom',
    setupFiles: ['./test/setup.js'],
  },
  resolve: {
    alias: {
      '~~': path.resolve(
        __dirname,
        '.'
      ),
      '#app': path.resolve(
        __dirname,
        './node_modules/nuxt/'
      )
    }
  }
}
