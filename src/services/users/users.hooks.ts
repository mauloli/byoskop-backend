import * as feathersAuthentication from '@feathersjs/authentication';
import * as local from '@feathersjs/authentication-local';
import errors from '@feathersjs/errors';
import validator from 'validator';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import { HookContext } from '@feathersjs/feathers';



// Don't remove this comment. It's needed to format import lines nicely.

const { authenticate } = feathersAuthentication.hooks;
const { hashPassword, protect } = local.hooks;
const { isEmail, isLength, matches } = validator;


const checkEmailAndPassword = () => {
  return async (context: HookContext) => {
    const { data, app } = context;
    const { email, password } = data;

    if (!isEmail(email)) {
      throw new errors.BadRequest('email salah');
    }

    const { data: [user] } = await app.service('users')._find({
      query: {
        email
      }
    });

    if (user) {
      throw new errors.BadRequest('email telah terdaftar');
    }

    const requirePass = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).+$/;

    if (!isLength(password, { min: 8 }) || !matches(password, requirePass)) {
      const message = [
        'password harus terdiri dari 8 karakter',
        'dengan huruf besar, huruf kecil, dan angka'
      ];

      throw new errors.BadRequest(message.join(' '));
    }

    return context;
  };
};

const sendMail = () => {
  return async (context: HookContext) => {
    const { data } = context;
    const {
      ZOHO_MAIL: zohoMail,
      ZOHO_PASS: zohoPass
    } = process.env;

    const transporter = nodemailer.createTransport({
      service: 'zoho',
      // secure: true, // true for 465, false for other ports
      auth: {
        user: zohoMail, // generated ethereal user
        pass: zohoPass, // generated ethereal password
      },
    });

    const otp = crypto.randomBytes(3).toString('hex').slice(-6);

    Object.assign(context.data, {
      otp
    });

    const info = await transporter.sendMail({
      from: '"Byoskop 👻" <mauloli@zohomail.com>', // sender address
      to: data.email, // list of receivers
      subject: 'test', // Subject line
      text: `otp ${otp}` // html body
    });


    return context;
  };
};

export default {
  before: {
    all: [],
    find: [
      authenticate('jwt'),
    ],
    get: [authenticate('jwt')],
    create: [
      checkEmailAndPassword(),
      sendMail(),
      hashPassword('password')
    ],
    update: [hashPassword('password'), authenticate('jwt')],
    patch: [hashPassword('password'), authenticate('jwt')],
    remove: [authenticate('jwt')]
  },

  after: {
    all: [
      // Make sure the password field is never sent to the client
      // Always must be the last hook
      protect('password')
    ],
    find: [],
    get: [],
    create: [
      (context: HookContext) => {
        delete context.result.otp;
        return context;
      },
    ],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};
