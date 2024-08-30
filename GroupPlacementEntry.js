class GroupPlacementEntry {

    constructor(name) {
        this.name = name;
        this.wins = 0;
        this.losses = 0;
        this.points = 0;
        this.scoredBaskets = 0;
        this.receivedBaskets = 0;
        this.basketDifference = 0;
    }

    addGame(win, scoredBaskets, receivedBaskets) {
        if (win) {
            this.wins += 1;
            this.points += 2;
        } else {
            this.losses += 1;
            this.points += 1;
        }

        this.scoredBaskets += scoredBaskets;
        this.receivedBaskets += receivedBaskets;

        this.basketDifference = this.scoredBaskets - this.receivedBaskets;

    }

    getPoints() {
        return this.points;
    }

    getName() {
        return this.name;
    }

    getScoredBaskets() {
        return this.scoredBaskets;
    }

    getBasketDifference() {
        return this.basketDifference;
    }

}
module.exports = GroupPlacementEntry;