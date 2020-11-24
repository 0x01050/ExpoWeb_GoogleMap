import { INIT_CHAT, ADD_CHAT } from '../actions/types';

const INITIAL_STATE = {
  chats: []
};

const ChatReducer = (state = INITIAL_STATE, action: any) => {
  switch (action.type) {
    case INIT_CHAT:
      return Object.assign({}, state, {
        chats: action.chats
      });
    case ADD_CHAT:
      state.chats.unshift(action.chat);
      return {
        chats: state.chats
      };
    default:
      return state;
  }
};

export default ChatReducer;
