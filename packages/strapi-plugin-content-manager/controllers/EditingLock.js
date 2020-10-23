'use strict'

const _ = require('lodash');
const { ACTIONS } = require('../services/constants');

const sanitizeLock = (lock) => {
  if (_.isNil(lock)) {
    return null;
  }
  return _.omit(lock, ['key', 'id']);
}

const lock = async (ctx) => {
  const {
    state: { userAbility, user },
    params: { id, model },
    request: { body },
  } = ctx;
  const metadata = _.get(body, 'metadata', {});
  const force = _.get(body, 'force', false) === true;
  // faire validation avec yup

  const contentManagerService = strapi.plugins['content-manager'].services.contentmanager;
  const foundEntry =  await contentManagerService.findEntityAndCheckPermissions(
    userAbility,
    ACTIONS.edit,
    model,
    id,
  );

  const editingLockService = strapi.plugins['content-manager'].services.editinglock;
  const lockResult = await editingLockService.setLock(
    { model, entry: foundEntry, metadata, user },
    { force }
  );

  return {
    success: lockResult.success,
    lockInfo: sanitizeLock(lockResult.lock),
  }
};

module.exports = {
  lock,
};
