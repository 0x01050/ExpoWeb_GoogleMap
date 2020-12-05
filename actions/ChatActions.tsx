//@ts-ignore
import CenterIdentity from 'centeridentity';
import { INIT_CHAT, ADD_CHAT } from './types';
import store from '../store';
import { send } from './WebsocketActions'
import { GiftedChat } from 'react-native-gifted-chat'
import Identity from '../screens/Identity';


export const initChat = () => {
  var state = store.getState()
  var ci = new CenterIdentity();
  var requested_rid = ci.generate_rid(Object.keys(state.groups.groups)[0], state.ws.server_identity);
  return {
    type: INIT_CHAT
  };
};

export const addChat = (message: any, identifier: any) => {
  var state = store.getState()
  return {
    type: ADD_CHAT,
    chat: message,
    identifier: identifier
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
    if (
      state.activeIdentityContext.identity.dh_public_key && 
      state.activeIdentityContext.identity.dh_private_key &&
      state.friends.friends[state.activeIdentityContext.rid]
    ) {
      var key = ci.getSharedSecret(state.activeIdentityContext.identity.dh_private_key, state.activeIdentityContext.identity.dh_public_key);
      var identifier = ci.generate_rid(state.activeIdentityContext.identity, state.me.identity);
    } else if (
      state.activeIdentityContext.identity.username_signature &&
      state.groups.groups[state.activeIdentityContext.rid]
    ) {
      var key = state.activeIdentityContext.identity.username_signature + (state.activeIdentityContext.identity.salt || '');
      var identifier = state.activeIdentityContext.identity.username_signature;
    } else if (ci.generate_rid(state.ws.server_identity, state.me.identity) === state.activeIdentityContext.rid) {
      var key = state.activeIdentityContext.identity.username_signature + (state.activeIdentityContext.identity.salt || '');
      var identifier = state.activeIdentityContext.identity.username_signature;
    }

    var encryptedChatRelationship = ci.encrypt(key, JSON.stringify({chatText: msg}))
    var meObject = ci.toObject(state.me.identity);

    var requested_rid = ci.generate_rid(
      state.ws.server_identity,
      state.activeIdentityContext.identity
    );

    var requester_rid = ci.generate_rid(
      state.ws.server_identity,
      state.me.identity,
    );
    return ci.generateTransaction(
      state.me.identity,
      meObject.public_key,
      '',
      ci.generate_rid(state.me.identity, state.activeIdentityContext.identity),
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
          'to': ci.toObject(state.activeIdentityContext.identity),
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
        identifier: state.activeIdentityContext.rid
      });
    })
  }
}
