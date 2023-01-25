// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html
import { Hook, HookContext } from '@feathersjs/feathers';
import logger from '../logger';

// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-var-requires
const { getPath, compose, option } = require('crocks');

const getUserId = compose(
  option(null),
  getPath(['params', 'user', 'id']),
);

export default (options = {}): Hook => {
  return async (context: HookContext): Promise<HookContext> => {
    const userId = getUserId(context);
    const { path, method, type, params, id = null } = context;
    const { query } = params;

    const defaultData = {
      userId,
      type,
      method,
      path,
      id,
      query,
    };
    const childLogger = logger.child(defaultData);

    childLogger.info(`${type} app.service('${path}').${method}()`);

    // This debugs the service call and a stringified version of the hook context
    // You can customize the message (and logger) to your needs
    logger.debug(`${type} app.service('${path}').${method}()`);

    Object.assign(context, {
      logger: childLogger
    });

    if (context.error) {
      childLogger.error(context.error.stack);
    }

    return context;
  };
};
