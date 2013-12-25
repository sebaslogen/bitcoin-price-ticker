
// Update content and style of ticker widget //
self.port.on("update", function(color, font_size, new_content) {
  $('#ticker-data').text(new_content);
  $('#ticker-data').css('font-size', font_size);
  $('#ticker-data').css('color', color);
});