let browser = null
let attempt = 1
const removeLeadingZeroRegex = new RegExp("^0+(?!$)",'g');
const {
    delay,
    handleError,
    parseTimeAndAdd
} = require('./../utils')

const init = async (page, freshBrowser, url) => {
    browser = freshBrowser
    page.setDefaultTimeout(3000);
    await page.goto(url);
}

const login = async (page, loginName, loginPassword) => {
    try {
      await page.waitForSelector('input[name="username"]')
      await page.evaluate((loginName, loginPassword) => {
          document.querySelector('input[name="username"]').value = loginName;
          document.querySelector('input[name="password"]').value = loginPassword;
      }, loginName, loginPassword)
      await page.click('.button3')
      await delay(1000)
    } catch(error) {
      handleError({ message: `error: couldnt login with info: `, body: `${loginName} ${loginPassword}`, error }, browser)
    }
}

const selectSport = async (page) => {
    try {
        await page.select('#matrix-sport', 'sport/1280')
    } catch (error) {
        handleError({ message: `error: couldnt select sport from dropdown: `, body: '', error }, browser)
    }
}

const selectDate = async (page, date, pass = 0, reverse) => {
    try {
        let selector = ''
        if (date.includes('-')) {
           date = date.replaceAll('-', '/')
        }
        const [day, month, year] = date.split('/')
        if (!reverse) {
            selector = `#cal_${year}_${month.replaceAll(removeLeadingZeroRegex, '')}_${day.replaceAll(removeLeadingZeroRegex, '')}`
        } else {
            selector = `#cal_${year}_${day.replaceAll(removeLeadingZeroRegex, '')}_${month.replaceAll(removeLeadingZeroRegex, '')}`
        }
        await page.waitForSelector(selector)
        await page.click(`${selector} a`)
        await delay(1000)
        return {
           bookedDate: `${day}/${month}/${year}`
        }
    } catch (error) {
        if (pass === 0) {
           return selectDate(page, date, pass + 1, true)
        } else {
            handleError({ message: 'error: couldnt select date: ', body: date, error }, browser)
        }
    }
}

const selectCourtAndTime = async (page, time, pass, court = 4) => {
    const [hours, minutes] = time.split(':')
    let newtime = hours.length === 1 ? `0${hours}:${minutes}` : `${hours}:${minutes}`

    try {
        const courtSelector = `tr[data-time="${newtime}"] [title="Padel Buiten ${court}"]`
        const selectedCourt = await page.waitForSelector(courtSelector);

        const courtSelectorExtraHalfHour = `tr[data-time="${newtime}"] [title="Padel Buiten ${court}"]`
        const selectedCourtExtraHalfHour =  await page.waitForSelector(courtSelectorExtraHalfHour);
        await selectedCourtExtraHalfHour.click()
        await page.waitForSelector('.lightbox')
        await page.click('#__make_cancel')

        await selectedCourt.click()
        await page.waitForSelector('.lightbox')

        await selectLongerTimeSlot(page)

        attempt = 1

        return {
           court
        }
    } catch(error) {
        if (court !== 0) {
            return await selectCourtAndTime(page, time, pass, court - 1)
        } else {
            // if the chosen timeslot isnt available, we try for one full hour later
            // the booking website sometimes supports half hours, and sometimes doesnt so trying for one hour later is most valid
            const newtime = parseTimeAndAdd(time, true)
            attempt++
            if (attempt < 3) {
                console.log(`NEW BOOKING ATTEMPT WITH NEW TIME: attempt: ${attempt} | time: ${newtime}`)
                return await selectCourtAndTime(page, newtime, pass, 4)
            }
            handleError({ message: `error: couldnt book court ${court} ${attempt ? 'after two attempts at different times  ' : ''}for timeslot: `, body: time, error }, browser)
            attempt = 0
        }
    }
}

const checkForBookingType = async (page) => {
    try {
        const els = await page.evaluate(() => {
            const popup = document.querySelector('.lightbox')
            const matches = popup.querySelectorAll('td')
            return [...matches].map(match => ({ text: match.innerText }))
        })

        const isPeak = !!els.find(el => el.text.includes('piek'))
      
        return {
           isPeak
        }
    } catch (error) {
        handleError({ message: 'error: check for booking type: ', body: '', error }, browser)
    }
}

const selectLongerTimeSlot = async (page) => {
    const selector = `select[name="end_time"]`

    await page.waitForSelector(selector)

    const options = await page.evaluate(({ selector }) => {
        const selectEl = document.querySelector(selector)
        if (selectEl) {
            const options = [...selectEl.options]
            return options.map(option => (option.text))
        }
    }, { selector })

    if (options.length !== 3) {
       throw new Error('available time slot select options is less than 3, so no full hour can be booked')
    }

    const lastOption = options[options.length - 1]

    await page.select(selector, lastOption)
}

const getEndTime = async (page) => {
    try {
      const selector = `select[name="end_time"]`

      await page.waitForSelector(selector)

      const endTimeValue = await page.evaluate(({ selector }) => {
          const selectEl = document.querySelector(selector)
          if (selectEl) {
              const value = selectEl.value
              return value
          }
      }, { selector })

      return { endtime: endTimeValue }
      
    } catch (error) {
        handleError({ message: 'error: couldnt fetch end time: ', body: '', error }, browser)
    }
}

const selectPeople = async (page, people) => {
    try {
        const selectedPeople = []

        const setValues = async () => {
            for (const [index, person] of people.entries()) {
                const selector = `[name="players[${index + 2}]"]`
                await page.evaluate(async (person, selector) => {
                    const el = document.querySelector(selector)
                    if (el) {
                        const parentEl = el.parentElement
                        if (parentEl) {
                            const inputEl = parentEl.querySelector('input')
                            if (inputEl) {
                                const inputEvent = new Event('input');
                                inputEl.dispatchEvent(inputEvent);
                                inputEl.value = person
                            }
                        }
                    }
                }, person, selector)
                await delay(500)
            }
        }

        const checkValues = async () => {
            for (const [index, person] of people.entries()) {
                const selector = `[name="players[${index + 2}]"]`
                const selectedPersonOptions = await page.evaluate(async (selectedPeople, person, selector) => {
                    selectedPeople.push({ person })
                    const el = document.querySelector(selector)
                    if (el) {
                        const options = [...el.options]
                        return options.map(option => (option.text))
                    }
                }, selectedPeople, person, selector)

                if (!selectedPersonOptions?.length) return

                // super stupid weird Patrick hack
                const lastOption = person.includes('Patrick Gieling')
                    ? selectedPersonOptions[selectedPersonOptions.length - 2]
                    : selectedPersonOptions[selectedPersonOptions.length - 1]

                const trimmedPerson = lastOption?.replace(' De', '')
                if (trimmedPerson === person) {

                    selectedPeople.push(person)
                }
            }
        }

        await setValues()
        await checkValues()

        if (selectedPeople.length === people.length) {
            await page.waitForSelector('form')
        } else {
            const difference = people.filter(person => !selectedPeople.includes(person));

            throw `Couldnt select person(s): ${difference}`
        }
        return 
    } catch (error) {
        handleError({ message: 'error: couldnt select people: ', body: people, error }, browser)
    }
}

const selectCourtTimePeopleAndConfirm = async (pass, page, time, people, test, isPreviousBookingPeak) => {
    if (isPreviousBookingPeak || pass > 1) {
        return {}
    }

    if (pass > 0) {
       time = parseTimeAndAdd(time, true)
    }

    const { court } = await selectCourtAndTime(page, time, pass)

    const { isPeak } = await checkForBookingType(page) 

    const { endtime } = await getEndTime(page)

    await selectPeople(page, people)

    await book(page, test)

    return { court, time, endtime, isPeak }
}


const book = async (page, test = true) => {
    try {
      // set event listener for dialog
      page.on('dialog', async dialog => {
          if (dialog) {
            await dialog.dismiss();
          }
      })

      await page.click('#__make_submit')

      // important to actually close the dialog (if its present) or the worker wont shut down properly, so we delay a bit
      await delay(1000)

      const els = await page.evaluate(() => {
          const matches = document.querySelectorAll('th')
          return [...matches].map(match => ({ text: match.innerText }))
      })

      const isConfirmModalVisible = !!els.find(el => el.text.includes('Bevestig uw reservering'))

      // important to actually wait for detecting of confirmDialog because on prod it doesnt always await the evaluate statement
      await delay(1000)

      if (!isConfirmModalVisible) {
          throw 'An error occurred while booking, confirm window not visible, check for double booking'
      }

      if (test) {
          console.log('TEST = SUCCESS')
          await page.click('#__make_cancel2')
          await delay(1000)
          await page.click('#__make_cancel')
          await delay(1000)
      } else {
          console.log('REAL BOOKING = SUCCESS')
          await page.click('#__make_submit2')
          await delay(1000)
          await page.goBack()
          await delay(1000)
      }
      
      return
    } catch (error) {
        handleError({ message: 'error: couldnt submit', body: '', error }, browser)
    }
}

module.exports = {
    delay,
    init,
    login,
    selectDate,
    selectSport,
    selectCourtAndTime,
    checkForBookingType,
    selectLongerTimeSlot,
    getEndTime,
    selectPeople,
    book,
    parseTimeAndAdd,
    selectCourtTimePeopleAndConfirm
}