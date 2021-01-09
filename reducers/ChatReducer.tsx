import { INIT_CHAT, ADD_CHAT } from '../actions/types';
import store from '../store';

const INITIAL_STATE = {
  chats: {}
};

const uuidv4 = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

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
      if (!action.chat.length) {
        action.chat = [action.chat];
      }

      for(var i=0; i < action.chat.length; i++) {
        action.chat[i].chatText._id = uuidv4();
        action.chat[i].chatText.createdAt = new Date(action.chat[i].chatText.createdAt)
        chats[action.identifier].push(action.chat[i].chatText);
      }

      chats[action.identifier].sort((a, b) => b.createdAt - a.createdAt)

      return {
        ...state,
        chats: chats
      };
    default:
      return state;
  }
};

export default ChatReducer;
