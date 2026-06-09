    const menuItems = document.querySelectorAll('.menu-item');
        const pages = document.querySelectorAll('.page');

        // Função para trocar de página
        function trocarPagina(pageId) {
            // Esconde todas as páginas
            pages.forEach(page => {
                page.classList.remove('active');
            });
            
            // Mostra a página selecionada
            const paginaSelecionada = document.getElementById(`page-${pageId}`);
            if (paginaSelecionada) {
                paginaSelecionada.classList.add('active');
            }
            
            // Remove a classe active de todos os menus
            menuItems.forEach(item => {
                item.classList.remove('active');
            });
            
            // Adiciona active no menu clicado
            const menuClicado = document.querySelector(`.menu-item[data-page="${pageId}"]`);
            if (menuClicado) {
                menuClicado.classList.add('active');
            }
        }

        // Adiciona evento de clique em cada item do menu
        menuItems.forEach(item => {
            // Verifica se é o botão sair
            if (item.id === 'sairBtn') {
                item.addEventListener('click', (e) => {
                    e.preventDefault();
                    if (confirm('Deseja realmente sair do sistema?')) {
                        alert('Saindo do sistema...');
                        // window.location.href = 'login.html'; // Descomente para redirecionar
                    }
                });
                return;
            }
            
            // Para os outros itens do menu (cliente, categoria, produto, orcamento)
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.getAttribute('data-page');
                if (page) {
                    trocarPagina(page);
                }
            });
        });