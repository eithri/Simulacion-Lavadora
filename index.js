const { Board, Led } = require('johnny-five');

let myBoard, myLed;

myBoard = new Board()

myBoard.on('ready', function () {
    myLed = new Led(13);
    myLed.strobe(2000);


});

myBoard.on('error', function (err) {
    console.log(err);
});