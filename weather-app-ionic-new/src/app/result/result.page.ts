import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-result',
  templateUrl: './result.page.html',
  styleUrls: ['./result.page.scss'],
})
export class ResultPage implements OnInit {
  city: string | null = null;
  weather: any = null;
  errorMessage: string | null = null;
  loading: boolean = true;

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    this.route.queryParamMap.subscribe(params => {
      this.city = params.get('city');
      if (this.city) {
        this.fetchWeather(this.city);
      } else {
        this.errorMessage = 'Cidade não especificada.';
        this.loading = false;
      }
    });
  }

  async fetchWeather(city: string) {
    this.loading = true;
    this.errorMessage = null;
    try {
      // Fetch coordinates from Nominatim
      const geoResponse = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}`);
      if (!geoResponse.ok) throw new Error('Erro ao buscar coordenadas');
      const geoData = await geoResponse.json();
      if (geoData.length === 0) throw new Error('Cidade não encontrada');

      const lat = geoData[0].lat;
      const lon = geoData[0].lon;

      // Fetch weather from Open-Meteo
      const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=relativehumidity_2m,pressure_msl&temperature_unit=celsius&windspeed_unit=kmh&timezone=auto`);
      if (!weatherResponse.ok) throw new Error('Erro ao buscar dados do clima');
      const weatherData = await weatherResponse.json();
      if (!weatherData.current_weather) throw new Error('Dados do clima indisponíveis');

      // Map weather code to description
      const weatherDescriptions: {[key: number]: string} = {
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

      this.weather = weatherData.current_weather;
      this.weather.weathercode_description = weatherDescriptions[this.weather.weathercode] || 'Desconhecido';
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
