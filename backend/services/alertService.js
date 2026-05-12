// backend/services/alertService.js
module.exports.getAlerts = async () => [
  { type: 'weather', severity: 'high', message: 'Heavy rainfall expected tomorrow', time: '2h ago' },
  { type: 'pest', severity: 'medium', message: 'Pest activity near your area', time: '6h ago' }
];
