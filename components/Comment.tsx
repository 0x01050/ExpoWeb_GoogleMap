import React from 'react';
import { View , StyleSheet} from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Avatar, Button, Card, Title, Paragraph, TextInput, Text, Caption } from 'react-native-paper';
import { sendPost } from '../actions/FeedActions'
import CenterIdentity from 'centeridentity';

class Comment extends React.Component {
  constructor(props: any) {
    super(props);
    this.state = {
      message: '',
      comments: {}
    }
  }

  likePost = (item: any) => {

  }

  sharePost = (item: any) => {

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
    const { item } = this.props;
    var newDate = new Date();
    newDate.setTime(item.time*1000 + newDate.getTimezoneOffset());
    let dateString = newDate.toLocaleString();
    return (
      <Card style={styles.card}>
        <Card.Content>
          <Title>{item.commentText.username}</Title>
          <Paragraph>{item.commentText.text}</Paragraph>
          <Caption>{dateString}</Caption>
        </Card.Content>
        {item.commentText.skylink && <Card.Cover source={{ uri: item.commentText.skylink }} />}
        <Card.Actions>
        </Card.Actions>
      </Card>
    )
  }
}

const styles = StyleSheet.create({
  card: {
    margin: 15
  },
});

const mapDispatchToProps = (dispatch: any) => (
  bindActionCreators({
    sendPost
  }, dispatch)
);

const mapStateToProps = (state: any) => {
  const { ws, me, chat, feed, friends, groups, activeIdentityContext } = state
  return { ws, me, chat, feed, friends, groups, activeIdentityContext }
};


export default connect(mapStateToProps, mapDispatchToProps)(Comment);
