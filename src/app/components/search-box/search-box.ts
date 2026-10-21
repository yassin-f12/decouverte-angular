import { Component, model } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-search-box',
  styleUrl: './search-box.css',
  templateUrl: './search-box.html',
})
export class SearchBox {
  readonly query = model('');
}
