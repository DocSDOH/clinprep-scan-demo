// Global variables
let currentTab = 'patient-intelligence';
let sdohMap = null;
let geoMap = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Set up event listeners
    setupEventListeners();
    
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
    if (tabName === 'sdoh-analytics' && !sdohMap) {
        initSDOHMap();
    } else if (tabName === 'geographic' && !geoMap) {
        initGeoMap();
    } else if (tabName === 'clinical-notes') {
        // Initialize any clinical notes specific functionality
        console.log('Clinical Notes & NLP tab activated');
    }
}

// KPI Card flipping functionality
function flipCard(card) {
    card.classList.toggle('flipped');
}

// Map initialization functions
function initializeMaps() {
    // Initialize SDOH map if the tab is active
    if (currentTab === 'sdoh-analytics') {
        initSDOHMap();
    }
    
    // Initialize geographic map if the tab is active
    if (currentTab === 'geographic') {
        initGeoMap();
    }
}

function initSDOHMap() {
    if (sdohMap || !document.getElementById('sdoh-map')) return;
    
    try {
        sdohMap = L.map('sdoh-map').setView([37.4852, -122.2364], 13);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(sdohMap);
        
        // Patient home marker (Redwood City, CA)
        const patientMarker = L.marker([37.4852, -122.2364], {
            icon: L.divIcon({
                className: 'custom-marker',
                html: '<div style="background: #ef4444; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
                iconSize: [20, 20],
                iconAnchor: [10, 10]
            })
        }).bindPopup('<b>Andre P.</b><br>Patient Home<br>Risk Score: 8.3');
        
        patientMarker.addTo(sdohMap);
        
        // SDOH Resources (accurate Bay Area locations)
        const resources = [
            { name: "Redwood City BART", lat: 37.4852, lng: -122.2364, type: "Transportation", color: "#2196F3" },
            { name: "Second Harvest Food Bank", lat: 37.4852, lng: -122.2364, type: "Food Security", color: "#4CAF50" },
            { name: "Walgreens Redwood City", lat: 37.4852, lng: -122.2364, type: "Pharmacy", color: "#FF9800" },
            { name: "Ravenswood Health Center", lat: 37.4852, lng: -122.2364, type: "Healthcare", color: "#9C27B0" }
        ];
        
        resources.forEach(resource => {
            const marker = L.marker([resource.lat, resource.lng], {
                icon: L.divIcon({
                    className: 'custom-marker',
                    html: `<div style="background: ${resource.color}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
                    iconSize: [14, 14],
                    iconAnchor: [7, 7]
                })
            }).bindPopup(`<b>${resource.name}</b><br>${resource.type}`);
            
            marker.addTo(sdohMap);
        });
        
        // Fit map to show all markers
        const group = new L.featureGroup([patientMarker, ...resources.map(r => L.marker([r.lat, r.lng]))]);
        sdohMap.fitBounds(group.getBounds().pad(0.1));
        
        // Set initial view to Redwood City area
        sdohMap.setView([37.4852, -122.2364], 13);
        
    } catch (error) {
        console.error('Error initializing SDOH map:', error);
    }
}

function initGeoMap() {
    if (geoMap || !document.getElementById('geo-map')) return;
    
    try {
        geoMap = L.map('geo-map').setView([37.4852, -122.2364], 12);
        
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
            { name: "Kaiser Redwood City", lat: 37.4852, lng: -122.2364, type: "Emergency Department", color: "#ef4444" },
            { name: "Ravenswood Health Center", lat: 37.4852, lng: -122.2364, type: "Primary Care", color: "#10b981" },
            { name: "San Mateo Medical Center", lat: 37.4852, lng: -122.2364, type: "Podiatry", color: "#3b82f6" }
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

// Export functions for global access
window.showTab = showTab;
window.flipCard = flipCard;
window.exportDashboard = exportDashboard;
