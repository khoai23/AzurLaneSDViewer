$(document).ready(function(){
    viewer.init();
  });

var viewer = {
    init: function() {
        viewer.sd = new SD('assets');

        viewer.canvas = $(".Canvas");
        viewer.selectCharacter = $(".selectCharacter");
        viewer.selectAnimation = $(".selectAnimation");

        var stringCharacter = "<option>Select</option>";
        for (var value in charData) {
            stringCharacter+= '<option value="' + charData[value] + '">' + value + '</option>';
        }
        viewer.selectCharacter.html(stringCharacter);
        viewer.selectCharacter.change(function() {
            if(this.selectedIndex == 0)
                return;
            var name = $(this).val();
            viewer.sd.load(name, viewer);
        });
        viewer.selectAnimation.change(function() {
            viewer.changeAnimation(this.selectedIndex);
        });

        viewer.app = new PIXI.Application(712, 512, { transparent: true });
        viewer.canvas.html(viewer.app.view);

        window.onresize = (event) => {
            if (event === void 0) { event = null; }
            document.getElementById("darken").top = window.pageYOffset + "px";
            document.getElementById("selector").top = (window.pageYOffset + (window.innerHeight * 0.05)) + "px";
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
    }
};

function onSelectBG(){
    var div = document.createElement('div');
    div.className = "darken";
    div.id = "darken";
    div.style.top = window.pageYOffset + "px";
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
