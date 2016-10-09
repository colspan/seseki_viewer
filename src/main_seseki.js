
var prefecture_datalist = ["01_hokkaido", "02_aomori", "03_iwate", "04_miyagi", "05_akita", "06_yamagata", "07_fukushima", "08_ibaraki", "09_tochigi", "10_gumma", "11_saitama", "12_chiba", "13_tokyo", "14_kanagawa", "15_niigata", "16_toyama", "17_ishikawa", "18_fukui", "19_tamanashi", "20_nagano", "21_gifu", "22_shizuoka", "23_aichi", "24_mie", "25_shiga", "26_kyoto", "27_osaka", "28_hyogo", "29_nara", "30_wakayama", "31_tottori", "32_shimane", "33_okayama", "34_hiroshima", "35_yamaguchi", "36_tokushima", "37_kagawa", "38_ehime", "39_kochi", "40_fukuoka", "41_saga", "42_nagasaki", "43_kumamoto", "44_oita", "45_miyagawa", "46_kagoshima", "47_okinawa"];

var target_prefecture = prefecture_datalist[11];
var gis_def = {
  geodata_files:['data/' + target_prefecture + '_topo.json', 'data/' + prefecture_datalist[12] + '_topo.json'],
  ref_size : {
    width :  840,
    height:  660,
    scale : 16000
  },
  exceptions : ["所属未定地"],
  sample_data : 'params/sample_data_11-14_around_tokyo.json'
};
var seseki = require('./seseki.js');

seseki(gis_def);
