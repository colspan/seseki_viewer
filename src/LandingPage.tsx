import { geoMercator, geoPath } from 'd3-geo'
import type { Feature, FeatureCollection, Geometry } from 'geojson'
import { useEffect, useMemo, useState } from 'react'
import { feature } from 'topojson-client'
import type { GeometryCollection, Topology } from 'topojson-specification'

import { prefectureDef } from './lib/params'

interface JapanProperties {
  prefecture_jp: string
  prefecture_en: string
  id: number
}

type JapanFeature = Feature<Geometry, JapanProperties>
type JapanFeatureCollection = FeatureCollection<Geometry, JapanProperties>

const HERO_IMAGES = Array.from(
  { length: 12 },
  (_, index) => `./img/demo${String(index + 1).padStart(2, '0')}.jpg`,
)

const FEATURES = [
  {
    image: './img/japan.png',
    title: '47都道府県対応',
    body: '北海道から沖縄まで、日本全国の都道府県に対応しています。都道府県単位または複数の組み合わせで表示できます。',
  },
  {
    image: './img/heatmap.png',
    title: 'ヒートマップ表示',
    body: '入力された統計値をもとに各市町村に自動的に色付けします。',
  },
  {
    image: './img/caption.png',
    title: '市町村名表示',
    body: '地図上の区画やランキングの市町村名をマウスでポイントすると、対応する市町村名が表示されます。',
  },
  {
    image: './img/column_selector.png',
    title: '項目選択',
    body: '入力されたCSVファイルの表示対象列を、画面上部のセレクタから簡単に切り替えられます。',
  },
  {
    image: './img/ranking.png',
    title: 'ランキング表示',
    body: '選んだ項目における市町村ランキングが自動的に表示されます。',
  },
  {
    image: './img/record_viewer.png',
    title: '個別詳細表示',
    body: '地図上の区画やランキングをクリックすると、その市町村の統計値を一覧できます。',
  },
]

const SAMPLES = [
  {
    href: './seseki.html?areas=11,12,13,14&example=examples/11-14_around_tokyo_population_analysis.csv',
    image: './img/sample_around_tokyo.png',
    title:
      '住民基本台帳に基づく人口、人口動態及び世帯数（平成27年1月1日現在、東京都、神奈川県、埼玉県、千葉県）',
    credit: '総務省 / 住民基本台帳に基づく人口、人口動態及び世帯数',
    creditUrl: 'https://www.soumu.go.jp/menu_news/s-news/01gyosei02_03000062.html',
    csv: 'examples/11-14_around_tokyo_population_analysis.csv',
  },
  {
    href: './seseki.html?areas=01&example=examples/01_01_population_analysis.csv',
    image: './img/sample_hokkaido.png',
    title: '住民基本台帳人口・世帯数及び人口動態',
    credit: 'CC BY 2.1 JP 北海道',
    creditUrl: 'https://www.pref.hokkaido.lg.jp/ss/scs/gyousei/shityousondata.htm',
    csv: 'examples/01_01_population_analysis.csv',
  },
]

function PrefectureMap({
  prefecture,
  size = 120,
}: {
  prefecture: JapanFeature
  size?: number
}) {
  const pathData = useMemo(() => {
    const projection = geoMercator().fitSize([size, size], prefecture)
    return geoPath(projection)(prefecture) ?? ''
  }, [prefecture, size])

  return (
    <svg
      width="100%"
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label={prefecture.properties.prefecture_jp}
    >
      <path d={pathData} />
    </svg>
  )
}

function JapanSelectorMap({ japan }: { japan: JapanFeatureCollection }) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const paths = useMemo(() => {
    const projection = geoMercator().fitSize([760, 560], japan)
    const path = geoPath(projection)

    return japan.features.map((prefecture) => ({
      id: String(prefecture.properties.id).padStart(2, '0'),
      name: prefecture.properties.prefecture_jp,
      path: path(prefecture) ?? '',
    }))
  }, [japan])

  const toggle = (id: string) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((selectedId) => selectedId !== id)
        : [...current, id],
    )
  }

  const href =
    selectedIds.length > 0
      ? `./seseki.html?areas=${selectedIds.join(',')}`
      : './seseki.html'

  return (
    <div className="japan-selector">
      <svg viewBox="0 0 760 560" role="img" aria-label="都道府県選択マップ">
        {paths.map((prefecture) => (
          <path
            key={prefecture.id}
            d={prefecture.path}
            className={selectedIds.includes(prefecture.id) ? 'selected' : undefined}
            onClick={() => toggle(prefecture.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                toggle(prefecture.id)
              }
            }}
          >
            <title>{prefecture.name}</title>
          </path>
        ))}
      </svg>

      <div className="japan-selector-actions">
        <a className="button primary" href={href}>
          上記の組み合わせで開く
        </a>
        {selectedIds.length > 0 && (
          <button
            type="button"
            className="button secondary"
            onClick={() => setSelectedIds([])}
          >
            選択を解除
          </button>
        )}
        <span className="selection-count">
          {selectedIds.length > 0
            ? `${selectedIds.length} 都道府県を選択中`
            : '地図をクリックして都道府県を選択'}
        </span>
      </div>
    </div>
  )
}

export default function Landing() {
  const [japan, setJapan] = useState<JapanFeatureCollection | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [heroIndex, setHeroIndex] = useState(0)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setHeroIndex((current) => (current + 1) % HERO_IMAGES.length)
    }, 5000)

    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    const controller = new AbortController()

    const loadJapan = async () => {
      try {
        const response = await fetch('./data/japan_topo.json', {
          signal: controller.signal,
        })
        if (!response.ok) {
          throw new Error(`Failed to load Japan map: ${response.status}`)
        }

        const topology = (await response.json()) as Topology
        const objectName = Object.keys(topology.objects)[0]
        const topologyObject = topology.objects[objectName] as GeometryCollection
        const collection = feature(
          topology,
          topologyObject,
        ) as unknown as JapanFeatureCollection

        setJapan(collection)
      } catch (loadError) {
        if (loadError instanceof Error && loadError.name === 'AbortError') {
          return
        }

        setError(loadError instanceof Error ? loadError.message : String(loadError))
      }
    }

    void loadJapan()
    return () => controller.abort()
  }, [])

  const featureById = useMemo(() => {
    const map = new Map<string, JapanFeature>()

    japan?.features.forEach((prefecture) => {
      map.set(String(prefecture.properties.id).padStart(2, '0'), prefecture)
    })

    return map
  }, [japan])

  return (
    <div className="landing">
      <header className="landing-nav">
        <div className="landing-nav-inner">
          <a className="landing-brand" href="./index.html">
            Seseki Viewer
          </a>
          <nav>
            <a href="#features">機能</a>
            <a href="#samples">サンプル</a>
            <a href="#prefectures">都道府県から選ぶ</a>
            <a href="https://github.com/colspan/seseki_viewer">GitHub</a>
          </nav>
        </div>
      </header>

      <section
        className="hero"
        style={{
          backgroundImage: `linear-gradient(90deg, rgb(13 71 161 / 88%), rgb(13 71 161 / 35%)), url(${HERO_IMAGES[heroIndex]})`,
        }}
      >
        <div className="hero-content">
          <p className="hero-kicker">Seseki 市町村単位統計データ閲覧アプリ</p>
          <h1>
            統計データを通して
            <br />
            私が住む都道府県を知る
          </h1>
          <p className="hero-lead">
            市町村単位で集計されたCSV形式の統計データを、地図のヒートマップとランキングで簡便に可視化できます。
          </p>
          <div className="hero-actions">
            <a className="button primary" href="./seseki.html">
              Seseki Viewer を開く
            </a>
            <a className="button ghost" href="#samples">
              サンプルデータを見る
            </a>
          </div>
        </div>

        <div className="hero-dots" aria-label="背景画像の切り替え">
          {HERO_IMAGES.map((image, index) => (
            <button
              key={image}
              type="button"
              className={index === heroIndex ? 'active' : undefined}
              aria-label={`背景画像 ${index + 1}`}
              onClick={() => setHeroIndex(index)}
            />
          ))}
        </div>
      </section>

      <main>
        <section id="features" className="section">
          <div className="section-heading">
            <h2>主な機能</h2>
            <p>CSVを読み込むだけで、市町村単位の統計データを探索できます。</p>
          </div>

          <div className="feature-grid">
            {FEATURES.map((item) => (
              <article key={item.title} className="feature-card">
                <img src={item.image} alt="" loading="lazy" />
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="samples" className="section section-alt">
          <div className="section-heading">
            <h2>サンプルデータ（動作例）</h2>
            <p>クリックすると、サンプルデータを読み込んだ状態でSesekiが起動します。</p>
          </div>

          <div className="sample-grid">
            {SAMPLES.map((sample) => (
              <article key={sample.href} className="sample-card">
                <a href={sample.href}>
                  <img src={sample.image} alt={sample.title} loading="lazy" />
                </a>
                <h3>
                  <a href={sample.href}>{sample.title}</a>
                </h3>
                <p className="sample-credit">
                  <a href={sample.creditUrl}>{sample.credit}</a>
                  {' / '}
                  <a href={sample.csv}>Seseki対応CSV</a>
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="section-heading">
            <h2>対応ファイル形式</h2>
            <p>
              事前にExcel等で作成した、行方向に市町村、列方向に項目を並べたCSVファイルを入力できます（UTF-8またはShift-JISに対応）。
            </p>
          </div>

          <div className="format-grid">
            <figure>
              <img
                src="./img/acceptable_format.png"
                alt="CSVファイルの形式"
                loading="lazy"
              />
              <figcaption>1行目に系列名、1列目に市町村名を配置します。</figcaption>
            </figure>

            <div className="input-methods">
              <figure>
                <img
                  src="./img/file_input_dialog.png"
                  alt="ファイル入力ダイアログ"
                  loading="lazy"
                />
                <figcaption>ファイル入力ダイアログボックス</figcaption>
              </figure>
              <figure>
                <img
                  src="./img/spreadsheet.png"
                  alt="内蔵スプレッドシート"
                  loading="lazy"
                />
                <figcaption>内蔵スプレッドシート</figcaption>
              </figure>
            </div>
          </div>
        </section>

        <section id="prefectures" className="section section-alt">
          <div className="section-heading">
            <h2>都道府県から選ぶ</h2>
            <p>調べたい都道府県を選択してSesekiを起動できます。</p>
          </div>

          {error && <p className="error">{error}</p>}

          <div className="prefecture-grid">
            {prefectureDef.map((prefecture) => {
              const mapFeature = featureById.get(prefecture.id)

              return (
                <a
                  key={prefecture.id}
                  className="prefecture-card"
                  href={`./seseki.html?areas=${prefecture.id}`}
                >
                  {mapFeature ? (
                    <PrefectureMap prefecture={mapFeature} />
                  ) : (
                    <div className="prefecture-placeholder" />
                  )}
                  <span>{prefecture.prefecture_jp}</span>
                </a>
              )
            })}
          </div>

          <div className="section-heading compact">
            <h2>複数の都道府県を組み合わせる</h2>
            <p>
              地図から複数の都道府県を選択し、「上記の組み合わせで開く」をクリックしてください。
            </p>
          </div>

          {japan ? (
            <JapanSelectorMap japan={japan} />
          ) : (
            !error && <p className="loading-text">日本地図を読み込み中...</p>
          )}
        </section>
      </main>

      <footer className="landing-footer">
        <p>アプリケーション : &copy; Kunihiko Miyoshi 2016, 2017. MIT License.</p>
        <p>
          可視化結果 :{' '}
          <a rel="license" href="https://creativecommons.org/licenses/by-nc-sa/4.0/">
            Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
            License
          </a>
        </p>
      </footer>
    </div>
  )
}
