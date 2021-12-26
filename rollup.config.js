import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import styles from "rollup-plugin-styles";
import copyBundleFiles from './build/rollup-plugin-copy-bundles';
import pkg from './package.json';

let targetFileName = pkg.main.replace(".es.js", ".js");

const plugins = [
  resolve(),
  styles(),
];

plugins.push(typescript({ project: 'tsconfig.json' }));

let sourcemapPathTransform = undefined;

if (process.env.RELEASE) {
  plugins.push(
    terser({
      compress: {}
    })
  );

  targetFileName = targetFileName.replace(".js", ".min.js");

  let repoRoot = pkg.repository.url
    .replace("https://github.com", "https://raw.githubusercontent.com")
    .replace(/.git$/, "");
  repoRoot += "/";

  sourcemapPathTransform = file => repoRoot + "v" + pkg.version + file.substr(2);
}
else {
  plugins.push(copyBundleFiles('docs'));
}

const bundles = [
  {
    external: ['window'],
    input: 'src/index.ts',
    output: {
      globals: {},
      file: targetFileName,
      name: pkg.exportVar,
      format: 'iife',
      sourcemap: true,
      sourcemapExcludeSources: true,
      sourcemapPathTransform: sourcemapPathTransform,
    },
    plugins: plugins,
  }
]

if (process.env.RELEASE) {
  bundles.push({
    external: ['window'],
    input: 'src/index.ts',
    output: {
      globals: {},
      file: pkg.main,
      format: 'es',
      sourcemap: true,
      sourcemapExcludeSources: true,
      sourcemapPathTransform: sourcemapPathTransform,
      name: process.env.npm_package_exportVar
    },
    plugins: plugins,
  })
}

export default bundles;