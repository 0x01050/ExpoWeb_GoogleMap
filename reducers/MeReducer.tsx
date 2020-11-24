import { INIT_ME } from '../actions/types';

const INITIAL_STATE = {
  identity: {}
};

const MeReducer = (state = INITIAL_STATE, action: any) => {
  switch (action.type) {
    case INIT_ME:
      return Object.assign({}, state, {
        identity: action.identity
      });
    default:
      return state;
  }
};

export default MeReducer;
