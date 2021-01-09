//@ts-ignore
import CenterIdentity from 'centeridentity';
import { INIT_FEED, ADD_POST, ADD_COMMENT } from './types';
import store from '../store';
import { send, createRecord } from './WebsocketActions'
import { GiftedChat } from 'react-native-gifted-chat'
import Identity from '../screens/Identity';


export const initFeed = () => {
  return {
    type: INIT_FEED
  };
};

export const addPost = (message: any, identifier: any) => {
  return {
    type: ADD_POST,
    post: message,
    identifier: identifier
  };

}

export const addComment = (message: any, identifier: any) => {
  return {
    type: ADD_COMMENT,
    comment: message,
    identifier: identifier
  };

}

export const sendPost = (message: any, msgType: any) => {
  var state = store.getState()
  return (dispatch: any) => {
    var ci = new CenterIdentity();
    if (message.text) {
      message.text = unescape(encodeURIComponent(message.text));
    }
    var msg: any = {};
    msg[msgType] = message
    return createRecord(msg)
    .then((transaction: any) => {
      msg.time = transaction.time
      msg.id = transaction.id
      if (msg.postText) {
        return dispatch({
          type: ADD_POST,
          post: msg,
          identifier: state.activeIdentityContext.rid
        });
      } else if (msg.commentText) {
        state.feed.comments[state.activeIdentityContext.rid] = state.feed.comments[state.activeIdentityContext.rid] || {};
        state.feed.comments[state.activeIdentityContext.rid][msg.commentText.parent] = state.feed.comments[state.activeIdentityContext.rid][msg.commentText.parent] || [];
        state.feed.comments[state.activeIdentityContext.rid][msg.commentText.parent].push(msg);
        return dispatch({
          type: ADD_COMMENT,
          comment: state.feed.comments[state.activeIdentityContext.rid],
          identifier: state.activeIdentityContext.rid
        });
      }
    })
  }
}
