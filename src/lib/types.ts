export interface GameState {
    players: Player[];
    currentRound: Round;
    gameHistory: Round[];
    roundStats: RoundStatistics[];
    gameConfig: GameConfig;
    finished: boolean;
}

export interface Player {
    name: string;
    score: number;
}

export interface Round {
    number: number;
    dealer: number;
    bids: number[];
    tricks: number[];
}

export interface PlayerRoundStats {
    name: string;
    bid: number;
    tricks: number;
    score: number;
}

export interface RoundStatistics {
    roundNumber: number;
    playerStats: PlayerRoundStats[];
}

export interface GameConfig {
    gameType: GameType;
    minRound: number;
    maxRound: number;
    roundSequence: number[];
}

export enum GameType {
    ASCENDING = 'ascending', // lo to hi
    ASCENDING_DESCENDING = 'ascending-descending', // lo to hi to lo
    CUSTOM = 'custom', // custom sequence
} 