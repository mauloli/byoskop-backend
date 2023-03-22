// Application hooks that run for every service
// Don't remove this comment. It's needed to format import lines nicely.
import {
  log,
  checkRefreshToken
} from './hooks';

export default {
  before: {
    all: [
      log(),
    ],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [
      log()
    ],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [
      log(),
      checkRefreshToken()
    ],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};
