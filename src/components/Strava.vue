<template>
  <div>
    <h3>Strava Info Test</h3>
    <h4>Hello {{ this.$store.state.athlete.firstname + ' ' + this.$store.state.athlete.lastname}}</h4>
    <!-- <p>You have {{ strava.bikes.length ? strava.bikes.length : 0 }} bikes</p> -->
    <button v-on:click="getStrava">Fetch Strava</button>
    <button v-on:click="getActivities">Fetch Activities</button>
    <div>
      <label for="start">Start Date: </label>
      <input type="date" v-model="start">
      <label for="end">End Date: </label>
      <input type="date" v-model="end">
    </div>
    <div>
      <br>
      We returned {{ this.$store.state.activities.length }} activities.<br>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  data() {
    return {
      strava: '',
      activities: []
    }
  },
  methods: {
    getStrava: function () {
      axios.get('https://www.strava.com/api/v3/athletes/7594?access_token=' + process.env.VUE_APP_STRAVA_TOKEN)
        .then((response) => {
          self.strava = response.data
          this.$store.commit('setAthlete',response.data)
          // console.log(response.data)
        })
        .catch((err) => {console.log(err)})
    },
    getActivities: function () {
      let self = this
      axios.get('https://www.strava.com/api/v3/athletes/7594/activities?access_token=' + process.env.VUE_APP_STRAVA_TOKEN)
        .then((response) => {
          self.activities = response.data
          this.$store.commit('setActivities', response.data)
          // console.log(response.data)
        })
        .catch((err) => {console.log(err)})
    },
    updateStart (e) {
      this.$store.commit('setStart', e.target.value)
    }
  }, 
  mounted() {
    console.log('Strava mounted.')
  },
  computed: {
    end: {
      get () {
        return this.$store.state.end
      },
      set (value) {
        this.$store.commit('setEnd', value)
      }
    },
    start: {
      get () {
        return this.$store.state.start
      },
      set (value) {
        this.$store.commit('setStart', value)
      }
    }
  }
}
</script>

<style>

</style>
