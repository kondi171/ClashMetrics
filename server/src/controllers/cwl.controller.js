const { generateCwlList } = require("../reports/cwl-report");

async function exportCwlList(req, res) {
  try {
    const cwlData = readCwlData();
    if (!cwlData) {
      return res.status(404).send("CWL Data Not Found");
    }
    await generateCwlList(res, cwlData);
  } catch (error) {
    console.error("CWL Report Export Error:", error);
    res.status(500).send("CWL Report Export Error");
  }
}

module.exports = {
  exportCwlList,
};
