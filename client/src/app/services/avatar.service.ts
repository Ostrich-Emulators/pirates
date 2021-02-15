import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AvatarService {

  constructor() { }

  get avatars(): string[] {
    return [
      "/assets/avatar1.svg",
      "/assets/avatar2.svg",
      "/assets/avatar3.svg",
      "/assets/avatar4.svg",
      "/assets/avatar5.svg",
      "/assets/avatar6.svg",
    ];
  }
}
