const SUPABASE_URL = 'https://eihmbzpvtwiwuyvrdtun.supabase.co';
const SUPABASE_KEY = 'sb_publishable_GNRGt6lYghIYuoFqaJLi6A_yQPeb3mn';

const banco = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

/* =========================
   GERAR CÓDIGO ALEATÓRIO
========================= */
function gerarCodigoOrcamento() {
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    const data = new Date().getTime().toString().slice(-4);
    return `ORC-${random}-${data}`;
}

/* =========================
   CARREGAR CLIENTES
========================= */
async function carregarClientes() {

    const { data, error } = await banco
        .from('cliente')
        .select('clienteid, nome_cliente')
        .order('clienteid');

    if (error) {
        console.error(error);
        return;
    }

    const select = document.getElementById('clienteId');

    select.innerHTML = `<option value="">Selecione</option>`;

    data.forEach(cli => {
        select.innerHTML += `
            <option value="${cli.clienteid}">
                ${cli.nome_cliente}
            </option>
        `;
    });
}

/* =========================
   TOTAL GERAL
========================= */
function calcularTotalOrcamento() {
    let total = 0;

    document.querySelectorAll('.valor-total-item').forEach(el => {
        total += parseFloat(el.value || 0);
    });

    document.getElementById('totalOrcamento').innerText = total.toFixed(2);
}

/* =========================
   ADICIONAR ITEM
========================= */
function adicionarItem() {
    const container = document.getElementById('itensContainer');

    const div = document.createElement('div');
    div.classList.add('item-produto');

    div.innerHTML = `
        <div class="form-row">
            <div class="form-group" style="flex: 2;">
                <label>Produto</label>
                <select class="produto-select form-control" onchange="calcularItem(this)">
                    <option value="">Selecione um produto</option>
                </select>
            </div>

            <div class="form-group" style="flex: 2;">
                <label>Descrição</label>
                <input type="text" class="descricao-produto form-control" readonly>
            </div>

            <div class="form-group" style="flex: 1;">
                <label>Quantidade</label>
                <input type="number" class="quantidade form-control" value="1" min="1" onchange="calcularItem(this)">
            </div>

            <div class="form-group" style="flex: 1;">
                <label>Valor Unitário</label>
                <input type="text" class="valor-unitario form-control" readonly>
            </div>

            <div class="form-group" style="flex: 1;">
                <label>Valor Total</label>
                <input type="text" class="valor-total-item form-control" readonly>
            </div>

            <div class="form-group" style="flex: 0.3;">
                <button type="button" class="btn btn-danger" onclick="removerItem(this)">
                    🗑
                </button>
            </div>
        </div>
    `;

    container.appendChild(div);
}

/* =========================
   REMOVER ITEM
========================= */
function removerItem(btn) {
    btn.closest('.item-produto').remove();
    calcularTotalOrcamento();
}

/* =========================
   SALVAR ORÇAMENTO
========================= */
document.getElementById('formOrcamento').addEventListener('submit', async (e) => {
    e.preventDefault();

    const clienteid = document.getElementById('clienteId').value;
    const dataOrcamento = document.getElementById('dataOrcamento').value;
    const dataValidade = document.getElementById('dataValidade').value;
    const total = document.getElementById('totalOrcamento').innerText;
    const codigo = gerarCodigoOrcamento();

    const { data, error } = await banco
    .from('orcamento')
    .insert([
        {
            clienteid: clienteid,
            dt_orcamento: formatarData(dataOrcamento),
            dt_validade_orcamento: formatarData(dataValidade),
            vl_total_orcamento: total,
            codigo_orcamento: codigo
        }
    ]);

    if (error) {
        alert("Erro ao salvar orçamento");
        console.error(error);
        return;
    }

    alert("Orçamento salvo com sucesso!");
    limparFormulario();
    listarOrcamentos();
});

/* =========================
   LISTAR ORÇAMENTOS
========================= */
async function listarOrcamentos() {
    const { data, error } = await banco
    .from('orcamento')
    .select(`
        codigo_orcamento,
        dt_orcamento,
        dt_validade_orcamento,
        vl_total_orcamento,
        cliente:cliente(clienteid, nome_cliente)
    `);

    if (error) {
        console.error(error);
        return;
    }

    const tbody = document.getElementById('listaOrcamentos');
    tbody.innerHTML = "";

    data.forEach(orc => {
        const tr = document.createElement('tr');

        tr.innerHTML = `
            <td>${orc.codigo_orcamento}</td>
            <td>${orc.cliente?.nome || 'Sem nome'}</td>
            <td>${orc.dt_orcamento}</td>
            <td>${orc.dt_validade_orcamento}</td>
            <td>R$ ${orc.vl_total_orcamento}</td>
            <td>
                <button onclick="verOrcamento('${orc.codigo_orcamento}')">👁</button>
            </td>
        `;

        tbody.appendChild(tr);
    });
}

/* =========================
   LIMPAR FORMULÁRIO
========================= */
function limparFormulario() {
    document.getElementById('formOrcamento').reset();
    document.getElementById('itensContainer').innerHTML = "";
    adicionarItem();
    document.getElementById('codigo').value = gerarCodigoOrcamento();
    document.getElementById('totalOrcamento').innerText = "0,00";
}

/* =========================
   BUSCAR
========================= */
function buscarOrcamentos() {
    const filtro = document.getElementById('busca').value.toLowerCase();
    const linhas = document.querySelectorAll('#listaOrcamentos tr');

    linhas.forEach(linha => {
        linha.style.display =
            linha.innerText.toLowerCase().includes(filtro)
                ? ''
                : 'none';
    });
}

/* =========================
   INIT
========================= */
document.addEventListener('DOMContentLoaded', () => {
    carregarClientes();
    carregarProdutos();
    listarOrcamentos();
    limparFormulario();
});

async function carregarProdutos() {

    const { data, error } = await banco
        .from('produto')
        .select('produtoid, ds_produto, vl_venda_produto, obs_produto')
        .order('produtoid');

    if (error) {
        console.error(error);
        return;
    }

    document.querySelectorAll('.produto-select').forEach(select => {

        select.innerHTML = `<option value="">Selecione um produto</option>`;

        data.forEach(prod => {
            select.innerHTML += `
                <option 
                    value="${prod.produtoid}"
                    data-preco="${prod.vl_venda_produto}"
                    data-desc="${prod.obs_produto || ''}">
                    ${prod.ds_produto}
                </option>
            `;
        });
    });
}

function calcularItem(el) {

    const item = el.closest('.item-produto');

    const select = item.querySelector('.produto-select');
    const qtd = item.querySelector('.quantidade');
    const unit = item.querySelector('.valor-unitario');
    const desc = item.querySelector('.descricao-produto');
    const total = item.querySelector('.valor-total-item');

    const opt = select.selectedOptions[0];

    const preco = parseFloat(opt?.dataset.preco || 0);
    const descricao = opt?.dataset.desc || '';

    unit.value = preco.toFixed(2);
    desc.value = descricao;

    const subtotal = preco * (parseFloat(qtd.value || 0));
    total.value = subtotal.toFixed(2);

    calcularTotalOrcamento();
}

function imprimirOrcamento() {
    window.print();
}

function imprimirOrcamento() {
    const conteudo = document.querySelector('.card').innerHTML;

    const win = window.open('', '', 'width=900,height=700');

    win.document.write(`
        <html>
        <head>
            <title>Orçamento</title>
        </head>
        <body>${conteudo}</body>
        </html>
    `);

    win.print();
}

async function verOrcamento(codigo) {

    const { data, error } = await banco
        .from('orcamento')
        .select(`
            *,
            cliente:cliente(clienteid, nome_cliente)
        `)
        .eq('codigo_orcamento', codigo)
        .single();

    if (error) {
        console.error(error);
        return;
    }

    alert(`
Código: ${data.codigo_orcamento}
Cliente: ${data.cliente?.nome_cliente}
Total: ${data.vl_total_orcamento}
    `);
}