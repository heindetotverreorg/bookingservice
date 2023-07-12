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
  <label for="1">check for test run</label><input type="checkbox" id="1" v-model="testValue" />
  <p>chosen date/time {{ chosenDate }} - {{ defaultTime }}"</p>
  <button @click="reserve">Reserveren</button>
  <p>{{ bookingResult }}</p>
</template>

<script setup>
import axios from 'axios'
import { onMounted, ref } from 'vue'

  const bookingResult = ref({})
  const chosenDate = ref('')
  const defaultTime = ref('18:00')
  const testValue = ref(true)

  onMounted(() => {
    date()
  })

  const date = () => {
    const today = new Date();
    today.setDate(today.getDate() + 2)
    chosenDate.value = today.toLocaleDateString();
  }

  const people = [
    'Jonathan Ouwehand',
    'Patrick Gieling',
    'Ricky de Haan',
    'Matthias Poortvliet' 
  ]

  const reserve = async () => {
    const hostname = new URL(window.location.href).hostname
    const url = `http://${hostname}:${process.env.VUE_APP_SERVERPORT}/reserve`

    try {
      const { data } = await axios.post(url, {
        date: chosenDate.value,
        time: defaultTime.value,
        people: people,
        test: testValue.value
      })
      bookingResult.value = data
    } catch (error) {
      console.log(error)
    }
  }
</script>
