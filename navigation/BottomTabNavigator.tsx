import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import * as React from 'react';

import Colors from '../constants/Colors';
import useColorScheme from '../hooks/useColorScheme';
import GroupDetailScreen from '../screens/groupDetail';
import IdentityScreen from '../screens/Identity';
import { BottomTabParamList, GroupDetailParamList, GroupsParamList } from '../types';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { DefaultTheme, DarkTheme } from '@react-navigation/native';
import { Appbar, Avatar, useTheme } from 'react-native-paper';
import DrawerContent from './drawerContent';

const BottomTab = createBottomTabNavigator<BottomTabParamList>();

const Drawer = createDrawerNavigator();

function BottomTabNavigator() {
  const colorScheme = useColorScheme();

  return (
    <NavigationContainer theme={DarkTheme}>
      <Drawer.Navigator drawerContent={props => <DrawerContent {...props} />}>
        <Drawer.Screen name="Home" component={StackNavigator} />
      </Drawer.Navigator>
    </NavigationContainer>
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

export const GroupDetailNavigator = () => {
  const theme = useTheme();
  return (
    <GroupDetailStack.Navigator
    screenOptions={{
      header: ({ scene, previous, navigation }) => {
        const { options } = scene.descriptor;
        const title =
          options.headerTitle !== undefined
            ? options.headerTitle
            : options.title !== undefined
            ? options.title
            : scene.route.name;

        return (
          <Appbar.Header
            theme={{ colors: { primary: theme.colors.surface } }}
          >
            {previous ? (
              <Appbar.BackAction
                onPress={navigation.goBack}
                color={theme.colors.primary}
              />
            ) : (
              <TouchableOpacity
                style={{ marginLeft: 10 }}
                onPress={() => {
                  ((navigation as any) as DrawerNavigationProp<{}>).openDrawer();
                }}
              >
                <Avatar.Image
                  size={40}
                  source={{
                    uri:
                      'https://yadacoin.io/app/assets/img/yadacoinlogosmall.png',
                  }}
                />
              </TouchableOpacity>
            )}
            <Appbar.Content
              title={
                title === 'Feed' ? (
                  <MaterialCommunityIcons
                    style={{ marginRight: 10 }}
                    name="twitter"
                    size={40}
                    color={theme.colors.primary}
                  />
                ) : (
                  title
                )
              }
              titleStyle={{
                fontSize: 18,
                fontWeight: 'bold',
                color: theme.colors.primary,
              }}
            />
          </Appbar.Header>
        );
      },
    }}>
      <GroupDetailStack.Screen
        name="GroupDetailScreen"
        component={GroupDetailScreen}
        options={{ headerTitle: 'Chat' }}
      />
    </GroupDetailStack.Navigator>
  );
}

const GroupsStack = createStackNavigator<GroupsParamList>();

function GroupsNavigator() {
  return (
    <GroupsStack.Navigator
    >
      <GroupsStack.Screen
        name="IdentityScreen"
        component={IdentityScreen}
        options={{ headerTitle: 'Yada - Identity' }}
      />
    </GroupsStack.Navigator>
  );
}
