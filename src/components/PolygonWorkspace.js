class PolygonWorkspace extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
    }

    render() {
        this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          border: 1px solid #888;
          height: 400px;
          background: #fff;
          position: relative;
          overflow: hidden;
        }
        svg {
          width: 100%;
          height: 100%;
          background: #fafafa;
        }
        /* Здесь потом добавим оси, полигоны, зум и панорамирование */
      </style>
      <svg viewBox="0 0 800 400" preserveAspectRatio="xMidYMid meet">
        <!-- Поля для полигонов и осей -->
      </svg>
    `;
    }
}

customElements.define('polygon-workspace', PolygonWorkspace);
