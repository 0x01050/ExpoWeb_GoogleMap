import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  DrawerContentComponentProps,
  DrawerContentOptions,
  DrawerContentScrollView,
  DrawerItem,
} from '@react-navigation/drawer';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import {
  Avatar,
  Caption,
  Drawer,
  Paragraph,
  Switch,
  Text,
  Title,
  TouchableRipple,
  List
} from 'react-native-paper';
import Animated from 'react-native-reanimated';
import CenterIdentity from 'centeridentity';
import { bindActionCreators } from 'redux';
import { changeActiveIdentityContext } from '../actions/ActiveIdentityContextActions';
import { connect } from 'react-redux';

var ci = new CenterIdentity();

class DrawerContent extends React.Component {
  constructor(props: any) {
    super(props);
    console.log(props)
  }
  choose = (itemValue) => {
      if (this.props.groups.groups[itemValue]) {
        var identity = this.props.groups.groups[itemValue];
        this.props.changeActiveIdentityContext(identity, itemValue, true);
        var id = identity.username_signature;
      } else if (this.props.friends.friends[itemValue]) {
        var identity = this.props.friends.friends[itemValue];
        this.props.changeActiveIdentityContext(identity, itemValue, false);
      } else {
        this.props.changeActiveIdentityContext(this.props.me.identity, itemValue, true);
      }
      var id = itemValue;
      if (!this.props.chat.chats[id]) {
        this.props.chat.chats[id] = [];
      }
      this.props.navigation.toggleDrawer();
  }
  render() {

    var picker_groups = []
    for (const rid in this.props.groups.groups) {
      picker_groups.push(<List.Item key={rid} title={'#' + this.props.groups.groups[rid].username} onPress={() => {
        this.choose(rid);
      }} />)
    }

    var friends = []
    for (const rid in this.props.friends.friends) {
      friends.push(<List.Item key={rid} title={'@' + this.props.friends.friends[rid].username} onPress={() => {
        this.choose(rid);
      }} />)
    }
    return (
      <DrawerContentScrollView {...this.props}>
        <Animated.View
          //@ts-ignore
          style={[
            styles.drawerContent,
          ]}
        >
          <View style={styles.userInfoSection}>
            <TouchableOpacity
              style={{ marginLeft: 10 }}
              onPress={() => {
                props.navigation.toggleDrawer();
              }}
            >
              <Avatar.Image
                source={{
                  uri:
                    'https://yadacoin.io/app/assets/img/yadacoinlogosmall.png',
                }}
                size={50}
              />
            </TouchableOpacity>
            <Title style={styles.title}>Matt Vogel</Title>
            <Caption style={styles.caption}>@yadablockchain</Caption>
            <View style={styles.row}>
              <View style={styles.section}>
                <Paragraph style={[styles.paragraph, styles.caption]}>
                  202
                </Paragraph>
                <Caption style={styles.caption}>Followers</Caption>
              </View>
              <View style={styles.section}>
                <Paragraph style={[styles.paragraph, styles.caption]}>
                  159
                </Paragraph>
                <Caption style={styles.caption}>Following</Caption>
              </View>
            </View>
          </View>
          <Drawer.Section style={styles.drawerSection}>
            <DrawerItem
              icon={({ color, size }) => (
                <MaterialCommunityIcons
                  name="account-outline"
                  color={color}
                  size={size}
                />
              )}
              label="Profile"
              onPress={() => {}}
            />
            <DrawerItem
              icon={({ color, size }) => (
                <MaterialCommunityIcons name="tune" color={color} size={size} />
              )}
              label="Preferences"
              onPress={() => {}}
            />
            <DrawerItem
              icon={({ color, size }) => (
                <MaterialCommunityIcons
                  name="bookmark-outline"
                  color={color}
                  size={size}
                />
              )}
              label="Bookmarks"
              onPress={() => {}}
            />
          </Drawer.Section>
          <Drawer.Section title="Preferences">
            <TouchableRipple >
              <View style={styles.preference}>
                <Text>Dark Theme</Text>
                <View pointerEvents="none">
                  <Switch value={true} />
                </View>
              </View>
            </TouchableRipple>
          </Drawer.Section>
          <Drawer.Section title="Groups">
            <List.AccordionGroup>
              <List.Accordion title="Groups" id="1">
                {picker_groups}
              </List.Accordion>
              <List.Accordion title="Friends" id="2">
                {friends}
              </List.Accordion>
              <List.Accordion title="Me" id="3">
                {<List.Item key={this.props.me.identity.username_signature} title={'#' + this.props.me.identity.username} onPress={() => {
                  this.choose(this.props.me.identity.username_signature);
                }} />}
              </List.Accordion>
            </List.AccordionGroup>
          </Drawer.Section>
          <Drawer.Section title="Friends">
          </Drawer.Section>
        </Animated.View>
      </DrawerContentScrollView>
    );
  }
}

const styles = StyleSheet.create({
  drawerContent: {
    flex: 1,
  },
  userInfoSection: {
    paddingLeft: 20,
  },
  title: {
    marginTop: 20,
    fontWeight: 'bold',
  },
  caption: {
    fontSize: 14,
    lineHeight: 14,
  },
  row: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  section: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  paragraph: {
    fontWeight: 'bold',
    marginRight: 3,
  },
  drawerSection: {
    marginTop: 15,
  },
  preference: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
});

const mapDispatchToProps = (dispatch: any) => (
  bindActionCreators({
    changeActiveIdentityContext
  }, dispatch)
);

const mapStateToProps = (state: any) => {
  const { ws, me, chat, friends, groups, activeIdentityContext } = state
  return { ws, me, chat, friends, groups, activeIdentityContext }
};


export default connect(mapStateToProps, mapDispatchToProps)(DrawerContent);
