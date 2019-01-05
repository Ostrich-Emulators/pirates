'use strict';

import { Pirate } from '../../../common/model/pirate';
import { Player } from '../../../common/model/player';
import { ShipDefinition } from '../../../common/model/ship-definition';
import { ShipType } from '../../../common/model/ship-type.enum';
import { Crew } from '../../../common/model/crew';
import { Ship } from '../../../common/model/ship';
import { ShipPair } from '../../../common/model/ship-pair';
import { StatusResponse } from '../../../common/model/status-response';
import { Game } from '../engine/game';
import { CombatResult } from '../../../common/model/combat-result';
import { BoardResult } from '../../../common/model/board-result';

export class GameController {
    constructor(private game: Game) {
    }

    one(playerid: string): Player {
        return this.game.getPlayer(playerid);
    }

    all(): Player[] {
        return this.game.getPlayers();
    }

    create(body): any {
        var player: Player = this.game.addPlayer(body.pirate, body.ship, body.color);
        var ship: Ship[] = this.game.getShipsForPlayer(player.id);

        return { player: player, ship: ship };
    }

    status(playerid: string): StatusResponse {
        var msgs: string[] = this.game.popMessages(playerid);
        var combat: CombatResult[] = this.game.popCombat(playerid);
        var board: BoardResult[] = this.game.popBoard(playerid);

        var ships: Ship[] = [];
        // hide the actual hull strengths of other people's ships
        this.game.getNonPlayerShips().forEach(s => {
            var newship: Ship = Object.assign({}, s);
            newship.hullStrength = Math.ceil(s.hullStrength);
            ships.push(newship);
        });
        var pshipid: string;
        
        this.game.pships.forEach(ship => { 
            var newship: Ship = Object.assign({}, ship);
            if (ship.ownerid === playerid) {
                pshipid = ship.id;
            }
            else{
                newship.hullStrength = Math.ceil(ship.hullStrength);
            }
            ships.push(newship);
        });

        return {
            messages: msgs,
            ships: ships,
            poolloc: this.game.poolloc,
            monsterloc: this.game.monsterloc,
            combat: combat,
            board: board,
            playershipid: pshipid
        };
    }
}
