import { INIT_GROUP, CHANGE_GROUP } from '../actions/types';

const INITIAL_STATE = {
  groups: {},
  active_group: {}
};

const GroupReducer = (state = INITIAL_STATE, action: any) => {
  switch (action.type) {
    case INIT_GROUP:
      var groups: any = {};
      groups[action.active_group.username_signature] = action.active_group;
      return Object.assign({}, state, {
        groups: groups,
        active_group: action.active_group
      });
    case CHANGE_GROUP:
      return {
        ...state,
        active_group: action.group
      };
    default:
      return state;
  }
};

export default GroupReducer;
