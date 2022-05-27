#!/usr/bin/env node
'use strict';

import semver from 'semver';

import { execDocker, getLatestStrapiRelease } from './utils.mjs';
import { STRAPI_IMAGE_NAME, NODE_VERSIONS, LATEST_NODE_VERSION } from './constants.mjs';

export async function buildStrapiImages({ version, shouldPush = false, nodeVersions = [...NODE_VERSIONS] } = {}) {
  if (version === 'latest' || !version) {
    version = await getLatestStrapiRelease();
  }

  if (semver.valid(version) === null) {
    throw new Error('Invalid strapi version provided: ' + version);
  }

  const createdTags = [];

  for (const nodeVersion of nodeVersions) {
    const tags = await buildStrapiImage({ nodeVersion, version, shouldPush });
    const alpineTags = await buildStrapiImage({
      nodeVersion,
      version,
      alpine: true,
      shouldPush,
    });

    createdTags.push(...tags, ...alpineTags);
  }

  return createdTags.map(tag => `${STRAPI_IMAGE_NAME}:${tag}`);
}

async function buildStrapiImage({ nodeVersion, version, alpine = false, shouldPush = false }) {
  let tmpImg = `${STRAPI_IMAGE_NAME}:tmp`;

  // We can't just pass in a STRAPI_VERSION like in the official strapi launcher, as it doesn't support version 4 and
  // parsing semvers in a Dockerfile is just a pain...
  // If version 4 pass in @strapi/strapi@{version} as the STRAPI_PKG and if version 3 pass in strapi@{version}
  const majorVersion = version.split('.')[0]
  const strapiPackage = majorVersion < 4 ? `strapi@${version}` : `@strapi/strapi@${version}`;
  await execDocker([
    'build',
    '--build-arg',
    `BASE_VERSION=${nodeVersion}${alpine ? '-alpine' : ''}`,
    '--build-arg',
    `STRAPI_PKG=${strapiPackage}`,
    '-t',
    tmpImg,
    '--progress=plain',
    './docker',
  ]);

  const tags = buildStrapiTags({ version, nodeVersion, alpine });

  for (let tag of tags) {
    await execDocker(['tag', tmpImg, `${STRAPI_IMAGE_NAME}:${tag}`]);

    if (shouldPush) {
      await execDocker(['push', `${STRAPI_IMAGE_NAME}:${tag}`]);
    }
  }

  await execDocker(['image', 'rm', tmpImg]);

  return tags;
}

// The official version builds major, minor, semver, patch and pre by default, we DON'T do that unless buildAll is true
// TODO: buildAll is ALWAYS false, we don't use it right now, pass it in as a CLI option in a future version
function buildStrapiTags({ version: strapiVersion, nodeVersion, alpine = false, buildAll = false }) {
  let tags = [];
  let versions = [strapiVersion];

  const major = semver.major(strapiVersion);
  const minor = semver.minor(strapiVersion);
  const patch = semver.patch(strapiVersion);
  const pre = semver.prerelease(strapiVersion);

  if (!pre && buildAll) {
    versions = [major, `${major}.${minor}`, `${major}.${minor}.${patch}`];
  }

  for (const version of versions) {
    tags.push(`${version}-node${nodeVersion}${alpine ? '-alpine' : ''}`);

    if (nodeVersion === LATEST_NODE_VERSION) {
      tags.push(`${version}${alpine ? '-alpine' : ''}`);
    }
  }

  if (nodeVersion === LATEST_NODE_VERSION && !alpine) {
    tags.push('latest');
  }

  if (nodeVersion === LATEST_NODE_VERSION && alpine) {
    tags.push('alpine');
  }

  return tags;
}
