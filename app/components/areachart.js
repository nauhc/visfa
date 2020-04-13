import React, { PureComponent } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Brush
  // ResponsiveContainer
} from "recharts";
import { arrInRange, interpolatedColor } from "../utils";
import { scaleLog } from "d3-scale";

export default class InteractiveAreaChart extends PureComponent {
  static defaultProps = {
    id: "areachart",
    width: null,
    height: null,
    colors: [],
    animation: false,
    areaChartData: [],
    areaChartXkey: null,
    areaChartAreaKeyList: [],
    areaChartYMin: 0,
    areaChartYMax: 500,
    barChartData: [],
    barChartXkey: null,
    barChartYkey: null,
    barChartXMax: 500,
    countBarChartData: [],
    countBarChartDataXkey: null,
    countBarChartDataYkey: null,
    countBarChartDataYMax: 500,
    onSelectName: () => {},
    brushRange: [0, 50],
    onChangeBrush: () => {}
  };

  handleClick = e => {
    // const name = e.
    if (!e) {
      return;
    }
    this.props.onSelectName(e.activeLabel);
  };

  render() {
    let {
      id,
      width,
      height,
      animation,
      colors,
      areaChartData,
      areaChartXkey,
      areaChartAreaKeyList,
      areaChartYMin,
      areaChartYMax,
      barChartData,
      barChartXkey,
      barChartYkey,
      barChartXMax,
      countBarChartData,
      countBarChartDataXkey,
      countBarChartDataYkey,
      countBarChartDataYMax,
      brushRange,
      onChangeBrush
    } = this.props;

    if (!width || !height || !areaChartData || areaChartData.length === 0) {
      return null;
    }

    // const renderTooltipContent = o => {
    //   const { payload, label } = o;
    //   return (
    //     <div
    //       className="customized-tooltip-content"
    //       style={{
    //         margin: 0,
    //         padding: 10,
    //         paddingTop: 4,
    //         paddingBottom: 4,
    //         paddingLeft: 0,
    //         display: "block",
    //         whiteSpace: "nowrap",
    //         background: "rgba(255, 255, 255, 0.5)"
    //       }}
    //     >
    //       <ul className="list">
    //         {payload.map((entry, index) => (
    //           <li key={`item-${index}`} style={{ color: "#777" }}>
    //             {`${entry.name}: ${entry.value}`}
    //           </li>
    //         ))}
    //       </ul>
    //     </div>
    //   );
    // };
    // <Tooltip content={renderTooltipContent} />

    return (
      <div
        className={id}
        style={{
          display: "grid",
          gridTemplateColumns: "85% 15%",
          gridTemplateRows: "auto 20px"
        }}
      >
        <div
          className={`${id}-area-bar-chart`}
          style={{ display: "grid", gridTemplateRows: "15% 85%" }}
        >
          <div className={`${id}-cnt-barchart`}>
            <BarChart
              syncId="syncAreachart"
              width={width * 0.85}
              height={height * 0.15}
              data={countBarChartData}
            >
              <YAxis scale="log" domain={[0.1, "auto"]} allowDataOverflow />
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <Tooltip />
              <Bar dataKey={countBarChartDataYkey} fill={`#${colors[0]}`} />
            </BarChart>
          </div>
          <div className={`${id}-areachart`}>
            <AreaChart
              syncId="syncAreachart"
              data={areaChartData}
              width={width * 0.85}
              height={height * 0.85}
              onClick={this.handleClick}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={areaChartXkey} />
              <YAxis domain={[areaChartYMin, areaChartYMax]} />
              <Tooltip wrapperStyle={{ top: 20 }} />
              {arrInRange(areaChartAreaKeyList.length).map(i => {
                let c = interpolatedColor(colors, 0);
                if (i > 0)
                  c = interpolatedColor(
                    colors,
                    1 - i / areaChartAreaKeyList.length
                  );
                return (
                  <Area
                    key={`area-${i}`}
                    type="monotone"
                    dataKey={areaChartAreaKeyList[i]}
                    stackId="1"
                    stroke={`#${colors[0]}`}
                    fill={`#${c}`}
                    isAnimationActive={animation}
                  />
                );
              })}
              <Brush
                id={`${id}-brush`}
                margin={{
                  bottom: 20
                }}
                startIndex={brushRange[0]}
                endIndex={brushRange[1]}
                stroke={`#aaa`}
                height={20}
                travellerWidth={10 + new Date().getMilliseconds() * 10e-10}
                onChange={onChangeBrush}
              />
            </AreaChart>
          </div>
        </div>

        <div className={`${id}-barchart`}>
          <BarChart
            syncId="syncBarchart"
            width={width * 0.15}
            height={height}
            data={barChartData}
            layout="vertical"
            margin={{
              top: 5,
              right: 10,
              left: -60,
              bottom: 25
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              type="number"
              scale={scaleLog()
                .base(10)
                .nice()}
              domain={[0.1, barChartXMax]}
            />
            <YAxis tick={false} type="category" dataKey={barChartXkey} />
            <Tooltip />
            <Bar
              dataKey={barChartYkey}
              barSize={height * 0.3}
              fill={`#${colors[0]}`}
            />
          </BarChart>
        </div>
      </div>
    );
  }
}
