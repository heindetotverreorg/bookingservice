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
    <label for="1">check for test run</label>
    <input type="checkbox" id="1" v-model="testValue" />
  </div>
  <div class="m-t-1">
    <h2>run custom job:</h2>
    <div>
      <div class="inline">
        <p>chosen date/time</p><h3> {{ presentationDate }} - {{ defaultTime }}</h3>
      </div>
      <div>
        <label for="date-select">Choose a date:</label>
        <input
          type="date"
          id="date-select"
          v-model="chosenDate"
        />
      </div>
      <div>
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
    </div>
    <div class="m-t-1">
      <button @click="reserve">Reserveren</button>
    </div>
  </div>
  <div class="m-t-1">
    <div class="inline">
      <h2>run scheduled job</h2><p>(is always set with default date/time: every wednesday at 19:00)</p>
    </div>
    <div>
      <button @click="reserve({ schedule: 'set' })">Set scheduled job at sunday 00:00</button>
      <button @click="reserve({ schedule: 'cancel' })">Cancel scheduled job</button>
    </div>
  </div>
  <div>
    <p v-if="isLoading">LOADING ....</p>
    <p class="red" v-if="!parsedResult">{{ bookingResult }}</p>
    <div v-else>
      <h2 v-for="line of parsedResult" :key="line">{{ line }}</h2>
    </div>
  </div>
</template>

<script setup>
import axios from 'axios'
import { onMounted, ref, computed } from 'vue'

  const bookingResult = ref(null)
  const chosenDate = ref('')
  const defaultTime = ref('19:00')
  const testValue = ref(true)
  const isLoading = ref(false)

  onMounted(() => {
    date()
  })

  const presentationDate = computed(() => {
    return new Date(chosenDate.value).toLocaleDateString();
  })

  const date = () => {
    const today = new Date();
    today.setDate(today.getDate() + 3)
    chosenDate.value = today
  }

  const parsedResult = computed(() => {
    if (bookingResult.value === null) {
      return null
    }

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

  const reserve = async ({ schedule }) => {
    bookingResult.value = {}
    const url = `${process.env.VUE_APP_BOOKING_URL}${schedule === 'set' ? '-start-scheduled-booking' : ''}${schedule === 'cancel' ? '-stop-scheduled-booking' : ''}`
    const date = new Date(chosenDate.value).toLocaleDateString();

    const payload = {
      date: date,
      time: defaultTime.value,
      people: people,
      test: testValue.value
    }

    try {
      isLoading.value = true
      const { data } = await axios.post(url, payload)
      bookingResult.value = data
      isLoading.value = false
    } catch (error) {
      isLoading.value = false
    }
  }
</script>
<style scoped>
.m-t-1 {
  margin-top: 20px;
}

.m-t-2 {
  margin-top: 60px;
}

.inline {
  display: inline
}

.red {
  color: red;
}
</style>