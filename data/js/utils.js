$(function() {
  loadTickers()
  $('.ticker').text('JS test externo')
})

function newEmptyTicker() {
  return jQuery('<div/>', {
    class: 'ticker',
    text: 'Emtpy ticker'
  })
}

function loadTickers() {
  var newTicker = newEmptyTicker()
  $('#tickers-body').append(newTicker)
}

/*self.port.on("ticker", function(id, enabled, color) {
  $('.ticker').text("Event received")
});*/



window.addEventListener("message", updateTicker, false);

function updateTicker(message) {
  $('.ticker').text(message.data)
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