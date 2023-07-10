const express = require('express')
const app = express()
const path = require('path');
const cors = require('cors')
const port = process.env.VUE_APP_SERVERPORT || 3001
const puppeteer = require('puppeteer')

app.use(cors())
app.use(express.json())

app.use(express.static(path.join(__dirname, '../dist')));

let browser = null

const setBrowserCallBack = (browserToClose) => browser = browserToClose

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.post('/reserve', async (req, res) => {
  const { date, time, people } = req.body
  console.log(`payload: ${date} ${time} ${people}`)
  const data = await reservePadel(date, time, people, setBrowserCallBack)
  res.send(data)
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

const reservePadel = async (date, time, people, setBrowserCallBack) => {
  const returnData = {}
  
  try {
    const browser = await puppeteer.launch({
      headless: false
    });
    const page = await browser.newPage();
    setBrowserCallBack(browser)
    page.setDefaultTimeout(2000);

    // go to url
    console.log('go to url')
    await page.goto('https://bent.baanreserveren.nl/reservations');

    // login
    console.log('login')
    await login(page)

    // go to correct date
    console.log('go to correct date')
    await setCorrectDate(page)

    // select correct sport
    console.log('select correct sport')
    await page.select('#matrix-sport', 'sport/1280')

    // select timeslot on court
    console.log('select correct timeslot on court')
    let { court } = await selectCourt(page, time)

    // select people
    console.log('select people')
     await selectPeople(page, people)

    // click book
    console.log('book')
    page.click('#__make_submit')
    await page.waitForSelector('form')
    await delay(20000);

    // handle result
    returnData.bookedCourt = court
    returnData.bookedTime = time
    returnData.bookedDate = 'today + 4'
    
    await browser.close();
    return returnData
  } catch (error) {
    return error
  }
}

function handleError(params) {
  browser.close()
  throw `${params.message} ${params.body} ${params.error}`
}

function delay(time) {
   return new Promise(function(resolve) { 
       setTimeout(resolve, time)
   });
}

async function selectCourt(page, time, court = 1) {
  try {
    const courtSelector = `tr[data-time="${time}"] [title="Padel Buiten ${court}"]`
    const courtOne = await page.waitForSelector(courtSelector);
    courtOne.click()
    await page.waitForSelector('.lightbox')
    return {
      court
    }
  } catch(error) {
    if (court <= 4) {
      await selectCourt(page, time, court + 1)
    }
    handleError({ message: 'error: couldnt book court for timeslot: ', body: time, error })
  }
}

async function selectPeople(page, people) {
  try {
    const selectPerson = async (people) => people.forEach(async (person, index) => {
      const newIndex = index + 2
      if (index === people.length) return
      const selector = `[name="players[${newIndex}]"]`

      const options = await page.evaluate(({ selector }) => {
        const selectEl = document.querySelector(selector)
        if (selectEl) {
          const options = [...selectEl.options]
          return options.map(option => ({ text: option.text, searchValue: option.value }))
        }
      }, { selector })

      const filteredOptions = options?.reduce((acc, option) => {
        if (acc.find(accOption => accOption.text === option.text)) {
          return acc
        }
        return [ ...acc, option ]
      }, [])

      const selectedOption = filteredOptions?.find(option => option.text === person)

      if (selectedOption?.searchValue) {
        const selectEl = await page.waitForSelector(selector)
        if (selectEl.value !== selectedOption.searchValue) {
          await page.select(selector, selectedOption.searchValue)
        }
      }
    })
    
    await selectPerson(people)
    await page.waitForSelector('form')
    return
  } catch (error) {
    handleError({ message: 'error: couldnt select people: ', body: people, error })
  }
}

async function login(page) {
  await page.waitForSelector('input[name="username"]')
  await page.evaluate(() => {
    document.querySelector('input[name="username"]').value = 'mpoortvliet8570';
    document.querySelector('input[name="password"]').value = '10*Matthias';
  })
  await page.click('.button3')
}

async function setCorrectDate(page) {
  await page.waitForSelector('a[data-offset="+1"]');
  await page.click('a[data-offset="+1"]')
  await delay(500);
  await page.click('a[data-offset="+1"]')
  await delay(500);
  await page.click('a[data-offset="+1"]')
  await delay(500);
}