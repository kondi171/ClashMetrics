const ExcelJS = require("exceljs");
const { toRoman } = require("../helpers/roman.helper");
const { formatDate, getSeasonName } = require("../helpers/date.helper");

async function generateCwlList(res, data) {
    try {
        let { wars, players, getPlayerWarStats, season, clans, allRoundsWars } = data;
        const MY_CLAN_TAG = `#${process.env.CLAN_TAG}`;
        
        players = players.filter(p => p.possibleAttacks > 0);

        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet("Season");

        const START_COL = 5; 
        const SUM_COL = (wars.length * 2) + START_COL;

        const colors = {
            darkBg: "FF0D0D0D", white: "FFFFFFFF", rowEven: "FFD9D9D9", rowOdd: "FFF2F2F2",
            gold: "FFFFD700", silver: "FFC0C0C0", bronze: "FFCD7F32",
            headerOrange: "FFE18A00", redText: "FFFF0000", winGreen: "FF00FF00",
            husariaYellow: "FFFFFF00"
        };

        const whiteBorder = {
            top: { style: 'thin', color: { argb: colors.white } },
            left: { style: 'thin', color: { argb: colors.white } },
            bottom: { style: 'thin', color: { argb: colors.white } },
            right: { style: 'thin', color: { argb: colors.white } }
        };

        // --- KONFIGURACJA KOLUMN ---
        sheet.getColumn(2).width = 10; 
        sheet.getColumn(3).width = 30; 
        sheet.getColumn(4).width = 18; 
        sheet.getColumn(SUM_COL).width = 12; 
        sheet.getColumn(SUM_COL + 1).width = 12;
        sheet.getColumn(SUM_COL + 2).width = 16;
        sheet.getColumn(SUM_COL + 3).width = 18;

        const styleRange = (r1, c1, r2, c2, title, bgColor) => {
            sheet.mergeCells(r1, c1, r2, c2);
            for (let r = r1; r <= r2; r++) {
                for (let c = c1; c <= c2; c++) {
                    const cell = sheet.getCell(r, c);
                    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bgColor } };
                    cell.border = whiteBorder;
                    cell.font = { name: 'Arial Black', color: { argb: colors.white }, bold: true, size: 14 };
                    cell.alignment = { vertical: "middle", horizontal: "center" };
                }
            }
            sheet.getCell(r1, c1).value = title;
        };

        // --- NAGŁÓWKI GŁÓWNE ---
        styleRange(1, 2, 2, 4, "CLAN WAR LEAGUE", colors.headerOrange);
        styleRange(1, 5, 2, SUM_COL - 1, "RANKING GRACZY", colors.headerOrange);
        styleRange(1, SUM_COL, 2, SUM_COL + 3, `SEZON ${getSeasonName(wars)}`, colors.headerOrange);

        const ROW_OFFSET = 3;
        const headerRowStyle = (r, c, val, mergeToR, mergeToC, isSpecial = false) => {
            if(mergeToR) sheet.mergeCells(r, c, mergeToR, mergeToC);
            const cell = sheet.getCell(r, c);
            cell.value = val;
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: colors.darkBg } };
            cell.font = { name: 'Arial Black', color: { argb: colors.white }, bold: true, size: isSpecial ? 11 : 10 };
            cell.border = whiteBorder;
            cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
            return cell;
        };

        headerRowStyle(ROW_OFFSET, 2, "L.P.", ROW_OFFSET + 2, 2);
        headerRowStyle(ROW_OFFSET, 3, "POLSKA HUSARIA VS", ROW_OFFSET + 2, 4);

        wars.forEach((war, index) => {
            const col = START_COL + (index * 2);
            const romanCell = headerRowStyle(ROW_OFFSET, col, toRoman(index + 1), ROW_OFFSET, col + 1);
            romanCell.font = { name: 'Arial Black', color: { argb: war.result === 'win' ? colors.winGreen : colors.redText }, bold: true, size: 13 };
            headerRowStyle(ROW_OFFSET + 1, col, war.enemyClan.name, ROW_OFFSET + 1, col + 1);
            headerRowStyle(ROW_OFFSET + 2, col, formatDate(war.startTime), ROW_OFFSET + 2, col + 1);
            sheet.getColumn(col).width = 9;
            sheet.getColumn(col + 1).width = 11;
        });

        headerRowStyle(ROW_OFFSET, SUM_COL, "SUMA", ROW_OFFSET + 2, SUM_COL + 1, true);
        headerRowStyle(ROW_OFFSET, SUM_COL + 2, "ATAKI", ROW_OFFSET + 2, SUM_COL + 2, true);
        headerRowStyle(ROW_OFFSET, SUM_COL + 3, "ŚREDNIA", ROW_OFFSET + 2, SUM_COL + 3, true);

        // --- LISTA GRACZY ---
        players.forEach((player, index) => {
            const attackRow = index * 2 + ROW_OFFSET + 3;
            const defenseRow = attackRow + 1;
            let rowColor = (index % 2 === 0) ? colors.rowEven : colors.rowOdd;
            let lp = index + 1;
            if (index === 0) { rowColor = colors.gold; lp = "🥇"; }
            else if (index === 1) { rowColor = colors.silver; lp = "🥈"; }
            else if (index === 2) { rowColor = colors.bronze; lp = "🥉"; }

            headerRowStyle(attackRow, 2, lp, defenseRow, 2);
            const nameCell = headerRowStyle(attackRow, 3, player.name, defenseRow, 3);
            nameCell.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };
            headerRowStyle(attackRow, 4, "⚔️ ATAK");
            headerRowStyle(defenseRow, 4, "🛡️ OBRONA");

            wars.forEach((war, warIdx) => {
                const col = START_COL + (warIdx * 2);
                const stats = getPlayerWarStats(war, player.tag);
                const isIn = war.myClan.members.some(m => m.tag === player.tag);

                [attackRow, defenseRow].forEach((r, i) => {
                    const sCell = sheet.getCell(r, col);
                    const dCell = sheet.getCell(r, col + 1);
                    if (isIn) {
                        sCell.value = (i === 0 ? stats.attack.stars : stats.defense.stars) + "★";
                        dCell.value = (i === 0 ? stats.attack.destr : stats.defense.destr) + "%";
                    } else if (i === 0) {
                        sheet.mergeCells(attackRow, col, defenseRow, col + 1);
                        sheet.getCell(attackRow, col).value = "-";
                    }
                    [sCell, dCell].forEach(c => {
                        c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: rowColor } };
                        c.border = whiteBorder;
                        c.font = { size: 10, color: { argb: "FF000000"} };
                        c.alignment = { horizontal: 'center', vertical: 'middle' };
                    });
                });
            });

            // Sumy gracza (prawa strona)
            const summCells = [
                sheet.getCell(attackRow, SUM_COL), sheet.getCell(attackRow, SUM_COL + 1),
                sheet.getCell(defenseRow, SUM_COL), sheet.getCell(defenseRow, SUM_COL + 1),
                sheet.getCell(attackRow, SUM_COL + 2), sheet.getCell(attackRow, SUM_COL + 3)
            ];
            summCells[0].value = player.totalA_S + "★"; summCells[1].value = player.totalA_D + "%";
            summCells[2].value = player.totalD_S + "★"; summCells[3].value = player.totalD_D + "%";
            sheet.mergeCells(attackRow, SUM_COL + 2, defenseRow, SUM_COL + 2); summCells[4].value = `${player.attacksDone}/${player.possibleAttacks}`;
            sheet.mergeCells(attackRow, SUM_COL + 3, defenseRow, SUM_COL + 3); summCells[5].value = player.avgDestr + "%";

            summCells.forEach((c, idx) => {
                c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: rowColor } };
                c.border = whiteBorder;
                c.alignment = { horizontal: 'center', vertical: 'middle' };
                c.font = { name: 'Arial Black', size: 10, bold: true, color: { argb: (idx === 4 && player.attacksDone < player.possibleAttacks) ? colors.redText : "FF000000"} };
            });
        });

        // --- SUMY KLANOWE POD KAŻDĄ WOJNĄ ---
        const totalRowStart = (players.length * 2) + ROW_OFFSET + 3;
        headerRowStyle(totalRowStart, 2, "∑", totalRowStart + 1, 3, true);
        headerRowStyle(totalRowStart, 4, "⚔️ WYNIK");
        headerRowStyle(totalRowStart + 1, 4, "⚔️ ATAKI");

        wars.forEach((war, warIdx) => {
            const col = START_COL + (warIdx * 2);
            let wA_S = 0, wA_D = 0, wDone = 0;
            players.forEach(p => {
                const s = getPlayerWarStats(war, p.tag);
                if (s.isParticipating) {
                    wDone += s.attack.done;
                    wA_S += s.attack.stars;
                    wA_D += s.attack.destr;
                }
            });

            // Wiersz 1: Gwiazdki i średnia destrukcja
            const cellStars = sheet.getCell(totalRowStart, col);
            sheet.mergeCells(totalRowStart, col, totalRowStart, col + 1);
            cellStars.value = `${wA_S}★ (${(wA_D/15).toFixed(1)}%)`;
            cellStars.fill = { type: "pattern", pattern: "solid", fgColor: { argb: colors.darkBg } };
            cellStars.font = { name: 'Arial Black', color: { argb: war.result === 'win' ? colors.winGreen : colors.redText }, size: 10 };
            cellStars.alignment = { horizontal: 'center', vertical: 'middle' };
            cellStars.border = whiteBorder;

            // Wiersz 2: Oddane ataki (np. 14/15)
            const cellDone = sheet.getCell(totalRowStart + 1, col);
            sheet.mergeCells(totalRowStart + 1, col, totalRowStart + 1, col + 1);
            cellDone.value = `${wDone}/15`;
            cellDone.fill = { type: "pattern", pattern: "solid", fgColor: { argb: colors.darkBg } };
            cellDone.font = { name: 'Arial Black', color: { argb: wDone < 15 ? colors.redText : colors.white }, size: 10 };
            cellDone.alignment = { horizontal: 'center', vertical: 'middle' };
            cellDone.border = whiteBorder;
        });

        // --- PRAWA DOLNA CZĘŚĆ (SUMY CAŁEGO SEZONU) ---
        const totalStarsA = players.reduce((a, b) => a + b.totalA_S, 0);
        const totalStarsD = players.reduce((a, b) => a + b.totalD_S, 0);
        const totalPossAll = players.reduce((a, b) => a + b.possibleAttacks, 0);
        const totalDoneAll = players.reduce((a, b) => a + b.attacksDone, 0);
        const avgSeasonDestr = totalPossAll > 0 ? (players.reduce((a, b) => a + b.totalA_D, 0) / totalPossAll).toFixed(1) : 0;
        const avgSeasonDefDestr = totalPossAll > 0 ? (players.reduce((a, b) => a + b.totalD_D, 0) / totalPossAll).toFixed(1) : 0;
        const globalAvg = totalDoneAll > 0 ? (players.reduce((a, b) => a + b.totalA_D, 0) / totalDoneAll).toFixed(1) : 0;

        [totalRowStart, totalRowStart + 1].forEach((r, i) => {
            const cS = sheet.getCell(r, SUM_COL);
            const cP = sheet.getCell(r, SUM_COL + 1);
            cS.value = (i === 0 ? totalStarsA : totalStarsD) + "★";
            cP.value = (i === 0 ? avgSeasonDestr : avgSeasonDefDestr) + "%";
            [cS, cP].forEach(c => {
                c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: colors.darkBg } };
                c.font = { name: 'Arial Black', color: { argb: colors.white }, size: 10, bold: true };
                c.border = whiteBorder;
                c.alignment = { horizontal: 'center', vertical: 'middle' };
            });
        });

        sheet.mergeCells(totalRowStart, SUM_COL + 2, totalRowStart + 1, SUM_COL + 2);
        const cellAtks = sheet.getCell(totalRowStart, SUM_COL + 2);
        cellAtks.value = `${totalDoneAll}/${totalPossAll}`;
        cellAtks.fill = { type: "pattern", pattern: "solid", fgColor: { argb: colors.darkBg } };
        cellAtks.font = { name: 'Arial Black', color: { argb: totalDoneAll < totalPossAll ? colors.redText : colors.white }, size: 10, bold: true };
        cellAtks.border = whiteBorder;
        cellAtks.alignment = { horizontal: 'center', vertical: 'middle' };

        sheet.mergeCells(totalRowStart, SUM_COL + 3, totalRowStart + 1, SUM_COL + 3);
        const cellAvg = sheet.getCell(totalRowStart, SUM_COL + 3);
        cellAvg.value = globalAvg + "%";
        cellAvg.fill = { type: "pattern", pattern: "solid", fgColor: { argb: colors.darkBg } };
        cellAvg.font = { name: 'Arial Black', color: { argb: colors.white }, size: 10, bold: true };
        cellAvg.border = whiteBorder;
        cellAvg.alignment = { horizontal: 'center', vertical: 'middle' };

        // --- RANKING GRUPY ---
        const RANK_START_ROW = totalRowStart + 4;
        sheet.mergeCells(RANK_START_ROW, 2, RANK_START_ROW, 4);
        const rt = sheet.getCell(RANK_START_ROW, 2);
        rt.value = "RANKING GRUPY";
        sheet.mergeCells(RANK_START_ROW, 5, RANK_START_ROW, 7);
        const st = sheet.getCell(RANK_START_ROW, 5);
        st.value = getSeasonName(wars);

        [rt, st].forEach(c => {
            c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: colors.headerOrange } };
            c.font = { name: 'Arial Black', color: { argb: colors.white }, size: 12 };
            c.alignment = { horizontal: 'center' };
            c.border = whiteBorder;
        });

        sheet.getColumn(3).width = 35; 
        sheet.getColumn(4).width = 15; 
        sheet.getColumn(5).width = 15; 
        sheet.getColumn(6).width = 15; 
        sheet.getColumn(7).width = 12; 

        const clanHeaders = ["Poz", "Klan", "Gwiazdki", "Destrukcja", "Średnia", "Wygrane"];
        clanHeaders.forEach((h, i) => {
            const cell = sheet.getCell(RANK_START_ROW + 1, i + 2);
            cell.value = h;
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: colors.darkBg } };
            cell.font = { name: 'Arial Black', color: { argb: colors.white }, size: 10 };
            cell.alignment = { horizontal: 'center' };
            cell.border = whiteBorder;
        });

        const processedClans = clans.map(clan => {
            let tStars = 0, tDestr = 0, tWins = 0;
            allRoundsWars.flat().forEach(w => {
                if (w.clan.tag === clan.tag) {
                    tStars += w.clan.stars; tDestr += w.clan.destructionPercentage;
                    if (w.winnerTag === clan.tag) { tWins++; tStars += 10; }
                } else if (w.opponent.tag === clan.tag) {
                    tStars += w.opponent.stars; tDestr += w.opponent.destructionPercentage;
                    if (w.winnerTag === clan.tag) { tWins++; tStars += 10; }
                }
            });
            const avg = wars.length > 0 ? (tDestr / wars.length).toFixed(1) : 0;
            return { ...clan, cStars: tStars, cDestr: tDestr, cAvg: avg, cWins: tWins };
        }).sort((a, b) => b.cStars - a.cStars || b.cAvg - a.cAvg);

        processedClans.forEach((clan, i) => {
            const row = RANK_START_ROW + 2 + i;
            const isUs = clan.tag === MY_CLAN_TAG || clan.name.includes("Husaria");
            const bg = isUs ? colors.husariaYellow : (i % 2 === 0 ? colors.rowEven : colors.rowOdd);
            
            const vals = [i + 1, clan.name, clan.cStars, clan.cDestr.toFixed(0) + "%", clan.cAvg + "%", clan.cWins];
            [2, 3, 4, 5, 6, 7].forEach((colIdx, vi) => {
                const cell = sheet.getCell(row, colIdx);
                cell.value = vals[vi];
                cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bg } };
                cell.font = { name: 'Arial Black', size: 10, color: { argb: "FF000000" } };
                cell.border = whiteBorder;
                cell.alignment = { horizontal: vi === 1 ? 'left' : 'center', indent: vi === 1 ? 1 : 0 };
            });
        });

        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.setHeader("Content-Disposition", `attachment; filename=CWL_Report_${season}.xlsx`);
        await workbook.xlsx.write(res);
        res.end();
    } catch (err) {
        console.error("EXCEL ERROR:", err);
        if (!res.headersSent) res.status(500).send("Błąd generowania raportu.");
    }
}

module.exports = { generateCwlList };