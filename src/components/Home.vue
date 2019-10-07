<template>
  <div style="width: 100%">
    <div
      class="text-center white--text home-background d-flex flex-column justify-center align-center"
      :style="style"
    >
      <h1 class="display-4 font-weight-bold pa-4" :style="{zIndex: 1}">Cycle Tourmap</h1>
      <h2
        class="display-1 font-italic mb-4"
        :style="{zIndex: 1}"
      >Your #1 Place to Build and Share Tourmaps</h2>
      <v-btn :to="{name: 'auth'}" color="green" dark>Sign Up</v-btn>
    </div>
    <div class="pa-md-10 title">
      <h2 class="headline-3 mb-6">Getting Started</h2>
      <p>Head on over to our Getting Started and FAQ page to learn how to get started building your new maps.</p>
      <v-btn x-large color="primary" dark class="elevation-8" :to="{name: 'faq'}"><v-icon>question_answer</v-icon>Getting Started</v-btn>
    </div>
    <div class="pa-md-10 title white">
      <v-row
        align="center"
        justify="center"
        class="d-flex flex-row"
        v-for="(row, i) in text"
        :key="i"
      >
        <v-col sm="6" cols="12" :order="i % 2 == 0 ? 2 : 1">
          <v-hover>
            <template v-slot="{ hover }">
              <div
                :class="`elevation-${hover ? 24 : 6}`"
                class="ma-md-6 pa-5 transition-swing"
              >{{row[0]}}</div>
            </template>
          </v-hover>
        </v-col>
        <v-col sm="6" cols="12" :order="i % 2 == 0 ? 1 : 2">
          <v-hover>
            <template v-slot="{ hover }">
              <v-img
                :src="row[1]"
                :class="`elevation-${hover ? 24 : 6}`"
                class="ma-md-6 transition-swing"
              ></v-img>
            </template>
          </v-hover>
        </v-col>
        <v-responsive></v-responsive>
      </v-row>
    <div>
      <p class="display-3">Get Mapping Now</p>
      <v-btn :to="{name: 'auth'}" color="green" dark class="headline" x-large>Sign Up</v-btn>
    </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      windowHeight: 300,
      computedHeight: 600,
      text: [
        [
          "Use Cycle Tourmaps to show to all your friends and family your longer tours. Keep them up to date with your travels, not by just showing them individual rides, but by showing them altogether.",
          "/images/map_screenshot.png"
        ],
        [
          "Share your maps on all your social media and embed on your websites",
          "/images/social.jpg"
        ],
        [
          "Make public maps for all to see or keep them private for just you.",
          "/images/pin.svg"
        ],
        [`Plus, it's free today and every day!`, "/images/money.svg"],
        ["Enjoy sharing your adventures with the world.", "tour.jpg"]
      ]
    };
  },
  computed: {
    style() {
      return {
        width: "100%",
        height: this.computedHeight
      };
    }
  },
  watch: {
    windowHeight() {
      // (new, old)
      const top = this.$vuetify.application.top;
      const bottom = this.$vuetify.application.footer || 0;
      const total = this.windowHeight;
      this.computedHeight = total - top - bottom;
    }
  },
  mounted() {
    this.$nextTick(() => {
      window.addEventListener("resize", () => {
        this.windowHeight = window.innerHeight;
      });
      this.windowHeight = window.innerHeight;
    });
  },
  beforeDestroy() {
    window.removeEventListener("resize", () => {
      this.windowHeight = window.innerHeight;
    });
  }
};
</script>

<style>
.home-background {
  background-image: url(/tour.jpg);
  background-position: center center;
  background-repeat: no-repeat;
  background-color: rgba(0, 0, 0, 0.3);
  background-blend-mode: saturation;
  width: 100%;
}
</style>