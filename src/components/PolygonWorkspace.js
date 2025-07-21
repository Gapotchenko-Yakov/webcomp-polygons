class PolygonWorkspace extends HTMLElement {
    constructor() {
        super();
        this.shadow = this.attachShadow({ mode: 'open' });

        this.scale = 1;
        this.offsetX = 0;
        this.offsetY = 0;
        this.isDragging = false;
        this.dragStart = { x: 0, y: 0 };
    }

    connectedCallback() {
        this.render();
        this.attachEvents();
    }

    render() {
        this.shadow.innerHTML = `
      <style>
        :host {
            display: block;
            height: 400px;
            border: 1px solid #444;
            user-select: none;
            overflow: hidden;
            position: relative;
            background: var(--bg-workspace);
        }

        svg {
            width: 100%;
            height: 100%;
            background: var(--bg-workspace);
            cursor: grab;
        }

        svg:active {
            cursor: grabbing;
        }

        polygon {
            fill: var(--polygon-fill);
            stroke: var(--polygon-stroke);
            stroke-width: 2;
            cursor: grab;
        }

        .scale-line {
            stroke: var(--axis-color);
            stroke-width: 1;
        }

        .scale-text {
            font-size: 10px;
            fill: var(--text-color);
        }

        /* Размещение осей слева и снизу */
        .axis-x {
            position: absolute;
            bottom: 0;
            left: 0;
            height: 20px;
            width: 100%;
            background: transparent;
        }

        .axis-y {
            position: absolute;
            top: 0;
            left: 0;
            width: 40px;
            height: 100%;
            background: transparent;
        }
        </style>
      <svg>
        <g id="scale"></g>
        <g id="content" transform="translate(${this.offsetX}, ${this.offsetY}) scale(${this.scale})"></g>
      </svg>
    `;
        this.drawScale();
    }

    drawScale() {
        const svg = this.shadow.querySelector('svg');
        const scaleGroup = this.shadow.querySelector('#scale');
        scaleGroup.innerHTML = '';

        const step = 50 / this.scale; // шаг шкалы зависит от масштаба, чтобы не было слишком частых линий
        const width = svg.clientWidth;
        const height = svg.clientHeight;

        // Горизонтальные линии и подписи по Y
        for (let y = 0; y < height / this.scale; y += step) {
            const lineY = y * this.scale + this.offsetY % (step * this.scale);
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', 0);
            line.setAttribute('y1', lineY);
            line.setAttribute('x2', width);
            line.setAttribute('y2', lineY);
            line.setAttribute('class', 'scale-line');
            scaleGroup.appendChild(line);

            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', 0);
            text.setAttribute('y', lineY - 2);
            text.setAttribute('class', 'scale-text');
            text.textContent = Math.round((lineY - this.offsetY) / this.scale);
            scaleGroup.appendChild(text);
        }

        // Вертикальные линии и подписи по X
        for (let x = 0; x < width / this.scale; x += step) {
            const lineX = x * this.scale + this.offsetX % (step * this.scale);
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', lineX);
            line.setAttribute('y1', 0);
            line.setAttribute('x2', lineX);
            line.setAttribute('y2', height);
            line.setAttribute('class', 'scale-line');
            scaleGroup.appendChild(line);

            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', lineX + 2);
            text.setAttribute('y', 10);
            text.setAttribute('class', 'scale-text');
            text.textContent = Math.round((lineX - this.offsetX) / this.scale);
            scaleGroup.appendChild(text);
        }
    }

    attachEvents() {
        const svg = this.shadow.querySelector('svg');

        // Зум колесиком мыши
        svg.addEventListener('wheel', (e) => {
            e.preventDefault();
            const delta = -e.deltaY * 0.001; // чувствительность
            let newScale = this.scale + delta;
            if (newScale < 0.1) newScale = 0.1;
            if (newScale > 10) newScale = 10;

            // Центрируем зум относительно курсора
            const rect = svg.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            // Смещаем offset так, чтобы зум был "под мышью"
            this.offsetX = mouseX - ((mouseX - this.offsetX) / this.scale) * newScale;
            this.offsetY = mouseY - ((mouseY - this.offsetY) / this.scale) * newScale;

            this.scale = newScale;
            this.updateTransform();
            this.drawScale();
        });

        // Панорамирование мышью (зажатие ЛКМ + движение)
        svg.addEventListener('mousedown', (e) => {
            if (e.button !== 0) return; // Только левая кнопка
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
            this.drawScale();
        });
    }

    updateTransform() {
        const content = this.shadow.querySelector('#content');
        content.setAttribute('transform', `translate(${this.offsetX}, ${this.offsetY}) scale(${this.scale})`);
    }

    setPolygons(polygons) {
        // polygons - массив объектов с координатами
        const content = this.shadow.querySelector('#content');
        content.innerHTML = '';
        polygons.forEach(poly => {
            const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
            polygon.setAttribute('points', poly.points.map(p => p.join(',')).join(' '));
            polygon.setAttribute('fill', poly.fill || 'rgba(100, 100, 200, 0.5)');
            polygon.setAttribute('stroke', poly.stroke || 'black');
            polygon.setAttribute('stroke-width', '1');
            content.appendChild(polygon);
        });
    }
}

customElements.define('polygon-workspace', PolygonWorkspace);
