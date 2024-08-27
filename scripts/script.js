const criptAlura = [["e", "enter"], ["i", "imes"], ["a", "ai"], ["o", "ober"], ["u", "ufat"]];
const regex = /[0-9á-žÁ-Ž]/;

let aesKey;


function alterarCampos() {
    document.getElementById("texto").value = '';
    document.getElementById("chave").value = '';
    document.querySelectorAll(".card__conteudo__antes").forEach(element => {
    element.style.display = "none";
    });
    document.querySelectorAll(".card__conteudo__depois").forEach(element => {
    element.style.display = "flex";
    });
    document.querySelectorAll(".card__conteudo__botoes").forEach(element => {
    element.style.display = "flex";
    });
}

function alterarCamposAlura() {
    document.getElementById('resultado__key__texto').style.display = "none";
    document.getElementById('resultado__key').style.display = "none";
    document.getElementById('botao__cop__key').style.display = "none";
}

function validaTexto() {
    let texto = document.getElementById("texto").value;

    if (!texto) {
        alert("Por favor, preencha o campo com texto");
        return false;
    }

    if (regex.test(texto)) {
        alert("O texto contém números ou acentos. Por favor, remova-os.");
        return false; 
    }
    
    return true;
}

function criptografar() {
    document.getElementById('resultado__key__texto').style.display = "flex";
    document.getElementById('resultado__key').style.display = "flex";
    document.getElementById('botao__cop__key').style.display = "flex";
    if (validaTexto()) {
        tipoCrip();
    }
}

function copiarTexto() {
    const textoArea = document.getElementById('resultado');
    navigator.clipboard.writeText(textoArea.textContent);
}

function copiarKey() {
    const keyArea = document.getElementById('resultado__key');
    navigator.clipboard.writeText(keyArea.textContent);
}

function aluraCrip() {
    let texto = document.getElementById("texto").value.toLowerCase();
    let texto_crip = texto;
    
    alterarCampos();
    alterarCamposAlura();

    criptAlura.forEach(([antes, depois]) => {
        texto_crip = texto_crip.replaceAll(antes, depois);
    });

    document.getElementById('resultado').textContent = texto_crip;
}

function aluraDescrip() {
    
    let texto = document.getElementById("texto").value.toLowerCase();
    let texto_descrip = texto;

    alterarCampos();
    alterarCamposAlura();

    criptAlura.forEach(([antes, depois]) => {
        texto_descrip = texto_descrip.replaceAll(depois, antes);
    });

    document.getElementById('resultado').textContent = texto_descrip;

}

async function aesCrip() {
    try {
        let texto = document.getElementById("texto").value;
        alterarCampos();

        aesKey = await crypto.subtle.generateKey({name: "AES-GCM", length: 256},true,["encrypt", "decrypt"]);

        const encoder = new TextEncoder();
        const dados = encoder.encode(texto);
        const iv = crypto.getRandomValues(new Uint8Array(12));

        const criptografado = await crypto.subtle.encrypt({name: "AES-GCM", iv: iv},aesKey,dados);

        const bufferCriptografado = new Uint8Array(criptografado);
        const textoCriptografado = btoa(String.fromCharCode(...bufferCriptografado));
        const ivBase64 = btoa(String.fromCharCode(...iv));

        const chaveBase64 = btoa(String.fromCharCode(...new Uint8Array(await crypto.subtle.exportKey("raw", aesKey))));

        document.getElementById('resultado').textContent = `${ivBase64};${textoCriptografado}`;
        document.getElementById('resultado__key').textContent = chaveBase64;

    } catch (error) {
        console.error("Erro na criptografia AES:", error);
    }
}

async function aesDescrip(chave, texto) {
    try {
        let texto_conteudo = texto;
        let chaveSecreta = chave;

        alterarCampos();
        alterarCamposAlura();

        const [ivBase64, textoCriptografado] = texto_conteudo.split(';');


        const iv = new Uint8Array(atob(ivBase64).split("").map(char => char.charCodeAt(0)));
        const dadosCriptografados = new Uint8Array(atob(textoCriptografado).split("").map(char => char.charCodeAt(0)));
        const chaveDerivada = new Uint8Array(atob(chaveSecreta).split("").map(char => char.charCodeAt(0)));

        aesKey = await crypto.subtle.importKey("raw", chaveDerivada, "AES-GCM", false, ["decrypt"]);

        const descriptografado = await crypto.subtle.decrypt({name: "AES-GCM", iv: iv}, aesKey, dadosCriptografados);

        const decoder = new TextDecoder();
        const textoDescriptografado = decoder.decode(descriptografado);

        document.getElementById('resultado').textContent = textoDescriptografado;
       
    } catch (error) {
        console.error("Erro na descriptografia AES:", error);
        alert("Ocorreu um erro na descriptografia AES.");
    }
}

function tipoCrip() {
    let tipoCriptografia = document.querySelector('input[name="criptografia"]:checked').value;

    switch (tipoCriptografia) {
        case 'ALURA':
            aluraCrip();
            break;
        case 'AES':
            aesCrip();
            break;
    }
}

function tipoDescrip() {
    let tipoDescriptografia = document.querySelector('input[name="criptografia"]:checked').value;
    let chave = document.getElementById("chave").value;
    let texto = document.getElementById("texto").value;

    switch (tipoDescriptografia) {
        case 'ALURA':
            if (validaTexto()){
                aluraDescrip();
                break;
            } else {
                break;
            };
        case 'AES':
            if (texto === "") {
                alert("Por favor, insira texto para criptografar.");
                break;
            } else if (chave === ""){
                alert("Por favor, insira a chave de criptografia AES.");
                break;
            } else {
                aesDescrip(chave, texto);
            }
            break;
    }
}