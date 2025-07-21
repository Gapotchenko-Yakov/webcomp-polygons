class PolygonBuffer extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.polygons = [];
    }

    connectedCallback() {
        this.render();
    }

    setPolygons(polygons) {
        this.polygons = polygons;
        this.render();
    }

    render() {
        this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          border: 1px solid #888;
          height: 200px;
          overflow: auto;
          margin-bottom: 10px;
          background: #f0f0f0;
          padding: 5px;
        }
        svg {
          width: 100%;
          height: 100%;
        }
        polygon {
          fill: rgba(0, 150, 255, 0.5);
          stroke: #0066cc;
          stroke-width: 2;
          cursor: grab;
        }
      </style>
      <svg viewBox="0 0 400 200" preserveAspectRatio="xMidYMid meet">
        ${this.polygons.map(poly => `<polygon points="${poly.points}"></polygon>`).join('')}
      </svg>
    `;
    }
}

customElements.define('polygon-buffer', PolygonBuffer);
