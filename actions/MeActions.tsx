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
          return new Promise((resolve, reject) => {
            dispatch({
              type: INIT_ME,
              identity: user
            });
            return resolve();
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
          return new Promise((resolve, reject) => {
            dispatch({
              type: INIT_ME,
              identity: user
            });
            return resolve();
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
