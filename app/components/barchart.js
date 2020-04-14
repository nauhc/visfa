import * as React from "react";
import { PureComponent } from "react";
import { render } from "react-dom";
import {
  BarChart,
  Bar,
  Brush,
  Cell,
  CartesianGrid,
  ReferenceLine,
  ReferenceDot,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ErrorBar,
  LabelList
} from "recharts";
import { scaleLog } from "d3-scale";

const defaultProps = {
  id: "barchart",
  width: null,
  height: null,
  data: [],
  xkey: null,
  xLabelRotate: false,
  yTicks: [0.1, 10, 1000, 100000],
  barkey: null,
  color: "#aaa",
  barWidth: 25,
  logscale: false,
  onSelectName: () => {}
};

class CustomizedAxisTick extends PureComponent {
  render() {
    const { x, y, stroke, payload } = this.props;

    return (
      <g transform={`translate(${x},${y})`}>
        <text
          x={0}
          y={0}
          dy={16}
          textAnchor="end"
          fill={color}
          transform="rotate(-10)"
        >
          {payload.value}
        </text>
      </g>
    );
  }
}

class InteractiveBarChart extends React.Component {
  constructor() {
    super();
    this.state = {
      clickedLabel: []
    };
  }

  handleClick = e => {
    // console.log(e);
    if (!e) {
      return;
    }

    const { clickedLabel } = this.state;

    const idx = clickedLabel.indexOf(e.activeLabel);
    if (idx > -1) {
      clickedLabel.splice(idx, 1);
    } else {
      clickedLabel.push(e.activeLabel);
    }

    this.setState({
      clickedLabel
    });

    this.props.onSelectName(clickedLabel);
  };

  render() {
    const {
      id,
      width,
      height,
      data,
      xkey,
      xLabelRotate,
      yTicks,
      barkey,
      logscale,
      color,
      barWidth
    } = this.props;
    const { clickedLabel } = this.state;
    if (!width || !height || !data || data.length === 0 || !xkey || !barkey) {
      return null;
    }

    let borders = data.map(o => {
      return {
        color,
        width: 0
      };
    });
    if (clickedLabel.length) {
      borders = data.map(o => {
        if (clickedLabel.includes(o[xkey])) {
          return {
            color,
            width: 1
          };
        } else {
          return {
            color: "#ddd",
            width: 0
          };
        }
      });
    }

    let yaxis;
    if (logscale) {
      yaxis = (
        <YAxis
          id={`${id}-y-axis`}
          scale={scaleLog()
            .base(10)
            .nice()}
          domain={[yTicks[0], "auto"]}
          ticks={yTicks}
          allowDataOverflow
        />
      );
    } else {
      yaxis = <YAxis />;
    }

    return (
      <BarChart
        width={width}
        height={height}
        data={data}
        onClick={this.handleClick}
        margin={{
          top: 10,
          right: 25,
          left: 10,
          bottom: 0
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <Tooltip />
        {xLabelRotate ? (
          <XAxis dataKey={xkey} tick={<CustomizedAxisTick />} />
        ) : (
          <XAxis dataKey={xkey} />
        )}
        {yaxis}
        <Bar dataKey={barkey} fill={color} barSize={barWidth}>
          {borders.map((b, i) => (
            <Cell key={`cell${i}`} fill={b.color} strokeWidth={b.width} />
          ))}
        </Bar>
        <Legend />
      </BarChart>
    );
  }
}

InteractiveBarChart.defaultProps = defaultProps;
export default InteractiveBarChart;
