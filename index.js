const DEBUG = false

// The main module of the Add-on.
var ui = require('sdk/ui')
const {Cc, Ci, Cu} = require("chrome")
Cu.import("resource://gre/modules/AddonManager.jsm") // Addon Manager required to know addon version
const setTimeout = require("sdk/timers").setTimeout
const ADDON_ID = "jid0-ziK34XHkBWB9ezxd4l9Q1yC7RP0@jetpack"
const DEFAULT_REFRESH_RATE = 60
const DEFAULT_FONT_SIZE = 14

var Preferences = require('sdk/simple-prefs');
var prefs = Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefService).getBranch("extensions.ADDON_ID.");
var Request = require("sdk/request").Request;
var tabs = require("sdk/tabs");

var orderedTickers = new Array()
// Ids of all tickers available. Ticker configuration for each ID is in file data/js/providers.js
var tickers = { // Store all tickers here
  'BitStampUSD':null,
  'BTCeUSD':null,
  'KrakenUSD':null,
  'CoinDeskUSD':null,
  'CoinbaseUSD':null,
  'CampBXUSD':null,
  'BitPayUSD':null,
  'TheRockTradingUSD':null,
  'BitFinexUSD':null,
  'BTCeEUR':null,
  'KrakenEUR':null,
  'CoinDeskEUR':null,
  'BitPayEUR':null,
  'BitonicEUR':null,
  'TheRockTradingEUR':null,
  'CoinDeskGBP':null,
  'LocalbitcoinsGBP':null,
  'BittyliciousGBP':null,
  'BitPayGBP':null,
  'BitcurexPLN':null,
  'CaVirTexCAD':null,
  'BTCChinaCNY':null,
  'BTCeRUR':null,
  'MercadoBitcoinBRL':null,
  'BTCTurkTRY':null,
  'BitcoinVenezuelaVEF':null,
  'LocalbitcoinsVEF':null,
  'CoinbaseVEF':null,
  'BitcoinVenezuelaARS':null,
  'LocalbitcoinsARS':null,
  'CoinbaseARS':null,
  'BitexARS':null,
  'LocalbitcoinsCLP':null,
  'BitsoMXN':null,
  'BitXZAR':null,
  'CoinbaseZAR':null,
  'Bit2CILS':null,
  'BTCeLitecoin':null,
  'KrakenLitecoin':null,
  'VircurexLitecoin':null,
  'BTCeLitecoinUSD':null,
  'BTCeLitecoinEUR':null,
  'VircurexWorldcoin':null,
  'CryptsyDogecoin':null,
  'KrakenDogecoin':null,
  'BTCeNamecoinUSD':null,
  'CryptsyAuroracoin':null,
  'CryptsyBlackcoin':null,
  'CryptsyNxt':null,
  'PoloniexNxt':null,
  'PoloniexBitshares':null,
  'KrakenRipple':null,
  'PoloniexMaidsafe':null,
  'PoloniexBitcoindark':null,
  'PoloniexMonero':null,
  'CryptsyDashBTC':null,
  'CryptsyDashUSD':null,
  'BitFinexDashBTC':null,
  'BitFinexDashUSD':null,
  'PoloniexBurst':null
}

exports.main = function() {

  function getPreference(pref_name, type) {
    if (typeof Preferences.prefs[pref_name] == "undefined") {
      if (DEBUG) console.log("bitcoin-price-ticker addon error: " + pref_name + " preference is not defined")
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
    return Preferences.prefs[pref_name]
  }

  function getBooleanPreference(pref_name) {
    return getPreference(pref_name, "boolean")
  }

  function getIntegerPreference(pref_name) {
    return getPreference(pref_name, "integer")
  }

  function getStringPreference(pref_name) {
    return getPreference(pref_name, "string")
  }

  function getBackgroundColor(id) {
    var low_id = id.toLowerCase()
    var other_bg_cryptos = [ 'dogecoin', 'worldcoin', 'namecoin', 'auroracoin', 'blackcoin', 'nxt',
      'bitshares', 'ripple', 'maidsafe', 'bitcoindark', 'monero', 'dash', 'burst' ]
    for (var i in other_bg_cryptos) {
      if (low_id.indexOf(other_bg_cryptos[i]) != -1) {  // Alt-coin
        if (getBooleanPreference("other-background")) {
          return other_bg_cryptos[i]
        }
      }
    }
    if (low_id.indexOf("litecoin") != -1) {
      if (getBooleanPreference("silver-background")) { // Currency is Litecoin
        return "silver"
      }
    } else if (getBooleanPreference("gold-background")) { // Currency is Bitcoin
      return "gold"
    }
    return null
  }

  function getTickerConfigurationData(tickerId) {
    var fontSize = getIntegerPreference("defaultFontSize");
    if (fontSize <= 0) {
      fontSize = DEFAULT_FONT_SIZE
    }
    var refresh_rate = getIntegerPreference("Timer");
    if (refresh_rate < 1) {
      refresh_rate = DEFAULT_REFRESH_RATE;
    }
    var tickerData = {
      id: tickerId,
      enabled: getBooleanPreference("p" + tickerId),
      currencyPosition: getStringPreference("show-currency-label"),
      color: getStringPreference("p" + tickerId + "Color"),
      fontSize: fontSize,
      background: getBackgroundColor(tickerId),
      updateInterval: refresh_rate
    }
    return tickerData
  }

  function loadTicker(tickerId) {
    var tickerData = getTickerConfigurationData(tickerId)
    if (DEBUG) console.log(JSON.stringify(tickerData))
    tickers[tickerId] = tickerData
    updateTickerConfiguration(tickerData)
    return tickerData
  }

  // Use tickers enabled in preferences to load in that order regardless of stored order
  function loadDefaultTickers() {
    for (var tickerId in tickers) {
      if ( getBooleanPreference('p' + tickerId) ) { // Create Ticker
        var tickerData = loadTicker(tickerId)
        if (tickerData.enabled) orderedTickers.push(tickerId)
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
      var listOrderedTickers = orderedActiveTickers.split(',')
      if (listOrderedTickers.length < 1) { // There is no order of tickers in addon set yet
        loadDefaultTickers()
        return
      }
      for (var i in listOrderedTickers) {
        var tickerData = loadTicker(listOrderedTickers[i])
        if (tickerData.enabled) orderedTickers.push(tickerId)
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
      prefs.setCharPref("extensions.ADDON_ID.tickers_order", orderedActiveTickers) // Update list of tickers active in order in preferences
    }
  }

  // Live enable/disable ticker from options checkbox
  function toggleTicker(tickerId) {
    if ( getBooleanPreference('p' + tickerId) ) { // Enable Ticker
      if (tickers[tickerId] == null) {
        var tickerData = loadTicker(tickerId)
        if (tickerData.enabled) orderedTickers.push(tickerId)
        storeTickersOrder()
      }
    } else if ( (tickers[tickerId] != null) && (tickers[tickerId].enabled)) { // Disable Ticker if it exists
      tickers[tickerId].enabled = false
      updateTickerConfiguration(tickers[tickerId])
      for (var position in orderedTickers) {
        if (orderedTickers[position] == tickerId) {
          orderedTickers.splice(position, 1) // Remove the position completely from the array with reordering
          break
        }
      }
      tickers[tickerId] = null
      storeTickersOrder()
    }
  }

  function updateTickerConfiguration(tickerData) {
    tickers_frame.postMessage({
      "type": "updateTickerConfiguration",
      "data": tickerData
    }, tickers_frame.url);
  }

  function fetchURLData(e) {
    if (DEBUG) console.log("Request received from frame:" + JSON.stringify(e))
    if (e.data == "undefined" || e.data.id == "undefined" ||
        e.data.url == "undefined" || e.data.jsonPath == "undefined") {
      return
    }
    var id = e.data.id
    var url = e.data.url
    var jsonPath = JSON.parse(e.data.jsonPath)
    if (DEBUG) console.log("Requesting JSON data from " + url)
    Request({
      url: url,
      onComplete: function (response) {
        if ((response != null) && (response.json != null)) {
          if (DEBUG) console.log("Data received, searching in document for path:" + jsonPath) // DEBUG line TODO remove
          var price = response.json
          for (var i = 0; i < jsonPath.length; i++) { // Parse JSON path
            if (typeof price[jsonPath[i]] == "undefined") {
              if (DEBUG) console.log("BitcoinPriceTicker error loading ticker " + id + ". URL is not correctly responding:" + url)
              return
            }
            price = price[jsonPath[i]]
          }
          if (DEBUG) console.log("Price received and parsed: " + price) // DEBUG line TODO remove
          e.source.postMessage({
            "type": "updateTickerModelPrice",
            "data": {
              "id": id,
              "price": price
            }
          }, e.origin)
        }
      }
    }).get()
  }

  function updateActiveTickersSharedStyle() {
    for (tickerId in tickers) {
      if (tickers[tickerId]) {
        loadTicker(tickerId) // Update configuration
      }
    }
  }

  function showAddonUpdateDocument() {
    tabs.open("http://neoranga55.github.io/bitcoin-price-ticker/")
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

  var tickers_frame = ui.Frame({
    url: './index.html',
    onMessage: fetchURLData
  })

  var toolbar = ui.Toolbar({
    title: 'Bitcoin Price Ticker',
    items: [tickers_frame]
  })

  tickers_frame.on("ready", loadTickersInOrder)

/*
  Feature disabled until refactored

  var calculateSlopeAndTrend = function(last_price, price, trend) {
    var slope = (last_price>0) ? price/last_price - 1 : 0;
    var label_slope = '\u2194';
    var st = price;
    var bt = 0;
    if (slope>=0.001) {
      label_slope = (slope>=0.01) ? '\u219f' : '\u2191';
    }
    else if (slope<=-0.001) {
      label_slope = (slope<=-0.01) ? '\u21a1' : '\u2193';
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
    var label_trend = '\u21d4'; // ⇔
    var change = 10000*bt/st;
    if (change>=2.5) {
      label_trend = '\u21d1'; // ⇑
    }
    else if (change>=1.0) {
      label_trend = '\u21d7'; // ⇗
    }
    else if (change<=-2.5) { // ⇓
      label_trend = '\u21d3';
    }
    else if (change<=-1.0) { // ⇘
      label_trend = '\u21d8';
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

  // Register general settings events
  Preferences.on('defaultFontSize', updateActiveTickersSharedStyle);
  Preferences.on('Timer', updateActiveTickersSharedStyle);
  Preferences.on('gold-background', updateActiveTickersSharedStyle);
  Preferences.on('silver-background', updateActiveTickersSharedStyle);
  Preferences.on('other-background', updateActiveTickersSharedStyle);
  // Preferences.on('show-long-trend', updateAllTickers);
  // Preferences.on('show-short-trend', updateAllTickers);
  Preferences.on('show-currency-label', updateActiveTickersSharedStyle);

  function registerTickerEvents(tickerId) {
    Preferences.on('p' + tickerId, function() { // Create event to enable/disable of tickers
      toggleTicker(tickerId)
    })
    // Create events to update ticker when a particular option is changed
    Preferences.on('p' + tickerId + 'Color', function() {
      if (tickers[tickerId] != null) {
        tickers[tickerId].color = getStringPreference("p" + tickerId + "Color")
        updateTickerConfiguration(tickers[tickerId])
      }
    })
  }

  function registerEvents() {
    for (tickerId in tickers) {
      registerTickerEvents(tickerId)
    }
  }
  registerEvents()
  Preferences.on('infoButton', showAddonUpdateDocument)
  // Check updated version
  AddonManager.getAddonByID(ADDON_ID, function(addon) {
    showAddonUpdate(addon.version);
  })
};
