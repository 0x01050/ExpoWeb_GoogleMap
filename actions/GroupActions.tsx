//@ts-ignore
import CenterIdentity from 'centeridentity';
import { INIT_GROUP, CHANGE_GROUP, ADD_GROUP } from './types';
import store from '../store';

export const initGroup = () => {
  var state = store.getState()
  var ci = new CenterIdentity();
  var group_data = {
    "username": "group",
    "username_signature": "MEUCIQDIlC+SpeLwUI4fzV1mkEsJCG6HIvBvazHuMMNGuVKi+gIgV8r1cexwDHM3RFGkP9bURi+RmcybaKHUcco1Qu0wvxw=",
    "public_key": "036f99ba2238167d9726af27168384d5fe00ef96b928427f3b931ed6a695aaabff", 
    "wif":"KydUVG4w2ZSQkg6DAZ4UCEbfZz9Tg4PsjJFnvHwFsfmRkqXAHN8W"
  }
  return (dispatch: any) => {
    return ci.reviveUser(group_data.wif, group_data.username).then(
      (group: any) => {
        var requested_rid = ci.generate_rid(group, state.ws.server_identity);
        return new Promise((resolve, reject) => {
          dispatch({
            type: INIT_GROUP,
            group: group,
            requested_rid: requested_rid
          });
          return resolve();
        });
      }, 
      (err: any) => {
        return err;
      }
    )
  }
};

export const addGroup = (group: any) => {
  var state = store.getState()
  var ci = new CenterIdentity();
  var requested_rid = ci.generate_rid(group, state.ws.server_identity);
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
