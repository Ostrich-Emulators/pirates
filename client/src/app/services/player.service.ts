import { Injectable } from '@angular/core';

@Injectable()
export class PlayerService {
  public captain: string ='';
  public appelationF: boolean;
  public avatar: string;

  constructor() {
    if (localStorage.getItem('captain')) {
      this.captain = localStorage.getItem('captain');
      this.appelationF = ( 'TRUE' === localStorage.getItem('appelationF') );
      this.avatar = localStorage.getItem('avatar');
    }
  }
  
  get appelation() {
    return (this.appelationF ? 'Madam ' : 'Captain ') + this.captain;
  }


  create(capt: string, appel: boolean, ava: string) {
    this.captain = capt;
    this.appelationF = appel;
    this.avatar = ava;

    localStorage.setItem('captain', this.captain);
    localStorage.setItem('appelationF', (this.appelationF ? 'TRUE' : 'FALSE'));
    localStorage.setItem('avatar', this.avatar);
  }
}
