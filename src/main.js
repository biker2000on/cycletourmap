import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import router from './router/router'
import store from './store'

// amplify imports
import Amplify, * as AmplifyModules from 'aws-amplify'
import { AmplifyPlugin } from 'aws-amplify-vue'
import config from './aws-exports'

// apollo client config
import AWSAppSyncClient, { AUTH_TYPE } from 'aws-appsync'
import VueApollo from 'vue-apollo'
import AppSyncConfig from './aws-exports'

const configApollo = {
  url: AppSyncConfig.aws_appsync_graphqlEndpoint,
  region: AppSyncConfig.aws_appsync_region,
  auth: {
    type: AUTH_TYPE.AMAZON_COGNITO_USER_POOLS,
    jwtToken: async () => (await Amplify.Auth.currentSession()).getAccessToken().getJwtToken(),
  },
  complexObjectsCredentials: () => Amplify.Auth.currentCredentials()
}

const configApolloApiKey = {
  url: AppSyncConfig.aws_appsync_graphqlEndpoint,
  region: AppSyncConfig.aws_appsync_region,
  auth: { type: AUTH_TYPE.API_KEY, apiKey: AppSyncConfig.aws_appsync_apiKey},
  disableOffline: true,
};

const configApolloIAM = {
  url: AppSyncConfig.aws_appsync_graphqlEndpoint,
  region: AppSyncConfig.aws_appsync_region,
  auth: { type: AUTH_TYPE.AWS_IAM},
  disableOffline: true,
};

const options = {
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
    }
  }
}

const cognito = new AWSAppSyncClient(configApollo, options)
const apikey = new AWSAppSyncClient(configApolloApiKey, options)
const iam = new AWSAppSyncClient(configApolloIAM, options)

const appsyncProvider = new VueApollo({
  clients: {
    cognito,
    apikey, 
    iam,
  },
  defaultClient: cognito
})

Vue.use(VueApollo)

Amplify.configure(config)
Vue.use(AmplifyPlugin, AmplifyModules)

Vue.config.productionTip = false

new Vue({
  router,
  vuetify,
  store,
  apolloProvider: appsyncProvider,
  render: h => h(App)
}).$mount('#app')
