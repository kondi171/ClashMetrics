const ExcelJS = require("exceljs");
const { formatDate } = require("../helpers/date.helper");
const { toRoman } = require("../helpers/roman.helper");

async function generateGloryListByDestruction(res, wars, players) {
  try {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Ranking Procentowy");

    const START_COL = 4;
    const SUM_COL = wars.length + START_COL;
    const UNIT_SYMBOL = "%"; 

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

    /**
     * =========================
     * TOP BANNER (IDENTYCZNY JAK W STARS)
     * =========================
     */
    const totalHeaderWidth = SUM_COL - 1;
    const colListChwaly = Math.floor(totalHeaderWidth * 0.5);
    const colProcenty = Math.floor(totalHeaderWidth * 0.2);

    const styleRange = (r1, c1, r2, c2, title) => {
      sheet.mergeCells(r1, c1, r2, c2);
      for (let r = r1; r <= r2; r++) {
        for (let c = c1; c <= c2; c++) {
          const cell = sheet.getCell(r, c);
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: colors.headerGreen } };
          cell.border = whiteBorder;
          cell.font = { color: { argb: colors.white }, bold: true, size: 14 };
          cell.alignment = centerAlignment;
        }
      }
      sheet.getCell(r1, c1).value = title;
    };

    // Używamy tych samych zakresów co w Stars
    styleRange(1, 2, 2, 1 + colListChwaly, "LISTA SKUTECZNOŚCI");
    styleRange(1, 2 + colListChwaly, 2, 1 + colListChwaly + colProcenty, "PROCENTY");
    styleRange(1, 2 + colListChwaly + colProcenty, 2, SUM_COL, "SEZON STYCZEŃ 2026");

    /**
     * =========================
     * SORTOWANIE
     * =========================
     */
    const sortedPlayers = [...players].sort((a, b) => {
      const getPlayerStats = (p) => {
        return wars.reduce((acc, war) => {
          const m = war.myClan.members.find(member => member.tag === p.tag);
          if (!m) return acc;
          const atk = (m.attacks || []).reduce((sum, at) => sum + (at.destructionPercentage || 0), 0);
          const def = m.bestOpponentAttack ? m.bestOpponentAttack.destructionPercentage : 0;
          return { atk: acc.atk + atk, def: acc.def + def };
        }, { atk: 0, def: 0 });
      };
      const statsA = getPlayerStats(a);
      const statsB = getPlayerStats(b);
      if (statsB.atk !== statsA.atk) return statsB.atk - statsA.atk;
      return statsA.def - statsB.def;
    });

    /**
     * =========================
     * SUB-HEADER (POLSKA HUSARIA VS & SUMA)
     * =========================
     */
    const ROW_OFFSET = 3; 
    sheet.getColumn(2).width = 30;
    sheet.getColumn(3).width = 12;

    sheet.mergeCells(ROW_OFFSET, 2, ROW_OFFSET + 2, 3);
    const husariaCell = sheet.getCell(ROW_OFFSET, 2);
    husariaCell.value = "POLSKA HUSARIA VS";
    for (let r = ROW_OFFSET; r <= ROW_OFFSET + 2; r++) {
      for (let c = 2; c <= 3; c++) {
        const cell = sheet.getCell(r, c);
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: colors.darkBg } };
        cell.font = { color: { argb: colors.white }, bold: true, size: 12 };
        cell.border = whiteBorder;
        cell.alignment = centerAlignment;
      }
    }

    wars.forEach((war, index) => {
      const col = index + START_COL;
      for (let r = ROW_OFFSET; r <= ROW_OFFSET + 2; r++) {
        const cell = sheet.getCell(r, col);
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: colors.darkBg } };
        cell.border = whiteBorder;
        cell.alignment = centerAlignment;
        cell.font = { color: { argb: colors.white }, bold: true };
      }
      sheet.getCell(ROW_OFFSET, col).value = toRoman(index + 1);
      sheet.getCell(ROW_OFFSET + 1, col).value = war.enemyClan.name;
      sheet.getCell(ROW_OFFSET + 1, col).font = { color: { argb: colors.white }, bold: true, size: 8 };
      sheet.getCell(ROW_OFFSET + 1, col).alignment = { ...centerAlignment, wrapText: true };
      sheet.getCell(ROW_OFFSET + 2, col).value = formatDate(war.startTime);
      sheet.getCell(ROW_OFFSET + 2, col).font = { color: { argb: colors.white }, size: 8 };
      sheet.getColumn(col).width = 12;
    });

    sheet.mergeCells(ROW_OFFSET, SUM_COL, ROW_OFFSET + 2, SUM_COL);
    sheet.getCell(ROW_OFFSET, SUM_COL).value = "SUMA %";
    for (let r = ROW_OFFSET; r <= ROW_OFFSET + 2; r++) {
      const cell = sheet.getCell(r, SUM_COL);
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: colors.darkBg } };
      cell.font = { color: { argb: colors.white }, bold: true, size: 12 };
      cell.border = whiteBorder;
      cell.alignment = centerAlignment;
    }
    sheet.getColumn(SUM_COL).width = 15;

    /**
     * =========================
     * BODY
     * =========================
     */
    sortedPlayers.forEach((player, index) => {
      const attackRow = index * 2 + ROW_OFFSET + 3;
      const defenseRow = attackRow + 1;
      let rowColor = (index % 2 === 0) ? colors.rowEven : colors.rowOdd;
      let namePrefix = ""; let isPodium = false;

      if (index === 0) { rowColor = colors.gold; namePrefix = "🥇 "; isPodium = true; }
      else if (index === 1) { rowColor = colors.silver; namePrefix = "🥈 "; isPodium = true; }
      else if (index === 2) { rowColor = colors.bronze; namePrefix = "🥉 "; isPodium = true; }

      const rowFill = { type: "pattern", pattern: "solid", fgColor: { argb: rowColor } };
      let totalAtk = 0; let totalDef = 0;

      sheet.mergeCells(attackRow, 2, defenseRow, 2);
      const pCell = sheet.getCell(attackRow, 2);
      pCell.value = `${namePrefix}${player.name}`;
      pCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: colors.darkBg } };
      pCell.font = { color: { argb: colors.white }, bold: true };
      pCell.border = whiteBorder;
      pCell.alignment = { vertical: "middle", horizontal: "left", indent: 1 };

      [attackRow, defenseRow].forEach((rIdx, i) => {
        const cell = sheet.getCell(rIdx, 3);
        cell.value = i === 0 ? "⚔️ Atak %" : "🛡️ Obrona %";
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: colors.darkBg } };
        cell.font = { color: { argb: colors.white }, size: 9 };
        cell.border = whiteBorder;
        cell.alignment = { vertical: "middle", horizontal: "left" };
      });

      wars.forEach((war, warIndex) => {
        const col = warIndex + START_COL;
        const m = war.myClan.members.find(member => member.tag === player.tag);
        if (!m) {
          sheet.mergeCells(attackRow, col, defenseRow, col);
          const cell = sheet.getCell(attackRow, col);
          cell.value = "BRAK UDZIAŁU";
          cell.fill = rowFill; cell.border = whiteBorder; cell.alignment = centerAlignment;
          cell.font = { size: 7, color: isPodium ? "FF000000" : colors.grayText, italic: true };
        } else {
          const atk = (m.attacks || []).reduce((sum, a) => sum + (a.destructionPercentage || 0), 0);
          const def = m.bestOpponentAttack ? m.bestOpponentAttack.destructionPercentage : 0;
          totalAtk += atk; totalDef += def;
          [attackRow, defenseRow].forEach((rIdx, i) => {
            const cell = sheet.getCell(rIdx, col);
            cell.value = `${i === 0 ? atk : def}${UNIT_SYMBOL}`;
            cell.fill = rowFill; cell.border = whiteBorder; cell.alignment = centerAlignment;
            cell.font = { size: 10, color: isPodium ? { argb: "FF000000" } : undefined, bold: isPodium };
          });
        }
      });

      const sCells = [sheet.getCell(attackRow, SUM_COL), sheet.getCell(defenseRow, SUM_COL)];
      sCells[0].value = `${totalAtk}${UNIT_SYMBOL}`;
      sCells[1].value = `${totalDef}${UNIT_SYMBOL}`;
      sCells.forEach(cell => {
        cell.fill = rowFill; cell.border = whiteBorder; cell.alignment = centerAlignment;
        cell.font = { bold: true, size: 10, color: isPodium ? { argb: "FF000000" } : undefined };
      });
    });

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", 'attachment; filename="ranking-procentowy.xlsx"');
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error(err);
    if (!res.headersSent) res.status(500).send("Błąd raportu.");
  }
}

module.exports = { generateGloryListByDestruction };