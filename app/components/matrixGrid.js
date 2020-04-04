// matrix cells are colored by it's positive/negative value
// Positive: Green, Negative: Purple
import * as React from "react";
import { render } from "react-dom";
import MatrixGridPolygonLayer from "./matrix-grid-polygon-layer";
import DeckGL from "@deck.gl/react";
import { OrthographicView } from "@deck.gl/core";
import { interpolateColorTintsRGB, interpolatedColor } from "../utils";

const DEFAULT_CELLL_SIZE = 10;
const DEFAULT_MATRIX_INTERVAL = DEFAULT_CELLL_SIZE;
const positiveColors = interpolateColorTintsRGB("#82ca9d");
const negativeColors = interpolateColorTintsRGB("#8884d8");

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

    const viewState = {
      offset: [width / 2, height / 2],
      zoom: 0
    };

    const logMax = 200;
    const base = Math.log10(logMax);
    const matrixGridLayer = new MatrixGridPolygonLayer({
      id: `matrix-grid-layer`,
      data: data,
      layout: {
        x: -width / 2 + 220,
        y: -height / 2 + 105,
        cx: cx,
        cy: cy,
        dx: dx,
        dy: dy
      },
      getColor: d =>
        d.v >= 0
          ? interpolatedColor(positiveColors, Math.log10(d.v) / base)
          : interpolatedColor(negativeColors, Math.log10(-d.v) / base),
      onClick: onSelectMatrix
    });

    return (
      <div className="matrix-grid-view-container">
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
    );
  }
}

MatrixGrid.defaultProps = defaultProps;
export default MatrixGrid;
