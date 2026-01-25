<template>
  <v-list>
    <v-list-item>
      <v-list-item-content>
        <v-list-item-title class="headline text-wrap">{{tourData.name}}</v-list-item-title>
      </v-list-item-content>
    </v-list-item>
    <v-list-item>
      <v-list-item-content>
        <p><strong>Start: </strong>{{tourData.start_date}} </p>
        <p><strong>End: </strong>{{tourData.end_date}}</p>
      </v-list-item-content>
    </v-list-item>
    <v-list-item dense v-if="tourData.description">
      <v-list-item-content>
        <p><strong>Description: </strong>{{tourData.description}}</p>
      </v-list-item-content>
    </v-list-item>
    <v-list-item dense class="px-0">
      <v-list-item-content>
        <v-card elevation="12">
          <v-card-title class="text-center">Share Your Tourmap</v-card-title>
          <v-card-text v-if="tourData.isPublic" class="d-flex justify-center ga-2">
            <v-btn
              color="blue"
              :href="`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`"
              target="_blank"
              icon
            >
              <v-icon>mdi-facebook</v-icon>
            </v-btn>
            <v-btn
              color="light-blue"
              :href="`https://twitter.com/intent/tweet?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent(tourData.name)}`"
              target="_blank"
              icon
            >
              <v-icon>mdi-twitter</v-icon>
            </v-btn>
            <v-btn
              color="grey"
              :href="`mailto:?subject=${encodeURIComponent(tourData.name)}&body=${encodeURIComponent(pageUrl)}`"
              icon
            >
              <v-icon>mdi-email</v-icon>
            </v-btn>
          </v-card-text>
          <v-card-text v-else>
            Please make your tourmap public if you want to share.
          </v-card-text>
        </v-card>
      </v-list-item-content>
    </v-list-item>
    <v-list-item>
      <v-list-item-content>
        <p class="title">Tour Stats:</p>
        <p>Activities: {{ tourData.activities.items.length }}</p>
        <p >Total Distance: {{ isMetric ? totalDistance.toFixed(1) + ' km' : (totalDistance / 1.609).toFixed(1) + ' mi' }}</p>
        <p >Total Moving Time: {{ totalTime.toFixed(1) }} hrs</p>
      </v-list-item-content>
    </v-list-item>
    <v-list-item v-if="tourData && tourData.activities">
      <v-list-item-content>
        <p class="title">Rides:</p>
        <p class="titile">I'm hovering {{ act }}</p>
        <ol class="text-left">
          <li v-for="activity in activities" :key="activity.id" @mouseover="act = activity.id" @mouseleave="act = null">{{activity.name}}</li>
        </ol>
      </v-list-item-content>
    </v-list-item>
  </v-list>
</template>

<script>
export default {
  props: {
    tourData: {
      type: Object,
      default: null,
    }
  },
  data() {
    return {
      act: null
    }
  },
  watch: {
    act(newId) {
      this.$store.commit('setActiveActivityId', newId)
    }
  },
  computed: {
    activities() {
      if (this.tourData) {
        let acts = this.tourData.activities.items.sort((a,b) => {
          if (a.start_date_local > b.start_date_local) return 1
          return -1
        })
        return acts
      }
      return []
    },
    isMetric() {
      return this.$store.state.isMetric
    },
    pageUrl() {
      return window.location.href
    },
    totalDistance() {
      return this.tourData.activities.items.reduce((a,c) => {
        if (typeof c.distance === 'number') {
          return a += c.distance
        } else {
          return a
        }
      }, 0) / 1000
    },
    totalTime() {
      return this.tourData.activities.items.reduce((a,c) => {
        if (typeof c.moving_time === 'number') {
          return a += c.moving_time
        } else {
          return a
        }
      }, 0) / 3600
    }
  }
};
</script>

<style scoped>
.v-list-item {
  text-align: center;
}
</style>
