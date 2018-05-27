import { Injectable } from '@angular/core';

@Injectable()
export class ShipService {
  public avatars: string[] = [
    "/assets/avatar1.svg",
    "/assets/avatar2.svg",
    "/assets/avatar3.svg",
    "/assets/avatar4.svg"
  ];

  
  constructor() {
  }
}
