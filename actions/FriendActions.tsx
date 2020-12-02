//@ts-ignore
import CenterIdentity from 'centeridentity';
import { INIT_FRIENDS, ADD_FRIEND, APPROVE_FRIEND, ADD_CHAT } from './types';
import store from '../store';
import { send } from './WebsocketActions'

export const initFriend = () => {
  var state = store.getState()
  var ci = new CenterIdentity();
  var friends = localStorage.getItem('friends');
  if (friends) {
    var friendsList = JSON.parse(friends);
    var newFriends: any = {};
    for (const rid in friendsList) {
        try {
          var relationship = JSON.parse(ci.decrypt(state.me.identity.wif, friendsList[rid].relationship));
          newFriends[rid] = friendsList[rid];
          newFriends[rid].relationship = relationship;
        } catch(err) {
          if(friendsList[rid].relationship.their_username_signature) {
            newFriends[rid] = friendsList[rid];
          }
          continue
        }
    }
    return {
      type: INIT_FRIENDS,
      friends: newFriends
    }
  } else {
    return {
      type: INIT_FRIENDS,
      friends: {}
    }
  }
};

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
  });
}

export const addFriend = (friend: any) => {
  var state = store.getState()
  var ci = new CenterIdentity();
  return (dispatch: any) => {
    return ci.createRelationshipTransaction(state.me.identity, friend, state.groups.active_group)
    .then(async (transaction: any) => {
      console.log('transaction: ', transaction);
      var friend_list = localStorage.getItem('friends') || '{}';
      var friends = JSON.parse(friend_list);
      if (!friends || typeof friends !== 'object') {
          friends = {};
      }
      if(friends[transaction.rid] && friends[transaction.rid].their_dh_public_key) {
          transaction.their_dh_public_key = friends[transaction.rid].their_dh_public_key
      }
      friends[transaction.rid] = JSON.parse(JSON.stringify(transaction));
      localStorage.setItem('friends', JSON.stringify(friends));
      return send({
        'method': 'route',
        'jsonrpc': 2.0,
        'params': {
          'group': ci.toObject(state.groups.active_group),
          'to': ci.toObject(friend),
          'from': ci.toObject(state.me.identity),
          'transaction': transaction
        }
      });
    })
    .then(() => {
      var friend_list = localStorage.getItem('friends') || '{}'
      var friends = JSON.parse(friend_list);
      dispatch({
        type: ADD_CHAT,
        chat: {
          user: {
            _id: state.me.identity.username_signature,
            name: state.me.identity.username
          },
          text: 'You sent a friend request to ' + state.me.identity.username,
          createdAt: new Date(),
          _id: uuidv4()
        }
      })
    })
  }
}

export const approveFriend = async (friend: any, request: any) => {
  var state = store.getState()
  var ci = new CenterIdentity();
  return ci.approveRelationshipTransaction(state.me.identity, friend, request)
  .then(async (transaction: any) => {
    console.log('transaction: ', transaction);
    var friend_list = localStorage.getItem('friends') || '{}'
    var friends = JSON.parse(friend_list);
    if (!friends || typeof friends !== 'object') {
        friends = {};
    }
    friends[transaction.rid] = JSON.parse(JSON.stringify(transaction));;
    if (request.dh_public_key) {
      friends[transaction.rid].relationship = JSON.parse(ci.decrypt(state.me.identity.wif, transaction.relationship));
      friends[transaction.rid].their_dh_public_key = request.dh_public_key;
    }
    localStorage.setItem('friends', JSON.stringify(friends));
    return send({
        'method': 'route',
        'jsonrpc': 2.0,
        'params': {
            'group': ci.toObject(state.groups.active_group),
            'to': ci.toObject(friend),
            'from': ci.toObject(state.me.identity),
            'transaction': transaction
        }
    });
  });
}
