const getSeasonKey = (dateStr) => {
  if (!dateStr) return "Nieznany";
  return `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}`;
};

const formatSeasonName = (key) => {
  if (!key || key === "Nieznany") return "Własny zakres";
  const [year, month] = key.split("-");
  const months = [
    "Styczeń",
    "Luty",
    "Marzec",
    "Kwiecień",
    "Maj",
    "Czerwiec",
    "Lipiec",
    "Sierpień",
    "Wrzesień",
    "Październik",
    "Listopad",
    "Grudzień",
  ];
  return `${months[parseInt(month) - 1]} ${year}`;
};
module.exports = {
  getSeasonKey,
  formatSeasonName,
};
