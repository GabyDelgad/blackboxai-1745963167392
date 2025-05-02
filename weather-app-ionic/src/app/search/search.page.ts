import { Component } from '@angular/core';

@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
})
export class SearchPage {
  city: string = '';
  weatherVisible: boolean = false;
  newsVisible: boolean = false;

  locationName: string = '';
  weatherDescription: string = '';
  temperature: number | null = null;
  windSpeed: number | null = null;
  humidity: number | null = null;
  pressure: number | null = null;

  newsItems: Array<{title: string; description: string; link: string}> = [];

  weatherDescriptions: {[key: number]: string} = {
    0: 'Céu limpo',
    1: 'Principalmente limpo',
    2: 'Parcialmente nublado',
    3: 'Nublado',
    45: 'Neblina',
    48: 'Neblina com cristais de gelo',
    51: 'Chuvisco leve',
    53: 'Chuvisco moderado',
    55: 'Chuvisco denso',
    56: 'Chuvisco congelante leve',
    57: 'Chuvisco congelante denso',
    61: 'Chuva leve',
    63: 'Chuva moderada',
    65: 'Chuva forte',
    66: 'Chuva congelante leve',
    67: 'Chuva congelante forte',
    71: 'Neve leve',
    73: 'Neve moderada',
    75: 'Neve forte',
    77: 'Granizo',
    80: 'Chuva de pancadas leve',
    81: 'Chuva de pancadas moderada',
    82: 'Chuva de pancadas forte',
    85: 'Neve de pancadas leve',
    86: 'Neve de pancadas forte',
    95: 'Tempestade com trovoadas',
    96: 'Tempestade com trovoadas e granizo leve',
    99: 'Tempestade com trovoadas e granizo forte'
  };

  constructor() {}

  async search() {
    if (!this.city.trim()) {
      return;
    }
    this.weatherVisible = true;
    this.newsVisible = false;
    this.locationName = '';
    this.weatherDescription = '';
    this.temperature = null;
    this.windSpeed = null;
    this.humidity = null;
    this.pressure = null;

    try {
      const coords = await this.fetchCoordinates(this.city);
      const weather = await this.fetchWeather(coords.lat, coords.lon);
      this.locationName = coords.display_name;
      this.weatherDescription = this.weatherDescriptions[weather.weathercode] || 'Desconhecido';
      this.temperature = weather.temperature;
      this.windSpeed = weather.windspeed;
      this.humidity = weather.relativehumidity;
      this.pressure = weather.pressure;
    } catch (error: any) {
      this.locationName = '';
      this.weatherDescription = error.message || 'Erro desconhecido';
    }
  }

  async showNews() {
    this.newsVisible = true;
    this.weatherVisible = false;
    this.newsItems = [];
    try {
      const proxyUrl = 'https://api.allorigins.win/raw?url=';
      const feedUrl = encodeURIComponent('https://www.noaa.gov/news-release/rss.xml');
      const response = await fetch(proxyUrl + feedUrl);
      if (!response.ok) throw new Error('Erro ao buscar notícias');
      const text = await response.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(text, "text/xml");
      const items = xmlDoc.querySelectorAll('item');
      if (items.length === 0) {
        this.newsItems = [];
        return;
      }
      this.newsItems = [];
      items.forEach((item, index) => {
        if (index >= 10) return;
        const title = item.querySelector('title')?.textContent || '';
        const description = item.querySelector('description')?.textContent || '';
        const link = item.querySelector('link')?.textContent || '#';
        this.newsItems.push({ title, description, link });
      });
    } catch (error) {
      this.newsItems = [];
    }
  }

  async fetchCoordinates(city: string): Promise<{lat: number, lon: number, display_name: string}> {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Erro ao buscar coordenadas');
    const data = await response.json();
    if (data.length === 0) throw new Error('Cidade não encontrada');
    return {
      lat: parseFloat(data[0].lat),
      lon: parseFloat(data[0].lon),
      display_name: data[0].display_name
    };
  }

  async fetchWeather(lat: number, lon: number): Promise<any> {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=relativehumidity_2m,pressure_msl&temperature_unit=celsius&windspeed_unit=kmh&timezone=auto`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Erro ao buscar dados do clima');
    const data = await response.json();
    if (!data.current_weather) throw new Error('Dados do clima indisponíveis');
    return data.current_weather;
  }
}
