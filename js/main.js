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
const correspondentes = [];
function buscarTodos() {
	const requisicoes = [];
	for(let i = 1;i <= 140;i++) {					//Essa func roda 1 vez no final, ela guarda os 140 pokemons
		requisicoes.push(					//no armazenPok e so é usada na pesquisa por enquanto
			fetch(`https://pokeapi.co/api/v2/pokemon/${i}`)
			.then(response => response.json())
		);
	}
	Promise.all(requisicoes).then(pokemon => {
		for(let i = 0;i < 140;i++) {
			armazemPok.push({pok: pokemon[i].name, id: pokemon[i].id});
		}
	});
	console.log(armazemPok);
}
campo_busca.addEventListener("keydown", function(evento) {
	if(evento.key == "Enter") {					//eventlistener da pesquisa, o usuario digita e quando aperta
		pesquisando = 1;					//enter o codigo roda, ele busca no armazenPok o pokemon que
		for(let i = 0;i < 140;i++) {				//se compara ao digitado ||(ou) que começa com o digitado
			pokemon = campo_busca.value.toLowerCase();
			if(pokemon == armazemPok[i].pok || armazemPok[i].pok.startsWith(pokemon)) {
				correspondentes.push(armazemPok[i].id);
			}
		}
		pokedex_container.replaceChildren();
		atualizar(buscarPesquisa());
		correspondentes.length = 0;
	}else if(campo_busca.value) pesquisando = 0;
});
container_tipo.addEventListener("click", function(evento) {
	if(!evento) return;
	if(evento.target.dataset.tipo == undefined) return;	//essa func é do filtro, quando ela roda ela pega local que o user
	filtro = evento.target.dataset.tipo;			//clico e faz a verificacao se é valido, se for ela ve qual foi
	pokedex_container.replaceChildren();			//apertado com o evento.target.dataset.tipo e define o filtro
	if(estado_ATD){						//limpa os cards e verifica se ta na minhadex ou nao
		atualizar(buscarATD());				
		console.log("de cima rodo");
	}
	else{
		atualizar(buscar());
		console.log("de baixo rodo");
	}
	console.log(filtro);
});
console.log(pokemons_ATD);
function buscar() {
	let x = multiplicador * 20;				//func da busca da api, usada bastante no codigo pra varias chamadas
	let y = x - 19;						//ou seja o fetch ta sendo chamado varias vezes no codigo
	const requisicoes = [];					//oque ta errado, x e y sao vars auxiliares, a multiplicador mexe
	for(;y <= x;y++) {					//com os numeros embaixo do html(1,2,3,4,5,6,7)
		requisicoes.push(
			fetch(`https://pokeapi.co/api/v2/pokemon/${y}`)
			.then(response => response.json())
		);
	}
	return requisicoes;
}
function buscarATD() {
	for(let i = 0;i < pokemons_ATD.length;i++) {
		for(let x = 0;x < pokemons_ATD.length - 1 - i;x++) { //mesma coisa que a busca so que agora tem um bubblesort
			if(pokemons_ATD[x] > pokemons_ATD[x+1]) {    //e é exclusivo da minhadex, nao usa o multiplicador, no lugar
				let temp = pokemons_ATD[x];	     //usa o bubblesort para organizar os pokemons e usa o localStrg
				pokemons_ATD[x] = pokemons_ATD[x+1];  
				pokemons_ATD[x+1] = temp;
			}
		}
	}
	const requisicoes = [];
	for(let i = 0;i < pokemons_ATD.length;i++) {
		requisicoes.push(
			fetch(`https://pokeapi.co/api/v2/pokemon/${pokemons_ATD[i]}`)
			.then(response => response.json())
		);
	}
	return requisicoes;
}
function buscarPesquisa() {
	const requisicoes = [];
	for(let i = 0;i < correspondentes.length;i++) { //mesma coisa que a busca mas exclusivo da pesquisa 
		requisicoes.push(
			fetch(`https://pokeapi.co/api/v2/pokemon/${correspondentes[i]}`) 
			.then(response => response.json())
		);
	}
	return requisicoes;
}
function atualizar(requisicoes) { //func principal do codigo, ela é usada para renderizar os cards, muito 'for' usada nela por causa
	Promise.all(requisicoes).then(pokemon => {		//dos tipos
		for(let x = 0;x < pokemon.length;x++) {
			let temTipo = false; //esse codigo aqui em baixo faz parte da logica dos favoritos
			if(filtro == "favorites") { //so roda se filtro for favorites
				for(let i = 0;i < localStorage.length;i++) { //entao percorre o localStorage pelos pokemons favoritds
					let chave = localStorage.key(i); //pega a chave do localStorage
					let objt = JSON.parse(localStorage.getItem(chave)); //e usa ela para pegar o objt do pok
					if(objt.id == pokemon[x].id && objt.fav) temTipo = true; //e finalmente verifica se o pok
				}								//ta favoritado ou nao ja que ele
			}									//pode estar no localStrg pelo ATD
			for(let i = 0;i < pokemon[x].types.length;i++) {
				if(pokemon[x].types[i].type.name == filtro) { //logica do filtro, se o pokemon que ta sendo renderizd
					temTipo = true;			//se compara ao filtro usado pelo usuario, se sim ent...
				}
			}
			if(filtro != "all") {
				if(!temTipo) continue; //pode passar caso tenha tipo, senao tiver tipo continua pra prxm renderizacao
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
	});
}

function resgatarPokemons() {
	for(let i = 0;i < localStorage.length;i++) { //essa func faz oque ela diz... e roda uma vez so no final do codigo
		let chave = localStorage.key(i);
		let objt = JSON.parse(localStorage.getItem(chave));
		if(objt.ATD) pokemons_ATD.push(objt.id); //acho que vou explica algo que pode fica confuso, esse é um if sem chave
		if(objt.fav) pokemons_favoritos.push(objt.fav);	//ele so roda uma linha de codigo e é bem compacto e legal
		console.log(`chave:${chave} fav:${objt.fav} ATD:${objt.ATD} id:${objt.id}`);
	}
}

function gerenCards(evento) { //essa func gerencia o comportamento dos cards dependendo do estado_ATD 
	if(estado_ATD == 1) return; //se tiver na minhadex retorna
	if(evento) multiplicador = evento.target.getAttribute("data-numero"); //jeito antigo de pegar a data do html, nao sabia
	if(!multiplicador) return; //se o usuario nao clicar em um numero retorna
	pokedex_container.replaceChildren(); //tira os cards e
	atualizar(buscar()); //chama a func pra renderiza tudo denovo
	console.log(`multiplicador:${multiplicador}`); //essa func tambem serve para desabilitar os numeros embaixo do html quando
}							//na minhadex

container_selecao.addEventListener("click", gerenCards); //eventlistener dos numeros embaixo do html(1,2,3,4,5,6,7) ele usa a func
							//gerenCards ou seja, a gerenCards mexe com os numeros embaixo do html
irParaDex.addEventListener("click", function() {
	if(estado_ATD == 0) {			//bem simples, ela é o eventlistener da minhadex, e muda a var estado_ATD para 1
		estado_ATD = 1;			//se era 0, e para 0 se era 1
		pokedex_container.replaceChildren(); //tira cards
		atualizar(buscarATD()); //renderiza com buscarATD
	}else{
		estado_ATD = 0; //volta pro estado de antes
		gerenCards(); //e ta aqui o motivo de eu ter criado uma func separada no lugar de criar dentro do addeventlistener
	}
});
buscarTodos();
resgatarPokemons();
atualizar(buscar());
