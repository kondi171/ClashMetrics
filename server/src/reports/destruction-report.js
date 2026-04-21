const ExcelJS = require("exceljs");
const { formatDate } = require("../helpers/date.helper");
const { toRoman } = require("../helpers/roman.helper");
const { getSeasonName } = require("../helpers/date.helper");

async function generateGloryListByDestruction(res, wars, players) {
  try {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Ranking Procentowy");

    const START_COL = 5; 
    const SUM_COL = wars.length + START_COL;
    const UNIT_SYMBOL = "%"; 
    
    const BOLD_FONT = { name: 'Arial Black' };
    const NORMAL_FONT = { name: 'Arial', size: 10 };

    const colors = {
      darkBg: "FF0D0D0D",
      white: "FFFFFFFF",
      rowEven: "FFD9D9D9",
      rowOdd: "FFF2F2F2",
      grayText: "FF808080",
      gold: "FFFFD700",
      silver: "FFC0C0C0",
      bronze: "FFCD7F32",
      headerGreen: "FF196B24"
    };

    const whiteBorder = {
      top: { style: 'thin', color: { argb: colors.white } },
      left: { style: 'thin', color: { argb: colors.white } },
      bottom: { style: 'thin', color: { argb: colors.white } },
      right: { style: 'thin', color: { argb: colors.white } }
    };

    const centerAlignment = { vertical: "middle", horizontal: "center" };

    const styleRange = (r1, c1, r2, c2, title) => {
      sheet.mergeCells(r1, c1, r2, c2);
      for (let r = r1; r <= r2; r++) {
        for (let c = c1; c <= c2; c++) {
          const cell = sheet.getCell(r, c);
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: colors.headerGreen } };
          cell.border = whiteBorder;
          cell.font = { ...BOLD_FONT, color: { argb: colors.white }, bold: true, size: 14 };
          cell.alignment = centerAlignment;
        }
      }
      sheet.getCell(r1, c1).value = title;
    };

    const totalHeaderWidth = SUM_COL - 1;
    const colListChwaly = Math.floor(totalHeaderWidth * 0.5);
    const colProcenty = Math.floor(totalHeaderWidth * 0.2);

    styleRange(1, 2, 2, 1 + colListChwaly, "LISTA CHWAŁY");
    styleRange(1, 2 + colListChwaly, 2, 1 + colListChwaly + colProcenty, "DESTRUKCJA");
    styleRange(1, 2 + colListChwaly + colProcenty, 2, SUM_COL, `SEZON ${getSeasonName(wars)}`);

    const sortedPlayers = [...players].sort((a, b) => {
      const getStats = (p) => wars.reduce((acc, war) => {
          const m = war.myClan.members.find(member => member.tag === p.tag);
          if (!m) return acc;
          const atk = (m.attacks || []).reduce((sum, at) => sum + (at.destructionPercentage || 0), 0);
          const def = m.bestOpponentAttack ? m.bestOpponentAttack.destructionPercentage : 0;
          return { atk: acc.atk + atk, def: acc.def + def };
      }, { atk: 0, def: 0 });
      const statsA = getStats(a); const statsB = getStats(b);
      return (statsB.atk !== statsA.atk) ? statsB.atk - statsA.atk : statsA.def - statsB.def;
    });

    const ROW_OFFSET = 3; 
    sheet.getColumn(2).width = 8;   // LP. (nieco szersza na medal)
    sheet.getColumn(3).width = 30;  // Gracz
    sheet.getColumn(4).width = 16;  // Atak/Obrona

    sheet.mergeCells(ROW_OFFSET, 2, ROW_OFFSET + 2, 2);
    sheet.getCell(ROW_OFFSET, 2).value = "L.P.";
    
    sheet.mergeCells(ROW_OFFSET, 3, ROW_OFFSET + 2, 4);
    sheet.getCell(ROW_OFFSET, 3).value = "POLSKA HUSARIA VS";

    [2, 3, 4].forEach(cIdx => {
      for (let r = ROW_OFFSET; r <= ROW_OFFSET + 2; r++) {
        const cell = sheet.getCell(r, cIdx);
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: colors.darkBg } };
        cell.font = { ...BOLD_FONT, color: { argb: colors.white }, bold: true, size: 12 };
        cell.border = whiteBorder;
        cell.alignment = centerAlignment;
      }
    });

    wars.forEach((war, index) => {
      const col = index + START_COL;
      for (let r = ROW_OFFSET; r <= ROW_OFFSET + 2; r++) {
        const cell = sheet.getCell(r, col);
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: colors.darkBg } };
        cell.border = whiteBorder;
        cell.alignment = centerAlignment;
        cell.font = { ...BOLD_FONT, color: { argb: colors.white }, bold: true };
      }
      sheet.getCell(ROW_OFFSET, col).value = toRoman(index + 1);
      sheet.getCell(ROW_OFFSET + 1, col).value = war.enemyClan.name;
      sheet.getCell(ROW_OFFSET + 1, col).font = { ...BOLD_FONT, color: { argb: colors.white }, bold: true, size: 8 };
      sheet.getCell(ROW_OFFSET + 1, col).alignment = { ...centerAlignment, wrapText: true };
      sheet.getCell(ROW_OFFSET + 2, col).value = formatDate(war.startTime);
      sheet.getCell(ROW_OFFSET + 2, col).font = { ...BOLD_FONT, color: { argb: colors.white }, size: 8 };
      sheet.getColumn(col).width = 14;
    });

    sheet.mergeCells(ROW_OFFSET, SUM_COL, ROW_OFFSET + 2, SUM_COL);
    sheet.getCell(ROW_OFFSET, SUM_COL).value = "SUMA %";
    for (let r = ROW_OFFSET; r <= ROW_OFFSET + 2; r++) {
      const cell = sheet.getCell(r, SUM_COL);
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: colors.darkBg } };
      cell.font = { ...BOLD_FONT, color: { argb: colors.white }, bold: true, size: 12 };
      cell.border = whiteBorder;
      cell.alignment = centerAlignment;
    }
    sheet.getColumn(SUM_COL).width = 16;

    sortedPlayers.forEach((player, index) => {
      const attackRow = index * 2 + ROW_OFFSET + 3;
      const defenseRow = attackRow + 1;
      let rowColor = (index % 2 === 0) ? colors.rowEven : colors.rowOdd;
      let lpValue = ""; 

      if (index === 0) { rowColor = colors.gold; lpValue = "🥇"; }
      else if (index === 1) { rowColor = colors.silver; lpValue = "🥈"; }
      else if (index === 2) { rowColor = colors.bronze; lpValue = "🥉"; }
      else { lpValue = `${index + 1}.`; }

      const isPodium = index < 3;
      const rowFill = { type: "pattern", pattern: "solid", fgColor: { argb: rowColor } };

      // LP. (z medalem lub numerem)
      sheet.mergeCells(attackRow, 2, defenseRow, 2);
      const lpCell = sheet.getCell(attackRow, 2);
      lpCell.value = lpValue;
      lpCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: colors.darkBg } };
      lpCell.font = { ...BOLD_FONT, color: { argb: colors.white }, size: 12 };
      lpCell.border = whiteBorder;
      lpCell.alignment = centerAlignment;

      // Gracz (sama nazwa)
      sheet.mergeCells(attackRow, 3, defenseRow, 3);
      const pCell = sheet.getCell(attackRow, 3);
      pCell.value = player.name;
      pCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: colors.darkBg } };
      pCell.font = { ...BOLD_FONT, color: { argb: colors.white }, size: 10 };
      pCell.border = whiteBorder;
      pCell.alignment = { vertical: "middle", horizontal: "left", indent: 1 };

      // Label Atak/Obrona
      [attackRow, defenseRow].forEach((rIdx, i) => {
        const cell = sheet.getCell(rIdx, 4);
        cell.value = i === 0 ? "⚔️ Atak %" : "🛡️ Obrona %";
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: colors.darkBg } };
        cell.font = { ...BOLD_FONT, color: { argb: colors.white }, size: 9 };
        cell.border = whiteBorder;
        cell.alignment = { vertical: "middle", horizontal: "left" };
      });

      let totalAtk = 0; let totalDef = 0;
      wars.forEach((war, warIndex) => {
        const col = warIndex + START_COL;
        const m = war.myClan.members.find(member => member.tag === player.tag);
        if (!m) {
          sheet.mergeCells(attackRow, col, defenseRow, col);
          const cell = sheet.getCell(attackRow, col);
          cell.value = "BRAK UDZIAŁU";
          cell.fill = rowFill; cell.border = whiteBorder; cell.alignment = centerAlignment;
          cell.font = { ...NORMAL_FONT, size: 7, color: isPodium ? "FF000000" : colors.grayText, italic: true };
        } else {
          const atk = (m.attacks || []).reduce((sum, a) => sum + (a.destructionPercentage || 0), 0);
          const def = m.bestOpponentAttack ? m.bestOpponentAttack.destructionPercentage : 0;
          totalAtk += atk; totalDef += def;
          [attackRow, defenseRow].forEach((rIdx, i) => {
            const cell = sheet.getCell(rIdx, col);
            cell.value = `${i === 0 ? atk : def}${UNIT_SYMBOL}`;
            cell.fill = rowFill; cell.border = whiteBorder; cell.alignment = centerAlignment;
            cell.font = { ...NORMAL_FONT, bold: isPodium, color: isPodium ? { argb: "FF000000" } : undefined };
          });
        }
      });

      const sCells = [sheet.getCell(attackRow, SUM_COL), sheet.getCell(defenseRow, SUM_COL)];
      sCells[0].value = `${totalAtk}${UNIT_SYMBOL}`;
      sCells[1].value = `${totalDef}${UNIT_SYMBOL}`;
      sCells.forEach(cell => {
        cell.fill = rowFill; cell.border = whiteBorder; cell.alignment = centerAlignment;
        cell.font = { ...NORMAL_FONT, bold: true, color: isPodium ? { argb: "FF000000" } : undefined };
      });
    });

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", 'attachment; filename="GloryListByDestruction.xlsx"');
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error(err);
    if (!res.headersSent) res.status(500).send("Błąd raportu.");
  }
}

module.exports = { generateGloryListByDestruction };