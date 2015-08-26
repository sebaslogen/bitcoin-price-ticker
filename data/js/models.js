// Models to store and control data
const DATA_PROVIDERS_URL = "https://raw.githubusercontent.com/neoranga55/bitcoin-price-ticker/refactor-to-use-firefox-frames/data/data-providers.json";
const DEFAULT_TICKER_CSS_CLASSES = "ticker";
var tickers = { "models": {}, "views": {}, "controllers": {}};
var tickersRepository = {};
var preLoadtickersRepository = {};

// Load configuration of data providers from JSON

function loadJSON(url) {
  $.getJSON(url, function(json) {
      tickersRepository = json;
      for (var id in preLoadtickersRepository) {
        if (preLoadtickersRepository.hasOwnProperty(id)) {
          updateTickerConfiguration(id, preLoadtickersRepository[id]);
        }
      }
  })
}

loadJSON(DATA_PROVIDERS_URL);

function getTickerModel(id, data, observer) {
  var tickerModel = tickers["models"][id];
  if (tickerModel) {
    updateTickerModelConfiguration(tickerModel, data);
  } else {
    tickerModel = createAndConfigureTickerModel(id, data, observer);
  }
  return tickerModel;
}

function createAndConfigureTickerModel(id, data, observer) {
  var tickerModel = createTickerModel(id);
  tickerModel.initialize(observer);
  updateTickerModelConfiguration(tickerModel, data);
  return tickerModel;
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
    observers: [],
    // Retrieve tickers provider and configuration data from repository
    initialize: function(observer) {
      ticker.observers.push(observer);
      var data = getProvider(ticker.id);
      if (data) {
        ticker.exchangeName = data.exchangeName;
        ticker.currency = data.currency;
        ticker.baseCurrency = data.baseCurrency;
        ticker.color = data.color;
      }
    },
    updatePrice: function(newPrice) {
      if (newPrice > 0) {
        ticker.price = newPrice;
        ticker.notifyObservers();
      }
    },
    notifyObservers: function() {
      for (var i = 0; i < ticker.observers.length; i++) {
        ticker.observers[i](ticker); // Notify observers
      }
    }
  };
  return ticker;
}

function updateTickerModelConfiguration(tickerModel, data) {
  var notifyObservers = false;
  if (data.enabled !== undefined) {
    if (data.enabled != tickerModel.enabled) {
      notifyObservers = true;
      tickerModel.enabled = data.enabled ? true : false;
    }
  }

  if (data.currencyPosition) {
    if (data.currencyPosition != tickerModel.currencyPosition) {
      notifyObservers = true;
    }
    tickerModel.currencyPosition = data.currencyPosition;
  }
  if (data.color) {
    if (data.color != tickerModel.color) {
      notifyObservers = true;
    }
    tickerModel.color = data.color;
  }
  if (data.fontSize) {
    if (data.fontSize != tickerModel.fontSize) {
      notifyObservers = true;
    }
    tickerModel.fontSize = data.fontSize;
  }
  // Background can be null
  if (data.background != tickerModel.background) {
    notifyObservers = true;
  }
  tickerModel.background = data.background;
  if (notifyObservers) {
    tickerModel.notifyObservers();
  }
}

function getProvider(id) {
  return tickersRepository[id];
}