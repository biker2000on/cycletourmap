
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    start: '3/12/2019',
    end: '11/21/2019',
    isMetric: false,
    athlete: '',
    activities: [],
  },
  mutations: {
    setStart (state, startdate) {
      state.start = startdate
    },
    setEnd (state, enddate) {
      state.end = enddate
    },
    setAthlete (state, athlete) {
      state.athlete = athlete
    },
    setActivities (state, activities) {
      state.activities = activities
    },
    setMetric (state, metric) {
      state.isMetric = metric
    },
    addActivities (state, activities) {
      // should update to check if activity is already in state.
      state.activities = state.activities.append(activities)
    }
  }
})