
// Update content of ticker widget //
self.port.on("updateContent", function(new_content) {
  if (new_content != null) {
    $('#ticker-data').text(new_content);
  }
});

// Update and style of ticker widget //
self.port.on("updateStyle", function(color, font_size, gold_background, silver_background) {
  $('#ticker-data').css('font-size', font_size);
  $('#ticker-data').css('color', color);
  if (gold_background) {
    $('#ticker-data').removeClass('silver_background');
    $('#ticker-data').addClass('gold_background');
  } else if (silver_background) {
    $('#ticker-data').removeClass('gold_background');
    $('#ticker-data').addClass('silver_background');
  } else {
    $('#ticker-data').removeClass('gold_background');
    $('#ticker-data').removeClass('silver_background');
  }
});