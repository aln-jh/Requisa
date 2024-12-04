document.addEventListener('DOMContentLoaded', function() {
    const table = document.getElementById('horasTable');
    
    // Função para calcular a diferença entre duas horas
    function calcularTempo(inicio, fim) {
        if (!inicio || !fim) return '00:00';
        
        const [horaInicio, minInicio] = inicio.split(':').map(Number);
        const [horaFim, minFim] = fim.split(':').map(Number);
        
        let diferencaMin = (horaFim * 60 + minFim) - (horaInicio * 60 + minInicio);
        
        // Se for negativo, assume que passou para o dia seguinte
        if (diferencaMin < 0) diferencaMin += 24 * 60;
        
        const horas = Math.floor(diferencaMin / 60);
        const minutos = diferencaMin % 60;
        
        return `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}`;
    }
    
    // Função para calcular o total de horas
    function calcularTotal() {
        const tempos = Array.from(document.getElementsByClassName('tempo'));
        let totalMinutos = 0;
        
        tempos.forEach(tempo => {
            if (tempo.textContent !== '00:00') {
                const [horas, minutos] = tempo.textContent.split(':').map(Number);
                totalMinutos += horas * 60 + minutos;
            }
        });
        
        const horasTotal = Math.floor(totalMinutos / 60);
        const minutosTotal = totalMinutos % 60;
        
        document.getElementById('total-horas').textContent = 
            `${String(horasTotal).padStart(2, '0')}:${String(minutosTotal).padStart(2, '0')}`;
    }
    
    // Adicionar event listeners para cada linha
    table.addEventListener('change', function(e) {
        if (e.target.classList.contains('hora-inicio') || 
            e.target.classList.contains('hora-fim') ||
            e.target.classList.contains('data')) {
            
            const row = e.target.closest('tr');
            const inicio = row.querySelector('.hora-inicio')?.value;
            const fim = row.querySelector('.hora-fim')?.value;
            const tempoCell = row.querySelector('.tempo');
            
            if (tempoCell) {
                tempoCell.textContent = calcularTempo(inicio, fim);
                calcularTotal();
                atualizarResumo();
            }
        }
    });
    
    function atualizarResumo() {
        const horasTable = document.getElementById('horasTable');
        const resumoTable = document.getElementById('resumoTable');
        const resumoBody = resumoTable.querySelector('tbody');
        
        // Limpar tabela de resumo
        resumoBody.innerHTML = '';
        
        // Criar objeto para agrupar horas por data
        const horasPorData = {};
        
        // Coletar dados da tabela principal
        const linhas = horasTable.querySelectorAll('tbody tr');
        linhas.forEach(linha => {
            const dataInput = linha.querySelector('.data');
            const tempo = linha.querySelector('.tempo').textContent;
            
            if (dataInput && dataInput.value && tempo !== '00:00') {
                const data = dataInput.value; // Usar o valor direto do input date
                
                if (!horasPorData[data]) {
                    horasPorData[data] = 0;
                }
                
                const [horas, minutos] = tempo.split(':').map(Number);
                horasPorData[data] += horas * 60 + minutos;
            }
        });
        
        // Criar linhas do resumo
        Object.entries(horasPorData)
            .sort(([a], [b]) => a.localeCompare(b)) // Ordenação simples de strings
            .forEach(([data, minutos]) => {
                const horas = Math.floor(minutos / 60);
                const minutosRestantes = minutos % 60;
                const tempoFormatado = 
                    `${String(horas).padStart(2, '0')}:${String(minutosRestantes).padStart(2, '0')}`;
                
                // Formatar a data para exibição
                const dataObj = new Date(data + 'T00:00:00'); // Adicionar tempo para evitar problemas de timezone
                const dataFormatada = dataObj.toLocaleDateString('pt-BR');
                
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${dataFormatada}</td>
                    <td>${tempoFormatado}</td>
                `;
                resumoBody.appendChild(tr);
            });
        
        // Atualizar total geral
        let totalMinutos = Object.values(horasPorData).reduce((a, b) => a + b, 0);
        const horasTotal = Math.floor(totalMinutos / 60);
        const minutosTotal = totalMinutos % 60;
        document.getElementById('total-geral').textContent = 
            `${String(horasTotal).padStart(2, '0')}:${String(minutosTotal).padStart(2, '0')}`;
    }
}); 