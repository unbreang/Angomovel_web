document.getElementById('formCadastro').addEventListener('submit', function(e) {
    e.preventDefault();

    // Captura dos valores
    const dadosEmpresa = {
        nome: document.getElementById('nome').value,
        categoria: document.getElementById('categoria').value,
        provincia: document.getElementById('provincia').value,
        email: document.getElementById('email').value,
        descricao: document.getElementById('descricao').value
    };

    console.log("Enviando para o AngoMovel-Back:", dadosEmpresa);

    // Simulação de Feedback Rico
    const btn = e.target.querySelector('button');
    btn.innerHTML = "Processando...";
    btn.style.background = "#999";

    setTimeout(() => {
        alert("Empresa cadastrada com sucesso! Bem-vindo ao AngoMovel 🇦🇴");
        window.location.href = "index.html"; // Volta para a home
    }, 1500);
});