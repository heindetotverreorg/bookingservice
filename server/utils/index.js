const moment = require('moment-timezone');

const breakDownCurrentTime = () => {
    const week = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const momentDate = moment()
    const day = momentDate.day()
    const hour = momentDate.hour()
    const minute = momentDate.minute()
    const seconds = momentDate.seconds()

    return {
        writtenDay: week[day],
        hour,
        minute,
        seconds
    }
}

const breakDownTaskDate = (task) => {
    const pattern = task?._scheduler?.timeMatcher?.pattern
    const timezone = task?._scheduler?.timeMatcher?.timezone
    const dateFromCron = cronToDateTime(pattern)
    const m = moment(dateFromCron);
    const date = `${m.date()}/${m.month() + 1}`
    const time = `${m.hours()}:${m.minutes()}`
    const [hours, minutes] = time.split(':')

    return {
       date, hours, minutes, timezone
    }
}

const convertFormattedDateToTimezonedDate = (formattedDate) => {
    // takes a flat formattedDate
    return moment(formattedDate).tz('Europe/Amsterdam').format('MM/DD/YYYY')
}

const cronToDateTime = (cronExpression) => {
    const cronArray = cronExpression.split(' ');
    const dateTime = moment()
        .seconds(cronArray[0])
        .minutes(cronArray[1])
        .hours(cronArray[2])
        .date(cronArray[3])
        .month(cronArray[4] - 1)
        .day(cronArray[5]);

    return dateTime.format();
}

const delay = (time) => {
    return new Promise(function(resolve) { 
        setTimeout(resolve, time)
    });
  }

const dateTimeToCron = (dateTime) => {
    const dutchDateTime = moment(dateTime).tz('Europe/Amsterdam')
    const m = moment(dutchDateTime);
    const cronExpression = `${m.seconds()} ${m.minutes()} ${m.hours()} ${m.date()} ${m.month() + 1} ${m.day()}`;
    return cronExpression;
}

const formatToRTFC = (moment) => {
    // takes a moment instance
    const f = "ddd, DD MMM YYYY HH:mm:ss ZZ"
    return moment.format(f)
}

const handleError = (params, browser) => {
    console.log('ERROR')
    console.log(params)
    browser.close()
    throw `${params.message} ${params.body} ${params.error}`
}

const isDateMoreThanThreeDaysEarlier = (payloadDate) => {
    const currentDateMoment = moment()
    const payloadDateMoment = moment(payloadDate);
    const differenceInDays = currentDateMoment.diff(payloadDateMoment, 'days');

    return differenceInDays <= -3;
}

const parseTimeAndAdd = (time, addOneHour) => {
    const minutesToAdd = 30
    const [ hours, minutes ] = time.split(':')
    if (addOneHour) {
      return `${parseInt(hours) + 1}:${minutes}`
    }
    if (minutes === '00') {
      return `${hours}:${parseInt(minutes + minutesToAdd)}`
    }
    return `${parseInt(hours) + 1}:${parseInt(minutes - minutesToAdd)}0`
  }
  

const mapReturnData = (courtFirstBooking, courtSecondBooking, timeFirstBooking, timeSecondBooking, firstEndtime, secondEndTime, date) => {
    return {
        bookedCourt: `Booked Court(s): Court ${courtFirstBooking} ${courtSecondBooking ? ' and court' : ''} ${courtSecondBooking ? courtSecondBooking : ''}`,
        bookedTime: `Booked Time(s): ${timeFirstBooking} ${timeSecondBooking ? 'and' : ''} ${timeSecondBooking ? timeSecondBooking : ''}`,
        endtime: `End time: ${secondEndTime ? secondEndTime : firstEndtime}`,
        bookedDate: `Booked date: ${date}`
    }
}
 
module.exports = {
    breakDownCurrentTime,
    breakDownTaskDate,
    convertFormattedDateToTimezonedDate,
    cronToDateTime,
    dateTimeToCron,
    delay,
    formatToRTFC,
    handleError,
    parseTimeAndAdd,
    mapReturnData,
    isDateMoreThanThreeDaysEarlier
}