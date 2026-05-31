package com.nitrohealth.example

import android.os.Bundle
import android.webkit.WebView
import androidx.activity.ComponentActivity

class PermissionsRationaleActivity : ComponentActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    val webView = WebView(this)
    webView.loadUrl("https://example.com/nitrohealth-privacy-policy")
    setContentView(webView)
  }
}
