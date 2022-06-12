#!/usr/bin/env node
'use strict';

import { execa } from 'execa';
import got from 'got';
import { REPO }  from './constants.mjs';

export async function getLatestStrapiRelease() {
  const response = await got(`https://api.github.com/repos/${REPO}/releases/latest`).json();
  return response?.['tag_name']?.slice(1); // remove the v prefix
}

export function execDocker(args) {
  console.log(`docker ${args.join(' ')}`);
  return execa('docker', args, {
    stdio: 'inherit',
  });
}

export function getBuildXArgs(buildxPlatform) {
  const buildXCmd = !buildxPlatform ? [] : [ 'buildx' ];

  const buildXArgs = !buildxPlatform ? [] : [
    '--platform',
    buildxPlatform
  ]
  return { buildXCmd, buildXArgs }
}