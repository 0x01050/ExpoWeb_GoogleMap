//@ts-ignore
import CenterIdentity from 'centeridentity';
import { INIT_CHAT, ADD_CHAT } from './types';
import store from '../store';
import { send } from './WebsocketActions'
import { GiftedChat } from 'react-native-gifted-chat'
import Identity from '../screens/Identity';


export const initChat = () => {
  return {
    type: INIT_CHAT
  };
};

export const addChat = (message: any, identity: any) => {

  return {
    type: ADD_CHAT,
    chat: message,
    identity: identity
  };

}

export const sendChat = (message: any) => {
  var state = store.getState()
  return (dispatch: any) => {
    var ci = new CenterIdentity();
    let msg = JSON.parse(JSON.stringify(message[0]));
    if (msg.text) {
      msg.text = unescape(encodeURIComponent(msg.text));
    }
    if (state.activeIdentityContext.identity.their_dh_public_key && state.activeIdentityContext.identity.relationship.dh_private_key) {
      var key = ci.getSharedSecret(state.activeIdentityContext.identity.relationship.dh_private_key, state.activeIdentityContext.identity.their_dh_public_key);
      var group_identity = ci.theirIdentityFromTransaction(state.activeIdentityContext.identity);
    } else if (state.activeIdentityContext.identity.username_signature) {
      var key = state.activeIdentityContext.identity.username_signature + (state.activeIdentityContext.identity.salt || '');
      var group_identity = state.activeIdentityContext.identity;
    } else {
      var key = state.activeIdentityContext.identity.their_username_signature + (state.activeIdentityContext.identity.salt || '');
      var group_identity = state.activeIdentityContext.identity;
    }

    var encryptedChatRelationship = ci.encrypt(key, JSON.stringify({chatText: msg}))
    var meObject = ci.toObject(state.me.identity);

    var requested_rid = ci.generate_rid(
      state.ws.server_identity,
      group_identity
    );

    var requester_rid = ci.generate_rid(
      state.ws.server_identity,
      state.me.identity,
    );
    return ci.generateTransaction(
      state.me.identity,
      meObject.public_key,
      '',
      ci.generate_rid(state.me.identity, group_identity),
      encryptedChatRelationship,
      0,
      requester_rid,
      requested_rid
    )
    .then((transaction: any) => {
      console.log('transaction: ', transaction);

      var m = {
        'method': 'route',
        'jsonrpc': 2.0,
        'params': {
          'transaction': transaction,
          'to': ci.toObject(state.groups.active_group),
          'from': ci.toObject(state.me.identity)
        }
      };

      send(m);

      var newDate = new Date();
      newDate.setTime(transaction.time*1000);
      if (!message[0]._id) {
        message[0]._id = transaction.id
      }
      return dispatch({
        type: ADD_CHAT,
        chat: message[0],
        identity: state.activeIdentityContext.identity
      });
    })
  }
}
