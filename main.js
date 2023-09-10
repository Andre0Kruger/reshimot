
const FUNCOES_IMAGEM = [
    { nome: 'Remover', fn: 'removerImagem' }
];

const FUNCOES_FICHA = [
    { nome: 'Duplicar', fn: 'duplicar' },
    { nome: 'Remover', fn: 'remover' }
];

const FUNCAO_REMOVER_COMBATE = { nome: 'Remover do combate', fn: 'combate', param: 'false' };
const FUNCAO_INSERIR_COMBATE = { nome: 'Inserir do combate', fn: 'combate', param: 'true' };

// localStorage.setItem('sessao', undefined);

var sessao;

load();

// carrega do armazenamento local o objeto de sessão
function load() {
    let session = localStorage.getItem('sessao');
    if (session && session != "undefined") {
        sessao = JSON.parse(session);
        validarSessao();
        render();
    } else {
        create();
    }
}

// obtem da sessão uma ficha pelo id
function get(id) {
    for (const ficha of sessao.fichas) {
        if (ficha.id == id) {
            return ficha;
        }
    }
}

// cria o objeto de sessão
function create() {
    sessao = {
        ultimaFicha: 0,
        ultimaImagem: 0,
        fichas: [],
        imagens: obterPacoteImagem()
    }
}

// salva o objeto de sessão
function save() {
    localStorage.setItem('sessao', JSON.stringify(sessao));
}

// valida os dados para inicio da sessao, os criando se necessário
function validarSessao() {
    if (!sessao) {
        create();
        save();
    }

    if (!sessao.fichas) {
        sessao.fichas = [];
        save();
    }

    if (!sessao.ultimaFicha) {
        sessao.ultimaFicha = 0;
        save();
    }

    if (!sessao.imagens) {
        sessao.imagens = obterPacoteImagem();
        save();
    }

    if (!sessao.ultimaImagem) {
        sessao.ultimaImagem = 0;
        save();
    }
}

// renderiza as fichas em tela
function render() {
    let fichas = sessao.fichas;
    let fichasHTML = document.getElementsByClassName("ficha");

    // remove todas as fichas da tela
    while (fichasHTML.length > 0) {
        fichasHTML[0].remove();
    }

    // ordena as fichas por iniciativa
    fichas.sort(compare);

    for (i = 0; i < fichas.length; i++) {
        document.getElementById("add").before(buildFicha(fichas[i], i));
    }

    document.querySelectorAll('input').forEach(input => {
        input.addEventListener('dblclick', (event) => { prevent(event) });
    });
}

function add() {
    abrirFormulario();
}

function abrirFormulario() {

    abrirBack();

    let base = document.getElementById("formBase");
    let novoPopup = document.createElement("div");

    novoPopup.innerHTML = base.innerHTML.replaceAll("?=id", "form");
    novoPopup.setAttribute("class", "popup");
    novoPopup.setAttribute("id", "fichaForm");

    document.body.append(novoPopup);
}

function abrirBack(imagem) {
    let back = document.createElement('div');

    let fn = imagem ? "removerFormularioImagem()" : "removerFormulario()";
    let classe = imagem ? "imgback" : "back";

    back.setAttribute("class", classe);
    back.setAttribute("onclick", fn);

    document.body.append(back);
}

function removerFormulario() {
    document.getElementById("fichaForm").remove();

    let back = document.getElementsByClassName("back");

    while (back.length > 0) {
        back[0].remove();
    }
}

function confirmar() {
    let ficha = obterDadosFormulario();

    if (ficha.id) {
        let fichaSessao = get(ficha.id);

        fichaSessao.nome = ficha.nome;
        fichaSessao.iniciativa = ficha.iniciativa;
        fichaSessao.vida = ficha.vida;
        fichaSessao.extra = ficha.extra;
        fichaSessao.armadura = ficha.armadura;
        fichaSessao.anotacao = ficha.anotacao;

        if (getImagem(ficha.imagem)) {
            fichaSessao.imagem = ficha.imagem;
        }

    } else {
        sessao.ultimaFicha++;
        ficha.id = sessao.ultimaFicha;
        sessao.fichas.push(ficha);
    }

    save();
    render();
    removerFormulario();

    console.log('INSERT: inserção de ficha -> ' + JSON.stringify(ficha));
}

function buildFicha(ficha, index) {
    let base = document.getElementById("fichaBase");
    let novaFichaHTML = document.createElement("div");

    novaFichaHTML.setAttribute("id", "ficha_" + ficha.id);
    novaFichaHTML.setAttribute("class", "ficha");

    let html = base.innerHTML;

    html = html.replaceAll("?=ordem", "#" + (index + 1));
    html = html.replaceAll("?=id", ficha.id);
    html = html.replaceAll("?=nome", ficha.nome);
    html = html.replaceAll("?=iniciativa", ficha.iniciativa);
    html = html.replaceAll("?=vida", ficha.vida);
    html = html.replaceAll("?=extra", ficha.extra);
    html = html.replaceAll("?=armadura", ficha.armadura);
    html = html.replaceAll("?=anotacao", ficha.anotacao);

    if (getImagem(ficha.imagem)) {
        let imagem = getImagem(ficha.imagem);
        html = html.replaceAll("default.png", imagem.url);
    }

    if (ficha.vida < 1) {
        novaFichaHTML.classList.add('morte');
    } else if (!ficha.combate) {
        novaFichaHTML.classList.add('foracombate');
    }
    novaFichaHTML.innerHTML = html;
    return novaFichaHTML;
}

function obterDadosFormulario() {
    let ficha = {
        id: obterDados('form', 'idFicha'),
        nome: obterDados('form', 'nome'),
        iniciativa: obterDados('form', 'iniciativa'),
        extra: obterDados('form', 'extra'),
        vida: obterDados('form', 'vida'),
        armadura: obterDados('form', 'armadura'),
        anotacao: obterDados('form', 'anotacao'),
        imagem: obterDados('form', 'imagem')
    }

    return ficha;
}

function obterDados(id, nomeCampo) {
    let campo = document.querySelector(`[data-id="${id}"][data-campo="${nomeCampo}"]`);

    if (campo && campo.value) {
        return campo.value;
    }

    if (campo && campo.innerText) {
        return campo.innerText;
    }

    return '';
}

function definirDados(id, nomeCampo, valor) {
    let campo = document.querySelector(`[data-id="${id}"][data-campo="${nomeCampo}"]`);
    campo.value = valor;
}

// --------------------------------------------------------------------------------------------
// - formulário de imagens
// --------------------------------------------------------------------------------------------

function abrirFormularioImagem() {

    abrirBack(true);

    let base = document.getElementById("formImagem");
    let formImagem = document.createElement("div");

    formImagem.innerHTML = base.innerHTML.replaceAll("?=addImage", "addImage");
    formImagem.setAttribute("class", "popup");
    formImagem.setAttribute("id", "fichaImagem");

    document.body.append(formImagem);
    renderImages();
}

function removerFormularioImagem() {
    let formImagem = document.getElementById("fichaImagem");
    formImagem.remove();

    let back = document.getElementsByClassName("imgback");

    while (back.length > 0) {
        back[0].remove();
    }
}

function recarregarFormularioImagem() {

    // remove todas as imagens da lista de seleção
    let imagens = document.getElementsByClassName("imagemItem");
    while (imagens.length > 0) {
        imagens[0].remove();
    }

    // renderiza as imagens novamente
    renderImages();
}

function renderImages() {
    let upload = document.getElementById("addImage");
    for (const imagem of sessao.imagens) {
        upload.before(buildImagem(imagem));
    }
}

function buildImagem(imagem) {
    let imagemHTML = document.createElement("img");

    let fnEscolher = "marcarEscolhida(" + imagem.id + ")";
    let fnRemover = "abrirContexto(" + imagem.id + ", 'imagem', this)";

    imagemHTML.setAttribute("onclick", fnEscolher);
    imagemHTML.setAttribute("oncontextmenu", fnRemover);
    imagemHTML.setAttribute("src", imagem.url);
    imagemHTML.setAttribute("class", "imagemItem");

    return imagemHTML;
}

function compare(a, b) {

    if (a.combate != b.combate) {
        if (b.combate) {
            return 1;
        } else {
            return -1;
        }
    }

    if ((a.vida < 1) != (b.vida < 1)) {
        if (a.vida < 1) {
            return 1;
        }

        return -1;
    }

    if (parseInt(a.iniciativa) > parseInt(b.iniciativa)) {
        return -1;
    }

    if (parseInt(a.iniciativa) < parseInt(b.iniciativa)) {
        return 1;
    }

    if (parseInt(a.extra) > parseInt(b.extra)) {
        return -1;
    }

    if (parseInt(a.extra) < parseInt(b.extra)) {
        return 1;
    }

    return 0;
}

function abrirContexto(id, lista, me) {
    let isFicha = lista !== "imagem";
    removerContexto();

    let funcoes = [...FUNCOES_IMAGEM];
    if (isFicha) {
        funcoes = [...FUNCOES_FICHA];

        let fichaHTML = document.getElementById('ficha_' + id);
        if (fichaHTML.classList.contains('foracombate')) {
            funcoes.push(FUNCAO_INSERIR_COMBATE);
        } else {
            funcoes.push(FUNCAO_REMOVER_COMBATE);
        }
    }

    let base = document.getElementById("contextoBase");
    let contexto = document.createElement("div");
    let html = base.innerHTML;
    contexto.innerHTML = html;

    for (const func of funcoes) {
        let li = document.createElement('li');
        let param = id;
        if (func.param) {
            param += ', ' + func.param;
        }

        li.setAttribute('onclick', func.fn + '(' + param + ')');
        li.innerText = func.nome;

        contexto.children[0].append(li);
    }

    let top = me.offsetTop + 10;
    let left = me.offsetLeft + 10;

    contexto.setAttribute("class", "contexto");
    contexto.setAttribute("style", "top: " + top + "px; left: " + left + "px");

    document.body.append(contexto);
}

function combate(id, acao) {
    let ficha = get(id);

    ficha.combate = acao;
    save();
    render();
}

function abrirForm(id, me) {
    abrirFormulario();

    let ficha = get(id);

    if (getImagem(ficha.imagem)) {
        let form = document.getElementById("fichaForm");
        let imagem = getImagem(ficha.imagem);
        form.innerHTML = form.innerHTML.replace("default.png", imagem.url);
        definirDados('form', 'imagem', ficha.imagem);
    }

    definirDados('form', 'idFicha', ficha.id);
    definirDados('form', 'nome', ficha.nome);
    definirDados('form', 'iniciativa', ficha.iniciativa);
    definirDados('form', 'extra', ficha.extra);
    definirDados('form', 'vida', ficha.vida);
    definirDados('form', 'armadura', ficha.armadura);
    definirDados('form', 'anotacao', ficha.anotacao);

}

function removerContexto(e) {

    if (e && e.target.className == "menu") {
        return;
    }

    let contextos = document.getElementsByClassName("contexto");

    while (contextos.length > 0) {
        contextos[0].remove();
    }
}

function remover(id) {
    let ficha = get(id);
    sessao.fichas.splice(sessao.fichas.indexOf(ficha), 1);

    save();
    render();

    console.log('DELETE: remoção de ficha -> ' + JSON.stringify(ficha));
}

function removerImagem(id) {
    let imagem = getImagem(id);
    sessao.imagens.splice(sessao.imagens.indexOf(imagem), 1);

    save();
    render();
    recarregarFormularioImagem();

    // se a imagem removida for a do formulário ela é removida
    if (obterDados('form', 'imagem') == id) {
        atribuirImagemFormulario('default');
    }
}

function duplicar(id) {
    let ficha = get(id);
    let fichaClonada = { ...ficha };

    sessao.ultimaFicha++;
    fichaClonada.id = sessao.ultimaFicha;
    sessao.fichas.push(fichaClonada);

    save();
    render();
}

function marcarEscolhida(id) {
    definirDados('form', 'imagem', id);
    atribuirImagemFormulario(id);
    removerFormularioImagem();
}

function atribuirImagemFormulario(id) {
    let imagem = getImagem(id);
    let url = imagem ? imagem.url : 'default.png';
    let imagemHTML = document.querySelector('#fichaForm img');

    imagemHTML.setAttribute("src", url);
}

function getImagem(id) {
    for (const imagem of sessao.imagens) {
        if (imagem.id == id) {
            return imagem;
        }
    }
}

function exportar() {
    let nome = "backup_" + new Date().getTime();
    let json = JSON.stringify(sessao);
    let link = document.createElement('a');

    link.setAttribute('href', 'data:text/json;charset=utf-8,' + encodeURIComponent(json));
    link.setAttribute('download', nome + '.json');
    link.click();
}

function importarImagem() {
    let uploader = document.getElementById("uploaderImage");
    uploader.click();
}

function importarSessao() {
    let uploader = document.getElementById("uploaderJson");
    uploader.click();
}

function processarJson(e) {
    let arquivo = e.target.files[0];

    const fileReader = new FileReader();
    fileReader.onload = function (event) {
        const conteudo = event.target.result;
        let sessaoUpload;

        try {
            sessaoUpload = JSON.parse(conteudo);
        } catch (e) {
            alert('O arquivo não é um JSON válido.');
            return;
        }

        let jsonValido = true;

        if (validarUpload(sessaoUpload)) {
            sessao = sessaoUpload;
            save();
            render();
            alert('Sessão carregada com sucesso!');
        }
    };

    fileReader.readAsText(arquivo);
}

function validarUpload(sessaoUpload) {
    if (!sessaoUpload.ultimaFicha && sessaoUpload.ultimaFicha != 0) {
        alert('O JSON não possui o campo numérico "ultimaFicha".');
        return false;
    }

    if (isNaN(sessaoUpload.ultimaFicha)) {
        alert('O campo "ultimaFicha" deve ser do tipo numérico.');
        return false;
    }

    if (!sessaoUpload.ultimaImagem && sessaoUpload.ultimaImagem != 0) {
        alert('O JSON não possui o campo numérico "ultimaImagem".');
        return false;
    }

    if (isNaN(sessaoUpload.ultimaImagem)) {
        alert('O campo "ultimaImagem" deve ser do tipo numérico.');
        return false;
    }

    if (!sessaoUpload.fichas) {
        alert('O JSON não possui o campo array "fichas".');
        return false;
    }

    if (!Array.isArray(sessaoUpload.fichas)) {
        alert('O campo "fichas" deve ser do tipo array.');
        return false;
    }

    if (!sessaoUpload.imagens) {
        alert('O JSON não possui o campo array "imagens".');
        return false;
    }

    if (!Array.isArray(sessaoUpload.imagens)) {
        alert('O campo "imagens" deve ser do tipo array.');
        return false;
    }

    for (const ficha of sessaoUpload.fichas) {
        if (!ficha.id) {
            alert('As fichas no campo "fichas" devem ter o campo "id".');
            return false;
        }
    }

    for (const imagem of sessaoUpload.imagens) {
        if (!imagem.id) {
            alert('As imagens no campo "imagens" devem ter o campo "id".');
            return false;
        }
    }

    let integridade = true;
    if (!validarCorrigirFichas(sessaoUpload)) {
        if (confirm("Parece que a ficha está com problemas, deseja realizar um reparo antes do upload?")) {
            validarCorrigirFichas(sessaoUpload, true);

            // fazemos uma nova verificação antes do próximo passo
            if (!validarCorrigirFichas(sessaoUpload)) {
                alert("Parece que ocorreu um erro durante o processo, a continuação do procedimento é desencorajada.");
                integridade = false;
            }
        } else {
            integridade = false;
        }
    }

    let msg = new StringBuilder();
    if (integridade) {
        msg.append("Tudo certo para importação!");
    } else {
        msg.append("A ficha contém problemas, prossiga por sua conta e risco.")
    }

    msg.append(" O processo vai sobreescrever sua sessão atual. Garanta uma cópia de segurança exportando a sessão atual para JSON.");
    msg.append("\n\n Pressione 'Ok' para continuar com o processo:");

    if (confirm(msg.toString())) {
        return true;
    } else {
        return false;
    }
}

function processarImagem(e) {
    let arquivo = e.target.files[0];
    salvarImagem(arquivo);
}

function salvarImagem(arquivo) {
    const canvas = document.getElementById('canvas');
    const contexto = canvas.getContext('2d');
    const imageURL = URL.createObjectURL(arquivo);
    const image = new Image();

    image.onload = function () {
        const size = 64;
        let largura = image.width;
        let altura = image.height;

        // redimensiona para o tamanho final
        if (largura > altura) {
            largura = size * (largura / altura);
            altura = size;
        } else {
            altura = size * (altura / largura);
            largura = size;
        }

        // centraliza a imagem
        const x = 0 - ((largura - size) / 2);
        const y = 0 - ((altura - size) / 2);

        canvas.width = size;
        canvas.height = size;

        contexto.drawImage(image, x, y, largura, altura);
        URL.revokeObjectURL(imageURL);

        sessao.ultimaImagem++;
        let url = canvas.toDataURL("image/jpeg");
        let imagem = {
            id: sessao.ultimaImagem,
            url: url
        }

        sessao.imagens.push(imagem);
        save();
        recarregarFormularioImagem();
    };

    image.src = imageURL;
}

function isPaisagem(altura, largura) {
    if (largura > altura) {
        return true;
    }

    return false;
}

function edit(id) {
    let ficha = get(id);

    ficha.iniciativa = processar(id, 'iniciativa', ficha.iniciativa);
    ficha.vida = processar(id, 'vida', ficha.vida);
    ficha.extra = processar(id, 'extra', ficha.extra);
    ficha.armadura = processar(id, 'armadura', ficha.armadura);

    save();
    render();
}

function processar(id, campo, valor) {

    let novoValor = obterDados(id, campo);
    let retorno;

    try {
        let calculo = eval(novoValor);
        if (novoValor.startsWith('+') || novoValor.startsWith('-')) {
            retorno = parseInt(valor) + parseInt(calculo);
        } else {
            retorno = calculo;
        }

    } catch (error) {
        returno = novoValor;
    }

    if (valor != retorno) {
        let ficha = get(id);
        console.log(`UPDATE: ${campo} de '${valor}' para '${retorno}' de '${ficha.nome}'.`);
    }

    return retorno || '';
}

function atalhosTeclado(e) {
    let formulario = document.getElementById("fichaForm");

    if (e.key === "Escape") {
        removerContexto(e);
        formulario && removerFormulario();
    }

    if (e.key === "Enter" && e.ctrlKey) {
        formulario && confirmar();
    }
}

function validarCorrigirFichas(sessaoUpload, reparar) {
    let ultimoId = 0;
    let ids = [];

    for (const ficha of sessaoUpload.fichas) {
        if (ficha.id > ultimoId) {
            ultimoId = ficha.id;
        }
    }

    if (sessaoUpload.ultimaFicha != ultimoId) {
        if (reparar) {
            sessaoUpload.ultimaFicha = ultimoId;
        } else {
            return false;
        }
    }

    for (const ficha of sessaoUpload.fichas) {
        let id = ficha.id;

        if (ids.indexOf(id) < 0) {
            ids.push(id);
        } else {
            if (reparar) {
                sessaoUpload.ultimaFicha++;
                ficha.id = sessaoUpload.ultimaFicha;
            } else {
                return false;
            }
        }
    }

    return true;
}

function prevent(e) {
    e.cancelBubble = true;
    if (e.stopPropagation) e.stopPropagation();
};

document.addEventListener('contextmenu', event => event.preventDefault());
document.addEventListener("click", (event) => { removerContexto(event) });
document.addEventListener("keydown", (event) => { atalhosTeclado(event) });

class StringBuilder {

    string = '';

    append(string) {
        this.string += string;
    }

    toString() {
        return this.string;
    }

}