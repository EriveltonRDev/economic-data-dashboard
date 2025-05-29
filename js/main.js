/**
 * main.js - Lógica principal do dashboard
 * 
 * Este arquivo contém a lógica principal do dashboard, incluindo
 * inicialização, manipulação de eventos e atualização de dados.
 */

// Elementos do DOM
const indicatorSelect = document.getElementById('indicator-select');
const countryCheckboxes = document.querySelectorAll('.country-checkbox input');
const yearRange = document.getElementById('year-range');
const yearStart = document.getElementById('year-start');
const yearEnd = document.getElementById('year-end');
const updateBtn = document.getElementById('update-btn');
const loadingOverlay = document.getElementById('loading-overlay');
const themeToggle = document.querySelector('.theme-toggle');

// Estado da aplicação
let currentData = null;
let isDarkTheme = false;

/**
 * Inicializa o dashboard
 */
async function initDashboard() {
  // Inicializa os gráficos
  window.charts.initCharts();
  
  // Configura os listeners de eventos
  setupEventListeners();
  
  // Carrega os dados iniciais
  await updateDashboard();
}

/**
 * Configura os listeners de eventos
 */
function setupEventListeners() {
  // Atualiza o dashboard quando o botão é clicado
  updateBtn.addEventListener('click', async () => {
    await updateDashboard();
  });
  
  // Atualiza o texto do ano quando o slider é movido
  yearRange.addEventListener('input', () => {
    yearEnd.textContent = yearRange.value;
  });
  
  // Alterna entre tema claro e escuro
  themeToggle.addEventListener('click', toggleTheme);
}

/**
 * Atualiza o dashboard com novos dados
 */
async function updateDashboard() {
  try {
    // Mostra o overlay de carregamento
    loadingOverlay.style.display = 'flex';
    
    // Obtém o indicador selecionado
    const indicator = indicatorSelect.value;
    
    // Obtém os países selecionados
    const selectedCountries = Array.from(countryCheckboxes)
      .filter(checkbox => checkbox.checked)
      .map(checkbox => checkbox.value);
    
    // Verifica se pelo menos um país está selecionado
    if (selectedCountries.length === 0) {
      alert('Selecione pelo menos um país.');
      loadingOverlay.style.display = 'none';
      return;
    }
    
    // Obtém o ano final selecionado
    const endYear = parseInt(yearRange.value);
    
    // Busca os dados da API
    const data = await window.api.fetchIndicatorForCountries(indicator, selectedCountries);
    
    // Processa os dados para os gráficos
    currentData = window.api.processDataForCharts(data, endYear);
    
    // Atualiza os gráficos e estatísticas
    window.charts.updateCharts(currentData);
    window.charts.updateStats(currentData.stats);
    
    // Atualiza o título do dashboard
    updateDashboardTitle(indicator);
    
  } catch (error) {
    console.error('Erro ao atualizar o dashboard:', error);
    alert('Ocorreu um erro ao atualizar os dados. Por favor, tente novamente.');
  } finally {
    // Esconde o overlay de carregamento
    loadingOverlay.style.display = 'none';
  }
}

/**
 * Atualiza o título do dashboard com base no indicador selecionado
 * @param {string} indicator - Código do indicador
 */
function updateDashboardTitle(indicator) {
  const indicatorName = window.api.INDICATORS[indicator];
  document.title = `Dashboard - ${indicatorName}`;
}

/**
 * Alterna entre tema claro e escuro
 */
function toggleTheme() {
  isDarkTheme = !isDarkTheme;
  
  // Atualiza o ícone
  const icon = themeToggle.querySelector('i');
  if (isDarkTheme) {
    icon.classList.remove('fa-moon');
    icon.classList.add('fa-sun');
    document.body.classList.add('dark-theme');
  } else {
    icon.classList.remove('fa-sun');
    icon.classList.add('fa-moon');
    document.body.classList.remove('dark-theme');
  }
  
  // Atualiza os gráficos para refletir o novo tema
  if (currentData) {
    window.charts.updateCharts(currentData);
  }
}

/**
 * Função para personalizar o nome do usuário no footer
 * @param {string} name - Nome do usuário
 */
function setUserName(name) {
  const footerText = document.querySelector('footer p:first-child');
  footerText.innerHTML = footerText.innerHTML.replace('[Seu Nome]', name);
}

// Inicializa o dashboard quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  initDashboard();
  
  // Personaliza o nome do usuário (deve ser substituído pelo nome real)
  setUserName('Seu Nome');
});
