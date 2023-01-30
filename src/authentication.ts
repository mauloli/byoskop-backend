import { ServiceAddons } from '@feathersjs/feathers';
import { AuthenticationService, JWTStrategy } from '@feathersjs/authentication';
import { LocalStrategy } from '@feathersjs/authentication-local';
import { expressOauth } from '@feathersjs/authentication-oauth';
import  { compare } from 'bcrypt';
import { Application } from './declarations';

declare module './declarations' {
  interface ServiceTypes {
    'authentication': AuthenticationService & ServiceAddons<any>;
  }
}

export default function(app: Application): void {
  const authentication = new AuthenticationService(app);

  authentication.register('jwt', new JWTStrategy());
  authentication.register('local', new LocalStrategy());

  app.use('/authentication', authentication);
  app.configure(expressOauth());

  app.service('authentication').hooks({
    before: {
      create: async context => {
        const { email, password } = context.data;
        
        // Check if email exists in database
        const { data: [user] } = await app.service('users')._find({ query: { email } });
        
        if (!user) {
          throw new Error('Email belum terdaftar');
        }

        // Compare password with password in database
        const isValid = await compare(password, user.password);

        if (!isValid) {
          throw new Error('Password salah');
        }

        return context;
      }
    }
  });
}
