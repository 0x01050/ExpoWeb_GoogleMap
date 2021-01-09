//@ts-ignore
import CenterIdentity from 'centeridentity';
//@ts-ignore
import { w3cwebsocket as W3CWebSocket } from 'websocket';
import { CHANGE_GROUP, INIT_WS } from './types';
import store from '../store';
import { initChat, addChat } from './ChatActions';
import { initFriend, approveFriend, updateFriends } from './FriendActions';
import { initGroup, addGroup } from './GroupActions';
import { initActiveIdentityContext } from './ActiveIdentityContextActions';
import { initFeed, addPost, addComment } from './FeedActions';


var ws = new W3CWebSocket('wss://centeridentity.com/websocket');
var ci = new CenterIdentity();
var message_queue: any = {};
var sending_message_queue_busy = false;

setInterval(async => {
  if (sending_message_queue_busy) return;
  sending_message_queue_busy = true;
  for (const property in message_queue) {
      var message = message_queue[property];
      if (ws) ws.send(JSON.stringify(message));
  }
  sending_message_queue_busy = false;
}, 1000)

export const send = async (data: any) => {
  data.id = uuidv4(),
  message_queue[data.id] = data
  if(ws.readyState !== 1) {
      await reconnect();
      return
  }
}

const uuidv4 = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

const connect = () => {
  var state = store.getState();
  send({
      'method': 'connect',
      'jsonrpc': 2.0,
      'params': {
        'identity': ci.toObject(state.me.identity)
      }
  });
}

export const createRecord = (data: any) => {
  var state = store.getState();
  if (typeof data !== 'string') {
    data = JSON.stringify(data)
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
    var key = state.activeIdentityContext.identity.username_signature + (state.activeIdentityContext.identity.password || '');
    var identifier = state.activeIdentityContext.identity.username_signature;
  } else if (ci.generate_rid(state.ws.server_identity, state.me.identity) === state.activeIdentityContext.rid) {
    var key = state.activeIdentityContext.identity.username_signature + (state.activeIdentityContext.identity.password || '');
    var identifier = state.activeIdentityContext.identity.username_signature;
  }
  var encryptedChatRelationship = ci.encrypt(key, data)
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
    return new Promise((resolve, reject) => {
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
      return resolve(transaction);
    })
  })
}

export const joinGroup = (group: any) => {
  var state = store.getState();
  var requested_rid = ci.generate_rid(
    state.ws.server_identity,
    group
  )
  var requester_rid = ci.generate_rid(
    state.ws.server_identity,
    state.me.identity,
  )
  send({
    'method': 'join_group',
    'jsonrpc': 2.0,
    'params': ci.toObject(group)
  });
  return {
    type: CHANGE_GROUP,
    group: group
  }
}

const decrypt = (data: any) => {
  var state = store.getState();
  try {
    var group = state.groups.groups[data.params.transaction.requested_rid];
    var key = group.username_signature + (group.password || '')
    var msg = JSON.parse(ci.decrypt(key, data.params.transaction.relationship));
    msg.id = data.params.transaction.id;
    msg.time = data.params.transaction.time;
    if(msg.chatText && msg.chatText.text) {
      msg.chatText.text = decodeURIComponent(escape(msg.chatText.text));
    }
    if(msg.postText && msg.postText.text) {
      msg.postText.text = decodeURIComponent(escape(msg.postText.text));
    }
    if(msg.commentText && msg.commentText.text) {
      msg.commentText.text = decodeURIComponent(escape(msg.commentText.text));
    }
    var rid = ci.generate_rid(data.params.to, state.ws.server_identity);
    return msg;
  } catch(err) {
    console.log(err);
  }
  try {
    var msg = JSON.parse(ci.decrypt(state.me.identity.username_signature, data.params.transaction.relationship));
    msg.id = data.params.transaction.id;
    msg.time = data.params.transaction.time;
    if(msg.chatText && msg.chatText.text) {
      msg.chatText.text = decodeURIComponent(escape(msg.chatText.text));
    }
    if(msg.postText && msg.postText.text) {
      msg.postText.text = decodeURIComponent(escape(msg.postText.text));
    }
    if(msg.commentText && msg.commentText.text) {
      msg.commentText.text = decodeURIComponent(escape(msg.commentText.text));
    }
    return msg;
  } catch(err) {
    console.log(err);
  }
  try {
    var shared_secret = ci.getSharedSecret(state.friends.friends[data.params.transaction.rid].dh_private_key, state.friends.friends[data.params.transaction.rid].dh_public_key);
    var msg = JSON.parse(ci.decrypt(shared_secret, data.params.transaction.relationship));
    msg.id = data.params.transaction.id;
    msg.time = data.params.transaction.time;
    if(msg.chatText && msg.chatText.text) {
      msg.chatText.text = decodeURIComponent(escape(msg.chatText.text));
    }
    if(msg.postText && msg.postText.text) {
      msg.postText.text = decodeURIComponent(escape(msg.postText.text));
    }
    if(msg.commentText && msg.commentText.text) {
      msg.commentText.text = decodeURIComponent(escape(msg.commentText.text));
    }
    return msg;
  } catch (err) {
    console.log(err);
  }
  try {
    if (state.friends.friends[data.params.transaction.rid] && state.friends.friends[data.params.transaction.rid].dh_public_key) return;
    // probably a friend request
    if (data.params.group && data.params.to) {    
      msg = {
        createdAt: new Date(),
        user: {
          _id: state.me.identity.username_signature,
          name: state.me.identity.username
        },
        _id: uuidv4()
      };          
      if (state.friends.friends[data.params.transaction.rid] && data.params.transaction.dh_public_key && state.friends.friends[data.params.transaction.rid].relationship) {
        var relationship = JSON.parse(ci.decrypt(state.me.identity.wif, state.friends.friends[data.params.transaction.rid].relationship));
        var shared_secret = ci.getSharedSecret(relationship.dh_private_key, data.params.transaction.dh_public_key);
        state.friends.friends[data.params.transaction.rid].their_dh_public_key = data.params.transaction.dh_public_key;
        msg.text = data.params.from.username + " accepted your friend request";
      } else {
        // we have no friends
        state.friends.friends[data.params.transaction.rid] = {}
        state.friends.friends[data.params.transaction.rid].their_dh_public_key = data.params.transaction.dh_public_key;
        msg.text = 'You are now friends with ' + data.params.from.username;
        approveFriend(data.params.from, data.params.transaction);
      }
      localStorage.setItem('friends', JSON.stringify(state.friends.friends));
    }
    return msg;
  } catch (err) {
    console.log(err);
  }
}

export const initWs = () => {
  ws.onopen = async () => {
    var state = store.getState();
    connect();
  };
  ws.onmessage = async (evt: any) => {
    var data = JSON.parse(evt.data);
    delete message_queue[data.id];
    console.log(data);
    switch(data.method) {
      case 'route':
        var state = store.getState();
        var msg = decrypt(data);
        var rid = ci.generate_rid(data.params.to, state.ws.server_identity);
        if(msg.chatText) {
          store.dispatch(addChat(msg.chatText, rid));
        } else if(msg.postText) {
          store.dispatch(addPost(msg.postText, rid));
        } else if(msg.commentText) {
          store.dispatch(addPost(msg.commentText, rid));
        }
        // const audio = new Audio("https://siasky.net/RAAByP6xFFHxDMHQh_9VQD6xex0bTzugBpNwtDa4Mi8hFg");
        // audio.play();
        data.method = 'route_confirm';
        send(data);
        break;
      case 'service_provider_request':
        // server_identity = data.params.source_service_provider.identity;
        // requested_rid = ci.generate_rid(
        //   server_identity,
        //   active_group,
        // )
        // requester_rid = ci.generate_rid(
        //   server_identity,
        //   me,
        // )
        // var port = parseInt(data.params.source_service_provider.port) + 1
        // ws.close()
        // ws = new WebSocket("ws://0.0.0.0:" + port + "/websocket");
        // new Promise(async (resolve, reject) => {
        //     resolve(await joinGroup(active_group));
        // })
        break;
      case 'connect_confirm':
        // console.log(data.result.identity.username_signature);
        // console.log(active_group.username_signature);
        // console.log(requested_rid);
        var state = store.getState();
        state.ws.server_identity = data.result.identity;
        store.dispatch(initGroup())
        .then(() => {
          return store.dispatch(initFriend());
        })
        .then(() => {
          return store.dispatch(initChat());
        })
        .then(() => {
          return store.dispatch(initFeed());
        })
        .then(() => {
          return store.dispatch(initActiveIdentityContext());
        })
        .then(() => {
          var state = store.getState();
          var promises = [];
          for (const rid in state.friends.friends) {
            promises.push(store.dispatch(addGroup(state.friends.friends[rid])));
          }
          return Promise.all(promises);
        })
        .then(() => {
          var state = store.getState();
          //await getGroupServiceProvider(active_group);
          return store.dispatch(joinGroup(state.activeIdentityContext.identity));
        });
        break;
      case 'join_confirmed':
        var state = store.getState();
        console.log('chat history' + data.result.rid)
        send({
            'method': 'chat_history',
            'jsonrpc': 2.0,
            'params': {
              'to': ci.toObject(state.groups.groups[data.result.rid])
            }
        });
        break;
      case 'group_user_count':
        break;
      case 'route_confirm':
        break;
      case 'online':
        var state = store.getState();
        var friends = state.friends.friends;
        for (var i=0; i < Object.keys(friends).length; i++) {
          var friend = friends[Object.keys(friends)[i]];
          var rid = ci.generate_rid(friend, state.ws.server_identity);
          friend.online = false
          if(data.result.online_rids.indexOf(rid) === -1) {
            continue;
          }
          friend.online = true
        }
        updateFriends(friends);
        break;
      case 'chat_history_response':
        var state = store.getState();
        var chats = [];
        var posts = [];
        var comments: any = {};
        var rid = ci.generate_rid(data.result.to, state.ws.server_identity);
        for(var i=0; i < data.result.chats.length; i++) {
          try {
            var chat = decrypt({'params': {'transaction': data.result.chats[i], 'to': data.result.to}});
            if (!chat) continue
          } catch(err) {
            continue
          }
          if (chat.chatText) {
            chats.push(chat);
          } else if (chat.postText) {
            posts.push(chat);
          } else if (chat.commentText) {
            if(!comments[chat.commentText.parent]) {
              comments[chat.commentText.parent] = [];
            }
            comments[chat.commentText.parent].push(chat);
          }
        }
        if (chats.length > 0) {
          state.chat.chats[rid] = [];
          store.dispatch(addChat(chats, rid));
        }
        if (posts.length > 0) {
          state.feed.posts[rid] = [];
          store.dispatch(addPost(posts, rid));
        }
        if (Object.keys(comments).length > 0) {
          state.feed.comments[rid] = [];
          store.dispatch(addComment(comments, rid));
        }
    }
  };

  ws.onclose = () => {
      // if(onclose_triggered) return;
      // onclose_triggered = true;
      // reconnect();
      // console.log('closed')
  }

  ws.onerror = (err: any) => {
      // console.log('error');
  }

  return (dispatch: any) => {
    dispatch({
      type: INIT_WS,
      client: ws,
    })
    return new Promise((resolve, reject) => {resolve()})
  }
};

const reconnect = () => {
    if(ws.readyState !== 1) {
        return initWs();
    }
    var int = setInterval(() => {
        if(ws.readyState === 1) {
            clearInterval(int);
        } else {
            initWs();
        }
    }, 5000)
}
