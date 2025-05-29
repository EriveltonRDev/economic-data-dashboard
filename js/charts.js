/**
 * charts.js - Configuração e gerenciamento dos gráficos
 * 
 * Este arquivo contém as funções para criar, atualizar e gerenciar
 * os gráficos do dashboard usando a biblioteca Chart.js.
 */

// Referências aos elementos canvas dos gráficos
const timeSeriesChartEl = document.getElementById('time-series-chart');
const comparisonChartEl = document.getElementById('comparison-chart');

// Instâncias dos gráficos
let timeSeriesChart = null;
let comparisonChart = null;

/**
 * Inicializa os gráficos com configurações padrão
 */
function initCharts() {
  // Configuração do gráfico de linha (evolução temporal)
  timeSeriesChart = new Chart(timeSeriesChartEl, {
    type: 'line',
    data: {
      labels: [],
      datasets: []
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            usePointStyle: true,
            boxWidth: 6
          }
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          callbacks: {
            label: function(context) {
              let label = context.dataset.label || '';
              if (label) {
                label += ': ';
              }
              if (context.parsed.y !== null) {
                label += formatValue(context.parsed.y, getCurrentIndicator());
              }
              return label;
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          }
        },
        y: {
          beginAtZero: false,
          ticks: {
            callback: function(value) {
              return formatValue(value, getCurrentIndicator(), true);
            }
          }
        }
      },
      interaction: {
        mode: 'nearest',
        axis: 'x',
        intersect: false
      },
      animations: {
        tension: {
          duration: 1000,
          easing: 'linear'
        }
      }
    }
  });

  // Configuração do gráfico de barras (comparação entre países)
  comparisonChart = new Chart(comparisonChartEl, {
    type: 'bar',
    data: {
      labels: [],
      datasets: []
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              let label = context.dataset.label || '';
              if (label) {
                label += ': ';
              }
              if (context.parsed.y !== null) {
                label += formatValue(context.parsed.y, getCurrentIndicator());
              }
              return label;
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          }
        },
        y: {
          beginAtZero: false,
          ticks: {
            callback: function(value) {
              return formatValue(value, getCurrentIndicator(), true);
            }
          }
        }
      },
      animations: {
        y: {
          duration: 1000,
          easing: 'easeOutQuad'
        }
      }
    }
  });
}

/**
 * Atualiza os gráficos com novos dados
 * @param {Object} chartData - Dados processados para os gráficos
 */
function updateCharts(chartData) {
  // Atualiza o gráfico de linha (evolução temporal)
  timeSeriesChart.data = chartData.timeSeriesData;
  timeSeriesChart.options.scales.y.title = {
    display: true,
    text: getCurrentIndicatorName()
  };
  timeSeriesChart.update();

  // Atualiza o gráfico de barras (comparação entre países)
  comparisonChart.data = chartData.comparisonData;
  comparisonChart.options.scales.y.title = {
    display: true,
    text: getCurrentIndicatorName()
  };
  comparisonChart.update();
}

/**
 * Atualiza os cards de estatísticas com os novos dados
 * @param {Object} stats - Estatísticas calculadas
 */
function updateStats(stats) {
  // Card 1: Total Global
  document.querySelector('#stat-card-1 .stat-value').textContent = 
    formatValue(stats.total, getCurrentIndicator());
  document.querySelector('#stat-card-1 .stat-change span').textContent = 
    `${stats.percentChange.toFixed(1)}%`;
  
  // Atualiza a cor da variação percentual
  const changeSpan = document.querySelector('#stat-card-1 .stat-change span');
  if (stats.percentChange > 0) {
    changeSpan.style.color = 'var(--success-color)';
    changeSpan.textContent = `+${stats.percentChange.toFixed(1)}%`;
  } else if (stats.percentChange < 0) {
    changeSpan.style.color = 'var(--danger-color)';
    changeSpan.textContent = `${stats.percentChange.toFixed(1)}%`;
  } else {
    changeSpan.style.color = 'var(--text-light)';
    changeSpan.textContent = '0%';
  }

  // Card 2: Média
  document.querySelector('#stat-card-2 .stat-value').textContent = 
    formatValue(stats.average, getCurrentIndicator());
  
  // Card 3: Maior Valor
  document.querySelector('#stat-card-3 .stat-value').textContent = 
    formatValue(stats.max.value, getCurrentIndicator());
  document.querySelector('#stat-card-3 .stat-country').textContent = 
    `País: ${stats.max.country}`;
  
  // Card 4: Menor Valor
  document.querySelector('#stat-card-4 .stat-value').textContent = 
    formatValue(stats.min.value, getCurrentIndicator());
  document.querySelector('#stat-card-4 .stat-country').textContent = 
    `País: ${stats.min.country}`;
}

/**
 * Formata valores numéricos de acordo com o tipo de indicador
 * @param {number} value - Valor a ser formatado
 * @param {string} indicator - Código do indicador
 * @param {boolean} short - Se true, usa formato abreviado para valores grandes
 * @returns {string} - Valor formatado
 */
function formatValue(value, indicator, short = false) {
  // Formata valores grandes (milhões, bilhões, etc.)
  function formatLargeNumber(num, short) {
    if (short) {
      if (num >= 1e12) return (num / 1e12).toFixed(1) + 'T';
      if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
      if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
      if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
      return num.toFixed(1);
    } else {
      return num.toLocaleString('pt-BR');
    }
  }

  switch (indicator) {
    case 'NY.GDP.MKTP.CD': // PIB
      return short ? 
        '$' + formatLargeNumber(value, true) : 
        '$' + formatLargeNumber(value, false);
    
    case 'NY.GDP.PCAP.CD': // PIB per capita
      return short ? 
        '$' + formatLargeNumber(value, true) : 
        '$' + formatLargeNumber(value, false);
    
    case 'SP.POP.TOTL': // População
      return formatLargeNumber(value, short);
    
    case 'IT.NET.USER.ZS': // Usuários de Internet
      return value.toFixed(1) + '%';
    
    case 'EN.ATM.CO2E.PC': // Emissões de CO2
      return value.toFixed(2) + (short ? 't' : ' ton');
    
    default:
      return value.toLocaleString('pt-BR');
  }
}

/**
 * Obtém o indicador atualmente selecionado
 * @returns {string} - Código do indicador
 */
function getCurrentIndicator() {
  return document.getElementById('indicator-select').value;
}

/**
 * Obtém o nome do indicador atualmente selecionado
 * @returns {string} - Nome do indicador
 */
function getCurrentIndicatorName() {
  const indicator = getCurrentIndicator();
  return window.api.INDICATORS[indicator];
}

// Exporta as funções para uso em outros arquivos
window.charts = {
  initCharts,
  updateCharts,
  updateStats,
  formatValue
};
