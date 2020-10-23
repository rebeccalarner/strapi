'use strict';

const _ = require('lodash');
const { TTL } = require('./constants');


const getLockKey = (model, entryId, kind) => kind === 'singleType' ? `edit:${model}` : `edit:${model}:${entryId}`;

const acceptedMetadataAttributes = [
  'lastActivityDate',
  'lastUpdatedAt',
];

const setLock = async ({ model, entry, metadata = {}, user }, { force = false } = {}) => {
  const lockService = strapi.lockService({ prefix: 'content-manager' });
  const { kind } = strapi.getModel(model);

  const key = getLockKey(model, entry.id, kind);
  const fullMetadata = {
    ..._.pick(metadata, acceptedMetadataAttributes),
    lockedBy: {
      id: user.id,
      firstname: user.firstname,
      lastname: user.lastname,
      username: user.username,
    },
  };

  const lockResult = await lockService.set({ key, metadata: fullMetadata, ttl: TTL }, { force });
  return {
    success: lockResult.success,
    lock: lockResult.lock,
  };
};

module.exports = {
  setLock,
}
