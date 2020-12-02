import { INIT_CHAT, ADD_CHAT } from '../actions/types';

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
      if (!chats[action.identity.username_signature]) {
        chats[action.identity.username_signature] = [];
      }
      chats[action.identity.username_signature].push(action.chat)
      return Object.assign({}, state, {
        chats: chats
      });
    default:
      return state;
  }
};

export default ChatReducer;
