import * as d3 from "d3"

export default class GeoStatisticalData {
  constructor(inputData, idMap, communes) {
    this.data = {} // 自治体コードがキーの辞書
    this.dataMultiIds = {} // 政令指定都市向け辞書
    this.idMap = idMap
    this.communes = communes
    this.csvKeys = Object.keys(inputData[0])
    if (this.csvKeys.length < 2) {
      throw "Too Few Columns"
    }

    // 値の代入
    this.dataArray = []
    inputData.forEach((x) => {
      const communeName = x[this.csvKeys[0]] // 1列目は自治体名(制約)
      if (communeName == null || communeName.length < 2) return // 文字列が短過ぎたらスキップ
      const communeIds = this.idMap[communeName] // 自治体IDを取得
      if (!communeIds) return // 対応するIDが見つからない場合はスキップ
      this.dataArray.push(x) // データ格納変数に代入
      communeIds.forEach((i) => {
        // データ辞書に代入
        this.data[i] = x
      })
      if (communeIds.length > 1) this.dataMultiIds[communeName] = x // 政令指定都市データを代入
    })

    // 各カラムの型の推定
    // TODO
  }
  getByColumnName(columnName) {
    const dataArray = this.dataArray
    const getValue = function (x) {
      try {
        let value = x[columnName]
        if (typeof value == "string") {
          if (
            value.match(/^(|-)([0-9]{1,3},)([0-9]{3},)*[0-9]{3}(|\.[0-9]+)$/)
          ) {
            // カンマ区切りの数値ならば
            value = parseFloat(value.replace(",", ""))
          } else if (value && value.match(/^(|-)[0-9]+(|\.[0-9]+)$/)) {
            // 数値ならば
            value = parseFloat(value)
          }
        }
        return value
      } catch (e) {
        // データが無いならば
        return null
      }
    }
    const format = function (x) {
      if (isNaN(x)) return x
      const formatStr = +x % 1 === 0 && +x % 1 === 0 ? ",.0f" : "0.4f"
      return d3.format(formatStr)(x)
    }
    // max,minを算出
    dataArray.sort((a, b) => {
      return d3.descending(getValue(a), getValue(b))
    })
    const max = d3.max(dataArray, getValue)
    const min = d3.min(dataArray, getValue)
    let domain, range
    if (min < 0 && max < 0) {
      domain = [min, max]
      range = ["white", "#ff5722"]
    } else if (min < 0 && max >= 0) {
      if (
        getValue(dataArray[1]) > 0 &&
        getValue(dataArray[0]) / getValue(dataArray[1]) > 3.0
      ) {
        // 1位と2位の比率が3倍を超えるとき
        domain = [min, 0, getValue(dataArray[1]), getValue(dataArray[0])]
        range = ["#03a9f4", "white", "#ff5722", "#dd2c00"]
      } else {
        domain = [min, 0, max]
        range = ["#03a9f4", "white", "#ff5722"]
      }
    } else {
      // (min >= 0 && max >= 0)
      if (
        getValue(dataArray[1]) > 0 &&
        getValue(dataArray[0]) / getValue(dataArray[1]) > 3.0
      ) {
        // 1位と2位の比率が3倍を超えるとき
        domain = [0, getValue(dataArray[1]), getValue(dataArray[0])]
        range = ["white", "#ff5722", "#dd2c00"]
      } else {
        domain = [0, max]
        range = ["white", "#ff5722"]
      }
    }
    // domainを切りのいい数字に正規化する
    const normDomain = []
    domain.forEach((v) => {
      if (v == 0) {
        normDomain.push(v)
        return
      }
      const abs_v = Math.abs(v)
      const digits = Math.floor(Math.log(abs_v) / Math.log(10))
      const new_v =
        Math.floor(abs_v / Math.pow(10, digits - 1) + 1) *
        Math.pow(10, digits - 1)
      normDomain.push(v > 0 ? new_v : -new_v)
    })
    domain = normDomain

    // colorScale作成
    const colorScale = d3.scaleLinear().domain(domain).range(range)

    // 値をパースして取得
    const parsedData = {}
    Object.keys(this.data).forEach((id) => {
      parsedData[id] = getValue(this.data[id])
    })

    return {
      parsedData,
      dataArray,
      columnName,
      colorScale,
      domain,
      range,
      normDomain,
      format,
      getValue
    }
  }
  clearData() {
    this.data = {}
    this.dataArray = []
    this.csvKeys = []
  }
  getFormatExpr(x) {
    if (isNaN(x)) return null
    else return +x % 1 === 0 && +x % 1 === 0 ? ",.0f" : "0.4f"
  }
}
