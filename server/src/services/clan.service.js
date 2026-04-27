const fs = require('fs');
const path = require('path');

const CLAN_FILE_PATH = path.join(__dirname, "../../..", "database", "clan", "clan.json");

function readClanMembersData() {
    try {
        if (!fs.existsSync(CLAN_FILE_PATH)) return null;
        const data = JSON.parse(fs.readFileSync(CLAN_FILE_PATH, 'utf8'));

        // Mapujemy dane członków klanu
        const members = data.memberList.map(m => ({
            name: m.name,
            tag: m.tag,
            role: m.role,
            expLevel: m.expLevel,
            townHallLevel: m.townHallLevel,
            trophies: m.trophies,
            donations: m.donations,
            donationsReceived: m.donationsReceived,
            rank: m.clanRank
        })).sort((a, b) => a.rank - b.rank); // Sortowanie według rangi w klanie

        return {
            clanName: data.name,
            clanTag: data.tag,
            memberCount: data.members,
            members: members
        };
    } catch (err) {
        console.error("CLAN SERVICE ERROR:", err);
        return null;
    }
}

module.exports = { readClanMembersData };