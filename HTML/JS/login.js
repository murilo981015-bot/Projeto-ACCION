const SUPABASE_URL = 'https://eihmbzpvtwiwuyvrdtun.supabase.co';
const SUPABASE_KEY = 'sb_publishable_GNRGt6lYghIYuoFqaJLi6A_yQPeb3mn';

const banco = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

document.getElementById('loginForm')
.addEventListener('submit', fazerLogin)

async function fazerLogin(event) {
    event.preventDefault();

    const usuario = document.getElementById('login')
    .value
    .trim();

    const senha = document.getElementById('senha')
    .value
    .trim();

    if (!usuario || !senha) {
        mostrarMensagem('Preencha todos os campos')
        return;
    }

    const {data, error } = await banco
    .from ('usuarios')
    .select('*')
    .eq('usuario', usuario)
    .eq('senha', senha)
    .single();

    if (error || !data) {
        mostrarMensagem('Usuario ou senha inválidos');
        return
    }

    localStorage.setItem(
        'UsuarioLogado',
        JSON.stringify(data)
    );

    mostrarMensagem('Login realizado com sucesso');

    setTimeout(() => {
        window.location.href = 'cliente.html';
    }, 1000);
}

function mostrarMensagem(texto) {

    const msg = document.getElementById('message');

    msg.innerText = texto;
    msg.style.display = 'block';

    setTimeout(() => {
        msg.style.display = 'none';
    }, 3000);
}