const cron = require('node-cron');
const { bookPadel } = require('./book')

let task

const setTask = (newTask) => {
    task = newTask
}

const startJob = (date, time, people, test) => {
    const defaultCronValue = process.env.NODE_ENV === 'production' ? '0 0 * * 0' : '* * * * *'

    // date at initialisation
    const today = new Date();
    const newDate = today.setDate(today.getDate() + 3)
    const newDateFormatted = new Date(newDate).toLocaleDateString();

    const newTask = cron.schedule(defaultCronValue, () =>  {
        // date within task context
        const today = new Date();
        const newDate = today.setDate(today.getDate() + 3)
        const newDateFormatted = new Date(newDate).toLocaleDateString();
        bookPadel(newDateFormatted, time, people, test)
    });

    setTask(newTask)
      
    task.start();

    const message = `Scheduled job has started for every sunday at 00:00 (${defaultCronValue}) with booking data: ${newDateFormatted} at ${time}`

    return {
        message
    }
}

const cancelJob = () => {
    if (task) {
        task.stop();
        task = null

        return {
            message: `Scheduled job has cancelled`
        }
    } else {
        return {
            message: `No scheduled job is running to cancel`
        }
    }
}

module.exports = {
    startJob,
    cancelJob
}