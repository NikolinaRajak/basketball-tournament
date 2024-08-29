const data = require('./groups.json');
const GroupPlacementEntry = require('./GroupPlacementEntry.js')

const a = data.A;
console.log(a);

function simulateGroup(array) {
    let groupTable = [];
    for (let i = 0; i < array.length - 1; i++) {
        const first_team = array[i];
        for (let j = i + 1; j < array.length; j++) {
            const second_team = array[j];
            let winProbability = calculateProbability(first_team.FIBARanking, second_team.FIBARanking);
            let { outcome1, outcome2 } = simulateGroupMatch(winProbability);
            let { result1, result2 } = generateResult(outcome1);
            console.log(first_team.Team + "(" + winProbability + ", " + outcome1 + ", " + result1 + ")" + " vs " + second_team.Team + "(" + (1 - winProbability) + ", " + outcome2 + ", " + result2 + ")")
            // Updating or instantiating the first team
            let team1Index = groupTable.findIndex(team => team.name === first_team.Team);
            if (team1Index !== -1) {
                groupTable[team1Index].addGame(outcome1 == 'win', result1, result2);
            } else {
                let team1 = new GroupPlacementEntry(first_team.Team);
                team1.addGame(outcome1 == 'win', result1, result2);
                groupTable.push(team1);
            }
            // Updating or instantiating the second team
            let team2Index = groupTable.findIndex(team => team.name === second_team.Team);
            if (team2Index !== -1) {
                groupTable[team2Index].addGame(outcome2 == 'win', result2, result1);
            } else {
                let team2 = new GroupPlacementEntry(second_team.Team);
                team2.addGame(outcome2 == 'win', result2, result1);
                groupTable.push(team2);
            }
        }
    }
    console.log(groupTable);
}

function generateResult(outcome1) {
    let genRes1 = Math.round(Math.random() * 51) + 50;
    let genRes2 = genRes1 - Math.round(Math.random() * 21) - 1;

    let result1, result2;

    if (outcome1 == 'win') {
        result1 = genRes1;
        result2 = genRes2;
    } else {
        result1 = genRes2;
        result2 = genRes1;
    }

    return { result1, result2 }

}

function simulateGroupMatch(winProbability) {

    let random = Math.random();
    let outcome1, outcome2;

    if (random <= winProbability) {
        outcome1 = 'win';
        outcome2 = 'loss';
    } else {
        outcome1 = 'loss';
        outcome2 = 'win';
    }

    return { outcome1, outcome2 };
}

function calculateProbability(a, b) {

    let rankDifference = Math.abs(a - b);

    // Calculating the win probability (for the better team)
    let winProbability;

    if (rankDifference <= 5) {
        winProbability = 0.55;
    } else if (rankDifference <= 10) {
        winProbability = 0.65;
    } else {
        winProbability = 0.75;
    }

    return winProbability;

}


simulateGroup(a);