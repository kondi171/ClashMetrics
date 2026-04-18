function toRoman(num) {
  const romanMap = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "XIV", "XV"];
  return romanMap[num] || num.toString();
}

module.exports = {
  toRoman
};