import { Player } from '../../../common/generated/model/player';
import { Ship } from '../../../common/generated/model/ship';
import { StatusResponse } from '../../../common/generated/model/statusResponse';
import { Game } from '../engine/game';
import { CombatResult } from '../../../common/generated/model/combatResult';
import { BoardResult } from '../../../common/generated/model/boardResult';
import { JoinData } from '../../../common/generated/model/joinData';
import { PlayerAndShip } from '../../../common/generated/model/playerAndShip';

export class GameController {
    constructor(private game: Game) {
    }

    one(playerid: string): Player {
        return this.game.getPlayer(playerid);
    }

    all(): Player[] {
        return this.game.getPlayers();
    }

    create(data: JoinData): PlayerAndShip {
        var player: Player = {
            id: undefined,
            name: data.captain,
            avatar: data.avatar,
            female: data.female,
            color: data.color,
            ai: false
        };
        return this.game.addHumanPlayer(player, data.shipname);
    }

    status(playerid: string): StatusResponse {
        var msgs: string[] = this.game.popMessages(playerid);
        var combat: CombatResult[] = this.game.popCombat(playerid);
        var board: BoardResult[] = this.game.popBoard(playerid);

        // players don't get to see the true values for ship metrics
        var ships: Ship[] = this.game.ships.map(s => {
            var newship: Ship = Object.assign({}, s);
            newship.hullStrength = Math.ceil(s.hullStrength);
            return newship;
        });

        return {
            messages: msgs,
            ships: ships,
            poolloc: this.game.poolloc,
            monsterloc: this.game.monsterloc,
            combat: combat,
            board: board
        };
    }
}
