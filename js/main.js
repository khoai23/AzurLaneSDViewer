$(document).ready(function(){
    viewer.init();
  });

var viewer = {
    init: function() {
        viewer.sd = new SD('assets');
        viewer.searchResults = charData;
        viewer.mouse = false;
        viewer.lastMouseX = 0;
        viewer.lastMouseY = 0;

        viewer.canvas = $(".Canvas");
        viewer.selectAnimation = $(".selectAnimation");
        viewer.selectShip = $(".selectShip");

        viewer.selectAnimation.change(function() {
            viewer.changeAnimation(this.selectedIndex);
        });
        viewer.selectShip.click(function(){
            $(document.body).append($("<div></div>")
                .attr("id","darken")
                .addClass("darken")
                .css("top", window.pageYOffset + "px")
                .click(function(){
                    $('#selector').remove();
                    $('#darken').remove();
                    $(document.body).css("overflow", "auto");
                    viewer.searchResults = charData;
                }))
            .append($("<div></div>")
                .attr("id","selector")
                .addClass("selector")
                .css("top", (window.pageYOffset + (window.innerHeight * 0.05)) + "px"))
            .css("overflow", "hidden");
            $("#selector").append($("<div></div>")
                .attr("id","searchContainer")
                .addClass("searchContainer")
                .css({"padding" : "15px"})
                .append($("<input>")
                    .attr("id","searchField")
                    .addClass("form-control")
                    .css({"background-color": "#24252d", "color": "#ffffff", "display" : "inline-block"})
                    .on("keyup", function(){
                        var key = event.keyCode || event.charCode;
                        viewer.search(null, null, key);
                    })))
            .append($("<div></div>")
                .attr("id","resultContainer")
                .addClass("resultContainer"));
            viewer.loadFilter("type", "#searchType", "#ecd2fc");
            viewer.loadFilter("group", "#searchGroup", "#ccccff");
            viewer.loadResults(viewer.searchResults);
        });

        viewer.app = new PIXI.Application(712, 512, { transparent: true });
        viewer.canvas.html(viewer.app.view);
        viewer.canvas.mousedown(() => {
            viewer.mouse = true;
            viewer.lastMouseX = event.clientX - event.target.getBoundingClientRect().left;
            viewer.lastMouseY = event.clientY - event.target.getBoundingClientRect().top;
        });
        viewer.canvas.mouseup(() => {viewer.mouse = false});
        viewer.canvas.mousemove((event) => {
            var sx = event.clientX - event.target.getBoundingClientRect().left;
            var sy = event.clientY - event.target.getBoundingClientRect().top;
            if(viewer.mouse){
                viewer.spine.position.set((sx - viewer.lastMouseX) + viewer.spine.position._x, (sy - viewer.lastMouseY) + viewer.spine.position._y);

                viewer.lastMouseX = sx;
                viewer.lastMouseY = sy;
            }
        });

        window.onresize = (event) => {
            if (event === void 0) { event = null; }
            if (document.getElementById("darken") != null){
                document.getElementById("darken").top = window.pageYOffset + "px";
                document.getElementById("selector").top = (window.pageYOffset + (window.innerHeight * 0.05)) + "px";
            }
        };
    },
    changeCanvas : function(skeletonData) {
        viewer.app.stage.removeChildren();

        viewer.spine = new PIXI.spine.Spine(skeletonData);
        var animations = viewer.spine.spineData.animations;
        var stringAnimations = "";
        for(var i = 0; i < animations.length; i++) {
            stringAnimations += "<option value=\"" + animations[i].name + "\">" + animations[i].name + "</option>";
        }
        viewer.selectAnimation.html(stringAnimations);
        viewer.changeAnimation(0);
        viewer.app.stage.addChild(viewer.spine);
        viewer.spine.position.set(viewer.app.view.width * 0.5 , viewer.app.view.height * 0.8);
    },
    changeAnimation : function(num) {
        var name = viewer.spine.spineData.animations[num].name;
        viewer.spine.state.setAnimation(0, name, true);
    },
    search : function(filter, filterType, key){
        if (filter != null && filterType != null){
            var temp = {};
            for (var value in viewer.searchResults){
                if (viewer.searchResults[value][filterType] == filter)
                    temp[value] = viewer.searchResults[value];                
            }
            viewer.searchResults = temp;
        }
        if (key != null){
            if (key == 8 || key == 46)
                viewer.searchResults = charData;
        }
        var data = {};
        var r = new RegExp($("#searchField").val().toLowerCase().trim());
        for (var value in viewer.searchResults){
            if (r.test(viewer.searchResults[value].name.toLowerCase()))
                data[value] = viewer.searchResults[value];
        }
        viewer.searchResults = data;
        viewer.loadFilter("type", "#searchType", "#ecd2fc");
        viewer.loadFilter("group", "#searchGroup", "#ccccff");
        viewer.loadResults(viewer.searchResults);
    },
    loadResults : function(data){
        $("#resultContainer").empty();
        for (var value in data){
            $("#resultContainer").append($("<div></div>")
                .addClass("shipIcon")
                .attr("id",value)
                .css("background", "url(../assets/qicon/"+data[value].skin[0]+".png)")
                .css("background-size", "70px 70px")
                .mouseover(function(){
                    $(this).css("background-size", "105%");
                })
                .mouseout(function(){
                    $(this).css("background-size", "100%");
                })
                .click(function(){
                    $("#skinContainer").empty();
                    for (var x in data[$(this).attr("id")].skin){
                        $("#skinContainer").append($("<div></div>")
                            .addClass("shipIcon")
                            .attr("id",data[$(this).attr("id")].skin[x])
                            .css("background", "url(../assets/qicon/"+data[$(this).attr("id")].skin[x]+".png)")
                            .css("background-size", "70px 70px")
                            .click(function(){
                                viewer.sd.load($(this).attr("id"), viewer);        
                                var self = this;
                                $("#skinContainer").children("div").each(function(){
                                    if ($(this).attr("id") == $(self).attr("id"))
                                        $(this).css({"height":"90px","width":"90px","background-size":"100%"});
                                    else
                                        $(this).css({"height":"70px","width":"70px","background-size":"100%"});
                                });
                            }));                                                       
                        $('#selector').remove();
                        $('#darken').remove();
                        $(document.body).css("overflow", "auto");
                        viewer.searchResults = charData;
                    }
                    $("#skinContainer").children(":first").trigger("click");
                }));
        }
    },
    loadFilter : function (filterType, container, color){
        if ($(container).length == 0){
            $("#searchContainer").append($("<div></div>")
                .attr("id",container.substring(1))
                .css({"width" : "100%", "margin-top" : "15px"}));
        }
        $(container).empty();
        var words = [];
        for (var i in viewer.searchResults){
            words.push(viewer.searchResults[i][filterType]);
        }
        var distinct = [];
        $.each(words, function(i, val){
            if ($.inArray(val, distinct) === -1) distinct.push(val);
        });
        for (var j in distinct){
            $(container).append($("<div>"+distinct[j]+"</div>")
                .addClass("btnGenericText")
                .css({"display" : "inline-block", "margin" : "0px 0px 5px 10px", "color" : color})
                .click(function(){
                    viewer.search($(this).html(), filterType);
                }));
        }
    }
};

function onSelectBG(){
    var div = document.createElement('div');
    div.className = "darken";
    div.id = "darken";
    div.style.top = window.pageYOffset + "px";
    div.addEventListener("click", function(e) {
            document.body.removeChild(document.getElementById("selector"));
            document.body.removeChild(document.getElementById("darken"));
            document.body.style.overflow = "auto";
        }, false);
    document.body.appendChild(div);
    document.body.style.overflow = "hidden";
    var selector = document.createElement('div');
    selector.id = "selector";
    selector.className = "selector";
    selector.style.top = (window.pageYOffset + (window.innerHeight * 0.05)) + "px" ;
    document.body.appendChild(selector);
    for (var i = 0; i < backgroundData.length; i++){
        var img = document.createElement('div');
        img.className = "thumbbutton";
        img.style.backgroundImage = "url(../assets/bg/"+backgroundData[i]+")";
        img.style.backgroundSize = "500px auto";
        img.style.backgroundPosition = "50% 50%";
        img.id = backgroundData[i];
        img.addEventListener("click", function(e) {
            document.getElementById("SdCanvas").style.backgroundImage = "url(../assets/bg/"+this.id+")";
            document.body.removeChild(document.getElementById("selector"));
            document.body.removeChild(document.getElementById("darken"));
            document.body.style.overflow = "auto";
        }, false);
        document.getElementById("selector").appendChild(img);
    }
}

function check(a, b){
    for (var x in charData) {
        for (var i in charData[x].skin){
            $.ajax({
                url:'../'+a+charData[x].skin[i]+b,
                type:'HEAD',
                error: function()
                {
                    console.log(charData[x].skin[i]);
                },
                success: function()
                {
                    //file exists
                }
            });
        }
    }
}
