
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    vuexStart: '',
    end: '',
    athlete: '',
    activities: [],
  },
  mutations: {
    setStart (state, startdate) {
      state.vuexStart = startdate
    },
    setEnd (state, enddate) {
      state.end = enddate
    },
    setAthlete (state, athlete) {
      state.athlete = athlete
    },
    setActivities (state, activities) {
      state.activities = activities
    }
  }
})