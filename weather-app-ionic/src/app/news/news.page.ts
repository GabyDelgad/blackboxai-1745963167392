import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-news',
  templateUrl: './news.page.html',
  styleUrls: ['./news.page.scss'],
})
export class NewsPage implements OnInit {
  newsItems: Array<{title: string; description: string; link: string}> = [];
  errorMessage: string | null = null;
  loading: boolean = true;

  constructor(private router: Router) {}

  ngOnInit() {
    this.fetchNews();
  }

  async fetchNews() {
    this.loading = true;
    this.errorMessage = null;
    try {
      const proxyUrl = 'https://api.allorigins.win/get?url=';
      const feedUrl = encodeURIComponent('https://www.noaa.gov/news-release/rss.xml');
      const response = await fetch(proxyUrl + feedUrl);
      if (!response.ok) throw new Error('Erro ao buscar notícias');
      const data = await response.json();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(data.contents, "text/xml");
      const items = xmlDoc.querySelectorAll('item');
      if (items.length === 0) {
        this.newsItems = [];
        this.errorMessage = 'Nenhuma notícia encontrada.';
        return;
      }
      this.newsItems = [];
      items.forEach((item, index) => {
        if (index >= 10) return;
        const title = item.querySelector('title')?.textContent || '';
        const description = item.querySelector('description')?.textContent || '';
        const link = item.querySelector('link')?.textContent || '';
        this.newsItems.push({ title, description, link });
      });
    } catch (error: any) {
      this.errorMessage = error.message || 'Erro desconhecido';
    } finally {
      this.loading = false;
    }
  }

  goBack() {
    this.router.navigate(['/search']);
  }
}
