'use strict';

import { Pirate } from '../../../common/model/pirate';
import { Player } from '../../../common/model/player';
import { ShipDefinition } from '../../../common/model/ship-definition';
import { ShipType } from '../../../common/model/ship-type.enum';
import { Crew } from '../../../common/model/crew';
import { Ship } from '../../../common/model/ship';
import { ShipPair } from '../../../common/model/ship-pair';
import { StatusResponse } from '../../../common/model/status-response';
import { Game } from '../models/game';

export class GameController {
    constructor( private game:Game) {
    }

    one(playerid: string) :Player{
        return this.game.getPlayer(playerid);
    }

    all(): Player[]{
        return this.game.getPlayers();
    }

    create(pirate: Pirate): Player {
        return this.game.addPlayer(pirate);
    }

    status(playerid: string) :StatusResponse {
        var msgs: string[] = this.game.popMessages(playerid);
        var combat: ShipPair[] = this.game.popCombat(playerid);

        var ships: Ship[] = [];
        this.game.getNonPlayerShips().forEach(s => {
            ships.push(s);
        });
        this.game.getPlayers().forEach(p => { 
            ships.push(p.ship);
        });

        return {
            messages: msgs,
            ships: ships,
            poolloc: this.game.poolloc,
            monsterloc: this.game.monsterloc,
            combat: combat
        };
    }
}
