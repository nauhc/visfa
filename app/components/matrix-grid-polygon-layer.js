// matrix-grid-layer-new.js
import { LineLayer, PolygonLayer, TextLayer } from "@deck.gl/layers";
import { CompositeLayer, COORDINATE_SYSTEM } from "@deck.gl/core";
const DEFAULT_CELL_COL_SIZE = 4;
const DEFAULT_CELL_ROW_SIZE = 4;
const DEFAULT_MATRIX_INTERVAL_HORIZANTAL = DEFAULT_CELL_COL_SIZE;
const DEFAULT_MATRIX_INTERVAL_VERTICAL = DEFAULT_CELL_ROW_SIZE;
const OFFSET = 0.5;
const MASK_COLOR = [255, 255, 255, 180];

const defaultProps = {
  id: "default-matrix-layer",
  data: [],
  filters: {},
  selected: null,
  layout: {
    x: 0, // top-left x
    y: 0, // top-left y
    cx: DEFAULT_CELL_COL_SIZE, // cell width
    cy: DEFAULT_CELL_ROW_SIZE, // cell height
    dx: DEFAULT_MATRIX_INTERVAL_HORIZANTAL, // interval between matrices x
    dy: DEFAULT_MATRIX_INTERVAL_VERTICAL // interval between matrices y
  },
  stroked: false,
  getLineWidth: 0,
  getLineColor: [0, 0, 0, 255],
  updateTriggers: {},
  coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
  // left-top
  // getPosition: d => [0, 0, 0],
  getColor: d => [0, 128, 0],
  getAltColor: d => [128, 0, 0]
};

const _groupBy = (arr, key) => {
  return arr.reduce((rv, x) => {
    (rv[x[key]] = rv[x[key]] || []).push(x);
    return rv;
  }, {});
};

const copyUpdateTriggers = updateTriggers =>
  Object.entries(updateTriggers).reduce(
    (obj, [key, value]) =>
      key !== "getColor" && key !== "getAltColor"
        ? Object.assign(obj, { [key]: value })
        : obj,
    {}
  );

class MatrixGridPolygonLayer extends CompositeLayer {
  initializeState() {
    this.state = {
      matrixOffsetMap: {}
    };
  }

  // _onClickCell(e) {
  //   console.log("onclick log", e.object);
  //   this.props.onClick(e);
  // }

  // this function  is automatically called by deckgl
  updateState({ props }) {
    const {
      layout: { x, y, cx, cy, dx, dy }
    } = props;
    const { data } = props;

    const mats = _groupBy(data.matrixGrid, "colIdx");
    const matrixSizeDict = Object.keys(mats).map(
      colId => mats[colId][0].numCols
    );
    // console.log("matrixSizeDict", matrixSizeDict);

    data.matrixGrid.forEach(matrix => {
      // current matrix cells coordinates
      // current matrix top-left
      this.state.matrixOffsetMap[matrix.colIdx] =
        matrix.colIdx === 0
          ? 0
          : this.state.matrixOffsetMap[matrix.colIdx - 1] +
            matrixSizeDict[matrix.colIdx - 1] * cx +
            dx;
    });
    // console.log("matrixOffsetMap", this.state.matrixOffsetMap);
  }

  _renderMatrixGridCells() {
    const {
      id,
      data,
      filters,
      layout: { x, y, cx, cy },
      stroked,
      coordinateSystem,
      // getPosition,
      getColor,
      getAltColor,
      getLineWidth,
      getLineColor,
      // updateTriggers,
      // onHover,
      onClick
    } = this.props;

    const polygonCells = [];
    data.matrixGrid.forEach(matrix => {
      const matOffsetX = this.state.matrixOffsetMap[matrix.colIdx];
      const matOffsetY = this.state.matrixOffsetMap[matrix.rowIdx];

      matrix.data.forEach(cell => {
        polygonCells.push({
          id: cell.id,
          lower: matrix.rowIdx >= matrix.colIdx, // lower matrix or upper matrix
          xx: x + matOffsetX + matrix.colIdxDict[cell.colId] * cx,
          yy: y + matOffsetY + matrix.rowIdxDict[cell.rowId] * cy,
          v: cell.cnt
        });
      });
    });

    return new PolygonLayer({
      id: `${id}-cells`,
      data: polygonCells,
      pickable: onClick,
      pickingRadius: DEFAULT_CELL_COL_SIZE,
      getPolygon: d => [
        [d.xx + OFFSET, d.yy + OFFSET],
        [d.xx + OFFSET, d.yy + cy - OFFSET * 2],
        [d.xx + cx - OFFSET * 2, d.yy + cy - OFFSET * 2],
        [d.xx + cx - OFFSET * 2, d.yy + OFFSET],
        [d.xx + OFFSET, d.yy + OFFSET]
      ],
      getFillColor: getColor,
      stroked,
      getLineWidth,
      getLineColor,
      // onHover,
      onClick,
      // updateTriggers: {
      //   ...copyUpdateTriggers(updateTriggers),
      //   getFillColor: updateTriggers.getColor
      // }
      coordinateSystem: coordinateSystem
    });
  }

  _renderMatrixBorder() {
    const {
      id,
      layout: { x, y, cx, cy },
      coordinateSystem,
      data
    } = this.props;

    const borders = [];
    data.matrixGrid.forEach(matrix => {
      const matOffsetX = this.state.matrixOffsetMap[matrix.colIdx];
      const matOffsetY = this.state.matrixOffsetMap[matrix.rowIdx];
      borders.push({
        xx: x + matOffsetX,
        yy: y + matOffsetY,
        width: matrix.numCols * cx,
        height: matrix.numRows * cy
      });
    });
    // console.log("borders", borders);

    return new PolygonLayer({
      id: `${id}-border`,
      data: borders,
      coordinateSystem,
      getPolygon: d => [
        [d.xx, d.yy],
        [d.xx, d.yy + d.height],
        [d.xx + d.width, d.yy + d.height],
        [d.xx + d.width, d.yy],
        [d.xx, d.yy]
      ],
      filled: true,
      getFillColor: d => [128, 128, 128, 0],
      stroked: true,
      getLineColor: [215, 218, 219],
      coordinateSystem: coordinateSystem
    });
  }

  _renderMatrixGridLabels() {
    const {
      id,
      layout: { x, y, cx, cy },
      coordinateSystem,
      data
    } = this.props;

    let texts = [];
    const matrixLabelSize = 12;
    const cellLabelSize = 7;

    data.labels.forEach((att, i) => {
      // top matrix labels
      texts.push({
        coord: [x + this.state.matrixOffsetMap[i], y - 30],
        name: att.name,
        size: matrixLabelSize,
        angle: 25,
        anchor: "start"
      });
      // top cell labels
      att.bins.forEach((b, ii) => {
        texts.push({
          coord: [x + this.state.matrixOffsetMap[i] + ii * cx, y - 8],
          name: b.toString(),
          size: cellLabelSize,
          angle: 30,
          anchor: "start"
        });
      });
      // left matrix labels
      texts.push({
        coord: [x - 35, this.state.matrixOffsetMap[i] + y + 5],
        name: att.name,
        size: matrixLabelSize,
        angle: 0,
        anchor: "end"
      });
      // // left cell labels
      att.bins.forEach((b, ii) => {
        texts.push({
          coord: [x - 5, this.state.matrixOffsetMap[i] + ii * cy + y + 5],
          name: b.toString(),
          size: cellLabelSize,
          angle: 0,
          anchor: "end"
        });
      });
    });

    return new TextLayer({
      id: `${id}-labels`,
      data: texts,
      getPosition: d => d.coord,
      getText: d => d.name,
      getSize: d => d.size - 2,
      getAngle: d => d.angle,
      getTextAnchor: d => d.anchor,
      // getAlignmentBaseline: "start",
      coordinateSystem: coordinateSystem
    });
  }

  renderLayers() {
    const {
      layout: { width, height }
    } = this.props;
    if (width <= 0 || height <= 0) {
      return [];
    }

    return [
      this._renderMatrixBorder(),
      this._renderMatrixGridCells(),
      this._renderMatrixGridLabels()
    ];
  }
}

MatrixGridPolygonLayer.layerName = "MatrixGridPolygonLayer";
MatrixGridPolygonLayer.defaultProps = defaultProps;
export default MatrixGridPolygonLayer;
