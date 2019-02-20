// const fetch = require('node-fetch')

// const start = new Date('1/1/2018')
// const end = new Date()

// start
// end

// let activity = fetch('https://www.strava.com/api/v3/athletes/7594/activities?access_token=641c02aede2bd589ccf83096c9ea706c2fd3a1ec')
//   .then(response => response.json())
//   .then(activities => activities.map(a => new Date(a.start_date_local)))

// activity

// const getAllActivities = async () => {
//   const start = new Date('1/1/2018')
//   let page = 1
//   let acts = []
//   let gains = ''
//   do {
//     let strava = await fetch('https://www.strava.com/api/v3/athletes/7594/activities?access_token=641c02aede2bd589ccf83096c9ea706c2fd3a1ec&per_page=50&page=' + page)
//     let activities = await strava.json()
//     let dates = activities.reduce((a,c)=>{
//       let rideStart = new Date(c.start_date)
//       if (start > rideStart) {
//         return true
//       } else { return a }
//     }, false)
//     dates
//     gains = activities.map(act => act.total_elevation_gain)
//     acts = acts.concat(gains)
//     if (dates) {return acts}
//     page++
//   } while (gains != '')
//   return acts
// }

// let elevations = getAllActivities()
// elevations


/*
getActivities: function () {
  let self = this
  axios.get('https://www.strava.com/api/v3/athletes/7594/activities?access_token=' + process.env.VUE_APP_STRAVA_TOKEN)
    .then((response) => {
      self.activities = response.data
      this.$store.commit('setActivities', response.data)
      // console.log(response.data)
    })
    .catch((err) => {console.log(err)})
}
*/
let test = 12345
let h = (test%3600)
h
let m = (test%3600/60)
m
let s = (test%60)
s