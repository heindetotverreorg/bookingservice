<template>
  <div>
    <div>
      <h3>Selecteer account</h3>
      <div>
        <input v-model="requestPayload.loginName" type="text" />
      </div>
      <div>
        <input v-model="requestPayload.loginPassword" type="password" />
      </div>
    </div>
    <h2>Selecteer mensen</h2>
    <ul class="list">
      <li v-for="person, index of people" :key="person">
        <input v-model="requestPayload.people[index]" type="text" />
      </li>
    </ul>
    <h2>Selecteer baan</h2>
    <label for="time-select">Baan:</label>
    <select
      name="time"
      id="time-select"
      v-model="requestPayload.court"
    >
      <option value="">--Please choose an option--</option>
      <option
        v-for="court of courts"
        :key="court"
        :selected="court === requestPayload.court"
        :value="court.court"
      >
        {{ court.label }}
      </option>
    </select>
    <h2>Datum en tijd waarop je wilt spelen</h2>
    <div class="flex">
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
        <button @click="handlRequest">Doorgaan</button>
    </div>
  </div>
  <div v-html="view" />
  <div v-if="loading">Loading...</div>
</template>
  
  <script setup>
import { reactive, ref } from 'vue';
import dayjsPluginUTC from 'dayjs-plugin-utc'
import * as dayjs from 'dayjs'
import axios from 'axios';

  dayjs.extend(dayjsPluginUTC, { parseToLocal: true })

  const baseUrl = 'https://bent.baanreserveren.nl/reservations/make';

  const courts = [
    { court: 2992, label: 'Baan 1' },
    { court: 4435, label: 'Baan 2' },
    { court: 4436, label: 'Baan 3' },
    { court: 4437, label: 'Baan 4' }
  ]

  const people = [
    'Matthias Poortvliet',
    'Jonathan Ouwehand',
    'Patrick Gieling',
    'Ricky de Haan'
  ]

  const requestPayload = reactive({
    loginName: 'mpoortvliet8570',
    loginPassword: '10*Matthias',
    people,
    court: courts[0],
    dateToBook: '',
    timeToBook: '',
  });

  const loading = ref(false);
  const view = ref(null)

  const timeOptions = () => {
      const arr = []
      for (let i = 14; i < 46; i++) {
        const hour = Math.floor(i / 2)
        const minutes = i % 2 === 0 ? '00' : '30'
        arr.push(`${hour}:${minutes}`)
      }
      return arr
  }

  const handlRequest = async () => {
    const unixDateFormat = `${dayjs(`${requestPayload.dateToBook}T${requestPayload.timeToBook}:00.000Z`).subtract(2, 'hours').unix()}`

    const selectDateUrl = `${baseUrl}/${requestPayload.court}/${unixDateFormat}`

    try {
      loading.value = true;

      const requestUrl = '/make-api-requests'

      const { data: apiUrlResponse } = await axios.post(requestUrl, {
        params: {
          selectDateUrl,
          ...requestPayload
        }
      })

      view.value = apiUrlResponse
    } catch (error) {
      console.log(error)
    }

    loading.value = false;
  };
</script>
<style>
.flex {
  display: flex;
}
</style>