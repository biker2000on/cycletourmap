<template>
  <div style="text-align: center">
    <h2>Summary Stats</h2>
    <div class="container">
      <div>
        <strong>Average Riding Speed: </strong><br>
        <h3>{{ (summaryStats.distance / 1000 / summaryStats.moving_time * 3600).toFixed(2) }} kph</h3>
      </div>
      <div>
        <strong>Average Speed w/ Stops: </strong><br> 
        <h3>{{ (summaryStats.distance / 1000 / summaryStats.elapsed_time * 3600).toFixed(2) }} kph</h3>
      </div>
      <div>
        <strong>Days Riding</strong><br> 
        <h3>{{ summaryStats.day.length - 1 }}</h3>
      </div>
      <div>
        <strong>Total Days</strong><br> 
        <h3>{{ days }}</h3>
      </div>
      <div>
        <strong>Total Riding Time</strong><br> 
        <h3>{{ (summaryStats.moving_time / 3600).toFixed(2) }} hrs</h3>
      </div>
      <div>
        <strong>Total Elapsed Time on Bike</strong><br> 
        <h3>{{ (summaryStats.elapsed_time / 3600).toFixed(2) }} hrs</h3>
      </div>
      <div>
        <strong>Total Distance</strong><br> 
        <h3>{{ (summaryStats.distance / 1000).toFixed(0) }} kms</h3>
      </div>
    </div>
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
        day: ['2019-03-15','2019-03-16'],
      }
      let totals = this.$store.state.activities.reduce((a,c) => {
        a.elapsed_time += c.elapsed_time
        a.moving_time += c.moving_time
        a.distance += c.distance
        a.total_elevation_gain += c.total_elevation_gain
        if (!a.day.includes(c.start_date_local.slice(0,10))) {
          a.day.push(c.start_date_local.slice(0,10))
        }
        return a
      },summary)
      return totals
    },
    days() {
      let start = new Date(2019,2,15)
      let now = new Date()
      return Math.round(Math.abs((now.getTime() - start.getTime())/(24*60*60*1000)));
    }
  }
}
</script>

<style>
  .container {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
  }
  .container div {
    margin: 2rem;
  }
</style>


distance per day
time per day
