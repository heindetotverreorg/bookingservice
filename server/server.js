const express = require('express')
const app = express()
const path = require('path');
const cors = require('cors')
const port = process.env.VUE_APP_SERVERPORT || 3001
const puppeteer = require('puppeteer')

app.use(cors())
app.use(express.json())

app.use(express.static(path.join(__dirname, '../dist')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.post('/reserve', async (req, res) => {
  const data = await reservePadel(req, res)
  res.send(data)
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

const reservePadel = async () => {
  const time = 10.00
    const returnData = {}
    const main = async () => {
        const browser = await puppeteer.launch({
            headless: false
        });
        const page = await browser.newPage();
        // go to url
        await page.goto('https://bent.baanreserveren.nl/reservations');
        // login
        await page.waitForSelector('input[name="username"]')
        await page.evaluate(() => {
          document.querySelector('input[name="username"]').value = 'mpoortvliet8570';
          document.querySelector('input[name="password"]').value = '10*Matthias';
        })
        await page.click('.button3')
        // go to correct date
        await page.waitForSelector('a[data-offset="+1"]');
        await page.click('a[data-offset="+1"]')
        await delay(1000);
        await page.click('a[data-offset="+1"]')
        await delay(1000);
        await page.click('a[data-offset="+1"]')
        await delay(1000);
        // select correct sport
        await page.select('#matrix-sport', 'sport/1280')
        // select timeslot on court
        let court = 1
        try {
          await selectCourt(page, time, court)
        } catch (error) {
          await selectCourt(page, time, court++)
        }
        returnData.bookedCourt = court
        returnData.bookedTime = time
        await delay(5000);
        await browser.close();
    }
    main();
    return returnData
}

function delay(time) {
   return new Promise(function(resolve) { 
       setTimeout(resolve, time)
   });
}

async function selectCourt(page, time, court) {
  const courtSelector = `tr[data-time="${time}"] [title="Padel Buiten ${court}"]`
  console.log(courtSelector)
  const courtOne = await page.waitForSelector(courtSelector);
  courtOne.click()
}