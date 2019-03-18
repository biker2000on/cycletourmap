<template>
  <div style="text-align: center">
    <h2>Summary Stats</h2>
    <p><strong>Average Riding Speed: </strong>{{ (summaryStats.distance / 1000 / summaryStats.moving_time * 3600).toFixed(2) }}     
    <strong>Average Speed w/ Stops: </strong> {{ (summaryStats.distance / 1000 / summaryStats.elapsed_time * 3600).toFixed(2) }}</p>
  </div>
</template>

<script>
export default {
  computed: {
    summaryStats() {
      let summary = {
        elapsed_time: 0,
        moving_time: 0,
        distance: 0,
        total_elevation_gain: 0,
      }
      let totals = this.$store.state.activities.reduce((a,c) => {
        a.elapsed_time += c.elapsed_time
        a.moving_time += c.moving_time
        a.distance += c.distance
        a.total_elevation_gain += c.total_elevation_gain
        return a
      },summary)
      return totals
    },
  }
}
</script>

average speed
total distance
distance per day
time per day
total riding time
total elapsed time
total days ridden
total days of trip (start 3/15)
