<template>
  <h1>Reserveren padel</h1>
  <div>
    <h3>Login</h3>
    <div>
      <input v-model="requestPayload.loginName" type="text" />
    </div>
    <div>
      <input v-model="requestPayload.loginPassword" type="password" />
    </div>
  </div>
  <div>
    <h3>Accounts</h3>
    <ul class="list">
      <li v-for="person, index of people" :key="person">
        <input v-model="requestPayload.people[index]" type="text" />
      </li>
    </ul>
  </div>
  <div>
    <h3>Booking</h3>
    <label for="1">IS TEST</label>
    <input type="checkbox" id="1" v-model="requestPayload.isTestRun" />
  </div>
  <div v-if="requestPayload.isTestRun">
    <label for="test-time">test moment for cron</label>
    <select
      name="time"
      id="test-time"
      v-model="requestPayload.testRunTime"
    >
      <option value="">--Please choose a time for the cron job to run--</option>
      <option
        v-for="time of timeOptions()"
        :key="time"
        :selected="time === requestPayload.testRunTime"
        :value="time"
      >
        {{ time }}
      </option>
    </select>
    <div class="inline">
      <h2>Gepland reserveren {{ presentationDate }} - {{ requestPayload.timeToBook }}</h2>
    </div>
    <div>
      <button @click="reserve({ schedule: 'set' })">Zet geplande reservering aan</button>
    </div>
  </div>
  <div class="m-t-1">
    <div>
      <div>
        <label for="date-select">Dag:</label>
        <input
          type="date"
          id="date-select"
          v-model="requestPayload.dateToBook"
        />
      </div>
      <div>
        <label for="time-select">Tijd:</label>
        <select
          name="time"
          id="time-select"
          v-model="requestPayload.timeToBook"
        >
          <option value="">--Please choose an option--</option>
          <option
            v-for="time of timeOptions()"
            :key="time"
            :selected="time === requestPayload.timeToBook"
            :value="time"
          >
            {{ time }}
          </option>
        </select>
      </div>
    </div>
    <h2>Reserveren op {{ presentationDate }} - {{ requestPayload.timeToBook }}:</h2>
    <div class="m-t-1">
      <button @click="reserve({ schedule: 'direct' })">Reserveren</button>
    </div>
  </div>
  <div class="m-t-1">
    <div class="m-t-1">
      <button @click="reserve({ schedule: 'cancel' })">Annuleer reservering</button>
    </div>
    <div class="m-t-1">
      <button @click="reserve({ schedule: 'check' })">Controleer reservering</button>
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
import moment from 'moment';
import momentTimezone from 'moment-timezone'
import { onMounted, ref, computed, reactive } from 'vue'

  const people = [
    'Jonathan Ouwehand',
    'Patrick Gieling',
    'Ricky de Haan',
    'Matthias Poortvliet'
  ]

  const bookingResult = ref(null)
  const isLoading = ref(false)
  const requestPayload = reactive({
    loginName: 'mpoortvliet8570',
    loginPassword: '10*Matthias',
    people,
    isTestRun: false,
    testRunTime: '11:00',
    dateToBook: '',
    timeToBook: '19:00'
  })

  onMounted(() => {
    date()
  })

  const presentationDate = computed(() => {
    return moment(requestPayload.dateToBook).format('dddd DD-MM-YYYY')
  })

  const date = () => {
    const today = moment()
    today.add(3, 'days')
    requestPayload.dateToBook = today.format('YYYY-MM-DD')
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
    bookingResult.value = null

    let url

    if (schedule === 'direct') {
      url = `${process.env.VUE_APP_BOOKING_URL}`
    }
    if (schedule === 'set') {
      url = `${process.env.VUE_APP_BOOKING_URL}-start-scheduled-booking`
    }
    if (schedule === 'cancel') {
      url = `${process.env.VUE_APP_BOOKING_URL}-stop-scheduled-booking`
    }
    if (schedule === 'check') {
      url = `${process.env.VUE_APP_BOOKING_URL}-check-scheduled-booking`
    }

    const date = formatToRTFC(momentTimezone(requestPayload.dateToBook).tz('Europe/Amsterdam'))

    const testDateTime = createTestDateTimeMoment(requestPayload.testRunTime)

    const payload = {
      ...requestPayload,
      dateToBook: date,
      testDateTime: testDateTime
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

  const createTestDateTimeMoment = (time) => {
    const date = moment()
    const dateTimezoned = momentTimezone().tz('Europe/Amsterdam')
    const [hour, minutes] = time.split(':')
    date.set('hour', hour)
    date.set('minutes', minutes)

    const [hourtz, minutestz] = time.split(':')
    dateTimezoned.set('hour', hourtz)
    dateTimezoned.set('minutes', minutestz)
    return formatToRTFC(dateTimezoned)
  }

  const formatToRTFC = (moment) => {
    const f = "ddd, DD MMM YYYY HH:mm:ss ZZ"
    return moment.format(f)
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

.list {
  list-style-type: none;
  padding: 0;
}
</style>