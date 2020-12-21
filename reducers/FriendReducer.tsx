import { INIT_FRIENDS, ADD_FRIEND, APPROVE_FRIEND, UPDATE_FRIENDS } from '../actions/types';

const INITIAL_STATE = {
  friends: {}
};

const FriendReducer = (state = INITIAL_STATE, action: any) => {
  switch (action.type) {
    case INIT_FRIENDS:
      var friends_list = [];
      for (const property in action.friends) {
          var friend = action.friends[property];
          if (action.friends[property].relationship && typeof action.friends[property].relationship !== 'string') friends_list.push(action.friends[property]);
      }
      return Object.assign({}, state, {
        friends_list: friends_list,
        friends: action.friends
      });
    case ADD_FRIEND:
      return Object.assign({}, state, {
        friends: action.friends
      });
    case APPROVE_FRIEND:
      return Object.assign({}, state, {
        friends: action.friends
      });
    case UPDATE_FRIENDS:
      return Object.assign({}, state, {
        friends: action.friends
      });
    default:
      return state;
  }
};

export default FriendReducer;
