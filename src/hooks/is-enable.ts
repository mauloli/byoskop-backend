// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html
import errors  from '@feathersjs/errors';
import { Hook, HookContext } from '@feathersjs/feathers';
import { propEq } from 'ramda';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default (options = {}): Hook => {
  return async (context: HookContext): Promise<HookContext> => {
    const { params } = context;
    const { user } = params;

    const isAdmin = propEq('is_admin', 1) as any;
    
    if(!isAdmin(user)){
      throw new errors.Forbidden();
    }
    return context;
  };
};
