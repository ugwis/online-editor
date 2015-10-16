window.onload = function(){
	var editor = ace.edit("editor");
	editor.setValue("the new text here");
    editor.setTheme("ace/theme/chaos");
    editor.getSession().setMode("ace/mode/c_cpp");
    editor.getSession().setUseSoftTabs(false);
	editor.navigateLineEnd();
	editor.setShowInvisibles(true);
	editor.setShowPrintMargin(false);
	editor.setOptions({
		fontFamily:'Menlo,Monaco,Consolas',
		fontSize: "20px"
	});
}

editor.commands.addCommand({
    name: 'Find',
    bindKey: {win: 'Ctrl-F',  mac: 'Command-F'},
    exec: function(editor) {
        //...
    },
    readOnly: true // false if this command should not apply in readOnly mode
});