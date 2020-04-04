import * as React from "react";
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
  width: null,
  height: null,
  data: [],
  xkey: null,
  barkey: null,
  color: "#aaa",
  barWidth: 25,
  logscale: false,
  onSelectName: () => {}
};

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
      width,
      height,
      data,
      xkey,
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
          scale={scaleLog()
            .base(10)
            .nice()}
          domain={[0.01, "auto"]}
          ticks={[0.01, 1, 100, 10000]}
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
          left: 0,
          bottom: 0
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xkey} />
        {yaxis}
        <Tooltip />
        <Legend />
        <Bar dataKey={barkey} fill={color} barSize={barWidth}>
          {borders.map((b, i) => (
            <Cell key={`cell${i}`} fill={b.color} strokeWidth={b.width} />
          ))}
        </Bar>
      </BarChart>
    );
  }
}

InteractiveBarChart.defaultProps = defaultProps;
export default InteractiveBarChart;
