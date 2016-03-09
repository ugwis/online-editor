var editor;

window.onload = function(){
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
	editor.commands.addCommand({
		name: 'Find',
		bindKey: {win: 'Ctrl-F',  mac: 'Command-F'},
		exec: function(editor) {
			$("footer").slideDown(function(){
				//var isVisibleSearchBar = $("footer").css("display") == "block";
				$("footer").css("display") == "block";
				$("#searchtext").focus();
				$("#searchtext").keydown(function(e){
					if(e.keyCode == 27){
						$("footer").slideUp(function(){
							$("footer").css("display") == "none";
							editor.focus();
						});
					}
				});
			});

/*			var search_text = $("#searchtext").val();
			editor.find(search_text);*/
		},
		readOnly: true // false if this command should not apply in readOnly mode
	});
}

