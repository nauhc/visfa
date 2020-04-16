import React, { PureComponent } from "react";

const arrInRange = N => {
  return Array.from({ length: N }, (v, k) => k);
};

const defaultProps = {
  colorNumber: 20,
  textNumber: 4,
  width: 6.5,
  height: 20,
  //leftLegendColors and rightLegendColors are functions that map
  // any value between [0,1] to a color
  leftLegendColors: [],
  rightLegendColors: []
};

class DoubleColorTintsLegends extends PureComponent {
  render() {
    const {
      colorNumber,
      textNumber,
      width,
      height,
      leftLegendColors,
      rightLegendColors
    } = this.props;

    const colorLegendRight = arrInRange(colorNumber).map(i => {
      return (
        <rect
          id={`blue${i}`}
          key={`blue${i}`}
          x={colorNumber * width + i * width}
          y={0}
          width={width}
          height={height}
          fill={rightLegendColors[i]}
        />
      );
    });
    const colorLegendLeft = arrInRange(colorNumber).map(i => {
      return (
        <rect
          id={`red${i}`}
          key={`red${i}`}
          x={(colorNumber - i) * width}
          y={0}
          width={width}
          height={height}
          fill={leftLegendColors[i]}
        />
      );
    });
    const colorLendRightText = arrInRange(textNumber).map(i => {
      const x =
        colorNumber * width + i * ((colorNumber * width) / (textNumber - 1));
      return (
        <text
          id={`blue${i}-t`}
          key={`blue${i}-t`}
          fontSize={10}
          fill="black"
          x={x}
          y={30}
          transform={`rotate(45 ${x} 30)`}
        >
          {Math.pow(10, i)}
        </text>
      );
    });

    const colorLendLeftText = arrInRange(textNumber).map(i => {
      const x =
        (textNumber - i - 1) * ((colorNumber * width) / (textNumber - 1));
      return (
        <text
          id={`red${i}-t`}
          key={`red${i}-t`}
          fontSize={10}
          fill="black"
          x={x}
          y={30}
          transform={`rotate(45 ${x} 30)`}
        >
          {-Math.pow(10, i)}
        </text>
      );
    });

    return (
      <svg width={400} height={50}>
        {colorLegendRight}
        {colorLendRightText}
        {colorLegendLeft}
        {colorLendLeftText}
      </svg>
    );
  }
}

DoubleColorTintsLegends.defaultProps = defaultProps;
export default DoubleColorTintsLegends;
