// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: AGPL-3.0-or-later
import './components/AppControls.js';
import './components/PolygonBuffer.js';
import './components/PolygonWorkspace.js';


const controls = document.querySelector('app-controls');
const buffer = document.querySelector('polygon-buffer');
const workspace = document.querySelector('polygon-workspace');

let bufferPolygons = [];
let workspacePolygons = [];

controls.addEventListener('create-polygons', () => {
    // Создаём 5-20 случайных полигонов
    bufferPolygons = generateRandomPolygons();
    buffer.setPolygons(bufferPolygons);
    workspace.setPolygons([]);
    workspacePolygons = [];
});

controls.addEventListener('save-polygons', () => {
    const data = { bufferPolygons, workspacePolygons };
    localStorage.setItem('polygons', JSON.stringify(data));
    alert('Полигоны сохранены!');
});

controls.addEventListener('reset-polygons', () => {
    localStorage.removeItem('polygons');
    bufferPolygons = [];
    workspacePolygons = [];
    buffer.setPolygons([]);
    workspace.setPolygons([]);
    alert('Данные очищены');
});

// При загрузке страницы — восстанавливаем данные, если есть
window.addEventListener('DOMContentLoaded', () => {
    const saved = localStorage.getItem('polygons');
    if (saved) {
        const data = JSON.parse(saved);
        bufferPolygons = data.bufferPolygons || [];
        workspacePolygons = data.workspacePolygons || [];
        buffer.setPolygons(bufferPolygons);
        workspace.setPolygons(workspacePolygons);
    }
});

function generateRandomPolygons() {
    const count = Math.floor(Math.random() * 16) + 5; // 5-20
    const polygons = [];

    for (let i = 0; i < count; i++) {
        const verticesCount = Math.floor(Math.random() * 6) + 3; // 3-8 вершин
        const points = [];

        for (let v = 0; v < verticesCount; v++) {
            const x = Math.floor(Math.random() * 300) + 20;
            const y = Math.floor(Math.random() * 150) + 20;
            points.push(`${x},${y}`);
        }

        polygons.push({ id: `poly-${i}`, points: points.join(' ') });
    }
    return polygons;
}
