#!/usr/bin/env node
'use strict';

import { Command } from 'commander';
import { buildBaseImages } from './base.mjs';
import { buildStrapiImages } from './strapi.mjs';
import { LATEST_NODE_VERSION } from './constants.mjs'

const program = new Command();

program
  .name('build')
  .description('CLI to build Strapi docker images')
  .version('0.0.1', '-i, --info', 'Output the current CLI version number')

program
  .option('-t, --type <type>', 'Which images to build (all, strapi, base)', 'all')
  .option('-p, --push', 'Push the image(s) after creating')
  .option('-v, --strapi-version <strapiVersion>', 'Strapi version to build', 'latest')
  .option('-n, --node-versions <nodeVersions...>', 'Node', [LATEST_NODE_VERSION])
  .action((options) => {
    run(options).catch(error => {
      console.error(error);
      process.exit(1);
    });
  })

program.parse();

async function run({ type, push, strapiVersion, nodeVersions }) {
  switch (type) {
    case 'base': {
      const images = await buildBaseImages({ shouldPush: push, nodeVersions });
      logImages(images);
      break;
    }
    case 'strapi': {
      const images = await buildStrapiImages({ version: strapiVersion, shouldPush: push, nodeVersions });
      logImages(images);
      break;
    }
    case 'all':
    default: {
      const baseImages = await buildBaseImages({ shouldPush: push, nodeVersions });
      const strapiImages = await buildStrapiImages({ version: strapiVersion, shouldPush: push, nodeVersions });
      logImages([...baseImages, ...strapiImages]);
      break;
    }
  }
}

function logImages(images) {
  console.log('---------------------------------------');
  console.log('Images created:');
  console.log(images.map(img => `- ${img}`).join('\n'));
  console.log('---------------------------------------');
}
