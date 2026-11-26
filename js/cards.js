console.log("cardsCarrego");
const modal = document.querySelector(".modal");
modal.addEventListener("click", (event) => {
	if(event.target === modal) {
		modal.classList.remove("ativo");
		modal.replaceChildren();
	}
});
window.addEventListener("cardsAtualizados", (e) => {
	console.log("cardsatulizados");
	const cards = document.querySelectorAll(".pokemon-card");
	cards.forEach(card => {
		card.addEventListener("click", (event) => {
			modal.classList.add("ativo");
			const type = [];
			const abilities = [];
			const id = Number(event.currentTarget.dataset.id);
			const pokemons = JSON.parse(localStorage.getItem("pokemons"));
			const pokemon = pokemons.find(p => p.id === id);

			let divCoberturaModal = document.createElement("div");
			divCoberturaModal.classList.add("coberturaModal");
			modal.appendChild(divCoberturaModal);
			
			let divModal = document.createElement("div");
			divModal.classList.add("conteudoEsquerda");
			divCoberturaModal.appendChild(divModal);

			let div1Modal = document.createElement("div");
			div1Modal.classList.add("conteudoDireita");
			divCoberturaModal.appendChild(div1Modal);

			let divIdNomeModal = document.createElement("div");
			divIdNomeModal.classList.add("IdNomeModal");
			divModal.appendChild(divIdNomeModal);

			let divTypes = document.createElement("div");
			divTypes.classList.add("divTypesModal");
			divModal.appendChild(divTypes);

			let idModal = document.createElement("a");
			idModal.classList.add("modalId");
			idModal.textContent = id;
			divIdNomeModal.appendChild(idModal);

			let nameModal = document.createElement("a");
			nameModal.classList.add("modalName");
			nameModal.textContent = pokemon.name;
			divIdNomeModal.appendChild(nameModal);

			let heightModal = document.createElement("a");
			heightModal.classList.add("modalHeight");
			heightModal.textContent = "Altura: " + pokemon.height + "0 cm";
			divModal.appendChild(heightModal);

			let weightModal = document.createElement("a");
			weightModal.classList.add("modalWeight");
			let pokemonweight =  pokemon.weight / 10;
			weightModal.textContent = "Peso: " + pokemonweight + " kg";
			divModal.appendChild(weightModal);

			let imgModal = document.createElement("img");
			imgModal.classList.add("imgModal");
			imgModal.src = pokemon.sprites.front_default;
			imgModal.alt = pokemon.name;
			div1Modal.appendChild(imgModal);

			for(let i = 0;i < pokemon.types.length;i++) {
				type[i] = document.createElement("span");
				type[i].classList.add("modalType");
				type[i].classList.add(pokemon.types[i].type.name);
				type[i].classList.add("pokemon-type");
				type[i].textContent = pokemon.types[i].type.name;
				divTypes.appendChild(type[i]);
			}

			let modalAbilities = document.createElement("a");
			modalAbilities.classList.add("modalAbilities");
			modalAbilities.textContent = "Habilidades:";
			divModal.appendChild(modalAbilities);

			for(let i = 0;i < pokemon.abilities.length;i++) {
				abilities[i] = document.createElement("span");
				abilities[i].classList.add("modalAbility");
				abilities[i].textContent = pokemon.abilities[i].ability.name;
				divModal.appendChild(abilities[i]);
			}
		});
	});
});
