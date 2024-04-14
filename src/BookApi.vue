<template>
    <div>
        <h2>Datum waarop je wilt spelen</h2>
        <label for="date-select">Dag:</label>
        <input
            type="date"
            id="date-select"
            v-model="requestPayload.dateToBook"
            @input="handleDateRequest"
        />
    </div>

  </template>
  
  <script setup>
// import axios from 'axios'
import { reactive, ref } from 'vue';
import * as dayjs from 'dayjs'

  const baseUrl = 'https://bent.baanreserveren.nl/reservations/make';
  const handleDateUrl = '4435'

  const requestPayload = reactive({
    loginName: '',
    loginPassword: '',
    people: [''],
    dateToBook: '',
    timeToBook: '',
  });

  const currentStep = ref(0);

  const handleDateRequest = async () => {
    console.log('Date requested:', requestPayload.dateToBook);
    console.log(dayjs(requestPayload.dateToBook).unix())

    const unixDateFormat = dayjs(requestPayload.dateToBook).unix() / 1000

    const url = `${baseUrl}/${handleDateUrl}/${unixDateFormat}`

    console.log(`url for date ${requestPayload.dateToBook}: ${url}`)

    try {
        // const { data } = await axios.get(url)
        // console.log(data)
    } catch (error) {
        console.log(error)
    }

    nextStep();
  };

  const nextStep = () => {
    currentStep.value++;
  };
  </script>