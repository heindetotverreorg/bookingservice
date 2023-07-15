let browser = null
const removeLeadingZeroRegex = new RegExp("^0+(?!$)",'g');

const init = async (page, freshBrowser, url) => {
  browser = freshBrowser
  page.setDefaultTimeout(5000);
  await page.goto(url);
}

const login = async (page) => {
  await page.waitForSelector('input[name="username"]')
  await page.evaluate(() => {
    document.querySelector('input[name="username"]').value = 'mpoortvliet8570';
    document.querySelector('input[name="password"]').value = '10*Matthias';
  })
  await page.click('.button3')
}

const selectDate = async (page, date, pass = 0, reverse) => {
  try {
    let selector = ''
    const [day, month, year] = date.split('/')
    if (!reverse) {
      selector = `#cal_${year}_${month.replaceAll(removeLeadingZeroRegex, '')}_${day.replaceAll(removeLeadingZeroRegex, '')}`
    } else {
      selector = `#cal_${year}_${day.replaceAll(removeLeadingZeroRegex, '')}_${month.replaceAll(removeLeadingZeroRegex, '')}`
    }
    await page.waitForSelector(selector)
    page.click(`${selector} a`)
    await delay(1000)
    return {
      bookedDate: `${day}/${month}/${year}`
    }
  } catch (error) {
    if (pass === 0) {
      return selectDate(page, date, pass + 1, true)
    } else {
      handleError({ message: 'error: couldnt select date: ', body: date, error })
    }
  }
}

const selectSport = async (page) => {
  await page.select('#matrix-sport', 'sport/1280')
}

const selectCourt = async (page, time, court = 4) => {
  try {
    const courtSelector = `tr[data-time="${time.replaceAll(removeLeadingZeroRegex, '')}"] [title="Padel Buiten ${court}"]`
    const selectedCourt = await page.waitForSelector(courtSelector);
    selectedCourt.click()
    
    await page.waitForSelector('.lightbox')

    return {
      court
    }
  } catch(error) {
    if (court !== 0) {
      return await selectCourt(page, time, court - 1)
    } else {
      handleError({ message: `error: couldnt book court ${court} for timeslot: `, body: time, error })
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
    handleError({ message: 'error: check for booking type: ', body: '', error })
  }
}

const selectLongerTimeSlot = async (page) => {
    try {
      const selector = `select[name="end_time"]`

      await page.waitForSelector(selector)

      const options = await page.evaluate(({ selector }) => {
        const selectEl = document.querySelector(selector)
        if (selectEl) {
          const options = [...selectEl.options]
          return options.map(option => (option.text))
        }
      }, { selector })

      const lastOption = options[options.length - 1]

      await page.select(selector, lastOption)
    } catch (error) {
      handleError({ message: 'error: set longer time slot out of peak time: ', body: '', error })
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
    handleError({ message: 'error: couldnt select people: ', body: people, error })
  }
}

const book = async (page, test = true) => {
  try {
    page.click('#__make_submit')

    page.on('dialog', async dialog => {
      await dialog.dismiss();
    })
    // important to actually close the dialog (if its present) or the worker wont shut down properly, so we delay a bit
    await delay(2000)

    const els = await page.evaluate(() => {
      const matches = document.querySelectorAll('th')
      return [...matches].map(match => ({ text: match.innerText }))
    })

    const isConfirmModalVisible = !!els.find(el => el.text.includes('Bevestig uw reservering'))

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
    handleError({ message: 'error: couldnt submit', body: '', error })
  }
}

const delay = (time) => {
  return new Promise(function(resolve) { 
      setTimeout(resolve, time)
  });
}

const handleError = (params) => {
  browser.close()
  throw `${params.message} ${params.body} ${params.error}`
}

module.exports = {
  init,
  login,
  selectDate,
  selectSport,
  selectCourt,
  checkForBookingType,
  selectLongerTimeSlot,
  selectPeople,
  book
}