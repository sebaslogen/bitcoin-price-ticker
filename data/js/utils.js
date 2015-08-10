const DEBUG = false
var tickerModels = {}

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
  var tickerView = getTickerView(data.id)
  tickerView.text(tickerView.text() + " " + data.enabled + " with " + data.color) // DEBUG line TODO remove

  // Initialize Data Model
  var tickerModel = getTickerModel(data)
}

// Models

function getTickerModel(data) {
  var tickerModel = tickerModels[data.id]
  if (tickerModel) {
    updateTickerModelConfiguration(tickerModel, data)
  } else {
    tickerModel = createTickerModel(data)
  }
  return tickerModel;
}

function createTickerModel(data) {
  var tickerModel = createTicker(data.id)
  tickerModel.initialize(updateView)
  updateTickerModelConfiguration(tickerModel, data)
  tickerModels[tickerModel.id] = tickerModel
  return tickerModel
}

function updateTickerModelConfiguration(tickerModel, data) {
  if (data.color) {
    tickerModel.color = data.color
  }
  if (data.enabled) {
    tickerModel.enabled = true
    getLatestData(tickerModel.id, tickerModel.updatePrice)
  }
}

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
          ticker.observers[i](ticker) // Notify observers
        }
        // TODO Notify view
        
      }
    }
  }
  return ticker
}

function updateTickerModelPrice(data) {
  if (! (data.id == "undefined" || data.price == "undefined")) {
    if (tickerModels[data.id]) {
      tickerModels[data.id].updatePrice(data.price)
    }
  }
}

function getProvider(id) {
  return tickersRepository[id]
}

function getLatestData(id) {
  var data = getProvider(id)
  if (data) {
    var url = data.url
    var jsonPath = data.jsonPath
    $('.ticker').text(' Getting ' + url) // DEBUG line TODO remove
    window.parent.postMessage({
      "id" : id,
      "url" : url,
      "jsonPath" : jsonPath
    }, "*");
  }
}

// Views

function getTickerView(id) {
  var tickerView = $(".ticker#"+id)
  if (tickerView.size() == 0) {
    tickerView = createTickerView(id)
  }
  return tickerView
}

function createTickerView(id) {
  var tickerView = newViewTicker(id)
  $('#tickers-body').append(tickerView)
  return tickerView
}
function newViewTicker(tickerId) {
  return $( "<div></div>", {
    "id": tickerId,
    "class": "ticker",
    "text": 'New emtpy ticker for ' + tickerId
  })
}

function updateView(ticker) {
  var tickerView = $(".ticker#"+ticker.id)
  if (tickerView.size() == 1) {
    tickerView.text(ticker.id + ' ' + ticker.price) // DEBUG line TODO remove
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