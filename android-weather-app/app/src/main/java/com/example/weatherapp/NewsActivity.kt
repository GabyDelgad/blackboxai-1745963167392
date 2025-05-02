package com.example.weatherapp

import android.os.Bundle
import android.widget.ArrayAdapter
import android.widget.ListView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import kotlinx.coroutines.*
import org.w3c.dom.Element
import java.net.URL
import javax.xml.parsers.DocumentBuilderFactory

class NewsActivity : AppCompatActivity() {

    private lateinit var newsListView: ListView
    private val newsItems = mutableListOf<String>()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_news)

        newsListView = findViewById(R.id.newsListView)

        fetchNews()
    }

    private fun fetchNews() {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val proxyUrl = "https://api.allorigins.win/raw?url="
                val feedUrl = "https://www.noaa.gov/news-release/rss.xml"
                val url = proxyUrl + feedUrl
                val connection = URL(url).openConnection()
                connection.connect()
                val inputStream = connection.getInputStream()

                val builderFactory = DocumentBuilderFactory.newInstance()
                val docBuilder = builderFactory.newDocumentBuilder()
                val doc = docBuilder.parse(inputStream)
                val items = doc.getElementsByTagName("item")

                newsItems.clear()
                for (i in 0 until minOf(items.length, 10)) {
                    val item = items.item(i) as Element
                    val title = item.getElementsByTagName("title").item(0).textContent
                    newsItems.add(title)
                }

                withContext(Dispatchers.Main) {
                    val adapter = ArrayAdapter(this@NewsActivity, android.R.layout.simple_list_item_1, newsItems)
                    newsListView.adapter = adapter
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    Toast.makeText(this@NewsActivity, "Erro ao buscar notícias", Toast.LENGTH_LONG).show()
                }
            }
        }
    }
}
