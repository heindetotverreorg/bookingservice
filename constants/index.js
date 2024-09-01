const port = process.env.VUE_APP_SERVERPORT || 3003

console.log('RUNTIME CHECK', process.env.VUE_APP_SERVERPORT)

const URL_TO_CRAWL = 'https://bent.baanreserveren.nl/reservations'

const SERVER_URL = `http://localhost:${port}/book`

const LOGGING = {
    CRON_CANCELLED: 'CRON_CANCELLED',
    CRON_JOB_RUNS_AT: 'CRON_JOB_RUNS_AT',
    CRON_JOB_START: 'CRON_JOB_START',
    CRON_START: 'CRON_START',
    CRON_START_MESSAGE: 'CRON_START_MESSAGE',
    CRON_TEST: 'CRON_TEST',
    ERROR: 'ERROR',
    NO_CRON_JOB: 'NO_CRON_JOB',
    START_CRON_JOB: 'START_CRON_JOB'
}

module.exports = {
    port,
    LOGGING,
    URL_TO_CRAWL,
    SERVER_URL
}