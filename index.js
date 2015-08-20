const DEBUG = false
const DATA_PROVIDERS_URL = "https://raw.githubusercontent.com/neoranga55/bitcoin-price-ticker/refactor-to-use-firefox-frames/data/data-providers.json"
const ADDON_UPDATE_DOCUMENT_URL = "http://neoranga55.github.io/bitcoin-price-ticker/"

// The main module of the Add-on.
var ui = require("sdk/ui")
const {Cc, Ci, Cu} = require("chrome")
Cu.import("resource://gre/modules/AddonManager.jsm") // Addon Manager required to know addon version
const setTimeout = require("sdk/timers").setTimeout
const setInterval = require("sdk/timers").setInterval
const clearInterval = require("sdk/timers").clearInterval
const ADDON_ID = "jid0-ziK34XHkBWB9ezxd4l9Q1yC7RP0@jetpack"
const DEFAULT_REFRESH_RATE = 60
const DEFAULT_FONT_SIZE = 14

var Preferences = require("sdk/simple-prefs")
var prefs = Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefService).getBranch("extensions.ADDON_ID.")
var Request = require("sdk/request").Request
var tabs = require("sdk/tabs")

var orderedTickers = new Array()
var tickers = {} // Store all tickers here

exports.main = function() {

  function getPreference(prefName, type) {
    if (typeof Preferences.prefs[prefName] == "undefined") {
      if (DEBUG) console.log("bitcoin-price-ticker addon error: " + prefName + " preference is not defined")
      switch (type) {
        case "boolean":
          return false
        case "integer":
          return -1
        case "string":
          return ""
        default:
          return null
      }
    }
    return Preferences.prefs[prefName]
  }

  function getBooleanPreference(prefName) {
    return getPreference(prefName, "boolean")
  }

  function getIntegerPreference(prefName) {
    return getPreference(prefName, "integer")
  }

  function getStringPreference(prefName) {
    return getPreference(prefName, "string")
  }

  function getBackgroundColor(id) {
    var lowId = id.toLowerCase()
    var otherBgCryptos = [ "dogecoin", "worldcoin", "namecoin", "auroracoin", "blackcoin", "nxt",
      "bitshares", "ripple", "maidsafe", "bitcoindark", "monero", "dash", "burst" ]
    for (var i in otherBgCryptos) {
      if (lowId.indexOf(otherBgCryptos[i]) != -1) {  // Alt-coin
        if (getBooleanPreference("other-background")) {
          return otherBgCryptos[i]
        }
      }
    }
    if (lowId.indexOf("litecoin") != -1) {
      if (getBooleanPreference("silver-background")) { // Currency is Litecoin
        return "silver"
      }
    } else if (getBooleanPreference("gold-background")) { // Currency is Bitcoin
      return "gold"
    }
    return null
  }

  function getTickerConfigurationData(tickerId) {
    var fontSize = getIntegerPreference("defaultFontSize")
    if (fontSize <= 0) {
      fontSize = DEFAULT_FONT_SIZE
    }
    if (tickers[tickerId]) {
      tickers[tickerId].enabled = getBooleanPreference("p" + tickerId)
      tickers[tickerId].currencyPosition = getStringPreference("show-currency-label")
      tickers[tickerId].color = getStringPreference("p" + tickerId + "Color")
      tickers[tickerId].fontSize = fontSize
      tickers[tickerId].background = getBackgroundColor(tickerId)
    }
  }

  // Use tickers enabled in preferences to load in that order regardless of stored order
  function loadDefaultTickers() {
    for (var tickerId in tickers) {
      if ( getBooleanPreference("p" + tickerId) ) { // Create Ticker
        updateTickerConfiguration(tickerId)
        if (tickers[tickerId].enabled) orderedTickers.push(tickerId)
      }
    }
    if ((orderedTickers != null) && (orderedTickers.length > 0)) {
      storeTickersOrder()
    }
  }

  // Load the order of the tickers and simultaneously create them
  function loadTickersInOrder() {
    var orderedActiveTickers = ""
    try {
      orderedActiveTickers = prefs.getCharPref("extensions.ADDON_ID.tickers_order")
      if (orderedActiveTickers.length < 1) { // There is no order of tickers in addon set yet
        loadDefaultTickers()
        return
      }
      var listOrderedTickers = orderedActiveTickers.split(",")
      if (listOrderedTickers.length < 1) { // There is no order of tickers in addon set yet
        loadDefaultTickers()
        return
      }
      for (var i in listOrderedTickers) {
        loadTicker(listOrderedTickers[i])
        if (tickers[tickerId].enabled) orderedTickers.push(tickerId)
      }
    } catch (e) { // There is no order of tickers in addon set yet
      loadDefaultTickers()
    }
  }

  // Store the order of the active tickers
  function storeTickersOrder() {
    if ((orderedTickers == null) || (orderedTickers.length == 0)) {
      loadDefaultTickers()
    } else {
      var orderedActiveTickers = ""
      if ((orderedTickers != null) && (orderedTickers.length > 0)) {
        for (var i in orderedTickers) { // Traverse skipping empty
          if (orderedActiveTickers.length > 0) {
            orderedActiveTickers += "," + orderedTickers[i]
          } else {
            orderedActiveTickers = orderedTickers[i]
          }
        }
      }
      if (DEBUG) console.log("Storing tickers in order:" + orderedActiveTickers)
      prefs.setCharPref("extensions.ADDON_ID.tickers_order", orderedActiveTickers) // Update list of tickers active in order in preferences
    }
  }

  // Live enable/disable ticker from options checkbox
  function toggleTicker(tickerId) {
    if ( getBooleanPreference("p" + tickerId) ) { // Enable Ticker
      updateTickerConfiguration(tickerId)
      updateTickerRefreshIntervalForTicker(tickerId)
      orderedTickers.push(tickerId)
      storeTickersOrder()
    } else if (tickers[tickerId].enabled) { // Disable Ticker if it exists
      tickers[tickerId].enabled = false
      stopAutoPriceUpdate(tickerId)
      updateTickerConfiguration(tickerId)
      for (var i = 0; i < orderedTickers.length; i++) {
        if (orderedTickers[i] == tickerId) {
          orderedTickers.splice(i, 1) // Remove the ticker completely from the array with reordering
          break
        }
      }
      storeTickersOrder()
    }
  }

  function updateTickerConfiguration(tickerId) {
    getTickerConfigurationData(tickerId)
    if (DEBUG) console.log("Sending config JSON data to frame:" + tickerId + "-" + JSON.stringify(tickers[tickerId]))
    tickersFrame.postMessage({
      "type": "updateTickerConfiguration",
      "id": tickerId,
      "data": tickers[tickerId]
    }, tickersFrame.url)
  }

  function fetchURLData(id, url, jsonPath) {
    if (id == "undefined" || url == "undefined" || jsonPath == "undefined") {
      return
    }
    if (DEBUG) console.log("Requesting JSON data from " + url)
    Request({
      url: url,
      onComplete: function (response) {
        if ((response != null) && (response.json != null)) {
          if (DEBUG) console.log("Data received, searching in document for path:" + jsonPath)
          var price = response.json
          for (var i = 0; i < jsonPath.length; i++) { // Parse JSON path
            if (typeof price[jsonPath[i]] == "undefined") {
              if (DEBUG) console.log("BitcoinPriceTicker error loading ticker " + id + ". URL is not correctly responding:" + url)
              return
            }
            price = price[jsonPath[i]]
          }
          if (DEBUG) console.log("Price received and parsed: " + price)
          tickersFrame.postMessage({
            "type": "updateTickerModelPrice",
            "id": id,
            "data": {
              "price": price
            }
          }, tickersFrame.url)
        }
      }
    }).get()
  }

  function startAutoPriceUpdate(tickerId) {
    if (tickers[tickerId].url && tickers[tickerId].jsonPath) {
      var fetchURLDataWrapper = function() {
        fetchURLData(tickerId, tickers[tickerId].url, tickers[tickerId].jsonPath)
      }
      fetchURLDataWrapper()
      tickers[tickerId].timer = setInterval(fetchURLDataWrapper, (tickers[tickerId].updateInterval * 1000))
    }
  }

  function stopAutoPriceUpdate(tickerId) {
    if (tickers[tickerId].timer) { // Remove previous auto-update call if any
      clearInterval(tickers[tickerId].timer) // Stop automatic refresh
      tickers[tickerId].timer = null
    }
  }

  function updateTickerRefreshIntervalForTicker(tickerId) {
    var refreshRate = getIntegerPreference("Timer")
    if (refreshRate < 1) {
      refreshRate = DEFAULT_REFRESH_RATE
    }
    if (tickers[tickerId] && tickers[tickerId].enabled) {
      if (DEBUG) console.log("updateTickerRefreshIntervalForTicker:" + tickerId)
      if (tickers[tickerId].updateInterval != refreshRate) { // Update the real interval
        tickers[tickerId].updateInterval = refreshRate
        stopAutoPriceUpdate(tickerId)
        startAutoPriceUpdate(tickerId)
      }
    }
  }

  // Create new refresh interval for each ticker when option is changed
  function updateTickerRefreshInterval() {
    for (var tickerId in tickers) { // Update all tickers that require it
      updateTickerRefreshIntervalForTicker(tickerId)
    }
  }

  function updateActiveTickersSharedStyle() {
    for (tickerId in tickers) {
      if (tickers[tickerId] && tickers[tickerId].enabled) {
        updateTickerConfiguration(tickerId) // Update configuration
      }
    }
  }

  function showAddonUpdateDocument() {
    tabs.open(ADDON_UPDATE_DOCUMENT_URL)
  }

  function showAddonUpdate(version) {
    try {
      if (( ! getBooleanPreference("show-updates")) || // Requested to not show updates
          (prefs.getCharPref("extensions.ADDON_ID.version") == version)) { // Not updated
        return
      }
    } catch (e) {} // There is no addon version set yet
    if (! DEBUG) setTimeout(showAddonUpdateDocument, 5000) // Showing update webpage
    prefs.setCharPref("extensions.ADDON_ID.version", version) // Update version number in preferences
  }

  function loadProvidersData() {
    var url = DATA_PROVIDERS_URL
    if (DEBUG) console.log("Requesting JSON data from " + DATA_PROVIDERS_URL)
    Request({
      url: url,
      onComplete: function (response) {
        if ((response != null) && (response.json != null)) {
          if (DEBUG) console.log("Data received from data providers JSON configuration")
          tickers = response.json
          if (Object.keys(tickers).length == 0) {
            if (DEBUG) console.log("Error: No ticker configuration found in JSON configuration received from server:"+url)
            return
          }
          initAfterLoad()
        }
      }
    }).get()
  }

  function initAfterLoad() {
    loadTickersInOrder()
    registerEvents()
    updateTickerRefreshInterval()
  }

  // Toggle between a separate toolbar or the naviagtion bar
  function toggleBarDisplay() {
    if (getBooleanPreference("bar")) {
      if (toolbar == null) {
        toolbar = ui.Toolbar({
          title: "Bitcoin Price Ticker",
          items: [tickersFrame]
        })
      }
    } else if (toolbar) {
      toolbar.destroy()
      toolbar = null
    }
  }

  var tickersFrame = ui.Frame({
    url: "./index.html"
  })

  tickersFrame.on("ready", loadProvidersData) // When the presenter is ready load config data and tickers

  var toolbar = null

  toggleBarDisplay()

/*
  Feature disabled until refactored

  var calculateSlopeAndTrend = function(last_price, price, trend) {
    var slope = (last_price>0) ? price/last_price - 1 : 0;
    var label_slope = "\u2194";
    var st = price;
    var bt = 0;
    if (slope>=0.001) {
      label_slope = (slope>=0.01) ? "\u219f" : "\u2191";
    }
    else if (slope<=-0.001) {
      label_slope = (slope<=-0.01) ? "\u21a1" : "\u2193";
    }
    // Double Exponential Smoothing
    // http://en.wikipedia.org/wiki/Exponential_smoothing
    // magic numbers, from experiments in spreadsheet:
    //   alpha = 0.05 and beta=0.1
    if (last_price != 0) {
      if (trend[0] == 0) {
        st = price;
        bt = price - last_price;
      }
      else {
        st = .05* price + .95 * (trend[0] + trend[1]);
        bt = .1 * (st - trend[0]) + .9 * trend[1];
      }
    }
    var label_trend = "\u21d4"; // ⇔
    var change = 10000*bt/st;
    if (change>=2.5) {
      label_trend = "\u21d1"; // ⇑
    }
    else if (change>=1.0) {
      label_trend = "\u21d7"; // ⇗
    }
    else if (change<=-2.5) { // ⇓
      label_trend = "\u21d3";
    }
    else if (change<=-1.0) { // ⇘
      label_trend = "\u21d8";
    }
    return {
        trend: [st, bt],
        label_trend: label_trend,
        label_slope: label_slope
    };
  }

    price = price[ticker.json_path[i]];
    var trends = calculateSlopeAndTrend(ticker.last, price, ticker.trend);
    ticker.trend = trends.trend;
    label_trend = trends.label_trend;
    label_slope = trends.label_slope;
    var round = calculateRoundFactor(price);
    var change = Math.round(1000000*ticker.trend[1]/ticker.trend[0])/100;
    var last_ticker_price = Math.round(ticker.last * round.factor) / round.factor;
    last_ticker_price = (round.size > 1) && (last_ticker_price > 0) ? last_ticker_price.toFixed(round.size) : last_ticker_price;
    ticker.tooltip = ticker.label + " -- previous: "
        + labelWithCurrency(last_ticker_price, currency)
        + " -- trend: " + ((change>0) ? "+" : "") + change;
    ticker.last = price;
    price = Math.round(price * round.factor) / round.factor;
    price = (round.size > 1) && (price > 0) ? price.toFixed(round.size) : price;
    latest_content = labelWithCurrency(price, currency);
    if (getBooleanPreference("show-short-trend")) {
      latest_content = label_slope + latest_content;
    }
    if (getBooleanPreference("show-long-trend")) {
      latest_content = label_trend + latest_content;
    }
  ticker.port.emit("updateContent", latest_content);
  updateTickerStyle();
  */

  function registerTickerEvents(tickerId) {
    Preferences.on("p" + tickerId, function() { // Create event to enable/disable of tickers
      toggleTicker(tickerId)
    })
    // Create events to update ticker when a particular option is changed
    Preferences.on("p" + tickerId + "Color", function() {
      if (tickers[tickerId] != null) {
        updateTickerConfiguration(tickerId)
      }
    })
  }

  function registerEvents() {
    for (tickerId in tickers) {
      registerTickerEvents(tickerId)
    }
  }

  // Register general settings events
  Preferences.on("bar", toggleBarDisplay)
  Preferences.on("Timer", updateTickerRefreshInterval)
  Preferences.on("defaultFontSize", updateActiveTickersSharedStyle)
  Preferences.on("gold-background", updateActiveTickersSharedStyle)
  Preferences.on("silver-background", updateActiveTickersSharedStyle)
  Preferences.on("other-background", updateActiveTickersSharedStyle)
  // Preferences.on("show-long-trend", updateAllTickers)
  // Preferences.on("show-short-trend", updateAllTickers)
  Preferences.on("show-currency-label", updateActiveTickersSharedStyle)

  Preferences.on("infoButton", showAddonUpdateDocument)
  // Check updated version
  AddonManager.getAddonByID(ADDON_ID, function(addon) {
    showAddonUpdate(addon.version)
  })
}