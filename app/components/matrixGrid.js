// matrix cells are colored by it's positive/negative value
// Positive: Green, Negative: Purple
import * as React from "react";
import { render } from "react-dom";
import MatrixGridPolygonLayer from "./matrix-grid-polygon-layer";
import DoubleColorTintsLegends from "./legend";
import DeckGL from "@deck.gl/react";
import { OrthographicView } from "@deck.gl/core";
import color from "@deck.gl/core/src/utils/color";
import {
  interpolateColorTints,
  interpolateHexColors,
  flattenDeep,
  arrInRange,
  roundup2ZeroEnds
} from "../utils";

const DEFAULT_CELLL_SIZE = 10;
const DEFAULT_MATRIX_INTERVAL = DEFAULT_CELLL_SIZE;
const positiveColor = "#82ca9d";
const negativeColor = "#8884d8";

// interpolateColorTints(hexcolor)
// calculates the tints from percentage% to 100%
// mapping from 'hexcolor' to white
const positiveColorTints = interpolateColorTints(positiveColor);
const negativeColorTints = interpolateColorTints(negativeColor);
const { parseColor } = color;

const defaultProps = {
  id: "matrixGrid",
  width: null,
  height: null,
  data: [],
  layout: {
    x: 0, //x offset of matrix-grid-layer
    y: 0, //y offset of matrix-grid-layer
    cx: DEFAULT_CELLL_SIZE,
    cy: DEFAULT_CELLL_SIZE,
    dx: DEFAULT_MATRIX_INTERVAL,
    dy: DEFAULT_MATRIX_INTERVAL
  },
  onSelectMatrix: () => {}
};

const glView = new OrthographicView();

const rgb = colorStr => {
  return colorStr
    .slice(4, -1)
    .split(",")
    .map(i => parseInt(i));
};

class MatrixGrid extends React.Component {
  constructor() {
    super();
  }

  legendColors = (cnt, basecolors) => {
    return arrInRange(cnt).map(i =>
      interpolateHexColors(basecolors, 1 - i / cnt || 0.9)
    );
  };

  render() {
    const {
      width,
      height,
      data,
      layout: { x, y, cx, cy, dx, dy },
      onSelectMatrix
    } = this.props;

    if (!data || data.length === 0) {
      return null;
    }

    // // use width to calculate cell size -> cx, cy, dx, dy in layout
    // const matrixInternalNum = data.labels.length - 1;
    // const cellNum = data.labels
    //   .map(mat => mat.bins.length)
    //   .reduce((a, c) => a + c, 0);
    // const cell_size = Math.floor((width - 200) / (matrixInternalNum + cellNum));

    const legendColorNumber = 20;
    const negLegendColors = this.legendColors(
      legendColorNumber,
      negativeColorTints
    );
    const posLegendColors = this.legendColors(
      legendColorNumber,
      positiveColorTints
    );

    let upperMatCellValues = [],
      lowerMatCellValues = [];
    data.matrixGrid.forEach(mat => {
      if (mat.rowIdx >= mat.colIdx) {
        // lower
        lowerMatCellValues = lowerMatCellValues.concat(
          mat.data.map(d => d.cnt)
        );
      } else {
        //upper
        upperMatCellValues = upperMatCellValues.concat(
          mat.data.map(d => d.cnt)
        );
      }
    });

    //upper triangular matrices
    const upperMaxValue = Math.max(...upperMatCellValues);
    const upperMinValue = Math.min(...upperMatCellValues);
    const upperPosBase = upperMaxValue > 0 ? Math.log10(upperMaxValue) : 1;
    const upperNegBase = upperMinValue < 0 ? Math.log10(-upperMinValue) : 1;
    // lower triangular matrices
    const lowerMaxValue = Math.max(...lowerMatCellValues);
    const lowerMinValue = Math.min(...lowerMatCellValues);
    const lowerPosBase =
      lowerMaxValue > 0 ? Math.log10(roundup2ZeroEnds(lowerMaxValue)) : 1;
    const lowerNegBase = lowerMinValue < 0 ? Math.log10(-lowerMinValue) : 1;

    const viewState = {
      offset: [width / 2, height / 2],
      zoom: 0
    };

    const matrixGridLayer = new MatrixGridPolygonLayer({
      id: `matrix-grid-layer`,
      data: data,
      layout: {
        x: -width / 2 + 220,
        y: -height / 2 + 150,
        cx: cx,
        cy: cy,
        dx: dx,
        dy: dy
      },
      getColor: d =>
        d.lower
          ? d.v >= 0
            ? parseColor(
                interpolateHexColors(
                  positiveColorTints,
                  1 - Math.log10(d.v) / lowerPosBase
                )
              )
            : parseColor(
                interpolateHexColors(
                  negativeColorTints,
                  1 - Math.log10(-d.v) / lowerNegBase
                )
              )
          : d.v >= 0
            ? parseColor(
                interpolateHexColors(
                  positiveColorTints,
                  1 - Math.log10(d.v) / upperPosBase
                )
              )
            : parseColor(
                interpolateHexColors(
                  negativeColorTints,
                  1 - Math.log10(-d.v) / upperNegBase
                )
              ),

      onClick: onSelectMatrix
    });

    return (
      <div
        className="matrix-grid-legend-container"
        style={{ display: "grid", gridTemplateRows: "20px auto" }}
      >
        <div
          id="matrix-legend"
          style={{
            marginLeft: "220px",
            display: "grid",
            gridTemplateColumns: "150px auto"
          }}
        >
          <h4 id="legend-label" style={{ color: "#666", marginTop: "0" }}>
            {"Instance Count"}
          </h4>
          <div className="legend">
            <DoubleColorTintsLegends
              colorNumber={legendColorNumber}
              leftLegendColors={negLegendColors}
              rightLegendColors={posLegendColors}
            />
          </div>
        </div>
        <div id="matrix-grid">
          <DeckGL
            width={width}
            height={height}
            viewState={viewState}
            // onViewStateChange={({ viewState }) => this.setState({ viewState })}
            // style={{ border: "1px solid black" }}
            views={[glView]}
            layers={[matrixGridLayer]}
          />
        </div>
      </div>
    );
  }
}

MatrixGrid.defaultProps = defaultProps;
export default MatrixGrid;
