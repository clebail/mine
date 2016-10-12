function Mine(table, nbX, nbY) {
  var x,y;
  var html = "";
  var that = this;

  this.nbX = nbX;
  this.nbY = nbY;

  this.firstClick = true;

  html += "<tbody class='indique'>";
  html += "<tr>";
  html += "<td colspan='"+(this.nbX/2)+"'>";
  html += "mines : <span class='nbMine'>00</span>"
  html += "</td>";
  html += "<td colspan='"+(this.nbX/2)+"'>";
  html += "temps : <span class='temps'>00:00:00</span>"
  html += "</td>";
  html += "</tr>";
  html += "</tbody>";
  html += "<tbody class='game'>";

  for(y=0;y<this.nbY;y++) {
    html += "<tr>";
    for(x=0;x<this.nbX;x++) {
      var idx = y*this.nbX+x;
      html += "<td data-idx='"+idx+"'></td>";
    }

    html += "</tr>";
  }

  html += "</tbody>";

  $(table).html(html);
  $(table).addClass("mine");

  $(document).on("click", ".mine .game td", function() {
    var elt = $(this);
    var idx = parseInt(elt.attr("data-idx"));

    if(that.firstClick) {
      that.initGame(idx);
    }

    if(that.mines[idx]["mine"]) {
      elt.addClass("known");
      elt.addClass("go");
      elt.removeClass("decouvre");
      clearTimeout(that.tId);
      $(document).off("click", ".mine .game td");
      $(document).off("contextmenu", ".mine .game td");
      $(table).trigger("loose");
    }else {
      that.showCase(idx);
      if(that.win(that)) {
        clearTimeout(that.tId);
        $(document).off("click", ".mine .game td");
        $(document).off("contextmenu", ".mine .game td");
        $(table).trigger("win");
      }
    }

    that.firstClick = false;
  });

  $(document).on("contextmenu", ".mine .game td", function(e) {
    e.preventDefault();
    var elt = $(this);
    var idx = parseInt(elt.attr("data-idx"));

    if(that.firstClick) {
      that.initGame(idx);
    }

    if(!elt.hasClass("known")) {
      if(elt.hasClass("decouvre")) {
        elt.removeClass("decouvre");
        that.nbDecouvre++;
      }else {
        elt.addClass("decouvre");
        that.nbDecouvre--;
      }

      $(".mine .indique span.nbMine").html(that.padLeft(that.nbDecouvre));
    }

    that.firstClick = false;
  });
}  


Mine.prototype.incNb = function(idx) {
  if(typeof(this.mines[idx]) != "undefined") {
    if(!this.mines[idx]["mine"]) {
      this.mines[idx]["nb"]++;
    }else {
      this.mines[idx]["nb"] = 0;
    }
  }else {
    this.mines[idx] = {nb: 1, mine: false};
  }
}

Mine.prototype.showCase = function(idx) {
  var elt = $(".mine .game td[data-idx='"+idx+"']");

  if(!elt.hasClass("known")) {
    elt.addClass("known");
    elt.removeClass("decouvre");
    elt.attr("data-nb", this.mines[idx]["nb"]);
    elt.html(this.mines[idx]["nb"]);

    if(this.mines[idx]["nb"] == 0) {
      var y = parseInt(idx / this.nbX, 10);
      var x = idx % this.nbX;
      var y0 = y > 0;
      var y9 = y < this.nbY-1;
      var x0 = x > 0;
      var x9 = x < this.nbX-1;

      if(y0) {
        this.showCase(idx-this.nbX);
        if(x0) this.showCase(idx-this.nbX-1);
        if(x9) this.showCase(idx-this.nbX+1);
      }
      if(y9) {
        this.showCase(idx+this.nbX);
        if(x0) this.showCase(idx+this.nbX-1);
        if(x9) this.showCase(idx+this.nbX+1);
      }
      if(x0) this.showCase(idx-1);
      if(x9) this.showCase(idx+1);
    }
  }
}

Mine.prototype.win = function(that) {
  var result = true;

  $(".mine .game td:not(.known)").each(function(key, value) {
    var idx = $(value).attr("data-idx");
    if(!that.mines[idx]["mine"]) {
      result = false;
      return;
    }
  });

  return result;
}

Mine.prototype.padLeft = function(str) {
  if((""+str).length < 2) {
    str = "0" + str;
  }

  return str;
}

Mine.prototype.initGame = function(clickIdx) {
  var x, y;
  var that = this;

  this.mines = [];
  this.nbDecouvre = 0;

  for(y=0;y<this.nbY;y++) {
    for(x=0;x<this.nbX;x++) {
      var idx = y*this.nbX+x;
      var hasMine = (idx != clickIdx ? Math.random() < 0.1 : false);
      var y0 = y > 0;
      var y9 = y < this.nbY-1;
      var x0 = x > 0;
      var x9 = x < this.nbX-1;

      if(typeof(this.mines[idx]) == "undefined") {
        this.mines[idx] = {nb: 0, mine: hasMine};
      }

      if(hasMine) {
        this.nbDecouvre++;
        this.mines[idx] = {nb: 0, mine: true};

        if(y0) {
          this.incNb(idx-this.nbX);
          if(x0) this.incNb(idx-this.nbX-1);
          if(x9) this.incNb(idx-this.nbX+1);
        }
        if(y9) {
          this.incNb(idx+this.nbX);;
          if(x0) this.incNb(idx+this.nbX-1);
          if(x9) this.incNb(idx+this.nbX+1);
        }
        if(x0) this.incNb(idx-1);
        if(x9) this.incNb(idx+1);
      }
    }
  }
  this.nbMine = this.nbDecouvre;

  $(".mine .indique span.nbMine").html(this.padLeft(this.nbDecouvre));

  this.time = 0;
  this.tId = setTimeout(function () { that.timeOut(); }, 1000);
}

Mine.prototype.timeOut = function() {
  var that = this;
  this.time++;

  var h = parseInt(this.time / 3600, 10);
  var m = parseInt(this.time / 60, 10);
  var s = this.time % 60;
  var display = this.padLeft(h)+":"+this.padLeft(m)+":"+this.padLeft(s);

  $(".mine .indique span.temps").html(display);
  this.tId = setTimeout(function () { that.timeOut(); }, 1000);
}

Mine.prototype.getTime = function() {
  return this.time;
}

Mine.prototype.getNbMine = function() {
  return this.nbMine;
}