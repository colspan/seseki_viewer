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
  function get_size(opt){
    var ref_size = opt.ref_size;
    if(!opt) return ref_size;
    if(!opt.width && !opt.height) return ref_size;
    var new_size = {};
    if(!opt.width || opt.width/opt.height > ref_size.width/ref_size.height){
      new_size.height = opt.height;
      new_size.width  = opt.height / ref_size.height * ref_size.width;
      new_size.scale  = opt.height / ref_size.height * ref_size.scale;
    }
    else{
      //if(opt.max_width) opt.width = opt.width > opt.max_width ? opt.max_width : opt.width;
      new_size.width  = opt.width;
      new_size.height = opt.width / ref_size.width * ref_size.height;
      new_size.scale  = opt.width / ref_size.width * ref_size.scale;
    }
    return new_size;
  }
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
  var geodata_topo = {};
  var geodata_store = {};
  var methods = {
    init : function(option, callback){
      var _this = this;
      var defaults = {
        geodata_file : 'data/00_hokkaido_topo.json',
        geodata_fieldname : 'hokkaido', // topojsonのフィールド名
        ref_size : {
          width :  420,
          height:  330,
          scale : 3200
        },
        exceptions:["色丹郡色丹村","国後郡泊村","国後郡留夜別村","択捉郡留別村","紗那郡紗那村","蘂取郡蘂取村"],
        title : 'title',
        subtitle : 'subtitle',
        subsubtitle : 'subsubtitle',
        caption_sizes : [24,18,18],
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
        auto_resize : true,
        max_width : null,
        save_button : true,
        save_filename : 'heatmap'
      };
      var options = $.extend(defaults,option);
      this[0].hokkaidoHeatmap = options;
      var selector = this.selector;
      var geodata;

      if(geodata_topo[options.geodata_file]){
        // 地図データを読み込み済みだったら即表示
        geodata = geodata_store[options.geodata_file];
        display();
      }
      else{
        // 地図データを読み込んでいなければ読み込み
        d3.json(options.geodata_file, load_finished);
      }

      function load_finished(error, loaded){
        geodata_topo[options.geodata_file] = loaded;
        // TopoJSONデータ展開
        geodata = topojson.feature(geodata_topo[options.geodata_file], geodata_topo[options.geodata_file].objects[options.geodata_fieldname]);
        var exception_communes = options.exceptions; // 対象外の市町村
        var remove_list = [];
        geodata.features.forEach(function(d,i){
          d.commune_id = +d.properties.N03_007; // IDを代入
          d.name = '';
          if(d.properties.N03_003) d.name += d.properties.N03_003;
          if(d.properties.N03_004) d.name += d.properties.N03_004;
          if(exception_communes.indexOf(d.name) != -1){
            remove_list.unshift(i);
          }
        });
        // 対象外の市町村を削除
        remove_list.forEach(function(d){
          geodata.features.splice(d,1);
        });
        geodata_store[options.geodata_file] = geodata;
        display();
      }
      function display(){
        var projection, path;

        options.geodata = geodata;

        // svg要素を作成し、データの受け皿となるg要素を追加
        var size;
        if( !options.width && !options.height ){
          // 条件無指定の時は現在の枠の横幅に合わせる
          size = get_size({
            ref_size: options.ref_size,
            width: _this[0].offsetWidth,
            height: _this[0].offsetWidth
          });
        }
        else {
          size = get_size(options);
        }
        var map_container = d3.select(selector).append('svg')
        .attr('width', size.width)
        .attr('height', size.height);
        var map = map_container.append('g');

        // Caption
        var caption_container = map_container.append('g').attr('class','hokkaidoHeatmap_caption_container');
        caption_container.selectAll('text')
          .data(captions)
          .enter()
          .append('text')
          .style('font',function(d,i){return options.caption_sizes[i]+'px "Noto Sans CJK JP" Arial'})
          .attr('x',5)
          .attr('y',function(d,i){var y=0;for(var j=0;j<=i;j++){y+=options.caption_sizes[j]+5}return y})
          .text(function(d){return options[d]});

        // 投影を処理する関数を用意した上でデータからSVGのPATHに変換
        projection = d3.geo.mercator()
        .scale(size.scale)
        .center(d3.geo.centroid(geodata))  // データから中心点を計算
        .translate([size.width / 2, size.height / 2]);

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
        // 自動で大きさ変更
        if(options.auto_resize){
          $(window).on('load resize', function(){$(_this.selector).hokkaidoHeatmap('resize');});
        }

        // 保存ボタンを作成
        if(!isEdge && !isIE && options.save_button){
          $('<button>').text('画像として保存')
            .on('click',　function (){
              var width = map_container[0][0].offsetWidth;
              var height = map_container[0][0].offsetHeight;
              var proxy_canvas = $("<canvas>");
              console.log(map_container);
              proxy_canvas.attr('style','display:hidden;')
                .attr('width', width)
                .attr('height', height);
              var ctx = proxy_canvas[0].getContext('2d');
              //map_container.attr('viewBox', '0 0 '+size.width+' '+size.height);
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
      var options = $(this.selector)[0].hokkaidoHeatmap;
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

      var caption_elems = d3.select(this.selector).select('.hokkaidoHeatmap_caption_container')
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
    resize : function( opt ){
      if(!opt){
        //  条件無指定の時は横幅に合わせて表示
        opt = {
          ref_size:this[0].hokkaidoHeatmap.ref_size,
          width: this[0].offsetWidth,
          height: this[0].offsetWidth
        };
      }
      var size = get_size(opt);
      var map = d3.select(this.selector).select('svg')
      .attr('width', size.width)
      .attr('height', size.height);
      // 投影を処理する関数を用意した上でデータからSVGのPATHに変換
      projection = d3.geo.mercator()
      .scale(size.scale)
      .center(d3.geo.centroid(this[0].hokkaidoHeatmap.geodata))  // データから中心点を計算
      .translate([size.width / 2, size.height / 2]);
      // pathジェネレータ関数
      path = d3.geo.path().projection(projection);
      map.selectAll('path').attr('d', path);
    }
  };

  $.fn.hokkaidoHeatmap = function( method ) {
    if ( methods[method] ) {
      return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
    } else if ( typeof method === 'object' || ! method ) {
      return methods.init.apply( this, arguments );
    } else {
      $.error( 'Method ' +  method + ' does not exist on jQuery.hokkaidoHeatmap' );
    }
  }

})($);

/*
var options = {
  map_filler:function(d){
    var ratio = parseInt(Math.random()*100,10);
    return "hsl(220,100%,"+ratio+"%)";
  },
  target_year : 2015
};
$('#map').hokkaidoHeatmap();
*/
/*setTimeout(function delayed(){
  $('#map').hokkaidoHeatmap('update', options);
}, 5000);*/
/*d3.json(
  'data/stat_2014.json',
  function(error,d){
    var options = {
      map_filler:function(x){
        try{
          return color_generator(d.sum[x.name].sum, 13400000);
        }
        catch(e){
          return '#fff';
        }
      }
    };
    $('#map').hokkaidoHeatmap('update', options);
  }
);

setTimeout(function(){$('#map').hokkaidoHeatmap('resize', {width:800});},3000);


*/
