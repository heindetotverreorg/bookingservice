const cron = require('node-cron');
const { bookPadel } = require('./book')

let task

const setTask = (newTask) => {
    task = newTask
}

const startJob = (date, time, people, test) => {
    const defaultCronValue = process.env.NODE_ENV === 'production' ? '0 0 * * 0' : '* * * * *'

    const newTask = cron.schedule(defaultCronValue, () =>  {
        const today = new Date();
        const newDate = today.setDate(today.getDate() + 3)
        const newDateFormatted = new Date(newDate).toLocaleDateString();
        bookPadel(newDateFormatted, time, people, test)
    });

    setTask(newTask)
      
    task.start();

    const message = `Cron job has started for every sunday at 00:00 (${defaultCronValue}) with booking data: Runtime + 3 days at ${time}`

    return {
        message
    }
}

const cancelJob = () => {
    if (task) {
        task.stop();
        task = null

        return {
            message: `Cron job has cancelled`
        }
    } else {
        return {
            message: `No cron job is running to cancel`
        }
    }
}

module.exports = {
    startJob,
    cancelJob
}