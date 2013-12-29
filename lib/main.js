// The main module of the neoranga Add-on.

const {Cc, Ci, Cu} = require("chrome");
Cu.import("resource://gre/modules/AddonManager.jsm"); // Addon Manager required to know addon version
var Widget = require("sdk/widget").Widget;
var Preferences = require('sdk/simple-prefs');
var Request = require("sdk/request").Request;
var self = require("sdk/self");
var data = self.data;
var tabs = require("sdk/tabs");
const setTimeout = require("sdk/timers").setTimeout;
const setInterval = require("sdk/timers").setInterval;
const clearInterval = require("sdk/timers").clearInterval;

const ADDON_ID = "jid0-ziK34XHkBWB9ezxd4l9Q1yC7RP0@jetpack";
const DEFAULT_REFRESH_RATE = 60;
const DEFAULT_FONT_SIZE = 14;
const DEFAULT_TICKER_SPACING = 2;

var tickers = new Array(); // Store all tickers here
// Initialize tickers container
tickers['MtGoxUSDTicker'] = null;
tickers['BitStampUSDTicker'] = null;
tickers['BTCeUSDTicker'] = null;
tickers['KrakenUSDTicker'] = null;
tickers['CoinDeskUSDTicker'] = null;
tickers['MtGoxEURTicker'] = null;
tickers['BTCeEURTicker'] = null;
tickers['KrakenEURTicker'] = null;
tickers['CoinDeskEURTicker'] = null;
tickers['CoinDeskGBPTicker'] = null;
tickers['MtGoxJPYTicker'] = null;
tickers['MtGoxCNYTicker'] = null;
tickers['BTCChinaCNYTicker'] = null;
tickers['BTCeLitecoinTicker'] = null;
tickers['KrakenLitecoinTicker'] = null;
tickers['VircurexLitecoinTicker'] = null;



exports.main = function() {

  var isLitecoin = function(currency) {
    if ((currency == 'L') || (currency == 'Ł')) {
      return true;
    } else {
      return false;
    }
  }

  var showAddonUpdateDocument = function() {
    tabs.open("http://neoranga55.github.io/bitcoin-price-ticker/");
  }
  var showAddonUpdate = function(version) {
    var prefs = Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefService).getBranch("extensions.ADDON_ID.");
    try {
      if (prefs.getCharPref("extensions.ADDON_ID.version") == version) { // Not updated
        return;
      }
    } catch (e) {} // There is no addon version set yet
    // Showing update webpage
    setTimeout(showAddonUpdateDocument, 5000);
    prefs.setCharPref("extensions.ADDON_ID.version", version); // Update version number in preferences
  };

  var getBooleanPreference = function(pref_name) {
    if (typeof Preferences.prefs[pref_name] == "undefined") {
      console.log("bitcoin-price-ticker addon error: " + pref_name + " preference is not defined");
      return false;
    }
    else {
      return Preferences.prefs[pref_name];
    }
  };

  var getIntegerPreference = function(pref_name) {
    if (typeof Preferences.prefs[pref_name] == "undefined") {
      console.log("bitcoin-price-ticker addon error: " + pref_name + " preference is not defined");
      return -1;
    }
    else {
      return Preferences.prefs[pref_name];
    }
  };

  var getStringPreference = function(pref_name) {
    if (typeof Preferences.prefs[pref_name] == "undefined") {
      console.log("bitcoin-price-ticker addon error: " + pref_name + " preference is not defined");
      return "";
    }
    else {
      return Preferences.prefs[pref_name];
    }
  };

  // Live enable/disable ticker from options checkbox
  var toggleTicker = function(tickerName, tickerCreator) {
    if ( getBooleanPreference('p' + tickerName) ) { // Enable Ticker
      if (tickers[tickerName + 'Ticker'] == null) { 
        tickers[tickerName + 'Ticker'] = tickerCreator();
      }
    } else if ( tickers[tickerName + 'Ticker'] != null ) { // Disable Ticker if it exists
      tickers[tickerName + 'Ticker'][0].destroy(); // Destroy unwanted ticker widget
      clearInterval(tickers[tickerName + 'Ticker'][3]); // Stop automatic refresh of removed ticker
      tickers[tickerName + 'Ticker'] = null;
    }
  };

  // Refresh ticker when changing add-on options
  var updateTickerCaller = function(tickerName, onlyStyle) {
    if ( (tickers[tickerName + 'Ticker'] != null) && (tickers[tickerName + 'Ticker'].length >= 2)) {
      if (onlyStyle) {
        tickers[tickerName + 'Ticker'][2](); // Call update Ticker method to update only the style
      } else {
        tickers[tickerName + 'Ticker'][1](); // Call update Ticker method
      }
    }
  };

  // Create new refresh interval for each ticker when option is changed
  var updateTickerRefreshInterval = function() {
    var refresh_rate = getIntegerPreference("Timer");
    if (refresh_rate < 1) {
      refresh_rate = DEFAULT_REFRESH_RATE;
    }
    for (var i in tickers) {
      if ( (tickers[i] != null) && (tickers[i].length >= 4)) {
        clearInterval(tickers[i][3]); // Stop automatic refresh of removed ticker
        tickers[i][3] = setInterval(tickers[i][1], (refresh_rate * 1000));
      }
    }
  }

  var updateStyleAllTickers = function() {
    for (var i in tickers) {
      if ( (tickers[i] != null) && (tickers[i].length >= 3)) {
        tickers[i][2](); // Call update Ticker style method
      }
    }
  };

  var registerEvents = function(tickerName, tickerCreator) {
    Preferences.on('p' + tickerName, function() { toggleTicker(tickerName, tickerCreator); }); // Create event to enable/disable of tickers
    // Create events to update ticker when a particular option is changed
    Preferences.on('p' + tickerName + 'Color', function() { updateTickerCaller(tickerName, true); });
  };

  var createTicker = function(id, label, currency, color, ticker_url, json_path) {
    var pref_name = "p" + id; // Construct preference name from ID

    if ( ! getBooleanPreference(pref_name)) {
      return null; // Tikcer is disabled
    }

    // Construct default ticker widget with preferences information
    var refresh_rate = getIntegerPreference("Timer");
    if (refresh_rate < 1) {
      refresh_rate = DEFAULT_REFRESH_RATE;
    }
    var font_size = getIntegerPreference("defaultFontSize");
    if (font_size <= 0) {
      font_size = DEFAULT_FONT_SIZE; // Default value
    }
    var color = getStringPreference("p" + id + "Color");
    var gold_background = getBooleanPreference("gold-background");
    var silver_background = getBooleanPreference("silver-background");
    var label_currency = currency;
    if ( isLitecoin(currency) ) { // Litecoin can't have the gold Bitcoin background
      gold_background = false;
      label_currency = "Litecoin";
    } else {
      silver_background = false; // Bitcoin can't have the silver Litecoin background
    }
    var latest_content = "---" + currency;

    // Default ticker widget //
    var ticker = new Widget({
      id: "Bitoin-Price-Ticker-" + id,
      label: label + " " + label_currency,
      contentURL: data.url("index.html"),
      contentScriptFile: [
        data.url("js/jquery-2.0.3.min.js"),
        data.url("js/utils.js")
      ],
      width: DEFAULT_TICKER_SPACING,
      onClick: function(event) {
        updateTicker();
      }
    });
    ticker.port.emit("updateStyle", color, font_size, gold_background, silver_background);
    ticker.port.emit("updateContent", latest_content);
    // Default ticker created //

    function updateTickerStyle() {
      if ( ! getBooleanPreference(pref_name)) {
        return null; // Tikcer is disabled
      }
      var color = getStringPreference("p" + id + "Color");
      var gold_background = getBooleanPreference("gold-background");
      var silver_background = getBooleanPreference("silver-background");
      if ( isLitecoin(currency) ) { // Litecoin can't have the gold Bitcoin background
        gold_background = false;
      } else {
        silver_background = false; // Bitcoin can't have the silver Litecoin background
      }
      var font_size = getIntegerPreference("defaultFontSize");
      if (font_size <= 0) {
        font_size = DEFAULT_FONT_SIZE; // Default value
      }
      var ticker_width = getIntegerPreference("defaultTickerSpacing");
      if (ticker_width <= 0) {
        ticker_width = DEFAULT_TICKER_SPACING;
      }
      var text_size = latest_content.toString().length;
      if (latest_content.toString().indexOf('.') != -1)
      {
        ticker_width += 1;
        text_size -= 1;
      }            
      ticker_width += (text_size * 8); // Aproximatelt 8 pixels per character (except dots)
      if (currency == "元") { // Yuan character needs extra pixels to be painted
        ticker_width += 10;
      }
      ticker.width = ticker_width;
      ticker.port.emit("updateStyle", color, font_size, gold_background, silver_background);
    };

    function updateTicker() {
      if ( ! getBooleanPreference(pref_name)) {
        return null; // Tikcer is disabled
      }
      Request({
        url: ticker_url,
        onComplete: function (response) {
          // Update ticker content
          latest_content = "???" + currency;
          if ((response != null) && (response.json != null)) {
            var price = response.json;
            for (var i = 0; i < json_path.length; i++) { // Parse JSON path
              price = price[json_path[i]];
            }
            var round_factor = 100;
            if ( isLitecoin(currency) ) { // Allow more decimals for Litecoin
              round_factor = 10000;
            }
            price = Math.round(price * round_factor) / round_factor;
            latest_content = price + currency;
          }
          ticker.port.emit("updateContent", latest_content);
          updateTickerStyle();
        }
      }).get();
    };

    updateTicker();
    intervalID = setInterval(updateTicker, (refresh_rate * 1000));
    return [ticker, updateTicker, updateTickerStyle, intervalID];
  };


  // Create and initialize all available tickers //

  // USD prices //
  var createMtGoxUSDTicker = function() { return createTicker('MtGoxUSD', 'MtGox', '$', '#B43104', "https://data.mtgox.com/api/2/BTCUSD/money/ticker", ['data','last','value']); };
  registerEvents('MtGoxUSD', createMtGoxUSDTicker);
  tickers['MtGoxUSDTicker'] = createMtGoxUSDTicker();
  
  var createBitStampUSDTicker = function() { return createTicker('BitStampUSD', 'BitStamp', '$', '#FF0000', "https://www.bitstamp.net/api/ticker/", ['last']); };
  registerEvents('BitStampUSD', createBitStampUSDTicker);
  tickers['BitStampUSDTicker'] = createBitStampUSDTicker();
  
  var createBTCeUSDTicker = function() { return createTicker('BTCeUSD', 'BTCe', '$', '#FE642E', "https://btc-e.com/api/2/btc_usd/ticker", ['ticker','last']); };
  registerEvents('BTCeUSD', createBTCeUSDTicker);
  tickers['BTCeUSDTicker'] = createBTCeUSDTicker();

  var createKrakenUSDTicker = function() { return createTicker('KrakenUSD', 'Kraken', '$', '#FF9966', "https://api.kraken.com/0/public/Ticker?pair=XBTUSD", ['result','XXBTZUSD','c',0]); };
  registerEvents('KrakenUSD', createKrakenUSDTicker);
  tickers['KrakenUSDTicker'] = createKrakenUSDTicker();

  var createCoinDeskUSDTicker = function() { return createTicker('CoinDeskUSD', 'CoinDesk', '$', '#DBA901', "http://api.coindesk.com/v1/bpi/currentprice.json", ['bpi','USD','rate_float']); };
  registerEvents('CoinDeskUSD', createCoinDeskUSDTicker);
  tickers['CoinDeskUSDTicker'] = createCoinDeskUSDTicker();

  // Euro prices //
  var createMtGoxEURTicker = function() { return createTicker('MtGoxEUR', 'MtGox', '€', '#807AE2', "https://data.mtgox.com/api/2/BTCEUR/money/ticker", ['data','last','value']); };
  registerEvents('MtGoxEUR', createMtGoxEURTicker);
  tickers['MtGoxEURTicker'] = createMtGoxEURTicker();

  var createBTCeEURTicker = function() { return createTicker('BTCeEUR', 'BTCe', '€', '#013ADF', "https://btc-e.com/api/2/btc_eur/ticker", ['ticker','last']); };
  registerEvents('BTCeEUR', createBTCeEURTicker);
  tickers['BTCeEURTicker'] = createBTCeEURTicker();

  var createKrakenEURTicker = function() { return createTicker('KrakenEUR', 'Kraken', '€', '#3366FF', "https://api.kraken.com/0/public/Ticker?pair=XBTEUR", ['result','XXBTZEUR','c',0]); };
  registerEvents('KrakenEUR', createKrakenEURTicker);
  tickers['KrakenEURTicker'] = createKrakenEURTicker();
  
  var createCoinDeskEURTicker = function() { return createTicker('CoinDeskEUR', 'CoinDesk', '€', '#000066', "http://api.coindesk.com/v1/bpi/currentprice.json", ['bpi','EUR','rate_float']); };
  registerEvents('CoinDeskEUR', createCoinDeskEURTicker);
  tickers['CoinDeskEURTicker'] = createCoinDeskEURTicker();
  
  // Pound prices //
  var createCoinDeskGBPTicker = function() { return createTicker('CoinDeskGBP', 'CoinDesk', '£', '#088A08', "http://api.coindesk.com/v1/bpi/currentprice.json", ['bpi','GBP','rate_float']); };
  registerEvents('CoinDeskGBP', createCoinDeskGBPTicker);
  tickers['CoinDeskGBPTicker'] = createCoinDeskGBPTicker();

  // Yen prices //
  var createMtGoxJPYTicker = function() { return createTicker('MtGoxJPY', 'MtGox', '¥', '#04B4AE', "https://data.mtgox.com/api/2/BTCJPY/money/ticker", ['data','last','value']); };
  registerEvents('MtGoxJPY', createMtGoxJPYTicker);
  tickers['MtGoxJPYTicker'] = createMtGoxJPYTicker();

  // Yuan prices //
  var createMtGoxCNYTicker = function() { return createTicker('MtGoxCNY', 'MtGox', '元', '#A901DB', "https://data.mtgox.com/api/2/BTCCNY/money/ticker", ['data','last','value']); };
  registerEvents('MtGoxCNY', createMtGoxCNYTicker);
  tickers['MtGoxCNYTicker'] = createMtGoxCNYTicker();

  var createBTCChinaCNYTicker = function() { return createTicker('BTCChinaCNY', 'BTCChina', '元', '#DF01D7', "https://vip.btcchina.com/bc/ticker", ['ticker','last']); };
  registerEvents('BTCChinaCNY', createBTCChinaCNYTicker);
  tickers['BTCChinaCNYTicker'] = createBTCChinaCNYTicker();

  // Litecoin prices //
  var createBTCeLitecoinTicker = function() { return createTicker('BTCeLitecoin', 'BTCe', 'Ł', '#013ADF', "https://btc-e.com/api/2/ltc_btc/ticker", ['ticker','last']); };
  registerEvents('BTCeLitecoin', createBTCeLitecoinTicker);
  tickers['BTCeLitecoinTicker'] = createBTCeLitecoinTicker();

  var createVircurexLitecoinTicker = function() { return createTicker('VircurexLitecoin', 'Vircurex', 'Ł', '#0B0B3B', "https://vircurex.com/api/get_last_trade.json?base=LTC&alt=BTC", ['value']); };
  registerEvents('VircurexLitecoin', createVircurexLitecoinTicker);
  tickers['VircurexLitecoinTicker'] = createVircurexLitecoinTicker();

  var createKrakenLitecoinTicker = function() { return createTicker('KrakenLitecoin', 'Kraken', 'Ł', '#000066', "https://api.kraken.com/0/public/Ticker?pair=XBTLTC", ['result','XXBTXLTC','c',0]); };
  registerEvents('KrakenLitecoin', createKrakenLitecoinTicker);
  tickers['KrakenLitecoinTicker'] = createKrakenLitecoinTicker();

  // Register general settings events
  Preferences.on('defaultFontSize', updateStyleAllTickers);
  Preferences.on('defaultTickerSpacing', updateStyleAllTickers);
  Preferences.on('infoButton', showAddonUpdateDocument);
  Preferences.on('Timer', updateTickerRefreshInterval);
  Preferences.on('gold-background', updateStyleAllTickers);
  Preferences.on('silver-background', updateStyleAllTickers);
  // Check updated version
  AddonManager.getAddonByID(ADDON_ID, function(addon) {
    showAddonUpdate(addon.version);
  });
};