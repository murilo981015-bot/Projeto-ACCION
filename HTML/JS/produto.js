const SUPABASE_URL = 'https://eihmbzpvtwiwuyvrdtun.supabase.co';
const SUPABASE_KEY = 'sb_publishable_GNRGt6lYghIYuoFqaJLi6A_yQPeb3mn';

const banco = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

let produtoExcluir = null;

// =========================
// CARREGAR PRODUTOS
// =========================

async function carregarProdutos() {

    const { data, error } = await banco
        .from('produto')
        .select(`
            produtoid,
            codigo_produto,
            categoriaprodutoid,
            ds_produto,
            obs_produto,
            vl_venda_produto,
            dt_cadastro_produto,
            status_produto,
            categoria_produto (
                ds_categoria_produto
            )
        `)
        .order('produtoid');

    const tbody = document.getElementById('listaProdutos');

    if (error) {
        console.error(error);
        tbody.innerHTML = `<tr><td colspan="7">Erro ao carregar produtos</td></tr>`;
        return;
    }

    let html = '';

    data.forEach(prod => {

        html += `
<tr>
    <td>${prod.codigo_produto || '-'}</td>
    <td>${prod.categoria_produto?.ds_categoria_produto || '-'}</td>
    <td>${prod.ds_produto}</td>
    <td>R$ ${Number(prod.vl_venda_produto || 0).toFixed(2)}</td>
    <td>${prod.dt_cadastro_produto?.split('T')[0] || '-'}</td>
    <td>${prod.status_produto}</td>
    <td class="acoes">

        <button class="btn-edit"
            onclick="editarProduto(${prod.produtoid})">
            <i class="fas fa-edit"></i>
        </button>

        <button class="btn-danger"
            onclick="abrirModal(${prod.produtoid})">
            <i class="fas fa-trash"></i>
        </button>

    </td>
</tr>
`;
    });

    tbody.innerHTML = html;
}

// =========================
// CARREGAR CATEGORIAS
// =========================

async function carregarCategoriasSelect() {

    const { data } = await banco
        .from('categoria_produto')
        .select('*')
        .order('categoriaprodutoid');

    const select = document.getElementById('categoriaId');

    select.innerHTML = `<option value="">Selecione</option>`;

    data.forEach(cat => {

        select.innerHTML += `
            <option value="${cat.categoriaprodutoid}">
                ${cat.ds_categoria_produto}
            </option>
        `;
    });
}

// =========================
// SALVAR PRODUTO
// =========================

async function salvarProduto(event) {

    event.preventDefault();

    const id = document.getElementById('produtoId').value;

    const produto = {
        codigo_produto: document.getElementById('codigo').value,
        categoriaprodutoid: document.getElementById('categoriaId').value,
        ds_produto: document.getElementById('descricao').value.trim(),
        obs_produto: document.getElementById('observacao').value.trim(),
        vl_venda_produto: parseFloat(
            document.getElementById('valorVenda').value.replace(',', '.')
        ),
        dt_cadastro_produto: document.getElementById('dataCadastro').value,
        status_produto: document.getElementById('status').value
    };

    let error;

    // =========================
    // UPDATE
    // =========================
    if (id) {

        // evita duplicar código em outro produto
        const check = await banco
            .from('produto')
            .select('produtoid')
            .eq('codigo_produto', produto.codigo_produto)
            .neq('produtoid', id)
            .maybeSingle();

        if (check.data) {
            alert('Esse código já pertence a outro produto!');
            return;
        }

        const result = await banco
            .from('produto')
            .update(produto)
            .eq('produtoid', id);

        error = result.error;
    }

    // =========================
    // INSERT
    // =========================
    else {

        const result = await banco
            .from('produto')
            .insert([produto]);

        error = result.error;

        // código duplicado no banco
        if (error?.code === '23505') {

            produto.codigo_produto = await gerarCodigoProdutoUnico();

            const retry = await banco
                .from('produto')
                .insert([produto]);

            if (retry.error) {
                console.error(retry.error);
                alert('Erro ao salvar produto');
                return;
            }

            error = null;
        }
    }

    if (error) {
        console.error(error);
        alert('Erro ao salvar produto');
        return;
    }

    await limparFormProduto();
    carregarProdutos();

    alert('Produto salvo com sucesso!');
}

// =========================
// EDITAR
// =========================

async function editarProduto(id) {

    const { data, error } = await banco
        .from('produto')
        .select('*')
        .eq('produtoid', id)
        .single();

    if (error) {
        alert('Erro ao carregar produto');
        return;
    }

    document.getElementById('produtoId').value = data.produtoid;
    document.getElementById('codigo').value = data.codigo_produto;
    document.getElementById('categoriaId').value = data.categoriaprodutoid;
    document.getElementById('descricao').value = data.ds_produto;
    document.getElementById('observacao').value = data.obs_produto;
    document.getElementById('valorVenda').value = data.vl_venda_produto;
    document.getElementById('dataCadastro').value = data.dt_cadastro_produto?.split('T')[0];
    document.getElementById('status').value = data.status_produto;
}

// =========================
// EXCLUIR
// =========================

function abrirModal(id) {
    produtoExcluir = id;
    document.getElementById('modal').style.display = 'block';
}

function fecharModal() {
    produtoExcluir = null;
    document.getElementById('modal').style.display = 'none';
}

async function excluirProduto() {

    if (!produtoExcluir) return;

    const { error } = await banco
        .from('produto')
        .delete()
        .eq('produtoid', produtoExcluir);

    if (error) {
        alert('Erro ao excluir produto');
        return;
    }

    fecharModal();
    carregarProdutos();

    alert('Produto excluído!');
}

// =========================
// BUSCA
// =========================

async function buscarProdutos() {

    const texto = document.getElementById('busca').value.trim();

    if (!texto) {
        carregarProdutos();
        return;
    }

    const { data } = await banco
        .from('produto')
        .select(`
            produtoid,
            codigo_produto,
            ds_produto,
            vl_venda_produto,
            status_produto,
            categoria_produto (
                ds_categoria_produto
            )
        `)
        .ilike('ds_produto', `%${texto}%`);

    const tbody = document.getElementById('listaProdutos');

    let html = '';

    data.forEach(prod => {

        html += `
            <tr>
                <td>${prod.codigo_produto || '-'}</td>
                <td>${prod.ds_produto}</td>
                <td>R$ ${Number(prod.vl_venda_produto || 0).toFixed(2)}</td>
                <td>${prod.status_produto}</td>
                <td class="acoes">
                    <button onclick="editarProduto(${prod.produtoid})">Editar</button>
                    <button onclick="abrirModal(${prod.produtoid})">Excluir</button>
                </td>
            </tr>
        `;
    });

    tbody.innerHTML = html;
}

// =========================
// LIMPAR FORM + GERAR CÓDIGO
// =========================

async function limparFormProduto() {

    document.getElementById('formProduto').reset();
    document.getElementById('produtoId').value = '';

    document.getElementById('codigo').value =
        await gerarCodigoProdutoUnico();
}

// =========================
// GERAR CÓDIGO ÚNICO
// =========================

async function gerarCodigoProdutoUnico() {

    const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    for (let i = 0; i < 20; i++) {

        const prefixo =
            letras[Math.floor(Math.random() * letras.length)] +
            letras[Math.floor(Math.random() * letras.length)];

        const numero = Math.floor(10000 + Math.random() * 90000);

        const codigo = `PROD-${prefixo}${numero}`;

        const { data, error } = await banco
            .from('produto')
            .select('produtoid')
            .eq('codigo_produto', codigo)
            .maybeSingle();

        if (error) continue;

        if (!data) return codigo;
    }

    return `PROD-${Date.now().toString(36).toUpperCase().slice(-6)}`;
}

// =========================
// INIT
// =========================

document.addEventListener('DOMContentLoaded', async () => {

    carregarCategoriasSelect();
    carregarProdutos();

    document.getElementById('formProduto')
        .addEventListener('submit', salvarProduto);

    document.getElementById('confirmarExcluir')
        .addEventListener('click', excluirProduto);

    // 🔥 AQUI: gera código ao abrir tela
    document.getElementById('codigo').value =
        await gerarCodigoProdutoUnico();
}); 