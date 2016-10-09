
var gis_def = {
  geodata_files:[
    "data/11_saitama_topo.json",
    "data/12_chiba_topo.json",
    "data/13_tokyo_topo.json",
    "data/14_kanagawa_topo.json"
  ],
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
