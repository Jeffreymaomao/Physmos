
const fs = require("fs");
const historyPath = "app/save"

function showAllFile(){
	fs.readdir(historyPath, function (err, files) {
    	if (err) {
	        return console.log('Unable to scan directory: ' + err);
	    }
	    console.log("--- List of All file ---")
	    files.forEach(function (file) {
	        console.log(file);
	    });
	});
	return true;
}

function deleteAllfile(){
	fs.readdir(historyPath, function (err, files) {
    	if (err) {
	        return console.log('Unable to scan directory: ' + err);
	    }
	    files.forEach(function (file) {
	    	if(file[0]!=="." && !(file.includes("history"))) {
		        fs.unlink(historyPath+"/"+file, (err) => {
					if (err){throw err.message};
					console.log(`successfully deleted ${file}`);
				});
		    }
	    });
	});
	return true;
}

function historyClear(){
	fs.writeFileSync(historyPath+"/history.json", "{}")
}

deleteAllfile()
historyClear()
showAllFile()