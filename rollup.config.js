import { basename, join } from 'path';
import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import styles from "rollup-plugin-styles";
import copyBundleFiles from './build/rollup-plugin-copy-bundles';
import pkg from './package.json';

export default function (args) {

  let targetFileName = pkg.main;

  const plugins = [
    resolve(),
    copyBundleFiles('docs'),
    styles(),
  ];

  const target = args.target ? args.target.toUpperCase() : null;
  const allowedTargets = ["ES3", "ES5", "ES6"];
  if (allowedTargets.some(t => t == target)) {
    plugins.push(typescript({ target: target }));
    targetFileName = targetFileName.replace(".js", `.${target.toLowerCase()}.js`);
  }
  else {
    plugins.push(typescript({ project: 'tsconfig.json' }));
  }

  let sourcemapPathTransform = undefined;

  if (process.env.RELEASE) {
    plugins.push(
      terser({
        compress: {}
      })
    );

    let repoRoot = pkg.repository.url
      .replace("https://github.com", "https://raw.githubusercontent.com")
      .replace(/.git$/, "");
    repoRoot += "/";

    sourcemapPathTransform = file => repoRoot + "v" + pkg.version + file.substr(2);
  }

  return {
    external: ['window'],
    input: 'src/index.ts',
    output: {
      globals: {},
      file: targetFileName,
      format: 'iife',
      sourcemap: true,
      sourcemapExcludeSources: true,
      sourcemapPathTransform: sourcemapPathTransform,
      name: process.env.npm_package_exportVar
    },
    plugins: plugins,
  }
};