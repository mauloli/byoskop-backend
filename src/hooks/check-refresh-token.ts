// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html
import { Hook, HookContext } from '@feathersjs/feathers';

const { JWT_EXP_REFRESH } = process.env;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default (options = {}): Hook => {
  return async (context: HookContext): Promise<HookContext> => {
    const { app, error, params } = context;
    const { name } = error.data || {};
    const { payload } = params;
    const { 'x-refresh-token': refreshToken } = params.headers || {};


    if (name !== 'TokenExpiredError' || !refreshToken) return context;

    const defaults = app.get('authentication') || app.get('auth');

    const user = await app.service('authentication').verifyAccessToken(refreshToken);

    const { jwtOptions } = defaults;
    const newAccessToken = await app.service('authentication').createAccessToken(
      { sub: user.sub },
      { ...jwtOptions, }
    );
    const newRefreshToken = await app.service('authentication').createAccessToken(
      { sub: user.sub },
      {
        ...jwtOptions,
        expiresIn: JWT_EXP_REFRESH
      }
    );

    Object.assign(context, { newAccessToken, newRefreshToken });

    context.result = null;
    return context;
  };
};
