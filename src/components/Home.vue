<template>
  <div style="width: 100%">
    <!-- Hero Section -->
    <div
      class="text-center text-white home-background d-flex flex-column justify-center align-center"
      :style="heroStyle"
    >
      <h1 class="text-h2 text-md-h1 font-weight-bold pa-4" style="z-index: 1">Cycle Tourmap</h1>
      <h2 class="text-h5 text-md-h4 font-italic mb-4" style="z-index: 1">
        Your #1 Place to Build and Share Tourmaps
      </h2>
      <v-btn :to="{ name: 'auth' }" color="success" size="large">Sign Up</v-btn>
    </div>

    <!-- Getting Started Section -->
    <div class="pa-6 pa-md-10 text-center">
      <h2 class="text-h4 mb-6">Getting Started</h2>
      <p class="mb-4">Head on over to our Getting Started and FAQ page to learn how to get started building your new maps.</p>
      <v-btn size="x-large" color="primary" elevation="8" :to="{ name: 'faq' }">
        <v-icon start>mdi-frequently-asked-questions</v-icon>
        Getting Started
      </v-btn>
    </div>

    <!-- Features Section -->
    <div class="pa-6 pa-md-10 bg-white">
      <v-row
        v-for="(row, i) in features"
        :key="i"
        align="center"
        justify="center"
        class="mb-8"
      >
        <v-col cols="12" sm="6" :order="i % 2 === 0 ? 2 : 1">
          <v-hover v-slot="{ isHovering, props }">
            <v-card
              v-bind="props"
              :elevation="isHovering ? 16 : 4"
              class="pa-6 transition-swing"
            >
              <p class="text-body-1">{{ row.text }}</p>
            </v-card>
          </v-hover>
        </v-col>
        <v-col cols="12" sm="6" :order="i % 2 === 0 ? 1 : 2">
          <v-hover v-slot="{ isHovering, props }">
            <v-img
              v-bind="props"
              :src="row.image"
              :elevation="isHovering ? 16 : 4"
              class="transition-swing rounded"
              max-height="300"
              cover
            ></v-img>
          </v-hover>
        </v-col>
      </v-row>

      <!-- CTA Section -->
      <div class="text-center mt-10">
        <p class="text-h3 mb-6">Get Mapping Now</p>
        <v-btn :to="{ name: 'auth' }" color="success" size="x-large">Sign Up</v-btn>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

export default {
  name: 'Home',
  setup() {
    const windowHeight = ref(600)

    const heroStyle = computed(() => ({
      width: '100%',
      minHeight: '400px',
      height: `${Math.max(windowHeight.value - 128, 400)}px`
    }))

    const features = [
      {
        text: "Use Cycle Tourmaps to show to all your friends and family your longer tours. Keep them up to date with your travels, not by just showing them individual rides, but by showing them altogether.",
        image: "/images/map_screenshot.png"
      },
      {
        text: "Share your maps on all your social media and embed on your websites",
        image: "/images/social.jpg"
      },
      {
        text: "Make public maps for all to see or keep them private for just you.",
        image: "/images/pin.svg"
      },
      {
        text: "Plus, it's free today and every day!",
        image: "/images/money.svg"
      },
      {
        text: "Enjoy sharing your adventures with the world.",
        image: "/tour.jpg"
      }
    ]

    const handleResize = () => {
      windowHeight.value = window.innerHeight
    }

    onMounted(() => {
      windowHeight.value = window.innerHeight
      window.addEventListener('resize', handleResize)
    })

    onBeforeUnmount(() => {
      window.removeEventListener('resize', handleResize)
    })

    return {
      heroStyle,
      features
    }
  }
}
</script>

<style scoped>
.home-background {
  background-image: linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(/tour.jpg);
  background-position: center center;
  background-repeat: no-repeat;
  background-size: cover;
}

.transition-swing {
  transition: all 0.3s ease-in-out;
}
</style>
