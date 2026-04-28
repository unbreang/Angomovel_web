        // Array para armazenar os usuários
        let usuarios = [];
        let editandoId = null;

        // Carregar usuários do localStorage ao iniciar
        function carregarUsuarios() {
            const usuariosSalvos = localStorage.getItem('usuarios');
            if (usuariosSalvos) {
                usuarios = JSON.parse(usuariosSalvos);
            }
            atualizarLista();
        }

        // Salvar usuários no localStorage
        function salvarUsuarios() {
            localStorage.setItem('usuarios', JSON.stringify(usuarios));
            atualizarLista();
        }

        // Gerar ID automático
        function gerarId() {
            return Date.now().toString(36) + Math.random().toString(36).substr(2);
        }

        // Validar email
        function validarEmail(email) {
            const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return re.test(email);
        }

        // Validar telefone
        function validarTelefone(telefone) {
            const re = /^[\d\s\-\(\)]+$/;
            return re.test(telefone);
        }

        // Mostrar alerta
        function mostrarAlerta(mensagem, tipo) {
            const alerta = document.createElement('div');
            alerta.className = `alerta alerta-${tipo}`;
            alerta.innerHTML = `<i class="fas fa-${tipo === 'sucesso' ? 'check-circle' : 'exclamation-circle'}"></i> ${mensagem}`;
            document.body.appendChild(alerta);
            
            setTimeout(() => {
                alerta.remove();
            }, 3000);
        }

        // Cadastrar usuário
        document.getElementById('cadastroForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const nome = document.getElementById('nome').value;
            const email = document.getElementById('email').value;
            const senha = document.getElementById('senha').value;
            const confirmarSenha = document.getElementById('confirmarSenha').value;
            const telefone = document.getElementById('telefone').value;
            const pais = document.getElementById('pais').value;
            const sexo = document.getElementById('sexo').value;
            const dataNascimento = document.getElementById('dataNascimento').value;
            const endereco = document.getElementById('endereco').value;

            // Validações
            if (!nome || !email || !senha || !telefone || !pais || !sexo || !dataNascimento) {
                mostrarAlerta('Por favor, preencha todos os campos obrigatórios!', 'erro');
                return;
            }

            if (!validarEmail(email)) {
                mostrarAlerta('Por favor, insira um e-mail válido!', 'erro');
                return;
            }

            if (senha !== confirmarSenha) {
                mostrarAlerta('As senhas não coincidem!', 'erro');
                return;
            }

            if (senha.length < 6) {
                mostrarAlerta('A senha deve ter pelo menos 6 caracteres!', 'erro');
                return;
            }

            // Verificar se email já existe
            if (usuarios.some(u => u.email === email)) {
                mostrarAlerta('Este e-mail já está cadastrado!', 'erro');
                return;
            }

            // Criar novo usuário
            const novoUsuario = {
                id: gerarId(),
                nome,
                email,
                senha: btoa(senha), // Simples criptografia (apenas para exemplo)
                telefone,
                pais,
                sexo,
                dataNascimento,
                endereco,
                dataCadastro: new Date().toLocaleString('pt-BR')
            };

            usuarios.push(novoUsuario);
            salvarUsuarios();
            
            // Limpar formulário
            document.getElementById('cadastroForm').reset();
            
            mostrarAlerta('Usuário cadastrado com sucesso!', 'sucesso');
        });

        // Atualizar lista de usuários
        function atualizarLista() {
            const busca = document.getElementById('buscaUsuario').value.toLowerCase();
            const usuariosFiltrados = usuarios.filter(u => 
                u.nome.toLowerCase().includes(busca) ||
                u.email.toLowerCase().includes(busca) ||
                u.telefone.includes(busca)
            );
            
            const listaHtml = document.getElementById('usuariosList');
            const totalUsuarios = document.getElementById('totalUsuarios');
            
            totalUsuarios.textContent = usuarios.length;
            
            if (usuariosFiltrados.length === 0) {
                listaHtml.innerHTML = '<div style="text-align: center; padding: 40px; color: #999;"><i class="fas fa-user-slash"></i><br>Nenhum usuário encontrado</div>';
                return;
            }
            
            listaHtml.innerHTML = usuariosFiltrados.map(usuario => `
                <div class="usuario-card">
                    <div class="usuario-header">
                        <div class="usuario-nome">
                            <i class="fas fa-user-circle"></i> ${usuario.nome}
                        </div>
                        <div class="usuario-acoes">
                            <button class="btn-editar" onclick="editarUsuario('${usuario.id}')">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-excluir" onclick="excluirUsuario('${usuario.id}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    <div class="usuario-info">
                        <p><i class="fas fa-envelope"></i> ${usuario.email}</p>
                        <p><i class="fas fa-phone"></i> ${usuario.telefone}</p>
                        <p><i class="fas fa-globe"></i> ${usuario.pais}</p>
                        <p><i class="fas fa-venus-mars"></i> ${usuario.sexo}</p>
                        <p><i class="fas fa-calendar"></i> ${new Date(usuario.dataNascimento).toLocaleDateString('pt-BR')}</p>
                        ${usuario.endereco ? `<p><i class="fas fa-map-marker-alt"></i> ${usuario.endereco}</p>` : ''}
                        <p><i class="fas fa-clock"></i> Cadastro: ${usuario.dataCadastro}</p>
                    </div>
                </div>
            `).join('');
        }

        // Buscar usuários
        document.getElementById('buscaUsuario').addEventListener('input', atualizarLista);

        // Editar usuário
        window.editarUsuario = function(id) {
            const usuario = usuarios.find(u => u.id === id);
            if (!usuario) return;
            
            editandoId = id;
            document.getElementById('editId').value = usuario.id;
            document.getElementById('editNome').value = usuario.nome;
            document.getElementById('editEmail').value = usuario.email;
            document.getElementById('editTelefone').value = usuario.telefone;
            document.getElementById('editPais').value = usuario.pais;
            document.getElementById('editSexo').value = usuario.sexo;
            
            document.getElementById('modalEditar').style.display = 'flex';
        };

        // Salvar edição
        document.getElementById('editarForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const id = document.getElementById('editId').value;
            const usuarioIndex = usuarios.findIndex(u => u.id === id);
            
            if (usuarioIndex !== -1) {
                usuarios[usuarioIndex] = {
                    ...usuarios[usuarioIndex],
                    nome: document.getElementById('editNome').value,
                    email: document.getElementById('editEmail').value,
                    telefone: document.getElementById('editTelefone').value,
                    pais: document.getElementById('editPais').value,
                    sexo: document.getElementById('editSexo').value
                };
                
                salvarUsuarios();
                mostrarAlerta('Usuário atualizado com sucesso!', 'sucesso');
                document.getElementById('modalEditar').style.display = 'none';
            }
        });

        // Excluir usuário
        window.excluirUsuario = function(id) {
            if (confirm('Tem certeza que deseja excluir este usuário?')) {
                usuarios = usuarios.filter(u => u.id !== id);
                salvarUsuarios();
                mostrarAlerta('Usuário excluído com sucesso!', 'sucesso');
            }
        };

        // Fechar modal
        document.querySelector('.close-modal').addEventListener('click', function() {
            document.getElementById('modalEditar').style.display = 'none';
        });
        
        window.addEventListener('click', function(e) {
            const modal = document.getElementById('modalEditar');
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });

        // Máscara para telefone
        document.getElementById('telefone').addEventListener('input', function(e) {
            let valor = e.target.value.replace(/\D/g, '');
            if (valor.length <= 11) {
                valor = valor.replace(/^(\d{2})(\d)/, '($1) $2');
                valor = valor.replace(/(\d{5})(\d)/, '$1-$2');
                e.target.value = valor;
            }
        });

        // Inicializar
        carregarUsuarios();