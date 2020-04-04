import * as React from "react";
import lasso from "../lib/lasso";
import DeckGL from "@deck.gl/react";
import { OrthographicView } from "@deck.gl/core";
import Scatterplot from "./scatter";
import * as d3 from "d3";

const defaultProps = {
  id: "id",
  width: 400,
  height: 340,
  data: [],
  dotSize: 2,
  colorby: " ",
  overlapSelection: [], // for other filtering method, overlap with lasso selection
  onLassoSelectPoints: () => {}
};

class LassoScatteplot extends React.Component {
  state = {
    scatter: this.props.data,
    selectedScatter: Array.from(new Array(this.props.data.length), i => true)
  };

  componentDidMount() {
    this.lassoBegin();
  }

  componentDidUpdate() {
    this.lassoBegin();
  }

  getContainer = () => {
    this.container = d3.select("div#lasso-scatterplot");
    return this.container;
  };

  getLassoContainer = () => {
    let container = this.getContainer();
    this.lassoContainer = container.select("div#lasso-scatterplot-container");
    if (this.lassoContainer.empty()) {
      this.lassoContainer = container
        .append("div")
        .attr("id", "lasso-scatterplot-container")
        .attr(
          "style",
          `width: ${this.props.width}px;
         height: ${this.props.height}px;
         position: absolute;
         top: 0;
         left: 0;`
        );
    }
    return this.lassoContainer;
  };

  lassoBegin = () => {
    const { width, height, onLassoSelectPoints, id } = this.props;
    const { scatter } = this.state;

    if (scatter.length === 0 || this.lasso) return;

    let nodesInView = []; // map (0,1) value to width & height
    for (let i = 0; i < scatter.length; i++) {
      nodesInView.push({
        x: scatter[i].x * width,
        y: scatter[i].y * height,
        id: scatter[i][id]
      });
    }

    this.lasso = new lasso(this.getLassoContainer().node(), {
      width: width,
      height: height,
      nodes: nodesInView,
      onLassoEnd: selected => {
        if (selected.length === 0) {
          this.setState({
            ...this.state,
            selectedScatter: Array.from(
              new Array(nodesInView.length),
              i => true
            )
          });
          // onLassoSelectPoints(nodesInView.map(o => o.id)); // set to all
          onLassoSelectPoints([]); // set to empty if no selection
        } else {
          const selectedID = selected.map(o => o.id);
          const selectedScatter = nodesInView.map(s => {
            if (selectedID.indexOf(s.id) > -1) {
              return true;
            }
            return false;
          });

          this.setState({
            ...this.state,
            selectedScatter
          });
          onLassoSelectPoints(selectedID);
        }
      }
    });
    this.lasso.begin();
  };

  render() {
    const {
      width,
      height,
      data,
      dotSize,
      colorby,
      overlapSelection
    } = this.props;
    const { selectedScatter } = this.state;
    const glView = new OrthographicView();
    const viewState = {
      offset: [width / 2, height / 2],
      zoom: 0
    };

    // console.log("selectedScatter", selectedScatter);
    // console.log("overlapSelection", overlapSelection);
    if (
      overlapSelection.length != 0 &&
      selectedScatter.length != overlapSelection.length
    ) {
      return null;
    }

    let selectionIntersection = selectedScatter;
    if (overlapSelection.length > 0) {
      selectionIntersection = selectionIntersection && overlapSelection;
    }

    const data_selection = data.map((d, i) => {
      return {
        ...d,
        color: selectionIntersection[i]
      };
    });

    return (
      <div className="lasso-scatterplot-view">
        <div id="lasso-scatterplot">
          <svg width={width} height={height} />
        </div>
        <div className="scatterplot-view">
          <DeckGL
            views={[glView]}
            width={width}
            height={height}
            viewState={viewState}
            views={[glView]}
            layers={[
              new Scatterplot({
                id: "scatter-view-layer",
                width,
                height,
                viewState,
                data: data_selection,
                dotSize,
                colorby
              })
            ]}
          />
        </div>
      </div>
    );
  }
}

LassoScatteplot.defaultProps = defaultProps;
export default LassoScatteplot;
