import Vue from 'vue'
import Amplify, * as AmplifyModules from 'aws-amplify'
import { AmplifyPlugin } from 'aws-amplify-vue'
import config from '../aws-exports'

Amplify.configure(config)
Vue.use(AmplifyPlugin, AmplifyModules)