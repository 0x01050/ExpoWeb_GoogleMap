import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { View , StyleSheet} from 'react-native';
import { Avatar, Button, Card, Title, Paragraph, TextInput, Text, Caption } from 'react-native-paper';
import { sendPost } from '../actions/FeedActions'
import Comment from '../components/Comment';
import CenterIdentity from 'centeridentity';
import store from '../store';
import { changeActiveIdentityContext } from '../actions/ActiveIdentityContextActions';
import { createGroup } from '../actions/GroupActions';

class Post extends React.Component {
  constructor(props: any) {
    super(props);
    this.state = {
      message: '',
      comments: {}
    }
  }

  likePost = (item: any) => {

  }

  plan = (item: any) => {
    var hash = window.location.hash.split('|')
    var state = store.getState();
    var ci = new CenterIdentity();
    var pathString = hash[0] + '|' + item.id;
    var group = this.props.createGroup(pathString)
    .then((group:any) => {
      var requested_rid = ci.generate_rid(group, state.ws.server_identity)
      this.props.changeActiveIdentityContext(group, requested_rid, true);
      this.props.chat.chats[this.props.activeIdentityContext.rid] = this.props.chat.chats[this.props.activeIdentityContext.rid]
    });
  }

  onCommentChange = (text: any, item: any) => {
    const { comments } = this.state
    comments[item.id] = text
    this.setState({...this.state, comments: comments})
  }

  onSubmitComment = (item: any) => {
    var ci = new CenterIdentity();
    const { comments } = this.state
    this.props.sendPost({
      ...ci.toObject(this.props.me.identity),
      text: comments[item.id],
      parent: item.id
    }, 'commentText');
    comments[item.id] = '';
    this.setState({...this.state, comments: comments})
  }

  render() {
    const { item, comments, setChatOrFeed } = this.props;
        
    comments.sort((a, b) => {
      if (a.createdAt < b.createdAt)
        return -1
      if (a.createdAt > b.createdAt)
        return 1
      return 0
    });
    var commentsComps = [];
    for(var j=0; j < comments.length; j++) {
      commentsComps.push(<Comment
        item={comments[j]}
      />);
    }
    var newDate = new Date();
    newDate.setTime(item.time*1000 + newDate.getTimezoneOffset());
    let dateString = newDate.toLocaleString();
    return (
      <Card style={styles.card}>
        <Card.Content>
          <Title>{item.postText.username}</Title>
          <Paragraph>{item.postText.text}</Paragraph>
          <Caption>{dateString}</Caption>
        </Card.Content>
        {item.postText.skylink && <Card.Cover source={{ uri: item.postText.skylink }} />}
        <Card.Actions>
          <Button
            onPress={() => {this.plan(item)}}
          >Live chat</Button>
          <TextInput 
            style={{height: 50, width: 600}}
            label="Comment"
            value={this.state.comments[item.id]}
            onChangeText={text => this.onCommentChange(text, item)}
            onSubmitEditing={() => this.onSubmitComment(item)}
          />
        </Card.Actions>
        {commentsComps}
      </Card>
    )
  }
}

const mapDispatchToProps = (dispatch: any) => (
  bindActionCreators({
    sendPost,
    changeActiveIdentityContext,
    createGroup
  }, dispatch)
);

const mapStateToProps = (state: any) => {
  const { ws, me, chat, feed, friends, groups, activeIdentityContext } = state
  return { ws, me, chat, feed, friends, groups, activeIdentityContext }
};


export default connect(mapStateToProps, mapDispatchToProps)(Post);

const styles = StyleSheet.create({
  card: {
    margin: 15
  },
});

        