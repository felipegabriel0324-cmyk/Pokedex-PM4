let multiplicador = 1;
let estado_ATD = 0;
let filtro = "all";
let pesquisando = 0;
const pokemons_favoritos = [];
const pokemons_ATD = [];
const pokedex_container = document.querySelector("#pokedex-container");
const container_selecao = document.getElementById("selecao_script");
const irParaDex = document.getElementById("irParaDex");
const container_tipo = document.getElementById("tipo_script");
const campo_busca = document.getElementById("campo-busca");
const armazemPok = [];
async function buscarTodos() { //Nova funcao: ela resolve o problema no qual se chama a API toda vez que renderiza os cards
	try {                  //adicionado tambem try e catch, o codigo continua rodando mesmo que tenha um erro
		const pokemonsSalvos =  localStorage.getItem("pokemons");
		if(pokemonsSalvos) {
			console.log("Pokemons ja existem, recuperando..."); //Aqui, localStorage para diminuir ainda mais as chamadas
			armazemPok.push(...JSON.parse(pokemonsSalvos));
			atualizar(buscar());
			return;
		}
		console.log("Pokemons ainda nao salvos, chamando...");
		const requisicoes = [];
		for(let i = 1;i <= 140;i++) {
			requisicoes.push(
				fetch(`https://pokeapi.co/api/v2/pokemon/${i}`)
				.then(response => {
					if(!response.ok) { //Tratamento de erro da API, se houver um erro 404 o catch nao pega
						throw new Error(`Erro HTTP: ${response.status}`); //<- entao voce mesmo implementa
					}
					return response.json();
				})
			);
		}
		const pokemon = await Promise.all(requisicoes); //await pausa a func async ate promise.all, dps retorna o valor
		const pokemonsReduzidos = pokemon.map(p => ({
			id: p.id,		//Funcao nova .map, ela pega um vetor de objetos e cria outro com os valores dentro
			name: p.name,		//desse objeto. ta mas porque eu utilizei ela? é pq eu salvo os dados em localStrg
			types: p.types,		//os objetos dos pokemons sao enormes, por isso eu so pego oque eu preciso deles
			sprites: {		//ainda nao entendeu? o espaco do localStrg so aguenta 5mb dependendo do navegador
				front_default: p.sprites.front_default //por isso eu tive que diminuir o tamanho dos objetos
			}
		}));
		armazemPok.push(...pokemonsReduzidos);
		localStorage.setItem("pokemons", JSON.stringify(pokemonsReduzidos));
		atualizar(armazemPok);
		gerarPaginacao()
	}catch(erro) {
		console.error("ERR ao carregar os pokemons:", erro);
	}
}
//As funcoes abaixos sao as funcoes antigas mas reformadas, elas resolvem a renderizacao da paginacao, minhadex e do favoritos
//Bem menos codigo e nao chama a API toda vez
//Trabalham de uma forma nova agora, usando os dados armazenados em armazemPok
function buscar() {
	gerarPaginacao(armazemPok.length);
	const inicio = (multiplicador * 20) - 20;
	const fim = multiplicador * 20; //Calcula o inicio e o fim da pagina atual e retorna apenas 20 pokemons
	return armazemPok.slice(inicio, fim);
}
function gerarPaginacao(totalResultados) {
    const totalPaginas = Math.ceil(totalResultados / 20);

    container_selecao.replaceChildren();

    for(let i = 1; i <= totalPaginas; i++) {
        const botao = document.createElement("button");
        botao.textContent = i;
        botao.classList.add("selecao_estilo");
        botao.setAttribute("data-numero", i);
        container_selecao.appendChild(botao);
    }
}
function buscarATD() {
	const resultado = armazemPok.filter(pokemon =>		//Retorna somente os pokemons em que os IDs estao registrados na minha dex
		pokemons_ATD.includes(pokemon.id)	//O includes verifica se o ID do pokemon existe no array pokemons_ATD
	); 
	resultado.sort((a, b) => a.id - b.id);
	gerarPaginacao(resultado.length);
	const inicio = (multiplicador * 20) - 20;
	const fim = multiplicador * 20;
	return resultado.slice(inicio, fim);
}
function buscarFavoritos() {
	const resultado = armazemPok.filter(pokemon =>	//Percorre os pokemons armazenados e verifica se algum deles possui o tipo
		pokemons_favoritos.includes(pokemon.id)	//selecionado pelo user
	);
	gerarPaginacao(resultado.length);
	const inicio = (multiplicador * 20) - 20; //aplica a paginacao
	const fim = multiplicador * 20;
	return resultado.slice(inicio, fim); //e return resultado
}
//filtroTipo
function filtrarPorTipo() { //func do Erick
	const resultado = [];

	for(let i = 0; i < armazemPok.length; i++) {
		for(let j = 0; j < armazemPok[i].types.length; j++) { //mudei .type para .types para resolver problema de syntax
			if(armazemPok[i].types[j].type.name == filtro) {
				resultado.push(armazemPok[i]);
				break;
			}
		}
	}
	gerarPaginacao(resultado.length);
	const inicio = (multiplicador * 20) - 20;
	const fim = multiplicador * 20;
	const pagina = resultado.slice(inicio, fim);
	return pagina;
}
//percorreTipo
function buscarPorTipo() {
	return filtrarPorTipo();
}

campo_busca.addEventListener("keydown", function(evento) {
	if(evento.key == "Enter") {
		pesquisando = 1;
		const termo = campo_busca.value.toLowerCase().trim();
		if(!termo){
			multiplicador = 1;
			pokedex_container.replaceChildren();
			atualizar(buscar());
			return; 
		}
		const correspondentes = armazemPok.filter(pokemon => //Filtra os pokemons em que o nome comeca com o que o usuario
			pokemon.name.startsWith(termo)		     //digitou
		);
		pokedex_container.replaceChildren();
		atualizar(correspondentes);
	}else if(campo_busca.value) {
		pesquisando = 0;
	}
});
container_tipo.addEventListener("click", function(evento) { //AddEventListener dos filtros
	if(!evento) return;				    //quando o usuario nao aperta em um filtro mas na caixa pai dos filtros
	if(evento.target.dataset.tipo == undefined) return;
	//verifica se o elemento clicado possui data-tipo
	//se nao possuir interrompe a execucao para evitar alterar o filtro
	filtro = evento.target.dataset.tipo;		    //pega o tipo que o usuario clicou
	multiplicador = 1;			//reinicia a paginacao para comecar pela primeira pagina do novo filtro
	pokedex_container.replaceChildren();    //remove os cards anteriores
	if(estado_ATD) {
    		atualizar(buscarATD());			    //Aqui nessa parte reside a logica que cuida dos locais que o user clica
	}						    //como quando o usuario esta na minha dex
	else if(filtro !== "all" && filtro !== "favorites") {	//ou quando ele clica em all ou favorites
    		atualizar(buscarPorTipo());			//nesse caso ele nao clica em all ou favorites, por isso se chama a
	}							//a func de buscarPorTipo()
	else if(filtro === "favorites") {		//Caso especial dos favorites
		atualizar(buscarFavoritos());		//chama a func buscarFavoritos() para resolver esse caso
	}
	else {						//Aqui um else de ultimo caso
    		atualizar(buscar());
	}
});
console.log(pokemons_ATD);
function atualizar(pokemon) { //func principal do codigo, ela é usada para renderizar os cards, muito 'for' usada nela por causa
	console.log("Recebido pelo atualizar:", pokemon);
	console.log("Filtro atual:", filtro);
		for(let x = 0;x < pokemon.length;x++) {
			let temTipo = false; //esse codigo aqui em baixo faz parte da logica dos favoritos
			if(filtro == "favorites") {
				for(let i = 0;i < localStorage.length;i++) { //Recebe um array de Pokémon e cria os cards correspdnts
					let chave = localStorage.key(i); //A variável temTipo controla se o Pokémon pode ser exibido
					if(!chave.startsWith("pokemon_")) continue;
					let objt = JSON.parse(localStorage.getItem(chave)); //com o filtro atual.
					if(objt.id == pokemon[x].id && objt.fav) temTipo = true;
				}
			}
			for(let i = 0;i < pokemon[x].types.length;i++) {
				if(pokemon[x].types[i].type.name == filtro) {
					temTipo = true;
				}
			}
			if(filtro != "all" && filtro != "favorites") {
    			if(!temTipo) continue;
			}
			const type = [];

			const pokemonAtual = pokemon[x]; //tentei organizar o maximo, daqui pra frente comeca a renderizacao

			let div1 = document.createElement("div"); //primeiro cria os elementos e adiciona as classes
			div1.classList.add("pokemon-card");
			let div2 = document.createElement("div");
			div2.classList.add("id-estrela");
			let id = document.createElement("p");
			id.classList.add("pokemon-id");
			let iconButton = document.createElement("button");
			iconButton.classList.add("icon-button");
			let icon = document.createElement("img");
			icon.classList.add("icon");
			let img = document.createElement("img");
			img.classList.add("pokemon-img");
			let name = document.createElement("h2");
			name.classList.add("pokemon-name");
			for(let i = 0;i < pokemon[x].types.length;i++) {
				type[i] = document.createElement("span");
				type[i].classList.add("pokemon-type");
				type[i].classList.add(pokemon[x].types[i].type.name);
			}
			let div3 = document.createElement("div");
			div3.classList.add("types-style");
			let ATDbutton = document.createElement("button");
			ATDbutton.classList.add("ATD-button");

			id.textContent = `#${pokemon[x].id}`; //dai adiciona o conteudo
			icon.src = "images/estrela.svg";
			img.src = pokemon[x].sprites.front_default;
			img.alt = pokemon[x].name;
			name.textContent = pokemon[x].name;
			for(let i = 0;i < pokemon[x].types.length;i++) {
				type[i].textContent = pokemon[x].types[i].type.name;
			}
			ATDbutton.textContent = "+ ADD TO DEX";

			pokedex_container.appendChild(div1); //liga os containers e as divs
			div1.appendChild(div2);
			div2.appendChild(id);
			iconButton.appendChild(icon);
			div2.appendChild(iconButton);
			div1.appendChild(img);
			div1.appendChild(name);
			for(let i = 0;i < pokemon[x].types.length;i++) {
				div3.appendChild(type[i]);
			}
			div1.appendChild(div3);
			div1.appendChild(ATDbutton); //depois a logica do favorito e ATD que significa AddToDex

			let chavePok = `pokemon_${pokemon[x].id}`;
			let salvo = localStorage.getItem(chavePok); //chama o localStorage para saber se o pok ja ta favoritado ou
			let estadoFavoritado = {fav:0, ATD:0, id:pokemon[x].id}; //adicionado na minhadex
			if(salvo) {
				estadoFavoritado = JSON.parse(salvo); //esse if serve pra saber se tem algo no localStorage
									//se tiver, JSON.parse(salvo) coloca o conteudo do localStrg
			}						//no estadoFavoritado
			if(estadoFavoritado.fav == 1) {
				icon.src = "images/estrelaAtivado.svg"; //comeca os ifs e elses para apresentar o estado
			}else{						//dos favoritos e ATD
				icon.src = "images/estrela.svg";
			}
			if(estadoFavoritado.ATD == 1) {
				ATDbutton.textContent = "ADICIONADO";
			}else{
				ATDbutton.textContent = "+ ADD TO DEX";
			}

			iconButton.addEventListener("click", function() { //logica do favorito, muda o icone da estrela e salva no
				if(estadoFavoritado.fav) {			//objeto estadoFavoritado a mudanca
					icon.src = "images/estrela.svg";
					estadoFavoritado.fav = 0;
					let indice = pokemons_favoritos.indexOf(pokemonAtual.id); //se estadoFavoritado.fav = 1
					if(indice != -1) {
						pokemons_favoritos.splice(indice, 1); //tira esse pokemon dos favoritos
					}
				}else{
					icon.src = "images/estrelaAtivado.svg";
					estadoFavoritado.fav = 1; //senao adiciona esse pokemon aos favoritos
					pokemons_favoritos.push(pokemonAtual.id);
				}
				localStorage.setItem(chavePok, JSON.stringify(estadoFavoritado)); //aqui coloca o estadoFavoritado
				for(let i = 0;i < pokemons_favoritos.length;i++) {		//no localStorage
					console.log(`vetorPF${i}: ${pokemons_favoritos[i]}`);
				}
			});

			ATDbutton.addEventListener("click", function() { //logica do ATD, funciona similarmente ao favorito
				if(estadoFavoritado.ATD) {		//usa a mesma logica e o mesmo objeto
					ATDbutton.textContent = "+ ADD TO DEX";
					estadoFavoritado.ATD = 0;
					let indice = pokemons_ATD.indexOf(pokemonAtual.id);
					if(indice != -1) {
						pokemons_ATD.splice(indice, 1);
					}
				}else{
					ATDbutton.textContent = "ADICIONADO";
					estadoFavoritado.ATD = 1;
					pokemons_ATD.push(pokemonAtual.id);
				}
				localStorage.setItem(chavePok, JSON.stringify(estadoFavoritado));
				for(let i = 0;i < pokemons_ATD.length;i++) {
					console.log(`vetorPATD${i}: ${pokemons_ATD[i]}`);
				}
			});
		}
}

function resgatarPokemons() {
	for(let i = 0;i < localStorage.length;i++) { //essa func faz oque ela diz... e roda uma vez so no final do codigo
		let chave = localStorage.key(i);
		if(!chave.startsWith("pokemon_")) continue;
		let objt = JSON.parse(localStorage.getItem(chave));
		if(objt.ATD) pokemons_ATD.push(objt.id); //acho que vou explica algo que pode fica confuso, esse é um if sem chave
		if(objt.fav) pokemons_favoritos.push(objt.id);	//ele so roda uma linha de codigo e é bem compacto e legal
		console.log(`chave:${chave} fav:${objt.fav} ATD:${objt.ATD} id:${objt.id}`);
	}
}

function gerenCards(evento) { //essa func gerencia o comportamento dos cards, tem a ver com os numeros embaixo do html(1,2,3,4,5,6,7)
	if(estado_ATD == 1) {
    	multiplicador = evento.target.getAttribute("data-numero");
    	pokedex_container.replaceChildren();
    	atualizar(buscarATD());
    return;
	}
	if(evento) multiplicador = evento.target.getAttribute("data-numero"); //jeito antigo de pegar a data do html, nao sabia
	if(!multiplicador) return; //se o usuario nao clicar em um numero retorna
	pokedex_container.replaceChildren(); //tira os cards e
	if(filtro !== "all" && filtro !== "favorites") {
    		atualizar(buscarPorTipo());//atualizaComFiltro
	}
	else if(filtro === "favorites") {
		atualizar(buscarFavoritos());
	}
	else {
	    	atualizar(buscar());//atualizaSemFiltro
	}
	console.log(`multiplicador:${multiplicador}`); //essa func tambem serve para desabilitar os numeros embaixo do html quando
}							//na minhadex

container_selecao.addEventListener("click", gerenCards); //eventlistener dos numeros embaixo do html(1,2,3,4,5,6,7) ele usa a func
							//gerenCards ou seja, a gerenCards mexe com os numeros embaixo do html
irParaDex.addEventListener("click", function() {
	if(estado_ATD == 0) {			//bem simples, ela é o eventlistener da minhadex, e muda a var estado_ATD para 1
		multiplicador = 1; //RESETA O MULTIPLICADOR
		estado_ATD = 1;			//se era 0, e para 0 se era 1
		pokedex_container.replaceChildren(); //tira cards
		atualizar(buscarATD()); //renderiza com buscarATD
	}else{
		estado_ATD = 0; //volta pro estado de antes
		multiplicador = 1; //RESETA O MULTIPLICADOR
		gerenCards(); //e ta aqui o motivo de eu ter criado uma func separada no lugar de criar dentro do addeventlistener
	}
});
buscarTodos();
resgatarPokemons();
