<template>
  <v-list>
    <v-list-item>
      <v-list-item-content>
        <v-list-item-title class="headline">{{tourData.name}}</v-list-item-title>
      </v-list-item-content>
    </v-list-item>
    <v-list-item>
      <v-list-item-content>
        <p><strong>Start: </strong>{{tourData.start_date}} </p>
        <p><strong>End: </strong>{{tourData.end_date}}</p>
      </v-list-item-content>
    </v-list-item>
    <v-list-item dense>
      <v-list-item-content>
        <p><strong>Description: </strong>{{tourData.description}}</p>
      </v-list-item-content>
    </v-list-item>
    <v-list-item dense class="px-0">
      <v-list-item-content>
        <v-card elevation="12">
          <v-card-title>Share Your Tourmap</v-card-title>
          <v-card-text v-if="tourData.isPublic" >
            <vue-goodshare-facebook
              :page_url="pageUrl"
              title_social="Facebook"
              has_counter
              has_icon
            ></vue-goodshare-facebook>
            <vue-goodshare-twitter
              :page_url="pageUrl"
              title_social="Twitter"
              has_counter
              has_icon
            ></vue-goodshare-twitter>
            <vue-goodshare-email
              :page_url="pageUrl"
              title_social="Email"
              has_icon
            ></vue-goodshare-email>
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
        <p >Total Distance: {{ totalDistance.toFixed(1) }} km</p>
        <p >Total Moving Time: {{ totalTime.toFixed(1) }} hrs</p>
      </v-list-item-content>
    </v-list-item>
  </v-list>
</template>

<script>
import VueGoodshareFacebook from 'vue-goodshare/src/providers/Facebook'
import VueGoodshareTwitter from 'vue-goodshare/src/providers/Twitter'
import VueGoodshareEmail from 'vue-goodshare/src/providers/Email'
import { isNumber } from 'util'

export default {
  props: {
    tourData: {
      type: Object,
      default: null,
    }
  },
  components: {
    VueGoodshareFacebook, VueGoodshareTwitter, VueGoodshareEmail
  },
  computed: {
    pageUrl() {
      return window.location.href
    },
    totalDistance() {
      return this.tourData.activities.items.reduce((a,c) => {
        if (isNumber(c.distance)) {
          return a += c.distance
        } else {
          return a
        }
      }, 0) / 1000
    },
    totalTime() {
      return this.tourData.activities.items.reduce((a,c) => {
        if (isNumber(c.moving_time)) {
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
