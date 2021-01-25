import * as React from 'react';
import { 
  StyleSheet, 
  Pressable, 
  ScrollView,
  Modal,
  Linking,
  TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import EditScreenInfo from '../components/EditScreenInfo';
import { Text, View } from '../components/Themed';
import Feed from '../components/Feed';
import MapBox from '../components/MapBox';
//@ts-ignore
import CenterIdentity from 'centeridentity';
import { 
  GiftedChat,
  Actions,
  ActionsProps,
} from 'react-native-gifted-chat'
import { sendChat } from '../actions/ChatActions';
import { createGroup } from '../actions/GroupActions';
import { addFriend } from '../actions/FriendActions';
import { changeActiveIdentityContext } from '../actions/ActiveIdentityContextActions';
import { initMe } from '../actions/MeActions';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import { Appbar, Avatar, useTheme, TextInput, Switch, Caption, Button } from 'react-native-paper';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { Video } from 'expo-av';
import store from '../store';



class GroupDetail extends React.Component {
  constructor(props: any) {
    super(props);
    this.state = {
      username: '',
      chatOrFeed: window.location.hash.indexOf('|') === -1 ? false : true,
      context: ''
    }
  }

  createAvatar = () => {
    const canvas = document.createElement('canvas');
    var ctx: any = canvas.getContext('2d');
    var imageData = ctx.createImageData(100,100);
    ctx.putImageData(imageData, 20, 20);
    document.getElementsByTagName('body').append(canvas)
  }

  pickVideo = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log(result);

    if (!result.cancelled) {
      this.handleImagePicked(result.uri, 'video');
    }
  };

  pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log(result);

    if (!result.cancelled) {
      this.handleImagePicked(result.uri, 'image');
    }
  };
  
  handleImagePicked = async (pickerResult: any, type: any) => {
    let uploadResponse, uploadResult;

    try {
      // this.setState({
      //   uploading: true
      // });

      if (!pickerResult.cancelled) {
        uploadResponse = await this.uploadImageAsync(pickerResult);
        uploadResult = await uploadResponse.json();

        let msg: any = {
          createdAt: new Date(),
          user: {
            _id: this.props.me.identity.username_signature,
            name: this.props.me.identity.username
          }
        }

        msg[type] = 'https://siasky.net/' + uploadResult.skylink;

        this.props.sendChat([msg])
      }
    } catch (e) {
      console.log({ uploadResponse });
      console.log({ uploadResult });
      console.log({ e });
      alert('Upload failed, sorry :(');
    } finally {
      this.setState({
        uploading: false
      });
    }
  }

  uploadImageAsync = async (pickerResult: any) => {
    console.log(pickerResult);
  
    // Note:
    // Uncomment this if you want to experiment with local server
    //
    // if (Constants.isDevice) {
    //   apiUrl = `https://your-ngrok-subdomain.ngrok.io/upload`;
    // } else {
    //   apiUrl = `http://localhost:3000/upload`
    // }
    let uriParts = pickerResult.split(',');
    let fileType = uriParts[0].split('/')[1].split(';')[0];
    let fileData = uriParts[uriParts.length - 1];
  
    let apiUrl = 'https://centeridentity.com/sia-upload?filename=file.' + fileType;
    let options = {
      method: 'POST',
      body: JSON.stringify({
        file: fileData
      }),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    };
  
    return fetch(apiUrl, options);
  }

  renderActions = (props: Readonly<ActionsProps>) => {
    return (
      <Actions
        {...props}
        options={{
          ['Image']: this.pickImage,
          ['Audio/Video']: this.pickVideo,
        }}
        icon={() => (
          <Ionicons name='md-attach' size={28} />
        )}
        onSend={args => console.log(args)}
      />
    )
  }

  handleUrlPress = (url: any) => {
    Linking.openURL(url);
  }
  
  renderMessageVideo(props: any) {
    console.log("videoprop:", props.currentMessage.video);
      return <View style={{ position: 'relative', height: 150, width: 250 }}>
  
      <Video
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        height: 150,
        width: 250,
        borderRadius: 20,
      }}
      useNativeControls={true}
      rate={1.0}
      resizeMode="cover"
      height={150}
      width={250}
      muted={true}
      source={{ uri: props.currentMessage.video }}
      allowsExternalPlayback={false}></Video>
  
      </View>
  }

  onUsernameChange = (text: any) => {
    this.setState({...this.state, username: text})
  }

  onSubmitUsername = () => {
    const {username} = this.state;
    window.localStorage.setItem('username', username);
    this.props.initMe().then(() => {window.location.reload()});
  }

  setChatOrFeed = (value: any) => {
    this.setState({...this.state,
      chatOrFeed: value
    })
  }

  setStatus = (status: any) => {
    var state = store.getState();
    var ci = new CenterIdentity();
    var pathString = this.props.activeIdentityContext.identity.username.split('|').slice(0,2).join('|') + '|' + status;
    var group = this.props.createGroup(pathString)
    .then((group:any) => {
      var requested_rid = ci.generate_rid(group, state.ws.server_identity)
      this.props.changeActiveIdentityContext(group, requested_rid, true);
      this.props.chat.chats[this.props.activeIdentityContext.rid] = this.props.chat.chats[this.props.activeIdentityContext.rid]
    });
  }

  goBack = () => {
    var state = store.getState();
    var ci = new CenterIdentity();
    var pathString = this.props.activeIdentityContext.identity.username.split('|')[0];
    var group = this.props.createGroup(pathString)
    .then((group:any) => {
      var requested_rid = ci.generate_rid(group, state.ws.server_identity)
      this.props.changeActiveIdentityContext(group, requested_rid, true);
      this.props.chat.chats[this.props.activeIdentityContext.rid] = this.props.chat.chats[this.props.activeIdentityContext.rid]
      const { chatOrFeed } = this.state;
      this.setState({
        ...this.state,
        chatOrFeed: false
      })
    });
  }

  render() {
    var ci = new CenterIdentity();
    var picker_groups = []
    for (const username_signature in this.props.groups.groups) {
      picker_groups.push(<Picker.Item key={username_signature} label={this.props.groups.groups[username_signature].username} value={username_signature} />)
    }
    let insertable = null;
    const { chatOrFeed } = this.state;
    if(chatOrFeed) {
      insertable =  <GiftedChat
        onPressAvatar={this.props.addFriend}
        messages={this.props.chat.chats[this.props.activeIdentityContext.rid]}
        onSend={this.props.sendChat}
        user={{
          _id: this.props.me.identity.username_signature,
          name: this.props.me.identity.username,
          username: this.props.me.identity.username,
          username_signature: this.props.me.identity.username_signature,
          public_key: this.props.me.identity.public_key,
        }}
        renderActions={this.renderActions}
        parsePatterns={(linkStyle) => [
          { type: 'url', style: styles.url, onPress: this.handleUrlPress },
        ]}
        renderMessageVideo={this.renderMessageVideo}
      />
    } else {
      insertable = <Feed 
        setChatOrFeed={this.setChatOrFeed}
      />;
    }
    var username = '';
    if(this.props.activeIdentityContext.identity.username) {
      username = this.props.activeIdentityContext.identity.username;
      username = username ? username.split('|')[0] : '';
      var wif = this.props.activeIdentityContext.identity.wif;
      var txn = '';
      if(this.props.activeIdentityContext.identity.username.split('|')[1] && this.state.context.length === 0) {
        fetch('https://centeridentity.com/get-transaction-by-id?id=' + this.props.activeIdentityContext.identity.username.split('|')[1])
        .then((response) => {
          return response.json()
        })
        .then((tx: any) => {
          txn = tx;
          return ci.reviveUser(wif, username);
        })
        .then((root_group: any) => {
          return ci.decrypt(root_group.username_signature, txn.relationship);
        })
        .then((str: any) => {
          this.setState({
            ...this.state,
            context: JSON.parse(str)['postText']['text']
          })
        })
      }
    }
    return (
      <View style={styles.container}>
        <MapBox
          option={{
            style: 'mapbox://v1/mapbox/streets-v11',
            center: [-100.436, 30.771], // starting position
            zoom: 2 // starting zoom
          }}
          width={1024} height={512}
          accessToken='pk.eyJ1IjoiY2VudGVyaWRlbnRpdHkiLCJhIjoiY2s4ODNwc3NvMDBmZjNncTgwcmh0azQ2ZyJ9.6GRQpQRda2DinJXWNhfMNA'
        />
        {/* {window.location.hash.indexOf('|') > 0 && 
        <View style={{maxHeight: 100, flex: 1, flexDirection: 'row', flexWrap: 'wrap'}}>
          <Button
            mode='outlined'
            onPress={() => {
              this.goBack();
            }}
          >&lt;Back</Button>
          <Button
            mode='outlined'
            onPress={() => {
              this.setStatus('going');
            }}
          >I'm going</Button>
          <Button
            onPress={() => {
              this.setStatus('omw');
            }}
          >I'm on my way</Button>
          <Button
            onPress={() => {
              this.setStatus('here');
            }}
          >I'm here</Button>
          <Button
            onPress={() => {
              this.setStatus('exec');
            }}
          >I'm executing plan</Button>
          <Button
            onPress={() => {
              this.setStatus('left');
            }}
          >I left</Button>
        </View>}
        {this.props.me.identity.username ? insertable : 
            <TextInput
              label="Username"
              onChangeText={text => this.onUsernameChange(text)}
              onSubmitEditing={() => this.onSubmitUsername()}
            ></TextInput>
        } */}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    flexWrap: 'wrap'
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});

const mapDispatchToProps = (dispatch: any) => (
  bindActionCreators({
    sendChat,
    addFriend,
    changeActiveIdentityContext,
    initMe,
    createGroup
  }, dispatch)
);

const mapStateToProps = (state: any) => {
  const { ws, me, chat, feed, friends, groups, activeIdentityContext } = state
  return { ws, me, chat, feed, friends, groups, activeIdentityContext }
};


export default connect(mapStateToProps, mapDispatchToProps)(GroupDetail);
