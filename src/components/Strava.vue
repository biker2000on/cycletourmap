<template>
  <div id="strava">
    <h3>Strava Info Test</h3>
    <h4>Hello {{ this.$store.state.athlete.firstname + ' ' + this.$store.state.athlete.lastname}}</h4>
    <!-- <p>You have {{ strava.bikes.length ? strava.bikes.length : 0 }} bikes</p> -->
    <button v-on:click="getStrava">Fetch Strava</button>
    <button v-on:click="getActivities">Fetch Activities</button>
    <button v-on:click="getAllActivities">Fetch All Activities</button>
    <a :href="'https://www.strava.com/oauth/authorize?client_id=28538' +
              '&redirect_uri=' + redirect_uri +
              '&response_type=' + 'code' +
              '&approval_prompt=' + 'auto' +
              '&scope=' + 'read,profile:read_all,activity:read'">Authorize App</a>
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
import strava from 'strava-v3'

export default {
  data() {
    return {
      strava: '',
      activities: [],
      auth_token: '',
      refresh_token: '',
      redirect_uri: 'http://localhost:8080'
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
    getAllActivities: function () {
      let page = 1
      while (page > 0) {
        axios.get('https://www.strava.com/api/v3/athletes/7594/activities?per_page=50&page='
        + page + '&access_token=' + process.env.VUE_APP_STRAVA_TOKEN)
          .then((response) => {
            if (response.data != []) {
              this.$store.commit('addActivities', response.data)
              page++
            }
            page = -1
          })
          .catch((err) => {
            console.log(err)
            page = -1
            })
      }
    },
    getParitalActivities: function () {
      strava.athlete.listActivities()
    },
    getAuth: function() {
      var data = {
        client_id: process.env.VUE_APP_STRAVA_CLIENTID,
        redirect_uri: 'localhost:8080',
        response_type: 'code',
        approval_prompt: 'auto',
        scope: 'read,profile:read_all,activity:read'
      }
      axios.get('https://www.strava.com/oauth/authorize', )
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

<style scoped>
  #strava {
    text-align: center;
  }
</style>
