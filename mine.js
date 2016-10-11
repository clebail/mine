var nbX = 30;
var nbY = 30;
var mines;
var nbDecouvre;
var tId;
var time;
var firstClick;

$(function() {

$.fn.initTable = function() {
  var x,y;
  var html = "";

  firstClick = true;

  html += "<tbody class='indique'>";
  html += "<tr>";
  html += "<td colspan='"+(nbX/2)+"'>";
  html += "mines : <span class='nbMine'>00</span>"
  html += "</td>";
  html += "<td colspan='"+(nbX/2)+"'>";
  html += "temps : <span class='temps'>00:00:00</span>"
  html += "</td>";
  html += "</tr>";
  html += "</tbody>";
  html += "<tbody class='game'>";

  for(y=0;y<nbY;y++) {
    html += "<tr>";
    for(x=0;x<nbX;x++) {
      var idx = y*nbX+x;
      html += "<td data-idx='"+idx+"'></td>";
    }

    html += "</tr>";
  }

  html += "</tbody>";

  $(this).html(html);
  $(this).addClass("mine");
}

$(document).on("click", ".mine .game td", function() {
  var elt = $(this);
  var idx = parseInt(elt.attr("data-idx"));

  if(firstClick) {
    initGame(idx);
  }

  if(mines[idx]["mine"]) {
    elt.addClass("known");
    elt.addClass("go");
    elt.removeClass("decouvre");
    clearTimeout(tId);
    $(document).off("click", "td");
    $(document).off("contextmenu", "td");
    alert("Perdu !");
  }else {
    showCase(idx);
    if(win()) {
      clearTimeout(tId);
      $(document).off("click", "td");
      $(document).off("contextmenu", "td");
      alert("Gangné !")
    }
  }

  firstClick = false;
});

$(document).on("contextmenu", ".mine .game td", function(e) {
  e.preventDefault();
  var elt = $(this);
  var idx = parseInt(elt.attr("data-idx"));

  if(firstClick) {
    initGame(idx);
  }

  if(!elt.hasClass("known")) {
    if(elt.hasClass("decouvre")) {
      elt.removeClass("decouvre");
      nbDecouvre++;
    }else {
      elt.addClass("decouvre");
      nbDecouvre--;
    }

    $(".mine .indique span.nbMine").html(padLeft(nbDecouvre));
  }

  firstClick = false;
});

function incNb(idx) {
  if(typeof(mines[idx]) != "undefined") {
    if(!mines[idx]["mine"]) {
      mines[idx]["nb"]++;
    }else {
      mines[idx]["nb"] = 0;
    }
  }else {
    mines[idx] = {nb: 1, mine: false};
  }
}

function showCase(idx) {
  var elt = $(".mine .game td[data-idx='"+idx+"']");

  if(!elt.hasClass("known")) {
    elt.addClass("known");
    elt.removeClass("decouvre");
    elt.attr("data-nb", mines[idx]["nb"]);
    elt.html(mines[idx]["nb"]);

    if(mines[idx]["nb"] == 0) {
      var y = parseInt(idx / nbX, 10);
      var x = idx % nbX;
      var y0 = y > 0;
      var y9 = y < nbY-1;
      var x0 = x > 0;
      var x9 = x < nbX-1;

      if(y0) {
        showCase(idx-nbX);
        if(x0) showCase(idx-nbX-1);
        if(x9) showCase(idx-nbX+1);
      }
      if(y9) {
        showCase(idx+nbX);
        if(x0) showCase(idx+nbX-1);
        if(x9) showCase(idx+nbX+1);
      }
      if(x0) showCase(idx-1);
      if(x9) showCase(idx+1);
    }
  }
}

function win() {
  var result = true;

  $(".mine .game td:not(.known)").each(function(key, value) {
    var idx = $(value).attr("data-idx");
    if(!mines[idx]["mine"]) {
      result = false;
      return;
    }
  });

  return result;
}

function padLeft(str) {
  if((""+str).length < 2) {
    str = "0" + str;
  }

  return str;
}

function timeOut() {
  time++;

  var h = parseInt(time / 3600, 10);
  var m = parseInt(time / 60, 10);
  var s = time % 60;
  var display = padLeft(h)+":"+padLeft(m)+":"+padLeft(s);

  $(".mine .indique span.temps").html(display);
  tId = setTimeout(function () { timeOut(); }, 1000);
}

function initGame(clickIdx) {
  var x, y;

  mines = [];
  nbDecouvre = 0;

  for(y=0;y<nbY;y++) {
    for(x=0;x<nbX;x++) {
      var idx = y*nbX+x;
      var hasMine = (idx != clickIdx ? Math.random() < 0.1 : false);
      var y0 = y > 0;
      var y9 = y < nbY-1;
      var x0 = x > 0;
      var x9 = x < nbX-1;

      if(typeof(mines[idx]) == "undefined") {
        mines[idx] = {nb: 0, mine: hasMine};
      }

      if(hasMine) {
        nbDecouvre++;
        mines[idx] = {nb: 0, mine: true};

        if(y0) {
          incNb(idx-nbX);
          if(x0) incNb(idx-nbX-1);
          if(x9) incNb(idx-nbX+1);
        }
        if(y9) {
          incNb(idx+nbX);;
          if(x0) incNb(idx+nbX-1);
          if(x9) incNb(idx+nbX+1);
        }
        if(x0) incNb(idx-1);
        if(x9) incNb(idx+1);
      }
    }
  }

  $(".mine .indique span.nbMine").html(padLeft(nbDecouvre));

  time = 0;
  tId = setTimeout(function () { timeOut(); }, 1000);
}
});
