function doGet() {
  var sheet = SpreadsheetApp.openById('1tHNnvISnXDaMTBvF3KB3x5bs8Kha2LolHAbnv2H37dw').getSheetByName('Sheet1');
  var data = sheet.getRange(2, 1, sheet.getLastRow() - 1).getValues(); // skip header
  var randomIndex = Math.floor(Math.random() * data.length);
  var prediction = data[randomIndex][0];
  return ContentService.createTextOutput(JSON.stringify({ "prediction": prediction }))
    .setMimeType(ContentService.MimeType.JSON);
}
