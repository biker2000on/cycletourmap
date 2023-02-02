import { createRouter, createWebHistory } from 'vue-router'
import Home from '../components/Home.vue'
import ProfileNav from '../components/ProfileNav.vue'
import GettingStarted from '../components/GettingStarted.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home
  },
  {
    path: '/auth',
    name: 'auth',
    component: Home  // needs new flow since the deprecation of Amplify
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
    path: '/about',
    name: 'About',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
