import { format as d3Format } from 'd3-format'

import type { ColorScale } from '../lib/geoStatisticalData'

interface LegendProps {
  colorScale: ColorScale
}

export function Legend({ colorScale }: LegendProps) {
  const domain = colorScale.domain()
  const min = Math.min(...domain)
  const max = Math.max(...domain)
  const formatter = d3Format(
    Number.isInteger(min) && Number.isInteger(max) ? ',.0f' : '0.2f',
  )
  const cells = Array.from({ length: 11 }, (_, index) => {
    const value = min + ((max - min) * index) / 10
    return {
      key: value,
      color: colorScale(value),
    }
  })

  return (
    <div className="map-legend" aria-label="Color legend">
      <div className="legend-cells">
        {cells.map(cell => (
          <span key={cell.key} style={{ background: cell.color }} />
        ))}
      </div>
      <div className="legend-labels">
        <span>{formatter(min)}</span>
        <span>{formatter((min + max) / 2)}</span>
        <span>{formatter(max)}</span>
      </div>
    </div>
  )
}
