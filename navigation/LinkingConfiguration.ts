import * as Linking from 'expo-linking';

export default {
  prefixes: [Linking.makeUrl('/')],
  config: {
    screens: {
      Root: {
        screens: {
          "Chat": {
            screens: {
              GroupDetailScreen: 'chat',
            },
          },
          "Identity": {
            screens: {
              IdentityScreen: 'identity',
            },
          },
        },
      },
      NotFound: '*',
    },
  },
};
