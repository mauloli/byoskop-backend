import errors from '@feathersjs/errors';
import { Params } from '@feathersjs/feathers';
import { SequelizeServiceOptions, Service } from 'feathers-sequelize';
import app from '../../app';
import { Application } from '../../declarations';


export class OtpVerifyer extends Service {

  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options);
  }


  async create(data: any, params?: Params | undefined): Promise<any> {
    const { email, otp } = data;

    const { data: [otpVerif] } = await app.service('users').find({
      query: {
        email, otp
      }
    }) as any;

    if (!otpVerif) {
      throw new errors.BadRequest('Otp tidak valid');
    }

    const patchOtp = await app.service('users').patch(otpVerif.id, {
      otp: null,
      status: 1
    });

    return data;
  }
}