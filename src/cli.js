#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const baseConfig = require('../webpack.config'); // Adjust path as necessary

const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

const copyRecursiveSync = (src, dest) => {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();

  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach(function(childItemName) {
      const srcPath = path.join(src, childItemName);
      const destPath = path.join(dest, childItemName);
      if (!fs.existsSync(destPath)) {
        copyRecursiveSync(srcPath, destPath);
      } else {
        console.log(`${destPath} already exists`);
      }
    });
  } else {
    if (!fs.existsSync(dest)) {
      fs.copyFileSync(src, dest);
    } else {
      console.log(`${dest} already exists`);
    }
  }
}

const init = () => {
  // Define the source (init folder) and destination (new project directory)
  const initDir = path.join(__dirname, 'init'); // Adjust this path as necessary
  const projectDir = path.join(process.cwd());
  
  // Copy everything from the init directory to the project directory
  copyRecursiveSync(initDir, projectDir);
  console.log('Files successfuly initialized');

  build();
}

const handleError = (err, stats) => {
  if (err) {
    console.error('An error occurred:', err);
    return;
  }
  console.log(stats.toString({
    colors: true,
    modules: false,
    children: false,
  }));
  console.log('Rebuild complete.');
}

const build = (watch = false) => {
  const componentsPath = path.join(process.cwd(), 'components');

  // Specify the output bundle
  baseConfig.entry = path.join(__dirname, 'index.js');
  baseConfig.output.path = path.resolve(process.cwd(), 'dist');
  baseConfig.resolve.alias = {
    'user-components': componentsPath
  };

  if (watch) {
    const watchConfig = {
      ...baseConfig,
      watch: true, // Enable watch mode
      watchOptions: {
        ignored: /node_modules/,  // You can specify paths to ignore here
        aggregateTimeout: 100,    // Delay rebuild after the first change (in ms)
        poll: 250                // Check for changes every quarter second
      }
    };

    const compiler = webpack(watchConfig);
    compiler.watch(watchConfig.watchOptions, handleError);
  } else {
    webpack(baseConfig, handleError);
  };
  console.log('Build complete. Bundle.js is ready in the /dist folder.');
};

yargs(hideBin(process.argv))
  .scriptName("mp-widget-builder")
  .usage('$0 <cmd> [args]')
  .command('init', 'Initialize a new widget project', init)
  .command('build', 'Build your widget project', build)
  .command('watch', 'Watch for changes and rebuild', ()=>build(true))
  .help()
  .argv;