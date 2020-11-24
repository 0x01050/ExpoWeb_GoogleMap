import * as Linking from 'expo-linking';

export default {
  prefixes: [Linking.makeUrl('/')],
  config: {
    screens: {
      Root: {
        screens: {
          "Group chat": {
            screens: {
              GroupDetailScreen: 'main',
            },
          },
          GroupsTab: {
            screens: {
              GroupsScreen: 'groups',
            },
          },
        },
      },
      NotFound: '*',
    },
  },
};
