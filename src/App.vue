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
</template>

<script setup lang="ts">
import axios from 'axios'

  const date = new Date().toLocaleString();

  const people = [
    'jona',
    'patrick',
    'ricky',
    'matthias' 
  ]

  const reserve = async () => {
    console.log(process.env);

    const hostname = new URL(window.location.href).hostname
    const url = `http://${hostname}:${3000}/reserve`

    console.log(url)

    try {
      await axios.post(url, {
        date: date,
        people: people
      })
    } catch (error) {
      console.log(error)
    }
  }
</script>
