import * as React from 'react';
import { StyleSheet, ScrollView, TextInput } from 'react-native';

import EditScreenInfo from '../components/EditScreenInfo';
import { Text, View } from '../components/Themed';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

//@ts-ignore
import CenterIdentity from 'centeridentity';
import * as ImagePicker from 'expo-image-picker';
import store from '../store';

// import MapBox from 'react-native-web-mapbox';
import {Helmet} from "react-helmet";

class Identity extends React.Component {
  constructor(props: any) {
    super(props)
    this.state = {
      activeUser: ''
    }
  }

  initCenterWebsocket= () => {
    console.log(store.getState());
  }

  render() {
    const { activeUser } = this.state;
    return (
      <View style={styles.container}>
        <Text>Export identity</Text>
        <TextInput value={this.props.me.identity.wif}></TextInput>
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
  map: {
    flex: 1
  }
});

const mapDispatchToProps = (dispatch: any) => (
  bindActionCreators({
  }, dispatch)
);

const mapStateToProps = (state: any) => {
  const { me, } = state
  return { me, }
};


export default connect(mapStateToProps, mapDispatchToProps)(Identity);
