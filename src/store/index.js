import { createStore } from 'vuex'

export default createStore({
  state: {
    start: null,
    end: null,
    isMetric: false,
    athlete: '',
    activities: [],
    activeActivityId: null,
    user: null,
    signedIn: null,
    hasStravaAuth: false,
  },
  mutations: {
    setSignedIn(state, signedIn) {
      state.signedIn = signedIn
    },
    setHasStravaAuth(state, auth) {
      state.hasStravaAuth = auth
    },
    setStart(state, startdate) {
      state.start = startdate
    },
    setEnd(state, enddate) {
      state.end = enddate
    },
    setAthlete(state, athlete) {
      state.athlete = athlete
    },
    setActivities(state, activities) {
      state.activities = activities
    },
    setMetric(state, metric) {
      state.isMetric = metric
    },
    addActivities(state, activities) {
      // should update to check if activity is already in state.
      state.activities.push(...activities)
    },
    setUser(state, user) {
      state.user = user
    },
    resetUser(state) {
      state.user = null
    },
    setActiveActivityId(state, activityId) {
      state.activeActivityId = activityId
    },
  },
  actions: {},
  modules: {}
})