import { createRouter, createWebHistory } from 'vue-router'

// components
import LeafletData from '../components/LeafletData'
import Auth from '../components/Auth'
// import Summary from '../components/Summary'
// import Rides from '../components/Rides'
import Profile from '../components/Profile'
import StravaData from '../components/StravaData'
import Buttons from '../components/Buttons'
import ProfileNav from '../components/ProfileNav'
import Error404 from '../components/Error404'
import Home from '../components/Home'
import GettingStarted from '../components/GettingStarted'

const routes = [
  {
    path: '/tourmap/:mapId', 
    name: 'map',
    components: {
      default: LeafletData,
      drawer: StravaData,
      header: Buttons,
    },
    props: true
  },
  {
    path: '/tourmap/:mapId/edit',
    name: 'edit',
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

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeResolve((to, from, next) => {
  // Auth guard temporarily disabled - will be reimplemented with Strava OAuth
  next()
})

export default router