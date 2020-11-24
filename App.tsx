import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';

import useCachedResources from './hooks/useCachedResources';
import useColorScheme from './hooks/useColorScheme';
import Navigation from './navigation';
import store from './store';
import { initWs } from './actions/WebsocketActions';
import { initMe } from './actions/MeActions';
import { initFriend } from './actions/FriendActions';
import { initGroup } from './actions/GroupActions';


export default class App extends React.Component {
  render() {
    store.dispatch(initWs());
    store.dispatch(initMe());
    store.dispatch(initFriend());
    store.dispatch(initGroup());
    const colorScheme = useColorScheme();
    return (
      <Provider store={store}>
        <SafeAreaProvider>
          <Navigation colorScheme={colorScheme} />
          <StatusBar />
        </SafeAreaProvider>
      </Provider>
    );
  }
}
