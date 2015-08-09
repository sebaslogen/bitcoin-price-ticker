const DEBUG = false
var tickerModels = {}

$(function() {
  loadTickers()
  $('.ticker').text('JS test externo')
})

function newEmptyTicker(tickerId) {
  return $( "<div></div>", {
    "id": tickerId,
    "class": "ticker",
    "text": 'New emtpy ticker for ' + tickerId
  })
}

/* This may happen in the addon index.js
function loadTickers() {
  var newTicker = newEmptyTicker()
  $('#tickers-body').append(newTicker)
}*/

window.addEventListener("message", handleAddonMessages, false);

function handleAddonMessages(message) {
  if (message.data.type == "updateTicker" && (! (message.data.data == "undefined")) ) {
    updateTicker(message.data.data)
  } else if (message.data.type == "updateTickerPrice") {
    updateTickerPrice(message.data.data)
  }
}

function updateTicker(message) {
  var data = message
  // Initialize View
  var tickerView = newEmptyTicker(data.id)
  $('#tickers-body').append(tickerView)
  tickerView.text(tickerView.text() + " " + data.enabled + " with " + data.color)

  // Initialize Data Model
  tickerModel = createTicker('BitStampUSD')
  tickerModel.initialize()
  tickerModels[tickerModel.id] = tickerModel
  getLatestData(tickerModel.id, tickerModel.updatePrice)
}

/*
// Update content of ticker widget //
self.port.on("updateContent", function(new_content) { 
  if (new_content != null) {
    $('#ticker-data').text(new_content);
  }
});

// Update and style of ticker widget //
self.port.on("updateStyle", function(color, font_size, background_color) {
  $('#ticker-data').css('font-size', font_size);
  $('#ticker-data').css('color', color);
  if (background_color) {
    $('#ticker-data').removeClass();
    $('#ticker-data').addClass(background_color);
  } else {
    $('#ticker-data').removeClass();
  }
  var body_el = document.getElementById('ticker-body');
  var client_width = body_el.clientWidth;
  var scroll_width = body_el.scrollWidth;
  if (($('#ticker-data').width() > 0) && (client_width != scroll_width)) {
    self.port.emit('increaseWidth', 1);
  }
});
*/

function createTicker(id) {
  var ticker = {
    id: id,
    enabled: false,
    exchangeName: null,
    currency: null,
    baseCurrency: null,
    color: null,
    price: 0,
    // Retrieve tickers provider and configuration data from repository
    initialize: function() {
      var data = getProvider(ticker.id)
      if (data) {
        ticker.exchangeName = data.exchangeName
        ticker.currency = data.currency
        ticker.baseCurrency = data.baseCurrency
        ticker.color = data.color
        $('.ticker').text(ticker.id + ' ' + ticker.exchangeName + ' internal') // DEBUG line TODO remove
      }
    },
    updatePrice: function(newPrice) {
      if (newPrice > 0) {
        ticker.price = newPrice
        // TODO Notify view
        $('.ticker').text(ticker.id + ' ' + ticker.exchangeName + ' - price ' + ticker.price) // DEBUG line TODO remove
      }
    }
  }
  return ticker
}

function getProvider(id) {
  return tickersRepository[id]
}

function getLatestData(id) {
  data = getProvider(id)
  if (data) {
    url = data.url
    jsonPath = data.jsonPath
    $('.ticker').text(' Getting ' + url) // DEBUG line TODO remove
    window.parent.postMessage({
      "id" : id,
      "url" : url,
      "jsonPath" : jsonPath
    }, "*");
    // $.get("http://www.w3schools.com/jquery/demo_test.asp", function(data, status){
    //     $('.ticker').text(' DEBUG1' ); // DEBUG line TODO remove
    // });
    // $.get( url, function( response ) {
    //   $('.ticker').text(' DEBUG1' ); // DEBUG line TODO remove
    //   // Parse JSON answer
    //   if ((response != null) && (response.json != null)) {
    //     var price = response.json
    //     for (var i = 0; i < jsonPath.length; i++) { // Parse JSON path
    //       if (typeof price[jsonPath[i]] == "undefined") {
    //         if (DEBUG) console.log("BitcoinPriceTicker error loading ticker " + id + ", URL not responding:" + url)
    //         return
    //       }
    //       price = price[jsonPath[i]]
    //       callback(price)
    //     }
    //   }
    // }).fail(function( jqXHR, textStatus, errorThrown ) {
    //   $('.ticker').text(' error' + textStatus + '-' + errorThrown); // DEBUG line TODO remove
    // });
  }
}

function updateTickerPrice(data) {
  if (! (data.id == "undefined" || data.price == "undefined")) {
    if (tickerModels[data.id]) {
      tickerModels[data.id].updatePrice(data.price)
    }
  }
}