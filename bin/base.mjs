#!/usr/bin/env node
'use strict';

import { execDocker } from './utils.mjs';
import { NODE_VERSIONS, BASE_IMAGE_NAME, LATEST_NODE_VERSION } from './constants.mjs';

export async function buildBaseImages({ shouldPush = false, nodeVersions = [...NODE_VERSIONS], imageBaseNameOverride = BASE_IMAGE_NAME } = {}) {
  const createdTags = [];
  for (const nodeVersion of nodeVersions) {
    const tags = await buildBaseImage({ nodeVersion, shouldPush, imageBaseNameOverride });
    const alpineTags = await buildBaseImage({
      nodeVersion,
      alpine: true,
      shouldPush,
      imageBaseNameOverride
    });

    createdTags.push(...tags, ...alpineTags);
  }

  return createdTags.map(tag => `${imageBaseNameOverride}:${tag}`);
}

async function buildBaseImage({ nodeVersion, alpine, shouldPush = false, imageBaseNameOverride = BASE_IMAGE_NAME }) {
  let tmpImg = `${imageBaseNameOverride}:tmp`;

  await execDocker([
    'build',
    '--build-arg',
    `NODE_VERSION=${nodeVersion}${alpine ? '-alpine' : ''}`,
    '-t',
    tmpImg,
    '--progress=plain',
    `./docker/base${alpine ? '/alpine' : ''}`,
  ]);

  const tags = buildBaseTags({ nodeVersion, alpine });

  for (const tag of tags) {
    await execDocker(['tag', tmpImg, `${imageBaseNameOverride}:${tag}`]);

    if (shouldPush) {
      await execDocker(['push', `${imageBaseNameOverride}:${tag}`]);
    }
  }

  await execDocker(['image', 'rm', tmpImg]);
  return tags;
}

function buildBaseTags({ nodeVersion, alpine = false }) {
  let tags = [];

  tags.push(`${nodeVersion}${alpine ? '-alpine' : ''}`);

  if (nodeVersion === LATEST_NODE_VERSION && !alpine) {
    tags.push('latest');
  } else if (nodeVersion === LATEST_NODE_VERSION && alpine) {
    tags.push('alpine');
  }

  return tags;
}
