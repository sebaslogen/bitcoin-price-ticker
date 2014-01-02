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
tickers['CoinbaseUSDTicker'] = null;
tickers['MtGoxEURTicker'] = null;
tickers['BTCeEURTicker'] = null;
tickers['KrakenEURTicker'] = null;
tickers['CoinDeskEURTicker'] = null;
tickers['CoinDeskGBPTicker'] = null;
tickers['MtGoxJPYTicker'] = null;
tickers['MtGoxCNYTicker'] = null;
tickers['BTCChinaCNYTicker'] = null;
tickers['MercadoBitcoinBRLTicker'] = null;
tickers['BTCTurkTRYTicker'] = null;
tickers['BitcoinVenezuelaVEFTicker'] = null;
tickers['CoinbaseVEFTicker'] = null;
tickers['BitcoinVenezuelaARSTicker'] = null;
tickers['CoinbaseARSTicker'] = null;
tickers['BTCeLitecoinTicker'] = null;
tickers['KrakenLitecoinTicker'] = null;
tickers['VircurexLitecoinTicker'] = null;
tickers['BTCeLitecoinUSDTicker'] = null;
tickers['BTCeLitecoinEURTicker'] = null;


exports.main = function() {

  var isLitecoin = function(text) {
    return (text.toLowerCase().indexOf("litecoin") != -1);
  };

  var labelWithCurrency = function(value, currency) {
    switch (getStringPreference("show-currency-label")) {
    case 'B':
      return currency + value;
    case 'A':
      return value + currency;
    default:
      return value;
    }
  };

  var showAddonUpdateDocument = function() {
    tabs.open("http://neoranga55.github.io/bitcoin-price-ticker/");
  };

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
      clearInterval(tickers[tickerName + 'Ticker'][3]); // Stop automatic refresh of removed ticker
      tickers[tickerName + 'Ticker'][0].destroy(); // Destroy unwanted ticker widget
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
  };

  var updateAllTickers = function() {
    for (var i in tickers) {
      if ( (tickers[i] != null) && (tickers[i].length >= 3)) {
        tickers[i][1](); // Call update Ticker style method
      }
    }
  };

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
  };

  var calculateRoundFactor = function(price) { // Allow more decimals for low price values
    var round_factor = 1;
    if (price == 0) {
      return round_factor;
    }
    while (round_factor * price < 1000) {
      round_factor *= 10;
    }
    return round_factor;
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
    var label_currency = currency+'/\u0243'; // Ƀ
    if ( isLitecoin(id) ) { // Litecoin can't have the gold Bitcoin background
      gold_background = false;
      if ( currency != '\u0141' ) { // Litecoin pair
        label_currency = currency + "/\u0141";
      } else { // Default pair for Litecoin
        label_currency = "\u0243/\u0141"; // Ƀ/Ł
      }
    } else {
      silver_background = false; // Bitcoin can't have the silver Litecoin background
    }
    var latest_content = labelWithCurrency("---", currency);

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
    ticker.last = 0;
    ticker.trend = [0,0];
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
      if ( isLitecoin(id) ) { // Litecoin can't have the gold Bitcoin background
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
        ticker_width += 4;
        text_size -= 1;
      }
      ticker_width += (text_size * font_size * 9 / 14); // Aproximately 8 pixels per character (except dots)
      if (currency == "\u5143") { // Yuan character needs extra pixels to be painted
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
          latest_content = labelWithCurrency("???", currency);
          if ((response != null) && (response.json != null)) {
            var price = response.json;
            for (var i = 0; i < json_path.length; i++) { // Parse JSON path
              price = price[json_path[i]];
            }
            var trends = calculateSlopeAndTrend(ticker.last, price, ticker.trend);
            ticker.trend = trends.trend;
            label_trend = trends.label_trend;
            label_slope = trends.label_slope;
            var round_factor = calculateRoundFactor(price);
            var change = Math.round(1000000*ticker.trend[1]/ticker.trend[0])/100;
            ticker.tooltip = ticker.label + " -- previous: "
                + labelWithCurrency(Math.round(ticker.last * round_factor) / round_factor, currency)
                + " -- trend: " + ((change>0) ? "+" : "") + change;
            ticker.last = price;
            price = Math.round(price * round_factor) / round_factor;
            latest_content = labelWithCurrency(price, currency);
            if (getBooleanPreference("show-short-trend")) {
              latest_content = label_slope + latest_content;
            }
            if (getBooleanPreference("show-long-trend")) {
              latest_content = label_trend + latest_content;
              // forecast in 5 intervals
              //var forecast = Math.round((ticker.trend[0] + 5*ticker.trend[1]) * round_factor) / round_factor;
              //ticker.tooltip += " -- forecast: " + forecast;
            }
          }
          ticker.port.emit("updateContent", latest_content);
          updateTickerStyle();
        }
      }).get();
    };

    updateTicker();
    var intervalID = setInterval(updateTicker, (refresh_rate * 1000));
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

  var createCoinbaseUSDTicker = function() { return createTicker('CoinbaseUSD', 'Coinbase', '$', '#000066', "https://coinbase.com/api/v1/currencies/exchange_rates", ['btc_to_usd']); };
  registerEvents('CoinbaseUSD', createCoinbaseUSDTicker);
  tickers['CoinbaseUSDTicker'] = createCoinbaseUSDTicker();

  // Euro prices //
  var createMtGoxEURTicker = function() { return createTicker('MtGoxEUR', 'MtGox', '\u20ac', '#807AE2', "https://data.mtgox.com/api/2/BTCEUR/money/ticker", ['data','last','value']); };
  registerEvents('MtGoxEUR', createMtGoxEURTicker);
  tickers['MtGoxEURTicker'] = createMtGoxEURTicker();

  var createBTCeEURTicker = function() { return createTicker('BTCeEUR', 'BTCe', '\u20ac', '#013ADF', "https://btc-e.com/api/2/btc_eur/ticker", ['ticker','last']); };
  registerEvents('BTCeEUR', createBTCeEURTicker);
  tickers['BTCeEURTicker'] = createBTCeEURTicker();

  var createKrakenEURTicker = function() { return createTicker('KrakenEUR', 'Kraken', '\u20ac', '#3366FF', "https://api.kraken.com/0/public/Ticker?pair=XBTEUR", ['result','XXBTZEUR','c',0]); };
  registerEvents('KrakenEUR', createKrakenEURTicker);
  tickers['KrakenEURTicker'] = createKrakenEURTicker();

  var createCoinDeskEURTicker = function() { return createTicker('CoinDeskEUR', 'CoinDesk', '\u20ac', '#000066', "http://api.coindesk.com/v1/bpi/currentprice.json", ['bpi','EUR','rate_float']); };
  registerEvents('CoinDeskEUR', createCoinDeskEURTicker);
  tickers['CoinDeskEURTicker'] = createCoinDeskEURTicker();

  // Pound prices //
  var createCoinDeskGBPTicker = function() { return createTicker('CoinDeskGBP', 'CoinDesk', '\u00a3', '#088A08', "http://api.coindesk.com/v1/bpi/currentprice.json", ['bpi','GBP','rate_float']); };
  registerEvents('CoinDeskGBP', createCoinDeskGBPTicker);
  tickers['CoinDeskGBPTicker'] = createCoinDeskGBPTicker();

  // Yen prices //
  var createMtGoxJPYTicker = function() { return createTicker('MtGoxJPY', 'MtGox', '\u00a5', '#04B4AE', "https://data.mtgox.com/api/2/BTCJPY/money/ticker", ['data','last','value']); };
  registerEvents('MtGoxJPY', createMtGoxJPYTicker);
  tickers['MtGoxJPYTicker'] = createMtGoxJPYTicker();

  // Yuan prices //
  var createMtGoxCNYTicker = function() { return createTicker('MtGoxCNY', 'MtGox', '\u5143', '#A901DB', "https://data.mtgox.com/api/2/BTCCNY/money/ticker", ['data','last','value']); };
  registerEvents('MtGoxCNY', createMtGoxCNYTicker);
  tickers['MtGoxCNYTicker'] = createMtGoxCNYTicker();

  var createBTCChinaCNYTicker = function() { return createTicker('BTCChinaCNY', 'BTCChina', '\u5143', '#DF01D7', "https://vip.btcchina.com/bc/ticker", ['ticker','last']); };
  registerEvents('BTCChinaCNY', createBTCChinaCNYTicker);
  tickers['BTCChinaCNYTicker'] = createBTCChinaCNYTicker();

  // Ruble prices //
  var createBTCeRURTicker = function() { return createTicker('BTCeRUR', 'BTCe', 'RUR', '#4F3107', "https://btc-e.com/api/2/btc_rur/ticker", ['ticker','last']); };
  registerEvents('BTCeRUR', createBTCeRURTicker);
  tickers['BTCeRURTicker'] = createBTCeRURTicker();

  // Brazilian Real prices //
  var createMercadoBitcoinBRLTicker = function() { return createTicker('MercadoBitcoinBRL', 'MercadoBitcoin', 'R$', '#2F4F15', "https://www.mercadobitcoin.com.br/api/ticker/", ['ticker','last']); };
  registerEvents('MercadoBitcoinBRL', createMercadoBitcoinBRLTicker);
  tickers['MercadoBitcoinBRLTicker'] = createMercadoBitcoinBRLTicker();

  // Turkish Lira //
  var createBTCTurkTRYTicker = function() { return createTicker('BTCTurkTRY', 'BTCTurk', '\u20ba', '#5B5B2F', "https://www.btcturk.com/api/ticker", ['last']); };
  registerEvents('BTCTurkTRY', createBTCTurkTRYTicker);
  tickers['BTCTurkTRYTicker'] = createBTCTurkTRYTicker();

  // Venezuelan Bolivar //
  var createBitcoinVenezuelaVEFTicker = function() { return createTicker('BitcoinVenezuelaVEF', 'BitcoinVenezuela', 'Bs', '#672F7F', "http://bitcoinvenezuela.com/api/btcven.json", ['BTC','VEF']); };
  registerEvents('BitcoinVenezuelaVEF', createBitcoinVenezuelaVEFTicker);
  tickers['BitcoinVenezuelaVEFTicker'] = createBitcoinVenezuelaVEFTicker();

  var createCoinbaseVEFTicker = function() { return createTicker('CoinbaseVEF', 'Coinbase', 'Bs', '#4C285B', "https://coinbase.com/api/v1/currencies/exchange_rates", ['btc_to_vef']); };
  registerEvents('CoinbaseVEF', createCoinbaseVEFTicker);
  tickers['CoinbaseVEFTicker'] = createCoinbaseVEFTicker();

  // Argentinian Peso //
  var createBitcoinVenezuelaARSTicker = function() { return createTicker('BitcoinVenezuelaARS', 'BitcoinVenezuela', 'ARS$', '#6E307C', "http://bitcoinvenezuela.com/api/btcven.json", ['BTC','ARS']); };
  registerEvents('BitcoinVenezuelaARS', createBitcoinVenezuelaARSTicker);
  tickers['BitcoinVenezuelaARSTicker'] = createBitcoinVenezuelaARSTicker();

  var createCoinbaseARSTicker = function() { return createTicker('CoinbaseARS', 'Coinbase', 'ARS$', '#4A1F54', "https://coinbase.com/api/v1/currencies/exchange_rates", ['btc_to_ars']); };
  registerEvents('CoinbaseARS', createCoinbaseARSTicker);
  tickers['CoinbaseARSTicker'] = createCoinbaseARSTicker();

  // Litecoin prices //
  var createBTCeLitecoinTicker = function() { return createTicker('BTCeLitecoin', 'BTCe', '\u0141', '#013ADF', "https://btc-e.com/api/2/ltc_btc/ticker", ['ticker','last']); };
  registerEvents('BTCeLitecoin', createBTCeLitecoinTicker);
  tickers['BTCeLitecoinTicker'] = createBTCeLitecoinTicker();

  var createVircurexLitecoinTicker = function() { return createTicker('VircurexLitecoin', 'Vircurex', '\u0141', '#0B0B3B', "https://vircurex.com/api/get_last_trade.json?base=LTC&alt=BTC", ['value']); };
  registerEvents('VircurexLitecoin', createVircurexLitecoinTicker);
  tickers['VircurexLitecoinTicker'] = createVircurexLitecoinTicker();

  var createKrakenLitecoinTicker = function() { return createTicker('KrakenLitecoin', 'Kraken', '\u0141', '#000066', "https://api.kraken.com/0/public/Ticker?pair=XBTLTC", ['result','XXBTXLTC','c',0]); };
  registerEvents('KrakenLitecoin', createKrakenLitecoinTicker);
  tickers['KrakenLitecoinTicker'] = createKrakenLitecoinTicker();

  // Litecoin USD prices //
  var createBTCeLitecoinUSDTicker = function() { return createTicker('BTCeLitecoinUSD', 'BTCe', '$', '#413ADF', "https://btc-e.com/api/2/ltc_usd/ticker", ['ticker','last']); };
  registerEvents('BTCeLitecoinUSD', createBTCeLitecoinUSDTicker);
  tickers['BTCeLitecoinUSDTicker'] = createBTCeLitecoinUSDTicker();

  // Litecoin EUR prices //
  var createBTCeLitecoinEURTicker = function() { return createTicker('BTCeLitecoinEUR', 'BTCe', '\u20ac', '#413ADF', "https://btc-e.com/api/2/ltc_eur/ticker", ['ticker','last']); };
  registerEvents('BTCeLitecoinEUR', createBTCeLitecoinEURTicker);
  tickers['BTCeLitecoinEURTicker'] = createBTCeLitecoinEURTicker();

  // Register general settings events
  Preferences.on('defaultFontSize', updateStyleAllTickers);
  Preferences.on('defaultTickerSpacing', updateStyleAllTickers);
  Preferences.on('infoButton', showAddonUpdateDocument);
  Preferences.on('Timer', updateTickerRefreshInterval);
  Preferences.on('gold-background', updateStyleAllTickers);
  Preferences.on('silver-background', updateStyleAllTickers);
  Preferences.on('show-long-trend', updateAllTickers);
  Preferences.on('show-short-trend', updateAllTickers);
  Preferences.on('show-currency-label', updateAllTickers);
  // Check updated version
  AddonManager.getAddonByID(ADDON_ID, function(addon) {
    showAddonUpdate(addon.version);
  });
};