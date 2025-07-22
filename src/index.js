// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: AGPL-3.0-or-later
import './components/AppControls.js';
import './components/PolygonBuffer.js';
import './components/PolygonWorkspace.js';
import './components/TestPolygon.js';


const controls = document.querySelector('app-controls');
const buffer = document.querySelector('polygon-buffer');
const workspace = document.querySelector('polygon-workspace');


controls.addEventListener('create-polygons', () => {
    // Создаём 5-20 случайных полигонов
    const polys = generateRandomPolygons();
    buffer.setPolygons(polys);
    workspace.setPolygons([]);
});

controls.addEventListener('save-polygons', () => {
    const data = { bufferPolygons: buffer.getPolygons(), workspacePolygons: workspace.getPolygons() };
    localStorage.setItem('polygons', JSON.stringify(data));
    alert('Полигоны сохранены!');
});

controls.addEventListener('reset-polygons', () => {
    localStorage.removeItem('polygons');
    buffer.setPolygons([]);
    workspace.setPolygons([]);
    alert('Данные очищены');
});

// При загрузке страницы — восстанавливаем данные, если есть
window.addEventListener('DOMContentLoaded', () => {
    const saved = localStorage.getItem('polygons');
    if (saved) {
        const data = JSON.parse(saved);
        buffer.setPolygons(data.bufferPolygons || []);
        workspace.setPolygons(data.workspacePolygons || []);
    }
});

workspace.addEventListener('polygon-dropped', (e) => {
    const droppedPolygon = e.detail;

    // Удаляем из буфера
    const bufferPolygons = buffer.getPolygons().filter(p => p.id !== droppedPolygon.id);
    buffer.setPolygons(bufferPolygons);

    // Добавляем в рабочую зону
    workspace.setPolygons([...workspace.getPolygons(), droppedPolygon]);
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
