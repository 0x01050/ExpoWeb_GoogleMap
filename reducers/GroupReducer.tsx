import { INIT_GROUP, CHANGE_GROUP, ADD_GROUP } from '../actions/types';

const INITIAL_STATE = {
  groups: {}
};

const GroupReducer = (state = INITIAL_STATE, action: any) => {
  switch (action.type) {
    case INIT_GROUP:
      var { groups } = state;
      groups[action.requested_rid] = action.group;
      return {...state,
        groups: groups
      };
    case ADD_GROUP:
      var { groups } = state;
      groups[action.requested_rid] = action.group;
      return {...state,
        groups: groups
      };
    default:
      return state;
  }
};

export default GroupReducer;
