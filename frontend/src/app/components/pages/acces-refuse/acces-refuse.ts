import { Component } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
  imports: [MatIcon, MatButton, RouterLink],
  selector: 'app-acces-refuse',
  styleUrl: './acces-refuse.css',
  templateUrl: './acces-refuse.html',
})
export class AccesRefuse {}
