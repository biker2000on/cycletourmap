import Vue from 'vue'
import VueRouter from 'vue-router'

// components
import Leaflet from '../components/Leaflet'
import Auth from '../components/Auth'
import Summary from '../components/Summary'
import Rides from '../components/Rides'
import Profile from '../components/Profile'
import Strava from '../components/Strava'

Vue.use(VueRouter)

const routes = [
  {
    path: '/tourmap/:mapId', //   /tourmap/:id   and   /tourmap/new for new map
    name: 'map',
    component: Leaflet,
    props: true
  },
  {
    path: '/tourmap/:mapId/edit', //   /tourmap/:id   and   /tourmap/new for new map
    name: 'edit',
    components: {
      default: Leaflet,
      drawer: Strava,
    },
    props: true
  },
  {
    path: '/',
    name: 'profile',
    component: Profile,
    props: true,
    alias: '/profile'
  },
  {
    path: '/auth',
    name: 'auth',
    component: Auth,
  },
  {
    path: '/summary',
    name: 'summary',
    component: Summary,
    props: true,
    meta: { requiresAuth: true }
  },
  {
    path: '/rides',
    name: 'rides',
    component: Rides,
    props: true,
    meta: { requiresAuth: true }
  },
]

const router = new VueRouter({
  routes,
})

router.beforeResolve((to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    // let user;
    Vue.prototype.$Amplify.Auth.currentAuthenticatedUser().then(() => {
      // if (data && data.signInUserSession) {
      //   user = data;
      // }
      next()
    }).catch(() => {
      next({
        name: 'auth'
      });
    });
  }
  next()
})

export default router