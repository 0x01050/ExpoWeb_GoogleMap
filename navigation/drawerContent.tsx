import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  DrawerContentComponentProps,
  DrawerContentOptions,
  DrawerContentScrollView,
  DrawerItem,
} from '@react-navigation/drawer';
import React from 'react';
import { StyleSheet, TouchableOpacity, View, TouchableHighlight} from 'react-native';
import {
  Avatar,
  Caption,
  Drawer,
  Paragraph,
  Switch,
  Text,
  Title,
  TouchableRipple,
  List,
  TextInput
} from 'react-native-paper';
import Animated from 'react-native-reanimated';
import CenterIdentity from 'centeridentity';
import { bindActionCreators } from 'redux';
import { changeActiveIdentityContext } from '../actions/ActiveIdentityContextActions';
import { createGroup, saveGroup } from '../actions/GroupActions';
import { connect } from 'react-redux';
import store from '../store';

var ci = new CenterIdentity();

class DrawerContent extends React.Component {
  constructor(props: any) {
    super(props);
    console.log(props);
    this.state = {
      modalVisible: false,
      groupName: '',
      groupPass: ''
    }
  }

  componentDidUpdate() {
    let state = store.getState();
    var ci = new CenterIdentity();
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
  onGroupNameChange = (text: any) => {
    this.setState({...this.state, groupName: text})
  }
  onGroupPassChange = (text: any) => {
    this.setState({...this.state, groupPass: text})
  }
  render() {

    var picker_groups = []
    for (const rid in this.props.groups.groups) {
      picker_groups.push(
      <List.Item
        key={rid}
        title={this.props.groups.groups[rid].username}
        onPress={() => {
          this.choose(rid);
        }}
        description={this.props.activeIdentityContext.rid === rid ? 'Active' : '0 Users online'}
        style={{cursor: 'pointer'}}
        left={(props) => <List.Icon {...props} icon="group" />}
      />)
    }

    var friends = []
    for (const rid in this.props.friends.friends) {
      if(!this.props.friends.friends[rid].online) continue;
      friends.push(
        <List.Item
          key={rid}
          title={this.props.friends.friends[rid].username}
          onPress={() => {
            this.choose(rid);
          }}
          description={this.props.activeIdentityContext.rid === rid ? 'Active' : (this.props.friends.friends[rid].online ? 'Online': 'Offline')}
          style={{cursor: 'pointer'}}
          left={(props) => <List.Icon {...props} icon="group" color={this.props.friends.friends[rid].online ? '#ADFF2F' : 'grey'} />}
        />
      )
    }
    for (const rid in this.props.friends.friends) {
      if(this.props.friends.friends[rid].online) continue;
      friends.push(
        <List.Item
          key={rid}
          title={this.props.friends.friends[rid].username}
          onPress={() => {
            this.choose(rid);
          }}
          description={this.props.activeIdentityContext.rid === rid ? 'Active' : (this.props.friends.friends[rid].online ? 'Online': 'Offline')}
          style={{cursor: 'pointer'}}
          left={(props) => <List.Icon {...props} icon="group" color={this.props.friends.friends[rid].online ? '#ADFF2F' : 'grey'} />}
        />
      )
    }
    let state = store.getState();
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
                this.props.navigation.toggleDrawer();
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
            <Title style={styles.title}>{this.props.me.identity.username}</Title>
            {/* <Caption style={styles.caption}>@yadablockchain</Caption> */}
            <View style={styles.row}>
              <View style={styles.section}>
                <Paragraph style={[styles.paragraph, styles.caption]}>
                  {Object.keys(state.groups.groups).length}
                </Paragraph>
                <Caption style={styles.caption}>Groups</Caption>
              </View>
              <View style={styles.section}>
                <Paragraph style={[styles.paragraph, styles.caption]}>
                  {Object.keys(state.friends.friends).length}
                </Paragraph>
                <Caption style={styles.caption}>Friends</Caption>
              </View>
            </View>
          </View>
          {/* <Drawer.Section style={styles.drawerSection}>
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
          </Drawer.Section> */}
          <Drawer.Section title="Groups">
            <TextInput
              label="Group name"
              onChangeText={text => this.onGroupNameChange(text)}
            ></TextInput>
            <TextInput
              label="Group password"
              onChangeText={text => this.onGroupPassChange(text)}
            ></TextInput>
            <TouchableHighlight
              style={styles.openButton}
              onPress={async () => { 
                if(!this.state.groupName) return; 
                var group = await this.props.createGroup(this.state.groupName, this.state.groupPass);
                var requested_rid = ci.generate_rid(group, state.ws.server_identity)
                this.props.saveGroup(group, requested_rid);
                this.props.changeActiveIdentityContext(group, requested_rid, true);
                this.props.navigation.toggleDrawer();
                this.setState({...this.state,
                  groupName: '',
                  groupPass: ''
                })
              }}>
              <Text style={styles.textStyle}>Create Group</Text>
            </TouchableHighlight>
            <List.AccordionGroup>
              <List.Accordion title="Group discussions" id="1">
                {picker_groups}
              </List.Accordion>
              <List.Accordion title="Private conversations" id="2">
                {friends}
              </List.Accordion>
              <List.Accordion title="My group" id="3">
                {<List.Item
                  key={this.props.me.identity.username_signature}
                  title={this.props.me.identity.username} onPress={() => {
                    this.choose(this.props.me.identity.username_signature);
                  }}
                  description={this.props.activeIdentityContext.rid === this.props.me.identity.username_signature ? 'Active' : 'Online'}
                  style={{cursor: 'pointer'}}
                  left={(props) => <List.Icon {...props} icon="group" />}
                />}
              </List.Accordion>
            </List.AccordionGroup>
            <View>
              <a href="/logout?redirect=/"><Title style={styles.logout}>Sign out</Title></a>
            </View>
          </Drawer.Section>
        </Animated.View>
      </DrawerContentScrollView>
    );
  }
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  openButton: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
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
  logout: {
    paddingLeft: 20,
    marginTop: 20,
    fontWeight: 'bold',
    fontSize: 16
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
    changeActiveIdentityContext,
    createGroup,
    saveGroup
  }, dispatch)
);

const mapStateToProps = (state: any) => {
  const { ws, me, chat, friends, groups, activeIdentityContext } = state
  return { ws, me, chat, friends, groups, activeIdentityContext }
};


export default connect(mapStateToProps, mapDispatchToProps)(DrawerContent);
