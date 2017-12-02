import * as d3 from "d3"
import * as topojson from "topojson"

export default class geoJsonLoader {
  constructor(options) {
    const defaults = {
      geoJsonFiles: [],
      exceptions: [
        "色丹郡色丹村",
        "国後郡泊村",
        "国後郡留夜別村",
        "択捉郡留別村",
        "紗那郡紗那村",
        "蘂取郡蘂取村",
        "所属未定地"
      ]
    }
    this.options = Object.assign(defaults, options)
  }
  getLoader() {
    const self = this

    // 複数ファイルを非同期読み込み
    const promises = []
    this.options.geoJsonFiles.forEach((d) => {
      const p = new Promise((resolve, reject) => {
        // 読み込み処理
        d3.json(d, (error, loaded) => {
          if (error) {
            reject(error)
            return
          }
          // TopoJSONデータ展開
          const geodataFieldname = Object.keys(loaded.objects)[0]
          const geoJson = topojson.feature(
            loaded,
            loaded.objects[geodataFieldname]
          )
          const communes = []
          const exceptionCommunes = self.options.exceptions // 対象外の市町村
          const removeList = []
          const idMap = {}
          const idToCommune = {}

          function register(k, v) {
            if (!idMap[k]) idMap[k] = []
            if (idMap[k].indexOf(v) == -1) idMap[k].push(v)
          }
          geoJson.features.forEach((d, i) => {
            // 国土数値情報 行政区域データ向けのパーサ

            if (d.properties.N03_007 == "") return // 所属未定地等IDがないものは飛ばす

            // 市町村名を整理する
            d.communeId = +d.properties.N03_007 // IDを代入
            d.prefecture = d.properties.N03_001
            d.name = ""
            if (d.properties.N03_003) d.name += d.properties.N03_003
            if (d.properties.N03_004) d.name += d.properties.N03_004

            if (exceptionCommunes.indexOf(d.name) != -1) {
              // 除外リストに存在すれば削除フラグを付与する
              removeList.unshift(i)
            } else {
              // 除外リストになければ市町村一覧に追加
              if (communes.indexOf(d.name) == -1) communes.push(d.name)
            }

            // CSVの市町村名から白地図のIDに変換するmapを自動生成する
            // 政令指定都市 or 郡
            if (d.properties.N03_003) {
              // 政令指定都市または郡単位でひと塗りとする
              register(d.properties.N03_003, d.communeId)
              // 町村・区単位を連結する
              register(d.name, d.communeId)
              // 郡の場合は町村のみにできるようにする
              if (d.properties.N03_003.slice(-1) == "郡") {
                register(d.properties.N03_004, d.communeId)
              }
            }
            // 市
            if (d.properties.N03_004) {
              register(d.properties.N03_004, d.communeId)
            }
          })

          // IDから市町村名に変換する辞書を作成
          geoJson.features.forEach((d) => {
            idToCommune[d.communeId] = d.name
          })

          // 対象外の市町村を削除
          removeList.forEach((d) => {
            geoJson.features.splice(d, 1)
          })

          // 割り切り 同じ市町村名があると区別できない
          resolve({ geoJson, communes, idMap, idToCommune })
        })
      })
      promises.push(p)
    })

    // 処理開始
    let communes = []
    const idMap = {}
    const idToCommune = {}
    this.idMap = {}
    this.idToCommune = {}
    return new Promise((resolve, reject) => {
      Promise.all(promises).then(ready)
      /* 複数のGeoJSONをマージする */
      function ready(results) {
        let geoJson
        results.forEach((d) => {
          if (!geoJson) geoJson = d.geoJson
          else geoJson.features = geoJson.features.concat(d.geoJson.features)
          communes = communes.concat(d.communes)
          Object.keys(d.idMap).forEach((x) => {
            idMap[x] = d.idMap[x]
          })
          Object.keys(d.idToCommune).forEach((x) => {
            idToCommune[x] = d.idToCommune[x]
          })
        })
        self.geoJson = geoJson
        self.communes = communes
        self.idMap = idMap
        self.idToCommune = idToCommune
        resolve(self)
      }
    })
  }
}
