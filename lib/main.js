// The main module of the neoranga Add-on.

var {Cc, Ci} = require('chrome');
var mediator = Cc['@mozilla.org/appshell/window-mediator;1'].getService(Ci.nsIWindowMediator);
var Widget = require("sdk/widget").Widget;
var Preferences = require('sdk/simple-prefs');
var Request = require("sdk/request").Request;
var self = require("sdk/self");
const setInterval = require("sdk/timers").setInterval;
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

exports.main = function() {

    var createTicker = function(id, label, currency, color, ticker_url, json_path) {
        var pref_name = "p" + id; // Construct preference name from ID
        if ((typeof Preferences.prefs[pref_name] != "undefined") && (!Preferences.prefs[pref_name])) {
            return null; // This Ticker is disabled
        }
        var refresh_rate = 60;
        var pref_timer = "p" + id + "Timer"; // Construct preference refresh rate from ID
        var refresh_request = Preferences.prefs[pref_timer];
        if ((typeof refresh_request != "undefined") && (refresh_request >= 1)) {
            refresh_rate = refresh_request;
        }
        var pref_color = "p" + id + "Color"; // Construct preference refresh rate from ID
        var color_request = Preferences.prefs[pref_color];
        if (typeof color_request != "undefined") {
            color = color_request;
        }
        var document = mediator.getMostRecentWindow('navigator:browser').document;
        var newDiv = document.createElement("div");
        var newContent = document.createTextNode("---" + currency);
        newDiv.appendChild(newContent); //add the text node to the newly created div.
        newDiv.style.cssText = 'cursor:default; font-size:14px; color: ' + color + ';';
        var ticker = new Widget({
            id: "Bitoin-Price-Ticker-" + id,
            label: label + " " + currency,
            content: newDiv.outerHTML,
            width: 30,
            onClick: function(event) {
                updateTicker();
            }
        });
        function updateTicker() {
            Request({
                url: ticker_url,
                onComplete: function (response) {
                    var document = mediator.getMostRecentWindow('navigator:browser').document;
                    var newDiv = document.createElement("div");
                    var pref_color = "p" + id + "Color"; // Construct preference refresh rate from ID
                    var color_request = Preferences.prefs[pref_color];
                    if (typeof color_request != "undefined") {
                        color = color_request;
                    }
                    var font_size = Preferences.prefs["defaultFontSize"];
                    if ((typeof font_size === "undefined") || (font_size <= 0)) {
                        font_size = 14;
                    }
                    newDiv.style.cssText = 'cursor:default; vertical-align:middle; font-size:' + font_size + 'px; color: ' + color + ';';
                    if ((response == null) || (response.json == null)) { // No JSON provided by server
                        var newContent = document.createTextNode("???" + currency);
                        newDiv.appendChild(newContent); //add the text node to the newly created div.
                        ticker.content = newDiv.outerHTML;
                    } else {
                        var price = response.json;
                        for (var i = 0; i < json_path.length; i++) { // Parse JSON path
                            price = price[json_path[i]];
                        }
                        price = Math.round(price*100)/100;
                        var newContent = document.createTextNode(price + currency);
                        newDiv.appendChild(newContent); //add the text node to the newly created div.
                        ticker.content = newDiv.outerHTML;
                        var ticker_width = Preferences.prefs["defaultTickerSpacing"];
                        if ((typeof ticker_width === "undefined") || (ticker_width <= 0)) {
                            ticker_width = 12;
                        }
                        var text_size = price.toString().length;
                        if (price.toString().indexOf('.') != -1)
                        {
                            ticker_width += 1;
                            text_size -= 1;
                        }                        
                        ticker_width += (text_size * 8);
                        if (currency == "元") { // Yuan character needs extra pixels to be painted
                            ticker_width += 8;
                        }
                        ticker.width = ticker_width;
                    }
                }
            }).get();
        };
        updateTicker();
        setInterval(function() { updateTicker(); }, (refresh_rate * 1000));
        return ticker;
    };

    // Live enable/disable from options checkbox
    var toggleTicker = function(tickerName, tickerCreator) {
        var pref_name = 'p' + tickerName; // Construct preference name from ID
        var enable = Preferences.prefs[pref_name];
        if (typeof enable === "undefined") {
            return null; // This Ticker preference is missing
        }
        if ( enable ) { // Enable Ticker
            tickers[tickerName + 'Ticker'] = tickerCreator();
        } else { // Disable Ticker
            tickers[tickerName + 'Ticker'].destroy();
            tickers[tickerName + 'Ticker'] = null;
        }
    };

    // Create and initialize all available tickers //

    // USD prices //
    var createMtGoxUSDTicker = function() { return createTicker('MtGoxUSD', 'MtGox', '$', '#B43104', "https://data.mtgox.com/api/2/BTCUSD/money/ticker", ['data','last','value']); };
    tickers['MtGoxUSDTicker'] = createMtGoxUSDTicker();
    Preferences.on('pMtGoxUSD', function() { toggleTicker('MtGoxUSD', createMtGoxUSDTicker); }); // Create event to enable/disable of tickers
    
    var createBitStampUSDTicker = function() { return createTicker('BitStampUSD', 'BitStamp', '$', '#FF0000', "https://www.bitstamp.net/api/ticker/", ['last']); };
    tickers['BitStampUSDTicker'] = createBitStampUSDTicker();
    Preferences.on('pBitStampUSD', function() { toggleTicker('BitStampUSD', createBitStampUSDTicker); }); // Create event to enable/disable of tickers
    
    var createBTCeUSDTicker = function() { return createTicker('BTCeUSD', 'BTCe', '$', '#FE642E', "https://btc-e.com/api/2/btc_usd/ticker", ['ticker','last']); };
    tickers['BTCeUSDTicker'] = createBTCeUSDTicker();
    Preferences.on('pBTCeUSD', function() { toggleTicker('BTCeUSD', createBTCeUSDTicker); }); // Create event to enable/disable of tickers

    var createKrakenUSDTicker = function() { return createTicker('KrakenUSD', 'Kraken', '$', '#FF9966', "https://api.kraken.com/0/public/Ticker?pair=XBTUSD", ['result','XXBTZUSD','c',0]); };
    tickers['KrakenUSDTicker'] = createKrakenUSDTicker();
    Preferences.on('pKrakenUSD', function() { toggleTicker('KrakenUSD', createKrakenUSDTicker); }); // Create event to enable/disable of tickers

    var createCoinDeskUSDTicker = function() { return createTicker('CoinDeskUSD', 'CoinDesk', '$', '#DBA901', "http://api.coindesk.com/v1/bpi/currentprice.json", ['bpi','USD','rate_float']); };
    tickers['CoinDeskUSDTicker'] = createCoinDeskUSDTicker();
    Preferences.on('pCoinDeskUSD', function() { toggleTicker('CoinDeskUSD', createCoinDeskUSDTicker); }); // Create event to enable/disable of tickers

    // Euro prices //
    var createMtGoxEURTicker = function() { return createTicker('MtGoxEUR', 'MtGox', '€', '#807AE2', "https://data.mtgox.com/api/2/BTCEUR/money/ticker", ['data','last','value']); };
    tickers['MtGoxEURTicker'] = createMtGoxEURTicker();
    Preferences.on('pMtGoxEUR', function() { toggleTicker('MtGoxEUR', createMtGoxEURTicker); }); // Create event to enable/disable of tickers

    var createBTCeEURTicker = function() { return createTicker('BTCeEUR', 'BTCe', '€', '#013ADF', "https://btc-e.com/api/2/btc_eur/ticker", ['ticker','last']); };
    tickers['BTCeEURTicker'] = createBTCeEURTicker();
    Preferences.on('pBTCeEUR', function() { toggleTicker('BTCeEUR', createBTCeEURTicker); }); // Create event to enable/disable of tickers

    var createKrakenEURTicker = function() { return createTicker('KrakenEUR', 'Kraken', '€', '#3366FF', "https://api.kraken.com/0/public/Ticker?pair=XBTEUR", ['result','XXBTZEUR','c',0]); };
    tickers['KrakenEURTicker'] = createKrakenEURTicker();
    Preferences.on('pKrakenEUR', function() { toggleTicker('KrakenEUR', createKrakenEURTicker); }); // Create event to enable/disable of tickers

    var createCoinDeskEURTicker = function() { return createTicker('CoinDeskEUR', 'CoinDesk', '€', '#000066', "http://api.coindesk.com/v1/bpi/currentprice.json", ['bpi','EUR','rate_float']); };
    tickers['CoinDeskEURTicker'] = createCoinDeskEURTicker();
    Preferences.on('pCoinDeskEUR', function() { toggleTicker('CoinDeskEUR', createCoinDeskEURTicker); }); // Create event to enable/disable of tickers
    
    // Pound prices //
    var createCoinDeskGBPTicker = function() { return createTicker('CoinDeskGBP', 'CoinDesk', '£', '#088A08', "http://api.coindesk.com/v1/bpi/currentprice.json", ['bpi','GBP','rate_float']); };
    tickers['CoinDeskGBPTicker'] = createCoinDeskGBPTicker();
    Preferences.on('pCoinDeskGBP', function() { toggleTicker('CoinDeskGBP', createCoinDeskGBPTicker); }); // Create event to enable/disable of tickers

    // Yen prices //
    var createMtGoxJPYTicker = function() { return createTicker('MtGoxJPY', 'MtGox', '¥', '#04B4AE', "https://data.mtgox.com/api/2/BTCJPY/money/ticker", ['data','last','value']); };
    tickers['MtGoxJPYTicker'] = createMtGoxJPYTicker();
    Preferences.on('pMtGoxJPY', function() { toggleTicker('MtGoxJPY', createMtGoxJPYTicker); }); // Create event to enable/disable of tickers

    // Yuan prices //
    var createMtGoxCNYTicker = function() { return createTicker('MtGoxCNY', 'MtGox', '元', '#A901DB', "https://data.mtgox.com/api/2/BTCCNY/money/ticker", ['data','last','value']); };
    tickers['MtGoxCNYTicker'] = createMtGoxCNYTicker();
    Preferences.on('pMtGoxCNY', function() { toggleTicker('MtGoxCNY', createMtGoxCNYTicker); }); // Create event to enable/disable of tickers

    var createBTCChinaCNYTicker = function() { return createTicker('BTCChinaCNY', 'BTCChina', '元', '#DF01D7', "https://vip.btcchina.com/bc/ticker", ['ticker','last']); };
    tickers['BTCChinaCNYTicker'] = createBTCChinaCNYTicker();
    Preferences.on('pBTCChinaCNY', function() { toggleTicker('BTCChinaCNY', createBTCChinaCNYTicker); }); // Create event to enable/disable of tickers
};
