<template>
  <v-list dense>
    <!-- <v-list-item>
      <v-img
        v-if="athlete"
        :src="athlete.profile"
        :alt="athlete.firstname + ' ' + athlete.lastname"
        :style="{borderRadius: 50 + '%'}"
      />
    </v-list-item>
    <v-list-item v-if="athlete">
      <v-list-item-content>
        <h2>{{ athlete.firstname + ' ' + athlete.lastname }}</h2>
      </v-list-item-content>
    </v-list-item> -->
    <v-list-item dense>
      <v-list-item-content>
        <h2>{{tourData.name}}</h2>
      </v-list-item-content>
    </v-list-item>
    <v-list-item dense>
      <v-list-item-content>
        <p><strong>Start: </strong>{{tourData.start_date}} </p>
        <p><strong>End: </strong>{{tourData.end_date}}</p>
      </v-list-item-content>
    </v-list-item>
    <v-list-item dense>
      <v-list-item-content>
        <p><strong>Description: </strong>{{tourData.description}}</p>
        <div>Activities: {{ tourData.activities.items.length }}</div>
      </v-list-item-content>
    </v-list-item>
    <v-list-item dense >
      <v-list-item-content>
        <v-card>
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
  </v-list>
</template>

<script>
import VueGoodshareFacebook from 'vue-goodshare/src/providers/Facebook'
import VueGoodshareTwitter from 'vue-goodshare/src/providers/Twitter'
import VueGoodshareEmail from 'vue-goodshare/src/providers/Email'

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
    }
  }
};
</script>

<style scoped>
.v-list-item {
  text-align: center;
}
</style>
