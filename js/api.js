/**
 * api.js - Funções para comunicação com a API DataBank
 * 
 * Este arquivo contém todas as funções necessárias para buscar e processar
 * dados da API DataBank (Indicadores de Desenvolvimento Mundial).
 */

// Configurações da API
const API_BASE_PATH = '/opt/.manus/.sandbox-runtime';
const INDICATORS = {
  'NY.GDP.MKTP.CD': 'PIB (US$)',
  'NY.GDP.PCAP.CD': 'PIB per capita (US$)',
  'SP.POP.TOTL': 'População Total',
  'IT.NET.USER.ZS': 'Usuários de Internet (% da população)',
  'EN.ATM.CO2E.PC': 'Emissões de CO2 (toneladas per capita)'
};

const COUNTRIES = {
  'BRA': 'Brasil',
  'USA': 'Estados Unidos',
  'CHN': 'China',
  'DEU': 'Alemanha',
  'JPN': 'Japão',
  'IND': 'Índia'
};

// Cores para os gráficos (correspondentes às variáveis CSS)
const CHART_COLORS = [
  '#4361ee', // --chart-color-1
  '#f72585', // --chart-color-2
  '#4cc9f0', // --chart-color-3
  '#560bad', // --chart-color-4
  '#7209b7', // --chart-color-5
  '#3a0ca3'  // --chart-color-6
];

/**
 * Busca dados de um indicador específico para um país
 * @param {string} indicator - Código do indicador
 * @param {string} country - Código do país (ISO 3166 alpha-3)
 * @returns {Promise<Object>} - Dados do indicador para o país
 */
async function fetchIndicatorData(indicator, country) {
  try {
    // Simulação da chamada à API DataBank
    // Em um ambiente real, isso seria substituído por uma chamada fetch real
    console.log(`Buscando dados para ${indicator} no país ${country}...`);
    
    // Simula o tempo de resposta da API
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Gera dados simulados para demonstração
    const currentYear = new Date().getFullYear();
    const data = {};
    
    // Gera dados para os últimos 33 anos (1990-2022)
    for (let year = 1990; year <= 2022; year++) {
      // Diferentes padrões de crescimento para diferentes indicadores
      let baseValue;
      let growthFactor;
      
      switch (indicator) {
        case 'NY.GDP.MKTP.CD': // PIB
          baseValue = getBaseGDP(country);
          growthFactor = 1.03 + (Math.random() * 0.04);
          break;
        case 'NY.GDP.PCAP.CD': // PIB per capita
          baseValue = getBaseGDPPerCapita(country);
          growthFactor = 1.02 + (Math.random() * 0.03);
          break;
        case 'SP.POP.TOTL': // População
          baseValue = getBasePopulation(country);
          growthFactor = 1.01 + (Math.random() * 0.01);
          break;
        case 'IT.NET.USER.ZS': // Usuários de Internet
          baseValue = 0.1; // Começa com 0.1% em 1990
          if (year < 2000) {
            growthFactor = 1.5 + (Math.random() * 0.5); // Crescimento rápido nos anos 90
          } else if (year < 2010) {
            growthFactor = 1.2 + (Math.random() * 0.3); // Crescimento moderado nos anos 2000
          } else {
            growthFactor = 1.05 + (Math.random() * 0.1); // Crescimento lento após 2010
          }
          // Limita a porcentagem máxima a 100%
          if (baseValue > 100) baseValue = 95 + (Math.random() * 5);
          break;
        case 'EN.ATM.CO2E.PC': // Emissões de CO2
          baseValue = getBaseCO2(country);
          // Alguns países reduzem emissões após 2010
          if (year > 2010 && ['USA', 'DEU', 'JPN'].includes(country)) {
            growthFactor = 0.98 + (Math.random() * 0.02);
          } else {
            growthFactor = 1.01 + (Math.random() * 0.02);
          }
          break;
        default:
          baseValue = 100;
          growthFactor = 1.02;
      }
      
      // Calcula o valor para o ano atual com base no valor anterior
      if (year === 1990) {
        data[year] = baseValue;
      } else {
        const previousYear = data[year - 1];
        // Adiciona alguma variação aleatória
        const randomVariation = 0.9 + (Math.random() * 0.2);
        data[year] = previousYear * growthFactor * randomVariation;
      }
      
      // Arredonda para 2 casas decimais
      data[year] = Math.round(data[year] * 100) / 100;
    }
    
    return {
      countryCode: country,
      countryName: COUNTRIES[country],
      indicatorCode: indicator,
      indicatorName: INDICATORS[indicator],
      data: data
    };
  } catch (error) {
    console.error('Erro ao buscar dados do indicador:', error);
    throw error;
  }
}

/**
 * Busca dados de um indicador para múltiplos países
 * @param {string} indicator - Código do indicador
 * @param {Array<string>} countries - Lista de códigos de países
 * @returns {Promise<Array<Object>>} - Dados do indicador para todos os países
 */
async function fetchIndicatorForCountries(indicator, countries) {
  try {
    const promises = countries.map(country => fetchIndicatorData(indicator, country));
    return await Promise.all(promises);
  } catch (error) {
    console.error('Erro ao buscar dados para múltiplos países:', error);
    throw error;
  }
}

/**
 * Processa os dados para exibição nos gráficos
 * @param {Array<Object>} data - Dados brutos da API
 * @param {number} endYear - Ano final para filtrar os dados
 * @returns {Object} - Dados processados para os gráficos
 */
function processDataForCharts(data, endYear) {
  // Dados para o gráfico de linha (evolução temporal)
  const timeSeriesData = {
    labels: Array.from({length: endYear - 1989}, (_, i) => 1990 + i),
    datasets: data.map((countryData, index) => {
      const yearData = [];
      for (let year = 1990; year <= endYear; year++) {
        yearData.push(countryData.data[year]);
      }
      
      return {
        label: countryData.countryName,
        data: yearData,
        borderColor: CHART_COLORS[index % CHART_COLORS.length],
        backgroundColor: CHART_COLORS[index % CHART_COLORS.length] + '20',
        borderWidth: 2,
        tension: 0.3,
        fill: false
      };
    })
  };
  
  // Dados para o gráfico de barras (comparação entre países)
  const comparisonData = {
    labels: data.map(countryData => countryData.countryName),
    datasets: [{
      label: INDICATORS[data[0].indicatorCode],
      data: data.map(countryData => countryData.data[endYear]),
      backgroundColor: CHART_COLORS.map(color => color + '80'),
      borderColor: CHART_COLORS,
      borderWidth: 1
    }]
  };
  
  // Estatísticas para os cards
  const latestValues = data.map(countryData => ({
    country: countryData.countryName,
    value: countryData.data[endYear]
  }));
  
  const total = latestValues.reduce((sum, item) => sum + item.value, 0);
  const average = total / latestValues.length;
  const max = latestValues.reduce((max, item) => item.value > max.value ? item : max, { value: -Infinity });
  const min = latestValues.reduce((min, item) => item.value < min.value ? item : min, { value: Infinity });
  
  // Calcula a variação percentual desde 1990
  const firstYearTotal = data.reduce((sum, countryData) => sum + countryData.data[1990], 0);
  const percentChange = ((total - firstYearTotal) / firstYearTotal) * 100;
  
  return {
    timeSeriesData,
    comparisonData,
    stats: {
      total,
      average,
      max,
      min,
      percentChange
    }
  };
}

/**
 * Funções auxiliares para gerar valores base para diferentes países
 */
function getBaseGDP(country) {
  const baseMappings = {
    'USA': 5980000000000,
    'CHN': 360000000000,
    'JPN': 3140000000000,
    'DEU': 1770000000000,
    'BRA': 465000000000,
    'IND': 320000000000
  };
  return baseMappings[country] || 100000000000;
}

function getBaseGDPPerCapita(country) {
  const baseMappings = {
    'USA': 23000,
    'CHN': 300,
    'JPN': 25000,
    'DEU': 22000,
    'BRA': 3000,
    'IND': 350
  };
  return baseMappings[country] || 1000;
}

function getBasePopulation(country) {
  const baseMappings = {
    'USA': 250000000,
    'CHN': 1150000000,
    'JPN': 123000000,
    'DEU': 80000000,
    'BRA': 150000000,
    'IND': 870000000
  };
  return baseMappings[country] || 50000000;
}

function getBaseCO2(country) {
  const baseMappings = {
    'USA': 19.3,
    'CHN': 2.1,
    'JPN': 9.5,
    'DEU': 11.6,
    'BRA': 1.4,
    'IND': 0.7
  };
  return baseMappings[country] || 5.0;
}

// Exporta as funções para uso em outros arquivos
window.api = {
  fetchIndicatorData,
  fetchIndicatorForCountries,
  processDataForCharts,
  INDICATORS,
  COUNTRIES,
  CHART_COLORS
};
