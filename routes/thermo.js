const express = require('express');
const router = express.Router();

const i2c = require('i2c');
const address = 0x5c;
const wire = new i2c(address, {device: '/dev/i2c-1'});

function readRegister(response) {
  const i = setInterval(function () {
    wire.readBytes(0x00, 8, function (err, res) {
      if (err || res[0] != 0) {
        var t = (((res[4] & 0x7f) << 8) + res[5]) / 10.0;
        t = ((res[4] & 0x80) >> 7) == 1 ? t * (-1) : t;
        var h = ((res[2] << 8) + res[3]) / 10.0;
        // var d = new Date();
        // console.log(d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds() + ' t: ' + t + ", h: " + h);
        clearInterval(i);
        response(err, { temperature: t, humidity: h });
      }
    });
  }, 15);
}

function readAm2320(response) {
  wire.writeByte(0x00, function (err) {
    setTimeout(function (err) {
      wire.writeBytes(0x03, [0x00, 0x04], function (err) {
        setTimeout(function (err) {
          readRegister(response);
        }, 15);
      });
    }, 15);
  });
}

/* GET thermo listing. */
router.get('/', (req, res) => {
  readAm2320(function (err, result) {
    res.send(result);    
  });
});

module.exports = router;
