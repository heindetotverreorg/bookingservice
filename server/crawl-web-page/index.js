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
    page.setDefaultTimeout(6000);
    await page.goto(url);
}

const login = async (page) => {
    const login = 'mpoortvliet8570'
    const pw = '10*Matthias'
    try {
      await page.waitForSelector('input[name="username"]')
      await page.evaluate((login, pw) => {
          document.querySelector('input[name="username"]').value = login;
          document.querySelector('input[name="password"]').value = pw;
      }, login, pw)
      await page.click('.button3')
      await delay(1000)
    } catch(error) {
      handleError({ message: `error: couldnt login with info: `, body: `${login} ${pw}`, error }, browser)
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

    console.log('ATTEMPT', attempt)

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
            console.log(error)
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
      const selectPerson = async (people) => people.forEach(async (person, index) => {
          if (index === people.length) return

          // offset because of booking website's weird counting and first person is bookee
          const newIndex = index + 2

          const selector = `[name="players[${newIndex}]"]`

          const options = await page.evaluate(({ selector }) => {
              const selectEl = document.querySelector(selector)
              if (selectEl) {
                  const options = [...selectEl.options]
                  return options.map(option => ({ text: option.text, searchValue: option.value }))
              }
          }, { selector })

          const filteredOptions = options?.reduce((acc, option) => {
              const duplicateOption = acc.find(accOption => accOption.text === option.text)
              if (duplicateOption) {
                  // pick last of duplicates because Patrick's second account is the correct one
                  // can be deleted when all accounts are sorted
                  duplicateOption.searchValue = option.searchValue
                  return acc
              }
              if (!option.searchValue || option.searchValue < 1) {
                return acc
              }
              return [ ...acc, option ]
          }, [])

            const selectedOption = filteredOptions?.find(option => option.text === person)

            if (selectedOption?.searchValue) {
                const selectEl = await page.waitForSelector(selector)
                if (selectEl.value !== selectedOption.searchValue) {
                    await page.select(selector, selectedOption.searchValue)
                    await delay(1000)
                }
            }
        })

        await selectPerson(people)
        await page.waitForSelector('form')
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