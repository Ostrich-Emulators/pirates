'use strict';

import { Pirate } from '../../../common/model/pirate';
import { Player } from '../../../common/model/player';
import { ShipDefinition } from '../../../common/model/ship-definition';
import { ShipType } from '../../../common/model/ship-type.enum';
import { Crew } from '../../../common/model/crew';
import { Ship } from '../../../common/model/ship';
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
}
