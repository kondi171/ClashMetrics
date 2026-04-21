const ExcelJS = require("exceljs");
const { formatDate } = require("../helpers/date.helper");
const { toRoman } = require("../helpers/roman.helper");
const { getSeasonName } = require("../helpers/date.helper");

async function generateShameList(res, wars, players) {
  try {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Lista Wstydu");

    const START_COL = 4;
    const SUM_COL = wars.length + START_COL;
    
    const BOLD_FONT = { name: 'Arial Black' };
    const NORMAL_FONT = { name: 'Arial', size: 10 };

    const colors = {
      darkBg: "FF0D0D0D",
      white: "FFFFFFFF",
      rowEven: "FFD9D9D9",
      rowOdd: "FFF2F2F2",
      errorRed: "FFFF0000",
      warningYellow: "FFFFFF00",
      grayText: "FF808080",
      headerRed: "FF800000",
      successGreen: "FF47D359"
    };

    const whiteBorder = {
      top: { style: 'thin', color: { argb: colors.white } },
      left: { style: 'thin', color: { argb: colors.white } },
      bottom: { style: 'thin', color: { argb: colors.white } },
      right: { style: 'thin', color: { argb: colors.white } }
    };

    const centerAlignment = { vertical: "middle", horizontal: "center" };

    // --- PRZYGOTOWANIE DANYCH ---
    const playersWithStats = players.map(player => {
      let totalMissed = 0;
      let warsParticipated = 0;
      const results = wars.map(war => {
        const member = war.myClan.members.find(m => m.tag === player.tag);
        if (!member) return { status: "MISSING" };
        warsParticipated++;
        const missed = 2 - (member.attacks ? member.attacks.length : 0);
        totalMissed += missed;
        return { status: "PARTICIPATED", missed };
      });
      return { ...player, results, totalMissed, warsParticipated };
    });

    playersWithStats.sort((a, b) => {
      if (b.totalMissed !== a.totalMissed) return b.totalMissed - a.totalMissed;
      return a.warsParticipated - b.warsParticipated;
    });

    const maxMissed = playersWithStats.length > 0 ? playersWithStats[0].totalMissed : 0;
    const totalMissedInClan = playersWithStats.reduce((sum, p) => sum + p.totalMissed, 0);
    const isPerfectSeason = totalMissedInClan === 0;

    // --- NAGŁÓWEK GŁÓWNY ---
    const totalHeaderWidth = SUM_COL - 1;
    const splitPoint = Math.floor(totalHeaderWidth * 0.7) + 1;

    sheet.mergeCells(1, 2, 2, splitPoint);
    const leftH = sheet.getCell(1, 2);
    leftH.value = "LISTA WSTYDU";
    leftH.fill = { type: "pattern", pattern: "solid", fgColor: { argb: colors.headerRed } };
    leftH.font = { ...BOLD_FONT, color: { argb: colors.white }, size: 16 };
    leftH.alignment = centerAlignment;
    leftH.border = whiteBorder;

    sheet.mergeCells(1, splitPoint + 1, 2, SUM_COL);
    const rightH = sheet.getCell(1, splitPoint + 1);
    rightH.value = `SEZON ${getSeasonName(wars)}`;
    rightH.fill = { type: "pattern", pattern: "solid", fgColor: { argb: colors.headerRed } };
    rightH.font = { ...BOLD_FONT, color: { argb: colors.white }, size: 16 };
    rightH.alignment = centerAlignment;
    rightH.border = whiteBorder;

    const ROW_OFFSET = 3;
    sheet.getColumn(2).width = 8;
    sheet.getColumn(3).width = 32;

    [2, 3].forEach(cIdx => {
      sheet.mergeCells(ROW_OFFSET, cIdx, ROW_OFFSET + 2, cIdx);
      const cell = sheet.getCell(ROW_OFFSET, cIdx);
      cell.value = cIdx === 2 ? "L.P." : "POLSKA HUSARIA VS";
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: colors.darkBg } };
      cell.font = { ...BOLD_FONT, color: { argb: colors.white }, size: 12 };
      cell.border = whiteBorder;
      cell.alignment = centerAlignment;
    });

    wars.forEach((war, index) => {
      const col = index + START_COL;
      for (let r = ROW_OFFSET; r <= ROW_OFFSET + 2; r++) {
        const cell = sheet.getCell(r, col);
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: colors.darkBg } };
        cell.border = whiteBorder;
        cell.alignment = centerAlignment;
        cell.font = { ...BOLD_FONT, color: { argb: colors.white } };
      }
      sheet.getCell(ROW_OFFSET, col).value = toRoman(index + 1);
      sheet.getCell(ROW_OFFSET + 1, col).value = war.enemyClan.name;
      sheet.getCell(ROW_OFFSET + 1, col).font = { ...BOLD_FONT, color: { argb: colors.white }, size: 8 };
      sheet.getCell(ROW_OFFSET + 1, col).alignment = { ...centerAlignment, wrapText: true };
      sheet.getCell(ROW_OFFSET + 2, col).value = formatDate(war.startTime);
      sheet.getColumn(col).width = 15;
    });

    sheet.mergeCells(ROW_OFFSET, SUM_COL, ROW_OFFSET + 2, SUM_COL);
    const sumH = sheet.getCell(ROW_OFFSET, SUM_COL);
    sumH.value = "Suma nieoddanych ataków";
    sumH.fill = { type: "pattern", pattern: "solid", fgColor: { argb: colors.darkBg } };
    sumH.font = { ...BOLD_FONT, color: { argb: colors.white }, size: 10 };
    sumH.alignment = { ...centerAlignment, wrapText: true }; 
    sumH.border = whiteBorder;
    sheet.getColumn(SUM_COL).width = 18;

    // --- BODY (LISTA GRACZY) ---
    playersWithStats.forEach((player, index) => {
      const currentRow = ROW_OFFSET + 3 + index;
      const bodyBgColor = isPerfectSeason ? colors.successGreen : (index % 2 === 0 ? colors.rowEven : colors.rowOdd);
      const bodyFill = { type: "pattern", pattern: "solid", fgColor: { argb: bodyBgColor } };

      const lpCell = sheet.getCell(currentRow, 2);
      lpCell.value = `${index + 1}.`;
      lpCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: colors.darkBg } };
      lpCell.font = { ...BOLD_FONT, color: { argb: colors.white } };
      lpCell.border = whiteBorder;
      lpCell.alignment = centerAlignment;

      const nameCell = sheet.getCell(currentRow, 3);
      nameCell.value = player.name;
      nameCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: colors.darkBg } };
      
      const isLeaderOfShame = player.totalMissed === maxMissed && maxMissed > 0;
      nameCell.font = { 
        ...BOLD_FONT, 
        size: 10, 
        color: { argb: isLeaderOfShame ? colors.errorRed : colors.white } 
      };
      
      nameCell.border = whiteBorder;
      nameCell.alignment = { vertical: "middle", horizontal: "left", indent: 1 };

      player.results.forEach((res, warIdx) => {
        const col = warIdx + START_COL;
        const cell = sheet.getCell(currentRow, col);
        cell.border = whiteBorder;
        cell.alignment = centerAlignment;

        if (res.status === "MISSING") {
          cell.value = "BRAK UDZIAŁU";
          cell.fill = bodyFill;
          cell.font = { ...NORMAL_FONT, size: 8, color: { argb: colors.grayText } };
        } else {
          cell.value = res.missed;
          if (res.missed === 2) {
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: colors.errorRed } };
            cell.font = { ...NORMAL_FONT, color: { argb: colors.white }, bold: true };
          } else if (res.missed === 1) {
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: colors.warningYellow } };
            cell.font = { ...NORMAL_FONT, color: { argb: "FF000000" }, bold: true };
          } else {
            cell.fill = bodyFill;
            cell.font = { ...NORMAL_FONT, color: { argb: isPerfectSeason ? "FF004400" : colors.grayText } };
          }
        }
      });

      const totalCell = sheet.getCell(currentRow, SUM_COL);
      totalCell.value = player.totalMissed;
      totalCell.border = whiteBorder;
      totalCell.alignment = centerAlignment;

      if (player.totalMissed > 0) {
        totalCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFCCCC" } };
        totalCell.font = { ...BOLD_FONT, size: 11, color: { argb: "FFCC0000" } };
      } else {
        totalCell.fill = bodyFill;
        totalCell.font = { ...BOLD_FONT, size: 11, color: { argb: "FF000000" } };
      }
    });

    // --- STOPKA ZE STATYSTYKAMI ---
    const footerStartRow = ROW_OFFSET + 3 + playersWithStats.length;
    // ZMIENIONE ETYKIETY I DODANY WIERSZ "WOJNA"
    const statsLabels = ["Ataki", "Wojna", "Nieoddane Ataki [PCS]", "Nieoddane ataki [%]"];

    statsLabels.forEach((label, i) => {
      const rIdx = footerStartRow + i;
      sheet.mergeCells(rIdx, 2, rIdx, 3);
      const labelCell = sheet.getCell(rIdx, 2);
      labelCell.value = label;
      labelCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: colors.darkBg } };
      labelCell.font = { ...BOLD_FONT, color: { argb: colors.white }, size: 10 };
      labelCell.alignment = { vertical: "middle", horizontal: "right" };
      labelCell.border = whiteBorder;
    });

    let globalTotalDone = 0;
    let globalTotalPossible = 0;

    wars.forEach((war, warIdx) => {
      const col = warIdx + START_COL;
      const teamSize = war.teamSize;
      const possibleAttacks = teamSize * 2;
      const actualAttacks = war.myClan.members.reduce((sum, m) => sum + (m.attacks ? m.attacks.length : 0), 0);
      const missedInWar = possibleAttacks - actualAttacks;
      
      globalTotalDone += actualAttacks;
      globalTotalPossible += possibleAttacks;

      const missedPerc = ((missedInWar / possibleAttacks) * 100).toFixed(1);

      [
        { val: `${actualAttacks}/${possibleAttacks}`, row: footerStartRow },
        { val: `${teamSize} vs ${teamSize}`, row: footerStartRow + 1 }, // NOWY WIERSZ
        { val: missedInWar, row: footerStartRow + 2 },
        { val: missedPerc + "%", row: footerStartRow + 3, isPerc: true, rawPerc: parseFloat(missedPerc) }
      ].forEach(item => {
        const c = sheet.getCell(item.row, col);
        c.value = item.val;
        c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: colors.darkBg } };
        c.border = whiteBorder;
        c.alignment = centerAlignment;

        let textColor = colors.white;
        if (item.isPerc) {
           textColor = item.rawPerc > 10 ? colors.errorRed : colors.successGreen;
        }
        c.font = { ...BOLD_FONT, color: { argb: textColor }, size: 9 };
      });
    });

    const globalMissedCount = globalTotalPossible - globalTotalDone;
    const globalMissedPerc = ((globalMissedCount / globalTotalPossible) * 100).toFixed(1);
    const rawGlobalPerc = parseFloat(globalMissedPerc);

    [
      { val: `${globalTotalDone}/${globalTotalPossible}`, row: footerStartRow },
      { val: "-", row: footerStartRow + 1 }, // Rozmiar wojny w sumie nie ma sensu, więc dajemy kreskę
      { val: globalMissedCount, row: footerStartRow + 2 },
      { val: globalMissedPerc + "%", row: footerStartRow + 3, isPerc: true }
    ].forEach(item => {
      const c = sheet.getCell(item.row, SUM_COL);
      c.value = item.val;
      c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: colors.darkBg } };
      c.border = whiteBorder;
      c.alignment = centerAlignment;

      let textColor = colors.white;
      if (item.isPerc) {
          textColor = rawGlobalPerc > 10 ? colors.errorRed : colors.successGreen;
      }

      c.font = { ...BOLD_FONT, color: { argb: textColor }, size: 10 };
    });

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", 'attachment; filename="ShameList.xlsx"');
    await workbook.xlsx.write(res);
    res.end();

  } catch (err) {
    console.error(err);
    if (!res.headersSent) res.status(500).send("Błąd raportu.");
  }
}

module.exports = { generateShameList };