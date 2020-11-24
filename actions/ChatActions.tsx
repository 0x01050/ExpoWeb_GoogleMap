//@ts-ignore
import CenterIdentity from 'centeridentity';
import { INIT_CHAT, ADD_CHAT } from './types';
import store from '../store';
import { send } from './WebsocketActions'
import { GiftedChat } from 'react-native-gifted-chat'


export const initChat = () => {
  return {
    type: INIT_CHAT
  };
};

export const addChat = (message: any) => {

  return {
    type: ADD_CHAT,
    chat: message.relationship.chatText[0]
  };

}

export const sendChat = (message: any) => {
  var state = store.getState()
  return (dispatch: any) => {
    var ci = new CenterIdentity();
    var encryptedChatRelationship = ci.encrypt(state.groups.active_group.username_signature, JSON.stringify({chatText: message}));
    var meObject = ci.toObject(state.me.identity);

    var requested_rid = ci.generate_rid(
      state.ws.server_identity,
      state.groups.active_group
    );

    var requester_rid = ci.generate_rid(
      state.ws.server_identity,
      state.me.identity,
    );

    return ci.generateTransaction(
      state.me.identity,
      meObject.public_key,
      '',
      ci.generate_rid(state.me.identity, state.groups.active_group),
      encryptedChatRelationship,
      0,
      requester_rid,
      requested_rid
    )
    .then((transaction: any) => {
      console.log('transaction: ', transaction);

      send({
        'method': 'route',
        'jsonrpc': 2.0,
        'params': {
          'transaction': transaction,
          'to': ci.toObject(state.groups.active_group),
          'from': ci.toObject(state.me.identity)
        }
      });

      var newDate = new Date();
      newDate.setTime(transaction.time*1000);
      var msg = {
        _id: message[0]._id,
        createdAt: message[0].createdAt,
        user: message[0].user,
      }
      if(message[0].image) {
        msg.image = message[0].image;
      } else {
        msg.text = message[0].text;
      }
      if (!msg._id) {
        msg._id = transaction.id
      }
      return dispatch({
        type: ADD_CHAT,
        chat: msg
      });
    })
  }
}
