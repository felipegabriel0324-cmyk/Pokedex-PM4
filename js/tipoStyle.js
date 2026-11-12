const botoes = document.querySelectorAll('.tipo');
const container = document.querySelector('.filtro'); //esse codigo é a logica de rolamento da barra de tipos
let isDown = false;
let startX;
let scrollLeft;
let isDragging = false;
botoes.forEach(botao => {
	botao.addEventListener('click',function(e) { //cada botao(tipo) recebe um addeventlistener
		if(isDragging) {
			e.preventDefault(); //impede o navegador de usar a acao padrao dele pra esse evento
			e.stopPropagation(); //impede a propagacao do clique para outros eventos DOM, ou seja se o usuario estiver
			return;			//arrastando, vai impedir a acao padrao e a propagacao do clique
		}				//isso é para definir oque fazer quando o usuario ta arrastando, impdir clic acidntal
		botoes.forEach(b => b.classList.remove('ativo')); //esse roda caso o usuario nao estiver arrastando, remove ativo
		this.classList.add('ativo'); //de todos os botoes e adiciona ativo para o botao que esta sendo pressionado
	});
});
container.addEventListener('mousedown', (e) => { //faz parte da logica de arrasto do usuario e do clique dele
	isDown = true; //avisa o codigo que o usuario clicou
	isDragging = false; //nao significa que ele ta arrastando ainda
	startX = e.pageX - container.offsetLeft; //calculo da posicao horizontal do mouse em relacao ao container
	scrollLeft = container.scrollLeft; //guarda a posicao atual da rolagem horizontal para por exemplo: ela nao voltar para o
});						//comeco sempre que o usuario for clicar e para o calculo do arrasto depois
window.addEventListener('mousemove', (e) => { //logica de arrasto principal do codigo
	if(!isDown) return; //se o usuario nao estiver clicando retorna
	e.preventDefault(); //impede comportamento padrao do navegador durante a movimentacao
	const x = e.pageX - container.offsetLeft; //calcula denovo a posicao horizontal do mouse em relacao ao container
	const walk = (x - startX) *1; //calculo de quanto a barra é arrastada, tambem controla a velocidade
	if(Math.abs(walk) > 5) { //math.abs retorna o valor absoluto, ele remove o sinal negativo
		isDragging = true; //porque? porque eu quero detectar os movimentos independente da direcao
	}
	container.scrollLeft = scrollLeft - walk; //finalmente o movimento da barra scrollLeft é a propriedade que representa a pos
});						//de rolagem horizontal de um elemento
window.addEventListener('mouseup', () => { //aqui acho que serve para resolver um bug?
	isDown = false;				//me lembrei, detecta se o usuario soltou o botao do mouse se sim isDown = false
	setTimeout(() => {
		isDragging = false;		//mantem isDragging por 50ms
	}, 50);					//resolve um problema no qual o usuario arrasta mas o codigo interpreta como um clic
});						//uma solucao baseada no tempo
