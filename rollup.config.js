/*
 * inspired from https://devhints.io/rollup
 * https://github.com/rollup/rollup-starter-lib/blob/master/package.json
 * */
import babel from 'rollup-plugin-babel'
import resolve from 'rollup-plugin-node-resolve'
import cjs from 'rollup-plugin-commonjs'
import node from 'rollup-plugin-node-resolve'
import { terser } from 'rollup-plugin-terser'
import pkg from './package.json'

const production = !process.env.ROLLUP_WATCH
const externals = Object.keys(pkg.dependencies).concat(['./src/data.js'])
const version = process.env.VERSION || pkg.version
const banner = `/*!
* jquery.cascader v${version}
* (c) ${new Date().getFullYear()} Chan Wu
* @issue https://github.com/vuchan/jquery-cascader/issues/new
* @license MIT
*/`

const config = {
  plugins: [
    node(),
    cjs(),
    resolve({
      // Use the `package.json` "browser" field
      browser: true,
      // pass custom options to the resolve plugin
      customResolveOptions: {
        moduleDirectory: 'node_modules'
      }
    }),
    babel({
      sourceMap: !production,
      exclude: 'node_modules/**' // only transpile our source code
    }) // minify, but only in production
  ].filter(Boolean),
  // indicate which modules should be treated as externals
  external: externals
}
const globals = {
  jquery: '$'
}

const configs = [
  {
    // browser-friendly UMD build
    input: 'src/index.js',
    output: {
      name: 'Cascader',
      file: production ? pkg['browser-min'] : pkg.browser,
      format: 'umd',
      banner,
      globals
    },
    ...config
  },
  {
    // webpack/ES module scripts -friendly esm build
    input: 'src/index.js',
    output: {
      file: pkg.module,
      format: 'es',
      banner,
      globals
    },
    ...config
  }
]

configs.forEach(config => {
  if (/\.min/.test(config.output.file)) {
    config.plugins.push(terser())
  }
})

export default configs