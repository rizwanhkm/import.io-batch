var userGuid = "";
var apiKey = "";
var maxCharCountperCell = 32750;
var timegap=100;

$(document).ready( function(){
    $("#charpercell").val(maxCharCountperCell);
    $("#timegap").val(timegap);

});

$("#charpercell").on("change", function(){
  maxCharCountperCell = $("#charpercell").val();
  window.console.log("MaxCountPerCell = ", maxCharCountperCell);
});

$("#timegap").on("change", function(){
  timegap = $("#timegap").val();
  window.console.log("Timegap = ", timegap);

});
