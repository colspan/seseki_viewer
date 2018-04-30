# Seseki Viewer

A Statistics Viewer for generating geometry heatmaps and rankings.

[Demo is available at gh-pages](http://colspan.github.io/seseki_viewer).

## Specification of importable CSV format

This application can import a spreadsheet with these requirements.
(untranslated)

 - 1行1列目はデータの題名を格納する
 - 1行1市町村でデータを列挙する
 - 1列目は179市町村名を格納する(順不同可、重複時は最も下の行優先)
 - 1行目には系列名を格納する。半角括弧で囲われた文言はヒートマップ上に最大2行重畳表示される。
 - ファイル入力ダイアログボックスからCSVファイルを入力する場合は、文字コードはShift-JISまたはUTF-8とする(文字化けする際はUTF-8に変換して入力してください)
 - ファイルをCSVビューアに入力する

## References

### Geometry Databases

 - [国土数値情報　行政区域データ](http://nlftp.mlit.go.jp/ksj/gml/datalist/KsjTmplt-N03.html)

### Statistics

Original Statistics dataset are available at under URLs.

 - [北海道庁 市町村別人口、世帯数(CC BY 2.1 JP)](http://www.pref.hokkaido.lg.jp/ss/scs/gyousei/shityousondata.htm)
 - [北海道農政事務所統計部 市町村別耕地面積(平成23年)](http://www.maff.go.jp/hokkaido/press/toukei/kikaku/pdf/h23kouti_sichoson.pdf)
 - [独立行政法人家畜改良センター 市区町村別飼養頭数・飼養施設数](https://www.id.nlbc.go.jp/data/toukei.html)

## Awards

 - [アーバンデータチャレンジ2015 ファイナル アプリケーション部門 金賞](http://urbandata-challenge.jp/2015/prize) ([Slide](http://www.slideshare.net/colspan/udc2015-final-seseki))

## Development

```bash
yarn install
yarn start # for webpack-dev-server
yarn build # for test build
yarn build_production # for production build
```

## License (Software)

MIT License

## License (Visualized Result)

### English

<a rel="license" href="http://creativecommons.org/licenses/by-nc-sa/4.0/"><img alt="Creative Commons License" style="border-width:0" src="https://i.creativecommons.org/l/by-nc-sa/4.0/88x31.png" /></a><br /><span xmlns:dct="http://purl.org/dc/terms/" property="dct:title">Seseki Viewer</span> by <a xmlns:cc="http://creativecommons.org/ns#" href="https://github.com/colspan/seseki_viewer" property="cc:attributionName" rel="cc:attributionURL">Kunihiko Miyoshi</a> is licensed under a <a rel="license" href="http://creativecommons.org/licenses/by-nc-sa/4.0/">Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License</a>.

### 日本語

<a rel="license" href="http://creativecommons.org/licenses/by-nc-sa/4.0/"><img alt="クリエイティブ・コモンズ・ライセンス" style="border-width:0" src="https://i.creativecommons.org/l/by-nc-sa/4.0/88x31.png" /></a><br /><a xmlns:cc="http://creativecommons.org/ns#" href="https://github.com/colspan/seseki_viewer" property="cc:attributionName" rel="cc:attributionURL">Kunihiko Miyoshi</a> 作『<span xmlns:dct="http://purl.org/dc/terms/" property="dct:title">Seseki Viewer</span>』は<a rel="license" href="http://creativecommons.org/licenses/by-nc-sa/4.0/">クリエイティブ・コモンズ 表示 - 非営利 - 継承 4.0 国際 ライセンス</a>で提供されています。
