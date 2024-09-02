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
            console.log(first_team.Team + "(" + winProbability + ", " + outcome1 + ", " + result1 + ")" + " vs " + second_team.Team + "(" + (1 - winProbability) + ", " + outcome2 + ", " + result2 + ")")
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
    console.log("group table unsorted");

    console.log(groupTable);
    console.log("-------------------------------------------");


    console.log("group table sorted");

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
    console.log(groupTable);

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

    let chosenOpponent; // Math.round(Math.random()); // TODO incorporate match history
    let firstMatch, secondMatch;

    // Drafting the quarter finals

    chosenOpponent = Math.round(Math.random());
    firstMatch = findMatch(hatD[0].getName(), hatG[chosenOpponent].getName(), previousMatchHistory);
    secondMatch = findMatch(hatD[0].getName(), hatG[1 - chosenOpponent].getName(), previousMatchHistory);
    if (firstMatch || secondMatch) {
        chosenOpponent = 1 - chosenOpponent;
    }
    let quarterFinal1 = [hatD[0], hatG[chosenOpponent]];
    let quarterFinal3 = [hatD[1], hatG[1 - chosenOpponent]];

    chosenOpponent = Math.round(Math.random());
    firstMatch = findMatch(hatE[0].getName(), hatF[chosenOpponent].getName(), previousMatchHistory);
    secondMatch = findMatch(hatE[0].getName(), hatF[1 - chosenOpponent].getName(), previousMatchHistory);
    if (firstMatch || secondMatch) {
        chosenOpponent = 1 - chosenOpponent;
    }
    let quarterFinal2 = [hatE[0], hatF[chosenOpponent]];
    let quarterFinal4 = [hatE[1], hatF[1 - chosenOpponent]];


    let quarterFinalsMatchHistory = [];
    let semiFinalsMatchHistory = [];

    let semiFinals1 = [];
    let semiFinals2 = [];
    let finals = [];

    // ----------- Quarter finals -----------

    // first quarter final match
    let winProbability = calculateProbability(quarterFinal1[0].getFIBARanking(), quarterFinal1[1].getFIBARanking());
    let { outcome1, outcome2 } = simulateMatch(winProbability);
    let { result1, result2 } = generateResult(outcome1);

    quarterFinalsMatchHistory.push(new MatchHistoryEntry(quarterFinal1[0].getName(), quarterFinal1[1].getName(), result1, result2));
    console.log(quarterFinal1[0].getName() + "(" + winProbability + ", " + outcome1 + ", " + result1 + ")" + " vs " + quarterFinal1[1].getName() + "(" + (1 - winProbability) + ", " + outcome2 + ", " + result2 + ")")

    if (outcome1 === 'win')
        semiFinals1.push(quarterFinal1[0])
    else
        semiFinals1.push(quarterFinal1[1])

    // second quarter final match
    winProbability = calculateProbability(quarterFinal2[0].getFIBARanking(), quarterFinal2[1].getFIBARanking());
    ({ outcome1, outcome2 } = simulateMatch(winProbability));
    ({ result1, result2 } = generateResult(outcome1));

    quarterFinalsMatchHistory.push(new MatchHistoryEntry(quarterFinal2[0].getName(), quarterFinal2[1].getName(), result1, result2));
    console.log(quarterFinal2[0].getName() + "(" + winProbability + ", " + outcome1 + ", " + result1 + ")" + " vs " + quarterFinal2[1].getName() + "(" + (1 - winProbability) + ", " + outcome2 + ", " + result2 + ")")

    if (outcome1 === 'win')
        semiFinals1.push(quarterFinal2[0])
    else
        semiFinals1.push(quarterFinal2[1])

    console.log(semiFinals1);

    // third quarter final match
    winProbability = calculateProbability(quarterFinal3[0].getFIBARanking(), quarterFinal3[1].getFIBARanking());
    ({ outcome1, outcome2 } = simulateMatch(winProbability));
    ({ result1, result2 } = generateResult(outcome1));

    quarterFinalsMatchHistory.push(new MatchHistoryEntry(quarterFinal3[0].getName(), quarterFinal3[1].getName(), result1, result2));
    console.log(quarterFinal3[0].getName() + "(" + winProbability + ", " + outcome1 + ", " + result1 + ")" + " vs " + quarterFinal3[1].getName() + "(" + (1 - winProbability) + ", " + outcome2 + ", " + result2 + ")")

    if (outcome1 === 'win')
        semiFinals2.push(quarterFinal3[0])
    else
        semiFinals2.push(quarterFinal3[1])

    // fourth quarter final match
    winProbability = calculateProbability(quarterFinal4[0].getFIBARanking(), quarterFinal4[1].getFIBARanking());
    ({ outcome1, outcome2 } = simulateMatch(winProbability));
    ({ result1, result2 } = generateResult(outcome1));

    quarterFinalsMatchHistory.push(new MatchHistoryEntry(quarterFinal4[0].getName(), quarterFinal4[1].getName(), result1, result2));
    console.log(quarterFinal4[0].getName() + "(" + winProbability + ", " + outcome1 + ", " + result1 + ")" + " vs " + quarterFinal4[1].getName() + "(" + (1 - winProbability) + ", " + outcome2 + ", " + result2 + ")")

    if (outcome1 === 'win')
        semiFinals2.push(quarterFinal4[0])
    else
        semiFinals2.push(quarterFinal4[1])

    console.log(semiFinals2);

    // ----------- Semi finals -----------

    // first semi final match
    winProbability = calculateProbability(semiFinals1[0].getFIBARanking(), semiFinals1[1].getFIBARanking());
    ({ outcome1, outcome2 } = simulateMatch(winProbability));
    ({ result1, result2 } = generateResult(outcome1));

    semiFinalsMatchHistory.push(new MatchHistoryEntry(semiFinals1[0].getName(), semiFinals1[1].getName(), result1, result2));
    console.log(semiFinals1[0].getName() + "(" + winProbability + ", " + outcome1 + ", " + result1 + ")" + " vs " + semiFinals1[1].getName() + "(" + (1 - winProbability) + ", " + outcome2 + ", " + result2 + ")")

    if (outcome1 === 'win')
        finals.push(semiFinals1[0])
    else
        finals.push(semiFinals1[1])

    // second semi final match
    winProbability = calculateProbability(semiFinals2[0].getFIBARanking(), semiFinals2[1].getFIBARanking());
    ({ outcome1, outcome2 } = simulateMatch(winProbability));
    ({ result1, result2 } = generateResult(outcome1));

    semiFinalsMatchHistory.push(new MatchHistoryEntry(semiFinals2[0].getName(), semiFinals2[1].getName(), result1, result2));
    console.log(semiFinals2[0].getName() + "(" + winProbability + ", " + outcome1 + ", " + result1 + ")" + " vs " + semiFinals2[1].getName() + "(" + (1 - winProbability) + ", " + outcome2 + ", " + result2 + ")")

    if (outcome1 === 'win')
        finals.push(semiFinals2[0])
    else
        finals.push(semiFinals2[1])


    console.log(finals);

    // ----------- Finals -----------
    winProbability = calculateProbability(finals[0].getFIBARanking(), finals[1].getFIBARanking());
    ({ outcome1, outcome2 } = simulateMatch(winProbability));
    ({ result1, result2 } = generateResult(outcome1));

    let finalMatchResult = new MatchHistoryEntry(finals[0].getName(), finals[1].getName(), result1, result2);
    console.log(finals[0].getName() + "(" + winProbability + ", " + outcome1 + ", " + result1 + ")" + " vs " + finals[1].getName() + "(" + (1 - winProbability) + ", " + outcome2 + ", " + result2 + ")")

    console.log(finalMatchResult, "Result of the final match");

}


const a = data.A;
const b = data.B;
const c = data.C;

collectiveMatchHistory = [];

let groupA = simulateGroup(a, collectiveMatchHistory);
console.log(groupA);
console.log("-------------------------------------------");
let groupB = simulateGroup(b, collectiveMatchHistory);
console.log(groupB);
console.log("-------------------------------------------");
let groupC = simulateGroup(c, collectiveMatchHistory);
console.log(groupC);
console.log("-------------------------------------------");
console.log("-------------------------------------------");
console.log("-------------------------------------------");

let draw = makeDrawList(groupA, groupB, groupC);

//console.log(draw);

let firstHat = [draw[0], draw[1]];
console.log(firstHat, "first hat");
let secondHat = [draw[2], draw[3]];
console.log(secondHat, "second hat");
let thirdHat = [draw[4], draw[5]];
console.log(thirdHat, "third hat");
let fourthHat = [draw[6], draw[7]];
console.log(fourthHat, "fourth hat");

simulateFinals(firstHat, secondHat, thirdHat, fourthHat, collectiveMatchHistory)
