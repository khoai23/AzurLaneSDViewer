$(document).ready(function(){
    viewer.init();
  });

var viewer = {
    init: function() {
        viewer.sd = new SD('assets');

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
                    .on("input", function(){
                        viewer.search();
                    })))
            .append($("<div></div>")
                .attr("id","resultContainer")
                .addClass("resultContainer"));
            viewer.loadResults(charData);
        });

        viewer.app = new PIXI.Application(712, 512, { transparent: true });
        viewer.canvas.html(viewer.app.view);

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
    search : function(){
        if ($("#searchField").val() == ""){
            viewer.loadResults(charData);
            return;
        }
        var data = {};
        var r = new RegExp($("#searchField").val().toLowerCase().trim());
        for (var value in charData){
            if (r.test(charData[value].name.toLowerCase())){
                data[value] = charData[value];
            }
        }
        viewer.loadResults(data);
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
                    }
                    $("#skinContainer").children(":first").trigger("click");
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

function check(){
    for (var x in charData) {
        for (var i in charData[x].skin){
            $.ajax({
                url:'../assets/'+charData[x].skin[i]+'.png',
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
