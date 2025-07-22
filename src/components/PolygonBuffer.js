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
        console.log('this.polygons   ', this.polygons)

        this.shadowRoot.innerHTML = `
  <style>
    :host {
      display: block;
      border: 1px solid #888;
      height: 200px;
      overflow: auto;
      margin-bottom: 10px;
      background: var(--bg-buffer);
      padding: 5px;
    }

    .polygon-container {
      position: relative;  /* Система координат для абсолютного позиционирования */
      width: 100%;
      height: 100%;
    }

    .draggable {
      position: absolute;   /* Позволяет располагать по координатам */
      width: 120px;
      height: 100px;
      cursor: grab;
      border: 1px solid #ccc;
      box-sizing: border-box;
    }

    svg {
      width: 100%;
      height: 100%;
      display: block;
    }

    polygon {
      fill: var(--polygon-fill, lightblue);
      stroke: var(--polygon-stroke, blue);
      stroke-width: 2;
    }
  </style>

  <div class="polygon-container">
    ${this.polygons.map(poly => `
      <div
        class="draggable"
        draggable="true"
        data-id="${poly.id}"
        style="left: ${poly.x}px; top: ${poly.y}px;"
      >
        <svg viewBox="0 0 200 100" preserveAspectRatio="xMidYMid meet">
          <polygon points="${poly.points}"></polygon>
        </svg>
      </div>
    `).join('')}
  </div>
`;

        this.shadowRoot.querySelectorAll('.draggable').forEach(wrapper => {
            wrapper.addEventListener('click', (e) => {
                const id = wrapper.getAttribute('data-id');
                const polyData = this.polygons.find(p => p.id === id);
                console.log('✅ click on polygon', id, polyData);
            });

            wrapper.addEventListener('dragstart', (e) => {
                const id = wrapper.getAttribute('data-id');
                const polyData = this.polygons.find(p => p.id === id);
                console.log('✅ dragstart for polygon', id);
                e.dataTransfer.setData('application/json', JSON.stringify(polyData));
                e.dataTransfer.effectAllowed = 'move';

                const dragIcon = document.createElement('canvas');
                dragIcon.width = 20;
                dragIcon.height = 20;
                const ctx = dragIcon.getContext('2d');
                ctx.fillStyle = 'rgba(128,0,0,0.6)';
                ctx.beginPath();
                ctx.moveTo(10, 0);
                ctx.lineTo(20, 20);
                ctx.lineTo(0, 20);
                ctx.closePath();
                ctx.fill();
                e.dataTransfer.setDragImage(dragIcon, 10, 10);
            });
        });
    }

}

customElements.define('polygon-buffer', PolygonBuffer);
