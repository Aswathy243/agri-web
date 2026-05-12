exports.recommendCrops = (soilType, rainfall, temperature) => {
  if (soilType.toLowerCase().includes('loamy') && rainfall > 100 && temperature < 30) {
    return ['Cardamom', 'Pepper', 'Ginger'];
  } else if (soilType.toLowerCase().includes('sandy')) {
    return ['Tapioca', 'Groundnut'];
  } else if (rainfall < 60) {
    return ['Millets', 'Pulses'];
  }
  return ['Rice', 'Banana'];
};
