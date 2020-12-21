//@ts-ignore
import CenterIdentity from 'centeridentity';
import { INIT_FRIENDS, ADD_FRIEND, APPROVE_FRIEND, ADD_CHAT, UPDATE_FRIENDS } from './types';
import store from '../store';
import { send } from './WebsocketActions';
import { addGroup } from './GroupActions';
import { joinGroup } from './WebsocketActions';

export const initFriend = () => {
  var state = store.getState()
  var ci = new CenterIdentity();
  var friends = localStorage.getItem('friends');
  if (friends) {
    var friendsList = JSON.parse(friends);
    var newFriends: any = {};
    var rids = []
    for (const rid in friendsList) {
      var friend = false;
      try {
        friend = ci.theirIdentityFromEncryptedTransaction(state.me.identity, friendsList[rid], {dh_public_key: friendsList[rid].their_dh_public_key});
        var test_rid = ci.generate_rid(friend, state.me.identity);
      } catch(err) {
        if(friendsList[rid].relationship && friendsList[rid].relationship.their_username_signature) {
          friend = ci.theirIdentityFromTransaction(friendsList[rid], {dh_public_key: friendsList[rid].their_dh_public_key});
          var test_rid = ci.generate_rid(friend, state.me.identity);
        } else if (friendsList[rid].username_signature) {
          friend = friendsList[rid]
        } else {
          continue
        }
      }
      if (friend) {
        var test_rid = ci.generate_rid(friend, state.me.identity);
        rids.push(ci.generate_rid(friend, state.ws.server_identity))
        if (test_rid === rid) {
          newFriends[rid] = friend;
        }
      }
    }
    online(rids)
    return (dispatch: any) => {
      return new Promise((resolve, reject) => {
        dispatch({
          type: INIT_FRIENDS,
          friends: newFriends
        });
        return resolve();
      });
    }
  } else {
    return (dispatch: any) => {
      return new Promise((resolve, reject) => {
        dispatch({
          type: INIT_FRIENDS,
          friends: {}
        });
        return resolve();
      });
    }
  }
};

export const online = (rids: any) => {
  var state = store.getState();
  send({
    'method': 'online',
    'jsonrpc': 2.0,
    'params': {
      'rids': rids
    }
  });
}

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
    return ci.createRelationshipTransaction(state.me.identity, friend, state.activeIdentityContext.identity)
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
          'group': ci.toObject(state.activeIdentityContext.identity),
          'to': ci.toObject(friend),
          'from': ci.toObject(state.me.identity),
          'transaction': transaction
        }
      });
    })
    .then(() => {
      var friend_list = localStorage.getItem('friends') || '{}'
      var friends = JSON.parse(friend_list);
      return new Promise((resolve, reject) => {
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
        });
        return resolve();
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
            'group': ci.toObject(state.activeIdentityContext.identity),
            'to': ci.toObject(friend),
            'from': ci.toObject(state.me.identity),
            'transaction': transaction
        }
    });
  });
}

export const updateFriends = (friends: any) => {
  return {
    type: UPDATE_FRIENDS,
    friends: friends
  }
}
