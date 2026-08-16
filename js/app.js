const MAPS = {
    customs: { name: "Customs", imageUrl: "./assets/maps/customs.webp", width: 4097, height: 2142, spawns: { project: 7, financial: 7 } },
    factory: { name: "Factory", imageUrl: "./assets/maps/factory.png", width: 850, height: 850, spawns: { project: 5, blueprints: 5 } },
    ground_zero: { name: "Ground Zero", imageUrl: "./assets/maps/ground_zero.webp", width: 6920, height: 6920, spawns: { medical: 7, user: 7 } },
    interchange: { name: "Interchange", imageUrl: "./assets/maps/interchange.webp", width: 9600, height: 5400, spawns: { blueprints: 7, financial: 7 } },
    icebreaker: { name: "Icebreaker", imageUrl: "./assets/maps/icebreaker.webp", width: 7680, height: 4320, spawns: { test: 7, pmc: 7 } },
    lab: { name: "Lab", imageUrl: "./assets/maps/lab.webp", width: 3820, height: 2189, spawns: { user: 7, medical: 7 } },
    labyrinth: { name: "Labyrinth", imageUrl: "./assets/maps/labyrinth.webp", width: 4145, height: 3840, spawns: { blueprints: 7, medical: 7 } },
    lighthouse: { name: "Lighthouse", imageUrl: "./assets/maps/lighthouse.png", width: 2242, height: 3892, spawns: { pmc: 7, technical: 7 } },
    reserve: { name: "Reserve", imageUrl: "./assets/maps/reserve.webp", width: 4701, height: 2785, spawns: { pmc: 7, project: 7 } },
    shoreline: { name: "Shoreline", imageUrl: "./assets/maps/shoreline.webp", width: 6668, height: 4567, spawns: { test: 7, technical: 7 } },
    streets_of_tarkov: { name: "Streets of Tarkov", imageUrl: "./assets/maps/streets_of_tarkov.webp", width: 7620, height: 5877, spawns: { financial: 7, user: 7 } },
    woods: { name: "Woods", imageUrl: "./assets/maps/woods.webp", width: 6994, height: 6843, spawns: { test: 7, technical: 7 } }
};

// 현재 언어 데이터 참조
const currentLang = window.CURRENT_LANG || 'ko';
const langData = I18N[currentLang] || I18N.ko;
const CATEGORIES = langData.categories;

let map = null;
let currentMapId = 'factory';
let currentImageOverlay = null;
const layerGroups = {};
const activeFilters = new Set();
let categoryCounts = {};

function getMapFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const mapParam = params.get('map');
    if (mapParam && MAPS[mapParam]) {
        return mapParam;
    }
    return 'factory';
}

function updateLangSwitchUrl() {
    const langBtn = document.getElementById('lang-switch-btn');
    if (langBtn) {
        langBtn.href = `${langData.langBtnTarget}?map=${currentMapId}`;
    }
}

function setupUI() {
    document.getElementById('ui-title').innerText = langData.title;
    document.getElementById('ui-subtitle').innerText = langData.subtitle;
    document.getElementById('ui-categories-header').innerText = langData.categoriesHeader;

    const copyrightEl = document.getElementById('ui-copyright');
    if (copyrightEl) copyrightEl.innerHTML = langData.copyright;

    const langBtn = document.getElementById('lang-switch-btn');
    langBtn.innerText = langData.langBtnText;

    const select = document.getElementById('map-select');
    select.innerHTML = '';
    Object.entries(langData.mapNames).forEach(([key, name]) => {
        const option = document.createElement('option');
        option.value = key;
        option.innerText = name;
        select.appendChild(option);
    });
}

function initMap() {
    // 레이어 그룹 초기화
    Object.keys(CATEGORIES).forEach(catKey => {
        layerGroups[catKey] = L.layerGroup();
    });

    setupUI();
    currentMapId = getMapFromUrl();
    document.getElementById('map-select').value = currentMapId;

    map = L.map('map', {
        crs: L.CRS.Simple,
        minZoom: -5,
        maxZoom: 3,
        zoomSnap: 0.1,
        attributionControl: false,
        zoomControl: false
    });

    L.control.zoom({ position: 'bottomleft' }).addTo(map);

    setupCoordinateTracker();
    setupModalEvents();
    loadMap(currentMapId);
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.getElementById('sidebar-toggle-btn');
    sidebar.classList.toggle('collapsed');

    toggleBtn.innerText = sidebar.classList.contains('collapsed') ? '▶' : '◀';

    setTimeout(() => {
        if (map) map.invalidateSize();
    }, 310);
}

function setupCoordinateTracker() {
    const coordDiv = document.getElementById('coord-overlay');

    map.on('mousemove', function (e) {
        const y = Math.round(e.latlng.lat);
        const x = Math.round(e.latlng.lng);
        coordDiv.innerText = langData.coordText(y, x);
    });

    map.on('click', function (e) {
        const y = Math.round(e.latlng.lat);
        const x = Math.round(e.latlng.lng);
        const coordString = `[${y}, ${x}],`;

        navigator.clipboard.writeText(coordString).then(() => {
            coordDiv.innerText = langData.copiedText(coordString);
            setTimeout(() => {
                coordDiv.innerText = langData.coordText(y, x);
            }, 1500);
        });
    });
}

function openDetailModal(data) {
    const modalBody = document.getElementById('modal-body');

    // 이미지 배열 정규화
    let imgList = [];
    if (Array.isArray(data.detailImg)) {
        imgList = data.detailImg;
    } else if (data.detailImg) {
        imgList = [data.detailImg];
    }

    const imgsHTML = imgList.map(src => `<img src="${src}" alt="detail screenshot" />`).join('');
    const hasText = data.detailTitle || (langData.showDetailDesc && data.detailDesc);

    modalBody.innerHTML = `
        <div class="modal-detail">
            ${hasText ? `
                <div class="modal-text-section">
                    ${data.detailTitle ? `<h3>${data.detailTitle}</h3>` : ''}
                    ${(langData.showDetailDesc && data.detailDesc) ? `<p>${data.detailDesc}</p>` : ''}
                </div>
            ` : ''}
            <div class="modal-images-section">
                ${imgsHTML}
            </div>
        </div>
    `;
    document.getElementById('detail-modal').style.display = 'flex';

    if (typeof gtag === 'function') {
        const mapName = MAPS[currentMapId]?.name || currentMapId;
        const formattedTitle = `[${mapName}] ${data.detailTitle || data.id || 'unknown'}`;

        gtag('event', 'click_marker_detail', {
            'map_id': currentMapId,
            'category': data.category,
            'marker_id': data.id || 'unknown',
            'marker_title': formattedTitle
        });
    }
}

function closeDetailModal() {
    document.getElementById('detail-modal').style.display = 'none';
}

function setupModalEvents() {
    document.getElementById('detail-modal').addEventListener('click', (e) => {
        if (e.target.id === 'detail-modal') closeDetailModal();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeDetailModal();
    });
}

// 🌟 [신규] 맵 변경 시 해당 맵에서 스폰하는 카테고리를 필터 기본값(Checked)으로 리셋
function resetFiltersForMap(mapId) {
    const mapConfig = MAPS[mapId];
    const spawns = mapConfig ? mapConfig.spawns : {};

    activeFilters.clear();
    Object.keys(CATEGORIES).forEach(key => {
        const isAlwaysActiveCategory = (key === 'transit' || key === 'temporary');
        const isSpawningInCurrentMap = spawns.hasOwnProperty(key);

        if (isAlwaysActiveCategory || isSpawningInCurrentMap) {
            activeFilters.add(key);
        }
    });
}

function loadMap(mapId) {
    currentMapId = mapId;
    updateLangSwitchUrl();
    const mapConfig = MAPS[mapId];

    map.setMaxBounds(null);
    if (currentImageOverlay) map.removeLayer(currentImageOverlay);

    // 🌟 맵 전환 시 이전 마커 완전히 지우기 & 해당 맵 필터 상태 전원 활성화 리셋
    clearAllMarkers();
    resetFiltersForMap(mapId);

    const bounds = [[0, 0], [mapConfig.height, mapConfig.width]];
    currentImageOverlay = L.imageOverlay(mapConfig.imageUrl, bounds).addTo(map);

    map.fitBounds(bounds, { animate: false });

    const padY = mapConfig.height * 0.6;
    const padX = mapConfig.width * 0.6;
    map.setMaxBounds([
        [-padY, -padX],
        [mapConfig.height + padY, mapConfig.width + padX]
    ]);

    updateMapSpawnInfo();

    if (window[`MAP_DATA_${mapId}`]) {
        renderMarkers(window[`MAP_DATA_${mapId}`]);
        return;
    }

    const script = document.createElement('script');
    script.src = `./data/${mapId}.js`;

    script.onload = () => {
        renderMarkers(window[`MAP_DATA_${mapId}`] || []);
    };

    script.onerror = () => {
        renderMarkers([]);
    };

    document.body.appendChild(script);
}

function switchMap(mapId) {
    loadMap(mapId);

    if (typeof gtag === 'function') {
        gtag('event', 'select_map', {
            'map_id': mapId,
            'map_name': MAPS[mapId] ? MAPS[mapId].name : mapId
        });
    }
}

function updateMapSpawnInfo() {
    const mapConfig = MAPS[currentMapId];
    const spawns = mapConfig ? mapConfig.spawns : {};
    const summaryBox = document.getElementById('map-spawn-summary');

    if (summaryBox && mapConfig) {
        let html = `<div class="summary-title"><span>${langData.raidSpawnsTitle}</span> <span style="font-size: 0.75rem; color: #888;"></span></div><ul>`;
        Object.entries(spawns).forEach(([catKey, count]) => {
            const catInfo = CATEGORIES[catKey];
            if (catInfo) {
                const spawnLabel = count > 1 ? 'Spawns' : 'Spawn';
                html += `<li><img src="${catInfo.icon}" onError="this.style.display='none';" /> ${catInfo.name}: <strong style="color: #e5b35c; margin-left: 4px;">${count} ${spawnLabel}</strong></li>`;
            }
        });
        html += `</ul>`;
        summaryBox.innerHTML = html;
    }

    renderFilterUI();
}

function renderMarkers(markersData) {
    const mapConfig = MAPS[currentMapId];

    // 1. 카테고리별 마커 수 카운팅
    categoryCounts = {};
    Object.keys(CATEGORIES).forEach(catKey => {
        categoryCounts[catKey] = 0;
    });
    markersData.forEach(data => {
        if (categoryCounts[data.category] !== undefined) {
            categoryCounts[data.category]++;
        }
    });

    // 2. UI 갱신
    renderFilterUI();

    // 3. 새로운 마커 생성 및 레이어 그룹에 추가
    markersData.forEach(data => {
        const catInfo = CATEGORIES[data.category];
        const iconSrc = catInfo ? catInfo.icon : '';

        const customIcon = L.divIcon({
            html: `<img src="${iconSrc}" class="map-marker-img" onError="this.onerror=null; this.src='https://via.placeholder.com/20?text=📍';" />`,
            className: 'custom-map-icon',
            iconSize: [20, 20],
            iconAnchor: [10, 10]
        });

        const marker = L.marker(data.coords, { icon: customIcon });

        if (data.category === 'transit') {
            const transitText = data.title || data.detailTitle || 'Transit';
            marker.bindTooltip(transitText, {
                className: 'transit-tooltip',
                direction: 'top',
                offset: [0, -15],
                opacity: 1
            });
        } else {
            if (data.previewImg) {
                const tooltipHTML = `<div class="hover-photo-frame"><img src="${data.previewImg}" alt="preview" /></div>`;

                marker.bindTooltip(tooltipHTML, {
                    className: 'custom-tooltip-photo',
                    direction: 'top',
                    offset: [0, -15],
                    opacity: 1
                });

                marker.on('tooltipopen', (e) => {
                    const tooltipEl = e.tooltip ? e.tooltip._container : null;
                    const container = document.getElementById('map-container');

                    if (tooltipEl && container) {
                        tooltipEl.style.marginLeft = '0px';
                        tooltipEl.style.marginTop = '0px';

                        const tRect = tooltipEl.getBoundingClientRect();
                        const cRect = container.getBoundingClientRect();

                        let shiftX = 0;
                        let shiftY = 0;

                        if (tRect.right > cRect.right - 10) {
                            shiftX = cRect.right - 10 - tRect.right;
                        }
                        if (tRect.left < cRect.left + 10) {
                            shiftX = cRect.left + 10 - tRect.left;
                        }
                        if (tRect.bottom > cRect.bottom - 10) {
                            shiftY = cRect.bottom - 10 - tRect.bottom;
                        }
                        if (tRect.top < cRect.top + 10) {
                            shiftY = cRect.top + 10 - tRect.top;
                        }

                        if (shiftX !== 0) tooltipEl.style.marginLeft = `${shiftX}px`;
                        if (shiftY !== 0) tooltipEl.style.marginTop = `${shiftY}px`;
                    }

                    if (typeof gtag === 'function') {
                        const mapName = MAPS[currentMapId]?.name || currentMapId;
                        const formattedTitle = `[${mapName}] ${data.detailTitle || data.id || 'unknown'}`;

                        gtag('event', 'hover_marker_preview', {
                            'map_id': currentMapId,
                            'category': data.category,
                            'marker_id': data.id || 'unknown',
                            'marker_title': formattedTitle
                        });
                    }
                });
            }

            const hasClickDetail = langData.showDetailDesc
                ? (data.detailImg || data.detailTitle || data.detailDesc)
                : (data.detailImg || data.detailTitle);

            if (hasClickDetail) {
                marker.on('click', () => {
                    openDetailModal(data);
                });
            }
        }

        if (layerGroups[data.category]) {
            layerGroups[data.category].addLayer(marker);
        }
    });

    // 4. activeFilters 에 등록된 레이어만 지도에 표시
    Object.keys(CATEGORIES).forEach(catKey => {
        if (activeFilters.has(catKey)) {
            layerGroups[catKey].addTo(map);
        }
    });
}

function clearAllMarkers() {
    Object.keys(CATEGORIES).forEach(catKey => {
        if (layerGroups[catKey]) {
            layerGroups[catKey].clearLayers(); // 레이어 안의 마커 내용 삭제
            if (map && map.hasLayer(layerGroups[catKey])) {
                map.removeLayer(layerGroups[catKey]); // 지도에서 레이어 분리
            }
        } else {
            layerGroups[catKey] = L.layerGroup();
        }
    });
}

function renderFilterUI() {
    const container = document.getElementById('category-filters');
    container.innerHTML = '';

    const previewBox = document.getElementById('global-category-preview');
    const previewImg = document.getElementById('global-preview-img');
    const previewDesc = document.getElementById('global-preview-desc');

    const mapConfig = MAPS[currentMapId];
    const spawns = mapConfig ? mapConfig.spawns : {};

    Object.entries(CATEGORIES).forEach(([key, cat]) => {
        const isAlwaysActiveCategory = (key === 'transit' || key === 'temporary');
        const isSpawningInCurrentMap = spawns.hasOwnProperty(key);
        const shouldBeEnabled = isAlwaysActiveCategory || isSpawningInCurrentMap;

        let spawnBadge = "";
        if (isAlwaysActiveCategory) {
            spawnBadge = "";
        } else if (isSpawningInCurrentMap) {
            const count = spawns[key];
            const spawnLabel = count > 1 ? 'Spawns' : 'Spawn';
            spawnBadge = `<span class="category-spawn-badge" style="color: #e5b35c; font-size: 0.8rem; margin-left: auto; font-weight: bold;">[${count} ${spawnLabel}]</span>`;
        } else {
            spawnBadge = `<span class="category-spawn-badge" style="color: #666; font-size: 0.8rem; margin-left: auto;">[No Spawn]</span>`;
        }

        const isActive = activeFilters.has(key);
        const markerCount = categoryCounts[key] || 0;
        const displayName = `${cat.name} (${markerCount})`;

        const item = document.createElement('label');
        item.className = `category-item ${shouldBeEnabled ? (isActive ? '' : 'inactive') : 'disabled-category'}`;

        item.innerHTML = `
            <input type="checkbox" value="${key}" ${isActive ? 'checked' : ''} ${shouldBeEnabled ? '' : 'disabled'} onchange="toggleCategory('${key}', this.checked, this.parentElement)">
            <span class="category-name" style="width: 100%;">
                <img src="${cat.icon}" class="filter-icon-img" onError="this.style.display='none';" />
                <span class="category-text">${displayName}</span>
                ${spawnBadge}
            </span>
        `;

        item.addEventListener('mouseenter', () => {
            const rect = item.getBoundingClientRect();
            previewImg.src = cat.image;
            previewImg.onerror = () => {
                previewImg.src = `https://via.placeholder.com/220x140/222/e5b35c?text=${cat.name}`;
            };

            if (previewDesc) {
                previewDesc.innerText = cat.desc || '';
                previewDesc.style.display = cat.desc ? 'block' : 'none';
            }

            previewBox.style.top = `${rect.top}px`;
            previewBox.style.left = `${rect.right + 10}px`;
            previewBox.style.display = 'block';
        });

        item.addEventListener('mouseleave', () => {
            previewBox.style.display = 'none';
        });

        container.appendChild(item);
    });
}

function toggleCategory(categoryKey, isChecked, labelElement) {
    if (isChecked) {
        activeFilters.add(categoryKey);
        if (layerGroups[categoryKey]) map.addLayer(layerGroups[categoryKey]);
        if (labelElement) labelElement.classList.remove('inactive');
    } else {
        activeFilters.delete(categoryKey);
        if (layerGroups[categoryKey]) map.removeLayer(layerGroups[categoryKey]);
        if (labelElement) labelElement.classList.add('inactive');
    }

    if (typeof gtag === 'function') {
        gtag('event', 'filter_category', {
            'category': categoryKey,
            'state': isChecked ? 'on' : 'off'
        });
    }
}

window.onload = initMap;