const express = require('express')
const app = express()
const cors = require('cors')
const port = process.env.VUE_APP_SERVERPORT || 3000
const puppeteer = require('puppeteer')

app.use(cors())
app.use(express.json())

app.get('/reserve', async (req, res) => {
  reservePadel(req, res)
  res.send('Reserved!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

const reservePadel = async (req, res) => {
    async function main() {
        const browser = await puppeteer.launch({
            headless: false
        });
        const page = await browser.newPage();
        await page.goto('https://bent.baanreserveren.nl/reservations');
        await page.type('input[name="username"]', 'mpoortvliet8570');
        await page.type('input[name="password"]', '10*Matthias');
        await page.click('.button3')
        await delay(4000);
        await browser.close();
    }
    main();
}

function delay(time) {
   return new Promise(function(resolve) { 
       setTimeout(resolve, time)
   });
}