import Vue from 'vue'
import VueRouter from 'vue-router'

// components
import LeafletData from '../components/LeafletData'
import Auth from '../components/Auth'
// import Summary from '../components/Summary'
// import Rides from '../components/Rides'
import Profile from '../components/Profile'
import Strava from '../components/Strava'
import Buttons from '../components/Buttons'

Vue.use(VueRouter)

const routes = [
  {
    path: '/tourmap/:mapId', //   /tourmap/:id   and   /tourmap/new for new map
    name: 'map',
    component: LeafletData,
    props: true
  },
  {
    path: '/tourmap/:mapId/edit', //   /tourmap/:id   and   /tourmap/new for new map
    name: 'edit',
    components: {
      default: LeafletData,
      drawer: Strava,
      header: Buttons,
    },
    meta: { requiresAuth: true },
    props: true
  },
  {
    path: '/',
    name: 'profile',
    component: Profile,
    props: true,
    alias: '/profile',
    meta: { requiresAuth: true }
  },
  {
    path: '/auth',
    name: 'auth',
    component: Auth,
  },
  // {
  //   path: '/summary/:mapId',
  //   name: 'summary',
  //   component: Summary,
  //   props: true,
  // },
  // {
  //   path: '/rides/:mapId',
  //   name: 'rides',
  //   component: Rides,
  //   props: true,
  // },
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