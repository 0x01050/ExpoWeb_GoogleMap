//@ts-ignore
import CenterIdentity from 'centeridentity';
import { INIT_GROUP, CHANGE_GROUP } from './types';

export const initGroup = () => {
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
        return dispatch({
          type: INIT_GROUP,
          active_group: group
        });
      }, 
      (err: any) => {
        return err;
      }
    )
  }
};

export const changeGroup = (group: any) => {
  return {
    type: CHANGE_GROUP,
    active_group: group
  }
}
