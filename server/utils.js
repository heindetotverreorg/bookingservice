const formatToRTFC = (moment) => {
  const f = "ddd, DD MMM YYYY HH:mm:ss ZZ"
  return moment.format(f)
}

module.exports = {
  formatToRTFC
}