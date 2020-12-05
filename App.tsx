import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import {
  Provider as PaperProvider,
  DefaultTheme,
  DarkTheme,
} from 'react-native-paper';

import useCachedResources from './hooks/useCachedResources';
import useColorScheme from './hooks/useColorScheme';
import RootNavigator from './navigation';
import store from './store';
import { initWs } from './actions/WebsocketActions';
import { initMe } from './actions/MeActions';
import { initFriend } from './actions/FriendActions';
import { initChat } from './actions/ChatActions';
import { initActiveIdentityContext } from './actions/ActiveIdentityContextActions';


export default class App extends React.Component {
  render() {
    store.dispatch(initMe())
    .then(() => {
      return store.dispatch(initWs());
    })
    const colorScheme = useColorScheme();
    return (
      <Provider store={store}>
        <SafeAreaProvider>
          <PaperProvider
            theme={
              //theme === 'light' //convert to redux var
                //? {
                  //   ...DefaultTheme,
                  //   colors: { ...DefaultTheme.colors, primary: '#1ba1f2' },
                  // }
                 {
                    ...DarkTheme,
                    colors: { ...DarkTheme.colors, primary: '#1ba1f2' },
                  }
            }
          >
            <RootNavigator />
          </PaperProvider>
        </SafeAreaProvider>
      </Provider>
    );
  }
}
