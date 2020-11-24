import { INIT_FRIENDS } from '../actions/types';

const INITIAL_STATE = {
  friends: {}
};

const FriendReducer = (state = INITIAL_STATE, action: any) => {
  switch (action.type) {
    case INIT_FRIENDS:
      return Object.assign({}, state, {
        friends: action.friends
      });
    default:
      return state;
  }
};

export default FriendReducer;
