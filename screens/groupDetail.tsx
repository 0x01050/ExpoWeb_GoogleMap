import * as React from 'react';
import { StyleSheet, Pressable, TextInput, ScrollView, Button } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import EditScreenInfo from '../components/EditScreenInfo';
import { Text, View } from '../components/Themed';
//@ts-ignore
import CenterIdentity from 'centeridentity';
import store from '../store';
import { 
  GiftedChat,
  Actions,
  ActionsProps,
} from 'react-native-gifted-chat'
import { sendChat } from '../actions/ChatActions';
import * as ImagePicker from 'expo-image-picker';


class GroupDetail extends React.Component {

  pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log(result);

    if (!result.cancelled) {
      this.handleImagePicked(result.uri);
    }
  };
  
  handleImagePicked = async (pickerResult: any) => {
    let uploadResponse, uploadResult;

    try {
      // this.setState({
      //   uploading: true
      // });

      if (!pickerResult.cancelled) {
        uploadResponse = await this.uploadImageAsync(pickerResult);
        uploadResult = await uploadResponse.json();

        this.props.sendChat([{
          image: 'https://siasky.net/' + uploadResult.skylink,
          createdAt: new Date(),
          user: {
            _id: this.props.me.identity.username_signature,
            name: this.props.me.identity.username
          }
        }])
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
          ['Send Image']: this.pickImage,
        }}
        icon={() => (
          <Ionicons name='md-attach' size={28} />
        )}
        onSend={args => console.log(args)}
      />
    )
  }

  render() {
    return (
      <View style={styles.container}>
        <GiftedChat
          messages={this.props.chat.chats}
          onSend={this.props.sendChat}
          user={{
            _id: this.props.me.identity.username_signature,
            name: this.props.me.identity.username,
          }}
          renderActions={this.renderActions}
          lightboxProps={{backgroundColor: 'black'}}
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
  }, dispatch)
);

const mapStateToProps = (state: any) => {
  const { ws, me, chat } = state
  return { ws, me, chat }
};


export default connect(mapStateToProps, mapDispatchToProps)(GroupDetail);
