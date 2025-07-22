class TestPolygon extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
        this.addEventListeners();
    }

    render() {
        this.shadowRoot.innerHTML = `
      <style>
        .draggable {
          width: 200px;
          height: 100px;
          display: inline-block;
          border: 1px solid #ccc;
          cursor: grab;
          margin-bottom: 10px;
        }

        .dropzone {
          width: 100%;
          height: 120px;
          border: 2px dashed #999;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f5f5f5;
          color: #666;
          font-family: sans-serif;
        }

        svg {
          width: 100%;
          height: 100%;
        }

        polygon {
          fill: lightblue;
          stroke: blue;
          stroke-width: 2;
        }
      </style>

      <div class="draggable" draggable="true" data-id="test-poly">
        <svg viewBox="0 0 200 100" preserveAspectRatio="xMidYMid meet">
          <polygon points="50,10 150,10 100,90"></polygon>
        </svg>
      </div>

      <div class="dropzone">Drop here</div>
    `;
    }

    addEventListeners() {
        const wrapper = this.shadowRoot.querySelector('.draggable');
        const dropzone = this.shadowRoot.querySelector('.dropzone');

        wrapper.addEventListener('click', () => {
            const id = wrapper.getAttribute('data-id');
            console.log('✅ Polygon clicked:', id);
        });

        wrapper.addEventListener('dragstart', (e) => {
            const id = wrapper.getAttribute('data-id');
            console.log('✅ Drag started on polygon:', id);
            e.dataTransfer.setData('text/plain', id);
            e.dataTransfer.effectAllowed = 'move';

            const dragIcon = document.createElement('canvas');
            dragIcon.width = 20;
            dragIcon.height = 20;
            const ctx = dragIcon.getContext('2d');
            ctx.fillStyle = 'rgba(0,0,255,0.5)';
            ctx.beginPath();
            ctx.moveTo(10, 0);
            ctx.lineTo(20, 20);
            ctx.lineTo(0, 20);
            ctx.closePath();
            ctx.fill();
            e.dataTransfer.setDragImage(dragIcon, 10, 10);
        });

        // Позволяет бросить объект
        dropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
        });

        dropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            const id = e.dataTransfer.getData('text/plain');
            console.log('✅ Dropped polygon with id:', id);

            // Например, показать сообщение
            dropzone.textContent = `Polygon "${id}" dropped!`;
        });
    }
}

customElements.define('test-polygon', TestPolygon);
