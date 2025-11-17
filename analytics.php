<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Analytics Dashboard - Body Peptide Map</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
    <style>
        .stat-card {
            background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
            padding: 1.5rem;
            border-radius: 0.5rem;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
            border: 1px solid #374151;
        }
        .stat-value {
            font-size: 2.25rem;
            font-weight: bold;
            color: #60a5fa;
            margin-bottom: 0.5rem;
        }
        .stat-label {
            color: #9ca3af;
            font-size: 0.875rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        .table-container {
            overflow-x: auto;
            background: #1f2937;
            border-radius: 0.5rem;
            border: 1px solid #374151;
        }
        table {
            width: 100%;
            font-size: 0.875rem;
            text-align: left;
        }
        thead {
            font-size: 0.75rem;
            color: #9ca3af;
            text-transform: uppercase;
            background: #111827;
        }
        th {
            padding: 0.75rem 1.5rem;
        }
        td {
            padding: 1rem 1.5rem;
            border-top: 1px solid #374151;
        }
        tr:hover {
            background: #1f2937;
        }
    </style>
</head>
<body class="bg-gray-900 text-white min-h-screen p-8">
    <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="flex justify-between items-center mb-8">
            <div>
                <h1 class="text-4xl font-bold mb-2">📊 Analytics Dashboard</h1>
                <p class="text-gray-400">Body Peptide Map - User Interaction Analytics</p>
            </div>
            <div class="flex gap-4">
                <select id="timeRange" class="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white">
                    <option value="1">Last 24 hours</option>
                    <option value="7" selected>Last 7 days</option>
                    <option value="30">Last 30 days</option>
                    <option value="90">Last 90 days</option>
                </select>
                <button onclick="exportData()" class="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-semibold transition">
                    Export CSV
                </button>
                <a href="index.html" class="bg-gray-700 hover:bg-gray-600 px-6 py-2 rounded-lg font-semibold transition">
                    Back to Site
                </a>
            </div>
        </div>

        <!-- Stats Overview -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div class="stat-card">
                <div class="stat-value" id="totalClicks">-</div>
                <div class="stat-label">Total Clicks</div>
            </div>
            <div class="stat-card">
                <div class="stat-value" id="totalPageViews">-</div>
                <div class="stat-label">Page Views</div>
            </div>
            <div class="stat-card">
                <div class="stat-value" id="totalSearches">-</div>
                <div class="stat-label">Searches</div>
            </div>
        </div>

        <!-- Charts -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div class="stat-card">
                <h3 class="text-xl font-bold mb-4">Clicks by Hour</h3>
                <canvas id="clicksByHourChart"></canvas>
            </div>
            <div class="stat-card">
                <h3 class="text-xl font-bold mb-4">Top Elements Clicked</h3>
                <canvas id="topClicksChart"></canvas>
            </div>
        </div>

        <!-- Top Clicks Table -->
        <div class="mb-8">
            <h2 class="text-2xl font-bold mb-4">🎯 Most Popular Elements</h2>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Element ID</th>
                            <th>Type</th>
                            <th>Text/Label</th>
                            <th>Click Count</th>
                            <th>% of Total</th>
                        </tr>
                    </thead>
                    <tbody id="topClicksTable">
                        <tr>
                            <td colspan="5" class="text-center text-gray-500">Loading...</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Top Searches Table -->
        <div class="mb-8">
            <h2 class="text-2xl font-bold mb-4">🔍 Popular Search Terms</h2>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Search Query</th>
                            <th>Search Count</th>
                            <th>% of Total</th>
                        </tr>
                    </thead>
                    <tbody id="topSearchesTable">
                        <tr>
                            <td colspan="3" class="text-center text-gray-500">Loading...</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Insights -->
        <div class="stat-card">
            <h2 class="text-2xl font-bold mb-4">💡 Key Insights</h2>
            <div id="insights" class="space-y-3 text-gray-300">
                <p>Loading insights...</p>
            </div>
        </div>
    </div>

    <script>
        let clicksByHourChart, topClicksChart;
        let analyticsData = null;

        // Fetch analytics data
        async function fetchAnalytics(days = 7) {
            try {
                const response = await fetch(`php/api/summary.php?days=${days}`);
                const data = await response.json();
                analyticsData = data;
                updateDashboard(data);
            } catch (error) {
                console.error('Error fetching analytics:', error);
                showError('Failed to load analytics data');
            }
        }

        // Update dashboard with data
        function updateDashboard(data) {
            // Update stats
            document.getElementById('totalClicks').textContent = formatNumber(data.totalClicks);
            document.getElementById('totalPageViews').textContent = formatNumber(data.totalPageViews);
            document.getElementById('totalSearches').textContent = formatNumber(data.totalSearches);

            // Update charts
            updateClicksByHourChart(data.clicksByHour);
            updateTopClicksChart(data.topClicks);

            // Update tables
            updateTopClicksTable(data.topClicks, data.totalClicks);
            updateTopSearchesTable(data.topSearches, data.totalSearches);

            // Generate insights
            generateInsights(data);
        }

        // Update clicks by hour chart
        function updateClicksByHourChart(data) {
            const ctx = document.getElementById('clicksByHourChart').getContext('2d');
            
            if (clicksByHourChart) {
                clicksByHourChart.destroy();
            }

            const labels = Array.from({ length: 24 }, (_, i) => `${i}:00`);
            const clickData = new Array(24).fill(0);
            
            data.forEach(row => {
                clickData[parseInt(row.hour)] = row.clicks;
            });

            clicksByHourChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Clicks',
                        data: clickData,
                        backgroundColor: 'rgba(59, 130, 246, 0.6)',
                        borderColor: 'rgba(59, 130, 246, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                            },
                            ticks: {
                                color: '#9ca3af'
                            }
                        },
                        x: {
                            grid: {
                                display: false
                            },
                            ticks: {
                                color: '#9ca3af'
                            }
                        }
                    }
                }
            });
        }

        // Update top clicks chart
        function updateTopClicksChart(data) {
            const ctx = document.getElementById('topClicksChart').getContext('2d');
            
            if (topClicksChart) {
                topClicksChart.destroy();
            }

            const top10 = data.slice(0, 10);
            const labels = top10.map(item => 
                item.element_text || item.element_id || item.element_type
            ).map(label => label.length > 20 ? label.substring(0, 20) + '...' : label);
            const counts = top10.map(item => item.clicks);

            topClicksChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Clicks',
                        data: counts,
                        backgroundColor: 'rgba(34, 197, 94, 0.6)',
                        borderColor: 'rgba(34, 197, 94, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    indexAxis: 'y',
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        x: {
                            beginAtZero: true,
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                            },
                            ticks: {
                                color: '#9ca3af'
                            }
                        },
                        y: {
                            grid: {
                                display: false
                            },
                            ticks: {
                                color: '#9ca3af'
                            }
                        }
                    }
                }
            });
        }

        // Update top clicks table
        function updateTopClicksTable(data, total) {
            const tbody = document.getElementById('topClicksTable');
            
            if (!data || data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" class="text-center text-gray-500">No data available</td></tr>';
                return;
            }

            tbody.innerHTML = data.slice(0, 20).map(item => {
                const percentage = total > 0 ? ((item.clicks / total) * 100).toFixed(1) : 0;
                return `
                    <tr class="hover:bg-gray-750">
                        <td class="text-blue-400">${item.element_id || '-'}</td>
                        <td class="text-gray-300">${item.element_type}</td>
                        <td class="text-gray-300">${item.element_text || '-'}</td>
                        <td class="font-semibold text-green-400">${formatNumber(item.clicks)}</td>
                        <td class="text-gray-400">${percentage}%</td>
                    </tr>
                `;
            }).join('');
        }

        // Update top searches table
        function updateTopSearchesTable(data, total) {
            const tbody = document.getElementById('topSearchesTable');
            
            if (!data || data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="3" class="text-center text-gray-500">No data available</td></tr>';
                return;
            }

            tbody.innerHTML = data.slice(0, 20).map(item => {
                const percentage = total > 0 ? ((item.count / total) * 100).toFixed(1) : 0;
                return `
                    <tr class="hover:bg-gray-750">
                        <td class="text-blue-400">"${item.query}"</td>
                        <td class="font-semibold text-green-400">${formatNumber(item.count)}</td>
                        <td class="text-gray-400">${percentage}%</td>
                    </tr>
                `;
            }).join('');
        }

        // Generate insights
        function generateInsights(data) {
            const insights = [];

            // Most popular element
            if (data.topClicks && data.topClicks.length > 0) {
                const topElement = data.topClicks[0];
                const label = topElement.element_text || topElement.element_id || topElement.element_type;
                insights.push(`🏆 <strong>"${label}"</strong> is your most clicked element with ${formatNumber(topElement.clicks)} clicks`);
            }

            // Most popular search
            if (data.topSearches && data.topSearches.length > 0) {
                const topSearch = data.topSearches[0];
                insights.push(`🔍 Users search for <strong>"${topSearch.query}"</strong> most often (${topSearch.count} times)`);
            }

            // Peak hour
            if (data.clicksByHour && data.clicksByHour.length > 0) {
                const peakHour = data.clicksByHour.reduce((max, item) => 
                    item.clicks > max.clicks ? item : max
                , data.clicksByHour[0]);
                insights.push(`⏰ Peak activity occurs at <strong>${peakHour.hour}:00</strong> with ${peakHour.clicks} clicks`);
            }

            // Engagement rate
            if (data.totalClicks && data.totalPageViews) {
                const engagementRate = (data.totalClicks / data.totalPageViews).toFixed(2);
                insights.push(`📈 Average <strong>${engagementRate} clicks per page view</strong>`);
            }

            if (insights.length === 0) {
                insights.push('No data yet. Start using the site to generate analytics!');
            }

            document.getElementById('insights').innerHTML = insights.map(insight => 
                `<p class="flex items-start gap-3"><span class="text-xl">•</span><span>${insight}</span></p>`
            ).join('');
        }

        // Format numbers with commas
        function formatNumber(num) {
            return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }

        // Show error message
        function showError(message) {
            console.error(message);
            alert('Error loading analytics data. Please check console.');
        }

        // Export data to CSV
        function exportData() {
            window.open('php/api/export-clicks.php', '_blank');
        }

        // Time range change handler
        document.getElementById('timeRange').addEventListener('change', (e) => {
            fetchAnalytics(parseInt(e.target.value));
        });

        // Auto-refresh every 60 seconds
        setInterval(() => {
            const days = parseInt(document.getElementById('timeRange').value);
            fetchAnalytics(days);
        }, 60000);

        // Initial load
        fetchAnalytics(7);
    </script>
</body>
</html>
