class PolygonBuffer extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.polygons = [];
    }

    setPolygons(polygons) {
        this.polygons = polygons;
    }

    getPolygons() {
        return this.polygons;
    }

    connectedCallback() {
        this.render();
        this.setAttribute('data-area', 'buffer');

        this.shadowRoot.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
        });

        this.shadowRoot.addEventListener('drop', (e) => {
            e.preventDefault();
            const poly = JSON.parse(e.dataTransfer.getData('application/json'));
            const from = e.dataTransfer.getData('from');
            const to = this.getAttribute('data-area');

            // Координаты мыши — для позиционирования
            const rect = this.shadowRoot.querySelector('.polygon-container').getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Добавляем координаты в объект полигона
            poly.x = x;
            poly.y = y;

            this.dispatchEvent(new CustomEvent('polygon-dropped', {
                bubbles: true,
                composed: true,
                detail: { polygon: poly, from, to }
            }));
        });

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
        <svg viewBox="0 0 120 100" preserveAspectRatio="xMidYMid meet">
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
                const poly = this.polygons.find(p => p.id === id);
                console.log('✅ dragstart for polygon', id);
                e.dataTransfer.setData('application/json', JSON.stringify(poly));
                e.dataTransfer.effectAllowed = 'move';
                // Откуда тащим
                e.dataTransfer.setData('from', this.getAttribute('data-area'));
            });

        });
    }

}

customElements.define('polygon-buffer', PolygonBuffer);
