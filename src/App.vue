<template>
  <h1>Reserveren padel</h1>
  <p>people</p>
  <ul>
    <li v-for="person of people" :key="person">
      {{ person }}
    </li>
  </ul>
  <p>date and time:</p>
  <p>{{ date }}</p>
  <button @click="reserve">Reserveren</button>
  <p>{{ bookingResult }}</p>
</template>

<script setup>
import axios from 'axios'
import { ref } from 'vue'

  const bookingResult = ref({})

  const date = new Date().toLocaleString();

  const people = [
    'jona',
    'patrick',
    'ricky',
    'matthias' 
  ]

  const reserve = async () => {
    const hostname = new URL(window.location.href).hostname
    const url = `http://${hostname}:${process.env.VUE_APP_SERVERPORT}/reserve`

    try {
      const bookingResult = await axios.post(url, {
        date: date,
        people: people
      })
      bookingResult.value = bookingResult
    } catch (error) {
      console.log(error)
    }
  }
</script>
