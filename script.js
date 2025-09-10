// Global variables
let currentTab = 'claims-analysis';
let geoMap = null;
let careMap = null;
let storyChart = null;
let currentStoryMode = 'current';
let dashboardVisible = false;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Set up event listeners
    setupEventListeners();
    
    // Initialize story curve
    initializeStoryCurve();
    
    // Initialize maps when needed
    initializeMaps();
    
    // Set default population
    updatePopulationDisplay('ma-medicare');
}

function setupEventListeners() {
    // Population selector
    const populationSelector = document.getElementById('population-selector');
    if (populationSelector) {
        populationSelector.addEventListener('change', function(e) {
            updatePopulationDisplay(e.target.value);
        });
    }
}

function updatePopulationDisplay(populationType) {
    // Update any population-specific content
    console.log('Population updated to:', populationType);
    
    // You can add population-specific logic here
    switch(populationType) {
        case 'ma-medicare':
            // MA Medicare specific updates
            break;
        case 'medicaid-homeless':
            // Medicaid homeless specific updates
            break;
        case 'api-demo':
            // API demo specific updates
            break;
    }
}

// Tab functionality
function showTab(tabName) {
    // Hide all tab panels
    const panels = document.querySelectorAll('.tab-panel');
    panels.forEach(panel => {
        panel.classList.remove('active');
    });
    
    // Remove active class from all tabs
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show selected panel
    const targetPanel = document.getElementById(tabName);
    if (targetPanel) {
        targetPanel.classList.add('active');
    }
    
    // Add active class to clicked tab
    event.target.classList.add('active');
    
    // Update current tab
    currentTab = tabName;
    
    // Initialize maps when their tabs are shown
    if (tabName === 'geographic-intelligence' && !geoMap) {
        initGeoMap();
    } else if (tabName === 'care-cartography' && !careMap) {
        initCareMap();
    }
}

// KPI Card flipping functionality
function flipCard(card) {
    card.classList.toggle('flipped');
}

// CDA Card toggling functionality
function toggleCDA(header) {
    const card = header.parentElement;
    const content = card.querySelector('.cda-content');
    
    if (content.style.display === 'none') {
        content.style.display = 'block';
        card.classList.remove('collapsed');
        card.classList.add('expanded');
    } else {
        content.style.display = 'none';
        card.classList.remove('expanded');
        card.classList.add('collapsed');
    }
}

// Map initialization functions
function initializeMaps() {
    // Initialize geographic map if the tab is active
    if (currentTab === 'geographic-intelligence') {
        initGeoMap();
    }
    
    // Initialize care cartography map if the tab is active
    if (currentTab === 'care-cartography') {
        initCareMap();
    }
}

function initCareMap() {
    if (careMap || !document.getElementById('careMap')) return;
    
    try {
        careMap = L.map('careMap').setView([37.4852, -122.2364], 11);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(careMap);
        
        // Patient home marker
        const patientMarker = L.marker([37.4852, -122.2364], {
            icon: L.divIcon({
                className: 'custom-marker',
                html: '<div style="background: #ef4444; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
                iconSize: [20, 20],
                iconAnchor: [10, 10]
            })
        }).bindPopup('<b>Andre P.</b><br>2014 El Camino Real<br>Redwood City, CA 94063');
        
        patientMarker.addTo(careMap);
        
        // Care sites with accurate coordinates
        const careSites = [
            { name: "Kaiser Redwood City", lat: 37.4852, lng: -122.2364, type: "ED Visits (2)", color: "#dc2626", address: "1150 Veterans Blvd, Redwood City, CA 94063" },
            { name: "Stanford Medical Center", lat: 37.4339, lng: -122.1700, type: "ED Visits (2)", color: "#dc2626", address: "300 Pasteur Dr, Stanford, CA 94305" },
            { name: "San Mateo Medical Center", lat: 37.5631, lng: -122.3580, type: "Podiatry", color: "#ea580c", address: "222 W 39th Ave, San Mateo, CA 94403" },
            { name: "Stanford Menlo Park Internal Medicine", lat: 37.4538, lng: -122.1817, type: "PCP (AWV/WMV)", color: "#059669", address: "1300 Crane St, Menlo Park, CA 94025" },
            { name: "Ravenswood Health Center", lat: 37.4683, lng: -122.1431, type: "SCAN Preferred", color: "#7c3aed", address: "1885 Bay Rd, East Palo Alto, CA 94303" },
            { name: "Fair Oaks Community Center", lat: 37.4852, lng: -122.2364, type: "HSA Office", color: "#d97706", address: "2600 Middlefield Rd, Redwood City, CA 94063" }
        ];
        
        careSites.forEach(site => {
            const marker = L.marker([site.lat, site.lng], {
                icon: L.divIcon({
                    className: 'custom-marker',
                    html: `<div style="background: ${site.color}; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
                    iconSize: [16, 16],
                    iconAnchor: [8, 8]
                })
            }).bindPopup(`<b>${site.name}</b><br>${site.type}<br>${site.address}`);
            
            marker.addTo(careMap);
            
            // Add journey line from patient home
            const line = L.polyline([
                [37.4852, -122.2364],
                [site.lat, site.lng]
            ], {
                color: site.color,
                weight: 2,
                opacity: 0.6,
                dashArray: '5, 5'
            });
            
            line.addTo(careMap);
        });
        
        // Add county boundaries (simplified)
        const sanMateoCounty = L.polygon([
            [37.7, -122.5],
            [37.7, -122.0],
            [37.3, -122.0],
            [37.3, -122.5]
        ], {
            color: '#0369a1',
            weight: 2,
            opacity: 0.3,
            fillOpacity: 0.1
        }).bindPopup('San Mateo County').addTo(careMap);
        
        // Fit map to show all markers
        const group = new L.featureGroup([patientMarker, ...careSites.map(s => L.marker([s.lat, s.lng]))]);
        careMap.fitBounds(group.getBounds().pad(0.1));
        
    } catch (error) {
        console.error('Error initializing care cartography map:', error);
    }
}

function initGeoMap() {
    if (geoMap || !document.getElementById('geoMap')) return;
    
    try {
        geoMap = L.map('geoMap').setView([37.4852, -122.2364], 12);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(geoMap);
        
        // Patient home marker (Redwood City, CA)
        const patientMarker = L.marker([37.4852, -122.2364], {
            icon: L.divIcon({
                className: 'custom-marker',
                html: '<div style="background: #ef4444; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
                iconSize: [20, 20],
                iconAnchor: [10, 10]
            })
        }).bindPopup('<b>Andre P.</b><br>Patient Home');
        
        patientMarker.addTo(geoMap);
        
        // Healthcare facilities (accurate Bay Area locations)
        const facilities = [
            { name: "Kaiser Redwood City", lat: 37.4852, lng: -122.2364, type: "Emergency Department", color: "#dc2626" },
            { name: "Stanford Medical Center", lat: 37.4339, lng: -122.1700, type: "Emergency Department", color: "#dc2626" },
            { name: "San Mateo Medical Center", lat: 37.5631, lng: -122.3580, type: "Podiatry", color: "#ea580c" },
            { name: "Stanford Menlo Park Internal Medicine", lat: 37.4538, lng: -122.1817, type: "PCP (AWV/WMV)", color: "#059669" },
            { name: "Ravenswood Health Center", lat: 37.4683, lng: -122.1431, type: "SCAN Preferred", color: "#7c3aed" }
        ];
        
        const markers = [patientMarker];
        
        facilities.forEach(facility => {
            const marker = L.marker([facility.lat, facility.lng], {
                icon: L.divIcon({
                    className: 'custom-marker',
                    html: `<div style="background: ${facility.color}; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
                    iconSize: [16, 16],
                    iconAnchor: [8, 8]
                })
            }).bindPopup(`<b>${facility.name}</b><br>${facility.type}`);
            
            marker.addTo(geoMap);
            markers.push(marker);
            
            // Add journey line
            const line = L.polyline([
                [37.4852, -122.2364],
                [facility.lat, facility.lng]
            ], {
                color: facility.color,
                weight: 2,
                opacity: 0.6,
                dashArray: '5, 5'
            });
            
            line.addTo(geoMap);
        });
        
        // Fit map to show all markers
        const group = new L.featureGroup(markers);
        geoMap.fitBounds(group.getBounds().pad(0.1));
        
        // Set initial view to Redwood City area
        geoMap.setView([37.4852, -122.2364], 12);
        
    } catch (error) {
        console.error('Error initializing geographic map:', error);
    }
}

// Export functionality
function exportDashboard() {
    // Create export data
    const exportData = {
        timestamp: new Date().toISOString(),
        population: document.getElementById('population-selector').value,
        currentTab: currentTab,
        kpiData: {
            biasRate: "0.0%",
            populationCoverage: "98.2%",
            highRiskDetection: "25.0%",
            fdaReady: "✓"
        },
        patientData: {
            name: "James Thompson",
            mrn: "EP-33291",
            riskScore: "9.9",
            riskClass: "critical"
        }
    };
    
    // Create and download JSON file
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `clinprep-dashboard-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Show success message
    showNotification('Dashboard exported successfully!', 'success');
}

// Notification system
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Style the notification
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '1rem 1.5rem',
        borderRadius: '0.5rem',
        color: 'white',
        fontWeight: '500',
        zIndex: '1000',
        opacity: '0',
        transform: 'translateX(100%)',
        transition: 'all 0.3s ease'
    });
    
    // Set background color based on type
    const colors = {
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6'
    };
    notification.style.backgroundColor = colors[type] || colors.info;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Utility functions
function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function formatRiskScore(score) {
    return parseFloat(score).toFixed(1);
}

// Error handling
window.addEventListener('error', function(e) {
    console.error('Application error:', e.error);
    showNotification('An error occurred. Please refresh the page.', 'error');
});

// Handle map errors gracefully
window.addEventListener('unhandledrejection', function(e) {
    if (e.reason && e.reason.message && e.reason.message.includes('map')) {
        console.error('Map error:', e.reason);
        showNotification('Map loading failed. Please check your internet connection.', 'warning');
    }
});

// Performance monitoring
function logPerformance() {
    if (window.performance && window.performance.timing) {
        const timing = window.performance.timing;
        const loadTime = timing.loadEventEnd - timing.navigationStart;
        console.log(`Page load time: ${loadTime}ms`);
    }
}

// Call performance logging after page load
window.addEventListener('load', logPerformance);

// Story Curve Functions
function initializeStoryCurve() {
    const canvas = document.getElementById('storyCurve');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Story data
    const storyData = {
        current: {
            data: [30, 45, 65, 70, 85, 100],
            color: '#dc2626',
            tension: 0.2,
            fill: false
        },
        optimized: {
            data: [30, 35, 25, 20, 18, 15],
            color: '#059669',
            tension: 0.1,
            fill: false
        }
    };
    
    if (storyChart) {
        storyChart.destroy();
    }
    
    storyChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Baseline', 'Month 1', 'Month 2', 'Month 3', 'Month 4', 'Month 5'],
            datasets: [{
                data: storyData[currentStoryMode].data,
                borderColor: storyData[currentStoryMode].color,
                borderWidth: 4,
                pointRadius: 8,
                pointBorderWidth: 0,
                pointBackgroundColor: storyData[currentStoryMode].color,
                tension: storyData[currentStoryMode].tension,
                fill: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { 
                legend: { display: false }, 
                tooltip: { enabled: false } 
            },
            scales: {
                x: { 
                    display: true, 
                    grid: { display: false },
                    ticks: { 
                        color: '#6b7280',
                        font: { size: 12 }
                    }
                },
                y: {
                    min: 0,
                    max: 110,
                    display: true,
                    grid: { 
                        display: true,
                        color: '#f3f4f6'
                    },
                    ticks: {
                        display: false
                    }
                }
            },
            elements: {
                point: {
                    hoverRadius: 10
                }
            }
        }
    });

    revealStoryMoments();
}

function showStoryMode(mode) {
    currentStoryMode = mode;
    
    // Update button states
    document.querySelectorAll('.story-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    // Reinitialize chart
    initializeStoryCurve();
}

function revealStoryMoments() {
    // Hide all moments first
    document.querySelectorAll('.story-moment').forEach(moment => {
        moment.style.display = 'none';
        moment.classList.remove('visible');
    });

    // Show moments for the current mode
    if (currentStoryMode === 'current') {
        // Show crisis moments with a staggered delay
        const moments = ['baseline', 'crisis1', 'trigger1', 'crisis2', 'crisis3'];
        moments.forEach((id, index) => {
            setTimeout(() => {
                const moment = document.getElementById(`moment-${id}`);
                if (moment) {
                    moment.style.display = 'block';
                    setTimeout(() => moment.classList.add('visible'), 100);
                }
            }, index * 800);
        });
    } else {
        // Show intervention moments with a hopeful progression
        const moments = ['intervention1', 'intervention2', 'intervention3'];
        moments.forEach((id, index) => {
            setTimeout(() => {
                const moment = document.getElementById(`moment-${id}`);
                if (moment) {
                    moment.style.display = 'block';
                    setTimeout(() => moment.classList.add('visible'), 100);
                }
            }, index * 800);
        });
    }
}

function showDataAnalysis() {
    dashboardVisible = !dashboardVisible;
    
    const patientCard = document.querySelector('.patient-card');
    const tabNavigation = document.querySelector('.tab-navigation');
    const tabContent = document.querySelector('.tab-content');
    const integrationSection = document.querySelector('.integration-section');
    
    if (dashboardVisible) {
        // Show dashboard elements
        if (patientCard) patientCard.style.display = 'block';
        if (tabNavigation) tabNavigation.style.display = 'flex';
        if (tabContent) tabContent.style.display = 'block';
        if (integrationSection) integrationSection.style.display = 'block';
        
        // Update button text
        event.target.textContent = 'Hide Data Analysis';
        
        // Scroll to dashboard
        setTimeout(() => {
            if (patientCard) patientCard.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    } else {
        // Hide dashboard elements
        if (patientCard) patientCard.style.display = 'none';
        if (tabNavigation) tabNavigation.style.display = 'none';
        if (tabContent) tabContent.style.display = 'none';
        if (integrationSection) integrationSection.style.display = 'none';
        
        // Update button text
        event.target.textContent = 'Show Data Analysis';
    }
}

// Export functions for global access
window.showTab = showTab;
window.flipCard = flipCard;
window.toggleCDA = toggleCDA;
window.exportDashboard = exportDashboard;
window.showStoryMode = showStoryMode;
window.showDataAnalysis = showDataAnalysis;
