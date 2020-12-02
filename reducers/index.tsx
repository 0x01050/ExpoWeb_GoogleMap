//@ts-ignore
import { combineReducers } from 'redux';
import FriendReducer from './FriendReducer';
import GroupReducer from './GroupReducer';
import MeReducer from './MeReducer';
import websocketReducer from './WebsocketReducer';
import ChatReducer from './ChatReducer';
import ActiveIdentityContextReducer from './ActiveIdentityContextReducer';

export default combineReducers({
  ws: websocketReducer,
  me: MeReducer,
  friends: FriendReducer,
  groups: GroupReducer,
  chat: ChatReducer,
  activeIdentityContext: ActiveIdentityContextReducer
});
