var sourceGuid;
var urls = [];
var columns = [];
var urlcounter = 0;
var urlrequestcounter = 0;
var refreshIntervalId
var returnedurls = [];



importio.init({
    "auth": {
        "userGuid": userGuid,
        "apiKey": apiKey,
    },
    "host": "import.io"
});

function importioGetSourceGuidFromUrl(sourceUrl) {
    if (sourceUrl == "") {
        $("#result").append("Data source missing.  You didn't enter a value for the Data Source.  Choose a data source from your 'My Data' page and copy/paste the URL.");
    } else if (sourceUrl.indexOf("https://import.io/data/mine/?") > -1) {
        var sourceGuid = sourceUrl.slice(sourceUrl.indexOf("id=") + 3, sourceUrl.indexOf("id=") + 3 + 36);
    } else {
        var sourceGuid = sourceUrl;
    }
    if (sourceGuid.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i) != null) {
        return sourceGuid;
    } else {
        $("#result").append("Cannot read Data Source.  This does not appear to be either a valid Data Source URL or a Data Source GUID.  Check your Data Source and try again.  You entered: " + sourceUrl);
        return;
    }
}

document.getElementById('file').onchange = function () {
    var file = this.files[0];
    var reader = new FileReader();
    reader.onload = function (progressEvent) {
        urls = this.result.split('\n');
        $("#urllist").html("No. of URLs :" + urls.length + "<br>");
        for (var line = 0; line < urls.length; line++) {
            $("#urllist").append((line + 1) + ":" + urls[line] + "<br>");
        }
    };
    reader.readAsText(file);
};

var doneCallback = function (data) {
    //        console.log("Done, all data:");
}

function queryurlnumber(number) {
    importio.query({
        "connectorGuids": [sourceGuid],
        "input": {
            "webpage/url": urls[number]
        }
    }, {
        "data": (function (number) {
            var callback = function (data) {
                if (returnedurls[number] === undefined) {
                    urlcounter++;
                    var i, column;
                    returnedurls[number] = data[0].data;
                    for (i = 0; i < columns.length; i++) {
                        column = columns[i];
                        returnedurls[i][column]+="";
                        returnedurls[number][column] = returnedurls[number][column].replace(/,/g, "");
                        returnedurls[number][column] = returnedurls[number][column].replace(/;/g, "");
                        returnedurls[number][column] = returnedurls[number][column].replace(/"/g, "");
                        returnedurls[number][column] = returnedurls[number][column].replace(/(\r\n|\n|\r)/gm,"");
                    }
                    console.log("revieved:" + number + ":Recieved" + urlcounter + " URLS");
                }
            }
            return callback;
        }(number)),
        "done": doneCallback,
        timeout: 3000
    });

}

function getColumns() {
    var dataSourceURL = $("#dataSource").val(),
        sampleURL = $("#sampleURL").val();
    sourceGuid = importioGetSourceGuidFromUrl(dataSourceURL);

    importio.query({
        "connectorGuids": [sourceGuid],
        "input": {
            "webpage/url": sampleURL
        }
    }, {
        "data": function (data) {
            columns = Object.keys(data[0].data);
            console.log(columns);
            $("#result").html("Column Data Recieved");
            var row = "<tr><td>URL</td>",
                i = 0;
            for (i = 0; i < columns.length; i++) {
                row += "<td>" + columns[i] + "</td>";
            }
            row += "</tr>";
            $("#resultTable").find("tbody").append(row);
        },
        "done": doneCallback
    });
}

function getResults() {

    var dataSourceURL = $("#dataSource").val(),
        sampleURL = $("#sampleURL").val(),
        i = 0;
    urlcounter = 0;
    returnedurls = [];
    if (columns[1] == null) {
        alert("Click On Get Columns First");
        return;
    }
    setInterval(function () {
        $("#urlcounter").html("Number Of URLs Parsed :" + urlcounter);
    }, 100);
    $('.export').hide();
    fetchdata();
}

function fetchdata() {

    urlrequestcounter = 0;
    var counter = 0;
    refreshInteralvalId = setInterval(function () {
        if (urlrequestcounter < urls.length) {
            if (counter === 2000) {
                clearInterval(refreshInteralvalId);
                fetchdata();
            } else if (returnedurls[urlrequestcounter] === undefined) {
                console.log("requesting url :" + urlrequestcounter);
                queryurlnumber(urlrequestcounter);
                urlrequestcounter++;
                counter++;
            } else {
                while ((returnedurls[urlrequestcounter] != undefined)) {
                    urlrequestcounter++;
                }
            }
        } else {
            clearInterval(refreshInteralvalId);
            if (urlcounter < urls.length) {
                fetchdata();
            } else {
                clearInterval(refreshInteralvalId);
                writeintofile();
            }
        }
    }, 10);

}

function writeintofile() {


    var csvData, csv, i, j, row, column, string;
    csv = "";
    row = '\"URL\",';
    var filename = "export.csv"
    for (i = 0; i < columns.length; i++) {
        row += '\"' + columns[i] + '\",';
    }
    csv += row + '\n';
    i = 0;
    (function createcsv() {
        row = '\"';
        row +=urls[i].replace(/(\r\n|\n|\r)/gm,"");
        row += '\",';
        console.log(row);
        for (j = 0; j < columns.length; j++) {
            column = columns[j];
            if (returnedurls[i][column] === undefined) {
                row += '\" \",';
            } else {
                if (returnedurls[i][column].length > 32750) {
                    row += '\"' + returnedurls[i][column].substring(0, 32750) + '\" ,';
                } else {
                    row += '\"' + returnedurls[i][column] + '\" ,';
                }
            }
        }
        row += '\n';
        console.log(row);
        csv += row;
        $("#result").html("Writing Into CSV File : " + Math.floor(((i + 1) / returnedurls.length) * 100) + "% Completed");
        i++;
        if (i < returnedurls.length) {
            setTimeout(createcsv, 10);
        } else {
            var textFileAsBlob = new Blob([csv], {
                type: 'text/plain'
            });
            $('.export').show();
            var downloadLink = document.getElementById("export");
            console.log(downloadLink);
            downloadLink.download = filename;
            downloadLink.href = window.URL.createObjectURL(textFileAsBlob);


        }
    }());

}
$("#getColumns").on("click", getColumns);
$("#getResults").on("click", getResults);
$('.export').hide();
