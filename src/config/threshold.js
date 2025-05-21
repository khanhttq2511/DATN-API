const threshold = {
  temperature: {
    min: 32,
    max: 100,
    message: "Cảnh báo: Nóng cao"
  },
  humidity: {
    min: 76,
    max: 100,
    message: "Cảnh báo: Ẩm nguy hiểm"
  },
  ppm: {
    min: 801,
    max: 1000,
    message: "Cảnh báo: Nguy hiểm"
  },
  light: {
    min: 100,
    max: 1000,
  }
}



module.exports = threshold;