// Initializes the `otp` service on path `/otp`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { Otp } from './otp.class';
import { OtpVerifyer } from './otpVerifyer.class';
import hooks from './otp.hooks';
import createModel from '../../models/users.model';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'otp': Otp & ServiceAddons<any>;
    'otpVerifyer': OtpVerifyer & ServiceAddons<any>
  }
}

export default function (app: Application): void {
  const options = {
    paginate: app.get('paginate'),
    Model: createModel(app)
  };

  // Initialize our service with any options it requires
  app.use('/otp', new Otp(options, app));
  app.use('/otpVerifyer', new OtpVerifyer(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('otp');

  service.hooks(hooks);
}
