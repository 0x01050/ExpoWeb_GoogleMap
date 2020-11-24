const INITIAL_STATE = {
  client: {},
  server_identity: {}
};

const websocketReducer = (state = INITIAL_STATE, action: any) => {
  switch (action.type) {
    case 'INIT_WS':
      const {
        client,
      } = state;

      const newState = { ...state, client: action.client };

      return newState;
    default:
      return state
  }
};

export default websocketReducer;
