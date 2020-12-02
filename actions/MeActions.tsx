//@ts-ignore
import CenterIdentity from 'centeridentity';
import { INIT_ME } from './types';

export const initMe = () => {
  var ci = new CenterIdentity();
  var wif = window.localStorage.getItem('wif');
  if (wif) {
    var username = window.localStorage.getItem('username');
    return (dispatch: any) => {
      return ci.reviveUser(wif, username).then(
        (user: any) => {
          return dispatch({
            type: INIT_ME,
            identity: user
          });
        }, 
        (err: any) => {
          return err;
        }
      )
    }
  } else {
    return (dispatch: any) => {
      return ci.createUser('username').then(
        (user: any) => {
          window.localStorage.setItem('wif', user.wif);
          window.localStorage.setItem('username', user.username);
          return dispatch({
            type: INIT_ME,
            identity: user
          });
        }, 
        (err: any) => {
          return err;
        }
      )
    }
  }
  return 
};
