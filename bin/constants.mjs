#!/usr/bin/env node
'use strict';

export const ORG = process.env.ORG || 'strapi';
export const REPO = 'strapi/strapi';
export const BASE_IMAGE_NAME = `${ORG}/base`;
export const STRAPI_IMAGE_NAME = `${ORG}/strapi`;
export const NODE_VERSIONS = ['10', '12', '14', '16'];
export const LATEST_NODE_VERSION = '16';
