class MatchHistoryEntry{

    constructor(teamName1, teamName2, result1, result2){

        this.teamName1 = teamName1;
        this.teamName2 = teamName2;
        this.result1 = result1;
        this.result2 = result2;

    }

    getTeamName1() {
        return this.teamName1;
    }

    getTeamName2() {
        return this.teamName2;
    }

    getTeamResult1(){
        return this.result1;
    }

    getTeamResult2(){
        return this.result2;
    }
}
module.exports = MatchHistoryEntry;