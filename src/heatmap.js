var topojson = require('topojson');
(function($) {

  var ua = navigator.userAgent; // ユーザーエージェントを代入
  var isIE = false;
  var isEdge = false;
  if (ua.match("MSIE") || ua.match("Trident")) {
    isIE = true;
  }
  if (ua.match("Edge")){
    isEdge = true;
  }
  var captions = ['title', 'subtitle', 'subsubtitle'];
  function update_legend(legendView, options){
    var domain = options.color_scale.domain();
    var format_str;
    if(options.format_str) format_str = options.format_str;
    else format_str = (domain[0]%1===0 && domain[1]%1===0? ',.0f' : '0.2f' );
    var legend = d3.legend.color()
      .cells(11)
      .shapeWidth(50)
      .labelFormat(d3.format(format_str))
      .scale(options.color_scale);
    legendView.call(legend);
  }
  var methods = {
    init : function(option, callback){
      var _this = this;
      var defaults = {
        geodata_files : [],
        ref_size : {
          width :  420,
          height:  330,
          scale : 3200
        },
        exceptions:["色丹郡色丹村","国後郡泊村","国後郡留夜別村","択捉郡留別村","紗那郡紗那村","蘂取郡蘂取村", "所属未定地"],
        title : 'title',
        subtitle : 'subtitle',
        subsubtitle : 'subsubtitle',
        caption_sizes : [32,20,20],
        map_filler : function(d){return '#ffffff'},
        stroke_filler: "hsl(80,100%,0%)",
        on_mouseover : null,
        on_mouseout : null,
        on_mousedown : null,
        on_mouseup : null,
        on_touchstart : null,
        on_touchend : null,
        on_click : null,
        show_legend : true,
        max_width : null,
        save_button : true,
        save_filename : 'heatmap'
      };
      var options = $.extend(defaults,option);
      _this[0].japaneseMapOpts = options;
      var selector = this.selector;
      var geodata;
      var communes = [];
      var id_map = {};

      // 複数ファイルを非同期読み込み
      var promises = [];
      options.geodata_files.forEach(function(d){
        var p = new Promise(function(resolve, reject){
            d3.json(d, function(error, data){
              load_finished(error, data, resolve, reject);
            });
        });
        promises.push(p);
      });
      // 読み込み処理
      function load_finished(error, loaded, resolve, reject){
        if(error){
          reject(error);
          return;
        }
        // TopoJSONデータ展開
        var geodata_fieldname = Object.keys(loaded.objects)[0];
        geojson = topojson.feature(loaded, loaded.objects[geodata_fieldname]);
        var exception_communes = options.exceptions; // 対象外の市町村
        var remove_list = [];
        var communes = [];
        function register(k,v){
          if(!id_map[k]) id_map[k] = [];
          if(id_map[k].indexOf(v) == -1) id_map[k].push(v);
        }
        geojson.features.forEach(function(d,i){
          // 国土数値情報　行政区域データ向けのパーサ

          if(d.properties.N03_007=="") return; // 所属未定地等IDがないものは飛ばす

          // 市町村名を整理する
          d.commune_id = +d.properties.N03_007; // IDを代入
          d.prefecture = d.properties.N03_001;
          d.name = '';
          if(d.properties.N03_003) d.name += d.properties.N03_003;
          if(d.properties.N03_004) d.name += d.properties.N03_004;

          if(exception_communes.indexOf(d.name) != -1){
            // 除外リストに存在すれば削除フラグを付与する
            remove_list.unshift(i);
          }
          else{
            // 除外リストになければ市町村一覧に追加
            if(communes.indexOf(d.name) == -1) communes.push(d.name);
          }

          // CSVの市町村名から白地図のIDに変換するmapを自動生成する
          // 政令指定都市 or 郡
          if(d.properties.N03_003){
            // 政令指定都市または郡単位でひと塗りとする
            register(d.properties.N03_003, d.commune_id);
            // 町村・区単位を連結する
            register(d.name, d.commune_id);
            // 郡の場合は町村のみにできるようにする
            if(d.properties.N03_003.slice(-1)=="郡"){
              register(d.properties.N03_004, d.commune_id);
            }
          }
          // 市
          if(d.properties.N03_004){
              register(d.properties.N03_004, d.commune_id);
          }
        });
        // 対象外の市町村を削除
        remove_list.forEach(function(d){
          geojson.features.splice(d,1);
        });        

        // 割り切り 同じ市町村名があると区別できない
        resolve({geojson:geojson,communes:communes,id_map:id_map});
      }

      // 処理開始
      Promise.all(promises).then(ready);
      function ready(results){
        results.forEach(function(d){
          if(!geodata) geodata = d.geojson;
          else geodata.features = geodata.features.concat(d.geojson.features);
          communes = communes.concat(d.communes);
          Object.keys(d.id_map).forEach(function(x){
            id_map[x] = d.id_map[x];
          });
        });

        _this[0].japaneseMapCommunes = communes;
        _this[0].japaneseMapIdMap = id_map;
        display();
      }

      function display(){
        var projection, path;

        options.geodata = geodata;

        // svg要素を作成し、データの受け皿となるg要素を追加
        var map_container = d3.select(selector).append('svg')
        .attr('width', "100%")
        //.attr('height', options.ref_size.height)
        .attr("preserveAspectRatio", "xMinYMax meet")
        .attr("viewBox", "0 0 "+options.ref_size.width+" "+options.ref_size.height);
        var map = map_container.append('g');

        // Caption
        var caption_container = map_container.append('g').attr('class','japanese_map_caption_container');
        caption_container.selectAll('text')
          .data(captions)
          .enter()
          .append('text')
          .style('font',function(d,i){return options.caption_sizes[i]+'px "Noto Sans CJK JP" Arial'})
          .attr('x',5)
          .attr('y',function(d,i){var y=0;for(var j=0;j<=i;j++){y+=options.caption_sizes[j]+5}return y})
          .text(function(d){return options[d]});

        // 表示する際の縮尺を緯度経度の範囲から動的に求める(距離に換算せず角度のまま計算する)
        var geo_bounds = d3.geo.bounds(geodata);
        var scale = 22000.0 / d3.max([Math.abs(geo_bounds[0][0]-geo_bounds[1][0]), Math.abs(geo_bounds[0][1]-geo_bounds[1][1])] );
        // 投影を処理する関数を用意した上でデータからSVGのPATHに変換
        projection = d3.geo.mercator()
        .scale(scale)
        .center(d3.geo.centroid(geodata))  // データから中心点を計算
        .translate([options.ref_size.width / 2, options.ref_size.height / 2]);

        // pathジェネレータ関数
        path = d3.geo.path().projection(projection);
        map.selectAll('path')
        .data(geodata.features)
        .enter()
        .append('path')
        .attr('d', path)
        .attr("fill", options.map_filler)
        .attr("stroke", options.stroke_filler)
        .attr("stroke-width","1")
        .attr("stroke-opacity","0.2")
        .on('mouseover', options.on_mouseover)
        .on('mouseout', options.on_mouseout)
        .on('mousedown', options.on_mousedown)
        .on('mouseup', options.on_mouseup)
        .on('touchstart', options.on_touchstart)
        .on('touchend', options.on_touchend)
        .on('click', options.on_click);

        // 凡例作成
        var legendView = map.append("g")
          .attr("class", "legendQuant")
          .style("font", '12px "Noto Sans CJK JP" Arial')
          .attr("transform", "translate(20,90)");
        if(options.show_legend && options.color_scale){
          update_legend(legendView, options);
        }

        // 保存ボタンを作成
        if(!isEdge && !isIE && options.save_button){
          $('<button>').text('画像として保存')
            .on('click',　function (){
              var width = options.ref_size.width * 2;
              var height = options.ref_size.height * 2;
              var proxy_canvas = $("<canvas>");
              proxy_canvas.attr('style','display:hidden;')
                .attr('width', width)
                .attr('height', height);
              var ctx = proxy_canvas[0].getContext('2d');
              var svg_data = new XMLSerializer().serializeToString(map_container[0][0]);
              var img = "data:image/svg+xml;charset=utf-8;base64," + btoa(unescape(encodeURIComponent(svg_data)));
              var image = new Image();
              image.onload = function(){
                ctx.fillStyle = '#fff';
                ctx.fillRect(0,0,width,height);
                ctx.drawImage(image, 0, 0);
                var downloader = $("<a>").attr('style','display:hidden')
                  .attr('type','application/octet-stream')
                  .attr('href', proxy_canvas[0].toDataURL("image/png"))
                  .text('download')
                  .attr('download',options.save_filename+'.png')
                  .appendTo('body');
                downloader[0].click();
                proxy_canvas.remove();
                downloader.remove();
              }
              image.src = img;
            })
            .attr('class','btn btn-default')
            .appendTo(selector);
        }

        // 全処理が終了したらcallback呼び出し (即updateしたい場合に用いる)
        if(typeof callback == 'function') callback();

      }
      return(this);
    },
    update : function( input_options ) {
      var options = $(this.selector)[0].japaneseMapOpts;
      options = $.extend(options, input_options);
      d3.select(this.selector).selectAll('path')
      .attr('fill', options.map_filler)
      .on('mouseover', options.on_mouseover)
      .on('mouseout', options.on_mouseout)
      .on('mousedown', options.on_mousedown)
      .on('mouseup', options.on_mouseup)
      .on('touchstart', options.on_touchstart)
      .on('touchend', options.on_touchend)
      .on('click', options.on_click);

      var caption_elems = d3.select(this.selector).select('.japanese_map_caption_container')
        .selectAll('text')
        .text(function(d){return options[d]});

      //  凡例更新
      if(options.show_legend && options.color_scale){
        var legendView = d3.select(this.selector).select("g.legendQuant");
        update_legend(legendView, options);
      }
    },
    update_partial : function(filter, filler){
      d3.select(this.selector).selectAll('path')
      .filter(filter)
      .attr('fill', filler);
    },
    get_commune_def : function(){
        return {communes:$(this.selector)[0].japaneseMapCommunes, id_map:$(this.selector)[0].japaneseMapIdMap};
    }
  };

  $.fn.japaneseMap = function( method ) {
    if ( methods[method] ) {
      return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
    } else if ( typeof method === 'object' || ! method ) {
      return methods.init.apply( this, arguments );
    } else {
      $.error( 'Method ' +  method + ' does not exist on jQuery.japaneseMap' );
    }
  }

})($);
