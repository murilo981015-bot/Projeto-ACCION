const SUPABASE_URL = 'https://eihmbzpvtwiwuyvrdtun.supabase.co';
const SUPABASE_KEY = 'sb_publishable_GNRGt6lYghIYuoFqaJLi6A_yQPeb3mn';

const banco = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

let categoriaExcluir = null;

// =========================
// CARREGAR CATEGORIAS
// =========================

async function carregarCategorias() {

    const { data, error } = await banco
        .from('categoria_produto')
        .select('*')
        .order('categoriaprodutoid');

    const tbody = document.getElementById('listaCategorias');

    if (error) {

        tbody.innerHTML = `
            <tr>
                <td colspan="3">
                    Erro ao carregar categorias
                </td>
            </tr>
        `;

        return;
    }

    document.getElementById('totalCategorias').textContent = data.length;

    let html = '';

    data.forEach(categoria => {

        html += `
            <tr>

                <td>${categoria.codigo_categoria}</td>

                <td>${categoria.ds_categoria_produto}</td>

                <td class="acoes">

                    <button
                        class="btn-edit"
                        onclick="editarCategoria(${categoria.categoriaprodutoid})">

                        <i class="fas fa-edit"></i>
                    </button>

                    <button
                        class="btn-danger"
                        onclick="abrirModal(${categoria.categoriaprodutoid})">

                        <i class="fas fa-trash"></i>
                    </button>

                </td>

            </tr>
        `;
    });

    tbody.innerHTML = html;
}

// =========================
// SALVAR
// =========================

async function salvarCategoria(event) {

    event.preventDefault();

    const id = document.getElementById('categoriaId').value;

    const descricao = document
        .getElementById('descricao')
        .value
        .trim();

    if (!descricao) {

        alert('Informe a descrição.');

        return;
    }

    let error;

    if (id) {

        const resultado = await banco
            .from('categoria_produto')
            .update({
                ds_categoria_produto: descricao
            })
            .eq('categoriaprodutoid', id);

        error = resultado.error;

    } else {

        const codigo = gerarCodigoCategoria();

        const resultado = await banco
            .from('categoria_produto')
            .insert([
                {
                    codigo_categoria: codigo,
                    ds_categoria_produto: descricao
                }
            ]);

        error = resultado.error;
    }

    if (error) {

        console.error(error);

        alert('Erro ao salvar.');

        return;
    }

    limparFormCategoria();

    carregarCategorias();

    alert('Categoria salva com sucesso!');
}

// =========================
// EDITAR
// =========================

async function editarCategoria(id) {

    const { data, error } = await banco
        .from('categoria_produto')
        .select('*')
        .eq('categoriaprodutoid', id)
        .single();

    if (error) {

        alert('Erro ao carregar categoria.');

        return;
    }

    document.getElementById('categoriaId').value =
        data.categoriaprodutoid;

    document.getElementById('codigo').value =
        data.codigo_categoria;

    document.getElementById('descricao').value =
        data.ds_categoria_produto;
}

// =========================
// EXCLUIR
// =========================

function abrirModal(id) {

    categoriaExcluir = id;

    document.getElementById('modal').style.display =
        'block';
}

function fecharModal() {

    categoriaExcluir = null;

    document.getElementById('modal').style.display =
        'none';
}

async function excluirCategoria() {

    if (!categoriaExcluir) return;

    const { error } = await banco
        .from('categoria_produto')
        .delete()
        .eq('categoriaprodutoid', categoriaExcluir);

    if (error) {

        alert('Erro ao excluir.');

        return;
    }

    fecharModal();

    carregarCategorias();

    alert('Categoria excluída.');
}

// =========================
// BUSCAR
// =========================

async function buscarCategorias() {

    const texto = document
        .getElementById('buscaCategoria')
        .value
        .trim();

    if (!texto) {

        carregarCategorias();

        return;
    }

    const { data, error } = await banco
        .from('categoria_produto')
        .select('*')
        .ilike(
            'ds_categoria_produto',
            `%${texto}%`
        );

    const tbody =
        document.getElementById('listaCategorias');

    if (error) return;

    let html = '';

    data.forEach(categoria => {

        html += `
            <tr>

                <td>${categoria.codigo_categoria}</td>

                <td>${categoria.ds_categoria_produto}</td>

                <td class="acoes">

                    <button
                        class="btn-edit"
                        onclick="editarCategoria(${categoria.categoriaprodutoid})">

                        <i class="fas fa-edit"></i>
                    </button>

                    <button
                        class="btn-danger"
                        onclick="abrirModal(${categoria.categoriaprodutoid})">

                        <i class="fas fa-trash"></i>
                    </button>

                </td>

            </tr>
        `;
    });

    tbody.innerHTML = html;
}

// =========================
// LIMPAR
// =========================

function limparFormCategoria() {

    document
        .getElementById('formCategoria')
        .reset();

    document
        .getElementById('categoriaId')
        .value = '';

    document
        .getElementById('codigo')
        .value = '';
}

// =========================
// EVENTOS
// =========================

document.addEventListener(
    'DOMContentLoaded',
    () => {

        carregarCategorias();

        document
            .getElementById('formCategoria')
            .addEventListener(
                'submit',
                salvarCategoria
            );

        document
            .getElementById('confirmarExcluir')
            .addEventListener(
                'click',
                excluirCategoria
            );
    }
);

function gerarCodigoCategoria() {

    const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    const prefixo =
        letras[Math.floor(Math.random() * letras.length)] +
        letras[Math.floor(Math.random() * letras.length)];

    const numero = Math.floor(
        1000 + Math.random() * 9000
    );

    return `CAT-${prefixo}${numero}`;
}