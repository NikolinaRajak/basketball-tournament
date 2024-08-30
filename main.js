const data = require('./groups.json');
const GroupPlacementEntry = require('./GroupPlacementEntry.js');
const MatchHistoryEntry = require('./MatchHistoryEntry.js');

const a = data.A;
const b = data.B;
const c = data.C;

function simulateGroup(array) {
    let groupTable = [];
    let matchHistory = [];
    for (let i = 0; i < array.length - 1; i++) {
        const first_team = array[i];
        for (let j = i + 1; j < array.length; j++) {
            const second_team = array[j];
            let winProbability = calculateProbability(first_team.FIBARanking, second_team.FIBARanking);
            let { outcome1, outcome2 } = simulateGroupMatch(winProbability);
            let { result1, result2 } = generateResult(outcome1);
            matchHistory.push(new MatchHistoryEntry(first_team.Team, second_team.Team, result1, result2));
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
    // console.log(groupTable);
    console.log("-------------------------------------------");


    groupTable.sort((a, b) => {
        // if (a.getPoints() == b.getPoints()) {
        //     for (let i = 0; i < matchHistory.length; i++) {
        //         const mh = matchHistory[i];
        //         //const firstTeamName = a.getName()
        //         //const secondTeamName = b.getName()

        //         if(mh.getTeamName1() == a.getName() && mh.getTeamName2 == b.getName() ||
        //         mh.getTeamName2() == b.getName() && mh.getTeamName1 == a.getName() ){  

        //         let first = mh.getTeamResult1() > mh.getTeamResult2();
        //         }else{
        //             let second = first;
        //         }
        //     }
        // } else {
        return b.getPoints() - a.getPoints();
        // }
    });

    // console.log(groupTable);
    return groupTable;
    // console.log(matchHistory);
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

function drawFormation(groupA, groupB, groupC) {
    let firstPlaceList = [];
    let secondPlaceList = [];
    let thirdPlaceList = [];

    firstPlaceList.push(groupA[0], groupB[0], groupC[0]);
    secondPlaceList.push(groupA[1], groupB[1], groupC[1]);
    thirdPlaceList.push(groupA[2], groupB[2], groupC[2]);

    //console.log(firstPlaceList, secondPlaceList, thirdPlaceList);
    //console.log("----------------------------------------------------");


    firstPlaceList.sort((a, b) => {
        if(a.getPoints() !== b.getPoints()) {
            return b.getPoints() - a.getPoints();
        } else if (a.getBasketDifference() !== b.getBasketDifference()){
            return b.getBasketDifference() - a.getBasketDifference();
        } else {
            return b.getScoredBaskets() - a.getScoredBaskets();
        }
    });
    secondPlaceList.sort((a, b) => {
        if(a.getPoints() !== b.getPoints()) {
            return b.getPoints() - a.getPoints();
        } else if (a.getBasketDifference() !== b.getBasketDifference()){
            return b.getBasketDifference() - a.getBasketDifference();
        } else {
            return b.getScoredBaskets() - a.getScoredBaskets();
        }
    });
    thirdPlaceList.sort((a, b) => {
        if(a.getPoints() !== b.getPoints()) {
            return b.getPoints() - a.getPoints();
        } else if (a.getBasketDifference() !== b.getBasketDifference()){
            return b.getBasketDifference() - a.getBasketDifference();
        } else {
            return b.getScoredBaskets() - a.getScoredBaskets();
        }
    });

    //console.log(firstPlaceList, secondPlaceList, thirdPlaceList);

    return firstPlaceList.concat(secondPlaceList, thirdPlaceList);

}


let groupA = simulateGroup(a);
console.log(groupA);
console.log("-------------------------------------------");
let groupB = simulateGroup(b);
console.log(groupB);
console.log("-------------------------------------------");
let groupC = simulateGroup(c);
console.log(groupC);
console.log("-------------------------------------------");
console.log("-------------------------------------------");
console.log("-------------------------------------------");

let draw = drawFormation(groupA, groupB, groupC);

console.log(draw);
