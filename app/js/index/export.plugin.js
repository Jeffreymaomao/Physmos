function exportLatex(){
	const expressions = calculator.getExpressions();

	console.log(expressions)

	var Exps = "\\documentclass{article}\n\\usepackage{amsmath}\\usepackage{amssymb}\\usepackage{physics}\n\n\\begin{document}\n"
	var cocunt = 1;
	for(const expression of expressions){
		const latex = expression.latex;
		const id = expression.id;
		if(latex!=''){
			Exps += `%---- line : ${cocunt} ----`
			Exps += `\n\\begin{equation}\n${latex}\n\\end{equation}\n`
		}
		cocunt += 1;
	}
	Exps += "\\end{document}";
	window.electron.writeFile(window.electron.homePath+"/Downloads/LaTeX.tex", Exps, (err)=>{
		if(err) throw err;
		console.log("download LaTeX")
	})
}