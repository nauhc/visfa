// scatters are colored by it's 0/1 value
// 1: Green, 0: Purple
import { LineLayer, PolygonLayer, ScatterplotLayer } from "@deck.gl/layers";
import { CompositeLayer, COORDINATE_SYSTEM } from "@deck.gl/core";

const DEFAULT_WIDTH = 400;
const DEFAULT_HEIGHT = 400;

const defaultProps = {
  id: "scatterPlot-layer",
  data: [],
  layout: {
    x: 0, // top-left x
    y: 0 // top-left y
  },
  width: DEFAULT_WIDTH,
  height: DEFAULT_HEIGHT,
  dotSize: 2,
  colorby: " ",
  viewState: {
    offset: [0, 0],
    zoom: 0
  },
  coordinateSystem: COORDINATE_SYSTEM.CARTESIAN //COORDINATE_SYSTEM.IDENTITY
};

class Scatterplot extends CompositeLayer {
  initializeState() {
    const { width, height, data } = this.props;
  }

  renderLayers() {
    const {
      id,
      data,
      layout: { x, y },
      width,
      height,
      dotSize,
      colorby,
      highlightby,
      viewState,
      coordinateSystem
    } = this.props;

    const scatterLayer = new ScatterplotLayer({
      id: "${id}-scatter",
      viewState,
      coordinateSystem,
      data: data,
      // stroked,
      // lineWidthMinPixels: 1,
      // getLineColor: d => d.strokeColor,
      getPosition: d => [(d.x - 0.5) * width, y + (d.y - 0.5) * height],
      getRadius: dotSize,
      getFillColor: d =>
        d.color
          ? d[colorby]
            ? [130, 202, 157]
            : [136, 132, 216]
          : [200, 200, 200]
    });

    return [scatterLayer];
  }
}

Scatterplot.layerName = "Scatterplot";
Scatterplot.defaultProps = defaultProps;
export default Scatterplot;
