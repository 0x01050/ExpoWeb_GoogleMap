//@ts-ignore
import { combineReducers } from 'redux';
import FriendReducer from './FriendReducer';
import GroupReducer from './GroupReducer';
import MeReducer from './MeReducer';
import websocketReducer from './WebsocketReducer';
import ChatReducer from './ChatReducer';

export default combineReducers({
  ws: websocketReducer,
  me: MeReducer,
  friends: FriendReducer,
  groups: GroupReducer,
  chat: ChatReducer
});
