const data = require('./groups.json');
const GroupPlacementEntry = require('./GroupPlacementEntry.js');
const MatchHistoryEntry = require('./MatchHistoryEntry.js');

function simulateGroup(array, collectiveMatchHistory) {
    let groupTable = [];
    let matchHistory = [];
    for (let i = 0; i < array.length - 1; i++) {
        const first_team = array[i];
        for (let j = i + 1; j < array.length; j++) {
            const second_team = array[j];
            let winProbability = calculateProbability(first_team.FIBARanking, second_team.FIBARanking);
            let { outcome1, outcome2 } = simulateMatch(winProbability);
            let { result1, result2 } = generateResult(outcome1);
            matchHistory.push(new MatchHistoryEntry(first_team.Team, second_team.Team, result1, result2));
            // console.log(first_team.Team + "(" + winProbability + ", " + outcome1 + ", " + result1 + ")" + " vs " + second_team.Team + "(" + (1 - winProbability) + ", " + outcome2 + ", " + result2 + ")")
            // Updating or instantiating the first team
            let team1Index = groupTable.findIndex(team => team.name === first_team.Team);
            if (team1Index !== -1) {
                groupTable[team1Index].addGame(outcome1 == 'win', result1, result2);
            } else {
                let team1 = new GroupPlacementEntry(first_team.Team, first_team.FIBARanking);
                team1.addGame(outcome1 == 'win', result1, result2);
                groupTable.push(team1);
            }
            // Updating or instantiating the second team
            let team2Index = groupTable.findIndex(team => team.name === second_team.Team);
            if (team2Index !== -1) {
                groupTable[team2Index].addGame(outcome2 == 'win', result2, result1);
            } else {
                let team2 = new GroupPlacementEntry(second_team.Team, second_team.FIBARanking);
                team2.addGame(outcome2 == 'win', result2, result1);
                groupTable.push(team2);
            }
        }
    }

    collectiveMatchHistory.concat(matchHistory)

    groupTable.sort((a, b) => {
        if (a.getPoints() !== b.getPoints()) {
            return b.getPoints() - a.getPoints();
        }
        const previousMatch = findMatch(a.getName(), b.getName(), matchHistory)

        if (previousMatch) {
            if (a.getName() === previousMatch.getTeamName1() && previousMatch.getTeamResult1() > previousMatch.getTeamResult2()) {
                return -1;
            } else if (b.getName() === previousMatch.getTeamName1() && previousMatch.getTeamResult1() > previousMatch.getTeamResult2()) {
                return 1;
            } else if (a.getName() === previousMatch.getTeamName2() && previousMatch.getTeamResult2() > previousMatch.getTeamResult1()) {
                return -1;
            } else if (b.getName() === previousMatch.getTeamName2() && previousMatch.getTeamResult2() > previousMatch.getTeamResult1()) {
                return 1;
            }
        }

        return 0;
    });

    // Printing match history and final group status

    for (let i = 0; i < 3; i++) {
        console.log(`   Round ${i + 1}:`);
        console.log(`       ${matchHistory[i].getTeamName1()} - ${matchHistory[i].getTeamName2()} (${matchHistory[i].getTeamResult1()}:${matchHistory[i].getTeamResult2()})`);
        let offsetIndex = matchHistory.length - 1 - i;
        console.log(`       ${matchHistory[offsetIndex].getTeamName1()} - ${matchHistory[offsetIndex].getTeamName2()} (${matchHistory[offsetIndex].getTeamResult1()}:${matchHistory[offsetIndex].getTeamResult2()})`);
    }
    console.log("");
    console.log("Group standing: (wins / losses / points / scored baskets / received baskets / basket difference)\n");
    groupTable.forEach((team, index) => {
        let teamName = team.getName()
        let paddedName = teamName.padEnd(18, ' ');
        console.log(`${index + 1}. ${paddedName} ${team.getWins()} / ${team.getLosses()} / ${team.getPoints()} / ${team.getScoredBaskets()} / ${team.getReceivedBaskets()} / ${team.getBasketDifference()}`);

    })
    console.log("");

    return groupTable;
}

function findMatch(team1, team2, matchHistory) {
    for (let match of matchHistory) {
        if ((match.teamName1 === team1 && match.teamName2 === team2) ||
            (match.teamName1 === team2 && match.teamName2 === team1)) {
            return match;
        }
    }
    return null; // Return null if no match is found
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

function simulateMatch(winProbability) {

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

    if (a > b)
        winProbability = 1 - winProbability;

    return winProbability;
}

function makeDrawList(groupA, groupB, groupC) {
    let firstPlaceList = [];
    let secondPlaceList = [];
    let thirdPlaceList = [];

    firstPlaceList.push(groupA[0], groupB[0], groupC[0]);
    secondPlaceList.push(groupA[1], groupB[1], groupC[1]);
    thirdPlaceList.push(groupA[2], groupB[2], groupC[2]);

    //console.log(firstPlaceList, secondPlaceList, thirdPlaceList);
    //console.log("----------------------------------------------------");


    firstPlaceList.sort((a, b) => {
        if (a.getPoints() !== b.getPoints()) {
            return b.getPoints() - a.getPoints();
        } else if (a.getBasketDifference() !== b.getBasketDifference()) {
            return b.getBasketDifference() - a.getBasketDifference();
        } else {
            return b.getScoredBaskets() - a.getScoredBaskets();
        }
    });
    secondPlaceList.sort((a, b) => {
        if (a.getPoints() !== b.getPoints()) {
            return b.getPoints() - a.getPoints();
        } else if (a.getBasketDifference() !== b.getBasketDifference()) {
            return b.getBasketDifference() - a.getBasketDifference();
        } else {
            return b.getScoredBaskets() - a.getScoredBaskets();
        }
    });
    thirdPlaceList.sort((a, b) => {
        if (a.getPoints() !== b.getPoints()) {
            return b.getPoints() - a.getPoints();
        } else if (a.getBasketDifference() !== b.getBasketDifference()) {
            return b.getBasketDifference() - a.getBasketDifference();
        } else {
            return b.getScoredBaskets() - a.getScoredBaskets();
        }
    });

    //console.log(firstPlaceList, secondPlaceList, thirdPlaceList);
    let concatedList = firstPlaceList.concat(secondPlaceList, thirdPlaceList);
    concatedList.pop()
    return concatedList;

}

function simulateFinals(hatD, hatE, hatF, hatG, previousMatchHistory) {

    console.log("Hats:");
    console.log("   Hat D:");
    console.log(`       ${hatD[0].getName()}`);
    console.log(`       ${hatD[1].getName()}`);
    console.log("   Hat E:");
    console.log(`       ${hatE[0].getName()}`);
    console.log(`       ${hatE[1].getName()}`);
    console.log("   Hat F:");
    console.log(`       ${hatF[0].getName()}`);
    console.log(`       ${hatF[1].getName()}`);
    console.log("   Hat G:");
    console.log(`       ${hatG[0].getName()}`);
    console.log(`       ${hatG[1].getName()}\n`);

    let chosenOpponent;
    let firstMatch, secondMatch;

    // Drafting the quarter finals

    chosenOpponent = Math.round(Math.random());
    firstMatch = findMatch(hatD[0].getName(), hatG[chosenOpponent].getName(), previousMatchHistory);
    secondMatch = findMatch(hatD[1].getName(), hatG[1 - chosenOpponent].getName(), previousMatchHistory);
    if (firstMatch || secondMatch) {
        chosenOpponent = 1 - chosenOpponent;
    }
    let quarterFinal1 = [hatD[0], hatG[chosenOpponent]];
    let quarterFinal3 = [hatD[1], hatG[1 - chosenOpponent]];

    chosenOpponent = Math.round(Math.random());
    firstMatch = findMatch(hatE[0].getName(), hatF[chosenOpponent].getName(), previousMatchHistory);
    secondMatch = findMatch(hatE[1].getName(), hatF[1 - chosenOpponent].getName(), previousMatchHistory);
    if (firstMatch || secondMatch) {
        chosenOpponent = 1 - chosenOpponent;
    }
    let quarterFinal2 = [hatE[0], hatF[chosenOpponent]];
    let quarterFinal4 = [hatE[1], hatF[1 - chosenOpponent]];


    let quarterFinalsMatchHistory = [];
    let semiFinalsMatchHistory = [];

    let semiFinals1 = [];
    let semiFinals2 = [];
    let thirdPlaceMatch = [];
    let finals = [];

    // ----------- Quarter finals -----------

    // first quarter final match
    let winProbability = calculateProbability(quarterFinal1[0].getFIBARanking(), quarterFinal1[1].getFIBARanking());
    let { outcome1, outcome2 } = simulateMatch(winProbability);
    let { result1, result2 } = generateResult(outcome1);

    quarterFinalsMatchHistory.push(new MatchHistoryEntry(quarterFinal1[0].getName(), quarterFinal1[1].getName(), result1, result2));

    if (outcome1 === 'win')
        semiFinals1.push(quarterFinal1[0])
    else
        semiFinals1.push(quarterFinal1[1])

    // second quarter final match
    winProbability = calculateProbability(quarterFinal2[0].getFIBARanking(), quarterFinal2[1].getFIBARanking());
    ({ outcome1, outcome2 } = simulateMatch(winProbability));
    ({ result1, result2 } = generateResult(outcome1));

    quarterFinalsMatchHistory.push(new MatchHistoryEntry(quarterFinal2[0].getName(), quarterFinal2[1].getName(), result1, result2));

    if (outcome1 === 'win')
        semiFinals1.push(quarterFinal2[0])
    else
        semiFinals1.push(quarterFinal2[1])

    // third quarter final match
    winProbability = calculateProbability(quarterFinal3[0].getFIBARanking(), quarterFinal3[1].getFIBARanking());
    ({ outcome1, outcome2 } = simulateMatch(winProbability));
    ({ result1, result2 } = generateResult(outcome1));

    quarterFinalsMatchHistory.push(new MatchHistoryEntry(quarterFinal3[0].getName(), quarterFinal3[1].getName(), result1, result2));

    if (outcome1 === 'win')
        semiFinals2.push(quarterFinal3[0])
    else
        semiFinals2.push(quarterFinal3[1])

    // fourth quarter final match
    winProbability = calculateProbability(quarterFinal4[0].getFIBARanking(), quarterFinal4[1].getFIBARanking());
    ({ outcome1, outcome2 } = simulateMatch(winProbability));
    ({ result1, result2 } = generateResult(outcome1));

    quarterFinalsMatchHistory.push(new MatchHistoryEntry(quarterFinal4[0].getName(), quarterFinal4[1].getName(), result1, result2));

    if (outcome1 === 'win')
        semiFinals2.push(quarterFinal4[0])
    else
        semiFinals2.push(quarterFinal4[1])


    // ----------- Semi finals -----------

    // first semi final match
    winProbability = calculateProbability(semiFinals1[0].getFIBARanking(), semiFinals1[1].getFIBARanking());
    ({ outcome1, outcome2 } = simulateMatch(winProbability));
    ({ result1, result2 } = generateResult(outcome1));

    semiFinalsMatchHistory.push(new MatchHistoryEntry(semiFinals1[0].getName(), semiFinals1[1].getName(), result1, result2));

    if (outcome1 === 'win') {
        finals.push(semiFinals1[0])
        thirdPlaceMatch.push(semiFinals1[1])
    }
    else {
        finals.push(semiFinals1[1])
        thirdPlaceMatch.push(semiFinals1[0])
    }

    // second semi final match
    winProbability = calculateProbability(semiFinals2[0].getFIBARanking(), semiFinals2[1].getFIBARanking());
    ({ outcome1, outcome2 } = simulateMatch(winProbability));
    ({ result1, result2 } = generateResult(outcome1));

    semiFinalsMatchHistory.push(new MatchHistoryEntry(semiFinals2[0].getName(), semiFinals2[1].getName(), result1, result2));

    if (outcome1 === 'win') {
        finals.push(semiFinals2[0])
        thirdPlaceMatch.push(semiFinals2[1])
    }
    else {
        finals.push(semiFinals2[1])
        thirdPlaceMatch.push(semiFinals2[0])
    }


    // ----------- Third Place Match -----------
    winProbability = calculateProbability(thirdPlaceMatch[0].getFIBARanking(), thirdPlaceMatch[1].getFIBARanking());
    ({ outcome1, outcome2 } = simulateMatch(winProbability));
    ({ result1, result2 } = generateResult(outcome1));

    let thirdPlaceMatchResult = new MatchHistoryEntry(thirdPlaceMatch[0].getName(), thirdPlaceMatch[1].getName(), result1, result2);

    // ----------- Finals -----------
    winProbability = calculateProbability(finals[0].getFIBARanking(), finals[1].getFIBARanking());
    ({ outcome1, outcome2 } = simulateMatch(winProbability));
    ({ result1, result2 } = generateResult(outcome1));

    let finalMatchResult = new MatchHistoryEntry(finals[0].getName(), finals[1].getName(), result1, result2);

    let firstPlace = finalMatchResult.getTeamResult1() > finalMatchResult.getTeamResult2() ? finalMatchResult.getTeamName1() : finalMatchResult.getTeamName2()
    let secondPlace = finalMatchResult.getTeamResult1() < finalMatchResult.getTeamResult2() ? finalMatchResult.getTeamName1() : finalMatchResult.getTeamName2()
    let thirdPlace = thirdPlaceMatchResult.getTeamResult1() > thirdPlaceMatchResult.getTeamResult2() ? thirdPlaceMatchResult.getTeamName1() : thirdPlaceMatchResult.getTeamName2()

    console.log("Quarter finals:");
    quarterFinalsMatchHistory.forEach(qfm => {
        console.log(`   ${qfm.getTeamName1()} - ${qfm.getTeamName2()} (${qfm.getTeamResult1()}:${qfm.getTeamResult2()})`);
    });
    console.log("");
    console.log("Semi finals:");
    semiFinalsMatchHistory.forEach(sfm => {
        console.log(`   ${sfm.getTeamName1()} - ${sfm.getTeamName2()} (${sfm.getTeamResult1()}:${sfm.getTeamResult2()})`);
    });
    console.log("");
    console.log("Third place match:");
    console.log(`   ${thirdPlaceMatchResult.getTeamName1()} - ${thirdPlaceMatchResult.getTeamName2()} (${thirdPlaceMatchResult.getTeamResult1()}:${thirdPlaceMatchResult.getTeamResult2()})\n`);
    console.log("Final match:");
    console.log(`   ${finalMatchResult.getTeamName1()} - ${finalMatchResult.getTeamName2()} (${finalMatchResult.getTeamResult1()}:${finalMatchResult.getTeamResult2()})\n`);
    console.log("Medals:");
    console.log(`   1. ${firstPlace}`);
    console.log(`   2. ${secondPlace}`);
    console.log(`   3. ${thirdPlace}`);
    
    

}

const a = data.A;
const b = data.B;
const c = data.C;

collectiveMatchHistory = [];

console.log("Group A:");
let groupA = simulateGroup(a, collectiveMatchHistory);
console.log("------------------------------------------------------\n");
console.log("Group B:");
let groupB = simulateGroup(b, collectiveMatchHistory);
console.log("------------------------------------------------------\n");
console.log("Group C:");
let groupC = simulateGroup(c, collectiveMatchHistory);
console.log("------------------------------------------------------\n");

let draw = makeDrawList(groupA, groupB, groupC);

let firstHat = [draw[0], draw[1]];
let secondHat = [draw[2], draw[3]];
let thirdHat = [draw[4], draw[5]];
let fourthHat = [draw[6], draw[7]];

simulateFinals(firstHat, secondHat, thirdHat, fourthHat, collectiveMatchHistory)
