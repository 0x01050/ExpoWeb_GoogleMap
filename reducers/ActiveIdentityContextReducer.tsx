import { INIT_ACTIVE_IDENTITY_CONTEXT, CHANGE_ACTIVE_IDENTITY_CONTEXT } from '../actions/types';

const INITIAL_STATE = {
  chats: []
};

const ActiveIdentityContextReducer = (state = INITIAL_STATE, action: any) => {
  switch (action.type) {
    case INIT_ACTIVE_IDENTITY_CONTEXT:
      return {
        identity: action.identity
      };
    case CHANGE_ACTIVE_IDENTITY_CONTEXT:
      return {
        identity: action.identity
      };
    default:
      return state;
  }
};

export default ActiveIdentityContextReducer;
