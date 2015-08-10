const DEBUG = false
var tickerModels = {}

function newEmptyTicker(tickerId) {
  return $( "<div></div>", {
    "id": tickerId,
    "class": "ticker",
    "text": 'New emtpy ticker for ' + tickerId
  })
}

window.addEventListener("message", handleAddonMessages, false);

function handleAddonMessages(message) {
  if (message.data.type == "updateTickerConfiguration" && (! (message.data.data == "undefined")) ) {
    updateTickerConfiguration(message.data.data)
  } else if (message.data.type == "updateTickerModelPrice") {
    updateTickerModelPrice(message.data.data)
  }
}

function updateTickerConfiguration(message) {
  var data = message

  // Initialize View
  var tickerView = newEmptyTicker(data.id)
  $('#tickers-body').append(tickerView)
  tickerView.text(tickerView.text() + " " + data.enabled + " with " + data.color) // DEBUG line TODO remove

  // Initialize Data Model
  tickerModel = createTicker('BitStampUSD')
  tickerModel.initialize(updateView)
  tickerModels[tickerModel.id] = tickerModel
  if (data.color) {
    tickerModel.color = data.color
  }
  if (data.enabled) {
    tickerModel.enabled = true
    getLatestData(tickerModel.id, tickerModel.updatePrice)
  }
}

function updateTickerModelPrice(data) {
  if (! (data.id == "undefined" || data.price == "undefined")) {
    if (tickerModels[data.id]) {
      tickerModels[data.id].updatePrice(data.price)
    }
  }
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
    observers: [],
    // Retrieve tickers provider and configuration data from repository
    initialize: function(observer) {
      ticker.observers.push(observer)
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
        for (var i = 0; i < ticker.observers.length; i++) {
          ticker.observers[i](ticker)
        }
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
  }
}

function updateView(ticker) {

}