//@ts-ignore
import CenterIdentity from 'centeridentity';
import { INIT_FRIENDS } from './types';
import store from '../store';

export const initFriend = () => {
  var state = store.getState()
  var ci = new CenterIdentity();
  var friends = localStorage.getItem('friends');
  if (friends) {
    var friendsList = JSON.parse(friends);
    for (const property in friendsList) {
        try {
          friendsList[property].relationship = JSON.parse(ci.decrypt(state.me.identity.wif, friendsList[property].relationship));
        } catch(err) {
            continue
        }
    }
    return {
      type: INIT_FRIENDS,
      friends: friendsList
    }
  } else {
    return {
      type: INIT_FRIENDS,
      friends: {}
    }
  }
};
