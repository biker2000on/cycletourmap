import { createRouter, createWebHistory } from 'vue-router'

// components
import LeafletData from '../components/LeafletData.vue'
import Auth from '../components/Auth.vue'
import Profile from '../components/Profile.vue'
import StravaData from '../components/StravaData.vue'
import Buttons from '../components/Buttons.vue'
import ProfileNav from '../components/ProfileNav.vue'
import Error404 from '../components/Error404.vue'
import Home from '../components/Home.vue'
import GettingStarted from '../components/GettingStarted.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home
  },
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
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: Error404,
  }
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
