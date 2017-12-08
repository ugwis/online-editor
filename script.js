var editor;
var stdin;
var stdout;
var xhr;
var prog;

var url = "//compiler.ugwis.net";
var debugUrl = "http://localhost:3000";

var languages = {
	'C++11': {
		mode: 'ace/mode/c_cpp',
		identifier: "cpp11",
		code: "#include <bits/stdc++.h>\n\nusing namespace std;\n\nint main(){\n\t//cout << \"Hello,World\" << endl;\n\t\n\treturn 0;\n}",
	},
	'C++': {
		mode: 'ace/mode/c_cpp',
		identifier: "cpp",
		code: "#include <bits/stdc++.h>\n\nusing namespace std;\n\nint main(){\n\t//cout << \"Hello,World\" << endl;\n\t\n\treturn 0;\n}",
	},
	'C': {
		mode: 'ace/mode/c_cpp',
		identifier: "c",
		code: "#include <stdio.h>\n\nint main(){\n\t//printf(\"Hello,world\\n\");\n\t\n\treturn 0;\n}",
	},
	/*'Ruby': {
		mode: 'ace/mode/ruby',
		identifier: "ruby",
		code:"",
	},*/
	'Python': {
		mode: 'ace/mode/python',
		identifier: "python",
		code: "print(\"Hello,World\")",
	},
	'PHP': {
		mode: 'ace/mode/php',
		identifier: "php",
		code: "<?php\nprint(\"Hello,World\");\n?>",
	},
	/*'JavaScript': {
		mode: 'ace/mode/javascript',
		identifier: "js",
		code: "",
	},*/
	'Bash': {
		mode: 'ace/mode/bash',
		identifier: "bash",
		code: "echo Hello,World",
	}
};

function remove_control_character(str){
	var ret = "";
	for (var i=0; i<str.length; i++) {
		var chr = str.charCodeAt(i);
		if (chr >= 0x20 || chr == 0x0d || chr == 0x0a) {
			ret += String.fromCharCode(chr);
		}
	}
	return ret;
}

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

function progress(){
	if(xhr === undefined){
		prog = undefined;
		return;
	}
	if(parseInt(document.getElementById("progressbar").style.width) >= 90){
		prog = undefined;
		return;
	}
	document.getElementById("progressbar").style.width = String(parseInt(document.getElementById("progressbar").style.width) + 10) + "%";
	prog = setTimeout(progress, 1000);
}

function build(lang, code, callback){
	if(xhr) return;
	if(callback === undefined) callback = function(){};
	document.getElementById("warning-tag").classList.add('hidden');
	document.getElementById("run").classList.add('running');
	document.getElementById("progressbar").style.width = "0%";
	document.getElementById("progressbar").style.opacity = "1.0";
	xhr = new XMLHttpRequest();
	if(prog === undefined) prog = setTimeout(progress(),0);
	xhr.open("POST", url + "/build", true);
	xhr.setRequestHeader( 'Content-Type', 'application/x-www-form-urlencoded' );
	xhr.onreadystatechange = function(e) {
		console.log(xhr.readyState);
		if (xhr.readyState === 4) {
			document.getElementById("run").classList.remove('running');
			document.getElementById("modify-tag").classList.add('hidden');
			if (xhr.status >= 200 && xhr.status < 300) {
				stdout.setValue(remove_control_character(xhr.responseText));
				document.getElementById("build-tag").classList.remove('hidden');
				document.getElementById("progressbar").style.width = "50%";
				document.getElementById("progressbar").style.opacity = "0.0";
				xhr = undefined;
				callback(lang, code);
			} else if(xhr.status == 0) {
				document.getElementById("warning-tag").classList.remove('hidden');
				document.getElementById("warning-tag").innerText = "Server response not received.";
				document.getElementById("progressbar").style.opacity = "0.0";
				xhr = undefined;
			} else {
				document.getElementById("warning-tag").classList.remove('hidden');
				document.getElementById("warning-tag").innerText = xhr.responseText;
				xhr = undefined;
			}
		}
	};
	xhr.send(JSON.stringify({language: lang, code: code}));
}

function run(lang, code, callback){
	if(xhr) return;
	if(callback === undefined) callback = function(){};
	document.getElementById("warning-tag").classList.add('hidden');
	document.getElementById("run").classList.add("running");
	document.getElementById("progressbar").style.opacity = "1.0";
	xhr = new XMLHttpRequest();
	if(prog === undefined) prog = setTimeout(progress(),0);
	xhr.open("POST", url + "/run", true);
	xhr.onprogress = function () {
		console.log("PROGRESS:", xhr.responseText);
		stdout.setValue(remove_control_character(xhr.responseText));
	};
	xhr.setRequestHeader( 'Content-Type', 'application/x-www-form-urlencoded' );
	xhr.onreadystatechange = function(e) {
		console.log(xhr.readyState);
		if (xhr.readyState === 4) {
			document.getElementById("run").classList.remove('running');
			if (xhr.status >= 200 && xhr.status < 300) {
				stdout.setValue(remove_control_character(xhr.responseText));
				document.getElementById("progressbar").style.width = "100%";
				document.getElementById("progressbar").style.opacity = "0.0";
				xhr = undefined;
				callback(lang, code, callback);
			} else if(xhr.status == 0) {
				document.getElementById("warning-tag").classList.remove('hidden');
				document.getElementById("warning-tag").innerText = "Server response not received.";
				document.getElementById("progressbar").style.opacity = "0.0";
				xhr = undefined;
			} else {
				document.getElementById("warning-tag").classList.remove('hidden');
				document.getElementById("warning-tag").innerText = xhr.responseText;
				xhr = undefined;
			}
		}
	};
	xhr.send(JSON.stringify({language: lang, code: code, stdin: stdin.getValue()}));
}


window.onload = function(){
	if(location.hostname !== "editor.ugwis.net"){
		url = debugUrl;
	}
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
	var func_run = function(callback){
		var lang = document.getElementById("language-select").options[document.getElementById("language-select").selectedIndex].innerText;
		build(
			languages[lang].identifier,	
			editor.getValue(),
			callback
		);
	};
	editor.commands.addCommand({
		name: 'Run',
		bindKey: {win: 'Ctrl-R', mac: 'Command-R'},
		exec: function(edtior){
			func_run(run);
		}
	});
	var precompile_timer;
	editor.on('change', function(){
		document.getElementById("build-tag").classList.add('hidden');
		document.getElementById("modify-tag").classList.remove('hidden');
		function pre_compile (){
			var code = editor.getValue();
			console.log("Syntax check:", syntax_check(code));
			/*if(syntax_check(code)){
				func_run();
			}*/
		}
		if(precompile_timer) clearTimeout(precompile_timer);
		precompile_timer = setTimeout(pre_compile, 5000);
	});

	for(var i in languages){
		var option = document.createElement("option");
		option.text = i;
		option.value = i;
		document.getElementsByTagName("select")[0].appendChild(option);
	}

	document.getElementById("language-select").onchange = function(event){
		var lang = document.getElementById("language-select").options[document.getElementById("language-select").selectedIndex].innerText;
		console.log(lang);
		editor.getSession().setMode(languages[lang].mode);
		editor.setValue(languages[lang].code);
	};

	/*document.getElementById("auto-test").onclick = function(event){
		var url = window.prompt("問題文のURL","");
		if(url){
			var host = url.split("/")[2];
			if(/(\d+).atcoder\.jp/.test(host)){
				console.log(host);
			}
		}
	};*/

	document.getElementById("run").onclick = function(event){
		if(document.getElementById("run").classList.contains("running")) {
			document.getElementById("run").classList.remove("running");
		} else {
			func_run(run);
		}
	};

	document.getElementById("modify-tag").classList.add("hidden");
	document.getElementById("build-tag").classList.add("hidden");
	document.getElementById("warning-tag").classList.add("hidden");
};
