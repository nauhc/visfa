// Author: Chuan Wang
// Email: nauhcy@gmail.com
import React, { Component } from "react";
import ReactDOM from "react-dom";
import { createStore, applyMiddleware } from "redux";
import { Provider, connect } from "react-redux";
import thunk from "redux-thunk";
import {
  updateAndFetchProperty,
  updateAndFetchSequences,
  loadAttention,
  updateLassoSelectedInstanceId,
  updateSelectedClass,
  updateSelectedAge,
  updateSelectedGender,
  updateSelectedFeatureIdx,
  updateSelectedModel,
  updateSelectedEpoch,
  updateSelectedAttnRange,
  updateSelectedMatrix,
  updateFeatureNumber,
  updateClusterNumber,
  updateEstimatedClusterNumber,
  updateNoiseReductionLvl,
  updateSequenceTimeBrush,
  closeSequenceView
} from "./actions";
import reducer from "./reducer";
import { csv as requestCSV } from "d3-request";
import {
  getData,
  getAttention,
  getSequence,
  getSelectedAttnRange,
  getSelectedFeatureNumber,
  getSelectedMatrixId
} from "./selectors/base";
import {
  getMatrixGrid,
  getRankedFeatures,
  getSelectedFeatureId
} from "./selectors/matrix";
import { AutoSizer } from "react-virtualized/dist/commonjs/AutoSizer";
import "./assets/css/index.css";
import InteractiveBarChart from "./components/barchart";
import LassoScatteplot from "./components/lassoScatteplot";
import MatrixGrid from "./components/matrixGrid";
import SequenceView from "./components/sequenceView";
import { arrInRange } from "./utils";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";

//  ----  Redux Utility Functions   ---- //
const mapDispatchToProps = {
  updateAndFetchProperty,
  updateAndFetchSequences,
  loadAttention,
  updateLassoSelectedInstanceId,
  updateSelectedClass,
  updateSelectedAge,
  updateSelectedGender,
  updateSelectedFeatureIdx,
  updateSelectedModel,
  updateSelectedEpoch,
  updateSelectedAttnRange,
  updateSelectedMatrix,
  updateFeatureNumber,
  updateClusterNumber,
  updateEstimatedClusterNumber,
  updateNoiseReductionLvl,
  updateSequenceTimeBrush,
  closeSequenceView
};

const mapStateToProps = state => ({
  property: getData(state),
  attention: getAttention(state),
  sequence: getSequence(state),
  matrixGridNLabel: getMatrixGrid(state),
  features: state.features,
  rankedFeatures: getRankedFeatures(state),
  selectedMatrixId: getSelectedMatrixId(state),
  selectedInstanceId: state.selectedInstanceId,
  selectedClass: state.selectedClass,
  selectedAge: state.selectedAge,
  selectedGender: state.selectedGender,
  selectedFeatureIdx: getSelectedFeatureId(state),
  selectedModel: state.selectedModel,
  selectedEpoch: state.selectedEpoch,
  selectedAttnRange: getSelectedAttnRange(state),
  selectedFeatureNumber: getSelectedFeatureNumber(state),
  selectedClusterNumber: state.selectedClusterNumber,
  estimatedClusterNumber: state.estimatedClusterNumber,
  selectedSequenceTimeBrush: state.selectedSequenceTimeBrush,
  selectedNoiseReductionLvl: state.selectedNoiseReductionLvl
});

// ---- React Component ---- //
class App extends Component {
  componentDidMount() {
    const {
      updateAndFetchProperty,
      loadAttention,
      selectedInstanceId,
      selectedClass,
      selectedAge,
      selectedGender,
      selectedFeatureIdx,
      selectedModel,
      selectedEpoch,
      selectedAttnRange
    } = this.props;

    // load property
    updateAndFetchProperty(
      JSON.stringify({
        selectedInstanceId,
        selectedClass,
        selectedAge,
        selectedGender,
        selectedModel,
        selectedEpoch,
        selectedAttnRange
      })
    );

    // load attention
    const attnFilename =
      "checkpoint-20200404-190935-023Epoch-0.89_attentions_noa4vis.csv";
    requestCSV(
      "../backend/data/oulad/vis_data/".concat(attnFilename),
      (error, response) => {
        if (!error) {
          response.forEach(function(d) {
            d.attn = +d.attn;
            d.posId = +d.posId;
            d.seqId = +d.seqId;
            d.class = +d.class;
          });

          loadAttention({
            attention: response
          });
        }
      }
    );
  }

  handleUpdateLassoInstanceSelection = payload => {
    const {
      updateLassoSelectedInstanceId,
      updateAndFetchProperty,
      selectedInstanceId,
      selectedClass,
      selectedAge,
      selectedGender,
      selectedModel,
      selectedEpoch,
      selectedAttnRange
    } = this.props;
    updateLassoSelectedInstanceId(payload);

    updateAndFetchProperty(
      JSON.stringify({
        selectedInstanceId: payload,
        selectedClass,
        selectedAge,
        selectedGender,
        selectedModel,
        selectedEpoch,
        selectedAttnRange
      })
    );
  };

  handleUpdateClassSelection = payload => {
    const {
      updateSelectedClass,
      updateAndFetchProperty,
      selectedInstanceId,
      selectedClass,
      selectedAge,
      selectedGender,
      selectedModel,
      selectedEpoch,
      selectedAttnRange
    } = this.props;
    updateSelectedClass(payload);

    // if select both set selection to none
    const classArr = payload.length === 1 ? payload : [];

    updateAndFetchProperty(
      JSON.stringify({
        selectedInstanceId,
        selectedClass: classArr,
        selectedAge,
        selectedGender,
        selectedModel,
        selectedEpoch,
        selectedAttnRange
      })
    );
  };

  handleUpdateGenderSelection = payload => {
    const {
      updateSelectedGender,
      updateAndFetchProperty,
      selectedInstanceId,
      selectedClass,
      selectedAge,
      selectedGender,
      selectedModel,
      selectedEpoch,
      selectedAttnRange
    } = this.props;
    updateSelectedGender(payload);

    // if select both set selection to none
    const genderArr = payload.length === 1 ? payload : [];

    updateAndFetchProperty(
      JSON.stringify({
        selectedInstanceId,
        selectedClass,
        selectedAge,
        selectedGender: genderArr,
        selectedModel,
        selectedEpoch,
        selectedAttnRange
      })
    );
  };

  handleUpdateAgeSelection = payload => {
    const {
      updateSelectedAge,
      updateAndFetchProperty,
      selectedInstanceId,
      selectedClass,
      selectedAge,
      selectedGender,
      selectedModel,
      selectedEpoch,
      selectedAttnRange
    } = this.props;
    updateSelectedAge(payload);

    // if select all ranges, set selection to none
    const ageArr = payload.length === 10 ? [] : payload.map(i => parseInt(i));

    updateAndFetchProperty(
      JSON.stringify({
        selectedInstanceId,
        selectedClass,
        selectedAge: ageArr,
        selectedGender,
        selectedModel,
        selectedEpoch,
        selectedAttnRange
      })
    );
  };

  handleClickingMatrix = ({ object }) => {
    const selectedMatId = object.id.split("_")[0].split("#");
    const {
      updateSelectedMatrix,
      rankedFeatures,
      features,
      updateAndFetchSequences,
      selectedAttnRange,
      selectedNoiseReductionLvl,
      selectedClusterNumber,
      selectedFeatureIdx
    } = this.props;
    updateSelectedMatrix(selectedMatId);

    const selectedFeatureName = rankedFeatures[parseInt(selectedMatId)].name;
    const selectedOrgFeatureId = features
      .map(f => f.name)
      .indexOf(selectedFeatureName);

    // load sequence (on clicking matrix)
    updateAndFetchSequences(
      JSON.stringify({
        selectedFeatureIdx: selectedOrgFeatureId,
        selectedAttnRange,
        selectedNoiseReductionLvl,
        selectedClusterNumber,
        sampleSize: 5000
      })
    );
  };

  handleSelectingAttnRange = payload => {
    const { updateSelectedAttnRange } = this.props;
    updateSelectedAttnRange(payload);
  };

  handleChangeClusterNumber = payload => {
    const {
      updateClusterNumber,
      updateAndFetchSequences,
      selectedAttnRange,
      selectedNoiseReductionLvl,
      selectedClusterNumber,
      selectedFeatureIdx
    } = this.props;
    updateClusterNumber(payload);

    updateAndFetchSequences(
      JSON.stringify({
        selectedFeatureIdx: selectedFeatureIdx[0],
        selectedAttnRange,
        selectedNoiseReductionLvl,
        selectedClusterNumber: payload,
        sampleSize: 5000
      })
    );
  };

  handleUpdateEstimatedClusterNumber = payload => {
    const {
      updateEstimatedClusterNumber,
      selectedFeatureIdx,
      selectedAttnRange,
      selectedNoiseReductionLvl,
      selectedClusterNumber
    } = this.props;
    updateEstimatedClusterNumber(payload);
    this.handleChangeClusterNumber(payload);
  };

  handleChangeNoiseReductionLvl = payload => {
    const {
      updateNoiseReductionLvl,
      updateAndFetchSequences,
      selectedFeatureIdx,
      selectedAttnRange,
      selectedClusterNumber
    } = this.props;
    updateNoiseReductionLvl(payload);

    updateAndFetchSequences(
      JSON.stringify({
        selectedFeatureIdx: selectedFeatureIdx[0],
        selectedAttnRange,
        selectedNoiseReductionLvl: payload,
        selectedClusterNumber,
        sampleSize: 5000
      })
    );
  };

  render() {
    const {
      property,
      sequence,
      selectedInstanceID,
      updateSelectedInstanceID,
      selectedClass,
      updateSelectedClass,
      selectedAge,
      updateSelectedAge,
      selectedGender,
      updateSelectedGender,
      selectedFeatureIdx,
      updateSelectedFeatureIdx,
      selectedModel,
      updateSelectedModel,
      selectedEpoch,
      updateSelectedEpoch,
      selectedAttnRange,
      updateSelectedAttnRange,
      updateLassoSelectedInstanceId,
      rankedFeatures,
      matrixGridNLabel,
      selectedMatrixId,
      updateSelectedMatrix,
      selectedFeatureNumber,
      updateFeatureNumber,
      selectedClusterNumber,
      updateEstimatedClusterNumber,
      selectedNoiseReductionLvl,
      updateSequenceTimeBrush,
      selectedSequenceTimeBrush,
      closeSequenceView
    } = this.props;

    if (!property || property.length === 0) {
      return null;
    }

    if (!matrixGridNLabel || matrixGridNLabel.length === 0) {
      return null;
    }

    // console.log("property", property);
    console.log("matrixGrid and label", matrixGridNLabel);
    // console.log("selectedAttnRange", selectedAttnRange);
    // console.log("selectedFeatureIdx", selectedFeatureIdx);
    // console.log("selectedMatrixId", selectedMatrixId);
    // console.log("selectedSequenceTimeBrush", selectedSequenceTimeBrush);
    // console.log("sequence", sequence);

    const classColor = "#999"; //#82ca9d -> green 130, 202, 157
    const genderColor = "#999"; //#82ca9d -> green 130, 202, 157
    const ageColor = "#999"; //#8884d8 -> purple 136, 132, 216

    return (
      <div className="App">
        <div className="header-container"> ViSFA </div>
        <div className="property-view-container">
          <div className="instance-view-container">
            <h2 style={{ color: "#444" }} className="instance-view-title">
              Patient Property
            </h2>
            <div className="projection-view-container">
              <h3 style={{ color: "#666" }} className="projection-view-title">
                2D Projection
              </h3>
              <AutoSizer>
                {({ height, width }) => {
                  if (!height || !width) {
                    return null;
                  }
                  return (
                    <LassoScatteplot
                      width={width}
                      height={height}
                      data={property.tsne}
                      id={"id"}
                      dotSize={2}
                      colorby={"class"}
                      highlightby={"color"}
                      overlapSelection={property.tsneSelection}
                      onLassoSelectPoints={
                        this.handleUpdateLassoInstanceSelection
                      }
                    />
                  );
                }}
              </AutoSizer>
            </div>
            <div className="selection-charts-container">
              <div className="barchart-gender-class-container">
                <div className="barchart-gender-label-container">
                  <h3 style={{ color: "#666" }} className="gender-label">
                    Gender
                  </h3>
                  <div className="barchart-gender-container">
                    <AutoSizer>
                      {({ height, width }) => (
                        <InteractiveBarChart
                          width={width}
                          height={height}
                          data={property.gender}
                          xkey={"x"}
                          barkey={"Inst Cnt"}
                          color={genderColor}
                          onSelectName={this.handleUpdateGenderSelection}
                        />
                      )}
                    </AutoSizer>
                  </div>
                </div>
                <div className="barchart-class-label-container">
                  <h3 style={{ color: "#666" }} className="class-label">
                    Class
                  </h3>
                  <div className="barchart-class-container">
                    <AutoSizer>
                      {({ height, width }) => (
                        <InteractiveBarChart
                          width={width}
                          height={height}
                          data={property.class}
                          xkey={"x"}
                          barkey={"Inst Cnt"}
                          color={classColor}
                          onSelectName={this.handleUpdateClassSelection}
                        />
                      )}
                    </AutoSizer>
                  </div>
                </div>
              </div>
              <div className="barchart-age-label-container">
                <h3 style={{ color: "#666" }} className="age-label">
                  Education
                </h3>
                <div className="barchart-age-container">
                  <AutoSizer>
                    {({ height, width }) => (
                      <InteractiveBarChart
                        width={width}
                        height={height}
                        data={property.education}
                        xkey={"x"}
                        barkey={"Inst Cnt"}
                        color={ageColor}
                        onSelectName={this.handleUpdateAgeSelection}
                      />
                    )}
                  </AutoSizer>
                </div>
              </div>
            </div>
          </div>
          <div className="event-view-container">
            <h2 style={{ color: "#444" }} className="event-view-title">
              Temporal Event Property: Attribution
            </h2>
            <div className="barchart-attn-container">
              <AutoSizer>
                {({ height, width }) => (
                  <InteractiveBarChart
                    width={width}
                    height={height}
                    data={property.attention}
                    xkey={"x"}
                    barkey={"Inst Cnt"}
                    logscale={true}
                    color={"#82c0ee"}
                    onSelectName={this.handleSelectingAttnRange}
                  />
                )}
              </AutoSizer>
            </div>
          </div>
        </div>
        <div className="summary-view-container">
          <h2 style={{ color: "#444" }} className="summary-view-title">
            Patient Feature Attribution Summary
          </h2>
          <div className="summaryvis-view-container">
            <h3 style={{ color: "#666" }} className="matrix-grid-title">
              Matrix Grid
            </h3>
            <div className="feature-number-selector-container">
              <InputLabel id="select-text">Feature No.</InputLabel>
              <Select
                labelId="feature-number-select-label"
                id="feature-number-select"
                value={selectedFeatureNumber}
                onChange={updateFeatureNumber}
              >
                {arrInRange(20).map(i => {
                  return (
                    <MenuItem key={i} value={i + 1}>
                      {i + 1}
                    </MenuItem>
                  );
                })}
              </Select>
            </div>

            <div className="matrix-grid-container">
              <AutoSizer>
                {({ height, width }) => {
                  if (!height || !width) {
                    return null;
                  }
                  return (
                    <MatrixGrid
                      width={width}
                      height={height}
                      data={matrixGridNLabel}
                      onSelectMatrix={this.handleClickingMatrix}
                    />
                  );
                }}
              </AutoSizer>
            </div>
            {selectedMatrixId ? (
              <div className="sequence-view-container">
                <AutoSizer>
                  {({ height, width }) => {
                    if (!height || !width) {
                      return null;
                    }
                    return (
                      <SequenceView
                        width={width}
                        height={height}
                        title={
                          rankedFeatures[parseInt(selectedMatrixId[0])].name
                        }
                        clusterNumber={selectedClusterNumber}
                        noiseReductionLvl={selectedNoiseReductionLvl}
                        sequenceVisData={sequence}
                        onClusterNoSliderChange={this.handleChangeClusterNumber}
                        onClickEstimateClusterNoButton={
                          this.handleUpdateEstimatedClusterNumber
                        }
                        onNoiseReductionSliderChange={
                          this.handleChangeNoiseReductionLvl
                        }
                        timeFocus={selectedSequenceTimeBrush}
                        onTimeFocusChange={updateSequenceTimeBrush}
                        onCloseClicked={closeSequenceView}
                      />
                    );
                  }}
                </AutoSizer>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    );
  }
}

// ---- Link Redux to React ---- //
const store = createStore(reducer, applyMiddleware(thunk));
const AppContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(App);

// ---- Render! ---- //
ReactDOM.render(
  <Provider store={store}>
    <AppContainer />
  </Provider>,
  document.getElementById("app")
);
