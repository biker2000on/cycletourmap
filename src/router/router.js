import Vue from 'vue'
import VueRouter from 'vue-router'

// components
import LeafletData from '../components/LeafletData'
import Leaflet from '../components/Leaflet'
import Auth from '../components/Auth'
// import Summary from '../components/Summary'
import Rides from '../components/Rides'
import Profile from '../components/Profile'
import StravaData from '../components/StravaData'
import Buttons from '../components/Buttons'
import ProfileNav from '../components/ProfileNav'
import Error404 from '../components/Error404'
import Home from '../components/Home'
import GettingStarted from '../components/GettingStarted'

Vue.use(VueRouter)

const routes = [
  {
    path: '/tourmap/:mapId', 
    // name: 'map',
    components: {
      default: LeafletData,
      drawer: StravaData,
      header: Buttons,
    },
    children: [
      {path: 'table', name: 'table', component: Rides},
      {path: '', name: 'map', component: Leaflet}
    ],
    props: true
  },
  {
    path: '/tourmap/:mapId/edit',
    components: {
      default: LeafletData,
      drawer: StravaData,
      header: Buttons,
    },
    children: [
      {path: 'table', name: 'editTable', component: Rides},
      {path: '', name: 'edit', component: Leaflet}
    ],
    meta: { requiresAuth: true },
    props: true
  },
  {
    path: '/tourmap/:mapId/edit/table',
    name: 'edit-table',
    components: {
      default: LeafletData,
      drawer: StravaData,
      header: Buttons,
    },
    meta: { requiresAuth: true },
    props: true
  },
  {
    path: '/dashboard',
    name: 'profile',
    components: {
      default: Profile,
      drawer: ProfileNav,
    },
    props: true,
    meta: { requiresAuth: true }
  },
  {
    path: '/',
    name: 'home',
    component: Home
  },
  {
    path: '/auth',
    name: 'auth',
    component: Auth,
  },
  {
    path: '/faq',
    name: 'faq',
    components: {
      drawer: ProfileNav,
      default: GettingStarted,
    }
  },
  {
    path: '**',
    component: Error404,
  }
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
  mode: 'history',
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
  if (to.name === 'home') {
    Vue.prototype.$Amplify.Auth.currentAuthenticatedUser().then(() => {
      next({
        name: 'profile'
      })
    })
  }
  next()
})

export default router