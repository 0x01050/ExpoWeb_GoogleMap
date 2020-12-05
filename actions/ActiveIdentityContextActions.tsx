//@ts-ignore
import CenterIdentity from 'centeridentity';
import {
  INIT_ACTIVE_IDENTITY_CONTEXT,
  CHANGE_ACTIVE_IDENTITY_CONTEXT
} from './types';
import store from '../store';
import { send } from './WebsocketActions'
import { GiftedChat } from 'react-native-gifted-chat'


var ci = new CenterIdentity();

export const initActiveIdentityContext = () => {
  var state = store.getState()
  return (dispatch: any) => {
    return new Promise((resolve, reject) => {
      var group = state.groups.groups[Object.keys(state.groups.groups)[0]];
      dispatch({
        type: INIT_ACTIVE_IDENTITY_CONTEXT,
        identity: group,
        rid: ci.generate_rid(group, state.ws.server_identity)
      });
      return resolve();
    })
  }
};

export const changeActiveIdentityContext = (identity: any, rid: any, group: any) => {
  var state = store.getState()
  return {
    type: CHANGE_ACTIVE_IDENTITY_CONTEXT,
    identity: identity,
    rid: ci.generate_rid(identity, group ? state.ws.server_identity : state.me.identity)
  };

}
