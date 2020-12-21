//@ts-ignore
import CenterIdentity from 'centeridentity';
import { INIT_GROUP, CHANGE_GROUP, ADD_GROUP } from './types';
import store from '../store';
import { joinGroup } from './WebsocketActions';
import { changeActiveIdentityContext } from './ActiveIdentityContextActions';

export const initGroup = () => {
  var state = store.getState()
  var ci = new CenterIdentity();
  var group_data = {
    "username": "group",
    "username_signature": "MEUCIQDIlC+SpeLwUI4fzV1mkEsJCG6HIvBvazHuMMNGuVKi+gIgV8r1cexwDHM3RFGkP9bURi+RmcybaKHUcco1Qu0wvxw=",
    "public_key": "036f99ba2238167d9726af27168384d5fe00ef96b928427f3b931ed6a695aaabff", 
    "wif":"KydUVG4w2ZSQkg6DAZ4UCEbfZz9Tg4PsjJFnvHwFsfmRkqXAHN8W"
  }
  var private_group_data: any = null;
  if (window.location.hash.length > 0) {
    private_group_data = {
      "username": window.location.hash,
      "wif": group_data.wif
    }
  }
  return (dispatch: any) => {
    var groups = getGroups();
    for(var i=0; i < Object.keys(groups).length; i++) {
      var group = groups[Object.keys(groups)[i]];
      var requested_rid = ci.generate_rid(group, state.ws.server_identity);
      dispatch({
        type: INIT_GROUP,
        group: group,
        requested_rid: requested_rid
      });
    }
    return ci.reviveUser(group_data.wif, group_data.username).then(
      (group: any) => {
        return new Promise((resolve, reject) => {
          var requested_rid = ci.generate_rid(group, state.ws.server_identity);
          dispatch({
            type: INIT_GROUP,
            group: group,
            requested_rid: requested_rid
          });
          var private_group = null;
          if (private_group_data) {
            private_group = ci.reviveUser(private_group_data.wif, private_group_data.username)
          }
          return resolve(private_group);
        });
      }
    )
    .then((private_group: any) => {
      if(private_group) {
        var requested_rid = ci.generate_rid(private_group, state.ws.server_identity);
        saveGroup(private_group, requested_rid);
        dispatch({
          type: INIT_GROUP,
          group: private_group,
          requested_rid: requested_rid
        });
      }
    })
    .catch((err: any) => {
      console.log(err);
    })
  }
};

export const getGroups = () => {
  var groups = window.localStorage.getItem('groups');
  if (groups) {
    groups = JSON.parse(groups);
  } else {
    groups = {};
  }
  return groups;
}

export const saveGroup = (group: any, requested_rid: any) => {
  var state = store.getState()
  var ci = new CenterIdentity();
  var groups = window.localStorage.getItem('groups');
  if (groups) {
    groups = JSON.parse(groups);
  } else {
    groups = {};
  }
  groups[requested_rid] = ci.toObject(group);
  window.localStorage.setItem('groups', JSON.stringify(groups));
  return {
    type: ADD_GROUP,
    group: group,
    requested_rid: requested_rid
  }
}

export const addGroup = (group: any) => {
  var state = store.getState()
  var ci = new CenterIdentity();
  var requested_rid = ci.generate_rid(group, state.ws.server_identity);
  saveGroup(group, requested_rid);
  return (dispatch: any) => {
    return new Promise((resolve, reject) => {
      dispatch({
        type: ADD_GROUP,
        group: group,
        requested_rid: requested_rid
      });
      return resolve();
    });
  }
};

export const createGroup = (groupName: any, password: any) => {
  var state = store.getState()
  var ci = new CenterIdentity();
  if (groupName === '') return;
  return (dispatch: any) => {
    if (groupName.substr(0,1) !== '#') {
      groupName = '#' + groupName;
    }
    groupName = groupName + ':' + password;
    return ci.reviveUser('KydUVG4w2ZSQkg6DAZ4UCEbfZz9Tg4PsjJFnvHwFsfmRkqXAHN8W', groupName)
    .then((group: any) => {
      var requested_rid = ci.generate_rid(group, state.ws.server_identity);
      dispatch({
        type: ADD_GROUP,
        group: group,
        requested_rid: requested_rid
      });
      return group;
    });
  }
}
