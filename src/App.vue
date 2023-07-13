<template>
  <h1>Reserveren padel</h1>
  <div>
    <h3>people</h3>
    <ul>
      <li v-for="person of people" :key="person">
        {{ person }}
      </li>
    </ul>
  </div>
  <div>
    <h3>date and time: (default is every wednesday at {{ defaultTime }} )</h3>
    <input type="date" :valueAsDate="chosenDate"/>
    <label for="time-select">Choose a time:</label>
    <select
      name="time"
      id="time-select"
      v-model="defaultTime"
    >
      <option value="">--Please choose an option--</option>
      <option
        v-for="time of timeOptions()"
        :key="time"
        :selected="time === defaultTime"
        :value="time"
      >
        {{ time }}
      </option>
    </select>
  </div>
  <div>
    <p>chosen date/time {{ chosenDate }} - {{ defaultTime }}</p>
  </div>
  <div>
    <label for="1">check for test run</label>
    <input type="checkbox" id="1" v-model="testValue" />
  </div>
  <div>
    <button @click="reserve">Reserveren</button>
  </div>
  <p>{{ bookingResult }}</p>
</template>

<script setup>
import axios from 'axios'
import { onMounted, ref } from 'vue'

  const bookingResult = ref({})
  const chosenDate = ref('')
  const defaultTime = ref('19:00')
  const testValue = ref(true)

  onMounted(() => {
    date()
  })

  const date = () => {
    const today = new Date();
    today.setDate(today.getDate() + 3)
    chosenDate.value = today.toLocaleDateString();
  }

  const people = [
    'Jonathan Ouwehand',
    'Patrick Gieling',
    'Ricky de Haan',
    'Matthias Poortvliet' 
  ]

  const timeOptions = () => {
    const arr = []
    for (let i = 14; i < 46; i++) {
      const hour = Math.floor(i / 2)
      const minutes = i % 2 === 0 ? '00' : '30'
      arr.push(`${hour}:${minutes}`)
    }
    return arr
  }

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
