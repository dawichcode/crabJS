import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'speedJS/index.ts',
  output: [
    {
      file: 'speedJS/dist/speedjs.min.js',
      format: 'es',
      name: 'SpeedJS',
      plugins: [terser()]
    },
    {
      file: 'speedJS/dist/speedjs.js',
      format: 'es',
      name: 'SpeedJS'
    }
  ],
  plugins: [
    typescript({
      tsconfig: './tsconfig.json',
      declaration: true
    })
  ]
}; 