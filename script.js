var editor;
var stdin;
var stdout;
var running_ajax;
var precompile_ajax;

var languages = {
	'C++11': {
		mode: 'ace/mode/c_cpp',
		identifier: "cpp11"
	},
	'C++': {
		mode: 'ace/mode/c_cpp',
		identifier: "cpp"
	},
	'C': {
		mode: 'ace/mode/c_cpp',
		identifier: "c"
	},
	'Ruby': {
		mode: 'ace/mode/ruby',
		identifier: "ruby"
	},
	'Python': {
		mode: 'ace/mode/python',
		identifier: "python"
	},
	'PHP': {
		mode: 'ace/mode/php',
		identifier: "php"
	},
	'JavaScript': {
		mode: 'ace/mode/javascript',
		identifier: "js"
	},
	'Bash': {
		mode: 'ace/mode/bash',
		identifier: "bash"
	}
};

function syntax_check(str){
	// count pair of characters
	var diff_brackets = 0;
	var diff_parentheses = 0;
	var diff_braces = 0;
	for(var s in str){
		var c = str[s];
		switch(c){
			case "(":
				diff_parentheses++;
				break;
			case ")":
				if(diff_parentheses <= 0){
					return false;
				}
				diff_parentheses--;
				break;
			case "[":
				diff_brackets++;
				break;
			case "]":
				if(diff_brackets <= 0){
					return false;
				}
				diff_brackets--;
				break;
			case "{":
				diff_braces++;
				break;
			case "}":
				if(diff_braces <= 0){
					return false;
				}
				diff_braces--;
				break;
		}
	}
	if(diff_brackets || diff_parentheses || diff_braces){
		return false;
	}
	return true;
}

window.onload = function(){
	stdin = ace.edit("stdin");
	stdin.setTheme("ace/theme/monokai");
	stdout = ace.edit("stdout");
	stdout.setTheme("ace/theme/monokai");
	editor = ace.edit("editor");
	editor.setValue("#include <bits/stdc++.h>\n\nusing namespace std;\n\nint main(){\n	\n	\n	return 0;\n}");
	editor.setTheme("ace/theme/monokai");
	editor.getSession().setMode("ace/mode/c_cpp");
	editor.getSession().setUseSoftTabs(false);
	editor.navigateLineEnd();
	editor.setShowInvisibles(true);
	editor.setShowPrintMargin(false);
	editor.setOptions({
		fontFamily:'Menlo,Monaco,Consolas',
		fontSize: "20px",
		enableBasicAutocompletion: false,
		enableSnippets: true,
		enableLiveAutocompletion: true
	});
	editor.$blockScrolling = Infinity;
	editor.navigateTo(5,1);
	function run(is_precompile){
		if(is_precompile === undefined) is_precompile = false;
		if(running_ajax !== undefined) running_ajax.abort();
		if(!is_precompile) $("#run").addClass("running");
		var lang = $("#language-select option:selected").val();
		var code = editor.getValue();
		if(!syntax_check(code)){
			alert('Syntax Error');
			if(!is_precompile) $("#run").removeClass("running");
			return;
		}
		console.log(stdin.getValue());
		running_ajax = $.ajax({
			type: "POST",
			url: "//compiler.ugwis.net/api/run",
			data: "language=" + languages[lang].identifier + "&source_code=" + encodeURIComponent(code) + "&input=" + encodeURIComponent(stdin.getValue()) + "&precompile=" + is_precompile,
			success: function(data){
				if(!is_precompile) $("#run").removeClass("running");
				$("#modify-tag").addClass("hidden");
				if(data.stderr){
					alert(data.stderr);
					return;
				}
				if(!is_precompile) stdout.setValue(data.stdout);
				running_ajax = undefined;
				$("#build-tag").removeClass("hidden");
				$("#modify-tag").addClass("hidden");
			}
		});

	}
	editor.commands.addCommand({
		name: 'Run',
		bindKey: {win: 'Ctrl-R', mac: 'Command-R'},
		exec: function(edtior){
			run(false);
		}
	});
	var precompile_timer;
	editor.on('change', function(){
		$("#build-tag").addClass("hidden");
		$("#modify-tag").removeClass("hidden");
		function pre_compile (){
			var code = editor.getValue();
			console.log("Syntax check:", syntax_check(code));
			if(syntax_check(code)){
				run(true);
			}
		}
		if(precompile_timer) clearTimeout(precompile_timer);
		precompile_timer = setTimeout(pre_compile, 5000);
	});

	for(var i in languages){
		$("select").append($("<option>").text(i));
	}

	$("#language-select").change(function(){
		var lang = $("#language-select option:selected").val();
		console.log(lang);
		editor.getSession().setMode(languages[lang].mode);
	}).change();

	$("#auto-test").click(function(){
		var url = window.prompt("問題文のURL","");
		if(url){
			var host = url.split("/")[2];
			if(/(\d+).atcoder\.jp/.test(host)){
				console.log(host);
			}
		}
	});

	$("#run").click(function(){
		if($("#run").hasClass("running")){
			running_ajax.abort();
			$("#run").removeClass("running");
		} else {
			run(false);
		}
	});

	$("#modify-tag").addClass("hidden");
	$("#build-tag").addClass("hidden");
};
