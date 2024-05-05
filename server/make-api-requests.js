const puppeteer = require('puppeteer')
const {
    init,
    login,
} = require('./crawl-web-page')
const {
    URL_TO_CRAWL,
    URL_TO_POST
} = require('../constants')
const {
    delay,
    parseTimeAndAdd
} = require('./utils')

const browserConfig = {
    headless: process.env.NODE_ENV === 'production' ? true : false,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    env: {
        DISPLAY: ":10.0"
    }
}

const makeApiRequestBooking = async ({loginName, loginPassword, params}) => {
    const browser = await puppeteer.launch(browserConfig);
    const page = await browser.newPage();
    await init(page, browser, URL_TO_CRAWL)

    try {
        await login(page, loginName, loginPassword)

        // get the booking page based on a timecode url
        await page.goto(params.selectDateUrl, { waitUntil: 'networkidle0' })

        const html = await page.content()

        // get token
        const token = await page.evaluate(() => {
            return document.querySelector('input[name="_token"]').value
        })

        // get the correct account values
        const peopleFromSystem = await getPeopleValues(page, params.people)
        const peopleCodes = peopleFromSystem.map(person => person[2]?.value || person[1]?.value || person[0]?.value)
        console.log('peopleCodes', peopleCodes)

        const twoHoursLater = parseTimeAndAdd(params.timeToBook, true)

        // mimick payload with correct data
        const formData = createFormData({
            token: token,
            courtCode: params.court,
            date: params.dateToBook,
            startTime: params.timeToBook,
            endTime: twoHoursLater,
            people: peopleCodes
        })

        console.log(formData)

        // do post request with formData
        const response = await interceptNewRequestAndPost(page, formData)
        console.log('RESPONSE: ', response)

        if (browser) {
            await browser.close();
        }

        return html
    } catch (error) {
        console.log('ERROR', error)
        if (browser) {
            await browser.close();
        }
        return error
    }    
}
  
module.exports = {
    makeApiRequestBooking,
}

const createFormData = (data) => {
    const formData = new FormData();

    formData.append('_token', data.token);
    formData.append('resource_id', data.courtCode);
    formData.append('date', data.date);
    formData.append('start_time', data.startTime);
    formData.append('end_time', data.endTime);
    
    // Assuming players is an array
    data.people.forEach((player, index) => {
        formData.append(`players[${index + 1}]`, player);
    });

    // Assuming items is an object and each item has an amount property
    let items = {
        3048: { amount: '' },
        3049: { amount: '' }
    };
    
    for (let key in items) {
        formData.append(`items[${key}][amount]`, items[key].amount);
    }
    
    formData.append('notes', '');

    return formData
}

const getPeopleValues = async (page, people) => {
    const selectedPeople = []
    for (const [index, person] of people.entries()) {
        const selector = `[name="players[${index + 1}]"]`
        await page.evaluate(async (person, selector) => {
            const el = document.querySelector(selector)
            if (el) {
                const parentEl = el.parentElement
                if (parentEl) {
                    const inputEl = parentEl.querySelector('input')
                    if (inputEl) {
                        const inputEvent = new Event('input');
                        inputEl.dispatchEvent(inputEvent);
                        inputEl.value = person.replace(' De', '').replace(' de', '')
                    }
                }
            }
        }, person, selector)

        await delay(500)

        // get options from select
        const selectedPersonOptions = await page.evaluate(async (selectedPeople, person, selector) => {
            const el = document.querySelector(selector)
            if (el) {
                const options = [...el.options]
                return options?.map(option => ({ text: option.text, value: option.value }))
            }
        }, selectedPeople, person, selector)

        selectedPeople[index] = selectedPersonOptions
    }

    return selectedPeople
}

const interceptNewRequestAndPost = async (page, formData) => {
    const queryString = new URLSearchParams(formData).toString()

    try {
        const response = await page.evaluate(async (queryString, URL_TO_POST) => {
            try {
                const xhr = new XMLHttpRequest()
                xhr.onreadystatechange = function() {
                    if (xhr.readyState == XMLHttpRequest.DONE) {
                        alert(xhr.responseText);
                    }
                }
                xhr.open('POST',URL_TO_POST, false);
                xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
                xhr.send(`${queryString}`);
            } catch (error) {
                console.log(error)
            }
        }, queryString, URL_TO_POST)

        return response
    } catch (error) {
        console.log(error)

        return error
    }
}