function formatDate(dateString) {
  const year = dateString.substring(0, 4);
  const month = dateString.substring(4, 6);
  const day = dateString.substring(6, 8);

  return `${day}.${month}.${year}`;
}

function getSeasonName(wars) {
  if (!wars || wars.length === 0) return "NIEZNANY SEZON";

  const firstWarDate = wars[0].startTime; 
  
  const year = firstWarDate.substring(0, 4);
  const month = firstWarDate.substring(4, 6);
  const day = firstWarDate.substring(6, 8);
  
  const date = new Date(`${year}-${month}-${day}`);
  const monthName = date.toLocaleString('pl-PL', { month: 'long' });

  return `${monthName.toUpperCase()} ${year}`;
}

module.exports = {
  formatDate,
  getSeasonName
};
