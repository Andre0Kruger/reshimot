
const FUNCOES_IMAGEM = [
    { nome: 'Remover', fn: 'removerImagem' }
];

const FUNCOES_FICHA = [
    { nome: 'Duplicar', fn: 'duplicar' },
    { nome: 'Remover', fn: 'remover' }
];

const FUNCAO_REMOVER_COMBATE = { nome: 'Remover do combate', fn: 'combate', param: 'false' };
const FUNCAO_INSERIR_COMBATE = { nome: 'Inserir do combate', fn: 'combate', param: 'true' };

const FORMULARIO = 'form';
const IMAGEM = 'img';
const CONFIRMACAO = 'conf';

// localStorage.setItem('sessao', undefined);

var sessao;
var sessaoImportacao;
var estilizarAlinhamento = true;
var ocultarMortos = false;
var ocultarForaCombate = false;

load();

// carrega do armazenamento local o objeto de sessão
function load() {
    let session = localStorage.getItem('sessao');
    if (session && session != "undefined") {
        sessao = JSON.parse(session);
        validarSessao();
        carregarConfiguracoes();
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

function carregarConfiguracoes() {
    let configuracoes = sessao.configuracoes;
    if (!configuracoes) {
        return;
    }

    if (configuracoes.ocultarMortos !== undefined) {
        ocultarMortos = configuracoes.ocultarMortos;
    }

    if (configuracoes.ocultarForaCombate !== undefined) {
        ocultarForaCombate = configuracoes.ocultarForaCombate;
    }

    if (configuracoes.estilizarAlinhamento !== undefined) {
        estilizarAlinhamento = configuracoes.estilizarAlinhamento;
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

    abrirBack(FORMULARIO);

    let base = document.getElementById("formBase");
    let novoPopup = document.createElement("div");

    novoPopup.innerHTML = base.innerHTML.replaceAll("?=id", "form");
    novoPopup.setAttribute("class", "popup");
    novoPopup.setAttribute("id", "fichaForm");

    document.body.append(novoPopup);
}

function abrirBack(tipo) {
    let back = document.createElement('div');
    let fn;
    let classe;

    if (tipo === CONFIRMACAO) {
        fn = "removerConfirmacao()";
        classe = "back";
    } else if (tipo === IMAGEM) {
        fn = "removerFormularioImagem()";
        classe = "imgback";
    } else if (tipo === FORMULARIO) {
        fn = "removerFormulario()";
        classe = "back";
    }

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

function removerConfirmacao() {
    let confirmacao = document.getElementsByClassName("confirmacao")
    while (confirmacao.length > 0) {
        confirmacao[0].remove();
    }

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
        fichaSessao.alinhamento = ficha.alinhamento;

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

    if (ficha.alinhamento && estilizarAlinhamento) {
        novaFichaHTML.classList.add(ficha.alinhamento);
    }

    if (ficha.vida < 1) {
        novaFichaHTML.classList.add('morte');
        if (ocultarMortos) {
            novaFichaHTML.classList.add('hidden');
        }
    } else if (!ficha.combate) {
        novaFichaHTML.classList.add('foracombate');
        if (ocultarForaCombate) {
            novaFichaHTML.classList.add('hidden');
        }
    }

    novaFichaHTML.setAttribute('oncontextmenu', 'marcar(' + ficha.id + ')');

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
        imagem: obterDados('form', 'imagem'),
        alinhamento: obterDados('form', 'alinhamento')
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

    abrirBack(IMAGEM);

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
    definirDados('form', 'alinhamento', ficha.alinhamento)

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
    let botoes = [{
        texto: 'Sessão completa', fn: 'exportarSessao(false)', classe: 'confirmar'
    }, {
        texto: 'Apenas personagens marcados', fn: 'exportarSessao(true)', classe: 'confirmar'
    }, {
        texto: 'Cancelar', fn: 'removerConfirmacao()', classe: 'cancelar'
    }];

    confirmacao('Este processo irá exportar as fichas da sessão. Que tipo de exportação você deseja fazer?', botoes);
}

function exportarSessao(apenasMarcados) {
    removerConfirmacao();

    let sessaoExportacao;
    if (apenasMarcados) {
        sessaoExportacao = obterMarcados();
    } else {
        sessaoExportacao = sessao;
    }

    if (sessaoExportacao.fichas.length == 0) {
        alerta("Nenhuma ficha foi encontrada.")
        return;
    }

    let nome = "backup_" + new Date().getTime();
    let link = document.createElement('a');
    let json = JSON.stringify(sessaoExportacao);

    link.setAttribute('href', 'data:text/json;charset=utf-8,' + encodeURIComponent(json));
    link.setAttribute('download', nome + '.json');
    link.click();
}

function marcar(id) {
    let fichaHTML = document.getElementById('ficha_' + id);
    fichaHTML.classList.toggle('marcado');
}

function obterMarcados() {
    let fichasHTML = document.getElementsByClassName('marcado');
    let imagens = [];
    let fichas = [];

    for (const fichaHTML of fichasHTML) {
        let id = fichaHTML.getAttribute('id').replace('ficha_', '');
        let ficha = get(id);
        if (!ficha) {
            continue;
        }

        fichas.push(ficha);

        let imagem = getImagem(ficha.imagem);
        if (!imagem) {
            continue;
        }

        imagens.push(imagem);
    }

    return {
        ultimaFicha: sessao.ultimaFicha,
        ultimaImagem: sessao.ultimaImagem,
        configuracoes: sessao.configuracoes,
        fichas: fichas,
        imagens: imagens
    }
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
            alerta('O arquivo não é um JSON válido.');
            return;
        }

        if (validarUpload(sessaoUpload)) {
            sessaoImportacao = sessaoUpload;

            let botoes = [{
                texto: 'Sobrescrever sessão', fn: 'importarCompleto()', classe: 'confirmar'
            }, {
                texto: 'Importar a sessão existente', fn: 'importarExistente()', classe: 'confirmar'
            }, {
                texto: 'Cancelar', fn: 'removerConfirmacao()', classe: 'cancelar'
            }];

            confirmacao('O processo vai reescrever sua sessão atual.\nGaranta uma cópia de segurança exportando a sessão atual para JSON. Escolha uma opção para continuar:', botoes);
        }
    };

    fileReader.readAsText(arquivo);
}

function importarCompleto() {
    sessao = sessaoImportacao;
    save();
    carregarConfiguracoes();
    render();
    alerta('Sessão carregada com sucesso!');
}

function importarExistente() {

    let imagensImportacao = sessaoImportacao.imagens;
    let imagens = sessao.imagens;

    let fichasImportacao = sessaoImportacao.fichas;
    let fichas = sessao.fichas;

    let ultimaImagem = sessao.ultimaImagem;
    let ultimaFicha = sessao.ultimaFicha;

    for (const imagem of imagensImportacao) {
        let idAntigo = imagem.id;
        let idNovo;

        for (const img of imagens) {
            if (imagem.url == img.url) {
                idNovo = img.id;
                break;
            }
        }

        if (!idNovo) {
            ultimaImagem++;
            idNovo = ultimaImagem;
            imagens.push({ id: idNovo, url: imagem.url });
        }

        for (const ficha of fichasImportacao) {
            if (ficha.imagem == idAntigo) {
                ficha.imagem = idNovo;
            }
        }
    }

    for (const ficha of fichasImportacao) {
        ultimaFicha++;
        ficha.id = ultimaFicha;
        fichas.push(ficha);
    }

    sessao.ultimaFicha = ultimaFicha;
    sessao.ultimaImagem = ultimaImagem;

    save();
    carregarConfiguracoes();
    render();
    alerta('Sessão carregada com sucesso!');
}

function alerta(mensagem) {
    confirmacao(mensagem, [{ texto: 'Ok', fn: 'removerConfirmacao()', classe: 'confirmar' }])
}

function confirmacao(mensagem, botoes, manterConfirmacao) {
    if (!manterConfirmacao) {
        removerConfirmacao();
    }

    let p = document.createElement('p');
    p.innerText = mensagem;

    let modalHTML = document.createElement('div');
    modalHTML.setAttribute('class', 'confirmacao');
    modalHTML.append(p);

    for (const botao of botoes) {
        let button = document.createElement('button');

        if (botao.classe) {
            button.setAttribute('class', botao.classe);
        }

        button.innerText = botao.texto;
        button.setAttribute('onclick', botao.fn);

        modalHTML.append(button);
    }

    abrirBack(CONFIRMACAO);
    document.body.append(modalHTML);
}

function validarUpload(sessaoUpload) {
    if (!sessaoUpload.ultimaFicha && sessaoUpload.ultimaFicha != 0) {
        alerta('O JSON não possui o campo numérico "ultimaFicha".');
        return false;
    }

    if (isNaN(sessaoUpload.ultimaFicha)) {
        alerta('O campo "ultimaFicha" deve ser do tipo numérico.');
        return false;
    }

    if (!sessaoUpload.ultimaImagem && sessaoUpload.ultimaImagem != 0) {
        alerta('O JSON não possui o campo numérico "ultimaImagem".');
        return false;
    }

    if (isNaN(sessaoUpload.ultimaImagem)) {
        alerta('O campo "ultimaImagem" deve ser do tipo numérico.');
        return false;
    }

    if (!sessaoUpload.fichas) {
        alerta('O JSON não possui o campo array "fichas".');
        return false;
    }

    if (!Array.isArray(sessaoUpload.fichas)) {
        alerta('O campo "fichas" deve ser do tipo array.');
        return false;
    }

    if (!sessaoUpload.imagens) {
        alerta('O JSON não possui o campo array "imagens".');
        return false;
    }

    if (!Array.isArray(sessaoUpload.imagens)) {
        alerta('O campo "imagens" deve ser do tipo array.');
        return false;
    }

    for (const ficha of sessaoUpload.fichas) {
        if (!ficha.id) {
            alerta('As fichas no campo "fichas" devem ter o campo "id".');
            return false;
        }
    }

    for (const imagem of sessaoUpload.imagens) {
        if (!imagem.id) {
            alerta('As imagens no campo "imagens" devem ter o campo "id".');
            return false;
        }
    }

    corrigirSessao(sessaoUpload);
    return true;
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

function corrigirSessao(sessaoUpload) {
    let ultimaFicha = 0;
    let ultimaImagem = 0;

    for (const ficha of sessaoUpload.fichas) {
        if (ficha.id > ultimaFicha) {
            ultimaFicha = ficha.id;
        }
    }

    if (sessaoUpload.ultimaFicha < ultimaFicha) {
        sessaoUpload.ultimaFicha = ultimaFicha;
    }

    for (const imagem of sessaoUpload.imagens) {
        if (imagem.id > ultimaImagem) {
            ultimaImagem = imagem.id;
        }
    }

    if (sessaoUpload.ultimaImagem < ultimaImagem) {
        sessaoUpload.ultimaImagem = ultimaImagem;
    }
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