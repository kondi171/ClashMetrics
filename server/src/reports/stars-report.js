const ExcelJS = require("exceljs");
const { getStats } = require("../services/cw.service");
const { formatDate } = require("../helpers/date.helper");
const { toRoman } = require("../helpers/roman.helper");
const { getSeasonName } = require("../helpers/date.helper");

async function generateGloryListByStars(res, wars, players) {
  try {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Season");

    const START_COL = 5; 
    const SUM_COL = wars.length + START_COL;
    const STAR_SYMBOL = "\u00A0★"; 

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
    const colGwiazdki = Math.floor(totalHeaderWidth * 0.2);

    styleRange(1, 2, 2, 1 + colListChwaly, "LISTA CHWAŁY");
    styleRange(1, 2 + colListChwaly, 2, 1 + colListChwaly + colGwiazdki, "GWIAZDKI");
    styleRange(1, 2 + colListChwaly + colGwiazdki, 2, SUM_COL, `SEZON ${getSeasonName(wars)}`);

    const sortedPlayers = [...players].sort((a, b) => {
      const getS = (p) => wars.reduce((acc, war) => {
        const s = getStats(war, p.tag);
        return { atk: acc.atk + (s.attack || 0), def: acc.def + (s.defense || 0) };
      }, { atk: 0, def: 0 });
      const sA = getS(a); const sB = getS(b);
      return (sB.atk !== sA.atk) ? sB.atk - sA.atk : sA.def - sB.def;
    });

    const ROW_OFFSET = 3; 
    sheet.getColumn(2).width = 8;   // LP.
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
    sheet.getCell(ROW_OFFSET, SUM_COL).value = "SUMA";
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

      // LP.
      sheet.mergeCells(attackRow, 2, defenseRow, 2);
      const lpCell = sheet.getCell(attackRow, 2);
      lpCell.value = lpValue;
      lpCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: colors.darkBg } };
      lpCell.font = { ...BOLD_FONT, color: { argb: colors.white }, size: 12 };
      lpCell.border = whiteBorder;
      lpCell.alignment = centerAlignment;

      // Gracz
      sheet.mergeCells(attackRow, 3, defenseRow, 3);
      const pCell = sheet.getCell(attackRow, 3);
      pCell.value = player.name;
      pCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: colors.darkBg } };
      pCell.font = { ...BOLD_FONT, color: { argb: colors.white }, size: 10 };
      pCell.border = whiteBorder;
      pCell.alignment = { vertical: "middle", horizontal: "left", indent: 1 };

      // Atak/Obrona
      [attackRow, defenseRow].forEach((rIdx, i) => {
        const cell = sheet.getCell(rIdx, 4);
        cell.value = i === 0 ? "⚔️ Atak" : "🛡️ Obrona";
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: colors.darkBg } };
        cell.font = { ...BOLD_FONT, color: { argb: colors.white }, size: 9 };
        cell.border = whiteBorder;
        cell.alignment = { vertical: "middle", horizontal: "left" };
      });

      let totalAttack = 0; let totalDefense = 0;
      wars.forEach((war, warIndex) => {
        const col = warIndex + START_COL;
        const isPlayerInWar = war.myClan.members.some((m) => m.tag === player.tag);

        if (!isPlayerInWar) {
          sheet.mergeCells(attackRow, col, defenseRow, col);
          const cell = sheet.getCell(attackRow, col);
          cell.value = "BRAK UDZIAŁU";
          cell.fill = rowFill; cell.border = whiteBorder; cell.alignment = centerAlignment;
          cell.font = { ...NORMAL_FONT, size: 7, color: isPodium ? "FF000000" : colors.grayText, italic: true };
        } else {
          const stats = getStats(war, player.tag);
          totalAttack += stats.attack; totalDefense += stats.defense;
          [attackRow, defenseRow].forEach((rIdx, i) => {
            const c = sheet.getCell(rIdx, col);
            c.value = `${i === 0 ? stats.attack : stats.defense}${STAR_SYMBOL}`;
            c.fill = rowFill; c.border = whiteBorder; c.alignment = centerAlignment;
            c.font = { ...NORMAL_FONT, bold: isPodium, color: isPodium ? { argb: "FF000000" } : undefined };
          });
        }
      });

      const sCells = [sheet.getCell(attackRow, SUM_COL), sheet.getCell(defenseRow, SUM_COL)];
      sCells[0].value = `${totalAttack}${STAR_SYMBOL}`;
      sCells[1].value = `${totalDefense}${STAR_SYMBOL}`;
      sCells.forEach(cell => {
        cell.fill = rowFill; cell.border = whiteBorder; cell.alignment = centerAlignment;
        cell.font = { ...NORMAL_FONT, bold: true, color: isPodium ? { argb: "FF000000" } : undefined };
      });
    });

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", 'attachment; filename="GloryListByStars.xlsx"');
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error(err);
    if (!res.headersSent) res.status(500).send("Błąd raportu.");
  }
}

module.exports = { generateGloryListByStars };