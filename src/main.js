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
import AWSAppSyncClient from 'aws-appsync'
import VueApollo from 'vue-apollo'
import AppSyncConfig from './aws-exports'

const configApollo = {
  url: AppSyncConfig.aws_appsync_graphqlEndpoint,
  region: AppSyncConfig.aws_appsync_region,
  auth: {
    type: AppSyncConfig.aws_appsync_authenticationType,
    // apiKey: AppSyncConfig.aws_appsync_apiKey,
    jwtToken: async () => (await Amplify.Auth.currentSession()).getAccessToken().getJwtToken(),
  },
  complexObjectsCredentials: () => Amplify.Auth.currentCredentials()
}
const options = {
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
    }
  }
}

const client = new AWSAppSyncClient(configApollo, options)

const appsyncProvider = new VueApollo({
  defaultClient: client
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
