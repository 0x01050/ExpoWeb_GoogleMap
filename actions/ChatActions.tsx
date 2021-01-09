//@ts-ignore
import CenterIdentity from 'centeridentity';
import { INIT_CHAT, ADD_CHAT } from './types';
import store from '../store';
import { send, createRecord } from './WebsocketActions'
import { GiftedChat } from 'react-native-gifted-chat'
import Identity from '../screens/Identity';


export const initChat = () => {
  return {
    type: INIT_CHAT
  };
};

export const addChat = (message: any, identifier: any) => {
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
    return createRecord({chatText: msg})
    .then((transaction: any) => {
      var newDate = new Date();
      newDate.setTime(transaction.time*1000);
      if (!message[0]._id) {
        message[0]._id = transaction.id
      }
  
      return dispatch({
        type: ADD_CHAT,
        chat: {chatText: message[0]},
        identifier: state.activeIdentityContext.rid
      });
    });
    
  }
}
