<template>
  <v-card>
    <v-card-title class="headline">Future Features</v-card-title>
    <v-divider></v-divider>
    <v-card-text>
      <ul class="my-4">
        <li v-for="(item,i) in items" :key="i">{{ item }}</li>
      </ul>
      <p>If you have any other features you would like added please let me know and I will add it to the list of future features.</p>
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn color="primary" @click="$emit('close')">Close</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  data() {
    return {
      items: [
        'Ride Table',
        'User Selectable Summary Stats',
        'Filters to include / exclude certain rides from tour',
        'Elevation profiles for individual rides and whole tour profile',
        'Manual Rides / public transport addition to map',
      ]
    }
  }
};
</script>

<style>
</style>