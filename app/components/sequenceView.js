// sequenceVisData[0] => positive class => Green
// sequenceVisData[1] => negative class => Purple
import * as React from "react";
import { render } from "react-dom";
import InteractiveAreaChart from "./areachart";
import { AutoSizer } from "react-virtualized/dist/commonjs/AutoSizer";
// import { makeStyles, withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Slider from "@material-ui/core/Slider";
// import CircularProgress from "@material-ui/core/CircularProgress";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import { arrInRange, interpolateColorTints, flattenDeep } from "../utils";

const positiveColor = "#82ca9d";
const negativeColor = "#8884d8";

const defaultProps = {
  width: null,
  height: null,
  title: null,
  clusterNumber: 2,
  sequenceVisData: [],
  noiseReductionLvl: 0.2,
  timeFocus: [0, 47],
  onClusterNoSliderChange: () => {},
  onClickEstimateClusterNoButton: () => {},
  onNoiseReductionSliderChange: () => {},
  onCloseClicked: () => {},
  onTimeFocusChange: () => {}
};

const valuetext = value => {
  return `${value}`;
};

const valueToLabel = value => {
  return Math.ceil(value / 100) * 100;
};

const valueToLabelLog = value => {
  return Math.pow(10, Math.ceil(Math.log10(value)));
};

class SequenceView extends React.Component {
  constructor() {
    super();
  }

  render() {
    const {
      width,
      height,
      onCloseClicked,
      title,
      clusterNumber,
      noiseReductionLvl,
      sequenceVisData,
      onClusterNoSliderChange,
      onClickEstimateClusterNoButton,
      onNoiseReductionSliderChange,
      onTimeFocusChange,
      timeFocus
    } = this.props;

    if (!sequenceVisData || sequenceVisData.length === 0) {
      return null;
    }

    const posClusters = sequenceVisData.clusters.pos;
    const negClusters = sequenceVisData.clusters.neg;
    const estimatedClusterNumber = sequenceVisData.estimatedK;
    const clusterNumInData = negClusters.length;

    const areaKeyList = negClusters[0].percents;
    let areaChartMinMax = [];
    areaChartMinMax.push(posClusters.map(c => [c.min, c.max]));
    areaChartMinMax.push(negClusters.map(c => [c.min, c.max]));
    const areaChartClusterMinMaxs = arrInRange(clusterNumInData).map(
      clusterId => {
        var minMaxInCluster = [];
        minMaxInCluster.push(areaChartMinMax[0][clusterId]); // class 0
        minMaxInCluster.push(areaChartMinMax[1][clusterId]); // class 1
        const flattenedMinMax = flattenDeep(minMaxInCluster);
        return {
          max: valueToLabel(Math.max(...flattenedMinMax)),
          min: valueToLabel(Math.min(...flattenedMinMax))
        };
      }
    );

    // <div className="time-focus-range-slider">
    //   <h4 className="time-focus-range-slider-text">Temporal Focus:</h4>
    //   <Slider
    //     defaultValue={[0, 47]}
    //     getAriaValueText={valuetext}
    //     valueLabelDisplay="auto"
    //     aria-labelledby="range-slider"
    //     min={0}
    //     max={47}
    //   />
    // </div>

    // <CircularProgress variant="determinate" value={75} />
    const barChartSizesPos = posClusters.map(c => c.size).map(o => o[0].value);
    const barChartSizesNeg = negClusters.map(c => c.size).map(o => o[0].value);
    const barChartSizes = barChartSizesPos.concat(barChartSizesNeg);
    const barChartMax = valueToLabelLog(Math.max(...barChartSizes));
    const clusterTitleGridDivision = "1fr ".repeat(clusterNumber);

    return (
      <div className="sequence-view">
        <header className="sequence-view-header">
          <h2 className="sequence-view-title">
            Contributing Sequence Patterns : {title}
          </h2>
          <button className="sequence-view-close" onClick={onCloseClicked}>
            &times;
          </button>
        </header>

        <div className="sequence-view-body">
          <div className="sequence-operation-container">
            <div className="no-cluster-slider">
              <h4 className="no-cluster-discrete-slider-text">
                Cluster Number: {clusterNumber}
              </h4>
              <Slider
                width={200}
                defaultValue={2}
                getAriaValueText={valuetext}
                aria-labelledby="discrete-slider"
                valueLabelDisplay="auto"
                step={1}
                marks
                min={1}
                max={10}
                onChange={(e, v) => onClusterNoSliderChange(v)}
              />
            </div>

            <div
              className="cluster-estimation-container"
              style={{ display: "grid", gridTemplateRows: "50% 50%" }}
            >
              <h4 className="noise-reduction-slider-text">
                {`Estimated Cluster Number: ${estimatedClusterNumber}`}
              </h4>
              <Grid
                container
                direction="row"
                justify="center"
                alignItems="center"
              >
                <Button
                  variant="outlined"
                  color="primary"
                  disabled={estimatedClusterNumber ? false : true}
                  onClick={() => {
                    onClickEstimateClusterNoButton(estimatedClusterNumber);
                  }}
                >
                  Apply Estimated Cluster Number
                </Button>
              </Grid>
            </div>

            <div className="noise-reduction-slider">
              <h4 className="noise-reduction-slider-text">
                Noise Reduction Level: {noiseReductionLvl}
              </h4>
              <Slider
                defaultValue={0.2}
                getAriaValueText={valuetext}
                aria-labelledby="discrete-slider"
                valueLabelDisplay="auto"
                step={0.1}
                marks
                min={0}
                max={1.0}
                onChange={(e, v) => onNoiseReductionSliderChange(v)}
              />
            </div>
          </div>

          <div className="areacharts-view-container">
            <h3
              style={{ alignSelf: "center", color: positiveColor }}
              className="class1-title"
            >
              Pass
            </h3>
            <h3
              style={{ alignSelf: "center", color: negativeColor }}
              className="class0-title"
            >
              Fail
            </h3>

            <div
              className="clusters-title"
              width={width * 0.05}
              style={{
                display: "grid",
                margin: 10,
                gridTemplateRows: { clusterTitleGridDivision }
              }}
            >
              {arrInRange(clusterNumInData).map(i => {
                return (
                  <h3
                    key={`cluster${i}-title`}
                    style={{
                      alignSelf: "center",
                      textAlign: "center",
                      color: "#666"
                    }}
                    className={`cluster${i}-title`}
                  >
                    {` Cluster ${i + 1}`}
                  </h3>
                );
              })}
            </div>

            <div className="class0">
              {arrInRange(clusterNumInData).map(i => {
                return (
                  <InteractiveAreaChart
                    key={`class0-cluster${i}`}
                    id={`class0-cluster${i}`}
                    width={width * 0.45}
                    height={(height * 0.7) / clusterNumInData}
                    colors={interpolateColorTints(negativeColor)}
                    areaChartData={negClusters[i].percentiles}
                    areaChartXkey={"time"}
                    areaChartAreaKeyList={areaKeyList}
                    areaChartYMin={areaChartClusterMinMaxs[i].min}
                    areaChartYMax={areaChartClusterMinMaxs[i].max}
                    barChartData={negClusters[i].size}
                    barChartXkey={"name"}
                    barChartYkey={"value"}
                    barChartXMax={barChartMax}
                    countBarChartData={negClusters[i].tsHist}
                    countBarChartDataXkey={"time"}
                    countBarChartDataYkey={"cnt"}
                    countBarChartDataYMax={negClusters[i].tsCntMax}
                    brushRange={timeFocus}
                    onChangeBrush={onTimeFocusChange}
                  />
                );
              })}
            </div>
            <div className="class1">
              {arrInRange(clusterNumInData).map(i => {
                return (
                  <InteractiveAreaChart
                    key={`class1-cluster${i}`}
                    id={`class1-cluster${i}`}
                    width={width * 0.45}
                    height={(height * 0.7) / clusterNumInData}
                    colors={interpolateColorTints(positiveColor)}
                    areaChartData={posClusters[i].percentiles}
                    areaChartXkey={"time"}
                    areaChartAreaKeyList={areaKeyList}
                    areaChartYMin={areaChartClusterMinMaxs[i].min}
                    areaChartYMax={areaChartClusterMinMaxs[i].max}
                    barChartData={posClusters[i].size}
                    barChartXkey={"name"}
                    barChartYkey={"value"}
                    barChartXMax={barChartMax}
                    countBarChartData={posClusters[i].tsHist}
                    countBarChartDataXkey={"time"}
                    countBarChartDataYkey={"cnt"}
                    countBarChartDataYMax={posClusters[i].tsCntMax}
                    brushRange={timeFocus}
                    onChangeBrush={onTimeFocusChange}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

SequenceView.defaultProps = defaultProps;
export default SequenceView;
