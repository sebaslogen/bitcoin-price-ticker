// The main module of the neoranga Add-on.

const {Cc, Ci, Cu} = require("chrome");
Cu.import("resource://gre/modules/AddonManager.jsm"); // Addon Manager required to know addon version
const setTimeout = require("sdk/timers").setTimeout;
const setInterval = require("sdk/timers").setInterval;
const clearInterval = require("sdk/timers").clearInterval;
const ADDON_ID = "jid0-ziK34XHkBWB9ezxd4l9Q1yC7RP0@jetpack";
const DEFAULT_REFRESH_RATE = 60;
const DEFAULT_FONT_SIZE = 14;
const DEFAULT_TICKER_SPACING = 2;
var Widget = require("sdk/widget").Widget;
var Preferences = require('sdk/simple-prefs');
var prefs = Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefService).getBranch("extensions.ADDON_ID.");
var Request = require("sdk/request").Request;
var self = require("sdk/self");
var data = self.data;
var tabs = require("sdk/tabs");

var tickers = new Array(); // Store all tickers here
// Initialize tickers container
tickers['BitStampUSD'] = null;
tickers['BTCeUSD'] = null;
tickers['KrakenUSD'] = null;
tickers['CoinDeskUSD'] = null;
tickers['CoinbaseUSD'] = null;
tickers['CampBXUSD'] = null;
tickers['BitPayUSD'] = null;
tickers['TheRockTradingUSD'] = null;
tickers['BitFinexUSD'] = null;
tickers['BTCeEUR'] = null;
tickers['KrakenEUR'] = null;
tickers['CoinDeskEUR'] = null;
tickers['BitPayEUR'] = null;
tickers['BitonicEUR'] = null;
tickers['Bitcoin-CentralEUR'] = null;
tickers['TheRockTradingEUR'] = null;
tickers['CoinDeskGBP'] = null;
tickers['LocalbitcoinsGBP'] = null;
tickers['BittyliciousGBP'] = null;
tickers['BitPayGBP'] = null;
tickers['BitcurexPLN'] = null;
tickers['CaVirTexCAD'] = null;
tickers['BTCChinaCNY'] = null;
tickers['MercadoBitcoinBRL'] = null;
tickers['BTCTurkTRY'] = null;
tickers['BitcoinVenezuelaVEF'] = null;
tickers['LocalbitcoinsVEF'] = null;
tickers['CoinbaseVEF'] = null;
tickers['BitcoinVenezuelaARS'] = null;
tickers['LocalbitcoinsARS'] = null;
tickers['CoinbaseARS'] = null;
tickers['BitexARS'] = null;
tickers['LocalbitcoinsCLP'] = null;
tickers['BitsoMXN'] = null;
tickers['BitXZAR'] = null;
tickers['CoinbaseZAR'] = null;
tickers['Bit2CILS'] = null;
tickers['BTCeLitecoin'] = null;
tickers['KrakenLitecoin'] = null;
tickers['VircurexLitecoin'] = null;
tickers['BTCeLitecoinUSD'] = null;
tickers['BTCeLitecoinEUR'] = null;
tickers['VircurexWorldcoin'] = null;
tickers['CryptsyDogecoin'] = null;
tickers['KrakenDogecoin'] = null;
tickers['BTCeNamecoinUSD'] = null;
tickers['CryptsyAuroracoin'] = null;
tickers['CryptsyBlackcoin'] = null;
tickers['CryptsyNxt'] = null;
tickers['PoloniexNxt'] = null;
tickers['PoloniexBitshares'] = null;
tickers['KrakenRipple'] = null;
tickers['PoloniexMaidsafe'] = null;
tickers['PoloniexBitcoindark'] = null;
tickers['PoloniexMonero'] = null;
const MAX_TICKERS = Object.keys(tickers).length;
const DEBUG = false
var ticker_creators = new Array(); // Store all tickers creators here
var ordered_tickers = new Array();
var last_ticker_position = 0;

const CRYPTOCURRENCIES_BG_COLOR = {
  "bitcoin": 'gold_background', 
  "litecoin": 'silver_background',
  "dogecoin": 'doge_gold_background',
  "worldcoin": 'blue_background',
  "namecoin": 'name_background',
  "auroracoin": 'aurora_background',
  "blackcoin": 'black_background',
  "nxt": 'nxt_background',
  "bitshares": 'bts_background',
  "ripple": 'xrp_background',
  "maidsafe": 'maidsafe_background',
  "bitcoindark": 'bitcoindark_background',
  "monero": 'monero_background'
};

exports.main = function() {

  var getBackgroundColor = function(id) {
    var low_id = id.toLowerCase();
    var other_bg_cryptos = [ 'dogecoin', 'worldcoin', 'namecoin', 'auroracoin', 'blackcoin', 'nxt',
      'bitshares', 'ripple', 'maidsafe', 'bitcoindark', 'monero' ];
    for (var i in other_bg_cryptos) {
      if (low_id.indexOf(other_bg_cryptos[i]) != -1) {  // Alt-coin
        if (getBooleanPreference("other-background")) {
          return CRYPTOCURRENCIES_BG_COLOR[other_bg_cryptos[i]];
        }
      }
    }
    if (low_id.indexOf("litecoin") != -1) {
      if (getBooleanPreference("silver-background")) { // Currency is Litecoin
        return CRYPTOCURRENCIES_BG_COLOR.litecoin;
      }
    } else {
      if (getBooleanPreference("gold-background")) { // Currency is Bitcoin
        return CRYPTOCURRENCIES_BG_COLOR.bitcoin;
      }
    }
    return null;
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
    try {
      if ( ! getBooleanPreference("show-updates")) {
        return;
      } else if (prefs.getCharPref("extensions.ADDON_ID.version") == version) { // Not updated
        return;
      }
    } catch (e) {} // There is no addon version set yet
    setTimeout(showAddonUpdateDocument, 5000); // Showing update webpage
    prefs.setCharPref("extensions.ADDON_ID.version", version); // Update version number in preferences
  };

  var getBooleanPreference = function(pref_name) {
    if (typeof Preferences.prefs[pref_name] == "undefined") {
       if (DEBUG) console.log("bitcoin-price-ticker addon error: " + pref_name + " preference is not defined");
      return false;
    }
    else {
      return Preferences.prefs[pref_name];
    }
  };

  var getIntegerPreference = function(pref_name) {
    if (typeof Preferences.prefs[pref_name] == "undefined") {
      if (DEBUG) console.log("bitcoin-price-ticker addon error: " + pref_name + " preference is not defined");
      return -1;
    }
    else {
      return Preferences.prefs[pref_name];
    }
  };

  var getStringPreference = function(pref_name) {
    if (typeof Preferences.prefs[pref_name] == "undefined") {
      if (DEBUG) console.log("bitcoin-price-ticker addon error: " + pref_name + " preference is not defined");
      return "";
    }
    else {
      return Preferences.prefs[pref_name];
    }
  };

  // Use tickers enabled in preferences to load in that order regardless of stored order
  var loadDefaultTickers = function() {
    for (var ticker_name in tickers) {
      if ( getBooleanPreference('p' + ticker_name) ) {
        tickers[ticker_name] = ticker_creators[ticker_name](); // Create Ticker
      }
    }
    if ((ordered_tickers != null) && (ordered_tickers.length > 0)) {
      storeTickersOrder();
    }
  };

  // Load the order of the tickers and simultaneously create them
  var loadTickersInOrder = function() {
    var ordered_active_tickers = "";
    try {
      ordered_active_tickers = prefs.getCharPref("extensions.ADDON_ID.tickers_order");
      if (ordered_active_tickers.length < 1) { // There is no addon tickers_order set yet
        loadDefaultTickers();
        return;
      }
      var list_ordered_tickers = ordered_active_tickers.split(',');
      if (list_ordered_tickers.length < 1) { // There is no addon tickers_order set yet
        loadDefaultTickers();
        return;
      }
      for (var i in list_ordered_tickers) {
        var ticker_name = list_ordered_tickers[i];
        tickers[ticker_name] = ticker_creators[ticker_name](); // Create Ticker
      }
    } catch (e) { // There is no addon tickers_order set yet
      loadDefaultTickers();
    }
  };

  // Store the order of the active tickers
  var storeTickersOrder = function() {
    if ((ordered_tickers == null) || (ordered_tickers.length == 0)) {
      loadDefaultTickers();
    } else {
      var ordered_active_tickers = "";
      if ((ordered_tickers != null) && (ordered_tickers.length > 0)) {
        for (var i in ordered_tickers) { // Traverse skipping empty
          if (ordered_active_tickers.length > 0) {
            ordered_active_tickers += "," + ordered_tickers[i];
          } else {
            ordered_active_tickers = ordered_tickers[i];
          }
        }
      }
      prefs.setCharPref("extensions.ADDON_ID.tickers_order", ordered_active_tickers); // Update list of tickers active in order in preferences
    }
  };

  // Live enable/disable ticker from options checkbox
  var toggleTicker = function(tickerName) {
    if ( getBooleanPreference('p' + tickerName) ) { // Enable Ticker
      if (tickers[tickerName] == null) {
        tickers[tickerName] = ticker_creators[tickerName]();
        storeTickersOrder();
      }
    } else if ( tickers[tickerName] != null ) { // Disable Ticker if it exists
      clearInterval(tickers[tickerName][3]); // Stop automatic refresh of removed ticker
      for (var position in ordered_tickers) {
        if (ordered_tickers[position] == tickerName) {
          ordered_tickers.splice(position, 1); // Remove the position completely from the array with reordering
          break;
        }
      }
      tickers[tickerName][0].destroy(); // Destroy unwanted ticker widget
      tickers[tickerName] = null;
      storeTickersOrder();
    }
  };

  // Refresh ticker when changing add-on options
  var updateTickerCaller = function(tickerName, onlyStyle) {
    if ( (tickers[tickerName] != null) && (tickers[tickerName].length >= 2)) {
      if (onlyStyle) {
        tickers[tickerName][2](); // Call update Ticker method to update only the style
      } else {
        tickers[tickerName][1](); // Call update Ticker method
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

  var registerEvents = function(tickerName) {
    Preferences.on('p' + tickerName, function() { toggleTicker(tickerName); }); // Create event to enable/disable of tickers
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
    var size_round_factor = 0;
    if (price == 0) {
      return round_factor;
    }
    while (round_factor * price <= 100) {
      round_factor *= 10;
      if ((round_factor * price) % 10 != 0) // Amount of decimals without zeros to the right
        size_round_factor++;
    }
    return {factor: round_factor, size: size_round_factor};
  };

  var createTicker = function(id, label, currency, base_currency, color, ticker_url, json_path) {
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
    var label_currency = currency + '/' + base_currency;
    var latest_content = labelWithCurrency("---", currency);

    // Default ticker widget //
    /*  Important: Widgets are ordered in the status bar based on creation sequence
        and the id of the Widget when it was created for the first time
        (even if Widget is destroyed, the order of id persists) */
    var ticker = new Widget({
      id: "Bitoin-Price-Ticker_" + last_ticker_position,
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
    ticker.port.on("increaseWidth", function(value) {
      ticker.width = value;
      if (typeof ticker.default_width === 'undefined') {
        ticker.default_width = value;
      } else {
        ticker.default_width += value;
      }
      updateTickerStyle();
    });
    ordered_tickers.push(id);
    last_ticker_position = (Number.MAX_VALUE == last_ticker_position)? 0 : last_ticker_position + 1 ;
    ticker.last = 0;
    ticker.trend = [0,0];
    ticker.json_path = json_path;
    ticker.port.emit("updateStyle", color, font_size, getBackgroundColor(id));
    ticker.port.emit("updateContent", latest_content);
    // Default ticker created //

    function updateTickerStyle() {
      if ( ! getBooleanPreference(pref_name)) {
        return null; // Tikcer is disabled
      }
      var color = getStringPreference("p" + id + "Color");
      var font_size = getIntegerPreference("defaultFontSize");
      if (font_size <= 0) {
        font_size = DEFAULT_FONT_SIZE; // Default value
      }
      var ticker_width = getIntegerPreference("defaultTickerSpacing");
      if (ticker_width <= 0) {
        ticker_width = DEFAULT_TICKER_SPACING;
      }
      var text_size = latest_content.toString().length;
      ticker_width += (text_size * font_size * 9 / 14); // Aproximately 8 pixels per character (except dots)
      if (currency == "\u5143") { // Yuan character needs extra pixels to be painted
        ticker_width += 10;
      } else if (currency.length > 2) { // Calculate currency name size and extend text width accordingly
        ticker_width += ((currency.length - 3) * font_size * 9 / 14);
      }
      if (typeof ticker.default_width !== 'undefined') { // Enlarge width with calculated extra width required to show it
        ticker.width = ticker_width + ticker.default_width;
      } else {
        ticker.width = ticker_width;
      }
      ticker.port.emit("updateStyle", color, font_size, getBackgroundColor(id));
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
            for (var i = 0; i < ticker.json_path.length; i++) { // Parse JSON path
              if (typeof price[ticker.json_path[i]] == "undefined") {
                if (DEBUG) console.log("BitcoinPriceTicker error loading ticker " + id + ", URL not responding:" + ticker_url);
                return;
              }
              price = price[ticker.json_path[i]];
            }
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


  // Initialize all available tickers //

  // USD prices //
  ticker_creators['BitStampUSD'] = function() { return createTicker('BitStampUSD', 'BitStamp', '$', '\u0243', '#FF0000', "https://www.bitstamp.net/api/ticker/", ['last']); };
  registerEvents('BitStampUSD');

  ticker_creators['BTCeUSD'] = function() { return createTicker('BTCeUSD', 'BTCe', '$', '\u0243', '#FE642E', "https://btc-e.com/api/2/btc_usd/ticker", ['ticker','last']); };
  registerEvents('BTCeUSD');

  ticker_creators['KrakenUSD'] = function() { return createTicker('KrakenUSD', 'Kraken', '$', '\u0243', '#FF9966', "https://api.kraken.com/0/public/Ticker?pair=XBTUSD", ['result','XXBTZUSD','c',0]); };
  registerEvents('KrakenUSD');

  ticker_creators['CoinDeskUSD'] = function() { return createTicker('CoinDeskUSD', 'CoinDesk', '$', '\u0243', '#DBA901', "http://api.coindesk.com/v1/bpi/currentprice.json", ['bpi','USD','rate_float']); };
  registerEvents('CoinDeskUSD');

  ticker_creators['CoinbaseUSD'] = function() { return createTicker('CoinbaseUSD', 'Coinbase', '$', '\u0243', '#000066', "https://coinbase.com/api/v1/currencies/exchange_rates", ['btc_to_usd']); };
  registerEvents('CoinbaseUSD');

  ticker_creators['CampBXUSD'] = function() { return createTicker('CampBXUSD', 'CampBX', '$', '\u0243', '#000066', "http://campbx.com/api/xticker.php", ['Last Trade']); };
  registerEvents('CampBXUSD');

  registerEvents('BitPayUSD');
  ticker_creators['BitPayUSD'] = function() { return createTicker('BitPayUSD', 'BitPay', '$', '\u0243', '#FF0000', "https://bitpay.com/api/rates", [1,'rate']); };

  ticker_creators['TheRockTradingUSD'] = function() { return createTicker('TheRockTradingUSD', 'TheRockTrading', '$', '\u0243', '#6E307C', "https://www.therocktrading.com/api/ticker/BTCUSD", ['result',0,'last']); };
  registerEvents('TheRockTradingUSD');

  ticker_creators['BitFinexUSD'] = function() { return createTicker('BitFinexUSD', 'BitFinex', '$', '\u0243', '#FF2200', "https://api.bitfinex.com/v1/ticker/btcusd", ['last_price']); };
  registerEvents('BitFinexUSD');

  // Euro prices //
  ticker_creators['BTCeEUR'] = function() { return createTicker('BTCeEUR', 'BTCe', '\u20ac', '\u0243', '#013ADF', "https://btc-e.com/api/2/btc_eur/ticker", ['ticker','last']); };
  registerEvents('BTCeEUR');

  ticker_creators['KrakenEUR'] = function() { return createTicker('KrakenEUR', 'Kraken', '\u20ac', '\u0243', '#3366FF', "https://api.kraken.com/0/public/Ticker?pair=XBTEUR", ['result','XXBTZEUR','c',0]); };
  registerEvents('KrakenEUR');

  ticker_creators['CoinDeskEUR'] = function() { return createTicker('CoinDeskEUR', 'CoinDesk', '\u20ac', '\u0243', '#000066', "http://api.coindesk.com/v1/bpi/currentprice.json", ['bpi','EUR','rate_float']); };
  registerEvents('CoinDeskEUR');

  ticker_creators['BitPayEUR'] = function() { return createTicker('BitPayEUR', 'BitPay', '\u20ac', '\u0243', '#B43104', "https://bitpay.com/api/rates", [2,'rate']); };
  registerEvents('BitPayEUR');

  ticker_creators['BitonicEUR'] = function() { return createTicker('BitonicEUR', 'Bitonic', '\u20ac', '\u0243', '#B43104', "https://bitonic.nl/api/price", ['price']); };
  registerEvents('BitonicEUR');

  ticker_creators['Bitcoin-CentralEUR'] = function() { return createTicker('Bitcoin-CentralEUR', 'Bitcoin-Central', '\u20ac', '\u0243', '#B43104', "https://bitcoin-central.net/api/v1/data/eur/ticker", ['price']); };
  registerEvents('Bitcoin-CentralEUR');

  ticker_creators['TheRockTradingEUR'] = function() { return createTicker('TheRockTradingEUR', 'TheRockTrading', '\u20ac', '\u0243', '#B43104', "https://www.therocktrading.com/api/ticker/BTCEUR", ['result',0,'last']); };
  registerEvents('TheRockTradingEUR');

  // Pound prices //
  ticker_creators['CoinDeskGBP'] = function() { return createTicker('CoinDeskGBP', 'CoinDesk', '\u00a3', '\u0243', '#088A08', "http://api.coindesk.com/v1/bpi/currentprice.json", ['bpi','GBP','rate_float']); };
  registerEvents('CoinDeskGBP');

  ticker_creators['LocalbitcoinsGBP'] = function() { return createTicker('LocalbitcoinsGBP', 'Localbitcoins', '\u00a3', '\u0243', '#088A08', "https://localbitcoins.com/bitcoinaverage/ticker-all-currencies/", ['GBP','rates','last']); };
  registerEvents('LocalbitcoinsGBP');

  ticker_creators['BittyliciousGBP'] = function() { return createTicker('BittyliciousGBP', 'Bittylicious', '\u00a3', '\u0243', '#088A08', "https://bittylicious.com/api/v1/quote/BTC/GB/GBP/BANK/1", ['totalPrice']); };
  registerEvents('BittyliciousGBP');

  ticker_creators['BitPayGBP'] = function() { return createTicker('BitPayGBP', 'BitPay', '\u00a3', '\u0243', '#FF0000', "https://bitpay.com/api/rates", [3,'rate']); };
  registerEvents('BitPayGBP');

  // Polish zloty //
  ticker_creators['BitcurexPLN'] = function() { return createTicker('BitcurexPLN', 'Bitcurex', 'z\u0141', '\u0243', '#B43104', "https://bitcurex.com/api/pln/ticker.json", ['last_tx_price']); };
  registerEvents('BitcurexPLN');
  
  // Canadian dollar prices //
  ticker_creators['CaVirTexCAD'] = function() { return createTicker('CaVirTexCAD', 'CaVirTex', 'C$', '\u0243', '#B43104', "https://www.cavirtex.com/api/CAD/ticker.json", ['last']); };
  registerEvents('CaVirTexCAD');

  // Yuan prices //
  ticker_creators['BTCChinaCNY'] = function() { return createTicker('BTCChinaCNY', 'BTCChina', '\u5143', '\u0243', '#DF01D7', "https://data.btcchina.com/data/ticker", ['ticker','last']); };
  registerEvents('BTCChinaCNY');

  // Ruble prices //
  ticker_creators['BTCeRUR'] = function() { return createTicker('BTCeRUR', 'BTCe', 'RUR', '\u0243', '#4F3107', "https://btc-e.com/api/2/btc_rur/ticker", ['ticker','last']); };
  registerEvents('BTCeRUR');

  // Brazilian Real prices //
  ticker_creators['MercadoBitcoinBRL'] = function() { return createTicker('MercadoBitcoinBRL', 'MercadoBitcoin', 'R$', '\u0243', '#2F4F15', "https://www.mercadobitcoin.com.br/api/ticker/", ['ticker','last']); };
  registerEvents('MercadoBitcoinBRL');

  // Turkish Lira //
  ticker_creators['BTCTurkTRY'] = function() { return createTicker('BTCTurkTRY', 'BTCTurk', '\u20ba', '\u0243', '#5B5B2F', "https://www.btcturk.com/api/ticker", ['last']); };
  registerEvents('BTCTurkTRY');

  // Venezuelan Bolivar //
  ticker_creators['BitcoinVenezuelaVEF'] = function() { return createTicker('BitcoinVenezuelaVEF', 'BitcoinVenezuela', 'Bs', '\u0243', '#672F7F', "http://bitcoinvenezuela.com/api/btcven.json", ['BTC','VEF']); };
  registerEvents('BitcoinVenezuelaVEF');

  ticker_creators['LocalbitcoinsVEF'] = function() { return createTicker('LocalbitcoinsVEF', 'Localbitcoins', 'Bs', '\u0243', '#088A08', "https://localbitcoins.com/bitcoinaverage/ticker-all-currencies/", ['VEF','rates','last']); };
  registerEvents('LocalbitcoinsVEF');

  ticker_creators['CoinbaseVEF'] = function() { return createTicker('CoinbaseVEF', 'Coinbase', 'Bs', '\u0243', '#4C285B', "https://coinbase.com/api/v1/currencies/exchange_rates", ['btc_to_vef']); };
  registerEvents('CoinbaseVEF');

  // Argentinian Peso //
  ticker_creators['BitcoinVenezuelaARS'] = function() { return createTicker('BitcoinVenezuelaARS', 'BitcoinVenezuela', 'ARS$', '\u0243', '#783489', "http://bitcoinvenezuela.com/api/btcven.json", ['BTC','ARS']); };
  registerEvents('BitcoinVenezuelaARS');

  ticker_creators['LocalbitcoinsARS'] = function() { return createTicker('LocalbitcoinsARS', 'Localbitcoins', 'ARS$', '\u0243', '#088A08', "https://localbitcoins.com/bitcoinaverage/ticker-all-currencies/", ['ARS','rates','last']); };
  registerEvents('LocalbitcoinsARS');

  ticker_creators['CoinbaseARS'] = function() { return createTicker('CoinbaseARS', 'Coinbase', 'ARS$', '\u0243', '#582266', "https://coinbase.com/api/v1/currencies/exchange_rates", ['btc_to_ars']); };
  registerEvents('CoinbaseARS');

  ticker_creators['BitexARS'] = function() { return createTicker('BitexARS', 'Bitex', 'ARS$', '\u0243', '#783489', "https://bitex.la/api-v1/rest/btc/market/ticker", ['last']); };
  registerEvents('BitexARS');

  // Chilean Peso
  ticker_creators['LocalbitcoinsCLP'] = function() { return createTicker('LocalbitcoinsCLP', 'Localbitcoins', '$', '\u0243', '#088A08', "https://localbitcoins.com/bitcoinaverage/ticker-all-currencies/", ['CLP','rates','last']); };
  registerEvents('LocalbitcoinsCLP');

  // Mexican Peso
  ticker_creators['BitsoMXN'] = function() { return createTicker('BitsoMXN', 'Bitso', '$', '\u0243', '#088A08', "https://api.bitso.com/public/info", ['btc_mxn','rate']); };
  registerEvents('BitsoMXN');

  // South African Rand //
  ticker_creators['BitXZAR'] = function() { return createTicker('BitXZAR', 'BitX', 'R', '\u0243', '#4A1F54', "https://bitx.co.za/api/1/BTCZAR/ticker", ['last_trade']); };
  registerEvents('BitXZAR');

  ticker_creators['CoinbaseZAR'] = function() { return createTicker('CoinbaseZAR', 'Coinbase', 'R', '\u0243', '#4A1F54', "https://coinbase.com/api/v1/currencies/exchange_rates", ['btc_to_zar']); };
  registerEvents('CoinbaseZAR');

  // Shekel (Israel) //
  ticker_creators['Bit2CILS'] = function() { return createTicker('Bit2CILS', 'Bit2C', '\u20AA', '\u0243', '#4A1F54', "https://www.bit2c.co.il/Exchanges/BtcNis/Ticker.json", ['ll']); };
  registerEvents('Bit2CILS');

  // Litecoin prices //
  ticker_creators['BTCeLitecoin'] = function() { return createTicker('BTCeLitecoin', 'BTCe', '\u0243', '\u0141', '#013ADF', "https://btc-e.com/api/2/ltc_btc/ticker", ['ticker','last']); };
  registerEvents('BTCeLitecoin');

  ticker_creators['VircurexLitecoin'] = function() { return createTicker('VircurexLitecoin', 'Vircurex', '\u0243', '\u0141', '#0B0B3B', "https://api.vircurex.com/api/get_last_trade.json?base=LTC&alt=BTC", ['value']); };
  registerEvents('VircurexLitecoin');

  ticker_creators['KrakenLitecoin'] = function() { return createTicker('KrakenLitecoin', 'Kraken', '\u0141', '\u0243', '#000066', "https://api.kraken.com/0/public/Ticker?pair=XBTLTC", ['result','XXBTXLTC','c',0]); };
  registerEvents('KrakenLitecoin');

  // Litecoin USD prices //
  ticker_creators['BTCeLitecoinUSD'] = function() { return createTicker('BTCeLitecoinUSD', 'BTCe', '$', '\u0141', '#413ADF', "https://btc-e.com/api/2/ltc_usd/ticker", ['ticker','last']); };
  registerEvents('BTCeLitecoinUSD');

  // Litecoin EUR prices //
  ticker_creators['BTCeLitecoinEUR'] = function() { return createTicker('BTCeLitecoinEUR', 'BTCe', '\u20ac', '\u0141', '#413ADF', "https://btc-e.com/api/2/ltc_eur/ticker", ['ticker','last']); };
  registerEvents('BTCeLitecoinEUR');

  // WorldCoin prices //
  ticker_creators['VircurexWorldcoin'] = function() { return createTicker('VircurexWorldcoin', 'Vircurex', '\u0243', 'WDC', '#0B0B3B', "https://api.vircurex.com/api/get_last_trade.json?base=WDC&alt=BTC", ['value']); };
  registerEvents('VircurexWorldcoin');

  // Dogecoin prices //
  ticker_creators['CryptsyDogecoin'] = function() { return createTicker('CryptsyDogecoin', 'Cryptsy', '\u0243', 'DOGE', '#413ADF', "http://pubapi.cryptsy.com/api.php?method=singlemarketdata&marketid=132", ['return','markets','DOGE','lasttradeprice']); };
  registerEvents('CryptsyDogecoin');

  ticker_creators['KrakenDogecoin'] = function() { return createTicker('KrakenDogecoin', 'Kraken', 'DOGE', '\u0243', '#000066', "https://api.kraken.com/0/public/Ticker?pair=XBTXDG", ['result','XXBTXXDG','c',0]); };
  registerEvents('KrakenDogecoin');

  // Namecoin prices //
  ticker_creators['BTCeNamecoinUSD'] = function() { return createTicker('BTCeNamecoinUSD', 'BTCe', '$', 'NMC', '#413ADF', "https://btc-e.com/api/2/nmc_usd/ticker", ['ticker','last']); };
  registerEvents('BTCeNamecoinUSD');

  // Auroracoin prices //
  ticker_creators['CryptsyAuroracoin'] = function() { return createTicker('CryptsyAuroracoin', 'Cryptsy', '\u0243', 'AUR', '#413ADF', "http://pubapi.cryptsy.com/api.php?method=singlemarketdata&marketid=160", ['return','markets','AUR','lasttradeprice']); };
  registerEvents('CryptsyAuroracoin');

  // Blackcoin prices //
  ticker_creators['CryptsyBlackcoin'] = function() { return createTicker('CryptsyBlackcoin', 'Cryptsy', '\u0243', 'BC', '#000', "http://pubapi.cryptsy.com/api.php?method=singlemarketdata&marketid=179", ['return','markets','BC','lasttradeprice']); };
  registerEvents('CryptsyBlackcoin');

  // Nxt prices //
  ticker_creators['CryptsyNxt'] = function() { return createTicker('CryptsyNxt', 'Cryptsy', '\u0243', 'NXT', '#000', "http://pubapi.cryptsy.com/api.php?method=singlemarketdata&marketid=159", ['return','markets','NXT','lasttradeprice']); };
  registerEvents('CryptsyNxt');

  ticker_creators['PoloniexNxt'] = function() { return createTicker('PoloniexNxt', 'Poloniex', '\u0243', 'NXT', '#000', "https://poloniex.com/public?command=returnTicker", ['BTC_NXT', 'last']); };
  registerEvents('PoloniexNxt');

  // Bitshares prices //
  ticker_creators['PoloniexBitshares'] = function() { return createTicker('PoloniexBitshares', 'Poloniex', '\u0243', 'BTS', '#000', "https://poloniex.com/public?command=returnTicker", ['BTC_BTS', 'last']); };
  registerEvents('PoloniexBitshares');

  // Ripple prices //

  ticker_creators['KrakenRipple'] = function() { return createTicker('KrakenRipple', 'Kraken', 'XRP', '\u0243', '#000066', "https://api.kraken.com/0/public/Ticker?pair=XBTXRP", ['result','XXBTXXRP','c',0]); };
  registerEvents('KrakenRipple');

  // Maidsafe prices //

  ticker_creators['PoloniexMaidsafe'] = function() { return createTicker('PoloniexMaidsafe', 'Poloniex', '\u0243', 'MAID', '#000', "https://poloniex.com/public?command=returnTicker", ['BTC_MAID', 'last']); };
  registerEvents('PoloniexMaidsafe');

  // BitcoinDark prices //

  ticker_creators['PoloniexBitcoindark'] = function() { return createTicker('PoloniexBitcoindark', 'Poloniex', '\u0243', 'BTCD', '#000', "https://poloniex.com/public?command=returnTicker", ['BTC_BTCD', 'last']); };
  registerEvents('PoloniexBitcoindark');

  // Monero prices //

  ticker_creators['PoloniexMonero'] = function() { return createTicker('PoloniexMonero', 'Poloniex', '\u0243', 'XMR', '#000', "https://poloniex.com/public?command=returnTicker", ['BTC_XMR', 'last']); };
  registerEvents('PoloniexMonero');


  loadTickersInOrder(); // Load and create all selected tickers

  // Register general settings events
  Preferences.on('defaultFontSize', updateStyleAllTickers);
  Preferences.on('defaultTickerSpacing', updateStyleAllTickers);
  Preferences.on('infoButton', showAddonUpdateDocument);
  Preferences.on('Timer', updateTickerRefreshInterval);
  Preferences.on('gold-background', updateStyleAllTickers);
  Preferences.on('silver-background', updateStyleAllTickers);
  Preferences.on('other-background', updateStyleAllTickers);
  Preferences.on('show-long-trend', updateAllTickers);
  Preferences.on('show-short-trend', updateAllTickers);
  Preferences.on('show-currency-label', updateAllTickers);
  // Check updated version
  AddonManager.getAddonByID(ADDON_ID, function(addon) {
    showAddonUpdate(addon.version);
  });
};
