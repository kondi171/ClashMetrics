const ExcelJS = require("exceljs");
async function generateClanMembersList(res, data) {
    try {
        const { clanName, members } = data;
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet("Lista Członków");

        const colors = {
            darkBg: "FF0D0D0D", white: "FFFFFFFF", 
            rowEven: "FFD9D9D9", rowOdd: "FFF2F2F2",
            headerOrange: "FFE18A00", husariaYellow: "FFFFFF00"
        };

        const whiteBorder = {
            top: { style: 'thin', color: { argb: colors.white } },
            left: { style: 'thin', color: { argb: colors.white } },
            bottom: { style: 'thin', color: { argb: colors.white } },
            right: { style: 'thin', color: { argb: colors.white } }
        };

        // Szerokości kolumn
        sheet.getColumn(2).width = 8;  // LP
        sheet.getColumn(3).width = 30; // Nick
        sheet.getColumn(4).width = 15; // Town Hall
        sheet.getColumn(5).width = 15; // Poziom
        sheet.getColumn(6).width = 20; // Rola
        sheet.getColumn(7).width = 15; // Trofea

        // Nagłówek główny
        sheet.mergeCells(1, 2, 2, 7);
        const mainHeader = sheet.getCell(1, 2);
        mainHeader.value = `SKŁAD KLANU: ${clanName.toUpperCase()}`;
        mainHeader.fill = { type: "pattern", pattern: "solid", fgColor: { argb: colors.headerOrange } };
        mainHeader.font = { name: 'Arial Black', color: { argb: colors.white }, size: 16 };
        mainHeader.alignment = { vertical: 'middle', horizontal: 'center' };
        mainHeader.border = whiteBorder;

        // Nagłówki tabeli
        const headers = ["L.P.", "NICK", "TOWN HALL", "POZIOM", "ROLA", "TROFEA"];
        headers.forEach((h, i) => {
            const cell = sheet.getCell(3, i + 2);
            cell.value = h;
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: colors.darkBg } };
            cell.font = { name: 'Arial Black', color: { argb: colors.white }, size: 11 };
            cell.alignment = { horizontal: 'center' };
            cell.border = whiteBorder;
        });

        // Dane członków
        members.forEach((m, i) => {
            const rowIdx = i + 4;
            const bg = (i % 2 === 0) ? colors.rowEven : colors.rowOdd;
            
            const roleName = m.role === 'leader' ? 'Lider' : 
                             m.role === 'coLeader' ? 'Współlider' : 
                             m.role === 'admin' ? 'Starszy' : 'Członek';

            const rowData = [i + 1, m.name, `TH ${m.townHallLevel}`, m.expLevel, roleName, m.trophies];
            
            rowData.forEach((val, colI) => {
                const cell = sheet.getCell(rowIdx, colI + 2);
                cell.value = val;
                cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bg } };
                cell.font = { name: 'Arial Black', size: 10, color: { argb: "FF000000" } };
                cell.border = whiteBorder;
                cell.alignment = { horizontal: colI === 1 ? 'left' : 'center', indent: colI === 1 ? 1 : 0 };
            });
        });

        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.setHeader("Content-Disposition", `attachment; filename=Sklad_Klanu_${clanName}.xlsx`);
        await workbook.xlsx.write(res);
        res.end();

    } catch (err) {
        console.error("EXCEL CLAN ERROR:", err);
        res.status(500).send("Błąd");
    }
}

module.exports = {
  generateClanMembersList,
}