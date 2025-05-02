package com.example.weatherapp

import android.os.Bundle
import android.widget.TextView
import android.widget.Button
import androidx.appcompat.app.AppCompatActivity
import kotlinx.coroutines.*
import org.json.JSONObject
import java.net.URL

class ResultActivity : AppCompatActivity() {

    private lateinit var cityNameTextView: TextView
    private lateinit var weatherDescTextView: TextView
    private lateinit var temperatureTextView: TextView
    private lateinit var windTextView: TextView
    private lateinit var humidityTextView: TextView
    private lateinit var pressureTextView: TextView
    private lateinit var backButton: Button

    private val weatherDescriptions = mapOf(
        0 to "Céu limpo",
        1 to "Principalmente limpo",
        2 to "Parcialmente nublado",
        3 to "Nublado",
        45 to "Neblina",
        48 to "Neblina com cristais de gelo",
        51 to "Chuvisco leve",
        53 to "Chuvisco moderado",
        55 to "Chuvisco denso",
        56 to "Chuvisco congelante leve",
        57 to "Chuvisco congelante denso",
        61 to "Chuva leve",
        63 to "Chuva moderada",
        65 to "Chuva forte",
        66 to "Chuva congelante leve",
        67 to "Chuva congelante forte",
        71 to "Neve leve",
        73 to "Neve moderada",
        75 to "Neve forte",
        77 to "Granizo",
        80 to "Chuva de pancadas leve",
        81 to "Chuva de pancadas moderada",
        82 to "Chuva de pancadas forte",
        85 to "Neve de pancadas leve",
        86 to "Neve de pancadas forte",
        95 to "Tempestade com trovoadas",
        96 to "Tempestade com trovoadas e granizo leve",
        99 to "Tempestade com trovoadas e granizo forte"
    )

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_result)

        cityNameTextView = findViewById(R.id.cityName)
        weatherDescTextView = findViewById(R.id.weatherDescription)
        temperatureTextView = findViewById(R.id.temperature)
        windTextView = findViewById(R.id.wind)
        humidityTextView = findViewById(R.id.humidity)
        pressureTextView = findViewById(R.id.pressure)
        backButton = findViewById(R.id.backButton)

        val city = intent.getStringExtra("city") ?: ""
        cityNameTextView.text = city

        backButton.setOnClickListener {
            finish()
        }

        fetchWeather(city)
    }

    private fun fetchWeather(city: String) {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                // Fetch coordinates from Nominatim
                val geoUrl = "https://nominatim.openstreetmap.org/search?format=json&q=${city}"
                val geoResponse = URL(geoUrl).readText()
                val geoJson = JSONObject(geoResponse)
                if (geoJson.length() == 0) {
                    showError("Cidade não encontrada")
                    return@launch
                }
                val lat = geoJson.getJSONArray("lat")?.getString(0) ?: geoJson.getJSONObject(0).getString("lat")
                val lon = geoJson.getJSONArray("lon")?.getString(0) ?: geoJson.getJSONObject(0).getString("lon")

                // Fetch weather from Open-Meteo
                val weatherUrl = "https://api.open-meteo.com/v1/forecast?latitude=$lat&longitude=$lon&current_weather=true&hourly=relativehumidity_2m,pressure_msl&temperature_unit=celsius&windspeed_unit=kmh&timezone=auto"
                val weatherResponse = URL(weatherUrl).readText()
                val weatherJson = JSONObject(weatherResponse)
                val currentWeather = weatherJson.getJSONObject("current_weather")

                val temperature = currentWeather.getDouble("temperature")
                val windspeed = currentWeather.getDouble("windspeed")
                val weathercode = currentWeather.getInt("weathercode")

                // For humidity and pressure, get from hourly data if available
                val humidity = weatherJson.getJSONObject("hourly").getJSONArray("relativehumidity_2m").getInt(0)
                val pressure = weatherJson.getJSONObject("hourly").getJSONArray("pressure_msl").getInt(0)

                withContext(Dispatchers.Main) {
                    weatherDescTextView.text = weatherDescriptions[weathercode] ?: "Desconhecido"
                    temperatureTextView.text = "Temperatura: $temperature °C"
                    windTextView.text = "Vento: $windspeed km/h"
                    humidityTextView.text = "Umidade relativa: $humidity%"
                    pressureTextView.text = "Pressão atmosférica: $pressure hPa"
                }
            } catch (e: Exception) {
                showError("Erro ao buscar dados do clima")
            }
        }
    }

    private suspend fun showError(message: String) {
        withContext(Dispatchers.Main) {
            weatherDescTextView.text = message
            temperatureTextView.text = ""
            windTextView.text = ""
            humidityTextView.text = ""
            pressureTextView.text = ""
        }
    }
}
