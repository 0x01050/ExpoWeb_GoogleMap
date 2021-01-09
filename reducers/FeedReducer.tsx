import { INIT_FEED, ADD_POST, ADD_COMMENT } from '../actions/types';
import store from '../store';

const INITIAL_STATE = {
  posts: {},
  comments: {}
};

const uuidv4 = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

const FeedReducer = (state = INITIAL_STATE, action: any) => {
  const { posts, comments } = state;
  switch (action.type) {
    case INIT_FEED:
      return Object.assign({}, state, {
        posts: {}
      });
    case ADD_POST:
      if (!posts[action.identifier]) {
        posts[action.identifier] = [];
      }
      if (!action.post) {
        return {
          ...state,
          posts: posts
        };
      }
      if (!action.post.length || typeof action.post === 'string') {
        action.post = [action.post];
      }
      for(var i=0; i < action.post.length; i++) {
        posts[action.identifier].push(action.post[i]);
      }
        
      posts[action.identifier] = posts[action.identifier].sort((a, b) => {
        if (a.createdAt < b.createdAt)
          return 1
        if (a.createdAt > b.createdAt)
          return -1
        return 0
      });
      return {
        ...state,
        posts: posts
      };
    case ADD_COMMENT:
      if (!comments[action.identifier]) {
        comments[action.identifier] = {};
      }
      if (!action.comment) {
        return {
          ...state,
          comments: comments
        };
      }
      comments[action.identifier] = {...comments[action.identifier], ...action.comment};

      return {
        ...state,
        comments: comments
      };

    default:
      return state;
  }
};

export default FeedReducer;
