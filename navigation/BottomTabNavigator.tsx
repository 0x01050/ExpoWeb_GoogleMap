import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import * as React from 'react';

import Colors from '../constants/Colors';
import useColorScheme from '../hooks/useColorScheme';
import GroupDetailScreen from '../screens/groupDetail';
import IdentityScreen from '../screens/Identity';
import { BottomTabParamList, GroupDetailParamList, GroupsParamList } from '../types';

const BottomTab = createBottomTabNavigator<BottomTabParamList>();

export default function BottomTabNavigator() {
  const colorScheme = useColorScheme();

  return (
    <BottomTab.Navigator
      initialRouteName="Chat"
      tabBarOptions={{ activeTintColor: Colors[colorScheme].tint }}>
      <BottomTab.Screen
        name="Chat"
        component={GroupDetailNavigator}
        options={{
          tabBarIcon: ({ color }) => <TabBarIcon name="md-contacts" color={color} />,
        }}
      />
      <BottomTab.Screen
        name="Identity"
        component={GroupsNavigator}
        options={{
          tabBarIcon: ({ color }) => <TabBarIcon name="ios-code" color={color} />,
        }}
      />
    </BottomTab.Navigator>
  );
}

// You can explore the built-in icon families and icons on the web at:
// https://icons.expo.fyi/
function TabBarIcon(props: { name: string; color: string }) {
  return <Ionicons size={30} style={{ marginBottom: -3 }} {...props} />;
}

// Each tab has its own navigation stack, you can read more about this pattern here:
// https://reactnavigation.org/docs/tab-based-navigation#a-stack-navigator-for-each-tab
const GroupDetailStack = createStackNavigator<GroupDetailParamList>();

function GroupDetailNavigator() {
  return (
    <GroupDetailStack.Navigator>
      <GroupDetailStack.Screen
        name="GroupDetailScreen"
        component={GroupDetailScreen}
        options={{ headerTitle: 'Yada - Chat' }}
      />
    </GroupDetailStack.Navigator>
  );
}

const GroupsStack = createStackNavigator<GroupsParamList>();

function GroupsNavigator() {
  return (
    <GroupsStack.Navigator>
      <GroupsStack.Screen
        name="IdentityScreen"
        component={IdentityScreen}
        options={{ headerTitle: 'Yada - Identity' }}
      />
    </GroupsStack.Navigator>
  );
}
