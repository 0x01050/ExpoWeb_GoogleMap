import * as React from 'react';
import { 
  StyleSheet, 
  Pressable, 
  TextInput, 
  ScrollView,
  Button,
  Modal,
  Linking,
  TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import EditScreenInfo from '../components/EditScreenInfo';
import { Text, View } from '../components/Themed';
//@ts-ignore
import CenterIdentity from 'centeridentity';
import { 
  GiftedChat,
  Actions,
  ActionsProps,
} from 'react-native-gifted-chat'
import { sendChat } from '../actions/ChatActions';
import { addFriend } from '../actions/FriendActions';
import { changeActiveIdentityContext } from '../actions/ActiveIdentityContextActions';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import { Appbar, Avatar, useTheme } from 'react-native-paper';
import { DrawerNavigationProp } from '@react-navigation/drawer';



class GroupDetail extends React.Component {
  constructor(props: any) {
    super(props)
    this.props.chat.chats["MEUCIQDIlC+SpeLwUI4fzV1mkEsJCG6HIvBvazHuMMNGuVKi+gIgV8r1cexwDHM3RFGkP9bURi+RmcybaKHUcco1Qu0wvxw="] = [];
    this.state = {
      activeUser: this.props.groups.active_group,
      messages: this.props.chat.chats["MEUCIQDIlC+SpeLwUI4fzV1mkEsJCG6HIvBvazHuMMNGuVKi+gIgV8r1cexwDHM3RFGkP9bURi+RmcybaKHUcco1Qu0wvxw="]
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
  
    let apiUrl = 'http://71.193.201.21:8005/sia-upload?filename=file.' + fileType;
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

  render() {
    var ci = new CenterIdentity();
    var picker_groups = []
    for (const username_signature in this.props.groups.groups) {
      picker_groups.push(<Picker.Item key={username_signature} label={this.props.groups.groups[username_signature].username} value={username_signature} />)
    }
    return (
      <View style={styles.container}>
        <GiftedChat
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
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    changeActiveIdentityContext
  }, dispatch)
);

const mapStateToProps = (state: any) => {
  const { ws, me, chat, friends, groups, activeIdentityContext } = state
  return { ws, me, chat, friends, groups, activeIdentityContext }
};


export default connect(mapStateToProps, mapDispatchToProps)(GroupDetail);
