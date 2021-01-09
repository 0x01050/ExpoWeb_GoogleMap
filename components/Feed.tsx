import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { View , StyleSheet} from 'react-native';
import { Avatar, Button, Card, Title, Paragraph, TextInput, Text } from 'react-native-paper';
import { Item } from 'react-native-paper/lib/typescript/src/components/List/List';
import Post from '../components/Post';
import { sendPost } from '../actions/FeedActions'
import CenterIdentity from 'centeridentity';


class Feed extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      message: ''
    }
  }

  likePost = (item: any) => {

  }

  sharePost = (item: any) => {

  }

  onPostChange = (text: any) => {
    this.setState({...this.state, message: text})
  }

  onSubmitPost = () => {
    var ci = new CenterIdentity();
    const { message } = this.state;
    this.props.sendPost({
      ...ci.toObject(this.props.me.identity),
      text: message
    }, 'postText');
    this.setState({...this.state, message: ''})
  }

  render() {
    const { setChatOrFeed } = this.props;
    if (!this.props.feed.posts[this.props.activeIdentityContext.rid]) this.props.feed.posts[this.props.activeIdentityContext.rid] = [];
    this.props.feed.posts[this.props.activeIdentityContext.rid].sort((a:any , b:any) => b.time - a.time)
    let posts = [];
    for (let i=0; i < this.props.feed.posts[this.props.activeIdentityContext.rid].length; i++) {
      var item = this.props.feed.posts[this.props.activeIdentityContext.rid][i];
      this.props.feed.comments[this.props.activeIdentityContext.rid] = this.props.feed.comments[this.props.activeIdentityContext.rid] || {};
      var comments = this.props.feed.comments[this.props.activeIdentityContext.rid][item.id] || [];
      posts.push(<Post
        item={item}
        comments={comments}
        setChatOrFeed={setChatOrFeed}
      />);
    }
    return (
      <View>
        <TextInput 
          label="What's on your mind?"
          value={this.state.message}
          onChangeText={text => this.onPostChange(text)}
          onSubmitEditing={() => this.onSubmitPost()}
        />
        {posts}
      </View>
    )
  }
}

const mapDispatchToProps = (dispatch: any) => (
  bindActionCreators({
    sendPost
  }, dispatch)
);

const mapStateToProps = (state: any) => {
  const { ws, me, chat, feed, friends, groups, activeIdentityContext } = state
  return { ws, me, chat, feed, friends, groups, activeIdentityContext }
};


export default connect(mapStateToProps, mapDispatchToProps)(Feed);

const styles = StyleSheet.create({
});
