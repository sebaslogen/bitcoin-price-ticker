/**
 * Copyright (c) 2015 neoranga55@yahoo.es
 * 
 * The MIT License (MIT)
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 **/

// Models to store and control data

const DATA_PROVIDERS_URL = "data-providers.json";
const DATA_PROVIDERS_URL_BACKUP = "https://raw.githubusercontent.com/neoranga55/bitcoin-price-ticker/master/data/data-providers.json";
const DEFAULT_TICKER_CSS_CLASSES = "ticker";
var tickers = { "models": {}, "views": {}, "controllers": {}};
var tickersRepository = {};
var preLoadtickersRepository = {};

// Load configuration of data providers from JSON

function processProvidersDataJSON(json) {
  tickersRepository = json;
  for (var id in preLoadtickersRepository) {
    if (preLoadtickersRepository.hasOwnProperty(id)) {
      updateTickerConfiguration(id, preLoadtickersRepository[id]);
    }
  }
}

function loadJSON(url) {
  $.getJSON(url, processProvidersDataJSON)
    .fail(function() {
      // This may happen when loading this document
      // in a ui.Frame on Firefox Addon
      $.getJSON(DATA_PROVIDERS_URL_BACKUP, processProvidersDataJSON);
    }
  );
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