import { Component, OnInit, Input } from '@angular/core'
import { Router } from '@angular/router'

import { AvatarService } from '../../services/avatar.service'
import { GameService } from '../../services/game.service'

import { Names } from '../../../../../common/tools/names'
import { take, takeUntil } from 'rxjs/operators';

import * as d3 from 'd3';

@Component({
  selector: 'app-setup',
  templateUrl: './setup.component.html',
  styleUrls: ['./setup.component.scss']
})
export class SetupComponent implements OnInit {
  avatar: string;
  private _female: boolean = false;
  captain: string = Names.captain();
  shipname: string = Names.ship();
  private _color: string = '#5F87FF';

  constructor(private imgsvc: AvatarService, private gamesvc: GameService, private router: Router) {
    var avidx = Math.random() * imgsvc.avatars.length;
    this.avatar = imgsvc.avatars[Math.floor(avidx)];
  }

  ngOnInit() {
    var subscription=this.imgsvc.loaded.subscribe(ok => {
      if (ok) {
        console.log('avatars are ready!');

        var svg = d3.select('#icons');
        var icons = svg.selectAll('#icons>svg').data(this.imgsvc.avatars);
        icons.exit().remove();
        var gs = icons.enter()
          .append('svg')
          .style('margin', '0.5em')
          .attr('transform', (d, i) => this.transformer(d, i))
          .attr('height', 64)
          .attr('width', 64)
          .html(d => this.imgsvc.svg(d, this.color).replace(/class=""/, 'class="icon"'))
          .on('click', (d, i) => {
            this.avatar = d;
            svg.selectAll('#icons>svg')
              .attr('transform', (d, i) => this.transformer(d, i));
          });

        subscription.unsubscribe();
      }
    });
  }

  get color(): string {
    return this._color;
  }

  set color(s: string) {
    this._color = s;
    d3.selectAll('g.icon>path').style('fill', this.color);
  }

  get female(): boolean {
    return this._female;
  }

  set female(isF: boolean) {
    this._female = isF;
    this.newcaptain();
  }

  private transformer(d, i): string {
    var scale = (this.avatar == d ? 1.25 : 1);
    return `scale(${scale})`;
  }

  newcaptain() {
    this.captain = Names.captain(this.female);
  }

  newname() {
    this.shipname = Names.ship();
  }

  sail() {
    this.gamesvc.start(this.captain, this.female, this.avatar,
      this.shipname, this.color ).pipe(take(1)).subscribe(data => {
        this.router.navigate(['/game']);
    });
  }
}
