#!/usr/bin/env node
'use strict';

import { execDocker, getBuildXArgs } from './utils.mjs';
import { NODE_VERSIONS, BASE_IMAGE_NAME, LATEST_NODE_VERSION } from './constants.mjs';

export async function buildBaseImages({ shouldPush = false, nodeVersions = [...NODE_VERSIONS], buildxPlatform = false } = {}) {
  const createdTags = [];
  for (const nodeVersion of nodeVersions) {
    const tags = await buildBaseImage({ nodeVersion, shouldPush, buildxPlatform });
    const alpineTags = await buildBaseImage({
      nodeVersion,
      alpine: true,
      shouldPush,
      buildxPlatform
    });

    createdTags.push(...tags, ...alpineTags);
  }

  return createdTags.map(tag => `${BASE_IMAGE_NAME}:${tag}`);
}

async function buildBaseImage({ nodeVersion, alpine, shouldPush = false, buildxPlatform = false }) {
  let tmpImg = `${BASE_IMAGE_NAME}:tmp`;

  const { buildXCmd, buildXArgs } = getBuildXArgs(buildxPlatform);

  await execDocker([
    ...buildXCmd,
    'build',
    '--build-arg',
    `NODE_VERSION=${nodeVersion}${alpine ? '-alpine' : ''}`,
    ...buildXArgs,
    '-t',
    tmpImg,
    '--progress=plain',
    `./docker/base${alpine ? '/alpine' : ''}`,
  ]);

  const tags = buildBaseTags({ nodeVersion, alpine });

  for (const tag of tags) {
    await execDocker(['tag', tmpImg, `${BASE_IMAGE_NAME}:${tag}`]);

    if (shouldPush) {
      await execDocker(['push', `${BASE_IMAGE_NAME}:${tag}`]);
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
