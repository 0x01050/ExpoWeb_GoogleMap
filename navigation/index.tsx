import { createStackNavigator } from '@react-navigation/stack';
import * as React from 'react';
import { ColorSchemeName } from 'react-native';

import NotFoundScreen from '../screens/NotFoundScreen';
import { RootStackParamList } from '../types';
import { GroupDetailNavigator } from './BottomTabNavigator';
import LinkingConfiguration from './LinkingConfiguration';
import { createDrawerNavigator } from '@react-navigation/drawer';
import DrawerContent from './drawerContent';
import { DefaultTheme, DarkTheme } from '@react-navigation/native';
import { NavigationContainer } from '@react-navigation/native';

const Drawer = createDrawerNavigator();

export default function RootNavigator() {
  return (
    <NavigationContainer theme={DarkTheme}>
      <Drawer.Navigator drawerContent={props => <DrawerContent {...props} />}>
        <Drawer.Screen name="Home" component={GroupDetailNavigator} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}
