d3 = require('d3');
topojson = require('topojson');
XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
fs = require('fs');


var prefecture_def = [
 	{  "id" : "01",  "prefecture_jp" : "北海道",  "prefecture_en" : "hokkaido",  },
	{  "id" : "02",  "prefecture_jp" : "青森",  "prefecture_en" : "aomori",  },
	{  "id" : "03",  "prefecture_jp" : "岩手",  "prefecture_en" : "iwate",  },
	{  "id" : "04",  "prefecture_jp" : "宮城",  "prefecture_en" : "miyagi",  },
	{  "id" : "05",  "prefecture_jp" : "秋田",  "prefecture_en" : "akita",  },
	{  "id" : "06",  "prefecture_jp" : "山形",  "prefecture_en" : "yamagata",  },
	{  "id" : "07",  "prefecture_jp" : "福島",  "prefecture_en" : "fukushima",  },
	{  "id" : "08",  "prefecture_jp" : "茨城",  "prefecture_en" : "ibaraki",  },
	{  "id" : "09",  "prefecture_jp" : "栃木",  "prefecture_en" : "tochigi",  },
	{  "id" : "10",  "prefecture_jp" : "群馬",  "prefecture_en" : "gumma",  },
	{  "id" : "11",  "prefecture_jp" : "埼玉",  "prefecture_en" : "saitama",  },
	{  "id" : "12",  "prefecture_jp" : "千葉",  "prefecture_en" : "chiba",  },
	{  "id" : "13",  "prefecture_jp" : "東京",  "prefecture_en" : "tokyo",  },
	{  "id" : "14",  "prefecture_jp" : "神奈川",  "prefecture_en" : "kanagawa",  },
	{  "id" : "15",  "prefecture_jp" : "新潟",  "prefecture_en" : "niigata",  },
	{  "id" : "16",  "prefecture_jp" : "富山",  "prefecture_en" : "toyama",  },
	{  "id" : "17",  "prefecture_jp" : "石川",  "prefecture_en" : "ishikawa",  },
	{  "id" : "18",  "prefecture_jp" : "福井",  "prefecture_en" : "fukui",  },
	{  "id" : "19",  "prefecture_jp" : "山梨",  "prefecture_en" : "tamanashi",  },
	{  "id" : "20",  "prefecture_jp" : "長野",  "prefecture_en" : "nagano",  },
	{  "id" : "21",  "prefecture_jp" : "岐阜",  "prefecture_en" : "gifu",  },
	{  "id" : "22",  "prefecture_jp" : "静岡",  "prefecture_en" : "shizuoka",  },
	{  "id" : "23",  "prefecture_jp" : "愛知",  "prefecture_en" : "aichi",  },
	{  "id" : "24",  "prefecture_jp" : "三重",  "prefecture_en" : "mie",  },
	{  "id" : "25",  "prefecture_jp" : "滋賀",  "prefecture_en" : "shiga",  },
	{  "id" : "26",  "prefecture_jp" : "京都",  "prefecture_en" : "kyoto",  },
	{  "id" : "27",  "prefecture_jp" : "大阪",  "prefecture_en" : "osaka",  },
	{  "id" : "28",  "prefecture_jp" : "兵庫",  "prefecture_en" : "hyogo",  },
	{  "id" : "29",  "prefecture_jp" : "奈良",  "prefecture_en" : "nara",  },
	{  "id" : "30",  "prefecture_jp" : "和歌山",  "prefecture_en" : "wakayama",  },
	{  "id" : "31",  "prefecture_jp" : "鳥取",  "prefecture_en" : "tottori",  },
	{  "id" : "32",  "prefecture_jp" : "島根",  "prefecture_en" : "shimane",  },
	{  "id" : "33",  "prefecture_jp" : "岡山",  "prefecture_en" : "okayama",  },
	{  "id" : "34",  "prefecture_jp" : "広島",  "prefecture_en" : "hiroshima",  },
	{  "id" : "35",  "prefecture_jp" : "山口",  "prefecture_en" : "yamaguchi",  },
	{  "id" : "36",  "prefecture_jp" : "徳島",  "prefecture_en" : "tokushima",  },
	{  "id" : "37",  "prefecture_jp" : "香川",  "prefecture_en" : "kagawa",  },
	{  "id" : "38",  "prefecture_jp" : "愛媛",  "prefecture_en" : "ehime",  },
	{  "id" : "39",  "prefecture_jp" : "高知",  "prefecture_en" : "kochi",  },
	{  "id" : "40",  "prefecture_jp" : "福岡",  "prefecture_en" : "fukuoka",  },
	{  "id" : "41",  "prefecture_jp" : "佐賀",  "prefecture_en" : "saga",  },
	{  "id" : "42",  "prefecture_jp" : "長崎",  "prefecture_en" : "nagasaki",  },
	{  "id" : "43",  "prefecture_jp" : "熊本",  "prefecture_en" : "kumamoto",  },
	{  "id" : "44",  "prefecture_jp" : "大分",  "prefecture_en" : "oita",  },
	{  "id" : "45",  "prefecture_jp" : "宮崎",  "prefecture_en" : "miyagawa",  },
	{  "id" : "46",  "prefecture_jp" : "鹿児島",  "prefecture_en" : "kagoshima",  },
	{  "id" : "47",  "prefecture_jp" : "沖縄",  "prefecture_en" : "okinawa",  },
];


// 複数ファイルを非同期読み込み
var promises = prefecture_def.map(function(d){
    return new Promise(function(resolve, reject){
        var filename = "../data/" + d.id + "_" + d.prefecture_en + "_topo.json";
        fs.readFile(filename, function(error, file_contents){
            if(error){
                console.log(error);
                reject(error);
                return;
            }
            var loaded = JSON.parse(file_contents);
            // TopoJSONデータ展開
            var geodata_fieldname = Object.keys(loaded.objects)[0];
            // 地図描画
            var geojson = topojson.merge(loaded, loaded.objects[geodata_fieldname].geometries.filter(function(x){return true}));

            resolve({geojson:geojson,prefecture_jp:d.prefecture_jp,prefecture_en:d.prefecture_en});
        });
    });
});

Promise.all(promises).then(function(results){
    var geodata = {
		"type":"FeatureCollection",
		"features":[]
	};
    results.forEach(function(d,i){
		var feature = {
			"type":"Feature",
			"geometry":{
				"type":"MultiPolygon",
				"coordinates":d.geojson.coordinates
			},
			"properties":{
				"prefecture_jp":d.prefecture_jp,
				"prefecture_en":d.prefecture_en,
				"id":i+1
			}
		}
		geodata.features.push(feature);
		console.log(d.prefecture_jp, Object.keys(d.geojson));

    });
    fs.writeFile( './whole_japan_prefecture.json', JSON.stringify(geodata));

});



