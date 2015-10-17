var userGuid = "";
var apiKey = "";
var dataSourceURL="";
var maxCharCountperCell = 32750;
var timegap=100;
var csvfilename="export.csv";
var urlfilename="URLs.txt";

$(document).ready( function(){
    $("#charpercell").val(maxCharCountperCell);
    $("#timegap").val(timegap);
    $("#csvfilename").val(csvfilename.split(".")[0]);
    $("#urlfilename").val(urlfilename.split(".")[0]);
    $("#dataSource").val(dataSourceURL);
    $("#stopscript").hide();
    $('.export').hide();
});

$("#charpercell").on("change", function(){
  maxCharCountperCell = $("#charpercell").val();
  window.console.log("MaxCountPerCell = ", maxCharCountperCell);
});

$("#timegap").on("change", function(){
  timegap = $("#timegap").val();
  window.console.log("Timegap = ", timegap);
});

$("#csvfilename").on("change", function(){
  csvfilename = $("#csvfilename").val() + ".csv";
  window.console.log("CSV Filename = ", csvfilename);
});

$("#urlfilename").on("change", function(){
  urlfilename = $("#urlfilename").val() + ".txt";
  window.console.log("URLs Filename = ", urlfilename);
});
