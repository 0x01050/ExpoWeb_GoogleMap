//@ts-ignore
import CenterIdentity from 'centeridentity';
import { INIT_ACTIVE_IDENTITY_CONTEXT, CHANGE_ACTIVE_IDENTITY_CONTEXT } from './types';
import store from '../store';
import { send } from './WebsocketActions'
import { GiftedChat } from 'react-native-gifted-chat'


export const initActiveIdentityContext = () => {
  var group_data = {
    "username": "group",
    "username_signature": "MEUCIQDIlC+SpeLwUI4fzV1mkEsJCG6HIvBvazHuMMNGuVKi+gIgV8r1cexwDHM3RFGkP9bURi+RmcybaKHUcco1Qu0wvxw=",
    "public_key": "036f99ba2238167d9726af27168384d5fe00ef96b928427f3b931ed6a695aaabff", 
    "wif":"KydUVG4w2ZSQkg6DAZ4UCEbfZz9Tg4PsjJFnvHwFsfmRkqXAHN8W"
  }  
  return {
    type: INIT_ACTIVE_IDENTITY_CONTEXT,
    identity: group_data
  };
};

export const changeActiveIdentityContext = (identity: any) => {

  return {
    type: CHANGE_ACTIVE_IDENTITY_CONTEXT,
    identity: identity
  };

}
