<template>
  <div>
    <label for="api">API</label>
    <input type="radio" id="api" name="booking" value="api" v-model="bookingType">
    <label for="scraper">Scraper</label>
    <input type="radio" id="scraper" name="booking" value="scraper" v-model="bookingType">
  </div>
  <div>
    <BookApi v-if="bookingType === 'api'" />
    <BookScraper v-else />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import BookApi from './BookApi.vue';
import BookScraper from './BookScraper.vue';

  const bookingType = ref('scraper')
</script>

<style scoped>
/* Your component's styles go here */
</style>