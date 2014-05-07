/**  Agent fuer control **/
var App = angular.module('agent', []);
	
/** Angular service um geklicktes Symbol zwischen Controllern auszutauschen. */
App.service('clickedSymbol', function () {
    var symbol = "1";
    return {
        getSymbol: function () {
            return symbol;
        },
        setSymbol: function(value) {
            symbol = value;
            console.log("setSymbol");
        }
    }
});

var scope;
var lastArticles = new Array();


//all symbols with path
var data = [{ "symbol":"1","path":"src/svg/moeglich.svg#path1", "pos":"-5px", "text":"Verstehe!"},
            { "symbol": "2", "path": "src/svg/notwendig.svg#path2", "pos": "35px", "text": "Bitte Erklären." },
            { "symbol": "3", "path": "src/svg/wahr.svg#path3", "pos": "78px", "text": "Wahr, weiter im Tagebuch..." },
            { "symbol": "4", "path": "src/svg/nicht.svg#path4", "pos": "118px", "text": "Nein, Reise beenden..." },
            { "symbol": "5", "path": "src/svg/kontingent.svg#path5", "pos": "165px", "text": " Vorstellbar!" },
            { "symbol": "6", "path": "src/svg/unendlich.svg#path6", "pos": "210px", "text": "Was der Zufall bringt..." },
            { "symbol": "7", "path": "src/svg/wirklich.svg#path7", "pos": "260px", "text": "Mehr zum Thema." },
            ];


/*****************************
 * 
 * create an app router for url management and redirect
 * 
 *****************************/
App.config(function ($routeProvider, $httpProvider) {
    
    $routeProvider.when('/faden', {
        templateUrl: 'partials/faden.html',
        controller: 'agentController'
    });
    $routeProvider.when('/info', {
        templateUrl: 'partials/info.html',
        //controller: 'startPageController'
    });
    $routeProvider.when('/kontakt', {
        templateUrl: 'partials/kontakt.html',
        //		controller : 'symbols'
    });
    $routeProvider.when('/intro', {
        templateUrl: 'partials/intro.html',
        controller: 'introController',
    });
    $routeProvider.when('/start', {
        templateUrl: 'partials/start.html',
        controller: 'startPageController', 
    });
    $routeProvider.otherwise({
        redirectTo: '/start'
    });
    
});


function startPageController($scope, $http, clickedSymbol) {
    var use = d3.select("#loadingBar").selectAll("use")
        .data(data);

    use.enter().append("use")
    .attr("xlink:href", function (d) { return d.path; })
    .attr("transform", "scale(1.1)")
    .style("opacity", "0");

    var counter = 0;

    var handle = setInterval(function () { loadAnimation() }, 7 / 7 * 2000);




    function loadAnimation() {
        use.style("opacity", "0")
            .transition()
            .duration(100)
            .style("opacity", "1")
            .delay(function (d, i) { return i / 7 * 2000; });

        counter++;
        if (counter >= 3) {
            clearInterval(handle);
            setTimeout(finalAnimation(), 2000);
            makeLinks();
        }
    }

    function finalAnimation() {
        use.style("opacity", "1")
           .attr("x", "0px")
           .transition()
           .duration(1000)
           .attr("x", function (d, i) { return i / 7 * 450; });

        //d3.select("#loadingBar")
        //    .style("margin-left", "15%")
        //    .transition()
        //    .duration(1000)
        //    .style("margin-left", "40%");
    }

    function makeLinks() {
        use.attr("cursor", "pointer")
       .on("mouseover", function () { d3.select(this).style("opacity", "0.5"); })
       .on("mouseout", function () { d3.select(this).style("opacity", "1"); })
       .on("click", function (d) { clickedSymbol.setSymbol(d.symbol) });
    }

};

function introController($scope, $http, clickedSymbol) {
    var use = d3.select("#loadingBar").selectAll("use")
        .data(data);

    use.enter().append("use")
    .attr("xlink:href", function (d) { return d.path; })
    .attr("transform", "scale(2)")
    .style("opacity", "0");

    var counter = 0;

    var handle = setInterval(function () { loadAnimation() }, 7 / 7 * 2000);




    function loadAnimation() {
        use.style("opacity", "0")
            .transition()
            .duration(100)
            .style("opacity", "1")
            .delay(function (d, i) { return i / 7 * 2000; });

        counter++;
        if (counter >= 3) {
            clearInterval(handle);
            setTimeout(finalAnimation(), 2000);
            makeLinks();
        }
    }
        
    function finalAnimation() {
        use.style("opacity", "1")
           .attr("x", "0px")
           .transition()
           .duration(1000)
           .attr("x", function (d, i) { return i / 7 * 450; });

        //d3.select("#loadingBar")
        //    .style("margin-left", "15%")
        //    .transition()
        //    .duration(1000)
        //    .style("margin-left", "40%");
    }

    function makeLinks() {
        use.attr("cursor", "pointer")
       .on("mouseover", function () { d3.select(this).style("opacity", "0.5"); })
       .on("mouseout", function () { d3.select(this).style("opacity", "1"); })
       .on("click", function (d) { clickedSymbol.setSymbol(d.symbol) });
    }


};


function agentController($scope, $http, clickedSymbol) {

    $http.get("/agent.php" + "?action=getthumbnails")
    .success(function (pics) {
        fillScene(pics);

        $http.get("/agent.php" + "?symbol=" + clickedSymbol.getSymbol() + "&lastArticles=[]")
           .success(function (article) {

               console.log("zwetier aufruf");
               console.log(article);
               lastArticles = article.lastArticles;
               updateControl(article.symbols);
               if (clickedSymbol.getSymbol() != 4) {
                   moveToArticle(article.id, 0);
                   updateGraph(article.book);
               } else {
                   moveToEndVideo();
               }
               //updateGraph(article.book);
               //updateSceneParameters(article);
               //startScene();
           })
           .error(function (err) {
               console.error(err);
           });
    })
    .error(function (err) {
     console.error(err);
    });
    
        
    


    function symbolOnClick() {
        $http.get("/agent.php" + "?symbol=" + clickedSymbol.getSymbol() + "&lastarticles=[" + lastArticles + "]")
            .success(function (article) {
                //console.log("lastArticles " + lastArticles);
                //console.log("article lastArticles " + article.lastArticles);
                //console.log(article.book);
                lastArticles = article.lastArticles;
                updateControl(article.symbols);
                if (clickedSymbol.getSymbol() != 4) {
                    moveToArticle(article.id, 0);
                    updateGraph(article.book);
                } else {
                    moveToEndVideo();
                }
                //updateSceneParameters(article);
                //displayNewScene();
                
            })
            .error(function(err){
                console.error(err);
            });
        };
    

    /** Helper function, update the control with new symbols */
    function updateControl(symbols) {
        //durch gesamtes json objekt laufen und für jede übereinstimmung mit symbols link in neues array(zwecks d3 databinding)
        var links = new Array();
        if (symbols) {
            for (var i = 0; i < symbols.length; i++) {
                for (var j = 0; j < data.length; j++) {
                    if (symbols[i].id == data[j].symbol) {
                        links.push(data[j]);
                    }
                }
            }
        }

        //update symbols
        var use = d3.select("#controlSVG").selectAll("use")
            .data(links, function (d) { return links.indexOf(d); });

        use.enter().append("use")
            .attr("xlink:href", function (d) { return d.path; })
            .attr("x", function (d) { return d.pos; }); 

        use.exit().remove();

        use.attr("cursor", "pointer")
        .on("mouseover", function (d) { d3.select(this).style("opacity", "0.5"); showToolTipp(d.symbol);})
        .on("mouseout", function (d) { d3.select(this).style("opacity", "1"); hideToolTipp(d.symbol);})
        .on("click", function (d) { clickedSymbol.setSymbol(d.symbol); symbolOnClick(); });


        //toolTipp
        var text = d3.select("#control").selectAll("div")
            .data(links, function (d) { return links.indexOf(d); });

        text.enter().append("div")
                .text(function (d) { return d.text; })
                .attr("class", "toolText")
                .attr("id", function (d) { return "text" + d.symbol; })
                .style("left", function (d) { return d.pos; });

        text.exit().remove();

        function hideToolTipp(id) {
            d3.select("#text" + id).style("visibility", "hidden");
        }

        function showToolTipp(id) {
            d3.select("#text" + id).style("visibility", "visible");
        }



        
    }
};

    /** directive tag <agent-control>, ermoeglicht Verknuepfung angular und d3 **/
App.directive('agentControl', function (clickedSymbol) {
    return {
        restrict: 'E',
        scope: { onClick: '&' },
        link: function (scope, element, attrs) {

            //directive scope global setzen fuer link setzen beim update der symbols
            this.scope = scope;

            var graphDiv, controlDiv;
            var footer;

            console.log("directive?");

            footer = d3.select(element[0])
            .append("div")
            .attr("id", "footer");


            graphDiv = footer.append("div")
                .attr("id", "graph")
                .attr("class", "aGraph");

            controlDiv = footer.append("div")
                .attr("id", "control");

            controlDiv.append("svg")
                .attr("id", "controlSVG");

            initPersonalGraph($("#graph").width(), $("#graph").height());


            
        }
    }

});
