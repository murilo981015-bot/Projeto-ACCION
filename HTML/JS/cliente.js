const SUPABASE_URL = 'https://eihmbzpvtwiwuyvrdtun.supabase.co';
const SUPABASE_KEY = 'sb_publishable_GNRGt6lYghIYuoFqaJLi6A_yQPeb3mn';

const banco = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

let clienteIdExcluir = null;

async function carregarClientes() {

    const { data, error } = await banco
        .from('cliente')
        .select('*')
        .order('clienteid');

    const tbody = document.getElementById('listaClientes');

    if (error) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5">
                    Erro ao carregar clientes
                </td>
            </tr>
        `;
        return;
    }

    let html = '';

    data.forEach(cliente => {

        html += `
            <tr>
                <td>${cliente.clienteid}</td>
                <td>${cliente.tipo_cliente}</td>
                <td>${cliente.cpf_cnpj_cliente}</td>
                <td>${cliente.nome_cliente}</td>
                <td>
                    <button onclick="editarCliente(${cliente.clienteid})">
                        Editar
                    </button>

                    <button onclick="excluirCliente(${cliente.clienteid})">
                        Excluir
                    </button>
                </td>
            </tr>
        `;
    });

    tbody.innerHTML = html;
}

async function editarCliente(id) {

    const { data, error } = await banco
        .from('cliente')
        .select('*')
        .eq('clienteid', id)
        .single();

    if (error) {
        console.error(error);
        alert('Erro ao carregar cliente!');
        return;
    }

    document.getElementById('clienteId').value = data.clienteid;
    document.getElementById('codigo').value = data.clienteid;
    document.getElementById('tipo').value = data.tipo_cliente;
    document.getElementById('cpfCnpj').value = data.cpf_cnpj_cliente;
    document.getElementById('nome').value = data.nome_cliente;
}

document.addEventListener('DOMContentLoaded', () => {
    carregarClientes();
});

async function salvarCliente(event) {
    event.preventDefault();

    const id = document.getElementById('clienteId').value;
    const tipo = document.getElementById('tipo').value;
    const cpfCnpj = document.getElementById('cpfCnpj').value.trim();
    const nome = document.getElementById('nome').value.trim();

    if (!tipo || !cpfCnpj || !nome) {
        alert('Preencha todos os campos!');
        return;
    }

    let error;

    if (id) {

        const resultado = await banco
            .from('cliente')
            .update({
                tipo_cliente: tipo,
                cpf_cnpj_cliente: cpfCnpj,
                nome_cliente: nome
            })
            .eq('clienteid', id);

        error = resultado.error;

    } else {

        const resultado = await banco
            .from('cliente')
            .insert([
                {
                    tipo_cliente: tipo,
                    cpf_cnpj_cliente: cpfCnpj,
                    nome_cliente: nome
                }
            ]);

        error = resultado.error;
    }

    if (error) {
        console.error(error);
        alert('Erro ao salvar!');
        return;
    }

    alert(id ? 'Cliente atualizado!' : 'Cliente cadastrado!');

    limparFormulario();
    carregarClientes();
}

document.addEventListener('DOMContentLoaded', () => {

    carregarClientes();

    document
        .getElementById('formCliente')
        .addEventListener('submit', salvarCliente);

    document
        .getElementById('confirmarExcluir')
        .addEventListener('click', confirmarExcluir);

});

function limparFormulario() {

    document.getElementById('formCliente').reset();

    document.getElementById('clienteId').value = '';

    document.getElementById('codigo').value = '';
}

function excluirCliente(id) {

    clienteIdExcluir = id;

    document.getElementById('modal').style.display = 'block';
}

function fecharModal() {

    document.getElementById('modal').style.display = 'none';

    clienteIdExcluir = null;
}

async function confirmarExcluir() {

    if (!clienteIdExcluir) return;

    const { error } = await banco
        .from('cliente')
        .delete()
        .eq('clienteid', clienteIdExcluir);

    if (error) {
        console.error(error);
        alert('Erro ao excluir!');
        return;
    }

    alert('Cliente excluído com sucesso!');

    fecharModal();

    carregarClientes();
}

async function buscarClientes() {

    const termo = document
        .getElementById('busca')
        .value
        .trim();

    if (termo === '') {
        carregarClientes();
        return;
    }

    const { data, error } = await banco
        .from('cliente')
        .select('*')
        .or(
            `nome_cliente.ilike.%${termo}%,
             cpf_cnpj_cliente.ilike.%${termo}%`
        )
        .order('clienteid');

    if (error) {
        console.error(error);
        return;
    }

    const tbody = document.getElementById('listaClientes');

    let html = '';

    data.forEach(cliente => {

        html += `
<tr>
    <td>${cliente.clienteid}</td>
    <td>${cliente.tipo_cliente}</td>
    <td>${cliente.cpf_cnpj_cliente}</td>
    <td>${cliente.nome_cliente}</td>

    <td class="acoes">

        <button
            class="btn-edit"
            onclick="editarCliente(${cliente.clienteid})">

            <i class="fas fa-edit"></i>
        </button>

        <button
            class="btn-danger"
            onclick="excluirCliente(${cliente.clienteid})">

            <i class="fas fa-trash"></i>
        </button>

    </td>
</tr>
`;
    });

    tbody.innerHTML = html;
}

