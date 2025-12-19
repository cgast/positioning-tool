document.addEventListener('DOMContentLoaded', () => {
    const analyzeBtn = document.getElementById('analyze-btn');
    const textInput = document.getElementById('text-input');
    const downloadDataBtn = document.getElementById('download-data-btn');
    const downloadPngBtns = document.querySelectorAll('.download-btn');
    const statusDiv = document.getElementById('status');

    let chartData = {};

    analyzeBtn.addEventListener('click', async () => {
        const texts = textInput.value.split('\n').filter(text => text.trim() !== '');
        if (texts.length === 0) {
            alert('Please enter some text.');
            return;
        }

        statusDiv.textContent = 'Processing...';
        analyzeBtn.disabled = true;

        try {
            const response = await fetch('/api/process-texts/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ texts }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            const data1d = data['1d'].map((p, i) => [p[0], 0, texts[i]]);
            const data2d = data['2d'].map((p, i) => [p[0], p[1], texts[i]]);
            const data3d = data['3d'].map((p, i) => [p[0], p[1], p[2], texts[i]]);

            chartData = {
                texts: texts,
                embeddings: data.embeddings,
                '1d': data1d,
                '2d': data2d,
                '3d': data3d
            };

            render1DChart(data1d);
            render2DChart(data2d);
            render3DChart(data3d);

            statusDiv.textContent = 'Processing complete.';
        } catch (error) {
            console.error('Error processing texts:', error);
            statusDiv.textContent = 'An error occurred. Please try again.';
        } finally {
            analyzeBtn.disabled = false;
        }
    });

    downloadDataBtn.addEventListener('click', () => {
        downloadRawData(chartData);
    });

    downloadPngBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const chartId = btn.dataset.chart;
            downloadChartAsPNG(chartId);
        });
    });

    function render1DChart(data) {
        const chartDom = document.getElementById('chart-1d');
        const myChart = echarts.init(chartDom);
        const option = {
            tooltip: {
                formatter: params => params.data[2]
            },
            xAxis: {},
            yAxis: { show: false },
            series: [{
                symbolSize: 20,
                data: data,
                type: 'scatter',
                label: {
                    show: true,
                    formatter: params => params.data[2],
                    position: 'bottom'
                }
            }]
        };
        myChart.setOption(option);
    }

    function render2DChart(data) {
        const chartDom = document.getElementById('chart-2d');
        const myChart = echarts.init(chartDom);
        const option = {
            tooltip: {
                formatter: params => params.data[2]
            },
            xAxis: {},
            yAxis: {},
            series: [{
                symbolSize: 20,
                data: data,
                type: 'scatter',
                label: {
                    show: true,
                    formatter: params => params.data[2],
                    position: 'right'
                }
            }]
        };
        myChart.setOption(option);
    }

    function render3DChart(data) {
        const chartDom = document.getElementById('chart-3d');
        const myChart = echarts.init(chartDom);
        const option = {
            tooltip: {
                formatter: params => params.data[3]
            },
            xAxis3D: {},
            yAxis3D: {},
            zAxis3D: {},
            grid3D: {},
            series: [{
                symbolSize: 10,
                data: data,
                type: 'scatter3D',
                label: {
                    show: true,
                    formatter: params => params.data[3]
                }
            }]
        };
        myChart.setOption(option);
    }

    function downloadRawData(data) {
        if (!data || Object.keys(data).length === 0) {
            alert('No data to download. Please analyze some text first.');
            return;
        }
        const dataStr = JSON.stringify(data, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'positioning_data.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    function downloadChartAsPNG(chartId) {
        const chartDom = document.getElementById(`chart-${chartId}`);
        const chart = echarts.getInstanceByDom(chartDom);
        if (!chart) {
            alert('Chart not found.');
            return;
        }
        const dataUrl = chart.getDataURL({
            pixelRatio: 2,
            backgroundColor: '#fff'
        });
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = `chart-${chartId}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
});
