// Models to store and control data

const DEBUG = true
const DATA_PROVIDERS_FILE = "data-providers.json"
const DEFAULT_TICKER_CSS_CLASSES = "ticker"
var tickers = { "models": {}, "views": {}, "controllers": {}}

function loadJSON(file) {
  $(".ticker").text(' Reading JSON ')
  $.getJSON("data/js/providers.json", function(json) {
     $(".ticker").text('JSON ' + JSON.stringify(json))
  })
}

function getTickerModel(data, observer) {
  var tickerModel = tickers["models"][data.id]
  if (tickerModel) {
    updateTickerModelConfiguration(tickerModel, data)
  } else {
    tickerModel = createAndConfigureTickerModel(data, observer)
  }
  return tickerModel;
}

function createAndConfigureTickerModel(data, observer) {
  var tickerModel = createTickerModel(data.id)
  tickerModel.initialize(observer)
  updateTickerModelConfiguration(tickerModel, data)
  return tickerModel
}

function createTickerModel(id) {
  var ticker = {
    id: id,
    enabled: false,
    exchangeName: null,
    currency: null,
    baseCurrency: null,
    currencyPosition: null,
    color: null,
    fontSize: null,
    background: null,
    price: 0,
    updateInterval: 0,
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
      }
    },
    updatePrice: function(newPrice) {
      if (newPrice > 0) {
        ticker.price = newPrice
        ticker.notifyObservers()
      }
    },
    notifyObservers: function() {
      for (var i = 0; i < ticker.observers.length; i++) {
        ticker.observers[i](ticker) // Notify observers
      }
    }
  }
  return ticker
}

function updateTickerModelConfiguration(tickerModel, data) {
  var notifyObservers = false
  if (typeof data.enabled != "undefined") {
    if (data.enabled != tickerModel.enabled) {
      notifyObservers = true
      tickerModel.enabled = data.enabled ? true : false
    }
  }

  if (data.currencyPosition) {
    if (data.currencyPosition != tickerModel.currencyPosition) {
      notifyObservers = true
    }
    tickerModel.currencyPosition = data.currencyPosition
  }
  if (data.color) {
    if (data.color != tickerModel.color) {
      notifyObservers = true
    }
    tickerModel.color = data.color
  }
  if (data.fontSize) {
    if (data.fontSize != tickerModel.fontSize) {
      notifyObservers = true
    }
    tickerModel.fontSize = data.fontSize
  }
  // Background can be null
  if (data.background != tickerModel.background) {
    notifyObservers = true
  }
  tickerModel.background = data.background
  if (data.updateInterval) {
    if (data.updateInterval != tickerModel.updateInterval) {
      notifyObservers = true
    }
    tickerModel.updateInterval = data.updateInterval
  }
  if (notifyObservers) {
    tickerModel.notifyObservers()
  }
}

function getProvider(id) {
  return tickersRepository[id]
}

function getLatestData(id) {
  loadJSON(DATA_PROVIDERS_FILE)
  return
  var data = getProvider(id)
  if (data) {
    var url = data.url
    var jsonPath = data.jsonPath
    if (DEBUG) $(".ticker#"+id).text(' Getting ' + url + '-' + JSON.stringify(jsonPath))
    window.parent.postMessage({
      "id" : id,
      "url" : url,
      "jsonPath" : JSON.stringify(jsonPath)
    }, "*");
  }
}

loadJSON(DATA_PROVIDERS_FILE)