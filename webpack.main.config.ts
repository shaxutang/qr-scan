import { resolve } from 'path'
import type { Configuration } from 'webpack'
import { plugins } from './webpack.plugins'
import { rules } from './webpack.rules'

export const mainConfig: Configuration = {
  target: 'electron-renderer', // 适用于渲染进程
  /**
   * This is the main entry point for your application, it's the first file
   * that runs in the main process.
   */
  entry: './src/index.ts',
  // Put your normal webpack config below here
  module: {
    rules,
  },
  plugins,
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css', '.json'],
  },
}
