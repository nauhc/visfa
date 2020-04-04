import classifyPoint from "robust-point-in-polygon";

export default class lasso {
  constructor(containerDom, opts = {}) {
    this.config = {};

    this.config.containerDom = containerDom;
    this.config.width = opts.width || containerDom.clientWidth;
    this.config.height = opts.height || containerDom.clientHeight;
    this.config.closePathDistance = opts.closePathDistance || 10000;

    this.config.nodes = opts.nodes;

    this.config.onLassoEnd = opts.onLassoEnd;
  }

  begin() {
    // console.log("lasso.js begin");
    const maskDom = document.createElement("div");

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", this.config.width);
    svg.setAttribute("height", this.config.height);

    maskDom.appendChild(svg);

    maskDom.style.width = this.config.width + "px";
    maskDom.style.height = this.config.height + "px";
    maskDom.style.position = "absolute";
    maskDom.style.zIndex = 1;
    maskDom.style.left = 0;
    maskDom.style.top = 0;

    this.selectMask = maskDom;
    this.svg = svg;

    this.config.containerDom.appendChild(maskDom);

    this.g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    this.g.classList.add("lasso");
    this.svg.appendChild(this.g);

    this.dyn_path = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "path"
    );
    this.dyn_path.classList.add("drawn");
    this.g.appendChild(this.dyn_path);

    // add a closed path
    this.close_path = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "path"
    );
    this.close_path.classList.add("loop_close");
    this.g.appendChild(this.close_path);

    // add an origin node
    this.origin_node = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle"
    );
    this.origin_node.classList.add("origin");
    this.g.appendChild(this.origin_node);

    // console.log("this.dyn_path:", this.dyn_path)
    // console.log("this.close_path:", this.close_path)
    // console.log("this.origin_node:", this.origin_node)

    this.selectMask.onmousedown = e => {
      this.ifBegin = true;

      // console.log("onmousedown", e.offsetX, e.offsetY)

      this.startX = e.offsetX;
      this.startY = e.offsetY;

      this.drawnCoords = [[this.startX, this.startY]];

      // console.log("this.origin_node:,this.dyn_path:", this.origin_node,this.dyn_path)

      this.origin_node.setAttribute("cx", this.startX);
      this.origin_node.setAttribute("cy", this.startY);
      this.origin_node.setAttribute("r", 3);
      this.origin_node.setAttribute("display", null);

      this.tpath = "M " + this.startX + " " + this.startY;

      this.dyn_path.setAttribute("d", this.tpath);
    };

    this.selectMask.onmousemove = e => {
      if (!this.ifBegin) return;

      let currentX = e.offsetX,
        currentY = e.offsetY;

      this.drawnCoords.push([currentX, currentY]);

      this.tpath = this.tpath + " L " + currentX + " " + currentY;
      this.dyn_path.setAttribute("d", this.tpath);
      let close_draw_path =
        "M " +
        currentX +
        " " +
        currentY +
        " L " +
        this.startX +
        " " +
        this.startY;
      this.close_path.setAttribute("d", close_draw_path);

      let distance = Math.sqrt(
        Math.pow(currentX - this.startX, 2) +
          Math.pow(currentY - this.startY, 2)
      );
      let isPathClosed = distance <= this.config.closePathDistance;
      if (isPathClosed) {
        this.close_path.setAttribute("display", null);
      } else {
        this.close_path.setAttribute("display", "none");
      }
    };

    this.selectMask.onmouseup = e => {
      this.ifBegin = false;
      // TODO: clear
      this.dyn_path.removeAttribute("d");
      this.close_path.removeAttribute("d");
      this.origin_node.setAttribute("display", "none");

      if (this.config.onLassoEnd) {
        let selected = [];
        // console.log("this.drawnCoords", this.drawnCoords);
        // console.log("this.config.nodes", this.config.nodes);
        for (let item of this.config.nodes) {
          const tmp = classifyPoint(this.drawnCoords, [item.x, item.y]);
          if (tmp < 1) {
            // console.log("node in path:", item);
            selected.push(item);
          }
        }
        this.config.onLassoEnd(selected);
      }
    };
  }

  destroy() {
    this.config.containerDom.removeChild(this.selectMask);
  }
}
