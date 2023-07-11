let browser = null

const init = (page, freshBrowser) => {
  browser = freshBrowser
  page.setDefaultTimeout(10000);
}

const login = async (page) => {
  await page.waitForSelector('input[name="username"]')
  await page.evaluate(() => {
    document.querySelector('input[name="username"]').value = 'mpoortvliet8570';
    document.querySelector('input[name="password"]').value = '10*Matthias';
  })
  await page.click('.button3')
}

const selectDate = async (page, date) => {
  const regex = new RegExp("^0+(?!$)",'g');
  try {
    const [day, month, year] = date.split('/')
    const selector = `#cal_${year}_${month.replaceAll(regex, '')}_${day}`
    await page.waitForSelector(selector)
    page.click(`${selector} a`)
    await delay(1000)
    return {
      bookedDate: `${day}/${month}/${year}`
    }
  } catch (error) {
    handleError({ message: 'error: couldnt select date: ', body: date, error })
  }
}

const selectSport = async (page) => {
  await page.select('#matrix-sport', 'sport/1280')
}

const selectCourt = async (page, time, court = 1) => {
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

const book = async (page) => {
  page.click('#__make_submit')
  await page.waitForSelector('form')
  await delay(20000);
    // await page.click('submit button')
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
  selectPeople,
  book
}