//====================================================================================
//						Variaveis do simplex
//====================================================================================

var matriz = []; 	//Matriz das restrições
var sinais = [];	//Vetor dos sinais das restrições
var b = []; 		//Vetor b
var ba = []; 		//Vetor b/a
var custo = []; 	//Vetor dos custos da função objetivo
var cr = []; 		//Vetor do custo reduzido
var menorPositivo; 	//Valor do menor b/a positivo
var maisNegativo;	//Valor do cr mais negativo
var tipo;			//0) minimiza 1) maximiza
var i;				// Auxiliar para linha
var j;				// Auxiliar para coluna
var m;				//Numero de restricoes
var n;				//Numero de variaveis
var basicas = [];	//Vetor que indica as variáveis que estão na base
var artificial = [];		//Vetor artificiais
var sobra = [];		//Vetor das variáveis de excesso
var infinito = 999999999999;
var indice;
var pivoi, pivoj, pivo;
var tabela;
//====================================================================================
//						
//====================================================================================


$(document).ready(function(){
	var restricoes, variaveis, inserir;

	//========================================================================Botão Criar Grade===============================================
	$("#botaograde").click(function(){
		restricoes = $("#r").val();
		variaveis = $("#v").val();
		tipo = $("#tipo").val();

		if(restricoes>9 | variaveis>9){
			alert("Digite valores abaixo de 9 nesses campos");
			if(variaveis>9)$("#v").focus();
			if(restricoes>9)$("#r").focus();
			return false;
		}
		if(!isNumber(restricoes) || !isNumber(variaveis)){
			alert("Digite numeros!");
			if(restricoes>9)$("#r").focus();
			return false;
		}

		$("#tabela").empty();
		if(tipo==10) $("#tabela").append("<p>Maximizar</p><hr>");
		if(tipo==0)  $("#tabela").append("<p>Minimizar</p><hr>");
		//Desenhando Z
		$("#tabela").append("Z = ");
		for(i=1; i<=variaveis; i++){
			inserir ='<input type="text" value="0" id ="z' + i + '" class="valoresx"> *x' + i + ' + ';
			if(i==variaveis) inserir = '<input type="text" value="0" id="z'+ i + '" class="valoresx"> *x' + i + '';
			$("#tabela").append(inserir);
		}
		$("#tabela").append('<br><hr><br>s.a');
		

		//Desenhando tabela
		for(i=1; i<=restricoes; i++){
			$("#tabela").append('<br><br>');
			for(j=1; j<=variaveis; j++){
				inserir='<input type="text" value="0" class="valoresx" id="x'+ i + ''+ j + '"> *x[' + j + ']  ';
				$("#tabela").append(inserir);
			}
			$("#tabela").append('<select class="valoresx" id= s'+ i + '> <option value="<="><=</option><option value="=">=</option><option value=">=">>=</option></select>  ');
			$("#tabela").append('<input type="text" value="0" class="valoresx" id="b'+ i + '">');
		}

		$("#tabela").append('<br><br><hr>');
		$("#tabela").append('<input class ="btnbaixo" type="button" id="botaocalcula" name="calcula" value="Calcular"> ');
		$("#tabela").append('<input class ="btnbaixo" type="button" id="botaolimpa" name="limpa" value="Limpar"> ');

	});


	//=======================================================================Botão Limpar==========================================================

	$(document).on('click','#botaolimpa',function(){

		$("#botaograde").trigger('click');
		$("#resultados").empty();

	});

	//======================================================================Botão ir===========================================================
	$(document).on('click','#botaocalcula',function(){
		chamada();
	});

}); 


function isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

//==============================================================================================================================================
//==============================================================================================================================================
//========================================================			MÉTODOS			============================================================
//==============================================================================================================================================
//==============================================================================================================================================


//==============================================================================================================================================
//																Função simplex simples
//==============================================================================================================================================

function simplex(){
	//Le numero restricoes e variaveis
	m = $("#r").val();
	n = $("#v").val();
	basicas[0] = 0;
	artificial[0] = 0;
	sobra[0] = 0;
	tipo = $('#tipo').val();
	// Le matriz
	for(i=1; i<=m; i++){
		matriz[i] = [];
		for(j=1; j<=n; j++){
			matriz[i][j] = $('#x' + i + '' + j).val();
		}
	}

	//Le b e sinais

	for(i=1; i<=m; i++){
		b[i] = $('#b'+i).val();
		sinais[i] = $('#s' + i).val(); 
	}

	//Le custo função objetivo

	for(j=1; j<=n; j++){
		custo[j] = $('#z' + j).val();
	}

	//Colocando em forma padrão

	//Se for maximizar
	if(tipo==10){
		for(j=1; j<=n; j++){
			custo[j] *=-1;
		}
	}

	//Verificando b negativo
	for(i=1; i<=m; i++){
		if(b[i]<0){
			b[i]*=-1;
			for(j=1; j<=n; j++){
				matriz[i][j]*=-1;
			}
			if(sinais[i] == "<=") sinais[i] = ">=";
			else if(sinais[i] == ">=") sinais[i] = "<=";
		}
	}

	//adicionando variáveis extras

	for(i=1; i<=m; i++){
		//SINAL <=
		if(sinais[i] == "<="){
			sobra[sobra.length] = (++n);
			custo[n] = 0;
			for(j=1; j<i; j++){
				matriz[j][n] = 0;
			}
			matriz[i][n] = 1;
			for(j=i+1; j<=m; j++){
				matriz[j][n] = 0;
			}
		}
		basicas[basicas.length] = n;

		//SINAL =

		if(sinais[i]=="="){
			artificial[artificial.length] = (++n);
			custo[n] = infinito;
			for(j=1; j<i; j++){
				matriz[j][n] = 0;
			}
			matriz[i][n] = 1;
			for(j=i+1; j<=m; j++){
				matriz[j][n] = 0;
			}
			basicas[basicas.length] = n;
		}

		//SINAL >=
		if(sinais[i] == ">="){
			custo[custo.length] = 0;
			custo[custo.length] = infinito;
			sobra[sobra.length] = (++n);
			artificial[artificial.length] = (++n);
			for(j=1; j<i; j++){
				matriz[j][n]= 0;
				matriz[j][n-1] = 0;
			}
			matriz[i][n] = 1;
			matriz[i][n-1] =-1;

			for(j=i+1; j<=m; j++){
				matriz[j][n] = 0;
				matriz[j][n-1] = 0;
			}
			basicas[basicas.length] = n;
		}

	}


	//Resolvendo
	do{
		//calculo do cr
		for(j=1; j<=n; j++){
			var soma = custo[j];
			for(i=1; i<=m; i++){
				soma -= custo[basicas[i]] * matriz[i][j];
			}
			cr[j] = soma;
		}

		//calculo do mais negativo
		maisNegativo = infinito;
		indice = 0
		for(j=1; j<=n; j++){
			if(cr[j]<maisNegativo && cr[j]<0){
			 	maisNegativo = cr[j];
				indice = j;
			}
		}
		if(!indice){
			//alert("B");
			//verificaCond();
			return 1;
		}

		//calcular b/a
		
		for(i=1; i<=m; i++){
			ba[i] = b[i]/ matriz[i][indice];
		}

		//achar menor positivo
		
		menorPositivo = infinito;
		pivoi = 0;
		for(i=1; i<=m; i++){
			if(ba[i]>=0 && ba[i]<menorPositivo){
				menorPositivo = ba[i];
				pivoi = i;
			}
		}
		pivoj = indice;

		if(!pivoi){
			//alert("A");
			return 1;
		}
		
		mostraTabela();

		//pivotamento
		pivo = matriz[pivoi][pivoj]
		for(j=1; j<=n; j++){
			matriz[pivoi][j] /= pivo;
		}
		b[pivoi] /= pivo;

		for(i=1; i<=m; i++){
			pivo = matriz[i][pivoj];
			for(j=1; j<=n && i!=pivoi; j++){
				matriz[i][j] -= matriz[pivoi][j] * pivo;
				console.log("matriz["+i+"]["+j+"] = "+matriz[i][j]);
			}
			if(i!=pivoi) b[i] -= b[pivoi] * pivo;
		}

		basicas[pivoi] = pivoj;



	}while(true);



	// console.log("custo");
	// console.log(custo);
	// console.log("basicas");
	// console.log(basicas);
	// console.log("matriz");
	// console.log(matriz);
	// console.log("cr");
	// console.log(cr);
	// console.log("artificial");
	// console.log(artificial);
	// console.log("sobra");
	// console.log(sobra);


}

	function logResultado(){
		//Mostrando resultado
		console.log("Resultado: ")
		for(i=1; i<=basicas.length; i++){
			console.log(b[basicas[i]]);
		}
		mostraTabela();
	}
	

	function mostraTabela(){
		tabela = "<table>"
		tabela +="<tr>"
		tabela +="<td>variaveis</td>";
		//Nome das variaveis
		for(j=1; j<=n; j++){
			tabela += "<td> x" + j + "</td>"; 
		}
		tabela +="</tr><tr>";

		//Custo das variáveis
		tabela +="<td>base/custo</td>";
		for(j=1; j<=n; j++){
			tabela+= "<td>" + custo[j] + "</td>";
		}
		tabela+="<td>b</td><td>b/a</td>";
		tabela +="</tr>";

		//Matriz A
		for(i=1; i<=m; i++){
			tabela+="<tr>";
			tabela+="<td> x" + basicas[i] + "</td>"; 
			for(j=1; j<=n; j++){
				tabela += "<td>" + matriz[i][j] + "</td>"; 
			}
			tabela+="<td>"+b[i]+"</td>";
			tabela+="<td>"+ba[i]+"</td>";
			tabela+="</tr>";
		}
		tabela+="<tr>";
		tabela+="<td>cr</td>";
		for(j=1; j<=n; j++){
			tabela+="<td>" + cr[j] + "</td>";
		}
		tabela+="</tr>";
		tabela += "</table>"

		$("#resultados").css("background-color", "light-blue");
		$("#resultados").append(tabela);
		$("#resultados"). append("<br><br><br>")
	}


//==============================================================================================================================================
//																Função simplex 2 fases
//==============================================================================================================================================


//==============================================================================================================================================
//																Função Chamada
//==============================================================================================================================================


function chamada(){
	simplex();
	$("#resultados").append("<br><br><h1 align='left'>Resultado</h1>");
	logResultado();
}
