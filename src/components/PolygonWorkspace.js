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
          background: var(--bg-workspace, #fff);
          overflow: hidden;
          position: relative;
          user-select: none;
        }

        .polygon-container {
          position: relative;
          width: 100%;
          height: 100%;
          transform-origin: top left;
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
          pointer-events: none;
        }

        .scale-line {
          stroke: #aaa;
          stroke-width: 1;
        }

        .scale-text {
          font-size: 10px;
          fill: #888;
        }

        polygon {
          fill: var(--polygon-fill, lightblue);
          stroke: var(--polygon-stroke, blue);
          stroke-width: 2;
        }
          #grid {
            position: absolute;
            top: 0; left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none; /* чтобы сетка не перехватывала события */
            z-index: 1;
            }
        #content {
            position: relative;
            z-index: 2;
            }
      </style>
      <div class="polygon-container">
        <svg id="grid"></svg>
        <div id="content"></div>
      </div>
    `;
        this.setPolygons(this.polygons);
        this.updateTransform();
        this.drawScale();
    }

    updateTransform() {
        const content = this.shadowRoot.querySelector('#content');
        content.style.transform = `translate(${this.offsetX}px, ${this.offsetY}px) scale(${this.scale})`;
        this.drawScale();
    }


    drawScale() {
        const svg = this.shadowRoot.querySelector('#grid');
        svg.innerHTML = '';

        const width = svg.clientWidth;
        const height = svg.clientHeight;
        const step = 50;

        const startX = -this.offsetX / this.scale;
        const startY = -this.offsetY / this.scale;
        const endX = (width - this.offsetX) / this.scale;
        const endY = (height - this.offsetY) / this.scale;

        for (let x = Math.floor(startX / step) * step; x < endX; x += step) {
            const sx = x * this.scale + this.offsetX;

            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', sx);
            line.setAttribute('y1', 0);
            line.setAttribute('x2', sx);
            line.setAttribute('y2', height);
            line.setAttribute('class', 'scale-line');
            svg.appendChild(line);

            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', sx + 2);
            text.setAttribute('y', 10);
            text.setAttribute('class', 'scale-text');
            text.textContent = Math.round(x);
            svg.appendChild(text);
        }

        for (let y = Math.floor(startY / step) * step; y < endY; y += step) {
            const sy = y * this.scale + this.offsetY;

            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', 0);
            line.setAttribute('y1', sy);
            line.setAttribute('x2', width);
            line.setAttribute('y2', sy);
            line.setAttribute('class', 'scale-line');
            svg.appendChild(line);

            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', 2);
            text.setAttribute('y', sy - 2);
            text.setAttribute('class', 'scale-text');
            text.textContent = Math.round(y);
            svg.appendChild(text);
        }
    }


    attachEvents() {
        const container = this.shadowRoot.querySelector('.polygon-container');

        container.addEventListener('wheel', (e) => {
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

        container.addEventListener('mousedown', (e) => {
            if (e.button !== 0) return;
            this.isDragging = true;
            this.dragStart.x = e.clientX - this.offsetX;
            this.dragStart.y = e.clientY - this.offsetY;
        });

        window.addEventListener('mouseup', () => {
            this.isDragging = false;
        });

        window.addEventListener('mousemove', (e) => {
            if (!this.isDragging) return;
            this.offsetX = e.clientX - this.dragStart.x;
            this.offsetY = e.clientY - this.dragStart.y;
            this.updateTransform();
        });

        this.shadowRoot.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
        });

        this.shadowRoot.addEventListener('drop', (e) => {
            e.preventDefault();
            const data = e.dataTransfer.getData('application/json');
            if (!data) return;

            const poly = JSON.parse(data);
            const rect = container.getBoundingClientRect();
            const x = (e.clientX - rect.left - this.offsetX) / this.scale;
            const y = (e.clientY - rect.top - this.offsetY) / this.scale;

            poly.x = x;
            poly.y = y;

            // Обновляем массив: либо добавляем новый, либо заменяем существующий
            const index = this.polygons.findIndex(p => p.id === poly.id);
            if (index >= 0) {
                this.polygons[index] = poly;
            } else {
                this.polygons.push(poly);
            }

            // Перерисовываем полигоны с обновлёнными координатами
            this.setPolygons(this.polygons);

            this.dispatchEvent(new CustomEvent('polygon-dropped', {
                bubbles: true,
                composed: true,
                detail: { polygon: poly }
            }));
        });

    }

    setPolygons(polygons) {
        this.polygons = polygons || [];
        const content = this.shadowRoot.querySelector('#content');
        if (!content) return;

        content.innerHTML = '';

        this.polygons.forEach(poly => {
            const wrapper = document.createElement('div');
            wrapper.classList.add('draggable');
            wrapper.setAttribute('draggable', 'true');
            wrapper.setAttribute('data-id', poly.id);
            wrapper.style.left = poly.x + 'px';
            wrapper.style.top = poly.y + 'px';

            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('viewBox', '0 0 120 100');

            const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
            polygon.setAttribute('points', poly.points);
            polygon.setAttribute('fill', poly.fill || 'rgba(128,0,0,0.6)');
            polygon.setAttribute('stroke', poly.stroke || '#800000');
            polygon.setAttribute('stroke-width', '2');

            svg.appendChild(polygon);
            wrapper.appendChild(svg);
            content.appendChild(wrapper);

            wrapper.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('application/json', JSON.stringify(poly));
                e.dataTransfer.setData('from', this.getAttribute('data-area'));
                e.dataTransfer.effectAllowed = 'move';
            });
        });
    }

    getPolygons() {
        return this.polygons;
    }
}

customElements.define('polygon-workspace', PolygonWorkspace);
