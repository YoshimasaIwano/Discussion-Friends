//
//  ContentView.swift
//  Rally
//
//  Created by Kaiyu Yokoi on 5/22/23.
//

import SwiftUI
import WebKit

struct WebView: UIViewRepresentable {
    let url: URL

    func makeUIView(context: Context) -> WKWebView {
        let webView = WKWebView()
        webView.load(URLRequest(url: url))
        return webView
    }
    func updateUIView(_ uiView: WKWebView, context: Context) {}
}

struct ContentView: View {
    var body: some View {
        WebView(url: URL(string: "https://treasure-385205.uc.r.appspot.com/")!)
            .edgesIgnoringSafeArea(.all)
    }
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
    }
}
