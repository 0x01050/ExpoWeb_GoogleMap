
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import reducerMain from './reducers';

const store = createStore(reducerMain, applyMiddleware(thunk));

export default store;
