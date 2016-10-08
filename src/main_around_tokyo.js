
var gis_def = {
  geodata_file:'data/11-14_around_tokyo.json',
  geodata_fieldname:'kanto', // topojsonのフィールド名
  ref_size : {
    width :  840,
    height:  660,
    scale : 12000
  },
  exceptions : ["所属未定地"],
  sample_data : 'params/sample_data_11-14_around_tokyo.json'
};

var seseki = require('./seseki.js');

seseki(gis_def);
