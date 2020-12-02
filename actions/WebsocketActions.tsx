//@ts-ignore
import CenterIdentity from 'centeridentity';
//@ts-ignore
import { w3cwebsocket as W3CWebSocket } from 'websocket';
import { CHANGE_GROUP, INIT_WS } from './types';
import store from '../store';
import { addChat } from './ChatActions';
import { approveFriend } from './FriendActions';


var ws = new W3CWebSocket('ws://71.193.201.21:8005/websocket');
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

export const initWs = () => {
  ws.onopen = async () => {
    var state = store.getState();
    connect();
  };
  ws.onmessage = async (evt: any) => {
    var state = store.getState();
    var data = JSON.parse(evt.data);
    delete message_queue[data.id];
    console.log(data);
    switch(data.method) {
      case 'route':
        try {
          var msg = JSON.parse(ci.decrypt(state.groups.active_group.username_signature, data.params.transaction.relationship));
          if(msg.chatText.text) {
            msg.chatText.text = decodeURIComponent(escape(msg.chatText.text));
          }
          data.params.transaction.type = 'group';
        } catch(err) {
          try {
            var shared_secret = ci.getSharedSecret(state.friends.friends[data.params.transaction.rid].relationship.dh_private_key, state.friends.friends[data.params.transaction.rid].their_dh_public_key);
            var msg = JSON.parse(ci.decrypt(shared_secret, data.params.transaction.relationship));
            if(msg.chatText.text) {
              msg.chatText.text = decodeURIComponent(escape(msg.chatText.text));
            }
            data.params.transaction.type = 'private';
          } catch (err2) {
            if (state.friends.friends[data.params.transaction.rid] && state.friends.friends[data.params.transaction.rid].their_dh_public_key) return;
            // probably a friend request
            if (data.params.group && data.params.to) {              
              if (state.friends.friends[data.params.transaction.rid] && data.params.transaction.dh_public_key && state.friends.friends[data.params.transaction.rid].relationship) {
                var relationship = JSON.parse(ci.decrypt(state.me.identity.wif, state.friends.friends[data.params.transaction.rid].relationship));
                var shared_secret = ci.getSharedSecret(relationship.dh_private_key, data.params.transaction.dh_public_key);
                state.friends.friends[data.params.transaction.rid].their_dh_public_key = data.params.transaction.dh_public_key;
                msg.chatText.text = data.params.from.username + " accepted your friend request";
              } else {
                // we have no friends
                state.friends.friends[data.params.transaction.rid] = {}
                state.friends.friends[data.params.transaction.rid].their_dh_public_key = data.params.transaction.dh_public_key;
                msg.chatText.text = 'You are now friends with ' + data.params.from.username;
                approveFriend(data.params.from, data.params.transaction);
              }
              localStorage.setItem('friends', JSON.stringify(state.friends.friends));
              data.params.transaction.type = 'group';
            }
          }
        }
        store.dispatch(addChat(msg.chatText, data.params.from));
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
        state.ws.server_identity = data.result.identity;
        //await getGroupServiceProvider(active_group);
        store.dispatch(joinGroup(state.groups.active_group));
        break;
      case 'join_confirmed':
        break;
      case 'group_user_count':
        break;
      case 'route_confirm':
        break;
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

  return {
    type: INIT_WS,
    client: ws,
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
