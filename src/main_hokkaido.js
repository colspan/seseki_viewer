
var gis_def = {
  geodata_file : 'data/01_hokkaido_topo.json',
  geodata_fieldname : '01_hokkaido', // topojsonのフィールド名
  ref_size : {
    width :  840,
    height:  660,
    scale : 5000
  },
  exceptions : ["色丹郡色丹村","国後郡泊村","国後郡留夜別村","択捉郡留別村","紗那郡紗那村","蘂取郡蘂取村"],
  sample_data : 'params/sample_data_01_hokkaido.json'
};

var seseki = require('./seseki.js');

seseki(gis_def);
