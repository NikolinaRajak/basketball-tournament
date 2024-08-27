const data = require('./groups.json');
//console.log(data);

const a = data.A;
console.log(a);

function simulateGroup(array) {
    for (let i = 0; i < array.length - 1; i++) {
        const first_team = array[i];
        for (let j = i + 1; j < array.length; j++) {
            const second_team = array[j];
            let { winProbability1, winProbability2 } = calculateProbability(first_team.FIBARanking, second_team.FIBARanking);
            let { outcome1, outcome2 } = simulateGroupMatch(winProbability1, winProbability2);
            let { result1, result2 } = generateResult(outcome1 == outcome2);
            let firstTeamsResult, secondTeamsResult;
            if (outcome1 == 'win') {
                firstTeamsResult = result1;
                secondTeamsResult = result2;
            } else {
                firstTeamsResult = result2;
                secondTeamsResult = result1;
            }
            console.log(first_team.Team + "(" + winProbability1 + ", " + outcome1 + ", " + firstTeamsResult + ")" + " vs " + second_team.Team + "(" + winProbability2 + ", " + outcome2 + ", " + secondTeamsResult + ")")
        }
    }
}

function generateResult(tie) {
    let result1 = Math.round(Math.random() * 51) + 50;
    let result2;
    
    if (tie) {
        result2 = result1;
    } else {
        result2 = result1 - Math.round(Math.random() * 21) - 1;
    }
    
    return { result1, result2 };
}

function simulateGroupMatch(prob1, prob2) {

    let random1 = Math.random();
    let random2 = Math.random();
    let outcome1, outcome2;

    if (random1 <= prob1) {
        outcome1 = 'win';
    } else {
        outcome1 = 'loss';
    }

    if (random2 <= prob2) {
        outcome2 = 'win';
    } else {
        outcome2 = 'loss';
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

    // Assigning the win probabilities to 
    // two variables (for the better and worse team)
    let winProbability1, winProbability2;

    if (a < b) {
        winProbability1 = winProbability;
        winProbability2 = 1 - winProbability
    } else {
        winProbability2 = winProbability;
        winProbability1 = 1 - winProbability
    }

    return { winProbability1, winProbability2 }

}



simulateGroup(a);