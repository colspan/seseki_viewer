
require('d3-svg-legend');
var $ = window.jQuery = require('jquery'); /* materialize-cssのバグ対策 https://github.com/Dogfalo/materialize/issues/1229 */
require('materialize-css/dist/js/materialize.js');
require('materialize-css/bin/materialize.css')
var Handsontable = require('handsontable/dist/handsontable.full');
require('handsontable/dist/handsontable.full.css');
var Encoding = require('encoding-japanese');

require('./common');
require('./heatmap');
require('./common.css');

$(document).ready(function(){
  var initialized = false;
  var map_elem = $('<div>');
  var new_id = 'map';
  var tip_elem = $('<div>');
  var modal_table_elem = $('<table>');
  var data = {};
  var data_array;
  var csv_keys = [];
  var communes;

  var ua = navigator.userAgent; // ユーザーエージェントを代入
  var isIE = false;
  if (ua.match("MSIE") || ua.match("Trident")) {
    isIE = true;
  }

  // 起動
  d3.json('params/communes.json', function(d){
    communes = d;
    csv_viewer([]);
  })

  function clear_data(){
    data = {};
    data_array = [];
    csv_keys = [];
  }
  function csv_viewer(d){
    if(!initialized){
      initialize(d);
      initialized = true;
    }
    update(d);

    function initialize(d){
      // ヒートマップ描画
      map_elem.attr('id', new_id);
      $('#map_container').append(map_elem);

      // 列選択ボタン作成
      d3.select('#map_datatype_selector')
      .append('select')
      .attr('class','browser-default')
      .attr('style','margin:9px 20px 0 -10px; display: inline;color:#0d47a1;')
      .on('change', function () {
        draw_map(this.value);
      })
      .selectAll('option')
      .data([])
      .enter()
      .append('option')
      .html(function(d){return d});

      // 北海道地図描画
      $('#'+new_id).hokkaidoHeatmap({title:'',subtitle:'',subsubtitle:'',max_width:800},function(){init_sample();}); // TODO 一時的な対応

      // tip作成
      tip_elem.attr('class', 'card-panel')
      .css('width', '180px')
      .css('height', '48px')
      .css('padding', '10px')
      .css('position', 'absolute')
      .css('visibility', 'hidden')
      .css('font-size', '14pt')
      .appendTo('body');

      // modal作成
      modal_table_elem.attr('class','table bordered striped highlight');
      $("#modal_commune_data").append(modal_table_elem);

    }
    function update(d){
      if(!d.length){
        console.log("No Records");
        Materialize.toast('CSVファイルを入力してください。', 3000);
        clear_data();
        return;
      }
      csv_keys = Object.keys(d[0]);
      if(csv_keys.length<2){
        console.log("Too Few Columns");
        Materialize.toast('CSVファイル(2列以上のデータ)を入力してください。', 3000);
        clear_data();
        return;
      }
      data_array = d;
      data = {};
      // データアクセスを容易にするために自治体名でObject作成
      d.forEach(function(x){
        var commune_name = x[csv_keys[0]]; // 1列目は自治体名(制約)
        if(commune_name.length<2) return; // 文字列が短過ぎたらスキップ
        data[commune_name] = x;
      });
      // タイトル更新
      $('#report_title').text(csv_keys[0]);

      // 地図更新
      draw_map(csv_keys[1]);

      // 列選択ボタン作成
      var options = d3.select('#map_datatype_selector')
      .select('select')
      .selectAll('option')
      .data(csv_keys.slice(1));
      options.enter().append('option');
      options.exit().remove();
      options.html(function(d){return d});
    }
    // 描画関数
    function draw_map(key){
      var get_value = function(x){
        try{
          var value;
          value = x[key];
          return isNaN(+value) ? value : +value;
        }
        catch(e){
          return null;
        }
      }
      var format = function(x){
        if(isNaN(x)) return x;
        var format_str = (+x%1===0 && +x%1===0? ',.0f' : '0.4f' );
        return d3.format(format_str)(x);
      }

      // max,minを算出
      data_array.sort(function(a,b){return d3.descending(get_value(a),get_value(b));});
      var max = d3.max(data_array, get_value);
      var min = d3.min(data_array, get_value);
      var domain, range;
      if(min < 0 && max < 0){
        domain = [min,max];
        range = ["white", "#ff5722"];
      }
      else if(min < 0 && max >= 0){
        if(get_value(data_array[1])>0&&get_value(data_array[0])/get_value(data_array[1]) > 3.0){
          // 1位と2位の比率が5倍を超えるとき
          domain = [min,0,get_value(data_array[1]),get_value(data_array[0])];
          range = ["#03a9f4", "white", "#ff5722", "#dd2c00"];
        }
        else{
          domain = [min,0,max];
          range = ["#03a9f4", "white", "#ff5722"];
        }
      }
      else { // (min >= 0 && max >= 0)
        if(get_value(data_array[1])>0&&get_value(data_array[0])/get_value(data_array[1]) > 3.0){
          // 1位と2位の比率が5倍を超えるとき
          domain = [0,get_value(data_array[1]),get_value(data_array[0])];
          range = ["white", "#ff5722", "#dd2c00"];
        }
        else{
          domain = [0,max];
          range = ["white", "#ff5722"];
        }
      }
      // domain正規化
      var norm_domain = [];
      domain.forEach(function(v){
        if(v==0){
          norm_domain.push(v);
          return;
        }
        var abs_v = Math.abs(v);
        var digits = Math.floor(Math.log(abs_v)/Math.log(10));
        var new_v = Math.floor(abs_v/Math.pow(10,digits-1)+1)*Math.pow(10,digits-1);
        norm_domain.push(v>0?new_v:-new_v);
      });
      domain = norm_domain;

      // color_scale作成
      var color_scale = d3.scale.linear().domain(domain).range(range);
      // title作成
      var titles = key.replace(/\)/g,'').split('(');
      // ヒートマップのパラメタ生成
      // click時の動作
      var last_touched = null;
      var click = function(d){
        if(last_touched) d3.select(last_touched.elem).attr('fill', '#ffff00');
        $("#modal_commune_name").html('<a href="tourism_stat_commune.html#'+d.name+'" target="_new">'+d.name+'</a>');
        // データ取得
        var row = data[d.name];
        var items = [];
        var i = 0;
        for(var c in row){
          i++;
          if(i==1) continue;
          items.push({key:c,value:format(row[c])})
        }
        // table作成
        var th = $('<tr>')
        .append('<th>項目</th>')
        .append('<th>値</th>')
        modal_table_elem.html('');
        modal_table_elem.append($('<thead>').append(th));
        var tbody = $('<tbody>');
        for (var item in items) {
            var td = $('<tr' + (items[item].key==key?' style="background:#eeee00;"':'') + '>')
            .append('<td>' + items[item].key + '</td>')
            .append('<td style="text-align:right;">' + items[item].value + '</td>')
            tbody.append(td);
        }
        modal_table_elem.append(tbody);
        $("#myModal").openModal({in_duration:0,out_duration:0});
      }
      // touch & over時の動作
      var mouseover = function(x){
        var pos;
        var commune = x.name;
        // 座標取得
        if(d3.event.targetTouches){// touch
          d3.event.preventDefault();
          pos = {x:d3.event.targetTouches[0].pageX, y:d3.event.targetTouches[0].pageY};
          if(last_touched && last_touched.elem == this){
            click(x);
          }
        }
        else{
          if(isIE) pos = {x:d3.event.x,y:d3.event.y};
          else pos = {x:$(window).scrollLeft() + d3.event.x,y:$(window).scrollTop() + d3.event.y};
        }
        // 元に戻す
        if(last_touched) d3.select(last_touched.elem).attr('fill', last_touched.color);
        last_touched = {elem:this, color:options.map_filler(x)};
        // 色塗替え
        d3.select(this).attr('fill', '#dddd00');
        // tip更新
        tip_elem.css('top' , pos.y+'px');
        tip_elem.css('left', pos.x+'px');
        tip_elem.css('visibility', 'visible');
        tip_elem.html('<span>' + commune + ' <span class="badge">' + format(get_value(data[commune])) + '</span>'  );
      }
      var options = {
        title : titles[0],
        subtitle : titles[1]?titles[1]:'',
        subsubtitle : titles[2]?titles[2]:'',
        auto_resize : true,
        show_legend : true,
        color_scale : color_scale,
        save_filename : titles.join('-'),
        map_filler:function(x){
          if(!data[x.name]) return "#888";
          return color_scale(get_value(data[x.name]));
        },
        on_mouseover : function(d){
          d3.select(this).attr('fill', '#dddd00');
          tip_elem.css('top' , $(window).scrollTop() + d3.event.y+'px');
          tip_elem.css('left', $(window).scrollLeft() + d3.event.x+'px');
          tip_elem.css('visibility', 'visible');
          tip_elem.html('<span>' + d.name + ' <span class="badge">' + format(get_value(data[d.name])) + '</span>'  );
        },
        on_mouseover : mouseover,
        on_mouseout  : function(x){
          d3.select(this).attr('fill', options.map_filler);
          tip_elem.css('visibility', 'hidden');
        },
        on_mousedown : click,
        on_touchstart : mouseover
      };
      $('#'+new_id).hokkaidoHeatmap('update', options);

      // ランキング表示
      var items = [];
      data_array.forEach(function(x){
        var commune_name = x[csv_keys[0]]; // 1列目は自治体名(制約)
        var value = isNaN(+x[key]) ? x[key] : +x[key];
        if(commune_name.length<2) return; // 文字列が短過ぎたらスキップ
        items.push({key:commune_name, value:value});
      });
      //// ソート
      items.sort(function(a,b){
      if( a.value > b.value ) return -1;
      if( a.value < b.value ) return 1;
      return 0;})

      // table作成
      var ranking_table_rows = d3.select('#ranking_table')
      .selectAll('tr')
      .data(items);
      ranking_table_rows.enter().append('tr');
      ranking_table_rows.exit().remove();
      ranking_table_rows.style('background-color', function(x){return options.color_scale(x.value)});
      ranking_table_rows.html(function(x,i){
        var html = '<td style="text-align:right;">' + (i+1) + '</td>';
        html +='<td>'+x.key+'</td>';
        html +='<td style="text-align:right;">' + format(x.value) + '</td>';
        return html;
      });
      ranking_table_rows.on('mouseover', function(x){
        $('#map').hokkaidoHeatmap('update_partial', function(y){return y.name==x.key}, function(x){return '#dddd00'});
      })
      .on('mouseout', function(x){
        $('#map').hokkaidoHeatmap('update_partial', function(y){return y.name==x.key}, function(){return options.color_scale(x.value)});
      })
      .on('click', function(x){
        click({name:x.key});
      });
    }
  }

  var input_file = 'instant_data/20151125_population_analysis.csv';
  $('#file_loader').change(function(e){
    var file = e.target.files[0];
    file.type = "text/plain;charset=UTF-8"
    var reader = new FileReader();
    reader.onloadend = function(evt){
      Materialize.toast('ファイル"'+file.name+'"を読み込みました', 3000);
      var input = new Uint8Array(reader.result);
      var data = Encoding.codeToString(Encoding.convert(input, {to:'UNICODE'}));
      csv_viewer(d3.csv.parse(data));
      // サンプルローダーを初期化
      $("#sample_data_selector").val("");
      $("#data-info").css("visibility", "hidden");
    }
    reader.readAsArrayBuffer(file);
  });

  function init_sample(){
    // サンプルデータ一覧更新
    d3.json('params/sample_data.json',function(d){
      function get_by_filename(k){var i;for(i=0;i<d.length;i++){if(d[i].file==k) return d[i];}return null;}
      function load_sample(filename){
        // サンプルファイルの説明を表示
        $("#data-info").css("visibility", "visible");
        var data_info = get_by_filename(filename);
        $("#data-description").html(data_info.file_description);
        $("#data-title").html(data_info.title);
        $("#data-url").html(data_info.right_holder).attr("href", data_info.url);
        $("#convertedcsv-url").attr("href", filename);
        // ファイルローダーを初期化
        $("#file_loader").val("");
        $("#file_loader_filename").val("CSVファイルを開く");
        // 読み込み
        d3.xhr(filename)
        .responseType("arraybuffer")
        .response(function(r){
          return new Uint8Array(r.response);
        })
        .get(function(error,d){
          if(error){
            Materialize.toast('ファイルを読み込めませんでした', 3000);
          }
          else{
            var data = Encoding.codeToString(Encoding.convert(d, {to:'UNICODE'}));
            Materialize.toast('ファイルを読み込みました', 3000);
            csv_viewer(d3.csv.parse(data));
          }
        });
      }
      // 列選択ボタン作成
      d3.select('#sample_data_selector')
      .on('change', function (x) {
        load_sample(this.value);
      })
      .selectAll('option')
      .data(d)
      .enter()
      .append('option')
      .attr("value",function(d){return d.file})
      .html(function(d){return d.title});
      // ハッシュにサンプルデータ読み出しが指定されていた場合
      function getHashVars()
      {
          var vars = [], hash;
          var hashes = window.location.href.slice(window.location.href.indexOf('#') + 1).split('&');
          for(var i = 0; i < hashes.length; i++) {
              hash = hashes[i].split('=');
              vars[hash[0]] = hash[1];
          }
          return vars;
      }
      var hashvars = getHashVars();
      if(hashvars.sample && get_by_filename(hashvars.sample)){
        load_sample(hashvars.sample);
      }
    });
  }
  // スプレッドシート
  var spreadsheet_obj;
  function spreadsheet_open(){
    var spreadsheet_elem = document.getElementById('spreadsheet');
    var options = {
      startRows: 30,
      startCols: 200,
      width: "100%",
      height: 500,
      colWidths: 80,
      rowHeights: 23,
      rowHeaders: true,
      colHeaders: true
    };
    spreadsheet_obj = new Handsontable(spreadsheet_elem, options);
    //データを代入
    var input_data = [];
    if(data_array && data_array.length>2){
      // 読み込み済みの場合
      input_data.push(csv_keys);
      $.map(data_array, function(d){
        input_data.push($.map(csv_keys,function(x){return d[x]===null?"":d[x]}));
      });
    }
    else{
      // まだ読み込んでいない場合
      input_data.push(["データの名前","サンプルデータ系列1(説明A)(説明B)","サンプルデータ系列2(説明C)(説明D)","サンプルデータ系列3(説明E)(説明F)"]);
      $.map(communes,function(d,i){
        var r = [d,i,parseInt(Math.random()*1000,10),Math.random()*10-5];
        input_data.push(r);
      });
    }
    spreadsheet_obj.loadData(input_data);
    spreadsheet_obj.alter('insert_col',null,50-input_data[0].length);
  }
  function spreadsheet_close(){
    var data = spreadsheet_obj.getData();
    // 列数を数える
    var min_nullnum = data.length;
    for(var i=0;i<data.length;i++){
      var nullnum = 0;
      for(var j=data[i].length-1;j>=0;j--){
        if(data[i][j]!==null) break;
        nullnum++;
      }
      if(min_nullnum>nullnum) min_nullnum = nullnum;
    }
    // 列数に応じてスプレッドシートを削る
    spreadsheet_obj.alter('remove_col', data[0].length-min_nullnum, min_nullnum);
    // データを再取得
    data = spreadsheet_obj.getData();
    var keys = data[0];//.shift();
    // NULLの列名があったら足す
    for(var i=0;i<keys.length;i++){
      if(keys[i]===null) keys[i] = i+'系列'
    }
    var json = [];
    for(var i=1;i<data.length;i++){
      var r = {};
      $.map(keys,function(x,j){
        r[x] = data[i][j];
      });
      json.push(r);
    }
    Materialize.toast('データを更新しました', 3000);
    csv_viewer(json);
    spreadsheet_obj.destroy();
    // ファイルローダーを初期化
    $("#file_loader").val("");
    $("#file_loader_filename").val("CSVファイルを開く");
    // サンプルローダーを初期化
    $("#sample_data_selector").val("");
    $("#data-info").css("visibility", "hidden");
  }
  $('.modal-trigger').leanModal({
      dismissible: true,
      in_duration: 0,
      out_duration: 0,
      ready: spreadsheet_open,
      complete: spreadsheet_close
    }
  );

});
