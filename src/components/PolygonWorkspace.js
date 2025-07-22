class PolygonWorkspace extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });

        this.scale = 1;
        this.offsetX = 0;
        this.offsetY = 0;
        this.isDragging = false;
        this.dragStart = { x: 0, y: 0 };
        this.polygons = [];
    }

    setPolygons(polygons) {
        this.polygons = polygons;
    }

    getPolygons() {
        return this.polygons;
    }

    connectedCallback() {
        this.setAttribute('data-area', 'workspace');
        this.render();
        this.attachEvents();
    }

    render() {
        this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          height: 400px;
          border: 1px solid #444;
          background: var(--bg-workspace);
          overflow: hidden;
          position: relative;
          user-select: none;
        }

        .polygon-container {
          position: relative;
          width: 100%;
          height: 100%;
          transform-origin: top left;
          transform: translate(${this.offsetX}px, ${this.offsetY}px) scale(${this.scale});
        }

        .draggable {
          position: absolute;
          width: 120px;
          height: 100px;
          cursor: grab;
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
      <div class="polygon-container"></div>
    `;

        this.setPolygons(this.polygons);
    }

    attachEvents() {
        const container = this.shadowRoot.querySelector('.polygon-container');

        // Зум колесом
        this.shadowRoot.addEventListener('wheel', (e) => {
            e.preventDefault();
            const delta = -e.deltaY * 0.001;
            let newScale = this.scale + delta;
            newScale = Math.min(Math.max(newScale, 0.1), 10);

            const rect = container.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            this.offsetX = mouseX - ((mouseX - this.offsetX) / this.scale) * newScale;
            this.offsetY = mouseY - ((mouseY - this.offsetY) / this.scale) * newScale;

            this.scale = newScale;
            this.updateTransform();
        });

        // Панорамирование
        // this.shadowRoot.addEventListener('mousedown', (e) => {
        //     if (e.button !== 0) return;
        //     this.isDragging = true;
        //     this.dragStart.x = e.clientX - this.offsetX;
        //     this.dragStart.y = e.clientY - this.offsetY;
        // });

        // window.addEventListener('mouseup', () => {
        //     this.isDragging = false;
        // });

        // window.addEventListener('mousemove', (e) => {
        //     if (!this.isDragging) return;
        //     this.offsetX = e.clientX - this.dragStart.x;
        //     this.offsetY = e.clientY - this.dragStart.y;
        //     this.updateTransform();
        // });



        // Drag and drop
        this.shadowRoot.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
        });

        this.shadowRoot.addEventListener('drop', (e) => {
            e.preventDefault();
            const data = e.dataTransfer.getData('application/json');
            const from = e.dataTransfer.getData('from');
            const to = this.getAttribute('data-area');
            if (!data) return;

            const poly = JSON.parse(data);

            const rect = this.shadowRoot.querySelector('.polygon-container').getBoundingClientRect();
            const x = (e.clientX - rect.left - this.offsetX) / this.scale;
            const y = (e.clientY - rect.top - this.offsetY) / this.scale;

            poly.x = x;
            poly.y = y;

            this.dispatchEvent(new CustomEvent('polygon-dropped', {
                bubbles: true,
                composed: true,
                detail: { polygon: poly, from, to }
            }));
        });
    }

    updateTransform() {
        const container = this.shadowRoot.querySelector('.polygon-container');
        container.style.transform = `translate(${this.offsetX}px, ${this.offsetY}px) scale(${this.scale})`;
    }

    setPolygons(polygons) {
        this.polygons = polygons || [];
        const container = this.shadowRoot.querySelector('.polygon-container');
        if (!container) return;

        container.innerHTML = '';

        this.polygons.forEach(poly => {
            const wrapper = document.createElement('div');
            wrapper.classList.add('draggable');
            wrapper.setAttribute('draggable', 'true');
            wrapper.setAttribute('data-id', poly.id);
            wrapper.style.left = poly.x + 'px';
            wrapper.style.top = poly.y + 'px';

            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('viewBox', '0 0 200 100');

            const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
            polygon.setAttribute('points', poly.points);
            polygon.setAttribute('fill', poly.fill || 'rgba(128,0,0,0.6)');
            polygon.setAttribute('stroke', poly.stroke || '#800000');
            polygon.setAttribute('stroke-width', '2');

            svg.appendChild(polygon);
            wrapper.appendChild(svg);
            container.appendChild(wrapper);

            wrapper.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('application/json', JSON.stringify(poly));
                e.dataTransfer.setData('from', this.getAttribute('data-area'));
                e.dataTransfer.effectAllowed = 'move';
            });
        });
    }
}

customElements.define('polygon-workspace', PolygonWorkspace);
