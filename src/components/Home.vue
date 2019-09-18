<template>
  <div class="text-center text-white">
    <h1>Cycle Tourmap</h1>
    <h2>Your #1 Place to Build and Share Tourmaps</h2>
    <v-btn :to="{name: 'auth'}">Sign Up</v-btn>
  </div>
</template>

<script>
export default {
  data() {
    return {
      windowHeight: 300,
      computedHeight: { height: 600 }
    };
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
  .text-white {
    color: white;
  }
</style>