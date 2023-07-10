<template>
  <h1>Reserveren padel</h1>
  <p>people</p>
  <ul>
    <li v-for="person of people" :key="person">
      {{ person }}
    </li>
  </ul>
  <p>date and time: (default is every wednesday at {{ defaultTime }} )</p>
  <input type="date" placeholder="date dd/mm/yyyy"/>
  <input type="text" placeholder="time hh:mm"/>
  <p>chosen date/time {{ chosenDate }} - {{ defaultTime }}"</p>
  <button @click="reserve">Reserveren</button>
  <p>{{ bookingResult }}</p>
</template>

<script setup>
import axios from 'axios'
import { onMounted, ref } from 'vue'

  const bookingResult = ref({})
  const chosenDate = ref('')
  const defaultTime = ref('14:30')

  onMounted(() => {
    date()
  })

  const date = () => {
    const today = new Date();
    today.setDate(today.getDate() + 4)
    chosenDate.value = today.toLocaleDateString();
  }

  const people = [
    'Jonathan Ouwehand',
    'patrick',
    'ricky',
    'matthias' 
  ]

  const reserve = async () => {
    const hostname = new URL(window.location.href).hostname
    const url = `http://${hostname}:${process.env.VUE_APP_SERVERPORT}/reserve`

    try {
      const { data } = await axios.post(url, {
        date: chosenDate.value,
        time: defaultTime.value,
        people: people
      })
      bookingResult.value = data
    } catch (error) {
      console.log(error)
    }
  }
</script>
