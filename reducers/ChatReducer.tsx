import { INIT_CHAT, ADD_CHAT } from '../actions/types';
import store from '../store';

const INITIAL_STATE = {
  chats: {}
};

const ChatReducer = (state = INITIAL_STATE, action: any) => {
  const { chats } = state;
  switch (action.type) {
    case INIT_CHAT:
      return Object.assign({}, state, {
        chats: {}
      });
    case ADD_CHAT:
      if (!chats[action.identifier]) {
        chats[action.identifier] = [];
      }
      chats[action.identifier].unshift(action.chat);
      return {
        ...state,
        chats: chats
      };
    default:
      return state;
  }
};

export default ChatReducer;
