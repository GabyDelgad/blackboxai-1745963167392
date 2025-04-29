import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
})
export class SearchPage {
  city: string = '';

  constructor(private router: Router) {}

  search() {
    if (this.city.trim().length === 0) {
      return;
    }
    this.router.navigate(['/result'], { queryParams: { city: this.city.trim() } });
  }
}
