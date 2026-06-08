// Array para armazenar os clientes
let clientes = [];
let clienteIdExcluir = null;

// Carregar dados do localStorage
function carregarDados() {
    const dados = localStorage.getItem('clientes_cadastro');
    if (dados) {
        clientes = JSON.parse(dados);
        atualizarTabela();
    }
}

// Salvar dados no localStorage
function salvarDados() {
    localStorage.setItem('clientes_cadastro', JSON.stringify(clientes));
    atualizarTabela();
}

// Mostrar mensagem
function mostrarMensagem(texto, erro = false) {
    const msg = document.getElementById('mensagem');
    msg.textContent = texto;
    msg.style.display = 'block';
    if (erro) {
        msg.classList.add('erro');
    } else {
        msg.classList.remove('erro');
    }
    setTimeout(() => {
        msg.style.display = 'none';
    }, 2000);
}

// Gerar código automático
function gerarCodigo() {
    if (clientes.length === 0) {
        return 1;
    }
    const ultimoCodigo = Math.max(...clientes.map(c => c.codigo));
    return ultimoCodigo + 1;
}

// Atualizar labels conforme tipo de cliente
function atualizarLabels() {
    const tipo = document.getElementById('tipoCliente').value;
    const labelDocumento = document.getElementById('labelDocumento');
    const labelNome = document.getElementById('labelNome');
    const documentoInput = document.getElementById('documento');
    
    if (tipo === 'PF') {
        labelDocumento.innerHTML = '<i class="fas fa-id-card"></i> CPF *';
        documentoInput.placeholder = 'Digite o CPF (000.000.000-00)';
    } else if (tipo === 'PJ') {
        labelDocumento.innerHTML = '<i class="fas fa-building"></i> CNPJ *';
        documentoInput.placeholder = 'Digite o CNPJ (00.000.000/0000-00)';
    } else {
        labelDocumento.innerHTML = '<i class="fas fa-id-card"></i> CPF/CNPJ *';
        documentoInput.placeholder = 'Digite o CPF ou CNPJ';
    }
}

// Salvar cliente (incluir/atualizar)
function salvarCliente(event) {
    event.preventDefault();
    
    const id = document.getElementById('clienteId').value;
    const tipo = document.getElementById('tipoCliente').value;
    const documento = document.getElementById('documento').value.trim();
    const nome = document.getElementById('nome').value.trim();
    
    // Validação
    if (!tipo) {
        mostrarMensagem('Selecione o tipo de cliente!', true);
        return;
    }
    
    if (!documento) {
        mostrarMensagem('Digite o CPF ou CNPJ!', true);
        return;
    }
    
    if (!nome) {
        mostrarMensagem('Digite o nome do cliente!', true);
        return;
    }
    
    // Validação simples de CPF/CNPJ
    if (tipo === 'PF' && documento.replace(/\D/g, '').length !== 11) {
        mostrarMensagem('CPF inválido! Digite 11 números.', true);
        return;
    }
    
    if (tipo === 'PJ' && documento.replace(/\D/g, '').length !== 14) {
        mostrarMensagem('CNPJ inválido! Digite 14 números.', true);
        return;
    }
    
    // Verificar se documento já existe (exceto para edição)
    const documentoExiste = clientes.some(c => c.documento === documento && c.id != id);
    if (documentoExiste) {
        mostrarMensagem('Este CPF/CNPJ já está cadastrado!', true);
        return;
    }
    
    if (id) {
        // Editar cliente existente
        const index = clientes.findIndex(c => c.id == id);
        if (index !== -1) {
            clientes[index] = {
                ...clientes[index],
                tipo,
                documento,
                nome
            };
            mostrarMensagem('Cliente atualizado com sucesso!');
        }
    } else {
        // Novo cliente
        const novoCliente = {
            id: Date.now(),
            codigo: gerarCodigo(),
            tipo,
            documento,
            nome
        };
        clientes.push(novoCliente);
        mostrarMensagem('Cliente cadastrado com sucesso!');
    }
    
    salvarDados();
    limparFormulario();
}

// Editar cliente (carrega dados no formulário)
function editarCliente(id) {
    const cliente = clientes.find(c => c.id === id);
    if (cliente) {
        document.getElementById('clienteId').value = cliente.id;
        document.getElementById('codigo').value = cliente.codigo;
        document.getElementById('tipoCliente').value = cliente.tipo;
        document.getElementById('documento').value = cliente.documento;
        document.getElementById('nome').value = cliente.nome;
        
        // Atualizar labels conforme o tipo
        atualizarLabels();
        
        // Scroll suave para o formulário
        document.querySelector('.form-area').scrollIntoView({ behavior: 'smooth' });
    }
}

// Abrir modal de exclusão
function excluirCliente(id) {
    clienteIdExcluir = id;
    document.getElementById('modal').style.display = 'block';
}

// Confirmar exclusão
function confirmarExcluir() {
    if (clienteIdExcluir) {
        clientes = clientes.filter(c => c.id !== clienteIdExcluir);
        salvarDados();
        mostrarMensagem('Cliente excluído com sucesso!');
        fecharModal();
        
        // Se o cliente que estava sendo editado foi excluído, limpar formulário
        const idEditando = document.getElementById('clienteId').value;
        if (idEditando && parseInt(idEditando) === clienteIdExcluir) {
            limparFormulario();
        }
    }
}

// Fechar modal
function fecharModal() {
    document.getElementById('modal').style.display = 'none';
    clienteIdExcluir = null;
}

// Limpar formulário
function limparFormulario() {
    document.getElementById('formCliente').reset();
    document.getElementById('clienteId').value = '';
    document.getElementById('codigo').value = '';
    document.getElementById('tipoCliente').value = '';
    document.getElementById('documento').value = '';
    document.getElementById('nome').value = '';
}

// Buscar clientes
function buscarClientes() {
    const termo = document.getElementById('busca').value.toLowerCase();
    const filtrados = clientes.filter(c => 
        c.codigo.toString().includes(termo) ||
        c.nome.toLowerCase().includes(termo) ||
        c.documento.includes(termo)
    );
    atualizarTabela(filtrados);
}

// Atualizar tabela
function atualizarTabela(lista = null) {
    const dados = lista || clientes;
    const tbody = document.getElementById('listaClientes');
    
    if (dados.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Nenhum cliente cadastrado</td></tr>';
        return;
    }
    
    tbody.innerHTML = dados.map(c => `
        <tr>
            <td><strong>${c.codigo}</strong></td>
            <td>${c.tipo === 'PF' ? 'Pessoa Física' : 'Pessoa Jurídica'}</td>
            <td>${c.documento}</td>
            <td><strong>${c.nome}</strong></td>
            <td class="acoes">
                <button class="btn-edit" onclick="editarCliente(${c.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-danger" onclick="excluirCliente(${c.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Máscara para CPF
function aplicarMascaraCPF(cpf) {
    cpf = cpf.replace(/\D/g, '');
    cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2');
    cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2');
    cpf = cpf.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    return cpf;
}

// Máscara para CNPJ
function aplicarMascaraCNPJ(cnpj) {
    cnpj = cnpj.replace(/\D/g, '');
    cnpj = cnpj.replace(/^(\d{2})(\d)/, '$1.$2');
    cnpj = cnpj.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
    cnpj = cnpj.replace(/\.(\d{3})(\d)/, '.$1/$2');
    cnpj = cnpj.replace(/(\d{4})(\d)/, '$1-$2');
    return cnpj;
}

// Aplicar máscara no campo documento conforme o tipo
function aplicarMascaraDocumento() {
    const tipo = document.getElementById('tipoCliente').value;
    let documento = document.getElementById('documento').value;
    
    if (tipo === 'PF') {
        documento = aplicarMascaraCPF(documento);
    } else if (tipo === 'PJ') {
        documento = aplicarMascaraCNPJ(documento);
    }
    
    document.getElementById('documento').value = documento;
}

// Eventos
document.getElementById('formCliente').addEventListener('submit', salvarCliente);
document.getElementById('confirmarExcluir').addEventListener('click', confirmarExcluir);
document.getElementById('tipoCliente').addEventListener('change', atualizarLabels);
document.getElementById('documento').addEventListener('blur', aplicarMascaraDocumento);

// Fechar modal ao clicar fora
window.onclick = function(event) {
    const modal = document.getElementById('modal');
    if (event.target === modal) {
        fecharModal();
    }
}

// Inicializar
carregarDados();