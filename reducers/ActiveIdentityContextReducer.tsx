import {
  INIT_ACTIVE_IDENTITY_CONTEXT,
  CHANGE_ACTIVE_IDENTITY_CONTEXT
} from '../actions/types';

const INITIAL_STATE = {
  identity: {}
};

const ActiveIdentityContextReducer = (state = INITIAL_STATE, action: any) => {
  switch (action.type) {
    case INIT_ACTIVE_IDENTITY_CONTEXT:
      return {
        identity: action.identity,
        rid: action.rid
      }
    case CHANGE_ACTIVE_IDENTITY_CONTEXT:
      return {
        identity: action.identity,
        rid: action.rid
      }
    default:
      return state;
  }
};

export default ActiveIdentityContextReducer;
