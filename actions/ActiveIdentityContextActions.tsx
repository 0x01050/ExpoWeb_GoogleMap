//@ts-ignore
import CenterIdentity from 'centeridentity';
import {
  INIT_ACTIVE_IDENTITY_CONTEXT,
  CHANGE_ACTIVE_IDENTITY_CONTEXT
} from './types';
import store from '../store';
import { send, joinGroup } from './WebsocketActions'
import { GiftedChat } from 'react-native-gifted-chat'


var ci = new CenterIdentity();

export const initActiveIdentityContext = () => {
  var state = store.getState()
  return (dispatch: any) => {
    if (window.location.hash.length > 0) {
      var group_data = {
        "username": window.location.hash,
        "wif":"KydUVG4w2ZSQkg6DAZ4UCEbfZz9Tg4PsjJFnvHwFsfmRkqXAHN8W"
      }
    } else {
      var group_data = {
        "username": '#general',
        "wif":"KydUVG4w2ZSQkg6DAZ4UCEbfZz9Tg4PsjJFnvHwFsfmRkqXAHN8W"
      }
    }
    return ci.reviveUser(group_data.wif, group_data.username)
    .then((group: any) => {
      dispatch({
        type: INIT_ACTIVE_IDENTITY_CONTEXT,
        identity: group,
        rid: ci.generate_rid(group, state.ws.server_identity)
      });
    })
  }
};

export const changeActiveIdentityContext = (identity: any, rid: any, group: any) => {
  var state = store.getState()
  joinGroup(identity);
  window.location.hash = identity.username;                                                                                                                                             
  return {
    type: CHANGE_ACTIVE_IDENTITY_CONTEXT,
    identity: identity,
    rid: ci.generate_rid(identity, group ? state.ws.server_identity : state.me.identity)
  };

}
