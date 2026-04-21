const fs = require('fs');
const path = require('path');

const CWL_FILE_PATH = path.join(__dirname, "../../..", "data", "cwl", "cwl.json");
const MY_CLAN_TAG = `#${process.env.CLAN_TAG}`;

function readCwlData() {
    try {
        if (!fs.existsSync(CWL_FILE_PATH)) return null;
        const data = JSON.parse(fs.readFileSync(CWL_FILE_PATH, 'utf8'));

        const myClanInfo = data.clans.find(c => c.tag === MY_CLAN_TAG);
        const players = myClanInfo ? myClanInfo.members : [];

        // 1. Mapujemy WSZYSTKIE bitwy ze wszystkich rund, by móc policzyć ranking całej grupy
        const allRoundsWars = data.rounds.map(round => {
            if (!round.warTags || round.warTags.length === 0 || round.warTags[0] === "#0") return [];
            return round.warTags.map(war => {
                // Wyznaczanie zwycięzcy bitwy (gwiazdki -> destrukcja)
                let winnerTag = null;
                if (war.clan.stars > war.opponent.stars) winnerTag = war.clan.tag;
                else if (war.opponent.stars > war.clan.stars) winnerTag = war.opponent.tag;
                else if (war.clan.destructionPercentage > war.opponent.destructionPercentage) winnerTag = war.clan.tag;
                else winnerTag = war.opponent.tag;

                return {
                    clan: war.clan,
                    opponent: war.opponent,
                    winnerTag: winnerTag,
                    startTime: war.startTime
                };
            });
        });

        // 2. Wyciągamy tylko nasze wojny do głównej tabeli graczy
        const wars = allRoundsWars.map((roundWars, index) => {
            const myWar = roundWars.find(w => w.clan.tag === MY_CLAN_TAG || w.opponent.tag === MY_CLAN_TAG);
            if (!myWar) return null;

            const isUsClan = myWar.clan.tag === MY_CLAN_TAG;
            return {
                number: index + 1,
                startTime: myWar.startTime,
                myClan: isUsClan ? myWar.clan : myWar.opponent,
                enemyClan: isUsClan ? myWar.opponent : myWar.clan,
                result: myWar.winnerTag === MY_CLAN_TAG ? 'win' : 'loss'
            };
        }).filter(w => w !== null);

        const getPlayerWarStats = (war, playerTag) => {
            const member = war.myClan.members.find(m => m.tag === playerTag);
            let attack = { stars: 0, destr: 0, done: 0 };
            let defense = { stars: 0, destr: 0 };
            let isParticipating = false;

            if (member) {
                isParticipating = true;
                if (member.attacks && member.attacks.length > 0) {
                    attack.stars = member.attacks[0].stars;
                    attack.destr = member.attacks[0].destructionPercentage;
                    attack.done = 1;
                }
                const enemyAttacker = war.enemyClan.members.find(em => 
                    em.attacks && em.attacks.some(a => a.defenderTag === playerTag)
                );
                if (enemyAttacker) {
                    const attackOnUs = enemyAttacker.attacks.find(a => a.defenderTag === playerTag);
                    defense.stars = attackOnUs.stars;
                    defense.destr = attackOnUs.destructionPercentage;
                }
            }
            return { attack, defense, isParticipating };
        };

        const sortedPlayers = players.map(p => {
            let totalA_S = 0, totalA_D = 0, totalD_S = 0, totalD_D = 0, attacksDone = 0, possibleAttacks = 0;
            wars.forEach(w => {
                const s = getPlayerWarStats(w, p.tag);
                if (s.isParticipating) {
                    possibleAttacks++;
                    attacksDone += s.attack.done;
                    totalA_S += s.attack.stars;
                    totalA_D += s.attack.destr;
                    totalD_S += s.defense.stars;
                    totalD_D += s.defense.destr;
                }
            });
            return { 
                ...p, totalA_S, totalA_D, totalD_S, totalD_D, attacksDone, possibleAttacks,
                avgDestr: attacksDone > 0 ? (totalA_D / attacksDone).toFixed(1) : 0
            };
        }).sort((a, b) => b.totalA_S - a.totalA_S || b.totalA_D - a.totalA_D);

        return { 
            season: data.season, 
            wars, 
            players: sortedPlayers, 
            clans: data.clans, 
            allRoundsWars, 
            getPlayerWarStats 
        };
    } catch (err) {
        console.error("CWL SERVICE ERROR:", err);
        return null;
    }
}

module.exports = { readCwlData };