import { HookContext, ServiceAddons } from '@feathersjs/feathers';
import { AuthenticationService, JWTStrategy } from '@feathersjs/authentication';
import { LocalStrategy } from '@feathersjs/authentication-local';
import { expressOauth } from '@feathersjs/authentication-oauth';
import { compare } from 'bcrypt';
import { Application } from './declarations';

declare module './declarations' {
  interface ServiceTypes {
    'authentication': AuthenticationService & ServiceAddons<any>;
  }
}

const checkUser = () => {
  return async (context: HookContext) => {
    const { app } = context;
    const { email, password } = context.data;

    // Check if email exists in database
    const { data: [user] } = await app.service('users')._find({ query: { email } });

    if (!user) {
      throw new Error('Email belum terdaftar');
    }

    const { otp } = user;

    if (otp) {
      throw new Error('user belum terverifikasi');
    }

    // Compare password with password in database
    const isValid = await compare(password, user.password);

    if (!isValid) {
      throw new Error('Password salah');
    }

    return context;
  };
};

const addRefreshToken = () => {
  return async (context: HookContext) => {
    const { app, result, params } = context;
    const { JWT_EXP_REFRESH } = process.env;
    const { user } = result;
    const defaults = app.get('authentication');
    const { jwtOptions } = defaults;
    const refreshToken = await app.service('authentication').createAccessToken(
      {
        sub: user.id
      },
      {
        ...jwtOptions,
        expiresIn: JWT_EXP_REFRESH
      }
    );

    // Add the refresh token to the response
    Object.assign(context.result, {
      refreshToken
    });

    return context;
  };
};


export default function (app: Application): void {
  const authentication = new AuthenticationService(app);
  const defaults = app.get('authentication');
  authentication.register('jwt', new JWTStrategy());
  authentication.register('local', new LocalStrategy());


  app.use('/authentication', authentication);
  app.configure(expressOauth());

  app.service('authentication').hooks({
    before: {
      create: [
        checkUser(),
      ]
    },
    after: {
      create: [
        addRefreshToken(),
        (ctx) => {
          const { result } = ctx;
          const { accessToken, user, refreshToken } = result;
          ctx.result = {
            user,
            accessToken,
            refreshToken,
          };

        }
      ]
    }
  });
}
