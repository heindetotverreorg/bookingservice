<template>
  <h1>Reserveren padel</h1>
  <div>
    <h3>Bookee</h3>
    <p>{{ bookee }}</p>
    <h3>people</h3>
    <ul>
      <li v-for="person of people" :key="person">
        {{ person }}
      </li>
    </ul>
  </div>
  <div>
    <h3>date and time: (default is every wednesday at 19:00 )</h3>
    <h4>PS: run script on sunday to auto book on wednesday, or select a date from datepicker</h4>
    <label for="date-select">Choose a date:</label>
    <input
      type="date"
      id="date-select"
      v-model="chosenDate"
    />
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
  <p v-if="!parsedResult">{{ bookingResult }}</p>
  <div v-else>
    <h2 v-for="line of parsedResult" :key="line">{{ line }}</h2>
  </div>
</template>

<script setup>
import axios from 'axios'
import { onMounted, ref, computed } from 'vue'

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

  const parsedResult = computed(() => {
    if (typeof bookingResult.value !== 'string' && Object.values(bookingResult.value).length) {
      return Object.values(bookingResult.value)
    }
    return null
  })

  const people = [
    'Jonathan Ouwehand',
    'Patrick Gieling',
    'Ricky de Haan',
    'Matthias Poortvliet' 
  ]

  const bookee = 'Matthias Poortvliet'

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
    const url = `http://127.0.0.1:${process.env.VUE_APP_SEVERPORT}/reserve`
    const date = new Date(chosenDate.value).toLocaleDateString();

    console.log(url)

    const payload = {
      date: date,
        time: defaultTime.value,
        people: people,
        test: testValue.value
    }

    try {
      const { data } = await axios.post(url, payload)
      bookingResult.value = data
    } catch (error) {
      console.log(error)
    }
  }
</script>
